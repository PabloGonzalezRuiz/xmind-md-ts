import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.env.XMIND_GENERATOR_PACKAGE;
const out = process.env.XMIND_GENERATOR_OUTPUT;
assert.ok(root && out);
await mkdir(out, { recursive: true });

const metadata = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
assert.equal(metadata.name, 'xmind-generator');
assert.equal(metadata.version, '1.0.1');

const require = createRequire(join(root, 'package.json'));
const resolution = {};
for (const dep of ['uuid', 'jszip']) {
  try {
    resolution[dep] = require.resolve(dep);
  } catch {
    resolution[dep] = null;
  }
}

const report = {
  package: metadata.name,
  version: metadata.version,
  resolution,
  result: 'pending',
};
try {
  const { Workbook, RootTopic, Topic, Summary, Relationship } = await import(
    pathToFileURL(join(root, 'lib/esm/exports.js')).href
  );
  const map = RootTopic('Ley de prueba')
    .sheetTitle('Legislación')
    .children([
      Topic('Artículo 1')
        .ref('art1')
        .labels(['Artículo', 'Importante'])
        .note('Nota de prueba')
        .children([Topic('Apartado A').ref('a'), Topic('Apartado B').ref('b')])
        .summaries([Summary('Síntesis', { from: 'a', to: 'b' })]),
      Topic('Artículo 2').ref('art2'),
    ])
    .relationships([Relationship('Referencia', { from: 'art1', to: 'art2' })]);

  const bytes = Buffer.from(await Workbook(map).archive());
  assert.equal(bytes.subarray(0, 2).toString(), 'PK');
  await writeFile(join(out, 'generator-prototype.xmind'), bytes);

  const JSZip = require('jszip');
  const zip = await JSZip.loadAsync(bytes);
  for (const name of ['content.json', 'metadata.json', 'manifest.json']) {
    assert.ok(zip.file(name), name);
  }
  const sheets = JSON.parse(await zip.file('content.json').async('string'));
  assert.equal(sheets[0].rootTopic.title, 'Ley de prueba');
  assert.deepEqual(sheets[0].rootTopic.children.attached[0].labels, ['Artículo', 'Importante']);
  assert.equal(sheets[0].rootTopic.children.attached[0].summaries.length, 1);
  assert.equal(sheets[0].relationships.length, 1);
  report.result = 'pass';
  report.entries = Object.keys(zip.files);
} catch (error) {
  report.result = 'fail';
  report.error = String((error && error.stack) || error);
}

await writeFile(
  join(out, 'generator-prototype-report.json'),
  JSON.stringify(report, null, 2) + '\n',
);
console.log(JSON.stringify(report, null, 2));
if (report.result !== 'pass') process.exitCode = 1;
