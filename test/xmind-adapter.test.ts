import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { exportXMindFile, XMindExportError } from '../src/adapters/xmind/xmind-adapter.js';
import { parseMarkdown } from '../src/index.js';

let directory = '';

afterEach(async () => {
  if (directory) await rm(directory, { recursive: true, force: true });
});

describe('XMind adapter', () => {
  it('exports a validated IR with nested topics and notes to an XMind ZIP', async () => {
    directory = await mkdtemp(join(tmpdir(), 'xmind-md-export-'));
    const ir = parseMarkdown('# Mapa\n\n## Rama\n\nTexto de nota.\n\n### Hijo\n');
    const result = await exportXMindFile(ir, {
      outputPath: join(directory, 'mapa.xmind'),
      mode: 'strict',
    });

    const bytes = await readFile(result.outputPath);
    expect(bytes.subarray(0, 2).toString()).toBe('PK');
    expect(result.features.topics).toBe(2);
    expect(result.features.notes).toBe(1);
  });

  it('rejects unsupported structural features in strict mode', async () => {
    directory = await mkdtemp(join(tmpdir(), 'xmind-md-strict-'));
    const ir = parseMarkdown('# Mapa\n');
    ir.sheet.relationships.push({
      id: 'rel-1',
      sourceTopicId: ir.sheet.rootTopic.id,
      targetTopicId: ir.sheet.rootTopic.id,
    });

    await expect(
      exportXMindFile(ir, { outputPath: join(directory, 'strict.xmind') }),
    ).rejects.toBeInstanceOf(XMindExportError);
  });

  it('allows explicitly requested compatible export and reports unsupported features', async () => {
    directory = await mkdtemp(join(tmpdir(), 'xmind-md-compatible-'));
    const ir = parseMarkdown('# Mapa\n');
    ir.sheet.relationships.push({
      id: 'rel-1',
      sourceTopicId: ir.sheet.rootTopic.id,
      targetTopicId: ir.sheet.rootTopic.id,
    });

    const result = await exportXMindFile(ir, {
      outputPath: join(directory, 'compatible.xmind'),
      mode: 'compatible',
    });

    expect(result.diagnostics.some((item) => item.code === 'XMIND_RELATIONSHIPS_UNSUPPORTED')).toBe(
      true,
    );
    expect((await readFile(result.outputPath)).subarray(0, 2).toString()).toBe('PK');
  });
});
