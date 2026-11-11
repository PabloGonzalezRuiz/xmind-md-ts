import { spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import process from 'node:process';

const packageRoot = resolve('.');
const outputDirectory = mkdtempSync(join(tmpdir(), 'xmind-md-ts-package-'));
const installDirectory = join(outputDirectory, 'install');

function run(command, args, description, options = {}) {
  const result = spawnSync(command, args, {
    cwd: packageRoot,
    encoding: 'utf8',
    ...options,
  });
  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout);
    throw new Error(
      `Falló ${description} (exit ${result.status}).`,
    );
  }
  return result.stdout;
}

try {
  const packed = run(
    'npm',
    ['pack', '--json', '--pack-destination', outputDirectory],
    'npm pack',
  );
  const packInfo = JSON.parse(packed);
  const tarball = join(outputDirectory, packInfo[0].filename);
  if (!readdirSync(outputDirectory).includes(packInfo[0].filename)) {
    throw new Error('npm pack no generó el tarball esperado.');
  }

  run(
    'npm',
    ['install', '--prefix', installDirectory, '--no-audit', '--no-fund', tarball],
    'instalación limpia del paquete',
  );

  const installedCli = join(
    installDirectory,
    'node_modules',
    'xmind-md-ts',
    'bin',
    'xmind-md.js',
  );
  run(process.execPath, [installedCli, '--help'], 'CLI instalada --help');
  run(process.execPath, [installedCli, '--version'], 'CLI instalada --version');
  run(
    process.execPath,
    [installedCli, 'validate', join(packageRoot, 'examples', 'quick-start.md')],
    'validación del ejemplo desde la CLI instalada',
  );
  process.stdout.write(
    'OK: paquete npm empaquetado e instalado en un directorio limpio.\n',
  );
} finally {
  rmSync(outputDirectory, { recursive: true, force: true });
}
