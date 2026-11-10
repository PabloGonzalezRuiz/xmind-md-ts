import { describe, expect, it } from 'vitest';

import minimalIr from '../spec/fixtures/ir-v1-minimal.json' with { type: 'json' };
import type { IrDocument } from '../spec/ir-v1.types.js';
import { validateIrDocumentComplete } from '../src/validation/complete-validator.js';

describe('complete IR validation pipeline', () => {
  it('accepts a document that passes structural and semantic validation', () => {
    const ir = structuredClone(minimalIr) as unknown as IrDocument;

    expect(validateIrDocumentComplete(ir)).toEqual({ valid: true, diagnostics: [] });
  });

  it('stops at structural validation when the schema rejects the document', () => {
    const ir = structuredClone(minimalIr) as unknown as Record<string, unknown>;
    delete (ir.sheet as Record<string, unknown>).rootTopic;

    const result = validateIrDocumentComplete(ir);

    expect(result.valid).toBe(false);
    expect(result.diagnostics.every((item) => item.code.startsWith('IR_SCHEMA_'))).toBe(true);
  });

  it('runs semantic validation after the schema accepts the document', () => {
    const ir = structuredClone(minimalIr) as unknown as IrDocument;
    ir.sheet.rootTopic.children.push({
      id: ir.sheet.rootTopic.id,
      title: 'Duplicado',
      children: [],
      content: [],
    });

    const result = validateIrDocumentComplete(ir);

    expect(result.valid).toBe(false);
    expect(result.diagnostics.map((item) => item.code)).toContain('IR_ID_DUPLICATE');
  });
});
