import { describe, expect, it } from 'vitest';

import type { IrDocument } from '../spec/ir-v1.types.js';
import { parseMarkdown } from '../src/markdown/parser.js';
import { validateIrDocument } from '../src/validation/semantic-validator.js';

function validIr(): IrDocument {
  return {
    irVersion: '1.0.0',
    document: { id: 'doc:test', title: 'Test' },
    sheet: {
      id: 'sheet:test',
      title: 'Test',
      rootTopic: {
        id: 'topic:root',
        title: 'Root',
        children: [],
        content: [],
      },
      relationships: [],
      boundaries: [],
      summaries: [],
    },
    assets: [],
    styleSets: [],
  };
}

function codes(result: ReturnType<typeof validateIrDocument>): string[] {
  return result.diagnostics.map((diagnostic) => diagnostic.code);
}

describe('IR semantic validator', () => {
  it('accepts a valid minimal IR and does not mutate it', () => {
    const ir = validIr();
    const before = JSON.stringify(ir);

    const result = validateIrDocument(ir);

    expect(result).toEqual({ valid: true, diagnostics: [] });
    expect(JSON.stringify(ir)).toBe(before);
  });

  it('accepts IR produced by the Markdown parser', () => {
    const ir = parseMarkdown('# Root\\n\\n## Child {#child}\\n\\n![Diagram](images/map.png)');

    expect(validateIrDocument(ir).valid).toBe(true);
  });

  it('accepts the document ID in its separate namespace', () => {
    const ir = validIr();
    ir.document.id = 'topic:root';

    expect(validateIrDocument(ir).valid).toBe(true);
  });

  it('detects duplicate IDs across topics and other document entities', () => {
    const ir = validIr();
    ir.sheet.rootTopic.children.push({
      id: 'asset:1',
      title: 'Child',
      children: [],
      content: [],
    });
    ir.assets.push({ id: 'asset:1', uri: 'images/diagram.png' });

    expect(codes(validateIrDocument(ir))).toContain('IR_ID_DUPLICATE');
  });

  it('checks relationship endpoints and rejects self-relations', () => {
    const ir = validIr();
    ir.sheet.relationships.push(
      { id: 'rel:missing', sourceTopicId: 'unknown', targetTopicId: 'topic:root' },
      { id: 'rel:self', sourceTopicId: 'topic:root', targetTopicId: 'topic:root' },
    );

    const result = validateIrDocument(ir);
    expect(codes(result)).toEqual(
      expect.arrayContaining(['IR_RELATIONSHIP_SOURCE', 'IR_RELATIONSHIP_SELF']),
    );
  });

  it('checks boundary and summary references and duplicate members', () => {
    const ir = validIr();
    ir.sheet.boundaries.push({ id: 'boundary:1', topicIds: ['missing'] });
    ir.sheet.summaries.push({ id: 'summary:1', topicIds: ['topic:root', 'topic:root'] });

    expect(codes(validateIrDocument(ir))).toEqual(
      expect.arrayContaining(['IR_TOPIC_GROUP_REFERENCE', 'IR_TOPIC_GROUP_DUPLICATE']),
    );
  });

  it('checks image references inside nested content blocks', () => {
    const ir = validIr();
    ir.sheet.rootTopic.content.push({
      type: 'quote',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [{ blocks: [{ type: 'image', assetId: 'asset:missing', alt: '' }] }],
        },
      ],
    });

    expect(codes(validateIrDocument(ir))).toContain('IR_ASSET_REFERENCE');
  });

  it('checks default style sets, inherited references, roles and named styles', () => {
    const ir = validIr();
    ir.sheet.defaultStyleSetId = 'theme:missing';
    ir.sheet.rootTopic.style = { role: 'main', styleId: 'focus' };

    expect(codes(validateIrDocument(ir))).toEqual(
      expect.arrayContaining([
        'IR_DEFAULT_STYLE_SET_REFERENCE',
        'IR_STYLE_ROLE_REFERENCE',
        'IR_STYLE_REFERENCE',
      ]),
    );
  });

  it('resolves role and named-style references through inherited style sets', () => {
    const ir = validIr();
    ir.sheet.defaultStyleSetId = 'theme:child';
    ir.sheet.rootTopic.style = { role: 'main', styleId: 'focus' };
    ir.styleSets = [
      {
        id: 'theme:base',
        roles: { main: { shape: 'rounded' } },
        styles: { focus: { color: '#123456' } },
      },
      { id: 'theme:child', extends: 'theme:base' },
    ];

    expect(validateIrDocument(ir).valid).toBe(true);
  });

  it('checks missing style-set parents and inheritance cycles', () => {
    const ir = validIr();
    ir.styleSets = [
      { id: 'theme:a', extends: 'theme:b' },
      { id: 'theme:b', extends: 'theme:a' },
      { id: 'theme:c', extends: 'theme:missing' },
    ];

    expect(codes(validateIrDocument(ir))).toEqual(
      expect.arrayContaining(['IR_STYLE_SET_CYCLE', 'IR_STYLE_SET_PARENT']),
    );
  });

  it('checks table dimensions and alignment count', () => {
    const ir = validIr();
    ir.sheet.rootTopic.content.push({
      type: 'table',
      alignments: ['left'],
      rows: [
        {
          cells: [
            { blocks: [{ type: 'paragraph', runs: [{ text: 'A' }] }] },
            { blocks: [{ type: 'paragraph', runs: [{ text: 'B' }] }] },
          ],
        },
        { cells: [{ blocks: [{ type: 'paragraph', runs: [{ text: 'C' }] }] }] },
      ],
    });

    expect(codes(validateIrDocument(ir))).toEqual(
      expect.arrayContaining(['IR_TABLE_ALIGNMENTS', 'IR_TABLE_RECTANGULAR']),
    );
  });

  it('rejects malformed asset URIs and invalid IDs', () => {
    const ir = validIr();
    ir.sheet.rootTopic.id = ' topic with spaces ';
    ir.assets.push({ id: 'asset:1', uri: 'images/%ZZ.png' });

    expect(codes(validateIrDocument(ir))).toEqual(
      expect.arrayContaining(['IR_ID_INVALID', 'IR_ASSET_URI']),
    );
  });

  it('checks relative asset paths against an optional allowed root', () => {
    const ir = validIr();
    ir.document.source = '/workspace/maps/map.md';
    ir.assets.push({ id: 'asset:safe', uri: '../images/map.png' });
    ir.assets.push({ id: 'asset:unsafe', uri: '%2e%2e/%2e%2e/private/secret.png' });

    const result = validateIrDocument(ir, { assetRootDirectory: '/workspace' });

    expect(codes(result)).toContain('IR_ASSET_PATH_ESCAPE');
    expect(result.diagnostics.find((item) => item.code === 'IR_ASSET_PATH_ESCAPE')?.path).toBe(
      '$.assets[1].uri',
    );
  });

  it('checks nested content depth limits', () => {
    const ir = validIr();
    ir.sheet.rootTopic.content.push({
      type: 'quote',
      blocks: [
        {
          type: 'quote',
          blocks: [{ type: 'paragraph', runs: [{ text: 'Deep' }] }],
        },
      ],
    });

    expect(codes(validateIrDocument(ir, { maxDepth: 1 }))).toContain('IR_CONTENT_DEPTH');
  });

  it('enforces configurable topic-depth limits', () => {
    const ir = validIr();
    ir.sheet.rootTopic.children.push({
      id: 'topic:child',
      title: 'Child',
      children: [{ id: 'topic:grandchild', title: 'Grandchild', children: [], content: [] }],
      content: [],
    });

    expect(codes(validateIrDocument(ir, { maxDepth: 2 }))).toContain('IR_TOPIC_DEPTH');
  });

  it('returns a diagnostic instead of throwing for a non-object input', () => {
    const result = validateIrDocument(null);

    expect(result.valid).toBe(false);
    expect(result.diagnostics[0]?.code).toBe('IR_DOCUMENT_TYPE');
  });
});
