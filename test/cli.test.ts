import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const cliPath = join(process.cwd(), 'src', 'cli', 'main.ts');
let directory: string;
let markdownPath: string;
let jsonPath: string;

function execute(args: string[], input?: string) {
  return spawnSync(
    process.execPath,
    ['--import', 'tsx', cliPath, ...args],
    {
      cwd: process.cwd(),
      encoding: 'utf8',
      input,
      windowsHide: true,
    },
  );
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

  it('devuelve código 1 y diagnóstico ante Markdown no válido', () => {
    const result = execute(['parse', markdownPath, '--mode', 'strict']);
    expect(result.status).toBe(0);

    const invalid = execute(['validate', '-']);
    expect(invalid.status).toBe(2);
    expect(invalid.stderr).toContain('--input-format');
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
