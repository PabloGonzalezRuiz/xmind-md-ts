import { createRequire } from 'node:module';
import { basename, dirname, join, resolve } from 'node:path';
import { mkdir } from 'node:fs/promises';

import type { ContentBlock, IrDocument, Topic as IrTopic } from '../../../spec/ir-v1.types.js';

export type XMindExportMode = 'strict' | 'compatible';
export type XMindDiagnosticSeverity = 'warning' | 'error';
export interface XMindExportDiagnostic {
  code: string;
  severity: XMindDiagnosticSeverity;
  message: string;
  path?: string;
}
export interface XMindExportOptions {
  outputPath: string;
  mode?: XMindExportMode;
  theme?: 'robust' | 'snowbrush' | 'business';
}
export interface XMindExportResult {
  outputPath: string;
  diagnostics: XMindExportDiagnostic[];
  features: {
    topics: number;
    notes: number;
    markers: number;
    hyperlinks: number;
    summaries: number;
  };
}

interface SdkTopic {
  add(options: { title: string; labels?: string; href?: string }): SdkTopic;
  on(componentId?: string): SdkTopic;
  cid(title?: string): string;
  note(content: string): SdkTopic;
  marker(value: unknown): SdkTopic;
  summary(options: { title: string; edge: string }): SdkTopic;
}
interface SdkWorkbook {
  createSheet(title: string, rootTitle: string): unknown;
  validate(): { status: boolean; errors: unknown[] };
  theme(title: string, theme: string): boolean;
}
interface SdkMarkerInstance {
  [group: string]: ((name: string) => unknown) | unknown;
}
interface SdkMarkerConstructor {
  new (): SdkMarkerInstance;
  groups(): string[];
  names(group: string): string[];
}
interface SdkZipper {
  save(): Promise<boolean>;
}
interface XMindSdk {
  Workbook: new () => SdkWorkbook;
  Topic: new (options: { sheet: unknown }) => SdkTopic;
  Marker: SdkMarkerConstructor;
  Zipper: new (options: { path: string; workbook: SdkWorkbook; filename: string }) => SdkZipper;
}

const require = createRequire(import.meta.url);
const sdk = require('xmind') as XMindSdk;

function addDiagnostic(
  diagnostics: XMindExportDiagnostic[],
  code: string,
  severity: XMindDiagnosticSeverity,
  message: string,
  path?: string,
): void {
  diagnostics.push({ code, severity, message, ...(path ? { path } : {}) });
}

function renderBlocks(blocks: ContentBlock[]): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case 'paragraph':
          return block.runs.map((run) => run.text).join('');
        case 'list':
          return block.items
            .map((item, index) => {
              const prefix = block.ordered ? `${(block.start ?? 1) + index}.` : '-';
              return `${prefix} ${renderBlocks(item.blocks)}`;
            })
            .join('\n');
        case 'table':
          return block.rows
            .map((row) => row.cells.map((cell) => renderBlocks(cell.blocks)).join(' | '))
            .join('\n');
        case 'code':
          return block.value;
        case 'quote':
          return renderBlocks(block.blocks)
            .split('\n')
            .map((line) => `> ${line}`)
            .join('\n');
        case 'image':
          return `[Imagen: ${block.alt || block.assetId}]`;
        case 'thematicBreak':
          return '---';
      }
    })
    .filter(Boolean)
    .join('\n\n');
}

function markerValue(markerName: string, marker: SdkMarkerConstructor): unknown | undefined {
  const normalized = markerName.toLowerCase();
  for (const group of marker.groups()) {
    const name = marker.names(group).find((candidate) => candidate.toLowerCase() === normalized);
    if (!name) continue;
    const instance = new marker();
    const factory = instance[group];
    if (typeof factory === 'function') return factory(name);
  }
  return undefined;
}

function exportTopicTree(
  topicApi: SdkTopic,
  parentSdkId: string,
  topics: IrTopic[],
  path: string,
  diagnostics: XMindExportDiagnostic[],
  topicIds: Map<string, string>,
  features: XMindExportResult['features'],
  markerApi: SdkMarkerConstructor,
  topicParents: Map<string, string>,
): void {
  topics.forEach((topic, index) => {
    const topicPath = `${path}.children[${index}]`;
    const labels = topic.labels ?? [];
    const options: { title: string; labels?: string; href?: string } = { title: topic.title };
    if (labels.length) {
      options.labels = labels.join(', ');
      if (labels.length > 1) {
        addDiagnostic(
          diagnostics,
          'XMIND_LABELS_COLLAPSED',
          'warning',
          'El SDK almacena las etiquetas como una sola cadena; varias etiquetas se han unido con coma.',
          `${topicPath}.labels`,
        );
      }
    }
    if (topic.hyperlink) options.href = topic.hyperlink;

    topicApi.on(parentSdkId).add(options);
    const sdkId = topicApi.cid();
    if (!sdkId) {
      addDiagnostic(
        diagnostics,
        'XMIND_TOPIC_ID_MISSING',
        'error',
        'El SDK no devolvió el ID del tema creado.',
        topicPath,
      );
      return;
    }
    topicIds.set(topic.id, sdkId);
    topicParents.set(topic.id, parentSdkId);
    features.topics += 1;
    if (topic.hyperlink) features.hyperlinks += 1;

    const noteParts: string[] = [];
    if (topic.content.length) {
      noteParts.push(`Contenido\n${renderBlocks(topic.content)}`);
      addDiagnostic(
        diagnostics,
        'XMIND_CONTENT_AS_NOTE',
        'warning',
        'El contenido del tema se ha convertido en texto de nota porque el SDK no ofrece un cuerpo enriquecido equivalente.',
        `${topicPath}.content`,
      );
    }
    if (topic.notes?.length) noteParts.push(renderBlocks(topic.notes));
    if (noteParts.length) {
      topicApi.on(sdkId).note(noteParts.join('\n\n'));
      features.notes += 1;
    }

    for (const markerName of topic.markers ?? []) {
      const value = markerValue(markerName, markerApi);
      if (value === undefined) {
        addDiagnostic(
          diagnostics,
          'XMIND_MARKER_UNSUPPORTED',
          'error',
          `El marcador "${markerName}" no existe en el catálogo del SDK.`,
          `${topicPath}.markers`,
        );
        continue;
      }
      topicApi.on(sdkId).marker(value);
      features.markers += 1;
    }

    exportTopicTree(
      topicApi,
      sdkId,
      topic.children,
      topicPath,
      diagnostics,
      topicIds,
      features,
      markerApi,
      topicParents,
    );
  });
}

function hasTopicStyles(topic: IrTopic): boolean {
  return Boolean(topic.style) || topic.children.some(hasTopicStyles);
}

/**
 * Convierte un IR validado en un paquete XMind mediante el SDK oficial.
 * El SDK se mantiene encapsulado en este módulo; nunca se muta el IR recibido.
 */
export async function exportXMindFile(
  document: IrDocument,
  options: XMindExportOptions,
): Promise<XMindExportResult> {
  const diagnostics: XMindExportDiagnostic[] = [];
  const mode = options.mode ?? 'strict';
  const theme = options.theme ?? 'robust';
  const outputPath = resolve(options.outputPath);
  const outputDirectory = dirname(outputPath);
  const filename = basename(outputPath).replace(/\.xmind$/i, '');
  const features = { topics: 0, notes: 0, markers: 0, hyperlinks: 0, summaries: 0 };

  if (!filename || filename === '.' || filename === '..') {
    throw new Error('El nombre del archivo XMind no es válido.');
  }

  if (document.sheet.relationships.length) {
    addDiagnostic(
      diagnostics,
      'XMIND_RELATIONSHIPS_UNSUPPORTED',
      'error',
      'Las relaciones del IR requieren puntos de control y no se exportan todavía.',
      'sheet.relationships',
    );
  }
  if (document.sheet.boundaries.length) {
    addDiagnostic(
      diagnostics,
      'XMIND_BOUNDARIES_UNSUPPORTED',
      'error',
      'Los límites del IR no se exportan todavía.',
      'sheet.boundaries',
    );
  }
  if (document.styleSets.length || hasTopicStyles(document.sheet.rootTopic)) {
    addDiagnostic(
      diagnostics,
      'XMIND_STYLES_UNSUPPORTED',
      'error',
      'Los StyleSets y overrides del IR no se traducen todavía al modelo de estilos del SDK.',
      'styleSets',
    );
  }
  if (document.assets.length) {
    addDiagnostic(
      diagnostics,
      'XMIND_ASSETS_NOT_EMBEDDED',
      'error',
      'Los recursos binarios no se incrustan en esta versión del exportador.',
      'assets',
    );
  }

  const workbook = new sdk.Workbook();
  const sheet = workbook.createSheet(document.sheet.title, document.sheet.rootTopic.title);
  const topicApi = new sdk.Topic({ sheet });
  const rootSdkId = topicApi.cid();
  const topicIds = new Map<string, string>([[document.sheet.rootTopic.id, rootSdkId]]);
  const topicParents = new Map<string, string>();
  features.topics += 1;

  const root = document.sheet.rootTopic;
  const rootNoteParts: string[] = [];
  if (root.content.length) {
    rootNoteParts.push(`Contenido\n${renderBlocks(root.content)}`);
    addDiagnostic(
      diagnostics,
      'XMIND_CONTENT_AS_NOTE',
      'warning',
      'El contenido del tema central se ha convertido en texto de nota.',
      'sheet.rootTopic.content',
    );
  }
  if (root.notes?.length) rootNoteParts.push(renderBlocks(root.notes));
  if (rootNoteParts.length) {
    topicApi.on(rootSdkId).note(rootNoteParts.join('\n\n'));
    features.notes += 1;
  }
  for (const markerName of root.markers ?? []) {
    const value = markerValue(markerName, sdk.Marker);
    if (value === undefined) {
      addDiagnostic(
        diagnostics,
        'XMIND_MARKER_UNSUPPORTED',
        'error',
        `El marcador "${markerName}" no existe en el catálogo del SDK.`,
        'sheet.rootTopic.markers',
      );
      continue;
    }
    topicApi.on(rootSdkId).marker(value);
    features.markers += 1;
  }
  if (root.hyperlink) {
    addDiagnostic(
      diagnostics,
      'XMIND_ROOT_HYPERLINK_OMITTED',
      'warning',
      'El SDK no expone un setter de hipervínculo para el tema central en su API de alto nivel.',
      'sheet.rootTopic.hyperlink',
    );
  }

  exportTopicTree(
    topicApi,
    rootSdkId,
    document.sheet.rootTopic.children,
    'sheet.rootTopic',
    diagnostics,
    topicIds,
    features,
    sdk.Marker,
    topicParents,
  );

  for (const summary of document.sheet.summaries) {
    const first = topicIds.get(summary.topicIds[0] ?? '');
    const last = topicIds.get(summary.topicIds.at(-1) ?? '');
    const firstTopicId = summary.topicIds[0] ?? '';
    const lastTopicId = summary.topicIds.at(-1) ?? '';
    if (
      !first ||
      !last ||
      first === last ||
      topicParents.get(firstTopicId) !== topicParents.get(lastTopicId)
    ) {
      addDiagnostic(
        diagnostics,
        'XMIND_SUMMARY_RANGE_INVALID',
        'error',
        'El rango del resumen no se puede representar con los IDs de temas exportados.',
        `sheet.summaries.${summary.id}`,
      );
      continue;
    }
    topicApi.on(first).summary({ title: summary.label ?? 'Resumen', edge: last });
    features.summaries += 1;
  }

  if (root.labels?.length) {
    addDiagnostic(
      diagnostics,
      'XMIND_ROOT_LABELS_OMITTED',
      'warning',
      'Las etiquetas del tema central no se exportan en esta versión.',
      'sheet.rootTopic.labels',
    );
  }

  if (!workbook.theme(document.sheet.title, theme)) {
    addDiagnostic(
      diagnostics,
      'XMIND_THEME_REJECTED',
      'error',
      `El SDK no ha aceptado el tema visual "${theme}".`,
      'sheet.settings',
    );
  }

  const errors = diagnostics.filter((diagnostic) => diagnostic.severity === 'error');
  if (mode === 'strict' && errors.length) {
    const summary = errors
      .map((diagnostic) => `${diagnostic.code}: ${diagnostic.message}`)
      .join('\n');
    throw new XMindExportError(
      `La exportación estricta se ha detenido por características no soportadas:\n${summary}`,
      diagnostics,
    );
  }

  const validation = workbook.validate();
  if (!validation.status) {
    throw new XMindExportError(
      `El SDK ha rechazado el workbook: ${JSON.stringify(validation.errors)}`,
      diagnostics,
    );
  }

  await mkdir(outputDirectory, { recursive: true });
  const zipper = new sdk.Zipper({ path: outputDirectory, workbook, filename });
  const saved = await zipper.save();
  if (!saved) {
    throw new XMindExportError('El SDK no ha podido guardar el paquete XMind.', diagnostics);
  }

  return { outputPath: join(outputDirectory, `${filename}.xmind`), diagnostics, features };
}

export class XMindExportError extends Error {
  constructor(
    message: string,
    readonly diagnostics: XMindExportDiagnostic[] = [],
  ) {
    super(message);
    this.name = 'XMindExportError';
  }
}
