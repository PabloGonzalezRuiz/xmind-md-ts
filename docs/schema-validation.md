# Validación estructural del IR

## Fuente de verdad

El contrato normativo y única fuente de verdad estructural es `spec/ir-v1.schema.json`, definido con JSON Schema Draft 2020-12. Los tipos publicados en `spec/ir-v1.types.ts` son un artefacto generado; no deben editarse manualmente.

El generador propio `scripts/generate-ir-types.js` se mantiene deliberadamente limitado a las construcciones que utiliza el contrato actual: referencias locales a `$defs`, objetos, propiedades obligatorias/opcionales, arrays, uniones `oneOf`/`anyOf`, enumeraciones, constantes y mapas `additionalProperties`. Si aparece una keyword estructural no soportada o una referencia externa, el generador falla en lugar de producir tipos aproximados en silencio.

Comandos:

- `npm run generate:types`: regenera `spec/ir-v1.types.ts`.
- `npm run check:generated-types`: comprueba que el archivo versionado coincide con la salida del generador.
- `npm run verify` y CI incluyen la comprobación de sincronización.

Las restricciones que TypeScript no puede expresar fielmente —por ejemplo, `minLength`, `pattern`, `format`, límites numéricos, `uniqueItems` y `additionalProperties: false`— siguen siendo exigibles en runtime mediante JSON Schema/Ajv. La unión TypeScript generada desde `oneOf` refleja las alternativas estructurales; la exclusividad de JSON Schema se garantiza en runtime. Los tipos no sustituyen la validación Ajv.

## Validación runtime

La validación se implementa con Ajv 8 en modo 2020 (`ajv2020/dist/2020.js`) y `ajv-formats` para activar la comprobación de formatos URI declarados en el schema.

La dependencia se registra como alias `ajv2020` porque el árbol de dependencias existente utiliza Ajv 6 para ESLint. El alias permite mantener ambas versiones sin alterar la dependencia transitiva del linter.

- `validateIrSchema(input)` valida exclusivamente la estructura JSON Schema.
- La validación acumula todos los errores estructurales (`allErrors: true`).
- Se desactivan coerciones, inserción de defaults y eliminación de propiedades. La entrada se valida tal como se recibió y no se modifica.
- Los diagnósticos incluyen código estable por keyword, ruta de instancia en notación `$`, ruta del schema y keyword.
- `validateIrDocument(input, options)` conserva la validación semántica existente.
- `validateIrDocumentComplete(input, options)` ejecuta primero el schema y solo si es válido continúa con la validación semántica. Así se evita recorrer estructuras malformadas.

## Cobertura estructural definida

La matriz actual de `spec/conformance/README.md` define quince casos: SC-001…SC-005 y SC-101…SC-110. No define SC-006…SC-100; esos identificadores no se presuponen ni se inventan en esta tarea.

Los tests ejecutan los casos definidos, incluyendo variantes adicionales para los límites de ID y las colecciones vacías. También se comprueba la salida tipada del parser, los formatos URI, las rutas con índices de arrays y la ausencia de mutaciones. La matriz semántica SEM-001…SEM-018 continúa en `test/semantic-validator.test.ts`.

## Límites

JSON Schema no comprueba unicidad global de IDs ni referencias cruzadas; esas invariantes siguen correspondiendo al validador semántico. Los tipos generados describen la estructura estática y no deben interpretarse como sustituto de Ajv ni de las comprobaciones semánticas.
