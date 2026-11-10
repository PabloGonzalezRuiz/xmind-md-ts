import type { JsonValue } from '../../spec/ir-v1.types.js';

export type StyleElementType =
  'map' | 'topic' | 'relationship' | 'boundary' | 'summary' | 'textRun';

export type StylePropertyKind =
  'color' | 'length' | 'number' | 'string' | 'boolean' | 'enum' | 'object';

export interface StylePropertyDefinition {
  kind: StylePropertyKind;
  elements: readonly StyleElementType[];
  defaultValue: JsonValue;
  min?: number;
  max?: number;
  enumValues?: readonly string[];
}

const ALL_TEXT: readonly StyleElementType[] = ['topic', 'textRun'];
const SHAPES: readonly StyleElementType[] = ['topic'];
const LINES: readonly StyleElementType[] = ['relationship', 'boundary', 'summary'];

export const STYLE_PROPERTY_CATALOG = {
  backgroundColor: {
    kind: 'color',
    elements: ['map', 'topic', 'boundary', 'textRun'],
    defaultValue: '#FFFFFF',
  },
  color: {
    kind: 'color',
    elements: ['topic', 'relationship', 'boundary', 'summary', 'textRun'],
    defaultValue: '#1F2937',
  },
  fill: {
    kind: 'color',
    elements: ['topic', 'boundary'],
    defaultValue: '#FFFFFF',
  },
  stroke: {
    kind: 'color',
    elements: ['topic', 'relationship', 'boundary', 'summary'],
    defaultValue: '#64748B',
  },
  fontFamily: {
    kind: 'string',
    elements: ALL_TEXT,
    defaultValue: 'sans-serif',
  },
  fontSize: {
    kind: 'length',
    elements: ALL_TEXT,
    defaultValue: 14,
    min: 1,
    max: 256,
  },
  fontWeight: {
    kind: 'enum',
    elements: ALL_TEXT,
    defaultValue: 'normal',
    enumValues: ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
  },
  fontStyle: {
    kind: 'enum',
    elements: ALL_TEXT,
    defaultValue: 'normal',
    enumValues: ['normal', 'italic', 'oblique'],
  },
  textDecoration: {
    kind: 'enum',
    elements: ALL_TEXT,
    defaultValue: 'none',
    enumValues: ['none', 'underline', 'line-through'],
  },
  textAlign: {
    kind: 'enum',
    elements: ['topic', 'textRun'],
    defaultValue: 'center',
    enumValues: ['left', 'center', 'right'],
  },
  opacity: {
    kind: 'number',
    elements: ['map', 'topic', 'boundary'],
    defaultValue: 1,
    min: 0,
    max: 1,
  },
  strokeWidth: {
    kind: 'number',
    elements: ['topic', 'relationship', 'boundary', 'summary'],
    defaultValue: 1,
    min: 0,
    max: 32,
  },
  lineStyle: {
    kind: 'enum',
    elements: LINES,
    defaultValue: 'solid',
    enumValues: ['solid', 'dashed', 'dotted'],
  },
  arrowStart: {
    kind: 'boolean',
    elements: ['relationship'],
    defaultValue: false,
  },
  arrowEnd: {
    kind: 'boolean',
    elements: ['relationship'],
    defaultValue: true,
  },
  shape: {
    kind: 'enum',
    elements: SHAPES,
    defaultValue: 'rounded-rectangle',
    enumValues: ['rectangle', 'rounded-rectangle', 'ellipse', 'diamond'],
  },
  padding: {
    kind: 'length',
    elements: ['topic'],
    defaultValue: 8,
    min: 0,
    max: 256,
  },
  borderRadius: {
    kind: 'length',
    elements: ['topic', 'boundary'],
    defaultValue: 6,
    min: 0,
    max: 256,
  },
  shadow: {
    kind: 'object',
    elements: ['topic', 'boundary'],
    defaultValue: {
      enabled: false,
      color: '#00000033',
      offset: { x: 0, y: 2 },
      blur: 4,
    },
  },
} as const satisfies Record<string, StylePropertyDefinition>;

export type StylePropertyName = keyof typeof STYLE_PROPERTY_CATALOG;

const COLOR_PATTERN =
  /^(#[0-9a-f]{3,4}|#[0-9a-f]{6}|#[0-9a-f]{8}|transparent|currentColor|[a-z]+|rgba?\([0-9\s.,%]+\)|hsla?\([0-9\s.,%deg]+\))$/i;
const LENGTH_PATTERN = /^-?(?:[0-9]+\.?[0-9]*|\.[0-9]+)(?:px|pt|em|rem|%)?$/i;

export function isStylePropertyApplicable(name: string, elementType: StyleElementType): boolean {
  const definition = STYLE_PROPERTY_CATALOG[name as StylePropertyName] as
    StylePropertyDefinition | undefined;
  return definition?.elements.includes(elementType) ?? false;
}

export function getSystemStyleDefaults(elementType: StyleElementType): Record<string, JsonValue> {
  return Object.fromEntries(
    (Object.entries(STYLE_PROPERTY_CATALOG) as Array<[string, StylePropertyDefinition]>)
      .filter(([, definition]) => definition.elements.includes(elementType))
      .map(([name, definition]) => [name, definition.defaultValue]),
  );
}

export function validateStyleProperty(
  elementType: StyleElementType,
  name: string,
  value: JsonValue,
): string | undefined {
  const definition = STYLE_PROPERTY_CATALOG[name as StylePropertyName] as
    StylePropertyDefinition | undefined;
  if (!definition) return 'La propiedad no pertenece al catálogo de estilos v1.';
  if (!definition.elements.includes(elementType)) {
    return `La propiedad no es aplicable al elemento "${elementType}".`;
  }

  switch (definition.kind) {
    case 'color':
      return typeof value === 'string' && COLOR_PATTERN.test(value)
        ? undefined
        : 'Se esperaba un color CSS admitido.';
    case 'length': {
      const valid =
        typeof value === 'number'
          ? Number.isFinite(value) &&
            value >= (definition.min ?? -Infinity) &&
            value <= (definition.max ?? Infinity)
          : typeof value === 'string' &&
            LENGTH_PATTERN.test(value) &&
            Number.isFinite(Number.parseFloat(value)) &&
            Number.parseFloat(value) >= (definition.min ?? -Infinity) &&
            Number.parseFloat(value) <= (definition.max ?? Infinity);
      return valid ? undefined : 'Se esperaba una longitud dentro del rango permitido.';
    }
    case 'number':
      return typeof value === 'number' &&
        Number.isFinite(value) &&
        value >= (definition.min ?? -Infinity) &&
        value <= (definition.max ?? Infinity)
        ? undefined
        : 'Se esperaba un número dentro del rango permitido.';
    case 'string':
      return typeof value === 'string' && value.trim().length > 0
        ? undefined
        : 'Se esperaba una cadena no vacía.';
    case 'boolean':
      return typeof value === 'boolean' ? undefined : 'Se esperaba un booleano.';
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value)
        ? undefined
        : 'Se esperaba un objeto JSON.';
    case 'enum':
      return (typeof value === 'string' || typeof value === 'number') &&
        definition.enumValues?.includes(String(value))
        ? undefined
        : `Valor no permitido. Valores admitidos: ${definition.enumValues?.join(', ')}.`;
  }
}
