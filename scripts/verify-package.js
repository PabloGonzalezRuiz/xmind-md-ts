import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import process from 'node:process';

const packageRoot = resolve('.');
const outputDirectory = mkdtempSync(join(tmpdir(), 'xmind-md-ts-package-'));
const installDirectory = join(outputDirectory, 'install');
const npmCli = process.env.npm_execpath;

if (!npmCli) {
  throw new Error('Run this script through npm.');
}

function run(command, args, description, options = {}) {
  const result = spawnSync(command, args, {
    cwd: packageRoot,
    encoding: 'utf8',
    ...options,
  });
  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout);
    throw new Error(`Failed ${description} (${result.status}).`);
  }
  return result.stdout;
}

try {
  const packed = run(
    process.execPath,
    [npmCli, 'pack', '--json', '--pack-destination', outputDirectory],
    'npm pack',
  );
  const packInfo = JSON.parse(packed);
  const tarball = join(outputDirectory, packInfo[0].filename);
  const packagedFiles = packInfo[0].files.map((file) => file.path);
  const allowedDocs = new Set([
    'docs/adapters.md',
    'docs/architecture.md',
    'docs/aud-009-xmind-desktop-validation.md',
    'docs/cli.md',
    'docs/decisions/ADR-0001-xmind-sdk.md',
    'docs/grammar.md',
    'docs/ir-specification.md',
    'docs/quality-and-testing.md',
    'docs/schema-validation.md',
    'docs/style-system.md',
    'docs/user-guide.md',
    'docs/versioning-and-compatibility.md',
  ]);
  const unexpectedDocs = packagedFiles.filter(
    (file) => file.startsWith('docs/') && !allowedDocs.has(file),
  );
  if (unexpectedDocs.length > 0) {
    throw new Error(`El paquete incluye documentación no autorizada: ${unexpectedDocs.join(', ')}`);
  }
  const sourceMaps = packagedFiles.filter((file) => file.endsWith('.map'));
  if (sourceMaps.length > 0) {
    throw new Error(`El paquete incluye source maps sin fuentes: ${sourceMaps.join(', ')}`);
  }
  if (!packagedFiles.includes('dist/BUILD-MANIFEST.json')) {
    throw new Error('El paquete no incluye dist/BUILD-MANIFEST.json.');
  }
  const packedPackageJson = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'));
  if (Object.keys(packedPackageJson.exports ?? {}).length !== 0) {
    throw new Error('El paquete debe permanecer explícitamente CLI-only (exports vacío).');
  }
  if (!readdirSync(outputDirectory).includes(packInfo[0].filename)) {
    throw new Error('npm pack no generó el tarball esperado.');
  }

  run(
    process.execPath,
    [npmCli, 'install', '--prefix', installDirectory, '--no-audit', '--no-fund', tarball],
    'clean package install',
  );

  const installedRoot = join(installDirectory, 'node_modules', 'xmind-md-ts');
  const manifest = JSON.parse(
    readFileSync(join(installedRoot, 'dist', 'BUILD-MANIFEST.json'), 'utf8'),
  );
  if (manifest.package !== 'xmind-md-ts' || manifest.version !== packedPackageJson.version) {
    throw new Error('El manifiesto de build no coincide con el paquete instalado.');
  }
  if (!manifest.sourceCommit || manifest.sourceCommit === 'unknown') {
    throw new Error('El manifiesto de build no identifica el commit de origen.');
  }

  const installedCli = join(installedRoot, 'bin', 'xmind-md.js');
  run(process.execPath, [installedCli, '--help'], 'CLI instalada --help');
  run(process.execPath, [installedCli, '--version'], 'CLI instalada --version');
  run(
    process.execPath,
    [installedCli, 'validate', join(packageRoot, 'examples', 'quick-start.md')],
    'validación del ejemplo desde la CLI instalada',
  );
  process.stdout.write('OK: package installed in a clean directory.\n');
} finally {
  rmSync(outputDirectory, { recursive: true, force: true });
}
