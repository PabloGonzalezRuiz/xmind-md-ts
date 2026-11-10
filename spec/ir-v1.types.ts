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
