
import { describe, expect, it } from 'vitest';

import { validateIrDocumentComplete } from '../src/validation/complete-validator.js';
import {
  parseMarkdown,
  parseMarkdownWithDiagnostics,
  MarkdownParseError,
} from '../src/markdown/parser.js';
import { validateIrSchema } from '../src/validation/schema-validator.js';

function fixture(path: string): string {
  return readFileSync(new URL(`./fixtures/markdown/${path}`, import.meta.url), 'utf8');
}

describe('Markdown parser conformance corpus', () => {
  it('maps every supported Markdown block to the expected IR structure', () => {
    const ir = parseMarkdown(fixture('valid/core-blocks.md'), {
      sourcePath: 'corpus/core-blocks.md',
    });
    const root = ir.sheet.rootTopic;

    expect(ir.document).toMatchObject({ id: 'doc:corpus', title: 'Corpus de bloques' });
    expect(ir.sheet.settings).toEqual({ layout: 'logic' });
    expect(root.id).toBe('root');
    expect(root.content.map((block) => block.type)).toEqual([
      'paragraph',
      'list',
      'list',
      'table',
      'quote',
      'code',
      'thematicBreak',
      'image',
      'image',
    ]);
    expect(root.content[0]).toMatchObject({
      type: 'paragraph',
      runs: [
        { text: 'Párrafo con ' },
        { text: 'negrita', marks: ['strong'] },
        { text: ', ' },
        { text: 'cursiva', marks: ['emphasis'] },
        { text: ', ' },
        { text: 'tachado', marks: ['strike'] },
        { text: ', ' },
        { text: 'código', marks: ['inlineCode'] },
        { text: ' y ' },
        { text: 'enlace', link: 'https://example.com' },
        { text: '.' },
      ],
    });
    expect(root.content[1]).toMatchObject({
      type: 'list',
      ordered: false,
      items: [
        { blocks: [{ type: 'paragraph' }, { type: 'list' }] },
        { blocks: [{ type: 'paragraph' }] },
      ],
    });
    expect(root.content[2]).toMatchObject({
      type: 'list',
      ordered: true,
      start: 1,
    });
    expect(root.content[3]).toMatchObject({
      type: 'table',
      alignments: ['left', 'right'],
    });
    const table = root.content[3];
    expect(table?.type).toBe('table');
    if (table?.type === 'table') {
      expect(table.rows).toHaveLength(2);
      expect(table.rows[0]?.cells).toHaveLength(2);
      expect(table.rows[0]?.cells[0]?.blocks[0]).toMatchObject({
        type: 'paragraph',
        runs: [{ text: 'Columna A' }],
      });
    }
    expect(root.content[4]).toMatchObject({
      type: 'quote',
      blocks: [{ type: 'paragraph' }, { type: 'paragraph' }],
    });
    expect(root.content[5]).toMatchObject({
      type: 'code',
      language: 'typescript',
      value: 'const answer: number = 42;',
    });
    expect(root.content[6]).toMatchObject({ type: 'thematicBreak' });
    expect(ir.assets).toHaveLength(1);
    expect(root.content[7]).toMatchObject({
      type: 'image',
      assetId: ir.assets[0]?.id,
      alt: 'Diagrama',
      title: 'Diagrama principal',
    });
    expect(root.content[8]).toMatchObject({
      type: 'image',
      assetId: ir.assets[0]?.id,
      alt: 'Diagrama repetido',
    });
    expect(root.style).toEqual({
      role: 'main',
      styleId: 'destacado',
      overrides: { fill: '#fff2cc' },
    });
    expect(root.notes).toMatchObject([
      {
        type: 'paragraph',
        runs: [{ text: 'Nota con ' }, { text: 'formato', marks: ['strong'] }, { text: '.' }],
      },
    ]);
    expect(validateIrSchema(ir).valid).toBe(true);
  });

  it('maps relationship, boundary and summary directives and validates references', () => {
    const ir = parseMarkdown(fixture('valid/relationships-and-groups.md'));

    expect(ir.sheet.relationships).toMatchObject([
      {
        id: 'rel:origin-target',
        sourceTopicId: 'origin',
        targetTopicId: 'target',
        label: 'depende de',
        kind: 'association',
      },
    ]);
    expect(ir.sheet.boundaries).toMatchObject([
      { id: 'boundary:group', topicIds: ['origin', 'target'], label: 'Grupo' },
    ]);
    expect(ir.sheet.summaries).toMatchObject([
      { id: 'summary:group', topicIds: ['origin', 'target'], label: 'Resumen' },
    ]);
    expect(validateIrDocumentComplete(ir)).toEqual({ valid: true, diagnostics: [] });
  });

  it('maps front matter metadata and sheet settings', () => {
    const ir = parseMarkdown(fixture('valid/frontmatter.md'));

    expect(ir.document).toMatchObject({
      id: 'doc:frontmatter',
      title: 'Título del documento',
    });
    expect(ir.sheet).toMatchObject({
      title: 'Título del documento',
      defaultStyleSetId: 'theme:default',
      settings: { layout: 'logic', showLegend: true },
    });
    expect(validateIrSchema(ir).valid).toBe(true);
  });

  it.each([
    ['missing-root.md', 'MD_ROOT_HEADING'],
    ['multiple-roots.md', 'MD_MULTIPLE_ROOTS'],
    ['heading-gap.md', 'MD_HEADING_LEVEL_GAP'],
    ['content-before-root.md', 'MD_CONTENT_BEFORE_ROOT'],
    ['duplicate-topic-id.md', 'MD_DUPLICATE_TOPIC_ID'],
    ['unknown-directive.md', 'MD_UNKNOWN_DIRECTIVE'],
    ['invalid-directive-key.md', 'MD_DIRECTIVE_UNKNOWN_KEY'],
    ['invalid-relationship.md', 'MD_DIRECTIVE_FIELD'],
    ['invalid-boundary-topics.md', 'MD_DIRECTIVE_TOPICS'],
    ['invalid-frontmatter-settings.md', 'MD_FRONTMATTER_SETTINGS'],
  ])('rechaza %s con el código estable %s', (name, code) => {
    try {
      parseMarkdown(fixture(`invalid/${name}`));
      throw new Error(`Se esperaba MarkdownParseError ${code}`);
    } catch (error) {
      expect(error).toBeInstanceOf(MarkdownParseError);
      expect((error as MarkdownParseError).code).toBe(code);
    }
  });

  it('reports compatible-mode diagnostics with source locations', () => {
    const result = parseMarkdownWithDiagnostics(fixture('diagnostics/unsupported.md'), {
      sourcePath: 'corpus/unsupported.md',
    });

    expect(result.diagnostics.map((item) => item.code)).toEqual([
      'MD_FRONTMATTER_UNKNOWN_KEY',
      'MD_UNSUPPORTED_INLINE',
      'MD_UNSUPPORTED_INLINE',
      'MD_UNSUPPORTED_NODE',
    ]);
    expect(result.diagnostics[1]).toMatchObject({
      severity: 'warning',
      line: 6,
      column: 7,
    });
    expect(result.diagnostics[3]).toMatchObject({
      severity: 'warning',
      line: 8,
      column: 1,
    });
    expect(result.ir.sheet.rootTopic.sourcePosition).toMatchObject({
      file: 'corpus/unsupported.md',
      startLine: 4,
      startColumn: 1,
    });
  });

  it('strict mode rejects unsupported inline HTML at its source location', () => {
    try {
      parseMarkdown('# Raíz\n\nTexto <span>no soportado</span>.', { mode: 'strict' });
      throw new Error('Se esperaba MarkdownParseError');
    } catch (error) {
      expect(error).toBeInstanceOf(MarkdownParseError);
      expect(error).toMatchObject({
        code: 'MD_UNSUPPORTED_INLINE',
        line: 3,
        column: 7,
      });
    }
  });

  it('attaches source positions to topics and content blocks', () => {
    const ir = parseMarkdown(fixture('valid/core-blocks.md'), {
      sourcePath: 'corpus/core-blocks.md',
    });

    expect(ir.sheet.rootTopic.sourcePosition).toMatchObject({
      file: 'corpus/core-blocks.md',
      startLine: 7,
      startColumn: 1,
    });
    expect(ir.sheet.rootTopic.content[0]?.sourcePosition).toMatchObject({
      file: 'corpus/core-blocks.md',
      startLine: 9,
      startColumn: 1,
    });
    expect(ir.sheet.rootTopic.content[7]?.sourcePosition).toMatchObject({
      file: 'corpus/core-blocks.md',
    });
  });

  it('rejects directives in content-block context with a stable code', () => {
    expect(() => parseMarkdown('# Raíz\n\n> :::xmind\n> role: main\n> :::')).toThrowError(
      expect.objectContaining({ code: 'MD_DIRECTIVE_CONTEXT' }),
    );
  });
});
