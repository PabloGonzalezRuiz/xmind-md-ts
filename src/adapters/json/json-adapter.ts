import type { IrDocument } from '../../../spec/ir-v1.types.js';

/**
 * Serializa un IR validado como JSON UTF-8 determinista.
 * No valida ni modifica el documento; esas responsabilidades pertenecen
 * al pipeline de validación y al llamador, respectivamente.
 */
export function serializeIrJson(ir: IrDocument): string {
  return `${JSON.stringify(ir, null, 2)}\n`;
}
