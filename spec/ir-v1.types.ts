/**
 * Tipos generados desde spec/ir-v1.schema.json.
 * No editar manualmente: ejecutar npm run generate:types.
 * Las restricciones no representables en TypeScript se aplican en runtime con Ajv.
 */
export type EntityId = string;
export interface SourcePosition {
  file?: string;
  startLine?: number;
  startColumn?: number;
  endLine?: number;
  endColumn?: number;
}
export interface IrDocumentMetadata {
  id: EntityId;
  title?: string;
  source?: string;
  metadata?: { [key: string]: JsonValue };
}
export interface Sheet {
  id: EntityId;
  title: string;
  rootTopic: Topic;
  settings?: { [key: string]: JsonValue };
  relationships: Relationship[];
  boundaries: Boundary[];
  summaries: Summary[];
  defaultStyleSetId?: EntityId;
}
export interface Topic {
  id: EntityId;
  title: string;
  role?: string;
  children: Topic[];
  content: ContentBlock[];
  notes?: ContentBlock[];
  labels?: string[];
  markers?: string[];
  hyperlink?: string;
  style?: StyleReference;
  sourcePosition?: SourcePosition;
  extensions?: Extensions;
}
export type ContentBlock =
  | ParagraphBlock
  | ListBlock
  | TableBlock
  | CodeBlock
  | QuoteBlock
  | ImageBlock
  | ThematicBreakBlock;
export interface ParagraphBlock {
  type: 'paragraph';
  runs: TextRun[];
  sourcePosition?: SourcePosition;
}
export interface TextRun {
  text: string;
  marks?: ('strong' | 'emphasis' | 'strike' | 'inlineCode')[];
  link?: string;
  style?: { [key: string]: JsonValue };
}
export interface ListBlock {
  type: 'list';
  ordered: boolean;
  start?: number;
  items: ListItem[];
  sourcePosition?: SourcePosition;
}
export interface ListItem {
  blocks: ContentBlock[];
}
export interface TableBlock {
  type: 'table';
  alignments?: ('left' | 'center' | 'right' | null)[];
  rows: TableRow[];
  sourcePosition?: SourcePosition;
}
export interface TableRow {
  cells: TableCell[];
}
export interface TableCell {
  blocks: ContentBlock[];
}
export interface CodeBlock {
  type: 'code';
  language?: string;
  value: string;
  sourcePosition?: SourcePosition;
}
export interface QuoteBlock {
  type: 'quote';
  blocks: ContentBlock[];
  sourcePosition?: SourcePosition;
}
export interface ImageBlock {
  type: 'image';
  assetId: EntityId;
  alt: string;
  title?: string;
  sourcePosition?: SourcePosition;
}
export interface ThematicBreakBlock {
  type: 'thematicBreak';
  sourcePosition?: SourcePosition;
}
export interface Relationship {
  id: EntityId;
  sourceTopicId: EntityId;
  targetTopicId: EntityId;
  label?: string;
  kind?: string;
  style?: StyleReference;
  extensions?: Extensions;
  sourcePosition?: SourcePosition;
}
export interface Boundary {
  id: EntityId;
  topicIds: EntityId[];
  label?: string;
  style?: StyleReference;
  extensions?: Extensions;
}
export interface Summary {
  id: EntityId;
  topicIds: EntityId[];
  label?: string;
  style?: StyleReference;
  extensions?: Extensions;
}
export interface StyleReference {
  setId?: EntityId;
  role?: string;
  styleId?: EntityId;
  overrides?: { [key: string]: JsonValue };
}
export interface StyleSet {
  id: EntityId;
  extends?: EntityId;
  defaults?: { [key: string]: JsonValue };
  roles?: { [key: string]: { [key: string]: JsonValue } };
  styles?: { [key: string]: { [key: string]: JsonValue } };
}
export interface Asset {
  id: EntityId;
  uri: string;
  mediaType?: string;
  alt?: string;
  title?: string;
}
export type Extensions = { [key: string]: { [key: string]: JsonValue } };
export type JsonValue =
  (string | number | boolean | null) | JsonValue[] | { [key: string]: JsonValue };
export interface IrDocument {
  irVersion: '1.0.0';
  document: IrDocumentMetadata;
  sheet: Sheet;
  assets: Asset[];
  styleSets: StyleSet[];
  extensions?: Extensions;
}
##[group]Run npm run format:check
[36;1mnpm run format:check[0m
shell: /usr/bin/bash -e {0}
##[endgroup]

> xmind-md-ts@0.1.0 format:check
> prettier --check "src/**/*.ts" "test/**/*.ts" "scripts/**/*.js" "spec/**/*.ts" "vitest.config.ts" "eslint.config.js" "package.json" "tsconfig*.json" ".prettierrc.json" ".github/workflows/*.yml"

Checking formatting...
All matched files use Prettier code style!
##[group]Run npm run lint
[36;1mnpm run lint[0m
shell: /usr/bin/bash -e {0}
##[endgroup]

> xmind-md-ts@0.1.0 lint
> eslint .

##[group]Run npm run check:generated-types
[36;1mnpm run check:generated-types[0m
shell: /usr/bin/bash -e {0}
##[endgroup]

> xmind-md-ts@0.1.0 check:generated-types
> node scripts/generate-ir-types.js --check

##[group]Run npm run typecheck
[36;1mnpm run typecheck[0m
shell: /usr/bin/bash -e {0}
##[endgroup]

> xmind-md-ts@0.1.0 typecheck
> tsc --noEmit -p tsconfig.json

##[group]Run npm test
[36;1mnpm test[0m
shell: /usr/bin/bash -e {0}
##[endgroup]

> xmind-md-ts@0.1.0 test
> vitest run


[1m[30m[46m RUN [49m[39m[22m [36mv5.0.5 [39m[90m/home/runner/work/xmind-md-ts/xmind-md-ts[39m

 [32m✓[39m test/style-engine.test.ts [2m([22m[2m24 tests[22m[2m)[22m[32m 34[2mms[22m[39m
 [32m✓[39m test/semantic-validator.test.ts [2m([22m[2m18 tests[22m[2m)[22m[32m 25[2mms[22m[39m
 [32m✓[39m test/markdown-parser.test.ts [2m([22m[2m11 tests[22m[2m)[22m[32m 56[2mms[22m[39m
 [32m✓[39m test/schema-validator.test.ts [2m([22m[2m22 tests[22m[2m)[22m[32m 23[2mms[22m[39m
 [32m✓[39m test/complete-validator.test.ts [2m([22m[2m3 tests[22m[2m)[22m[32m 13[2mms[22m[39m
 [32m✓[39m test/project.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 2[2mms[22m[39m

[2m Test Files [22m [1m[32m6 passed[39m[22m[90m (6)[39m
[2m      Tests [22m [1m[32m79 passed[39m[22m[90m (79)[39m
[2m   Start at [22m 15:34:01
[2m   Duration [22m 811ms[2m (import 73%, transform 16%, tests 10%, worker 1%)[22m

##[group]Run npm run build
[36;1mnpm run build[0m
shell: /usr/bin/bash -e {0}
##[endgroup]

> xmind-md-ts@0.1.0 build
> tsc -p tsconfig.build.json

Post job cleanup.
Cache hit occurred on the primary key node-cache-Linux-x64-npm-a4de6553c43e129e19a44cb5cc14a9ef8614e73825cd28b1d87e03f9b4150e81, not saving cache.
Post job cleanup.
[command]/usr/bin/git version
git version 2.56.0
Temporarily overriding HOME='/home/runner/work/_temp/8ad4fbcb-2826-4ca4-8470-1339ac74d4aa' before making global git config changes
Adding repository directory to the temporary git global config as a safe directory
[command]/usr/bin/git config --global --add safe.directory /home/runner/work/xmind-md-ts/xmind-md-ts
[command]/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
[command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
[command]/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
http.https://github.com/.extraheader
[command]/usr/bin/git config --local --unset-all http.https://github.com/.extraheader
[command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
[command]/usr/bin/git config --local --name-only --get-regexp ^includeIf\.gitdir:
[command]/usr/bin/git submodule foreach --recursive git config --local --show-origin --name-only --get-regexp remote.origin.url
Cleaning up orphan processes
