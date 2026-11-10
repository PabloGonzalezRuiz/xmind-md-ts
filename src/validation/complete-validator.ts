import { validateIrDocument } from './semantic-validator.js';
import type { IrValidationOptions, IrValidationResult } from './semantic-validator.js';
import { validateIrSchema } from './schema-validator.js';
import type { IrSchemaDiagnostic } from './schema-validator.js';

export interface IrCompleteValidationResult {
  valid: boolean;
  diagnostics: Array<IrSchemaDiagnostic | IrValidationResult['diagnostics'][number]>;
}

/**
 * Ejecuta las puertas estructural y semántica en orden.
 * La validación semántica solo se ejecuta si el documento cumple el schema.
 */
export function validateIrDocumentComplete(
  input: unknown,
  options: IrValidationOptions = {},
): IrCompleteValidationResult {
  const structural = validateIrSchema(input);
  if (!structural.valid) return structural;

  return validateIrDocument(input, options);
}
