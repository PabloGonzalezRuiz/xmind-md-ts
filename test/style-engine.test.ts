import { describe, expect, it } from 'vitest';

import type { IrDocument } from '../spec/ir-v1.types.js';
import { resolveIrStyles } from '../src/styles/style-engine.js';

function createIr(): IrDocument {
  return {
    irVersion: '1.0.0',
    document: { id: 'doc:styles' },
    sheet: {
      id: 'sheet:styles',
      title: 'Styles',
      defaultStyleSetId: 'theme:child',
      settings: {
        styleDefaults: {
          map: { backgroundColor: '#F8FAFC' },
          topic: { color: '#111111' },
          textRun: { color: '#222222' },
        },
      },
      rootTopic: {
        id: 'topic:root',
        title: 'Root',
        style: { role: 'primary', styleId: 'focus', overrides: { color: '#888888' } },
        content: [
          {
            type: 'paragraph',
            runs: [{ text: 'Styled text', style: { color: '#999999' } }],
          },
        ],
        children: [
          {
            id: 'topic:child',
            title: 'Child',
            content: [],
            children: [],
          },
        ],
      },
      relationships: [
        {
          id: 'rel:one',
          sourceTopicId: 'topic:root',
          targetTopicId: 'topic:child',
          style: { role: 'connection' },
        },
      ],
      boundaries: [{ id: 'boundary:one', topicIds: ['topic:root'], style: { role: 'group' } }],
      summaries: [],
    },
    assets: [],
    styleSets: [
      {
        id: 'theme:base',
        defaults: { color: '#333333', fontSize: 16 },
        roles: {
          primary: { color: '#444444' },
          connection: { stroke: '#555555' },
          group: { fill: '#EEEEEE' },
        },
        styles: { focus: { color: '#666666' } },
      },
      {
        id: 'theme:child',
        extends: 'theme:base',
        defaults: { color: '#777777' },
        roles: { primary: { color: '#AAAAAA' } },
        styles: { focus: { color: '#BBBBBB' } },
      },
    ],
  };
}

function styleFor(
  result: ReturnType<typeof resolveIrStyles>,
  elementId: string,
): NonNullable<ReturnType<typeof resolveIrStyles>['styles'][number]> {
  const found = result.styles.find((style) => style.elementId === elementId);
  if (!found) throw new Error(`Style not found: ${elementId}`);
  return found;
}

describe('style resolution engine', () => {
  it('applies map, inherited set, role, named style and local override precedence', () => {
    const result = resolveIrStyles(createIr());
    const root = styleFor(result, 'topic:root');

    expect(root.values.color).toBe('#888888');
    expect(root.values.fontSize).toBe(16);
    expect(root.provenance.color).toEqual({ layer: 'override', sourceId: 'topic:root' });
    expect(result.diagnostics).toEqual([]);
  });

  it('propagates the effective style-set context to child topics', () => {
    const result = resolveIrStyles(createIr());
    const child = styleFor(result, 'topic:child');

    expect(child.values.color).toBe('#777777');
    expect(child.provenance.color).toEqual({ layer: 'styleSet', sourceId: 'theme:child' });
  });

  it('resolves text runs after topic styles and preserves inline provenance', () => {
    const result = resolveIrStyles(createIr());
    const run = styleFor(result, 'topic:root:run:0');

    expect(run.values.color).toBe('#999999');
    expect(run.values.fontSize).toBe(16);
    expect(run.provenance.color).toEqual({ layer: 'inline', sourceId: 'topic:root:run:0' });
    expect(run.provenance.fontSize).toEqual({ layer: 'styleSet', sourceId: 'theme:base' });
  });

  it('resolves relationship, boundary and map styles', () => {
    const result = resolveIrStyles(createIr());

    expect(styleFor(result, 'rel:one').values.stroke).toBe('#555555');
    expect(styleFor(result, 'boundary:one').values.fill).toBe('#EEEEEE');
    expect(styleFor(result, 'sheet:styles').values.backgroundColor).toBe('#F8FAFC');
  });

  it('resets null values to system defaults', () => {
    const ir = createIr();
    ir.sheet.rootTopic.style = { overrides: { color: null } };

    const result = resolveIrStyles(ir);
    const root = styleFor(result, 'topic:root');

    expect(root.values.color).toBe('#1F2937');
    expect(root.provenance.color).toEqual({
      layer: 'system',
      sourceId: 'reset-by:topic:root',
    });
  });

  it('recursively merges object properties without mutating the IR', () => {
    const ir = createIr();
    ir.styleSets[0]!.defaults = {
      ...ir.styleSets[0]!.defaults,
      shadow: { enabled: true, offset: { x: 3 }, blur: 8 },
    };
    const before = JSON.stringify(ir);

    const result = resolveIrStyles(ir);
    const root = styleFor(result, 'topic:root');
    const shadow = root.values.shadow as { enabled: boolean; offset: { x: number; y: number }; blur: number };

    expect(shadow).toEqual({
      enabled: true,
      color: '#00000033',
      offset: { x: 3, y: 2 },
      blur: 8,
    });
    expect(JSON.stringify(ir)).toBe(before);
  });

  it('reports unknown, incompatible and invalid style properties', () => {
    const ir = createIr();
    ir.sheet.rootTopic.style = {
      overrides: {
        imaginaryProperty: 'x',
        stroke: 'red',
        fontSize: -10,
        shape: 'star',
      },
    };

    const result = resolveIrStyles(ir);
    const codes = result.diagnostics.map((diagnostic) => diagnostic.code);

    expect(codes).toEqual([
      'STYLE_PROPERTY_UNKNOWN',
      'STYLE_PROPERTY_NOT_APPLICABLE',
      'STYLE_PROPERTY_INVALID',
      'STYLE_PROPERTY_INVALID',
    ]);
  });

  it('does not report properties that are valid only for other element types in shared defaults', () => {
    const ir = createIr();
    ir.styleSets[1]!.defaults = { fill: '#DDDDDD', color: '#123456' };

    const result = resolveIrStyles(ir);

    expect(result.diagnostics).toEqual([]);
  });
});
