import { describe, expect, it } from 'vitest';

import minimalIr from '../spec/fixtures/ir-v1-minimal.json' with { type: 'json' };
import type { IrDocument } from '../spec/ir-v1.types.js';
import { parseMarkdown } from '../src/markdown/parser.js';
import { validateIrSchema } from '../src/validation/schema-validator.js';

function validIr(): IrDocument {
  return structuredClone(minimalIr) as unknown as IrDocument;
}

function record(value: unknown): Record<string, unknown> {
  return value as Record<string, unknown>;
}

function rootTopic(ir: Record<string, unknown>): Record<string, unknown> {
  return record(record(ir.sheet).rootTopic);
}

function firstContentBlock(ir: Record<string, unknown>): Record<string, unknown> {
  return record((rootTopic(ir).content as unknown[])[0]);
}

const invalidCases: Array<[string, (ir: Record<string, unknown>) => void]> = [
  [
    'SC-101',
    (ir) => {
      delete ir.irVersion;
    },
  ],
  [
    'SC-102',
    (ir) => {
      ir.irVersion = '2.0.0';
    },
  ],
  [
    'SC-103',
    (ir) => {
      delete record(ir.sheet).rootTopic;
    },
  ],
  [
    'SC-104',
    (ir) => {
      delete rootTopic(ir).children;
    },
  ],
  [
    'SC-105',
    (ir) => {
      delete firstContentBlock(ir).type;
    },
  ],
  [
    'SC-106',
    (ir) => {
      firstContentBlock(ir).type = 'unknownBlock';
    },
  ],
  [
    'SC-107',
    (ir) => {
      record(ir.document).unexpected = true;
    },
  ],
  [
    'SC-110',
    (ir) => {
      ir.extensions = { 'X-Bad': { value: true } };
    },
  ],
];

const invalidCollectionCases: Array<[string, (ir: Record<string, unknown>) => void]> = [
  [
    'empty list',
    (ir) => {
      rootTopic(ir).content = [{ type: 'list', ordered: false, items: [] }];
    },
  ],
  [
    'empty table',
    (ir) => {
      rootTopic(ir).content = [{ type: 'table', rows: [] }];
    },
  ],
];

describe('IR JSON Schema Draft 2020-12 conformance', () => {
  it('SC-001 accepts the minimal reference fixture', () => {
    expect(validateIrSchema(validIr())).toEqual({ valid: true, diagnostics: [] });
  });

  it('SC-002 accepts notes and valid links', () => {
    const ir = validIr();
    ir.sheet.rootTopic.notes = [{ type: 'paragraph', runs: [{ text: 'Nota' }] }];
    ir.sheet.rootTopic.hyperlink = '../reference.md';
    ir.sheet.rootTopic.content[0] = {
      type: 'paragraph',
      runs: [{ text: 'Enlace', link: '../reference.md' }],
    };

    expect(validateIrSchema(ir).valid).toBe(true);
  });

  it('SC-003 accepts lists, tables, quotes and code blocks', () => {
    const ir = validIr();
    ir.sheet.rootTopic.content = [
      {
        type: 'list',
        ordered: true,
        start: 2,
        items: [{ blocks: [{ type: 'code', value: 'x' }] }],
      },
      {
        type: 'table',
        alignments: ['left', 'center'],
        rows: [
          {
            cells: [
              { blocks: [] },
              {
                blocks: [
                  {
                    type: 'quote',
                    blocks: [{ type: 'paragraph', runs: [{ text: 'Cita' }] }],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: 'quote',
        blocks: [{ type: 'paragraph', runs: [{ text: 'Cita' }] }],
      },
      { type: 'code', language: 'ts', value: 'const value = 1;' },
    ];

    expect(validateIrSchema(ir).valid).toBe(true);
  });

  it('SC-004 accepts namespaced extensions with JSON values', () => {
    const ir = validIr();
    ir.extensions = {
      'x-example': { enabled: true, nested: { count: 2, values: ['a', null] } },
    };

    expect(validateIrSchema(ir).valid).toBe(true);
  });

  it('SC-005 accepts style defaults, roles and named styles', () => {
    const ir = validIr();
    ir.sheet.defaultStyleSetId = 'theme:default';
    ir.sheet.rootTopic.style = {
      setId: 'theme:default',
      role: 'root',
      styleId: 'emphasis',
    };
    ir.styleSets = [
      {
        id: 'theme:default',
        defaults: { fontSize: 14 },
        roles: { root: { shape: 'rounded' } },
        styles: { emphasis: { fontWeight: 'bold' } },
      },
    ];

    expect(validateIrSchema(ir).valid).toBe(true);
  });

  it.each(invalidCases)('%s rejects an invalid structural document', (_id, mutate) => {
    const ir = validIr() as unknown as Record<string, unknown>;
    mutate(ir);

    expect(validateIrSchema(ir).valid).toBe(false);
  });

  it.each(['', 'contains whitespace', 'x'.repeat(129)])('SC-108 rejects invalid IDs (%s)', (id) => {
    const ir = validIr();
    ir.sheet.rootTopic.id = id;

    expect(validateIrSchema(ir).valid).toBe(false);
  });

  it.each(invalidCollectionCases)('SC-109 rejects a %s', (_label, mutate) => {
    const ir = validIr() as unknown as Record<string, unknown>;
    mutate(ir);

    expect(validateIrSchema(ir).valid).toBe(false);
  });

  it('reports stable diagnostic codes and instance paths', () => {
    const ir = validIr() as unknown as Record<string, unknown>;
    delete record(ir.sheet).rootTopic;

    const result = validateIrSchema(ir);

    expect(result.valid).toBe(false);
    expect(result.diagnostics.length).toBeGreaterThan(0);
    expect(result.diagnostics[0]?.code).toMatch(/^IR_SCHEMA_/);
    expect(result.diagnostics[0]?.path).toBe('$.sheet');
    expect(result.diagnostics[0]?.schemaPath).toBe('#/required');
    expect(result.diagnostics[0]?.params).toMatchObject({ missingProperty: 'rootTopic' });
  });

  it('accepts the typed IR returned by the Markdown parser', () => {
    const parsed: IrDocument = parseMarkdown('# Root\\n\\n## Child');

    expect(validateIrSchema(parsed).valid).toBe(true);
  });

  it('validates URI formats and maps array indices in instance paths', () => {
    const ir = validIr();
    ir.sheet.rootTopic.hyperlink = 'not a valid uri';

    const uriResult = validateIrSchema(ir);
    expect(uriResult.diagnostics.some((item) => item.path === '$.sheet.rootTopic.hyperlink')).toBe(
      true,
    );

    const invalidMarks = validIr() as unknown as Record<string, unknown>;
    const content = rootTopic(invalidMarks).content as unknown[];
    const paragraph = record(content[0]);
    const runs = paragraph.runs as unknown[];
    record(runs[0]).marks = ['not-a-mark'];

    const marksResult = validateIrSchema(invalidMarks);
    expect(
      marksResult.diagnostics.some(
        (item) => item.path === '$.sheet.rootTopic.content[0].runs[0].marks[0]',
      ),
    ).toBe(true);
  });

  it('does not mutate the input document', () => {
    const ir = validIr();
    const before = JSON.stringify(ir);

    validateIrSchema(ir);

    expect(JSON.stringify(ir)).toBe(before);
  });
});
