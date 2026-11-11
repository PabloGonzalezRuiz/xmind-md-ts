import { basename, dirname, join, resolve } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';

import type { IrDocument, JsonValue, Topic } from '../../../spec/ir-v1.types.js';
import { resolveIrStyles } from '../../styles/style-engine.js';

export type SvgExportMode = 'strict' | 'compatible';
export type SvgDiagnosticSeverity = 'warning' | 'error';

export interface SvgExportDiagnostic {
  code: string;
  severity: SvgDiagnosticSeverity;
  message: string;
  path?: string;
}

export interface SvgExportOptions {
  outputPath: string;
  mode?: SvgExportMode;
}

export interface SvgExportResult {
  outputPath: string;
  diagnostics: SvgExportDiagnostic[];
  features: {
    topics: number;
    relationships: number;
    boundaries: number;
    summaries: number;
    styledTopics: number;
    embeddedIr: boolean;
  };
}

interface TopicLayout {
  topic: Topic;
  depth: number;
  lines: string[];
  width: number;
  height: number;
  lineHeight: number;
  subtreeHeight: number;
  x: number;
  y: number;
  children: TopicLayout[];
}

interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

type StyleValues = Record<string, JsonValue>;

const HORIZONTAL_GAP = 72;
const VERTICAL_GAP = 28;
const PADDING = 48;
const NODE_PADDING_X = 16;
const NODE_PADDING_Y = 12;
const MAX_NODE_WIDTH = 280;
const MIN_NODE_WIDTH = 150;
const DEFAULT_FONT_SIZE = 14;

function escapeXml(value: string): string {
  const xmlSafe = Array.from(value)
    .filter((character) => {
      const code = character.codePointAt(0) ?? 0;
      return (
        code === 9 ||
        code === 10 ||
        code === 13 ||
        (code >= 32 && code <= 0xd7ff) ||
        (code >= 0xe000 && code <= 0xfffd) ||
        (code >= 0x10000 && code <= 0x10ffff)
      );
    })
    .join('');
  return xmlSafe
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function xmlId(value: string): string {
  return `ir-${Array.from(value)
    .map((character) => (character.codePointAt(0) ?? 0).toString(16))
    .join('-')}`;
}

function asString(value: JsonValue | undefined, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: JsonValue | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function lengthInPixels(value: JsonValue | undefined, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return fallback;
  const match = value.trim().match(/^(-?(?:\d+\.?\d*|\.\d+))(px|pt|em|rem|%)?$/i);
  if (!match) return fallback;
  const amount = Number(match[1]);
  switch ((match[2] ?? 'px').toLowerCase()) {
    case 'pt':
      return amount * (4 / 3);
    case 'em':
    case 'rem':
      return amount * 16;
    case '%':
      return (amount / 100) * 16;
    default:
      return amount;
  }
}

function safeColor(value: JsonValue | undefined, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  return /^[#(),.%\w\s+-]+$/.test(value) ? value : fallback;
}

function isSafeHyperlink(value: string): boolean {
  const normalized = value.trim();
  if (
    !normalized ||
    Array.from(normalized).some((character) => {
      const code = character.charCodeAt(0);
      return code < 32 || code === 127;
    })
  ) {
    return false;
  }
  const scheme = normalized.match(/^([a-z][a-z0-9+.-]*):/i)?.[1]?.toLowerCase();
  return !scheme || ['http', 'https', 'mailto', 'tel'].includes(scheme);
}

function styleMap(styles: ReturnType<typeof resolveIrStyles>['styles']): Map<string, StyleValues> {
  return new Map(styles.map((style) => [style.elementId, style.values]));
}

function wrapText(value: string, maxCharacters: number): string[] {
  const result: string[] = [];
  for (const sourceLine of value.split(/\r?\n/)) {
    const words = sourceLine.split(/\s+/).filter(Boolean);
    if (!words.length) {
      result.push('');
      continue;
    }
    let line = '';
    for (const word of words) {
      if (!line) {
        line = word;
      } else if (line.length + word.length + 1 <= maxCharacters) {
        line += ` ${word}`;
      } else {
        result.push(line);
        line = word;
      }
    }
    if (line) result.push(line);
  }
  return result.length ? result : [''];
}

function blockText(blocks: Topic['content']): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case 'paragraph':
          return block.runs.map((run) => run.text).join('');
        case 'list':
          return block.items
            .map((item, index) => {
              const prefix = block.ordered ? `${(block.start ?? 1) + index}.` : '•';
              return `${prefix} ${blockText(item.blocks)}`;
            })
            .join('\n');
        case 'table':
          return block.rows
            .map((row) => row.cells.map((cell) => blockText(cell.blocks)).join(' | '))
            .join('\n');
        case 'code':
          return block.value;
        case 'quote':
          return blockText(block.blocks)
            .split('\n')
            .map((line) => `“${line}”`)
            .join('\n');
        case 'image':
          return block.alt || `Imagen ${block.assetId}`;
        case 'thematicBreak':
          return 'Separador';
      }
    })
    .filter(Boolean)
    .join('\n');
}

function topicDescription(topic: Topic): string {
  const sections = [topic.title, blockText(topic.content), blockText(topic.notes ?? [])].filter(
    Boolean,
  );
  return sections.join('\n\n');
}

function baseNodeHeight(lines: string[], hasMetadata: boolean, lineHeight: number): number {
  return Math.max(52, NODE_PADDING_Y * 2 + lines.length * lineHeight + (hasMetadata ? 18 : 0));
}

function createLayout(
  topic: Topic,
  depth: number,
  widths: number[],
  styles: Map<string, StyleValues>,
): TopicLayout {
  const values = styles.get(topic.id);
  const fontSize = Math.min(24, Math.max(10, lengthInPixels(values?.fontSize, DEFAULT_FONT_SIZE)));
  const lineHeight = Math.max(16, fontSize * 1.35);
  const lines = wrapText(
    topic.title || '(sin título)',
    Math.max(12, Math.floor(26 * (14 / fontSize))),
  );
  const width = Math.min(
    MAX_NODE_WIDTH,
    Math.max(
      MIN_NODE_WIDTH,
      Math.max(...lines.map((line) => line.length), 1) * fontSize * 0.62 + NODE_PADDING_X * 2,
    ),
  );
  widths[depth] = Math.max(widths[depth] ?? 0, width);
  const metadata = Boolean(topic.labels?.length || topic.markers?.length);
  const height = baseNodeHeight(lines, metadata, lineHeight);
  const children = topic.children.map((child) => createLayout(child, depth + 1, widths, styles));
  const childrenHeight =
    children.reduce((total, child) => total + child.subtreeHeight, 0) +
    Math.max(0, children.length - 1) * VERTICAL_GAP;
  return {
    topic,
    depth,
    lines,
    width,
    height,
    lineHeight,
    subtreeHeight: Math.max(height, childrenHeight),
    x: 0,
    y: 0,
    children,
  };
}

function assignPositions(node: TopicLayout, startY: number, xPositions: number[]): void {
  node.x = xPositions[node.depth] ?? PADDING;
  node.y = startY + node.subtreeHeight / 2;
  if (!node.children.length) return;
  const childrenHeight =
    node.children.reduce((total, child) => total + child.subtreeHeight, 0) +
    (node.children.length - 1) * VERTICAL_GAP;
  let childY = startY + (node.subtreeHeight - childrenHeight) / 2;
  for (const child of node.children) {
    assignPositions(child, childY, xPositions);
    childY += child.subtreeHeight + VERTICAL_GAP;
  }
}

function flattenTopics(node: TopicLayout): TopicLayout[] {
  return [node, ...node.children.flatMap(flattenTopics)];
}

function nodeBounds(node: TopicLayout): Bounds {
  return {
    x: node.x,
    y: node.y - node.height / 2,
    width: node.width,
    height: node.height,
  };
}

function asBoolean(value: JsonValue | undefined, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function lineStyle(values: StyleValues | undefined): string {
  const style = asString(values?.lineStyle, 'solid');
  if (style === 'dashed') return '6 4';
  if (style === 'dotted') return '2 4';
  const dash = values?.dashArray;
  return Array.isArray(dash) && dash.every((item) => typeof item === 'number')
    ? dash.join(' ')
    : '';
}

function renderNode(node: TopicLayout, styles: Map<string, StyleValues>): string {
  const { topic } = node;
  const values = styles.get(topic.id);
  const shape = asString(values?.shape, 'rounded-rectangle');
  const fill = safeColor(values?.fill ?? values?.backgroundColor, '#FFFFFF');
  const stroke = safeColor(values?.stroke, '#64748B');
  const color = safeColor(values?.color, '#1F2937');
  const fontFamily = asString(values?.fontFamily, 'sans-serif');
  const fontSize = Math.min(24, Math.max(10, lengthInPixels(values?.fontSize, DEFAULT_FONT_SIZE)));
  const strokeWidth = asNumber(values?.strokeWidth, 1.5);
  const opacity = asNumber(values?.opacity, 1);
  const radius = lengthInPixels(values?.borderRadius, 8);
  const textAnchor = asString(values?.textAlign, 'center') === 'left' ? 'start' : 'middle';
  const textX = textAnchor === 'start' ? node.x + NODE_PADDING_X : node.x + node.width / 2;
  const textHeight = node.lines.length * node.lineHeight;
  const metadata = [
    ...(topic.labels ?? []),
    ...(topic.markers ?? []).map((marker) => `◆ ${marker}`),
  ];
  const metadataText = metadata.join(' · ');
  const contentHeight = textHeight + (metadataText ? 18 : 0);
  const textTop = node.y - contentHeight / 2 + fontSize * 0.85;
  let shapeMarkup: string;
  if (shape === 'ellipse') {
    shapeMarkup = `<ellipse cx="${node.x + node.width / 2}" cy="${node.y}" rx="${node.width / 2}" ry="${node.height / 2}" />`;
  } else if (shape === 'diamond') {
    const points = `${node.x + node.width / 2},${node.y - node.height / 2} ${node.x + node.width},${node.y} ${node.x + node.width / 2},${node.y + node.height / 2} ${node.x},${node.y}`;
    shapeMarkup = `<polygon points="${points}" />`;
  } else {
    const rx = shape === 'rectangle' ? 0 : radius;
    shapeMarkup = `<rect x="${node.x}" y="${node.y - node.height / 2}" width="${node.width}" height="${node.height}" rx="${rx}" />`;
  }
  const textMarkup = node.lines
    .map(
      (line, index) =>
        `<tspan x="${textX}" y="${textTop + index * node.lineHeight}">${escapeXml(line)}</tspan>`,
    )
    .join('');
  const labelY = textTop + textHeight + 2;
  const nodeMarkup = `<g id="${xmlId(topic.id)}" data-ir-id="${escapeXml(topic.id)}" data-ir-type="topic" role="group"><title>${escapeXml(topic.title)}</title><desc>${escapeXml(topicDescription(topic))}</desc><g fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}">${shapeMarkup}</g><text fill="${color}" font-family="${escapeXml(fontFamily)}" font-size="${fontSize}" font-weight="${escapeXml(asString(values?.fontWeight, 'normal'))}" font-style="${escapeXml(asString(values?.fontStyle, 'normal'))}" text-decoration="${escapeXml(asString(values?.textDecoration, 'none'))}" text-anchor="${textAnchor}">${textMarkup}</text>${metadataText ? `<text x="${textX}" y="${labelY}" fill="#64748B" font-family="sans-serif" font-size="10" text-anchor="${textAnchor}">${escapeXml(metadataText)}</text>` : ''}</g>`;
  return topic.hyperlink && isSafeHyperlink(topic.hyperlink)
    ? `<a href="${escapeXml(topic.hyperlink)}" aria-label="${escapeXml(`Abrir ${topic.title}`)}">${nodeMarkup}</a>`
    : nodeMarkup;
}

function renderTreeEdges(node: TopicLayout): string {
  return node.children
    .map((child) => {
      const startX = node.x + node.width;
      const endX = child.x;
      const startY = node.y;
      const endY = child.y;
      const middleX = (startX + endX) / 2;
      const edge = `<path d="M ${startX} ${startY} C ${middleX} ${startY}, ${middleX} ${endY}, ${endX} ${endY}" fill="none" stroke="#94A3B8" stroke-width="1.8" />`;
      return edge + renderTreeEdges(child);
    })
    .join('');
}

function renderRelationship(
  relationship: IrDocument['sheet']['relationships'][number],
  positions: Map<string, TopicLayout>,
  styles: Map<string, StyleValues>,
): string {
  const source = positions.get(relationship.sourceTopicId);
  const target = positions.get(relationship.targetTopicId);
  if (!source || !target) return '';
  const values = styles.get(relationship.id);
  const stroke = safeColor(values?.stroke ?? values?.color, '#D97706');
  const width = asNumber(values?.strokeWidth, 1.8);
  const dash = lineStyle(values);
  const forward = target.x >= source.x;
  const startX = forward ? source.x + source.width : source.x;
  const endX = forward ? target.x : target.x + target.width;
  const curveOffset = forward ? 28 : -28;
  const labelX = (startX + endX) / 2 + curveOffset;
  const path = `M ${startX} ${source.y} Q ${labelX} ${(source.y + target.y) / 2 - 24} ${endX} ${target.y}`;
  const arrowStart = asBoolean(values?.arrowStart, false) ? 'marker-start="url(#arrow)"' : '';
  const arrowEnd = asBoolean(values?.arrowEnd, true) ? 'marker-end="url(#arrow)"' : '';
  const label = relationship.label
    ? `<text x="${labelX}" y="${(source.y + target.y) / 2 - 30}" font-size="11" text-anchor="middle" fill="${stroke}">${escapeXml(relationship.label)}</text>`
    : '';
  return `<g id="${xmlId(relationship.id)}" data-ir-id="${escapeXml(relationship.id)}" data-ir-type="relationship"><title>${escapeXml(relationship.label ?? relationship.kind ?? 'Relación')}</title><path d="${path}" fill="none" stroke="${stroke}" stroke-width="${width}" ${dash ? `stroke-dasharray="${dash}"` : ''} ${arrowStart} ${arrowEnd} />${label}</g>`;
}

function renderBoundary(
  boundary: IrDocument['sheet']['boundaries'][number],
  positions: Map<string, TopicLayout>,
  styles: Map<string, StyleValues>,
): string {
  const selected = boundary.topicIds
    .map((id) => positions.get(id))
    .filter((item) => item !== undefined);
  if (!selected.length) return '';
  const bounds = selected.map(nodeBounds);
  const left = Math.min(...bounds.map((item) => item.x)) - 16;
  const top = Math.min(...bounds.map((item) => item.y)) - 16;
  const right = Math.max(...bounds.map((item) => item.x + item.width)) + 16;
  const bottom = Math.max(...bounds.map((item) => item.y + item.height)) + 16;
  const values = styles.get(boundary.id);
  const stroke = safeColor(values?.stroke ?? values?.color, '#0D9488');
  const fill = safeColor(values?.fill ?? values?.backgroundColor, '#CCFBF1');
  const opacity = Math.min(0.35, asNumber(values?.opacity, 0.18));
  const dash = lineStyle(values);
  const label = boundary.label
    ? `<text x="${left + 8}" y="${top - 5}" fill="${stroke}" font-size="12">${escapeXml(boundary.label)}</text>`
    : '';
  return `<g id="${xmlId(boundary.id)}" data-ir-id="${escapeXml(boundary.id)}" data-ir-type="boundary"><title>${escapeXml(boundary.label ?? 'Límite')}</title><rect x="${left}" y="${top}" width="${right - left}" height="${bottom - top}" rx="${lengthInPixels(values?.borderRadius, 12)}" fill="${fill}" fill-opacity="${opacity}" stroke="${stroke}" stroke-width="${asNumber(values?.strokeWidth, 1.5)}" ${dash ? `stroke-dasharray="${dash}"` : 'stroke-dasharray="7 5"'} />${label}</g>`;
}

function renderSummary(
  summary: IrDocument['sheet']['summaries'][number],
  positions: Map<string, TopicLayout>,
  styles: Map<string, StyleValues>,
  diagramWidth: number,
): string {
  const selected = summary.topicIds
    .map((id) => positions.get(id))
    .filter((item) => item !== undefined);
  if (!selected.length) return '';
  const values = styles.get(summary.id);
  const stroke = safeColor(values?.stroke ?? values?.color, '#7C3AED');
  const x = diagramWidth - PADDING - 96;
  const top = Math.min(...selected.map((node) => node.y - node.height / 2));
  const bottom = Math.max(...selected.map((node) => node.y + node.height / 2));
  const middle = (top + bottom) / 2;
  const label = summary.label
    ? `<text x="${x + 10}" y="${middle + 4}" fill="${stroke}" font-size="12">${escapeXml(summary.label)}</text>`
    : '';
  return `<g id="${xmlId(summary.id)}" data-ir-id="${escapeXml(summary.id)}" data-ir-type="summary"><title>${escapeXml(summary.label ?? 'Resumen')}</title><path d="M ${x + 12} ${top} H ${x} V ${bottom} H ${x + 12}" fill="none" stroke="${stroke}" stroke-width="${asNumber(values?.strokeWidth, 1.8)}" ${lineStyle(values) ? `stroke-dasharray="${lineStyle(values)}"` : ''} />${label}</g>`;
}

function addDiagnostic(
  diagnostics: SvgExportDiagnostic[],
  code: string,
  severity: SvgDiagnosticSeverity,
  message: string,
  path?: string,
): void {
  diagnostics.push({ code, severity, message, ...(path ? { path } : {}) });
}

/**
 * Renderiza un IR validado a SVG determinista.
 * El IR completo se conserva en <metadata>, además de los elementos SVG visibles.
 */
export async function exportSvgFile(
  document: IrDocument,
  options: SvgExportOptions,
): Promise<SvgExportResult> {
  const outputPath = resolve(options.outputPath);
  const filename = basename(outputPath);
  if (!filename || filename === '.' || filename === '..') {
    throw new Error('El nombre del archivo SVG no es válido.');
  }

  const diagnostics: SvgExportDiagnostic[] = [];
  const mode = options.mode ?? 'strict';
  if (document.assets.length) {
    addDiagnostic(
      diagnostics,
      'SVG_ASSETS_NOT_RENDERED',
      mode === 'strict' ? 'error' : 'warning',
      'Los recursos binarios no se dibujan en el SVG; sus referencias se conservan en los metadatos IR.',
      'assets',
    );
  }

  const styleResult = resolveIrStyles(document);
  for (const diagnostic of styleResult.diagnostics) {
    addDiagnostic(diagnostics, diagnostic.code, 'warning', diagnostic.message, diagnostic.path);
  }
  const styles = styleMap(styleResult.styles);
  const mapStyle = styles.get(document.sheet.id);
  const widths: number[] = [];
  const root = createLayout(document.sheet.rootTopic, 0, widths, styles);
  const xPositions: number[] = [];
  let nextX = PADDING;
  widths.forEach((width, depth) => {
    xPositions[depth] = nextX;
    nextX += width + HORIZONTAL_GAP;
  });
  assignPositions(root, PADDING, xPositions);
  const nodes = flattenTopics(root);
  for (const node of nodes) {
    if (node.topic.hyperlink && !isSafeHyperlink(node.topic.hyperlink)) {
      addDiagnostic(
        diagnostics,
        'SVG_HYPERLINK_OMITTED',
        'warning',
        'Se ha omitido un hipervínculo con un esquema no permitido en SVG.',
        `topics.${node.topic.id}.hyperlink`,
      );
    }
  }
  const positions = new Map(nodes.map((node) => [node.topic.id, node]));
  const totalWidth = Math.max(
    320,
    nextX - HORIZONTAL_GAP + PADDING + (document.sheet.summaries.length ? 180 : 0),
  );
  const totalHeight = Math.max(180, root.subtreeHeight + PADDING * 2);
  const background = safeColor(mapStyle?.backgroundColor, '#FFFFFF');

  const errors = diagnostics.filter((diagnostic) => diagnostic.severity === 'error');
  if (mode === 'strict' && errors.length) {
    throw new SvgExportError(
      `La exportación SVG estricta se ha detenido: ${errors.map((item) => item.code).join(', ')}`,
      diagnostics,
    );
  }

  const treeEdges = renderTreeEdges(root);
  const boundaries = document.sheet.boundaries
    .map((item) => renderBoundary(item, positions, styles))
    .join('');
  const relationships = document.sheet.relationships
    .map((item) => renderRelationship(item, positions, styles))
    .join('');
  const summaries = document.sheet.summaries
    .map((item) => renderSummary(item, positions, styles, totalWidth))
    .join('');
  const topicMarkup = nodes.map((node) => renderNode(node, styles)).join('');
  const title = document.sheet.title || document.document.title || 'Mapa mental';
  const metadata = escapeXml(JSON.stringify(document));
  const svg = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}" role="img" aria-labelledby="svg-title svg-desc">`,
    `<title id="svg-title">${escapeXml(title)}</title>`,
    `<desc id="svg-desc">Mapa mental con ${nodes.length} temas, ${document.sheet.relationships.length} relaciones, ${document.sheet.boundaries.length} límites y ${document.sheet.summaries.length} resúmenes.</desc>`,
    `<metadata id="xmind-md-ir" data-ir-version="${document.irVersion}">${metadata}</metadata>`,
    '<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth"><path d="M 0 0 L 8 4 L 0 8 z" fill="#D97706" /></marker></defs>',
    `<rect width="100%" height="100%" fill="${background}" />`,
    `<g id="boundaries">${boundaries}</g>`,
    `<g id="tree-edges">${treeEdges}</g>`,
    `<g id="relationships">${relationships}</g>`,
    `<g id="summaries">${summaries}</g>`,
    `<g id="topics">${topicMarkup}</g>`,
    '</svg>',
    '',
  ].join('\n');

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, svg, 'utf8');

  return {
    outputPath: join(dirname(outputPath), filename),
    diagnostics,
    features: {
      topics: nodes.length,
      relationships: document.sheet.relationships.length,
      boundaries: document.sheet.boundaries.length,
      summaries: document.sheet.summaries.length,
      styledTopics: nodes.filter((node) => Boolean(node.topic.style)).length,
      embeddedIr: true,
    },
  };
}

export class SvgExportError extends Error {
  constructor(
    message: string,
    readonly diagnostics: SvgExportDiagnostic[] = [],
  ) {
    super(message);
    this.name = 'SvgExportError';
  }
}
