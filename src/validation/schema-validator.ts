import Ajv2020Module from 'ajv/dist/2020.js';
import addFormatsModule from 'ajv-formats';
import type { AnySchema, ErrorObject } from 'ajv';

import irSchema from '../../spec/ir-v1.schema.json' with { type: 'json' };

const Ajv2020 = Ajv2020Module.default;
const addFormats = addFormatsModule.default;

export interface IrSchemaValidationDiagnostic {
  code: 'IR_SCHEMA_INVALID';
  severity: 'error';
  message: string;
  path: string;
  keyword: string;
  schemaPath: string;
}

export interface IrSchemaValidationResult {
  valid: boolean;
  diagnostics: IrSchemaValidationDiagnostic[];
}

const ajv = new Ajv2020({
  allErrors: true,
  strict: true,
  allowUnionTypes: true,
  validateFormats: true,
});

addFormats(ajv);

const validateSchema = ajv.compile(irSchema as AnySchema);

function toDiagnosticPath(instancePath: string): string {
  if (!instancePath) return '$';

  return instancePath
    .split('/')
    .slice(1)
    .reduce((path, segment) => {
      const property = segment.replace(/~1/g, '/').replace(/~0/g, '~');
      return /^\d+$/.test(property) ? `${path}[${property}]` : `${path}.${property}`;
    }, '$');
}

/**
 * Comprueba la estructura de un valor desconocido contra el JSON Schema IR v1.
 * La validación semántica de referencias y relaciones se ejecuta por separado.
 */
export function validateIrSchema(input: unknown): IrSchemaValidationResult {
  if (validateSchema(input)) {
    return { valid: true, diagnostics: [] };
  }

  const diagnostics = (validateSchema.errors ?? []).map((error: ErrorObject) => ({
    code: 'IR_SCHEMA_INVALID' as const,
    severity: 'error' as const,
    message: error.message ?? 'El documento no cumple el JSON Schema IR v1.',
    path: toDiagnosticPath(error.instancePath),
    keyword: error.keyword,
    schemaPath: error.schemaPath,
  }));

  return { valid: false, diagnostics };
}
