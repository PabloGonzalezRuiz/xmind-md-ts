import { validateIrSchema, type IrSchemaValidationDiagnostic } from './schema-validator.js';
import {
  validateIrDocument,
  type IrValidationDiagnostic,
  type IrValidationOptions,
} from './semantic-validator.js';

export type CompleteIrValidationDiagnostic = IrSchemaValidationDiagnostic | IrValidationDiagnostic;

export interface CompleteIrValidationResult {
  valid: boolean;
  diagnostics: CompleteIrValidationDiagnostic[];
}

/**
 * Ejecuta la validación estructural y, solo si esta pasa, la semántica del IR.
 * Evita recorrer como IR estructurado datos cuya forma todavía no es válida.
 */
export function validateIr(
  input: unknown,
  options: IrValidationOptions = {},
): CompleteIrValidationResult {
  const schemaResult = validateIrSchema(input);

  if (!schemaResult.valid) {
    return schemaResult;
  }

  return validateIrDocument(input, options);
}
