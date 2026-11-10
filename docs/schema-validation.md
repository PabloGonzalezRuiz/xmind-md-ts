# Validación estructural del IR

## Decisión de implementación

El contrato normativo es `spec/ir-v1.schema.json`, definido con JSON Schema Draft 2020-12. La validación runtime se implementa con Ajv 8 en modo 2020 (`ajv2020/dist/2020.js`) y `ajv-formats` para activar la comprobación de formatos URI declarados en el schema.

La dependencia se registra como alias `ajv2020` porque el árbol de dependencias existente utiliza Ajv 6 para ESLint. El alias permite mantener ambas versiones sin alterar la dependencia transitiva del linter.

## Contrato de ejecución

- `validateIrSchema(input)` valida exclusivamente la estructura JSON Schema.
- La validación acumula todos los errores estructurales (`allErrors: true`).
- Se desactivan coerciones, inserción de defaults y eliminación de propiedades. La entrada se valida tal como se recibió y no se modifica.
- Los diagnósticos incluyen código estable por keyword, ruta de instancia en notación `$`, ruta del schema y keyword.
- `validateIrDocument(input, options)` conserva la validación semántica existente.
- `validateIrDocumentComplete(input, options)` ejecuta primero el schema y solo si es válido continúa con la validación semántica. Así se evita recorrer estructuras malformadas.

## Cobertura estructural definida

La matriz actual de `spec/conformance/README.md` define quince casos: SC-001…SC-005 y SC-101…SC-110. No define SC-006…SC-100; esos identificadores no se presuponen ni se inventan en esta tarea.

Los tests ejecutan los casos definidos, incluyendo variantes adicionales para los límites de ID y las colecciones vacías. También se comprueba la salida tipada del parser, los formatos URI, las rutas con índices de arrays y la ausencia de mutaciones. La matriz semántica SEM-001…SEM-018 continúa en `test/semantic-validator.test.ts`.

## Límites y trabajo pendiente

Los tipos de `spec/ir-v1.types.ts` continúan siendo manuales. Las pruebas actuales verifican que la salida tipada del parser cumple el schema, pero **no prueban la equivalencia completa** entre el JSON Schema y todas las interfaces TypeScript. AUD-003 no se declarará verificada hasta resolver esta brecha mediante generación de tipos desde el schema o una comprobación de equivalencia robusta. Esta implementación tampoco sustituye las invariantes semánticas: JSON Schema no comprueba unicidad global de IDs ni referencias cruzadas.
