import { basename, extname } from 'node:path';
import { unified } from 'unified';
import remarkDirective from 'remark-directive';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { parse as parseYaml } from 'yaml';

import type {
  Asset,
  ContentBlock,
  IrDocument,
  JsonValue,
  ListBlock,
  ListItem,
  StyleReference,
  TableBlock,
  TextRun,
  Topic,
} from '../../spec/ir-v1.types.js';

interface AstNode {
  type: string;
  value?: string;
  depth?: number;
  ordered?: boolean;
  start?: number | null;
  lang?: string | null;
  url?: string;
  alt?: string | null;
  title?: string | null;
  align?: Array<'left' | 'center' | 'right' | null>;
  name?: string;
  attributes?: Record<string, string | null>;
  position?: {
    start?: { line?: number; column?: number };
    end?: { line?: number; column?: number };
  };
  children?: AstNode[];
}

export interface MarkdownParserOptions {
  sourcePath?: string;
  mode?: 'compatible' | 'strict';
}

export interface ParserDiagnostic {
  code: string;
  message: string;
  severity: 'warning';
  line?: number;
  column?: number;
}

export interface MarkdownParseResult {
  ir: IrDocument;
  diagnostics: ParserDiagnostic[];
}

export class MarkdownParseError extends Error {
  readonly code: string;
  readonly line: number | undefined;
  readonly column: number | undefined;

  constructor(code: string, message: string, node?: AstNode) {
    super(message);
    this.name = 'MarkdownParseError';
    this.code = code;
    this.line = node?.position?.start?.line;
    this.column = node?.position?.start?.column;
  }
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkFrontmatter, ['yaml'])
  .use(remarkDirective);

function children(node: AstNode): AstNode[] {
  return node.children ?? [];
}

function plainText(node: AstNode): string {
  if (node.type === 'text' || node.type === 'inlineCode') return node.value ?? '';
  return children(node).map(plainText).join('');
}

function position(
  node: AstNode,
  sourcePath: string,
): NonNullable<Topic['sourcePosition']> | undefined {
  const start = node.position?.start;
  const end = node.position?.end;
  if (!start && !end) return undefined;
  return {
    file: sourcePath,
    ...(start?.line === undefined ? {} : { startLine: start.line }),
    ...(start?.column === undefined ? {} : { startColumn: start.column }),
    ...(end?.line === undefined ? {} : { endLine: end.line }),
    ...(end?.column === undefined ? {} : { endColumn: end.column }),
  };
}

function slug(value: string): string {
  const normalized = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return normalized || 'documento';
}

function yamlBody(node: AstNode, state: ParseState): unknown {
  const lines = state.source.split(/\r?\n/);
  const startLine = node.position?.start?.line;
  const endLine = node.position?.end?.line;
  const source =
    startLine !== undefined && endLine !== undefined
      ? lines
          .slice(startLine, Math.max(startLine, endLine - 1))
          .join('\n')
          .trim()
      : children(node).map(plainText).join('\n').trim();
  if (!source) return {};
  try {
    return parseYaml(source);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'YAML no válido';
    throw new MarkdownParseError('MD_DIRECTIVE_YAML', message, node);
  }
}

function asRecord(value: unknown, code: string, node: AstNode): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new MarkdownParseError(code, 'Se esperaba un objeto YAML.', node);
  }
  return value as Record<string, unknown>;
}

function requiredString(record: Record<string, unknown>, key: string, node: AstNode): string {
  const value = record[key];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new MarkdownParseError(
      'MD_DIRECTIVE_FIELD',
      `El campo "${key}" es obligatorio y debe ser texto.`,
      node,
    );
  }
  return value;
}

function optionalStyle(record: Record<string, unknown>): StyleReference | undefined {
  const style: StyleReference = {};
  if (typeof record.role === 'string') style.role = record.role;
  if (typeof record.style === 'string') style.styleId = record.style;
  if (typeof record.style_set === 'string') style.setId = record.style_set;
  if (record.overrides !== undefined && record.overrides !== null) {
    if (typeof record.overrides !== 'object' || Array.isArray(record.overrides)) {
      throw new MarkdownParseError(
        'MD_STYLE_OVERRIDES',
        'overrides debe ser un objeto.',
        undefined,
      );
    }
    style.overrides = record.overrides as Record<string, JsonValue>;
  }
  return Object.keys(style).length ? style : undefined;
}

function inlineRuns(nodes: AstNode[], state: ParseState, marks: TextRun['marks'] = []): TextRun[] {
  const result: TextRun[] = [];
  for (const node of nodes) {
    if (node.type === 'text' || node.type === 'inlineCode') {
      const text = node.value ?? '';
      const runMarks = node.type === 'inlineCode' ? [...marks, 'inlineCode' as const] : marks;
      if (text) result.push({ text, ...(runMarks.length ? { marks: [...runMarks] } : {}) });
    } else if (node.type === 'strong' || node.type === 'emphasis' || node.type === 'delete') {
      const mark =
        node.type === 'strong' ? 'strong' : node.type === 'emphasis' ? 'emphasis' : 'strike';
      result.push(...inlineRuns(children(node), state, [...marks, mark]));
    } else if (node.type === 'link') {
      for (const run of inlineRuns(children(node), state, marks)) {
        result.push({ ...run, ...(node.url ? { link: node.url } : {}) });
      }
    } else if (node.type === 'break') {
      result.push({ text: '\n', ...(marks.length ? { marks: [...marks] } : {}) });
    } else {
      warn(state, 'MD_UNSUPPORTED_INLINE', `Elemento inline "${node.type}" no soportado en IR v1.`, node);
    }
  }
  return result;
}

interface ParseState {
  sourcePath: string;
  diagnostics: ParserDiagnostic[];
  assets: Asset[];
  assetIds: Map<string, string>;
  source: string;
  relationships: IrDocument['sheet']['relationships'];
  boundaries: IrDocument['sheet']['boundaries'];
  summaries: IrDocument['sheet']['summaries'];
  topicIds: Set<string>;
  mode: 'compatible' | 'strict';
}

function warn(state: ParseState, code: string, message: string, node: AstNode): void {
  if (state.mode === 'strict') throw new MarkdownParseError(code, message, node);
  state.diagnostics.push({
    code,
    message,
    severity: 'warning',
    ...(node.position?.start?.line === undefined ? {} : { line: node.position.start.line }),
    ...(node.position?.start?.column === undefined ? {} : { column: node.position.start.column }),
  });
}

function addAsset(node: AstNode, state: ParseState): ContentBlock {
  const uri = node.url ?? '';
  if (!uri) throw new MarkdownParseError('MD_IMAGE_URI', 'La imagen no contiene una URI.', node);
  let assetId = state.assetIds.get(uri);
  if (!assetId) {
    assetId = `asset:${state.assets.length + 1}-${slug(basename(uri))}`;
    state.assetIds.set(uri, assetId);
    state.assets.push({
      id: assetId,
      uri,
      ...(node.alt === null || node.alt === undefined ? {} : { alt: node.alt }),
      ...(node.title === null || node.title === undefined ? {} : { title: node.title }),
    });
  }
  const sourcePosition = position(node, state.sourcePath);
  return {
    type: 'image',
    assetId,
    alt: node.alt ?? '',
    ...(node.title ? { title: node.title } : {}),
    ...(sourcePosition ? { sourcePosition } : {}),
  };
}

function parseParagraph(node: AstNode, state: ParseState): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  let inline: AstNode[] = [];
  const flush = (): void => {
    if (!inline.length) return;
    const sourcePosition = position(node, state.sourcePath);
    blocks.push({
      type: 'paragraph',
      runs: inlineRuns(inline, state),
      ...(sourcePosition ? { sourcePosition } : {}),
    });
    inline = [];
  };
  for (const child of children(node)) {
    if (child.type === 'image') {
      flush();
      blocks.push(addAsset(child, state));
    } else {
      inline.push(child);
    }
  }
  flush();
  return blocks;
}

function parseBlocks(nodes: AstNode[], state: ParseState): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  for (const node of nodes) {
    const sourcePosition = position(node, state.sourcePath);
    switch (node.type) {
      case 'paragraph':
        blocks.push(...parseParagraph(node, state));
        break;
      case 'code':
        blocks.push({
          type: 'code',
          value: node.value ?? '',
          ...(node.lang ? { language: node.lang } : {}),
          ...(sourcePosition ? { sourcePosition } : {}),
        });
        break;
      case 'thematicBreak':
        blocks.push({ type: 'thematicBreak', ...(sourcePosition ? { sourcePosition } : {}) });
        break;
      case 'image':
        blocks.push({ ...addAsset(node, state), ...(sourcePosition ? { sourcePosition } : {}) });
        break;
      case 'blockquote':
        blocks.push({
          type: 'quote',
          blocks: parseBlocks(children(node), state),
          ...(sourcePosition ? { sourcePosition } : {}),
        });
        break;
      case 'list': {
        const items: ListItem[] = children(node)
          .filter((item) => item.type === 'listItem')
          .map((item) => ({
            blocks: parseBlocks(children(item), state),
          }));
        const list: ListBlock = {
          type: 'list',
          ordered: node.ordered ?? false,
          items,
          ...(node.start === null || node.start === undefined ? {} : { start: node.start }),
          ...(sourcePosition ? { sourcePosition } : {}),
        };
        blocks.push(list);
        break;
      }
      case 'table': {
        const rows = children(node).map((row) => ({
          cells: children(row).map((cell) => ({
            blocks: [{ type: 'paragraph' as const, runs: inlineRuns(children(cell), state) }],
          })),
        }));
        const table: TableBlock = {
          type: 'table',
          rows,
          ...(node.align ? { alignments: node.align } : {}),
          ...(sourcePosition ? { sourcePosition } : {}),
        };
        blocks.push(table);
        break;
      }
      case 'containerDirective':
      case 'leafDirective':
      case 'textDirective':
        throw new MarkdownParseError(
          'MD_DIRECTIVE_CONTEXT',
          'La directiva no puede aparecer dentro de un bloque de contenido.',
          node,
        );
      case 'html':
      case 'footnoteDefinition':
      case 'footnoteReference':
      case 'math':
      case 'inlineMath':
        warn(
          state,
          'MD_UNSUPPORTED_NODE',
          `Elemento Markdown "${node.type}" no soportado en IR v1.`,
          node,
        );
        break;
      default:
        warn(
          state,
          'MD_UNKNOWN_NODE',
          `Nodo Markdown "${node.type}" no reconocido; se omite.`,
          node,
        );
    }
  }
  return blocks;
}

function parseTopicHeading(
  node: AstNode,
  parentId: string,
  siblingIndex: number,
  state: ParseState,
): Topic {
  const rawTitle = plainText(node).trim();
  const match = rawTitle.match(/\s+\{#([^{}\s]+)\}\s*$/);
  const title = match ? rawTitle.slice(0, match.index).trim() : rawTitle;
  const id =
    match?.[1] ?? `topic:${parentId.replace(/^topic:/, '')}/${siblingIndex}-${slug(title)}`;
  if (state.topicIds.has(id))
    throw new MarkdownParseError('MD_DUPLICATE_TOPIC_ID', `ID de tema duplicado: ${id}`, node);
  state.topicIds.add(id);
  const sourcePosition = position(node, state.sourcePath);
  return {
    id,
    title,
    children: [],
    content: [],
    ...(sourcePosition ? { sourcePosition } : {}),
  };
}

function parseDirective(node: AstNode, topic: Topic | undefined, state: ParseState): void {
  const name = node.name ?? '';
  if (name === 'xmind-note') {
    if (!topic)
      throw new MarkdownParseError(
        'MD_DIRECTIVE_CONTEXT',
        ':::xmind-note requiere un tema activo.',
        node,
      );
    topic.notes = [...(topic.notes ?? []), ...parseBlocks(children(node), state)];
    return;
  }
  const record = asRecord(yamlBody(node, state), 'MD_DIRECTIVE_OBJECT', node);
  if (name === 'xmind') {
    if (!topic)
      throw new MarkdownParseError(
        'MD_DIRECTIVE_CONTEXT',
        ':::xmind requiere un tema activo.',
        node,
      );
    const style = optionalStyle(record);
    if (style) topic.style = { ...topic.style, ...style };
    return;
  }
  if (name === 'xmind-relationship') {
    const style = optionalStyle(record);
    const sourcePosition = position(node, state.sourcePath);
    state.relationships.push({
      id: requiredString(record, 'id', node),
      sourceTopicId: requiredString(record, 'from', node),
      targetTopicId: requiredString(record, 'to', node),
      ...(typeof record.label === 'string' ? { label: record.label } : {}),
      ...(typeof record.kind === 'string' ? { kind: record.kind } : {}),
      ...(style ? { style } : {}),
      ...(sourcePosition ? { sourcePosition } : {}),
    });
    return;
  }
  if (name === 'xmind-boundary' || name === 'xmind-summary') {
    const rawTopics = record.topics;
    if (!Array.isArray(rawTopics) || rawTopics.some((value) => typeof value !== 'string')) {
      throw new MarkdownParseError(
        'MD_DIRECTIVE_TOPICS',
        'topics debe ser una lista de IDs de tema.',
        node,
      );
    }
    const style = optionalStyle(record);
    const common = {
      id: requiredString(record, 'id', node),
      topicIds: rawTopics as string[],
      ...(typeof record.label === 'string' ? { label: record.label } : {}),
      ...(style ? { style } : {}),
    };
    if (name === 'xmind-boundary') state.boundaries.push(common);
    else state.summaries.push(common);
    return;
  }
  throw new MarkdownParseError('MD_UNKNOWN_DIRECTIVE', `Directiva desconocida: ${name}`, node);
}

export function parseMarkdownWithDiagnostics(
  markdown: string,
  options: MarkdownParserOptions = {},
): MarkdownParseResult {
  const sourcePath = options.sourcePath ?? 'document.md';
  const mode = options.mode ?? 'compatible';
  const tree = processor.parse(markdown) as unknown as AstNode;
  const topNodes = children(tree);
  let frontMatter: Record<string, unknown> = {};
  let hasFrontMatter = false;
  const contentNodes: AstNode[] = [];
  let seenContent = false;

  for (const node of topNodes) {
    if (node.type === 'yaml') {
      if (seenContent || hasFrontMatter) {
        throw new MarkdownParseError(
          'MD_FRONTMATTER_POSITION',
          'El front matter YAML solo puede aparecer una vez al inicio.',
          node,
        );
      }
      try {
        frontMatter = asRecord(parseYaml(node.value ?? ''), 'MD_FRONTMATTER_OBJECT', node);
        hasFrontMatter = true;
      } catch (error) {
        if (error instanceof MarkdownParseError) throw error;
        const message = error instanceof Error ? error.message : 'YAML no válido';
        throw new MarkdownParseError('MD_FRONTMATTER_YAML', message, node);
      }
    } else {
      seenContent = true;
      contentNodes.push(node);
    }
  }

  const diagnostics: ParserDiagnostic[] = [];
  for (const key of ['id', 'title', 'style_set']) {
    if (frontMatter[key] !== undefined && typeof frontMatter[key] !== 'string') {
      throw new MarkdownParseError('MD_FRONTMATTER_TYPE', `${key} debe ser texto.`);
    }
  }
  const allowedKeys = new Set(['id', 'title', 'style_set', 'settings']);
  for (const key of Object.keys(frontMatter)) {
    if (!allowedKeys.has(key)) {
      if (mode === 'strict')
        throw new MarkdownParseError(
          'MD_FRONTMATTER_UNKNOWN_KEY',
          `Clave de front matter desconocida: ${key}`,
        );
      diagnostics.push({
        code: 'MD_FRONTMATTER_UNKNOWN_KEY',
        message: `Clave de front matter desconocida: ${key}`,
        severity: 'warning',
      });
    }
  }

  const state: ParseState = {
    sourcePath,
    diagnostics,
    source: markdown,
    assets: [],
    assetIds: new Map(),
    relationships: [],
    boundaries: [],
    summaries: [],
    topicIds: new Set(),
    mode,
  };
  const headings = contentNodes.filter((node) => node.type === 'heading');
  const firstHeading = headings[0];
  if (firstHeading && contentNodes.slice(0, contentNodes.indexOf(firstHeading)).length > 0) {
    throw new MarkdownParseError(
      'MD_CONTENT_BEFORE_ROOT',
      'No puede haber contenido antes del encabezado H1.',
      contentNodes[0],
    );
  }
  if (!firstHeading || firstHeading.depth !== 1) {
    throw new MarkdownParseError(
      'MD_ROOT_HEADING',
      'El documento debe comenzar su estructura con un único encabezado H1.',
      firstHeading,
    );
  }
  if (headings.filter((heading) => heading.depth === 1).length !== 1) {
    throw new MarkdownParseError(
      'MD_MULTIPLE_ROOTS',
      'El documento debe contener exactamente un encabezado H1.',
      headings.find((heading) => heading.depth === 1),
    );
  }

  const fallbackName = basename(sourcePath, extname(sourcePath));
  const rootTitle = plainText(firstHeading)
    .replace(/\s+\{#[^{}\s]+\}\s*$/, '')
    .trim();
  const documentId =
    typeof frontMatter.id === 'string' ? frontMatter.id : `doc:${slug(fallbackName)}`;
  const documentTitle = typeof frontMatter.title === 'string' ? frontMatter.title : rootTitle;
  const sheetId = `sheet:${slug(fallbackName)}`;
  const rootTopic = parseTopicHeading(firstHeading, 'topic:root', 1, state);
  const stack: Topic[] = [rootTopic];
  const siblingCounts = new Map<Topic, number>([[rootTopic, 0]]);
  const rootIndex = contentNodes.indexOf(firstHeading);

  for (const node of contentNodes.slice(rootIndex + 1)) {
    if (node.type === 'heading') {
      const depth = node.depth ?? 1;
      if (depth === 1)
        throw new MarkdownParseError(
          'MD_MULTIPLE_ROOTS',
          'Solo se permite un encabezado H1.',
          node,
        );
      while (stack.length >= depth) stack.pop();
      if (stack.length !== depth - 1) {
        throw new MarkdownParseError(
          'MD_HEADING_LEVEL_GAP',
          `El encabezado H${depth} no tiene un padre H${depth - 1}.`,
          node,
        );
      }
      const parent = stack[stack.length - 1];
      if (!parent)
        throw new MarkdownParseError(
          'MD_HEADING_PARENT',
          'No se pudo resolver el padre del encabezado.',
          node,
        );
      const index = (siblingCounts.get(parent) ?? 0) + 1;
      siblingCounts.set(parent, index);
      const topic = parseTopicHeading(node, parent.id, index, state);
      parent.children.push(topic);
      stack.push(topic);
      siblingCounts.set(topic, 0);
      continue;
    }
    const current = stack[stack.length - 1];
    if (node.type === 'containerDirective' || node.type === 'leafDirective') {
      parseDirective(node, current, state);
      continue;
    }
    if (!current)
      throw new MarkdownParseError(
        'MD_CONTENT_WITHOUT_TOPIC',
        'Contenido fuera del árbol de temas.',
        node,
      );
    current.content.push(...parseBlocks([node], state));
  }

  const settings = frontMatter.settings;
  if (
    settings !== undefined &&
    (settings === null || typeof settings !== 'object' || Array.isArray(settings))
  ) {
    throw new MarkdownParseError('MD_FRONTMATTER_SETTINGS', 'settings debe ser un objeto YAML.');
  }
  if (frontMatter.style_set !== undefined && typeof frontMatter.style_set !== 'string') {
    throw new MarkdownParseError('MD_FRONTMATTER_STYLE_SET', 'style_set debe ser texto.');
  }

  const ir: IrDocument = {
    irVersion: '1.0.0',
    document: {
      id: documentId,
      title: documentTitle,
      source: sourcePath,
    },
    sheet: {
      id: sheetId,
      title: documentTitle,
      rootTopic,
      relationships: state.relationships,
      boundaries: state.boundaries,
      summaries: state.summaries,
      ...(typeof frontMatter.style_set === 'string'
        ? { defaultStyleSetId: frontMatter.style_set }
        : {}),
      ...(settings && typeof settings === 'object'
        ? { settings: settings as Record<string, JsonValue> }
        : {}),
    },
    assets: state.assets,
    styleSets: [],
  };
  return { ir, diagnostics };
}

export function parseMarkdown(markdown: string, options: MarkdownParserOptions = {}): IrDocument {
  return parseMarkdownWithDiagnostics(markdown, options).ir;
}
