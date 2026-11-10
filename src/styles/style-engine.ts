import type {
  Boundary,
  ContentBlock,
  IrDocument,
  JsonValue,
  Relationship,
  StyleReference,
  Summary,
  TextRun,
  Topic,
} from '../../spec/ir-v1.types.js';

import {
  getSystemStyleDefaults,
  isStylePropertyApplicable,
  STYLE_PROPERTY_CATALOG,
  type StyleElementType,
  validateStyleProperty,
} from './catalog.js';

export type StyleLayer =
  | 'system'
  | 'map'
  | 'styleSet'
  | 'role'
  | 'namedStyle'
  | 'override'
  | 'topic'
  | 'inline';

export interface StyleProvenance {
  layer: StyleLayer;
  sourceId: string;
}

export interface ResolvedStyle {
  elementId: string;
  elementType: StyleElementType;
  values: Record<string, JsonValue>;
  provenance: Record<string, StyleProvenance>;
}

export interface StyleResolutionDiagnostic {
  code: string;
  message: string;
  path: string;
  elementId: string;
  property?: string;
}

export interface StyleResolutionResult {
  styles: ResolvedStyle[];
  diagnostics: StyleResolutionDiagnostic[];
}

type StyleProperties = Record<string, JsonValue>;

interface LayerInput {
  layer: StyleLayer;
  sourceId: string;
  properties: StyleProperties | undefined;
  path: string;
  provenance?: Record<string, StyleProvenance>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isJsonValue(value: unknown): value is JsonValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(isJsonValue);
  return isRecord(value) && Object.values(value).every(isJsonValue);
}

function cloneValue(value: JsonValue): JsonValue {
  if (Array.isArray(value)) return value.map(cloneValue);
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, cloneValue(nested as JsonValue)]),
    );
  }
  return value;
}

function mergeValue(base: JsonValue | undefined, next: JsonValue): JsonValue {
  if (isRecord(base) && isRecord(next)) {
    const merged: Record<string, JsonValue> = {};
    for (const [key, value] of Object.entries(base)) merged[key] = cloneValue(value as JsonValue);
    for (const [key, value] of Object.entries(next)) {
      merged[key] = mergeValue(merged[key], value as JsonValue);
    }
    return merged;
  }
  return cloneValue(next);
}

function mergeProvenance(
  target: Record<string, StyleProvenance>,
  value: JsonValue,
  path: string,
  provenance: StyleProvenance,
): void {
  if (isRecord(value)) {
    for (const [key, nested] of Object.entries(value)) {
      mergeProvenance(target, nested as JsonValue, path ? `${path}.${key}` : key, provenance);
    }
  } else {
    target[path] = provenance;
  }
}

function filterApplicable(
  properties: Record<string, unknown>,
  elementType: StyleElementType,
): StyleProperties {
  const result: StyleProperties = {};
  for (const [key, value] of Object.entries(properties)) {
    if (isStylePropertyApplicable(key, elementType)) {
      result[key] = value as JsonValue;
    }
  }
  return result;
}

export function resolveIrStyles(ir: IrDocument): StyleResolutionResult {
  const styles: ResolvedStyle[] = [];
  const diagnostics: StyleResolutionDiagnostic[] = [];
  const styleSets = new Map(ir.styleSets.map((styleSet) => [styleSet.id, styleSet]));
  const mapDefaultsRoot = ir.sheet.settings?.styleDefaults;
  const mapDefaults = isRecord(mapDefaultsRoot) ? mapDefaultsRoot : {};
  const systemStyleDefaults = (elementType: StyleElementType): StyleProperties =>
    getSystemStyleDefaults(elementType);

  ir.styleSets.forEach((styleSet) => {
    for (const key of Object.keys(styleSet.defaults ?? {})) {
      if (!Object.hasOwn(STYLE_PROPERTY_CATALOG, key)) {
        addDiagnostic(
          'STYLE_PROPERTY_UNKNOWN',
          `La propiedad "${key}" no pertenece al catálogo de estilos v1.`,
          `$.styleSets[${styleSet.id}].defaults.${key}`,
          styleSet.id,
          key,
        );
      }
    }
  });

  const addDiagnostic = (
    code: string,
    message: string,
    path: string,
    elementId: string,
    property?: string,
  ): void => {
    diagnostics.push({ code, message, path, elementId, ...(property ? { property } : {}) });
  };

  const applyLayers = (
    elementId: string,
    elementType: StyleElementType,
    layers: LayerInput[],
  ): ResolvedStyle => {
    const values = systemStyleDefaults(elementType);
    const provenance: Record<string, StyleProvenance> = {};
    for (const [key, value] of Object.entries(values)) {
      mergeProvenance(provenance, value, key, { layer: 'system', sourceId: 'system-defaults' });
    }

    for (const input of layers) {
      if (!input.properties) continue;
      for (const [key, value] of Object.entries(input.properties)) {
        const propertyPath = input.path ? `${input.path}.${key}` : key;
        if (!isJsonValue(value)) {
          addDiagnostic('STYLE_VALUE_NOT_JSON', 'El valor de estilo no es JSON válido.', propertyPath, elementId, key);
          continue;
        }
        if (value === null) {
          const definition = STYLE_PROPERTY_CATALOG[key as keyof typeof STYLE_PROPERTY_CATALOG];
          if (!definition) {
            addDiagnostic('STYLE_PROPERTY_UNKNOWN', 'La propiedad no pertenece al catálogo v1.', propertyPath, elementId, key);
            continue;
          }
          if (!isStylePropertyApplicable(key, elementType)) {
            addDiagnostic('STYLE_PROPERTY_NOT_APPLICABLE', `La propiedad no es aplicable a "${elementType}".`, propertyPath, elementId, key);
            continue;
          }
          values[key] = cloneValue(definition.defaultValue);
          provenance[key] = { layer: 'system', sourceId: `reset-by:${input.sourceId}` };
          continue;
        }
        const error = validateStyleProperty(elementType, key, value);
        if (error) {
          const code = error.startsWith('La propiedad no pertenece')
            ? 'STYLE_PROPERTY_UNKNOWN'
            : error.startsWith('La propiedad no es aplicable')
              ? 'STYLE_PROPERTY_NOT_APPLICABLE'
              : 'STYLE_PROPERTY_INVALID';
          addDiagnostic(code, error, propertyPath, elementId, key);
          continue;
        }
        values[key] = mergeValue(values[key], value);
        mergeProvenance(provenance, value, key, { layer: input.layer, sourceId: input.sourceId });
        if (input.provenance) {
          for (const [propertyPath, source] of Object.entries(input.provenance)) {
            if (propertyPath === key || propertyPath.startsWith(`${key}.`)) {
              provenance[propertyPath] = source;
            }
          }
        }
      }
    }
    const result = { elementId, elementType, values, provenance };
    styles.push(result);
    return result;
  };

  const resolveSetLayers = (
    elementId: string,
    elementType: StyleElementType,
    setId: string | undefined,
    reference: StyleReference | undefined,
    path: string,
  ): LayerInput[] => {
    const layers: LayerInput[] = [];
    const mapProperties = mapDefaults[elementType];
    layers.push({
      layer: 'map',
      sourceId: 'sheet.settings.styleDefaults',
      properties: isRecord(mapProperties) ? (mapProperties as StyleProperties) : undefined,
      path: `$.sheet.settings.styleDefaults.${elementType}`,
    });
    if (!setId) return layers;

    const chain: Array<(typeof ir.styleSets)[number]> = [];
    const visited = new Set<string>();
    let current: string | undefined = setId;
    while (current && !visited.has(current)) {
      visited.add(current);
      const currentSet = styleSets.get(current);
      if (!currentSet) break;
      chain.unshift(currentSet);
      current = currentSet.extends;
    }
    if (chain.length === 0 || chain[chain.length - 1]?.id !== setId) {
      addDiagnostic('STYLE_SET_NOT_FOUND', `No existe el conjunto "${setId}".`, path, elementId);
      return layers;
    }

    for (const inherited of chain) {
      layers.push({
        layer: 'styleSet',
        sourceId: inherited.id,
        properties: inherited.defaults ? filterApplicable(inherited.defaults, elementType) : undefined,
        path: `$.styleSets[${inherited.id}].defaults`,
      });
    }
    if (reference?.role) {
      for (const inherited of chain) {
        const role = inherited.roles?.[reference.role];
        if (role) {
          layers.push({
            layer: 'role',
            sourceId: `${inherited.id}:${reference.role}`,
            properties: role,
            path: `$.styleSets[${inherited.id}].roles.${reference.role}`,
          });
        }
      }
    }
    if (reference?.styleId) {
      for (const inherited of chain) {
        const named = inherited.styles?.[reference.styleId];
        if (named) {
          layers.push({
            layer: 'namedStyle',
            sourceId: `${inherited.id}:${reference.styleId}`,
            properties: named,
            path: `$.styleSets[${inherited.id}].styles.${reference.styleId}`,
          });
        }
      }
    }
    return layers;
  };

  const resolveElement = (
    elementId: string,
    elementType: StyleElementType,
    reference: StyleReference | undefined,
    inheritedSetId: string | undefined,
    path: string,
  ): { style: ResolvedStyle; effectiveSetId: string | undefined } => {
    const effectiveSetId = reference?.setId ?? inheritedSetId ?? ir.sheet.defaultStyleSetId;
    const layers = resolveSetLayers(elementId, elementType, effectiveSetId, reference, path);
    if (reference?.overrides) {
      layers.push({ layer: 'override', sourceId: elementId, properties: reference.overrides, path: `${path}.overrides` });
    }
    return { style: applyLayers(elementId, elementType, layers), effectiveSetId };
  };

  const resolveTopicContent = (
    topic: Topic,
    topicStyle: ResolvedStyle,
    setId: string | undefined,
    blocks: ContentBlock[],
    path: string,
  ): void => {
    const visitBlock = (block: ContentBlock, blockPath: string): void => {
      if (block.type === 'paragraph') {
        block.runs.forEach((run: TextRun, index) => {
          const runPath = `${blockPath}.runs[${index}]`;
          const inherited = filterApplicable(topicStyle.values, 'textRun');
          const inheritedProvenance = Object.fromEntries(
            Object.entries(topicStyle.provenance).filter(([key]) => Object.hasOwn(inherited, key)),
          );
          const runLayers = resolveSetLayers(
            `${topic.id}:run:${index}`,
            'textRun',
            setId,
            undefined,
            `${runPath}.style`,
          );
          runLayers.push({
            layer: 'topic',
            sourceId: topic.id,
            properties: inherited,
            path: `${path}.topicStyle`,
            provenance: inheritedProvenance,
          });
          if (run.style) {
            runLayers.push({
              layer: 'inline',
              sourceId: `${topic.id}:run:${index}`,
              properties: run.style,
              path: `${runPath}.style`,
            });
          }
          applyLayers(`${topic.id}:run:${index}`, 'textRun', runLayers);
        });
      } else if (block.type === 'list') {
        block.items.forEach((item, itemIndex) => item.blocks.forEach((child, childIndex) => visitBlock(child, `${blockPath}.items[${itemIndex}].blocks[${childIndex}]`)));
      } else if (block.type === 'table') {
        block.rows.forEach((row, rowIndex) => row.cells.forEach((cell, cellIndex) => cell.blocks.forEach((child, childIndex) => visitBlock(child, `${blockPath}.rows[${rowIndex}].cells[${cellIndex}].blocks[${childIndex}]`))));
      } else if (block.type === 'quote') {
        block.blocks.forEach((child, childIndex) => visitBlock(child, `${blockPath}.blocks[${childIndex}]`));
      }
    };
    blocks.forEach((block, index) => visitBlock(block, `${path}[${index}]`));
  };

  const visitTopic = (topic: Topic, path: string, inheritedSetId: string | undefined): void => {
    const { style, effectiveSetId } = resolveElement(topic.id, 'topic', topic.style, inheritedSetId, `${path}.style`);
    resolveTopicContent(topic, style, effectiveSetId, topic.content, `${path}.content`);
    if (topic.notes) resolveTopicContent(topic, style, effectiveSetId, topic.notes, `${path}.notes`);
    topic.children.forEach((child, index) => visitTopic(child, `${path}.children[${index}]`, effectiveSetId));
  };

  const rootSetId = ir.sheet.defaultStyleSetId;
  const mapSetLayers = resolveSetLayers(ir.sheet.id, 'map', rootSetId, undefined, '$.sheet.defaultStyleSetId');
  applyLayers(ir.sheet.id, 'map', mapSetLayers);
  visitTopic(ir.sheet.rootTopic, '$.sheet.rootTopic', rootSetId);

  const resolveStyledList = <T extends Relationship | Boundary | Summary>(
    items: T[],
    elementType: 'relationship' | 'boundary' | 'summary',
    path: string,
  ): void => {
    items.forEach((item, index) => {
      resolveElement(item.id, elementType, item.style, rootSetId, `${path}[${index}].style`);
    });
  };
  resolveStyledList(ir.sheet.relationships, 'relationship', '$.sheet.relationships');
  resolveStyledList(ir.sheet.boundaries, 'boundary', '$.sheet.boundaries');
  resolveStyledList(ir.sheet.summaries, 'summary', '$.sheet.summaries');

  return { styles, diagnostics };
}
