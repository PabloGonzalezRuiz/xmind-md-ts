import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { exportSvgFile, SvgExportError } from '../src/adapters/svg/svg-adapter.js';
import { parseMarkdown } from '../src/index.js';

let directory = '';

afterEach(async () => {
  if (directory) await rm(directory, { recursive: true, force: true });
});

async function createDirectory(prefix: string): Promise<string> {
  directory = await mkdtemp(join(tmpdir(), prefix));
  return directory;
}

describe('SVG adapter', () => {
  it('renders the topic tree, semantic relationships and style declarations', async () => {
    const outputDirectory = await createDirectory('xmind-md-svg-');
    const ir = parseMarkdown('# Mapa principal\n\n## Rama A\n\n## Rama B\n');
    const [first, second] = ir.sheet.rootTopic.children;
    if (!first || !second) throw new Error('El fixture debe tener dos temas hijos.');

    ir.sheet.rootTopic.title = 'Mapa & conceptos <SVG>';
    ir.sheet.rootTopic.style = {
      overrides: { fill: '#FEE2E2', shape: 'ellipse', fontSize: 16 },
    };
    ir.sheet.relationships.push({
      id: 'relation-1',
      sourceTopicId: first.id,
      targetTopicId: second.id,
      label: 'conecta',
    });
    ir.sheet.boundaries.push({
      id: 'boundary-1',
      topicIds: [first.id, second.id],
      label: 'Grupo A',
    });
    ir.sheet.summaries.push({
      id: 'summary-1',
      topicIds: [first.id, second.id],
      label: 'Resumen',
    });

    const original = JSON.stringify(ir);
    const result = await exportSvgFile(ir, {
      outputPath: join(outputDirectory, 'mapa.svg'),
    });
    const svg = await readFile(result.outputPath, 'utf8');

    expect(svg.startsWith('<?xml version="1.0"')).toBe(true);
    expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('Mapa &amp; conceptos &lt;SVG&gt;');
    expect(svg).toContain('data-ir-id="relation-1"');
    expect(svg).toContain('data-ir-id="boundary-1"');
    expect(svg).toContain('data-ir-id="summary-1"');
    expect(svg).toContain('fill="#FEE2E2"');
    expect(svg).toContain('id="xmind-md-ir"');
    expect(svg).toContain('&quot;irVersion&quot;:&quot;1.0.0&quot;');
    expect(result.features).toMatchObject({
      topics: 3,
      relationships: 1,
      boundaries: 1,
      summaries: 1,
      embeddedIr: true,
    });
    expect(JSON.stringify(ir)).toBe(original);
  });

  it('produces byte-for-byte deterministic SVG output', async () => {
    const outputDirectory = await createDirectory('xmind-md-svg-deterministic-');
    const ir = parseMarkdown('# Mapa\n\n## Rama\n\n### Detalle\n');
    const firstPath = join(outputDirectory, 'first.svg');
    const secondPath = join(outputDirectory, 'second.svg');

    await exportSvgFile(ir, { outputPath: firstPath });
    await exportSvgFile(ir, { outputPath: secondPath });

    expect(await readFile(firstPath, 'utf8')).toBe(await readFile(secondPath, 'utf8'));
  });

  it('rejects unrendered assets in strict mode and preserves them in compatible metadata', async () => {
    const outputDirectory = await createDirectory('xmind-md-svg-assets-');
    const ir = parseMarkdown('# Mapa\n');
    ir.assets.push({ id: 'asset-1', uri: 'images/diagrama.png', mediaType: 'image/png' });
    ir.sheet.rootTopic.content.push({
      type: 'image',
      assetId: 'asset-1',
      alt: 'Diagrama de ejemplo',
    });

    await expect(
      exportSvgFile(ir, { outputPath: join(outputDirectory, 'strict.svg') }),
    ).rejects.toBeInstanceOf(SvgExportError);

    const result = await exportSvgFile(ir, {
      outputPath: join(outputDirectory, 'compatible.svg'),
      mode: 'compatible',
    });
    const svg = await readFile(result.outputPath, 'utf8');

    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'SVG_ASSETS_NOT_RENDERED', severity: 'warning' }),
    );
    expect(svg).toContain('images/diagrama.png');
    expect(svg).toContain('Diagrama de ejemplo');
  });

  it('escapes XML-sensitive metadata and keeps topic identifiers available', async () => {
    const outputDirectory = await createDirectory('xmind-md-svg-escape-');
    const ir = parseMarkdown('# A & B\n\n## C < D\n');
    const result = await exportSvgFile(ir, {
      outputPath: join(outputDirectory, 'escape.svg'),
    });
    const svg = await readFile(result.outputPath, 'utf8');

    expect(svg).toContain('A &amp; B');
    expect(svg).toContain('C &lt; D');
    expect(svg).toContain(`data-ir-id="${ir.sheet.rootTopic.children[0]?.id}"`);
  });
});
