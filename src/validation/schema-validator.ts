import { createRequire } from 'node:module';

import type { AnySchema } from 'ajv2020';

import irSchema from '../../spec/ir-v1.schema.json' with { type: 'json' };

export interface IrSchemaDiagnostic {
  code: string;
  severity: 'error';
  message: string;
  path: string;
  schemaPath: string;
  keyword: string;
  params: Record<string, unknown>;
}

export interface IrSchemaValidationResult {
  valid: boolean;
  diagnostics: IrSchemaDiagnostic[];
}

interface AjvError {
  instancePath: string;
  schemaPath: string;
  keyword: string;
  message?: string;
  params: Record<string, unknown>;
}

interface ValidateFunction {
  (input: unknown): boolean;
  errors?: AjvError[] | null;
}

interface Ajv2020Instance {
  compile(schema: AnySchema): ValidateFunction;
}

type Ajv2020Constructor = new (options: Record<string, unknown>) => Ajv2020Instance;

const require = createRequire(import.meta.url);
const Ajv2020 = require('ajv2020/dist/2020.js') as Ajv2020Constructor;
const addFormats = require('ajv-formats') as (instance: Ajv2020Instance) => void;

const ajv = new Ajv2020({
  allErrors: true,
  strict: true,
  allowUnionTypes: true,
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
      return /^\d+$/.test(key) ? `${path}[${key}]` : `${path}.${key}`;
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
    params: error.params,
  }));

  return { valid: false, diagnostics };
}
