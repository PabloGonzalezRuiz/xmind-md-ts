import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';

import type { SourcePosition, StyleReference } from '../../spec/ir-v1.types.js';

export interface IrValidationDiagnostic {
  code: string;
  severity: 'error';
  message: string;
  path: string;
  sourcePosition?: SourcePosition;
}

export interface IrValidationOptions {
  maxDepth?: number;
  maxTopics?: number;
  maxContentBlocks?: number;
  maxAssets?: number;
  assetRootDirectory?: string;
}

export interface IrValidationResult {
  valid: boolean;
  diagnostics: IrValidationDiagnostic[];
}

type UnknownRecord = Record<string, unknown>;

const DEFAULT_LIMITS = {
  maxDepth: 100,
  maxTopics: 100_000,
  maxContentBlocks: 250_000,
  maxAssets: 10_000,
} as const;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function sourcePosition(value: unknown): SourcePosition | undefined {
  if (!isRecord(value) || !isRecord(value.sourcePosition)) return undefined;
  return value.sourcePosition as SourcePosition;
}

function validUriReference(value: string): boolean {
  if (!value || /\\s|\\\\/.test(value) || /%(?![0-9a-f]{2})/i.test(value)) {
    return false;
  }
  try {
    new URL(value, 'https://xmind-md-ts.invalid/');
    return true;
  } catch {
    return false;
  }
}

function isExternalUri(uri: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(uri) || uri.startsWith('//');
}

function isAssetWithinRoot(uri: string, source: unknown, rootDirectory: string): boolean {
  const uriPath = uri.split(/[?#]/, 1)[0] ?? '';
  let decodedPath: string;
  try {
    decodedPath = decodeURIComponent(uriPath);
  } catch {
    return false;
  }
  const sourceDirectory = isString(source) ? dirname(resolve(source)) : resolve('.');
  const targetPath = resolve(sourceDirectory, decodedPath);
  const rootPath = resolve(rootDirectory);
  const pathFromRoot = relative(rootPath, targetPath);
  return (
    pathFromRoot === '' ||
    (!isAbsolute(pathFromRoot) && pathFromRoot !== '..' && !pathFromRoot.startsWith(`..${sep}`))
  );
}

/**
 * Valida las invariantes semánticas del IR sin modificar el documento.
 * La validación estructural completa contra JSON Schema es una puerta separada.
 */
export function validateIrDocument(
  input: unknown,
  options: IrValidationOptions = {},
): IrValidationResult {
  const diagnostics: IrValidationDiagnostic[] = [];
  const limits = { ...DEFAULT_LIMITS, ...options };
  const report = (code: string, message: string, path: string, source?: SourcePosition): void => {
    diagnostics.push({
      code,
      severity: 'error',
      message,
      path,
      ...(source ? { sourcePosition: source } : {}),
    });
  };

  if (!isRecord(input)) {
    report('IR_DOCUMENT_TYPE', 'El documento IR debe ser un objeto.', '$');
    return { valid: false, diagnostics };
  }

  if (input.irVersion !== '1.0.0') {
    report('IR_VERSION_UNSUPPORTED', 'La versión IR debe ser 1.0.0.', '$.irVersion');
  }

  const document = isRecord(input.document) ? input.document : undefined;
  if (!document) {
    report('IR_DOCUMENT_METADATA', 'Faltan los metadatos del documento.', '$.document');
  } else {
    checkId(document.id, '$.document.id', 'document');
  }

  const sheet = isRecord(input.sheet) ? input.sheet : undefined;
  if (!sheet) {
    report('IR_SHEET_REQUIRED', 'Falta la hoja del documento.', '$.sheet');
    return { valid: false, diagnostics };
  }

  const entityIds = new Map<string, string>();
  const topicIds = new Set<string>();
  const assetIds = new Set<string>();
  const styleSets = new Map<string, UnknownRecord>();

  function checkId(value: unknown, path: string, entity: string): value is string {
    if (!isString(value) || value.length === 0 || value.length > 128 || /\s/.test(value)) {
      report(
        'IR_ID_INVALID',
        `El ID de ${entity} debe tener entre 1 y 128 caracteres y no contener espacios.`,
        path,
      );
      return false;
    }
    return true;
  }

  function registerEntityId(value: unknown, path: string, entity: string): void {
    if (!checkId(value, path, entity)) return;
    const previous = entityIds.get(value);
    if (previous) {
      report(
        'IR_ID_DUPLICATE',
        `El ID "${value}" ya está asignado a ${previous}; no puede repetirse en ${entity}.`,
        path,
      );
    } else {
      entityIds.set(value, entity);
    }
  }

  registerEntityId(sheet.id, '$.sheet.id', 'la hoja');

  const rootTopic = isRecord(sheet.rootTopic) ? sheet.rootTopic : undefined;
  if (!rootTopic) {
    report('IR_ROOT_TOPIC_REQUIRED', 'La hoja debe contener un tema raíz.', '$.sheet.rootTopic');
    return { valid: false, diagnostics };
  }

  let topicCount = 0;
  let contentBlockCount = 0;

  const visitBlocks = (blocks: unknown, path: string, nesting: number): void => {
    if (!isArray(blocks)) {
      report('IR_CONTENT_ARRAY', 'El contenido debe ser una lista de bloques.', path);
      return;
    }
    for (let index = 0; index < blocks.length; index += 1) {
      const block = blocks[index];
      const blockPath = `${path}[${index}]`;
      if (nesting > limits.maxDepth) {
        report(
          'IR_CONTENT_DEPTH',
          `El contenido supera la profundidad máxima de ${limits.maxDepth}.`,
          blockPath,
        );
        return;
      }
      contentBlockCount += 1;
      if (contentBlockCount > limits.maxContentBlocks) {
        report(
          'IR_CONTENT_LIMIT',
          `El documento supera el límite de ${limits.maxContentBlocks} bloques.`,
          blockPath,
        );
        return;
      }
      if (!isRecord(block) || !isString(block.type)) {
        report('IR_BLOCK_INVALID', 'El bloque debe ser un objeto con type.', blockPath);
        continue;
      }
      switch (block.type) {
        case 'paragraph':
          if (!isArray(block.runs) || block.runs.length === 0) {
            report(
              'IR_PARAGRAPH_RUNS',
              'El párrafo debe contener al menos un run.',
              `${blockPath}.runs`,
            );
          } else {
            block.runs.forEach((run, runIndex) => {
              if (isRecord(run) && isString(run.link) && !validUriReference(run.link)) {
                report(
                  'IR_TEXT_LINK_URI',
                  'El enlace del texto no es una referencia URI válida.',
                  `${blockPath}.runs[${runIndex}].link`,
                );
              }
            });
          }
          break;
        case 'image':
          if (isString(block.assetId) && !assetIds.has(block.assetId)) {
            report(
              'IR_ASSET_REFERENCE',
              `La imagen referencia el asset inexistente "${block.assetId}".`,
              `${blockPath}.assetId`,
              sourcePosition(block),
            );
          }
          break;
        case 'quote':
          visitBlocks(block.blocks, `${blockPath}.blocks`, nesting + 1);
          break;
        case 'list':
          if (!isArray(block.items)) {
            report('IR_LIST_ITEMS', 'La lista debe contener items.', `${blockPath}.items`);
            break;
          }
          block.items.forEach((item, itemIndex) => {
            if (!isRecord(item)) {
              report(
                'IR_LIST_ITEM',
                'El elemento de lista debe ser un objeto.',
                `${blockPath}.items[${itemIndex}]`,
              );
            } else {
              visitBlocks(item.blocks, `${blockPath}.items[${itemIndex}].blocks`, nesting + 1);
            }
          });
          break;
        case 'table': {
          if (!isArray(block.rows) || block.rows.length === 0) {
            report(
              'IR_TABLE_ROWS',
              'La tabla debe contener al menos una fila.',
              `${blockPath}.rows`,
            );
            break;
          }
          let columnCount: number | undefined;
          block.rows.forEach((row, rowIndex) => {
            if (!isRecord(row) || !isArray(row.cells)) {
              report(
                'IR_TABLE_ROW',
                'La fila debe contener celdas.',
                `${blockPath}.rows[${rowIndex}]`,
              );
              return;
            }
            if (columnCount === undefined) columnCount = row.cells.length;
            if (row.cells.length !== columnCount) {
              report(
                'IR_TABLE_RECTANGULAR',
                'Todas las filas de la tabla deben tener el mismo número de columnas.',
                `${blockPath}.rows[${rowIndex}].cells`,
              );
            }
            row.cells.forEach((cell, cellIndex) => {
              if (!isRecord(cell)) {
                report(
                  'IR_TABLE_CELL',
                  'La celda debe ser un objeto.',
                  `${blockPath}.rows[${rowIndex}].cells[${cellIndex}]`,
                );
              } else {
                visitBlocks(
                  cell.blocks,
                  `${blockPath}.rows[${rowIndex}].cells[${cellIndex}].blocks`,
                  nesting + 1,
                );
              }
            });
          });
          if (
            isArray(block.alignments) &&
            columnCount !== undefined &&
            block.alignments.length !== columnCount
          ) {
            report(
              'IR_TABLE_ALIGNMENTS',
              'El número de alineaciones debe coincidir con el número de columnas.',
              `${blockPath}.alignments`,
              sourcePosition(block),
            );
          }
          break;
        }
        case 'code':
        case 'thematicBreak':
          break;
        default:
          report(
            'IR_BLOCK_TYPE',
            `Tipo de bloque no admitido: ${block.type}.`,
            `${blockPath}.type`,
          );
          break;
      }
    }
  };

  const visitTopic = (
    topic: UnknownRecord,
    path: string,
    depth: number,
    inheritedSetId?: string,
  ): void => {
    if (depth > limits.maxDepth) {
      report(
        'IR_TOPIC_DEPTH',
        `El árbol supera la profundidad máxima de ${limits.maxDepth}.`,
        path,
        sourcePosition(topic),
      );
      return;
    }
    topicCount += 1;
    if (topicCount > limits.maxTopics) {
      report('IR_TOPIC_LIMIT', `El documento supera el límite de ${limits.maxTopics} temas.`, path);
      return;
    }
    registerEntityId(topic.id, `${path}.id`, 'un tema');
    if (isString(topic.id)) topicIds.add(topic.id);

    if (isString(topic.hyperlink) && !validUriReference(topic.hyperlink)) {
      report(
        'IR_TOPIC_HYPERLINK_URI',
        'El hyperlink del tema no es una referencia URI válida.',
        `${path}.hyperlink`,
        sourcePosition(topic),
      );
    }
    const style = isRecord(topic.style) ? (topic.style as StyleReference) : undefined;
    const effectiveSetId = isString(style?.setId) ? style.setId : inheritedSetId;
    validateStyleReference(style, effectiveSetId, `${path}.style`, sourcePosition(topic));

    visitBlocks(topic.content, `${path}.content`, 0);
    if (topic.notes !== undefined) visitBlocks(topic.notes, `${path}.notes`, 0);

    if (!isArray(topic.children)) {
      report('IR_TOPIC_CHILDREN', 'children debe ser una lista.', `${path}.children`);
      return;
    }
    topic.children.forEach((child, index) => {
      if (!isRecord(child)) {
        report('IR_TOPIC_CHILD', 'El hijo debe ser un tema.', `${path}.children[${index}]`);
      } else {
        visitTopic(child, `${path}.children[${index}]`, depth + 1, effectiveSetId);
      }
    });
  };

  // Se recopilan los IDs de assets antes de recorrer los bloques de imagen.
  if (!isArray(input.assets)) {
    report('IR_ASSETS_ARRAY', 'assets debe ser una lista.', '$.assets');
  } else {
    if (input.assets.length > limits.maxAssets) {
      report(
        'IR_ASSET_LIMIT',
        `El documento supera el límite de ${limits.maxAssets} assets.`,
        '$.assets',
      );
    }
    input.assets.slice(0, limits.maxAssets).forEach((asset, index) => {
      const path = `$.assets[${index}]`;
      if (!isRecord(asset)) {
        report('IR_ASSET_INVALID', 'El asset debe ser un objeto.', path);
        return;
      }
      registerEntityId(asset.id, `${path}.id`, 'un asset');
      if (isString(asset.id)) assetIds.add(asset.id);
      if (!isString(asset.uri) || !validUriReference(asset.uri)) {
        report('IR_ASSET_URI', 'La URI del asset no es una referencia URI válida.', `${path}.uri`);
      } else if (options.assetRootDirectory && !isExternalUri(asset.uri)) {
        if (!isAssetWithinRoot(asset.uri, document?.source, options.assetRootDirectory)) {
          report(
            'IR_ASSET_PATH_ESCAPE',
            'La ruta del asset escapa del directorio permitido.',
            `${path}.uri`,
          );
        }
      }
    });
  }

  if (isArray(input.styleSets)) {
    input.styleSets.forEach((styleSet, index) => {
      const path = `$.styleSets[${index}]`;
      if (!isRecord(styleSet)) {
        report('IR_STYLE_SET_INVALID', 'El conjunto de estilos debe ser un objeto.', path);
        return;
      }
      if (checkId(styleSet.id, `${path}.id`, 'un conjunto de estilos')) {
        if (styleSets.has(styleSet.id)) {
          report(
            'IR_STYLE_SET_DUPLICATE',
            `El conjunto "${styleSet.id}" está duplicado.`,
            `${path}.id`,
          );
        } else {
          styleSets.set(styleSet.id, styleSet);
        }
      }
    });
  } else {
    report('IR_STYLE_SETS_ARRAY', 'styleSets debe ser una lista.', '$.styleSets');
  }

  const validateStyleReference = (
    style: StyleReference | undefined,
    inheritedSetId: string | undefined,
    path: string,
    source?: SourcePosition,
  ): void => {
    if (!style) return;
    const setId = style.setId ?? inheritedSetId;
    if (style.setId && !styleSets.has(style.setId)) {
      report(
        'IR_STYLE_SET_REFERENCE',
        `No existe el conjunto de estilos "${style.setId}".`,
        `${path}.setId`,
        source,
      );
    }
    if (style.styleId) {
      if (!setId) {
        report(
          'IR_STYLE_SET_REQUIRED',
          'styleId requiere un conjunto de estilos efectivo.',
          `${path}.styleId`,
          source,
        );
      } else {
        const set = styleSets.get(setId);
        const styles = set && isRecord(set.styles) ? set.styles : {};
        if (!Object.hasOwn(styles, style.styleId)) {
          report(
            'IR_STYLE_REFERENCE',
            `No existe el estilo "${style.styleId}" en "${setId}".`,
            `${path}.styleId`,
            source,
          );
        }
      }
    }
    if (style.role && setId) {
      const set = styleSets.get(setId);
      const roles = set && isRecord(set.roles) ? set.roles : {};
      if (!Object.hasOwn(roles, style.role)) {
        report(
          'IR_STYLE_ROLE_REFERENCE',
          `No existe el rol "${style.role}" en "${setId}".`,
          `${path}.role`,
          source,
        );
      }
    }
  };

  const defaultStyleSetId = isString(sheet.defaultStyleSetId) ? sheet.defaultStyleSetId : undefined;

  visitTopic(rootTopic, '$.sheet.rootTopic', 1, defaultStyleSetId);

  if (defaultStyleSetId && !styleSets.has(defaultStyleSetId)) {
    report(
      'IR_DEFAULT_STYLE_SET_REFERENCE',
      `No existe el conjunto de estilos predeterminado "${defaultStyleSetId}".`,
      '$.sheet.defaultStyleSetId',
    );
  }

  const relationships = isArray(sheet.relationships) ? sheet.relationships : [];
  if (!isArray(sheet.relationships)) {
    report('IR_RELATIONSHIPS_ARRAY', 'relationships debe ser una lista.', '$.sheet.relationships');
  }
  relationships.forEach((relationship, index) => {
    const path = `$.sheet.relationships[${index}]`;
    if (!isRecord(relationship)) {
      report('IR_RELATIONSHIP_INVALID', 'La relación debe ser un objeto.', path);
      return;
    }
    registerEntityId(relationship.id, `${path}.id`, 'una relación');
    if (isString(relationship.sourceTopicId) && !topicIds.has(relationship.sourceTopicId)) {
      report(
        'IR_RELATIONSHIP_SOURCE',
        `No existe el tema origen "${relationship.sourceTopicId}".`,
        `${path}.sourceTopicId`,
        sourcePosition(relationship),
      );
    }
    if (isString(relationship.targetTopicId) && !topicIds.has(relationship.targetTopicId)) {
      report(
        'IR_RELATIONSHIP_TARGET',
        `No existe el tema destino "${relationship.targetTopicId}".`,
        `${path}.targetTopicId`,
        sourcePosition(relationship),
      );
    }
    if (relationship.sourceTopicId === relationship.targetTopicId) {
      report(
        'IR_RELATIONSHIP_SELF',
        'Una relación no puede conectar un tema consigo mismo.',
        path,
        sourcePosition(relationship),
      );
    }
    validateStyleReference(
      isRecord(relationship.style) ? (relationship.style as StyleReference) : undefined,
      defaultStyleSetId,
      `${path}.style`,
      sourcePosition(relationship),
    );
  });

  const validateTopicGroups = (key: 'boundaries' | 'summaries'): void => {
    const groups = sheet[key];
    if (!isArray(groups)) {
      report(`IR_${key.toUpperCase()}_ARRAY`, `${key} debe ser una lista.`, `$.sheet.${key}`);
      return;
    }
    groups.forEach((group, index) => {
      const path = `$.sheet.${key}[${index}]`;
      if (!isRecord(group)) {
        report(`IR_${key.toUpperCase()}_INVALID`, `El elemento debe ser un objeto.`, path);
        return;
      }
      registerEntityId(group.id, `${path}.id`, key === 'boundaries' ? 'un boundary' : 'un summary');
      if (!isArray(group.topicIds) || group.topicIds.length === 0) {
        report(
          'IR_TOPIC_GROUP_EMPTY',
          'El grupo debe referenciar al menos un tema.',
          `${path}.topicIds`,
        );
      } else {
        const seen = new Set<string>();
        group.topicIds.forEach((topicId, topicIndex) => {
          if (isString(topicId) && !topicIds.has(topicId)) {
            report(
              'IR_TOPIC_GROUP_REFERENCE',
              `No existe el tema "${topicId}".`,
              `${path}.topicIds[${topicIndex}]`,
            );
          }
          if (isString(topicId) && seen.has(topicId)) {
            report(
              'IR_TOPIC_GROUP_DUPLICATE',
              `El tema "${topicId}" está repetido en el grupo.`,
              `${path}.topicIds[${topicIndex}]`,
            );
          }
          if (isString(topicId)) seen.add(topicId);
        });
      }
      validateStyleReference(
        isRecord(group.style) ? (group.style as StyleReference) : undefined,
        defaultStyleSetId,
        `${path}.style`,
      );
    });
  };

  validateTopicGroups('boundaries');
  validateTopicGroups('summaries');

  for (const [id, styleSet] of styleSets) {
    if (isString(styleSet.extends) && !styleSets.has(styleSet.extends)) {
      report(
        'IR_STYLE_SET_PARENT',
        `El conjunto "${id}" extiende un conjunto inexistente "${styleSet.extends}".`,
        `$.styleSets[${id}].extends`,
      );
    }
    const visited = new Set<string>();
    let current: string | undefined = id;
    while (current) {
      if (visited.has(current)) {
        report(
          'IR_STYLE_SET_CYCLE',
          `Se ha detectado un ciclo de herencia que incluye "${current}".`,
          `$.styleSets[${id}].extends`,
        );
        break;
      }
      visited.add(current);
      const parent = styleSets.get(current)?.extends;
      current = isString(parent) ? parent : undefined;
    }
  }

  return { valid: diagnostics.length === 0, diagnostics };
}
