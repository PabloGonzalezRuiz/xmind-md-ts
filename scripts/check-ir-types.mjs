import { readFile, writeFile, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import process from "node:process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const schemaPath = path.join(root, "spec/ir-v1.schema.json");
const tempPath = path.join(root, ".ir-schema-typecheck.ts");

const typeMap = {
  id: "EntityId",
  sourcePosition: "SourcePosition",
  document: "IrDocumentMetadata",
  sheet: "Sheet",
  topic: "Topic",
  contentBlock: "ContentBlock",
  paragraph: "ParagraphBlock",
  textRun: "TextRun",
  list: "ListBlock",
  listItem: "ListItem",
  table: "TableBlock",
  tableRow: "TableRow",
  tableCell: "TableCell",
  code: "CodeBlock",
  quote: "QuoteBlock",
  imageBlock: "ImageBlock",
  thematicBreak: "ThematicBreakBlock",
  relationship: "Relationship",
  boundary: "Boundary",
  summary: "Summary",
  styleReference: "StyleReference",
  styleSet: "StyleSet",
  asset: "Asset",
  extensions: "Extensions",
  jsonValue: "JsonValue",
};

const allowedKeywords = new Set([
  "$schema", "$id", "$defs", "$ref", "title", "description", "default",
  "type", "const", "enum", "anyOf", "oneOf", "properties", "required",
  "additionalProperties", "items", "propertyNames", "minLength", "maxLength",
  "pattern", "format", "minimum", "maximum", "minItems", "maxItems",
  "uniqueItems",
]);

function assertSupportedKeywords(schema, location = "$") {
  if (!schema || typeof schema !== "object" || Array.isArray(schema)) return;
  for (const key of Object.keys(schema)) {
    if (!allowedKeywords.has(key)) {
      throw new Error('Unsupported JSON Schema keyword "' + key + '" at ' + location + "; extend the type projection deliberately.");
    }
  }
  if (schema.properties) {
    for (const [key, value] of Object.entries(schema.properties)) {
      assertSupportedKeywords(value, location + "/properties/" + key);
    }
  }
  if (schema.$defs) {
    for (const [key, value] of Object.entries(schema.$defs)) {
      assertSupportedKeywords(value, location + "/$defs/" + key);
    }
  }
  if (schema.items && typeof schema.items === "object") {
    assertSupportedKeywords(schema.items, location + "/items");
  }
  if (schema.additionalProperties && typeof schema.additionalProperties === "object") {
    assertSupportedKeywords(schema.additionalProperties, location + "/additionalProperties");
  }
  for (const keyword of ["anyOf", "oneOf"]) {
    for (const [index, value] of (schema[keyword] ?? []).entries()) {
      assertSupportedKeywords(value, location + "/" + keyword + "/" + index);
    }
  }
}

function toType(schema) {
  if (schema.$ref) {
    const match = schema.$ref.match(/^#\/\$defs\/([^/]+)$/);
    if (!match || !typeMap[match[1]]) {
      throw new Error("Unsupported or unmapped schema reference: " + schema.$ref);
    }
    return "Schema_" + match[1];
  }
  if (Object.hasOwn(schema, "const")) return JSON.stringify(schema.const);
  if (schema.enum) return schema.enum.map(JSON.stringify).join(" | ");
  if (schema.anyOf || schema.oneOf) {
    const branches = schema.anyOf ?? schema.oneOf;
    return branches.map(toType).join(" | ");
  }
  if (Array.isArray(schema.type)) {
    return schema.type.map((type) => toType({ type })).join(" | ");
  }

  switch (schema.type) {
    case "string": return "string";
    case "number":
    case "integer": return "number";
    case "boolean": return "boolean";
    case "null": return "null";
    case "array":
      if (!schema.items) throw new Error("Array schema without items is not supported.");
      return "Array<" + toType(schema.items) + ">";
    case "object": {
      const properties = Object.entries(schema.properties ?? {});
      const required = new Set(schema.required ?? []);
      const additional = schema.additionalProperties;
      if (properties.length === 0) {
        if (additional === false) return "Record<string, never>";
        if (additional === true || additional === undefined) return "Record<string, unknown>";
        return "Record<string, " + toType(additional) + ">";
      }
      if (additional && additional !== false) {
        throw new Error("Mixed named properties and additionalProperties need an explicit projection rule.");
      }
      const members = properties.map(([name, value]) =>
        "  " + JSON.stringify(name) + (required.has(name) ? "" : "?") + ": " + toType(value) + ";",
      );
      return "{\n" + members.join("\n") + "\n}";
    }
    default:
      throw new Error("Unsupported or missing schema type: " + JSON.stringify(schema));
  }
}

const schema = JSON.parse(await readFile(schemaPath, "utf8"));
assertSupportedKeywords(schema);
const definitions = schema.$defs ?? {};
const schemaNames = Object.keys(definitions).sort();
const mappedNames = Object.keys(typeMap).sort();
if (JSON.stringify(schemaNames) !== JSON.stringify(mappedNames)) {
  throw new Error(
    "Schema $defs and TypeScript mapping differ. Schema: " + schemaNames.join(", ") +
    ". Mapping: " + mappedNames.join(", ") + ".",
  );
}

const generated = Object.entries(definitions)
  .map(([name, definition]) => "type Schema_" + name + " = " + toType(definition) + ";")
  .join("\n\n");
const rootType = toType(schema);
const checks = [
  ...Object.entries(typeMap).map(([definition, publicName]) =>
    "type Check_" + publicName + " = Assert<Equal<Existing." + publicName + ", Schema_" + definition + ">>;",
  ),
  "type Check_IrDocument = Assert<Equal<Existing.IrDocument, " + rootType + ">>;",
].join("\n");

const source = [
  'import type * as Existing from "./spec/ir-v1.types.js";',
  "type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;",
  "type Assert<T extends true> = T;",
  generated,
  checks,
  "",
].join("\n");

try {
  await writeFile(tempPath, source, "utf8");
  const tsc = path.join(root, "node_modules/typescript/bin/tsc");
  const result = spawnSync(process.execPath, [
    tsc, "--noEmit", "--strict", "--skipLibCheck", "--target", "ES2022",
    "--module", "NodeNext", "--moduleResolution", "NodeNext", tempPath,
  ], { cwd: root, encoding: "utf8" });
  if (result.status !== 0) {
    process.stderr.write(result.stdout ?? "");
    process.stderr.write(result.stderr ?? "");
    process.exitCode = result.status ?? 1;
  } else {
    process.stdout.write("IR JSON Schema and public TypeScript types are structurally equivalent.\n");
    process.stdout.write("Checked root IR and " + Object.keys(typeMap).length + " schema definitions.\n");
  }
} finally {
  await rm(tempPath, { force: true });
}
