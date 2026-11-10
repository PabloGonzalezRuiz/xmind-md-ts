import { describe, expect, it } from 'vitest';

import {
  MarkdownParseError,
  parseMarkdown,
  parseMarkdownWithDiagnostics,
} from '../src/markdown/parser.js';

describe('Markdown parser', () => {
  it('creates one IR document and one sheet from a heading tree', () => {
    const ir = parseMarkdown('# Root {#root}\n\n## Child {#child}\n\nText.', {
      sourcePath: 'notes/map.md',
    });

    expect(ir.irVersion).toBe('1.0.0');
    expect(ir.document.source).toBe('notes/map.md');
    expect(ir.sheet.rootTopic.id).toBe('root');
    expect(ir.sheet.rootTopic.children[0]?.id).toBe('child');
    expect(ir.sheet.rootTopic.children[0]?.content[0]).toMatchObject({
      type: 'paragraph',
      runs: [{ text: 'Text.' }],
    });
  });

  it('preserves inline marks, links, lists, tables, quotes and code', () => {
    const ir = parseMarkdown(
      [
        '# Root',
        '',
        '**bold** *italic* ~~strike~~ `code` [link](https://example.com)',
        '',
        '- first',
        '- second',
        '',
        '| A | B |',
        '|:--|--:|',
        '| x | y |',
        '',
        '> quoted',
        '',
        '```ts',
        'const answer = 42;',
        '```',
      ].join('\n'),
    );

    const blocks = ir.sheet.rootTopic.content;
    expect(blocks[0]).toMatchObject({
      type: 'paragraph',
      runs: [
        { text: 'bold', marks: ['strong'] },
        { text: ' ' },
        { text: 'italic', marks: ['emphasis'] },
        { text: ' ' },
        { text: 'strike', marks: ['strike'] },
        { text: ' ' },
        { text: 'code', marks: ['inlineCode'] },
        { text: ' ' },
        { text: 'link', link: 'https://example.com' },
      ],
    });
    expect(blocks[1]).toMatchObject({
      type: 'list',
      ordered: false,
      items: [{ blocks: [{ type: 'paragraph' }] }],
    });
    expect(blocks[2]).toMatchObject({
      type: 'table',
      alignments: ['left', 'right'],
      rows: [{ cells: [{ blocks: [{ type: 'paragraph' }] }] }],
    });
    expect(blocks[3]).toMatchObject({ type: 'quote', blocks: [{ type: 'paragraph' }] });
    expect(blocks[4]).toMatchObject({ type: 'code', language: 'ts', value: 'const answer = 42;' });
  });

  it('reads front matter, map style and Markdown notes', () => {
    const ir = parseMarkdown(
      [
        '---',
        'id: doc:test',
        'title: Document title',
        'style_set: theme:test',
        'settings:',
        '  layout: logic',
        '---',
        '# Root',
        '',
        ':::xmind',
        'role: main',
        'style: highlighted',
        ':::',
        '',
        ':::xmind-note',
        'A **note**.',
        ':::',
      ].join('\n'),
    );

    expect(ir.document).toMatchObject({ id: 'doc:test', title: 'Document title' });
    expect(ir.sheet).toMatchObject({
      title: 'Document title',
      defaultStyleSetId: 'theme:test',
      settings: { layout: 'logic' },
      rootTopic: { style: { role: 'main', styleId: 'highlighted' } },
    });
    expect(ir.sheet.rootTopic.notes?.[0]).toMatchObject({
      type: 'paragraph',
      runs: [{ text: 'A ' }, { text: 'note', marks: ['strong'] }, { text: '.' }],
    });
  });

  it('registers image assets and deduplicates repeated source URIs', () => {
    const ir = parseMarkdown('# Root\n\n![Diagram](images/map.png)\n\n![Again](images/map.png)');
    expect(ir.assets).toHaveLength(1);
    expect(ir.sheet.rootTopic.content).toMatchObject([
      { type: 'image', assetId: ir.assets[0]?.id, alt: 'Diagram' },
      { type: 'image', assetId: ir.assets[0]?.id, alt: 'Again' },
    ]);
  });

  it('parses relationships, boundaries and summaries', () => {
    const ir = parseMarkdown(
      [
        '# Root {#root}',
        '',
        '## A {#a}',
        '',
        '## B {#b}',
        '',
        ':::xmind-relationship',
        'id: rel:1',
        'from: a',
        'to: b',
        'label: depends on',
        ':::',
        '',
        ':::xmind-boundary',
        'id: boundary:1',
        'topics: [a, b]',
        ':::',
        '',
        ':::xmind-summary',
        'id: summary:1',
        'topics:',
        '  - a',
        '  - b',
        ':::',
      ].join('\n'),
    );

    expect(ir.sheet.relationships[0]).toMatchObject({
      id: 'rel:1',
      sourceTopicId: 'a',
      targetTopicId: 'b',
      label: 'depends on',
    });
    expect(ir.sheet.boundaries[0]?.topicIds).toEqual(['a', 'b']);
    expect(ir.sheet.summaries[0]?.topicIds).toEqual(['a', 'b']);
  });

  it('rejects missing roots, multiple roots, skipped levels and duplicate explicit IDs', () => {
    expect(() => parseMarkdown('No heading')).toThrowError(MarkdownParseError);
    expect(() => parseMarkdown('# One\n\n# Two')).toThrowError(/exactamente un encabezado H1/);
    expect(() => parseMarkdown('# Root\n\n#### Gap')).toThrowError(/no tiene un padre/);
    expect(() => parseMarkdown('# Root\n\n## Same {#same}\n\n## Same {#same}')).toThrowError(
      /duplicado/,
    );
  });

  it('reports unknown front matter keys in compatible mode and rejects them in strict mode', () => {
    const source = '---\nunknown: value\n---\n# Root';
    const result = parseMarkdownWithDiagnostics(source);
    expect(result.diagnostics[0]?.code).toBe('MD_FRONTMATTER_UNKNOWN_KEY');
    expect(() => parseMarkdown(source, { mode: 'strict' })).toThrowError(
      /Clave de front matter desconocida/,
    );
  });
});
