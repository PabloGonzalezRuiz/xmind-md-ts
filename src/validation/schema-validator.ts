import Ajv2020 from 'ajv2020/dist/2020.js';
import type { AnySchema } from 'ajv2020';
import addFormats from 'ajv-formats';

import irSchema from '../../spec/ir-v1.schema.json' with { type: 'json' };

export interface IrSchemaDiagnostic {
  code: string;
  severity: 'error';
  message: string;
  path: string;
  schemaPath: string;
  keyword: string;
}

export interface IrSchemaValidationResult {
  valid: boolean;
  diagnostics: IrSchemaDiagnostic[];
}

const ajv = new Ajv2020({
  allErrors: true,
  strict: true,
  validateFormats: true,
  coerceTypes: false,
  removeAdditional: false,
  useDefaults: false,
});

addFormats(ajv);

const validate = ajv.compile(irSchema as AnySchema);

function toInstancePath(pointer: string): string {
  if (!pointer) return '$';

  return pointer
    .split('/')
    .slice(1)
    .reduce((path, segment) => {
      const key = segment.replace(/~1/g, '/').replace(/~0/g, '~');
      return /^\\d+$/.test(key) ? `${path}[${key}]` : `${path}.${key}`;
    }, '$');
}

/**
 * Valida la estructura del IR contra el JSON Schema Draft 2020-12.
 * No aplica coerciones, defaults ni elimina propiedades: la entrada no se modifica.
 */
export function validateIrSchema(input: unknown): IrSchemaValidationResult {
  if (validate(input)) return { valid: true, diagnostics: [] };

  const diagnostics = (validate.errors ?? []).map((error) => ({
    code: `IR_SCHEMA_${error.keyword.toUpperCase()}`,
    severity: 'error' as const,
    message: error.message ?? 'El documento no cumple el JSON Schema del IR.',
    path: toInstancePath(error.instancePath),
    schemaPath: error.schemaPath,
    keyword: error.keyword,
  }));

  return { valid: false, diagnostics };
}
