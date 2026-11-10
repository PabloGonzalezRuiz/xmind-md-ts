#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import process from 'node:process';

import {
  applicationVersion,
  parseMarkdownWithDiagnostics,
  validateIrDocumentComplete,
} from '../index.js';

type Command = 'parse' | 'validate' | 'export';
type InputFormat = 'markdown' | 'json';
type Options = {
  command: Command;
  input: string;
  output?: string;
  mode: 'compatible' | 'strict';
  inputFormat?: InputFormat;
  format: 'json';
  assetRoot?: string;
};

const EXIT = { success: 0, invalid: 1, usage: 2, internal: 3 } as const;

class UsageError extends Error {}
class InputError extends Error {}
class IoError extends Error {}

const HELP = `xmind-md ${applicationVersion}

Uso:
  xmind-md parse <archivo.md> [--output <archivo.json>] [--mode compatible|strict]
  xmind-md validate <archivo.md|archivo.json> [--input-format markdown|json] [--mode compatible|strict]
  xmind-md export <archivo.md|archivo.json> [--output <archivo.json>] [--format json]
  xmind-md --help
  xmind-md --version

Opciones:
  -o, --output       Archivo de salida. Si se omite, se escribe en stdout.
  --mode             Modo del parser Markdown: compatible (por defecto) o strict.
  --input-format     Formato de entrada para stdin o para forzar la detección: markdown o json.
  --format           Formato de exportación. Actualmente solo se admite json.
  --asset-root       Directorio permitido para resolver assets relativos durante la validación.
  -h, --help         Muestra esta ayuda.
  --version          Muestra la versión.

Comandos:
  parse              Convierte Markdown a IR JSON y valida el resultado.
  validate           Valida un Markdown o un documento IR JSON sin exportarlo.
  export             Valida y serializa el IR canónico como JSON.

Entrada "-" lee desde stdin. La salida se escribe en stdout salvo que se indique --output.

Códigos de salida:
  0  Operación correcta.
  1  Error de sintaxis, parsing o validación del documento.
  2  Uso incorrecto o error de lectura/escritura.
  3  Error interno inesperado.
`;

function parseArguments(args: string[]): Options {
  const command = args[0];
  if (command !== 'parse' && command !== 'validate' && command !== 'export') {
    throw new UsageError('Indica uno de los comandos: parse, validate o export.');
  }

  let input: string | undefined;
  let output: string | undefined;
  let mode: Options['mode'] = 'compatible';
  let inputFormat: InputFormat | undefined;
  let format: Options['format'] = 'json';
  let assetRoot: string | undefined;

  for (let index = 1; index < args.length; index += 1) {
    const arg = args[index];
    const next = args[index + 1];
    if (arg === '--output' || arg === '-o') {
      if (!next || next.startsWith('--')) throw new UsageError(`Falta el valor de ${arg}.`);
      output = next;
      index += 1;
    } else if (arg === '--mode') {
      if (next !== 'compatible' && next !== 'strict') {
        throw new UsageError('--mode debe ser compatible o strict.');
      }
      mode = next;
      index += 1;
    } else if (arg === '--input-format') {
      if (next !== 'markdown' && next !== 'json') {
        throw new UsageError('--input-format debe ser markdown o json.');
      }
      inputFormat = next;
      index += 1;
    } else if (arg === '--format') {
      if (next !== 'json') throw new UsageError('El único formato disponible es json.');
      format = 'json';
      index += 1;
    } else if (arg === '--asset-root') {
      if (!next || next.startsWith('--')) throw new UsageError('Falta el valor de --asset-root.');
      assetRoot = next;
      index += 1;
    } else if (arg.startsWith('-') && arg !== '-') {
      throw new UsageError(`Opción desconocida: ${arg}`);
    } else if (input === undefined) {
      input = arg;
    } else {
      throw new UsageError(`Argumento inesperado: ${arg}`);
    }
  }

  if (!input) throw new UsageError('Falta el archivo de entrada.');
  if (command === 'parse' && inputFormat === 'json') {
    throw new UsageError('El comando parse solo admite entrada Markdown.');
  }
  if (command === 'parse' && extname(input).toLowerCase() === '.json') {
    throw new UsageError('El comando parse requiere un archivo Markdown.');
  }
  if (command === 'validate' && output) {
    throw new UsageError('validate no genera archivos; elimina --output.');
  }

  return { command, input, output, mode, inputFormat, format, assetRoot };
}

async function readInput(input: string): Promise<string> {
  if (input === '-') {
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks).toString('utf8');
  }
  try {
    return await readFile(resolve(input), 'utf8');
  } catch (error) {
    throw new IoError(`No se pudo leer "${input}": ${errorMessage(error)}`);
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function detectInputFormat(input: string, requested?: InputFormat): InputFormat {
  if (requested) return requested;
  if (input === '-') {
    throw new UsageError('Con stdin debes indicar --input-format markdown o json.');
  }
  return extname(input).toLowerCase() === '.json' ? 'json' : 'markdown';
}

function parseJson(source: string): unknown {
  try {
    return JSON.parse(source) as unknown;
  } catch (error) {
    throw new InputError(`JSON no válido: ${errorMessage(error)}`);
  }
}

function reportDiagnostics(diagnostics: Array<{ code: string; message: string; path?: string; line?: number; column?: number }>): void {
  for (const diagnostic of diagnostics) {
    const location = diagnostic.path
      ? ` (${diagnostic.path})`
      : diagnostic.line === undefined
        ? ''
        : ` (línea ${diagnostic.line}${diagnostic.column === undefined ? '' : `, columna ${diagnostic.column}`})`;
    process.stderr.write(`[${diagnostic.code}]${location} ${diagnostic.message}\n`);
  }
}

function failValidation(
  diagnostics: Array<{ code: string; message: string; path?: string; line?: number; column?: number }>,
): never {
  reportDiagnostics(diagnostics);
  throw new InputError('El documento no supera la validación.');
}

async function loadIr(options: Options): Promise<{ ir: unknown; warnings: ReturnType<typeof parseMarkdownWithDiagnostics>['diagnostics'] }> {
  const source = await readInput(options.input);
  const inputFormat = detectInputFormat(options.input, options.inputFormat);
  if (inputFormat === 'json') return { ir: parseJson(source), warnings: [] };

  try {
    const parsed = parseMarkdownWithDiagnostics(source, {
      sourcePath: options.input === '-' ? 'stdin.md' : options.input.replace(/\\/g, '/'),
      mode: options.mode,
    });
    return { ir: parsed.ir, warnings: parsed.diagnostics };
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      const parserError = error as Error & { code: string; line?: number; column?: number };
      const location = parserError.line === undefined
        ? ''
        : ` (línea ${parserError.line}${parserError.column === undefined ? '' : `, columna ${parserError.column}`})`;
      process.stderr.write(`[${parserError.code}]${location} ${parserError.message}\n`);
      throw new InputError('No se pudo interpretar el Markdown.');
    }
    throw error;
  }
}

async function writeOutput(content: string, output?: string): Promise<void> {
  if (!output || output === '-') {
    process.stdout.write(content);
    return;
  }
  try {
    await writeFile(resolve(output), content, 'utf8');
  } catch (error) {
    throw new IoError(`No se pudo escribir "${output}": ${errorMessage(error)}`);
  }
}

async function run(options: Options): Promise<void> {
  const { ir, warnings } = await loadIr(options);
  if (warnings.length) reportDiagnostics(warnings);

  const validation = validateIrDocumentComplete(ir, {
    ...(options.assetRoot ? { assetRootDirectory: resolve(options.assetRoot) } : {}),
  });
  if (!validation.valid) failValidation(validation.diagnostics);

  if (options.command === 'validate') {
    process.stdout.write('Documento válido: estructura y semántica IR v1.0.0 correctas.\n');
    return;
  }

  const json = `${JSON.stringify(ir, null, 2)}\n`;
  if (options.output && options.input !== '-') {
    const inputPath = resolve(options.input);
    const outputPath = resolve(options.output);
    if (inputPath === outputPath) {
      throw new UsageError('La ruta de salida no puede sobrescribir el archivo de entrada.');
    }
  }
  await writeOutput(json, options.output);

  if (options.command === 'parse') {
    process.stderr.write(`Markdown convertido a IR JSON: ${options.output ?? 'stdout'}\n`);
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    process.stdout.write(HELP);
    return;
  }
  if (args[0] === '--version') {
    process.stdout.write(`${applicationVersion}\n`);
    return;
  }

  try {
    const options = parseArguments(args);
    await run(options);
  } catch (error) {
    if (error instanceof UsageError) {
      process.stderr.write(`Error de uso: ${error.message}\nConsulta "xmind-md --help".\n`);
      process.exitCode = EXIT.usage;
    } else if (error instanceof InputError) {
      if (error.message !== 'El documento no supera la validación.') {
        process.stderr.write(`Error de entrada: ${error.message}\n`);
      }
      process.exitCode = EXIT.invalid;
    } else if (error instanceof IoError) {
      process.stderr.write(`Error de E/S: ${error.message}\n`);
      process.exitCode = EXIT.usage;
    } else {
      process.stderr.write(`Error interno: ${errorMessage(error)}\n`);
      process.exitCode = EXIT.internal;
    }
  }
}

void main();
