import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { parseMarkdown } from '../src/index.js';

const cliPath = join(process.cwd(), 'src', 'cli', 'main.ts');
let directory: string;
let markdownPath: string;
let jsonPath: string;

function execute(args: string[], input?: string) {
  return spawnSync(process.execPath, ['--import', 'tsx', cliPath, ...args], {
    cwd: process.cwd(),
    encoding: 'utf8',
    input,
    windowsHide: true,
  });
}

describe('CLI', () => {
  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'xmind md cli '));
    markdownPath = join(directory, 'mapa de prueba.md');
    jsonPath = join(directory, 'mapa generado.json');
    await writeFile(markdownPath, '# Mapa de prueba\n\n## Rama A\n\nTexto de prueba.\n', 'utf8');
  });

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  it('muestra ayuda y versión sin leer archivos', () => {
    const help = execute(['--help']);
    const version = execute(['--version']);

    expect(help.status).toBe(0);
    expect(help.stdout).toContain('xmind-md');
    expect(version.status).toBe(0);
    expect(version.stdout.trim()).toBe('0.1.0');
  });

  it('convierte Markdown a JSON IR y conserva el árbol', async () => {
    const result = execute(['parse', markdownPath, '--output', jsonPath]);

    expect(result.status).toBe(0);
    const ir = JSON.parse(await readFile(jsonPath, 'utf8')) as {
      sheet: { rootTopic: { title: string; children: Array<{ title: string }> } };
    };
    expect(ir.sheet.rootTopic.title).toBe('Mapa de prueba');
    expect(ir.sheet.rootTopic.children[0]?.title).toBe('Rama A');
  });

  it('exporta un paquete XMind desde Markdown', async () => {
    const output = join(directory, 'mapa.xmind');
    const result = execute(['export', markdownPath, '--format', 'xmind', '--output', output]);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Paquete XMind generado');
    const bytes = await readFile(output);
    expect(bytes.subarray(0, 2).toString()).toBe('PK');
  });

  it('exporta SVG desde Markdown y conserva metadatos IR', async () => {
    const output = join(directory, 'mapa.svg');
    const result = execute(['export', markdownPath, '--format', 'svg', '--output', output]);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('SVG generado');
    const svg = await readFile(output, 'utf8');
    expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('id="xmind-md-ir"');
    expect(svg).toContain('Rama A');
  });


  it.each([
    { source: 'Markdown', format: 'xmind', extension: '.xmind' },
    { source: 'Markdown', format: 'svg', extension: '.svg' },
    { source: 'JSON', format: 'xmind', extension: '.xmind' },
    { source: 'JSON', format: 'svg', extension: '.svg' },
  ])('deriva el nombre de salida correcto desde $source para $format sin --output', async ({
    source,
    format,
    extension,
  }) => {
    let inputPath = markdownPath;
    let basePath = markdownPath.slice(0, -'.md'.length);
    if (source === 'JSON') {
      await writeFile(jsonPath, JSON.stringify(parseMarkdown('# Mapa de prueba\n\n## Rama A\n')));
      inputPath = jsonPath;
      basePath = jsonPath.slice(0, -'.json'.length);
    }

    const result = execute(['export', inputPath, '--format', format]);
    const outputPath = basePath + extension;

    expect(result.status).toBe(0);
    if (format === 'xmind') {
      expect((await readFile(outputPath)).subarray(0, 2).toString()).toBe('PK');
    } else {
      expect(await readFile(outputPath, 'utf8')).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
    }
    expect(result.stdout).toContain(outputPath);
  });

  it('termina el error de exportación XMind con un salto de línea real', async () => {
    const ir = parseMarkdown('# Mapa\n\n## Rama A\n\n## Rama B\n');
    const [first, second] = ir.sheet.rootTopic.children;
    if (!first || !second) throw new Error('El fixture debe tener dos temas hijos.');
    ir.sheet.relationships.push({
      id: 'relation-1',
      sourceTopicId: first.id,
      targetTopicId: second.id,
    });
    await writeFile(jsonPath, JSON.stringify(ir));

    const result = execute(['export', jsonPath, '--format', 'xmind']);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Error de exportación XMind:');
    expect(result.stderr).toMatch(/\n$/);
    expect(result.stderr).not.toContain('\\n');
  });

  it('termina el error de exportación SVG con un salto de línea real', async () => {
    const ir = parseMarkdown('# Mapa\n');
    ir.assets.push({ id: 'asset-1', uri: 'images/diagrama.png', mediaType: 'image/png' });
    ir.sheet.rootTopic.content.push({
      type: 'image',
      assetId: 'asset-1',
      alt: 'Diagrama de ejemplo',
    });
    await writeFile(jsonPath, JSON.stringify(ir));

    const result = execute(['export', jsonPath, '--format', 'svg']);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Error de exportación SVG:');
    expect(result.stderr).toMatch(/\n$/);
    expect(result.stderr).not.toContain('\\n');
  });

  it('valida Markdown y JSON IR', async () => {
    const parsed = execute(['parse', markdownPath, '-o', jsonPath]);
    expect(parsed.status).toBe(0);

    const markdownValidation = execute(['validate', markdownPath]);
    const jsonValidation = execute(['validate', jsonPath]);

    expect(markdownValidation.status).toBe(0);
    expect(markdownValidation.stdout).toContain('Documento válido');
    expect(jsonValidation.status).toBe(0);
    expect(jsonValidation.stdout).toContain('Documento válido');
  });

  it('exporta JSON desde Markdown a stdout', () => {
    const result = execute(['export', markdownPath, '--format', 'json']);

    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject({
      irVersion: '1.0.0',
      document: { title: 'Mapa de prueba' },
    });
  });

  it('acepta stdin cuando se declara su formato', () => {
    const result = execute(
      ['export', '-', '--input-format', 'markdown'],
      '# Entrada estándar\n\n## Tema\n',
    );

    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject({
      document: { title: 'Entrada estándar' },
    });
  });

  it('devuelve código 1 y diagnóstico ante Markdown no válido', async () => {
    const invalidMarkdownPath = join(directory, 'sin raiz.md');
    await writeFile(invalidMarkdownPath, 'Texto sin encabezado raíz.\\n', 'utf8');
    const invalid = execute(['parse', invalidMarkdownPath]);

    expect(invalid.status).toBe(1);
    expect(invalid.stderr).toContain('MD_ROOT_HEADING');
  });

  it('exige declarar el formato de stdin', () => {
    const result = execute(['validate', '-']);
    expect(result.status).toBe(2);
    expect(result.stderr).toContain('--input-format');
  });

  it('distingue errores de uso y errores de entrada', async () => {
    const usage = execute(['parse']);
    const invalidJsonPath = join(directory, 'invalido.json');
    await writeFile(invalidJsonPath, '{ no es json', 'utf8');
    const invalid = execute(['validate', invalidJsonPath]);

    expect(usage.status).toBe(2);
    expect(invalid.status).toBe(1);
    expect(invalid.stderr).toContain('JSON no válido');
  });

  it('no permite sobrescribir la entrada con la salida', () => {
    const result = execute(['export', markdownPath, '--output', markdownPath]);

    expect(result.status).toBe(2);
    expect(result.stderr).toContain('no puede sobrescribir');
  });
});
