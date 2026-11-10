import { describe, expect, it } from 'vitest';

import type { IrDocument } from '../spec/ir-v1.types.js';
import minimalFixture from '../spec/fixtures/ir-v1-minimal.json' with { type: 'json' };
import { validateIr } from '../src/validation/validate-ir.js';
import { validateIrSchema } from '../src/validation/schema-validator.js';

function validIr(): IrDocument {
  return structuredClone(minimalFixture) as unknown as IrDocument;
}

function expectSchemaInvalid(caseId: string, input: unknown): void {
  const result = validateIrSchema(input);

  expect(result.valid, caseId).toBe(false);
  expect(result.diagnostics.length, caseId).toBeGreaterThan(0);
  expect(result.diagnostics.every((diagnostic) => diagnostic.code === 'IR_SCHEMA_INVALID')).toBe(
    true,
  );
}

describe('IR v1 JSON Schema conformance', () => {
  it('SC-001 accepts the canonical minimal fixture', () => {
    expect(validateIrSchema(validIr())).toEqual({ valid: true, diagnostics: [] });
  });

  it('SC-002 accepts notes and valid links', () => {
    const ir = validIr();
    ir.sheet.rootTopic.hyperlink = 'https://example.com/map';
    ir.sheet.rootTopic.notes = [
      { type: 'paragraph', runs: [{ text: 'Nota', link: '#details' }] },
    ];

    expect(validateIrSchema(ir).valid).toBe(true);
  });

  it('SC-003 accepts lists, tables, quotes and code blocks', () => {
    const ir = validIr();
    ir.sheet.rootTopic.content.push(
      {
        type: 'list',
        ordered: true,
        items: [{ blocks: [{ type: 'paragraph', runs: [{ text: 'Item' }] }] }],
      },
      {
        type: 'table',
        alignments: ['left', 'center'],
        rows: [
          {
            cells: [
              { blocks: [{ type: 'paragraph', runs: [{ text: 'A' }] }] },
              { blocks: [{ type: 'paragraph', runs: [{ text: 'B' }] }] },
            ],
          },
        ],
      },
      {
        type: 'quote',
        blocks: [{ type: 'paragraph', runs: [{ text: 'Cita' }] }],
      },
      { type: 'code', language: 'ts', value: 'const answer = 42;' },
    );

    expect(validateIrSchema(ir).valid).toBe(true);
  });

  it('SC-004 accepts namespaced extensions with JSON values', () => {
    const ir = validIr();
    ir.extensions = {
      xmind: {
        customFlag: true,
        metadata: { level: 2, tags: ['one', 'two'], optional: null },
      },
    };

    expect(validateIrSchema(ir).valid).toBe(true);
  });

  it('SC-005 accepts style defaults, roles and named styles', () => {
    const ir = validIr();
    ir.styleSets = [
      {
        id: 'theme:default',
        defaults: { color: '#123456' },
        roles: { main: { shape: 'rounded' } },
        styles: { focus: { fontWeight: 'bold' } },
      },
    ];
    ir.sheet.rootTopic.style = {
      setId: 'theme:default',
      role: 'main',
      styleId: 'focus',
      overrides: { color: '#654321' },
    };

    expect(validateIrSchema(ir).valid).toBe(true);
  });

  it('SC-101 rejects a missing irVersion', () => {
    const ir = validIr() as unknown as Record<string, unknown>;
    delete ir.irVersion;
    expectSchemaInvalid('SC-101', ir);
  });

  it('SC-102 rejects an unsupported irVersion', () => {
    const ir = validIr();
    (ir as { irVersion: string }).irVersion = '2.0.0';
    expectSchemaInvalid('SC-102', ir);
  });

  it('SC-103 rejects a missing rootTopic', () => {
    const ir = validIr();
    delete (ir.sheet as unknown as Record<string, unknown>).rootTopic;
    expectSchemaInvalid('SC-103', ir);
  });

  it.each(['children', 'content'])('SC-104 rejects a topic without %s', (field) => {
    const ir = validIr();
    delete (ir.sheet.rootTopic as unknown as Record<string, unknown>)[field];
    expectSchemaInvalid(`SC-104-${field}`, ir);
  });

  it('SC-105 rejects a block without a type discriminator', () => {
    const ir = validIr();
    ir.sheet.rootTopic.content.push({ type: 'thematicBreak' });
    delete (ir.sheet.rootTopic.content[1] as unknown as Record<string, unknown>).type;
    expectSchemaInvalid('SC-105', ir);
  });

  it('SC-106 rejects an unknown block type', () => {
    const ir = validIr();
    ir.sheet.rootTopic.content.push({ type: 'thematicBreak' });
    (ir.sheet.rootTopic.content[1] as unknown as Record<string, unknown>).type = 'unknown';
    expectSchemaInvalid('SC-106', ir);
  });

  it('SC-107 rejects an unknown core property', () => {
    const ir = validIr();
    (ir.sheet as unknown as Record<string, unknown>).unexpected = true;
    expectSchemaInvalid('SC-107', ir);
  });

  it.each(['', 'id with spaces', 'x'.repeat(129)])(
    'SC-108 rejects invalid IDs (%s)',
    (id) => {
      const ir = validIr();
      ir.sheet.rootTopic.id = id;
      expectSchemaInvalid('SC-108', ir);
    },
  );

  it('SC-109 rejects an empty list and a table without rows', () => {
    const listIr = validIr();
    listIr.sheet.rootTopic.content.push({ type: 'list', ordered: false, items: [] });
    expectSchemaInvalid('SC-109-list', listIr);

    const tableIr = validIr();
    tableIr.sheet.rootTopic.content.push({ type: 'table', rows: [] });
    expectSchemaInvalid('SC-109-table', tableIr);
  });

  it('SC-110 rejects an extension namespace outside the lowercase pattern', () => {
    const ir = validIr();
    ir.extensions = { XMind: {} };
    expectSchemaInvalid('SC-110', ir);
  });
});

describe('combined IR validation pipeline', () => {
  it('stops at schema validation when the input structure is invalid', () => {
    const result = validateIr({ irVersion: '1.0.0' });

    expect(result.valid).toBe(false);
    expect(result.diagnostics.every((diagnostic) => diagnostic.code === 'IR_SCHEMA_INVALID')).toBe(
      true,
    );
  });

  it('runs semantic validation after the schema accepts the structure', () => {
    const ir = validIr();
    ir.sheet.rootTopic.children.push({
      id: ir.sheet.rootTopic.id,
      title: 'Duplicate ID',
      children: [],
      content: [],
    });

    const result = validateIr(ir);

    expect(result.valid).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain('IR_ID_DUPLICATE');
  });

  it('accepts an IR document that passes both validation layers', () => {
    expect(validateIr(validIr())).toEqual({ valid: true, diagnostics: [] });
  });
});
