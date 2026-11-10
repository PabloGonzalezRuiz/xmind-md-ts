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
          { type: 'paragraph', runs: [{ text: 'Second paragraph' }] },
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

  it('applies named styles after roles and keeps defaults below both', () => {
    const ir = createIr();
    ir.sheet.rootTopic.style = { role: 'primary', styleId: 'focus' };

    const result = resolveIrStyles(ir);

    expect(styleFor(result, 'topic:root').values.color).toBe('#BBBBBB');
  });

  it('propagates the effective style-set context to child topics', () => {
    const result = resolveIrStyles(createIr());
    const child = styleFor(result, 'topic:child');

    expect(child.values.color).toBe('#777777');
    expect(child.provenance.color).toEqual({ layer: 'styleSet', sourceId: 'theme:child' });
  });

  it('allows a topic to switch the inherited style-set context for its descendants', () => {
    const ir = createIr();
    ir.styleSets.push({ id: 'theme:alternate', defaults: { color: '#ABCDEF' } });
    ir.sheet.rootTopic.style = { setId: 'theme:alternate' };

    const result = resolveIrStyles(ir);

    expect(styleFor(result, 'topic:root').values.color).toBe('#ABCDEF');
    expect(styleFor(result, 'topic:child').values.color).toBe('#ABCDEF');
  });

  it('resolves text runs after topic styles and preserves inline provenance', () => {
    const result = resolveIrStyles(createIr());
    const run = styleFor(result, 'topic:root:run:$.sheet.rootTopic.content[0].runs[0]');

    expect(run.values.color).toBe('#999999');
    expect(run.values.fontSize).toBe(16);
    expect(run.provenance.color).toEqual({ layer: 'inline', sourceId: 'topic:root:run:0' });
    expect(run.provenance.fontSize).toEqual({ layer: 'styleSet', sourceId: 'theme:base' });
    expect(
      styleFor(result, 'topic:root:run:$.sheet.rootTopic.content[1].runs[0]').elementId,
    ).not.toBe(run.elementId);
  });

  it('resolves relationship, boundary and map styles', () => {
    const result = resolveIrStyles(createIr());

    expect(styleFor(result, 'rel:one').values.stroke).toBe('#555555');
    expect(styleFor(result, 'boundary:one').values.fill).toBe('#EEEEEE');
    expect(styleFor(result, 'sheet:styles').values.backgroundColor).toBe('#F8FAFC');
  });

  it('uses the default relationship arrowhead and accepts boolean overrides', () => {
    const ir = createIr();
    ir.sheet.relationships[0]!.style = { overrides: { arrowStart: true, arrowEnd: false } };

    const result = resolveIrStyles(ir);
    const relationship = styleFor(result, 'rel:one');

    expect(relationship.values.arrowStart).toBe(true);
    expect(relationship.values.arrowEnd).toBe(false);
  });

  it('replaces arrays instead of merging their entries', () => {
    const ir = createIr();
    ir.styleSets[0]!.defaults = { dashArray: [6, 2] };
    ir.styleSets[1]!.defaults = { dashArray: [1, 3] };

    const result = resolveIrStyles(ir);

    expect(styleFor(result, 'rel:one').values.dashArray).toEqual([1, 3]);
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
    const shadow = root.values.shadow as {
      enabled: boolean;
      offset: { x: number; y: number };
      blur: number;
    };

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
        lineStyle: 'solid',
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

  it('reports unknown properties in shared style-set defaults', () => {
    const ir = createIr();
    ir.styleSets[0]!.defaults = { unsupportedToken: 'value' };

    const result = resolveIrStyles(ir);

    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'STYLE_PROPERTY_UNKNOWN',
        elementId: 'theme:base',
        property: 'unsupportedToken',
      }),
    );
  });

  it('does not report properties that are valid only for other element types in shared defaults', () => {
    const ir = createIr();
    ir.styleSets[1]!.defaults = { fill: '#DDDDDD', color: '#123456' };

    const result = resolveIrStyles(ir);

    expect(result.diagnostics).toEqual([]);
  });
});
