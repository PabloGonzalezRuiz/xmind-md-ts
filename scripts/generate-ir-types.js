import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath, URL } from "node:url";
import process from "node:process";
import console from "node:console";
import prettier from "prettier";

const root = resolve(fileURLToPath(new URL("../", import.meta.url)));
const schemaPath = resolve(root, "spec/ir-v1.schema.json");
const outputPath = resolve(root, "spec/ir-v1.types.ts");
const schema = JSON.parse(await readFile(schemaPath, "utf8"));

if (schema.$schema !== "https://json-schema.org/draft/2020-12/schema") {
  throw new Error("El generador solo admite JSON Schema Draft 2020-12.");
}

const names = {
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

const ignoredKeywords = new Set([
  "$schema", "$id", "$defs", "title", "description", "default",
  "minLength", "maxLength", "pattern", "minimum", "maximum",
  "exclusiveMinimum", "exclusiveMaximum", "multipleOf", "minItems",
  "maxItems", "uniqueItems", "format", "propertyNames",
]);

function assertSupported(node, path = "$") {
  if (node === true || node === false) {
    throw new Error(`Boolean schema no admitido en ${path}.`);
  }
  if (Array.isArray(node)) return;
  if (!node || typeof node !== "object") throw new Error(`Schema inválido en ${path}.`);
  const supported = new Set([
    ...ignoredKeywords, "$ref", "type", "const", "enum", "oneOf", "anyOf",
    "properties", "required", "additionalProperties", "items",
  ]);
  for (const key of Object.keys(node)) {
    if (!supported.has(key)) throw new Error(`Keyword JSON Schema no soportada: ${path}/${key}`);
  }
  if (node.$ref && !/^#\/\$defs\/[A-Za-z0-9_-]+$/.test(node.$ref)) {
    throw new Error(`Referencia no local o no admitida en ${path}: ${node.$ref}`);
  }
  for (const [key, value] of Object.entries(node.properties ?? {})) {
    assertSupported(value, `${path}/properties/${key}`);
  }
  for (const key of ["items", "additionalProperties"]) {
    if (node[key] && typeof node[key] === "object") assertSupported(node[key], `${path}/${key}`);
  }
  for (const key of ["oneOf", "anyOf"]) {
    for (const [index, value] of (node[key] ?? []).entries()) {
      assertSupported(value, `${path}/${key}/${index}`);
    }
  }
  for (const [key, value] of Object.entries(node.$defs ?? {})) {
    assertSupported(value, `${path}/$defs/${key}`);
  }
}

assertSupported(schema);

function refName(ref) {
  const key = ref.slice("#/$defs/".length);
  const name = names[key];
  if (!name) throw new Error(`No existe nombre TypeScript para $defs/${key}.`);
  return name;
}

function typeOf(node) {
  if (node.$ref) return refName(node.$ref);
  if (Object.hasOwn(node, "const")) return JSON.stringify(node.const);
  if (node.enum) return node.enum.map((value) => JSON.stringify(value)).join(" | ");
  if (node.oneOf || node.anyOf) {
    return (node.oneOf ?? node.anyOf).map(typeOf).map((type) => `(${type})`).join(" | ");
  }
  if (Array.isArray(node.type)) {
    return node.type.map((type) => primitiveType(type)).join(" | ");
  }
  if (node.type === "array") return `(${typeOf(node.items)})[]`;
  if (node.type === "object") {
    if (!node.properties) {
      if (node.additionalProperties === false) return "{ [key: string]: never }";
      if (node.additionalProperties === true || node.additionalProperties === undefined) {
        return "{ [key: string]: unknown }";
      }
      return `{ [key: string]: ${typeOf(node.additionalProperties)} }`;
    }
    return objectBody(node, "  ");
  }
  return primitiveType(node.type);
}

function primitiveType(type) {
  const types = {
    string: "string",
    number: "number",
    integer: "number",
    boolean: "boolean",
    null: "null",
  };
  if (!types[type]) throw new Error(`Tipo JSON Schema no soportado: ${type}`);
  return types[type];
}

function objectBody(node, indent) {
  const required = new Set(node.required ?? []);
  const lines = [];
  for (const [key, value] of Object.entries(node.properties ?? {})) {
    lines.push(`${indent}${JSON.stringify(key)}${required.has(key) ? "" : "?"}: ${typeOf(value)};`);
  }
  if (node.additionalProperties && node.additionalProperties !== false) {
    const valueType = node.additionalProperties === true ? "unknown" : typeOf(node.additionalProperties);
    lines.push(`${indent}[key: string]: ${valueType};`);
  }
  return lines.length ? `{\n${lines.join("\n")}\n${indent.slice(0, -2)}}` : "{}";
}

function declaration(name, node) {
  if (node.type === "object" && node.properties) {
    return `export interface ${name} ${objectBody(node, "  ")}`;
  }
  return `export type ${name} = ${typeOf(node)};`;
}

const definitions = Object.entries(schema.$defs).map(([key, node]) => {
  const name = names[key];
  if (!name) throw new Error(`Falta asignar nombre TypeScript a $defs/${key}.`);
  return declaration(name, node);
});
const generated = [
  "/**",
  " * Tipos generados desde spec/ir-v1.schema.json.",
  " * No editar manualmente: ejecutar npm run generate:types.",
  " * Las restricciones no representables en TypeScript se aplican en runtime con Ajv.",
  " */",
  ...definitions,
  declaration("IrDocument", schema),
  "",
].join("\n");
const formatted = await prettier.format(generated, { filepath: outputPath });
const check = process.argv.includes("--check");

if (check) {
  const current = await readFile(outputPath, "utf8");
  const normalize = (value) => `${value.replace(/\r\n/g, "\n").trimEnd()}\n`;
  const normalizedCurrent = normalize(current);
  const normalizedFormatted = normalize(formatted);
  if (normalizedCurrent !== normalizedFormatted) {
    let index = 0;
    while (index < normalizedCurrent.length && normalizedCurrent[index] === normalizedFormatted[index]) index += 1;
    console.error("spec/ir-v1.types.ts no está actualizado. Ejecuta npm run generate:types.");
    console.error("Diferencia en índice:", index);
    console.error("Longitudes:", normalizedCurrent.length, normalizedFormatted.length);
    console.error("Actual:", JSON.stringify(normalizedCurrent.slice(index, index + 80)));
    console.error("Generado:", JSON.stringify(normalizedFormatted.slice(index, index + 80)));
    process.exitCode = 1;
  }
} else {
  await writeFile(outputPath, formatted, "utf8");
  console.log("Tipos TypeScript generados desde spec/ir-v1.schema.json.");
}
