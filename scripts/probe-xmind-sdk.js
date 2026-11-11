import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const packageDirectory = process.env.XMIND_SDK_PACKAGE;
assert.ok(packageDirectory, 'XMIND_SDK_PACKAGE must point to the isolated xmind installation');

const packageEntry = path.join(packageDirectory, 'dist', 'index.js');
const require = createRequire(import.meta.url);
const sdkRequire = createRequire(packageEntry);
const { Workbook, Topic, Marker, Zipper } = require(packageEntry);
const JSZip = sdkRequire('jszip');

assert.equal(typeof Workbook, 'function');
assert.equal(typeof Topic, 'function');
assert.equal(typeof Marker, 'function');
assert.equal(typeof Zipper, 'function');

const outputDirectory = await mkdtemp(path.join(tmpdir(), 'xmind-sdk-probe-'));
const outputPath = path.join(outputDirectory, 'aud-006-probe.xmind');

try {
  const workbook = new Workbook();
  const sheet = workbook.createSheet('AUD-006 SDK probe', 'Root topic');
  const topic = new Topic({ sheet });

  topic.add({ title: 'Branch A', labels: 'probe-label' });
  const branchAId = topic.cid();
  assert.ok(branchAId);

  topic.on(branchAId).add({ title: 'Child A1' }).add({ title: 'Child A2' });
  const childA1Id = topic.cid('Child A1');
  const childA2Id = topic.cid('Child A2');
  assert.ok(childA1Id);
  assert.ok(childA2Id);

  topic.on(branchAId).note('Probe note');

  const markerGroup = Marker.groups()[0];
  const markerName = Marker.names(markerGroup)[0];
  assert.ok(markerGroup);
  assert.ok(markerName);
  topic.on(branchAId).marker(new Marker()[markerGroup](markerName));

  topic.on(childA1Id).summary({ title: 'Probe summary', edge: childA2Id });
  assert.equal(workbook.theme('AUD-006 SDK probe', 'robust'), true);

  const validation = workbook.validate();
  assert.equal(validation.status, true, JSON.stringify(validation.errors));

  const zipper = new Zipper({
    path: outputDirectory,
    workbook,
    filename: 'aud-006-probe',
  });
  assert.equal(await zipper.save(), true);

  const archiveBytes = await readFile(outputPath);
  const archive = await JSZip.loadAsync(archiveBytes);
  const expectedEntries = ['content.json', 'metadata.json', 'manifest.json', 'content.xml'];
  for (const entry of expectedEntries) {
    assert.ok(archive.file(entry), `Missing archive entry: ${entry}`);
  }

  const content = JSON.parse(await archive.file('content.json').async('string'));
  assert.equal(content.length, 1);
  assert.equal(content[0].title, 'AUD-006 SDK probe');
  assert.equal(content[0].rootTopic.title, 'Root topic');

  const branch = content[0].rootTopic.children.attached.find((item) => item.title === 'Branch A');
  assert.ok(branch, 'Branch A must be present in content.json');
  assert.equal(branch.notes.plain.content, 'Probe note');
  assert.equal(branch.labels, 'probe-label');
  assert.equal(branch.markers.length, 1);
  assert.equal(branch.children.attached.length, 2);
  assert.equal(branch.summaries.length, 1);

  const manifest = JSON.parse(await archive.file('manifest.json').async('string'));
  assert.ok(manifest['file-entries']);
  assert.ok(Object.hasOwn(manifest['file-entries'], 'content.json'));

  topic.on(branchAId).addLabel('helper-defect-probe');
  const labelHelperValidation = workbook.validate();
  assert.equal(labelHelperValidation.status, false);
  assert.ok(
    labelHelperValidation.errors.some((error) => String(error.dataPath).endsWith('.labels')),
    'The addLabel helper/schema mismatch must remain visible in this compatibility probe',
  );

  console.log(
    JSON.stringify(
      {
        sdk: 'xmind@2.2.33',
        node: process.version,
        moduleInterop: 'CommonJS package loaded from ESM using createRequire',
        workbookValidation: validation.status,
        addLabelHelper: 'known defect: helper writes array while schema expects string',
        addLabelHelperValidation: labelHelperValidation.status,
        generatedFile: path.basename(outputPath),
        archiveEntries: expectedEntries,
        verifiedFeatures: [
          'sheet',
          'nested topics',
          'plain-text note',
          'label via low-level string field',
          'marker',
          'summary',
          'preset theme',
          'ZIP package',
          'content.json',
          'manifest.json',
        ],
      },
      null,
      2,
    ),
  );
} finally {
  await rm(outputDirectory, { recursive: true, force: true });
}
