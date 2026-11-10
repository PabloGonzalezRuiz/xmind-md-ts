/**
 * Punto de entrada provisional del proyecto.
 *
 * La lógica de dominio se incorporará en fases posteriores.
 */
export const applicationName = 'xmind-md-ts';
export const applicationVersion = '0.1.0';

export {
  MarkdownParseError,
  parseMarkdown,
  parseMarkdownWithDiagnostics,
} from './markdown/parser.js';
export type {
  MarkdownParserOptions,
  MarkdownParseResult,
  ParserDiagnostic,
} from './markdown/parser.js';

export { validateIrDocument } from './validation/semantic-validator.js';
export type {
  IrValidationDiagnostic,
  IrValidationOptions,
  IrValidationResult,
} from './validation/semantic-validator.js';

export { resolveIrStyles } from './styles/style-engine.js';
export type {
  ResolvedStyle,
  StyleLayer,
  StyleProvenance,
  StyleResolutionDiagnostic,
  StyleResolutionResult,
} from './styles/style-engine.js';
export {
  getSystemStyleDefaults,
  isStylePropertyApplicable,
  STYLE_PROPERTY_CATALOG,
  validateStyleProperty,
} from './styles/catalog.js';
export type {
  StyleElementType,
  StylePropertyDefinition,
  StylePropertyKind,
  StylePropertyName,
} from './styles/catalog.js';
