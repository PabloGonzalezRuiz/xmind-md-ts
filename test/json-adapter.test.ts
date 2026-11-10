import { parseMarkdown } from '../src/index.js';
import { serializeIrJson } from '../src/adapters/json/json-adapter.js';

import { describe, expect, it } from 'vitest';

describe('JSON adapter', () => {
  it('serializa un IR válido con formato estable y salto final', () => {
    const ir = parseMarkdown('# Mapa\n\n## Rama\n');
    const first = serializeIrJson(ir);
    const second = serializeIrJson(ir);

    expect(first).toBe(second);
    expect(first.endsWith('\n')).toBe(true);
    expect(JSON.parse(first)).toEqual(ir);
  });

  it('no modifica el IR de entrada', () => {
    const ir = parseMarkdown('# Mapa\n\n## Rama\n');
    const before = JSON.stringify(ir);

    serializeIrJson(ir);

    expect(JSON.stringify(ir)).toBe(before);
  });
});
