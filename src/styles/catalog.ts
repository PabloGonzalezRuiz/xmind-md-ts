import type { JsonValue } from '../../spec/ir-v1.types.js';

export type StyleElementType =
  'map' | 'topic' | 'relationship' | 'boundary' | 'summary' | 'textRun';

export type StylePropertyKind =
  'color' | 'length' | 'number' | 'string' | 'boolean' | 'enum' | 'object' | 'numberList';

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
  dashArray: {
    kind: 'numberList',
    elements: LINES,
    defaultValue: [],
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

function cloneJsonValue(value: JsonValue): JsonValue {
  if (Array.isArray(value)) return value.map(cloneJsonValue);
  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, cloneJsonValue(nested)]),
    );
  }
  return value;
}

const CSS_NAMED_COLORS = new Set(
  (
    'aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen'
  ).split(/\s+/),
);
const HEX_COLOR_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const LENGTH_PATTERN = /^-?(?:[0-9]+\.?[0-9]*|\.[0-9]+)(?:px|pt|em|rem|%)?$/i;

function isValidCssColor(value: string): boolean {
  const color = value.trim();
  if (HEX_COLOR_PATTERN.test(color)) return true;
  if (/^(transparent|currentcolor)$/i.test(color) || CSS_NAMED_COLORS.has(color.toLowerCase())) {
    return true;
  }

  const rgb = color.match(/^rgba?\(\s*([+-]?[\d.]+%?)\s*,\s*([+-]?[\d.]+%?)\s*,\s*([+-]?[\d.]+%?)(?:\s*,\s*([+-]?[\d.]+%?))?\s*\)$/i);
  if (rgb) {
    const channels = rgb.slice(1, 4);
    const percent = channels.every((channel) => channel.endsWith('%'));
    const mixedUnits = channels.some((channel) => channel.endsWith('%')) && !percent;
    if (mixedUnits) return false;
    const max = percent ? 100 : 255;
    if (channels.some((channel) => !Number.isFinite(Number.parseFloat(channel)) || Number.parseFloat(channel) < 0 || Number.parseFloat(channel) > max)) return false;
    const alpha = rgb[4];
    return alpha === undefined || isValidAlpha(alpha);
  }

  const hsl = color.match(/^hsla?\(\s*([+-]?[\d.]+)(?:deg)?\s*,\s*([+-]?[\d.]+)%\s*,\s*([+-]?[\d.]+)%(?:\s*,\s*([+-]?[\d.]+%?))?\s*\)$/i);
  if (hsl) {
    const hue = Number.parseFloat(hsl[1]!);
    const saturation = Number.parseFloat(hsl[2]!);
    const lightness = Number.parseFloat(hsl[3]!);
    return Number.isFinite(hue) && saturation >= 0 && saturation <= 100 &&
      lightness >= 0 && lightness <= 100 &&
      (hsl[4] === undefined || isValidAlpha(hsl[4]));
  }
  return false;
}

function isValidAlpha(value: string): boolean {
  const percentage = value.endsWith('%');
  const alpha = Number.parseFloat(value);
  return Number.isFinite(alpha) && alpha >= 0 && alpha <= (percentage ? 100 : 1);
}

function validateShadow(value: unknown): string | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return 'Se esperaba un objeto JSON para shadow.';
  }
  const shadow = value as Record<string, unknown>;
  const allowed = new Set(['enabled', 'color', 'offset', 'blur']);
  const unknown = Object.keys(shadow).find((key) => !allowed.has(key));
  if (unknown) return `La clave de shadow "${unknown}" no está admitida.`;
  if (shadow.enabled !== undefined && typeof shadow.enabled !== 'boolean') {
    return 'shadow.enabled debe ser booleano.';
  }
  if (shadow.color !== undefined && (typeof shadow.color !== 'string' || !isValidCssColor(shadow.color))) {
    return 'shadow.color debe ser un color CSS válido.';
  }
  if (shadow.blur !== undefined && (typeof shadow.blur !== 'number' || !Number.isFinite(shadow.blur) || shadow.blur < 0)) {
    return 'shadow.blur debe ser un número no negativo.';
  }
  if (shadow.offset !== undefined) {
    if (typeof shadow.offset !== 'object' || shadow.offset === null || Array.isArray(shadow.offset)) {
      return 'shadow.offset debe ser un objeto con coordenadas x e y.';
    }
    const offset = shadow.offset as Record<string, unknown>;
    if (Object.keys(offset).some((key) => key !== 'x' && key !== 'y')) {
      return 'shadow.offset solo admite las claves x e y.';
    }
    if (['x', 'y'].some((key) => offset[key] !== undefined &&
      (typeof offset[key] !== 'number' || !Number.isFinite(offset[key])))) {
      return 'shadow.offset.x e shadow.offset.y deben ser números finitos.';
    }
  }
  return undefined;
}

export function isStylePropertyApplicable(name: string, elementType: StyleElementType): boolean {
  const definition = STYLE_PROPERTY_CATALOG[name as StylePropertyName] as
    StylePropertyDefinition | undefined;
  return definition?.elements.includes(elementType) ?? false;
}

export function getSystemStyleDefaults(elementType: StyleElementType): Record<string, JsonValue> {
  return Object.fromEntries(
    (Object.entries(STYLE_PROPERTY_CATALOG) as Array<[string, StylePropertyDefinition]>)
      .filter(([, definition]) => definition.elements.includes(elementType))
      .map(([name, definition]) => [name, cloneJsonValue(definition.defaultValue)]),
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
      return typeof value === 'string' && isValidCssColor(value)
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
      return name === 'shadow'
        ? validateShadow(value)
        : typeof value === 'object' && value !== null && !Array.isArray(value)
          ? undefined
          : 'Se esperaba un objeto JSON.';
    case 'numberList':
      return Array.isArray(value) &&
        value.every((item) => typeof item === 'number' && Number.isFinite(item) && item >= 0)
        ? undefined
        : 'Se esperaba una lista de números no negativos.';
    case 'enum':
      return (typeof value === 'string' || typeof value === 'number') &&
        definition.enumValues?.includes(String(value))
        ? undefined
        : `Valor no permitido. Valores admitidos: ${definition.enumValues?.join(', ')}.`;
  }
}
