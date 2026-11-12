import console from 'node:console';
import { readFile } from 'node:fs/promises';
import { URL } from 'node:url';

const packagePath = new URL('../package.json', import.meta.url);
const entryPath = new URL('../src/index.ts', import.meta.url);
const packageJson = JSON.parse(await readFile(packagePath, 'utf8'));
const entrySource = await readFile(entryPath, 'utf8');
const versionMatch = entrySource.match(/export const applicationVersion = ['"]([^'"]+)['"];/);

if (!versionMatch) {
  throw new Error('No se ha encontrado applicationVersion en src/index.ts.');
}

if (versionMatch[1] !== packageJson.version) {
  throw new Error(
    `La versión CLI (${versionMatch[1]}) no coincide con package.json (${packageJson.version}).`,
  );
}

console.log(`Versión de paquete y CLI sincronizada: ${packageJson.version}`);
