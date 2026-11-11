import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import process from 'node:process';

const cli = resolve('dist/src/cli/main.js');
const examples = [
  'examples/quick-start.md',
  'examples/with-notes-and-styles.md',
];
const outputDirectory = mkdtempSync(
  join(tmpdir(), 'xmind-md-ts-examples-'),
);

function run(args, description) {
  const result = spawnSync(process.execPath, [cli, ...args], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout);
    throw new Error(
      `Falló el ejemplo: ${description} (exit ${result.status}).`,
    );
  }
  process.stdout.write(`OK: ${description}\n`);
}

try {
  for (const example of examples) {
    run(['validate', example], `validación de ${example}`);
  }

  const input = examples[0];
  run(
    ['parse', input, '--output', join(outputDirectory, 'quick-start.json')],
    'Markdown a IR JSON',
  );
  run(
    [
      'export',
      input,
      '--format',
      'xmind',
      '--export-mode',
      'compatible',
      '--output',
      join(outputDirectory, 'quick-start.xmind'),
    ],
    'Markdown a XMind',
  );
  run(
    [
      'export',
      input,
      '--format',
      'svg',
      '--export-mode',
      'compatible',
      '--output',
      join(outputDirectory, 'quick-start.svg'),
    ],
    'Markdown a SVG',
  );
} finally {
  rmSync(outputDirectory, { recursive: true, force: true });
}
