import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const outputDirectory = resolve(root, 'dist');

if (!existsSync(outputDirectory)) {
  throw new Error('No existe dist/. Ejecuta npm run build antes de empaquetar.');
}

let sourceCommit = process.env.GITHUB_SHA;
if (!sourceCommit) {
  try {
    sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    sourceCommit = 'unknown';
  }
}

const manifest = {
  schemaVersion: 1,
  package: packageJson.name,
  version: packageJson.version,
  distribution: 'cli-only',
  irContract: '1.0.0',
  entrypoint: packageJson.bin?.['xmind-md'] ?? null,
  sourceCommit,
  workflow: {
    provider: process.env.GITHUB_ACTIONS === 'true' ? 'github-actions' : null,
    runId: process.env.GITHUB_RUN_ID ?? null,
    runAttempt: process.env.GITHUB_RUN_ATTEMPT ?? null,
    ref: process.env.GITHUB_REF ?? null,
  },
};

writeFileSync(
  resolve(outputDirectory, 'BUILD-MANIFEST.json'),
  `${JSON.stringify(manifest, null, 2)}\\n`,
  'utf8',
);
process.stdout.write('Build manifest written to dist/BUILD-MANIFEST.json\\n');
