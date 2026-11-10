# Calidad, pruebas y diagnóstico

## 1. Puertas de calidad

Cada cambio debe superar, según el alcance: Prettier, ESLint, typecheck, pruebas unitarias, integración, build, validación JSON Schema y validación semántica.

Los comandos efectivos están definidos en `package.json`:
- `npm ci`
- `npm run format:check`
- `npm run lint`
- `npm run typecheck`
- `npm run check:ir-types`
- `npm test`
- `npm run build`
- `npm run verify` (agrupa las puertas principales).

## 2. Contrato IR v1

La fuente normativa se materializa en `spec/ir-v1.schema.json` y `spec/ir-v1.types.ts`. El JSON Schema es la autoridad para la validación estructural en ejecución. Los tipos TypeScript siguen siendo una representación mantenida manualmente y no expresan por sí solos restricciones de longitud, patrones o formatos. `scripts/check-ir-types.mjs` proyecta la estructura del schema a tipos temporales y compara la equivalencia bidireccional con todos los tipos públicos y el IR raíz. La comprobación está en `npm run check:ir-types`, `npm run verify` y CI; también incluye una prueba negativa que altera deliberadamente el tipo del campo raíz `document` y espera un error de compilación. Las restricciones no representables en TypeScript siguen siendo responsabilidad de Ajv.

Los fixtures de `spec/fixtures/` y los casos de `spec/conformance/` son independientes de la implementación. La matriz normativa de conformidad está en `spec/conformance/README.md`.

## 3. Validación en dos capas

### 3.1 Validación estructural

`src/validation/schema-validator.ts` usa Ajv 8 con la clase Draft 2020-12 y `ajv-formats`. El schema se carga desde `spec/ir-v1.schema.json`; los formatos declarados, incluidos `uri` y `uri-reference`, se validan explícitamente.

La API `validateIrSchema(input)`:
- recibe `unknown`;
- devuelve `valid` y diagnósticos con código, mensaje, ruta de instancia, keyword y ruta del schema;
- acumula todos los errores estructurales;
- no aplica defaults, coerción ni mutaciones al documento.

Los casos SC-001…SC-005 y SC-101…SC-110 se ejecutan en `test/ir-schema-validator.test.ts`. SC-104, SC-108 y SC-109 cubren las variantes individuales indicadas en la matriz. La ejecución CI [42844634106](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42844634106) verificó 75 tests en 5 suites, además de formato, lint, typecheck y build.

### 3.2 Validación semántica

La API `validateIrDocument(input, options)` comprueba invariantes que requieren recorrer el documento: IDs globales, referencias, ciclos, relaciones, tablas, URI y límites. Recibe `unknown`, no modifica la entrada y devuelve diagnósticos con código, severidad, mensaje, ruta y posición de origen cuando existe.

Los límites por defecto son 100 niveles, 100.000 temas, 250.000 bloques y 10.000 assets; pueden ajustarse. `assetRootDirectory` activa la comprobación de contención de rutas relativas.

### 3.3 Pipeline completo

La API `validateIr(input, options)`, exportada desde `src/index.ts`, ejecuta primero `validateIrSchema`. Solo si el documento supera el schema ejecuta `validateIrDocument`. Este orden evita recorrer estructuras que no cumplen el contrato. Un documento solo es válido si supera ambas capas.

JSON Schema no sustituye al validador semántico: la unicidad global y las referencias cruzadas requieren recorrido del documento.

## 4. Pruebas por capas

- Parser: gramática válida, inválida, ubicación y escapes.
- IR: schema, fixtures positivos/negativos, versionado y no mutación.
- Validación semántica: IDs, referencias, ciclos de estilos, tablas, URI, límites y rutas de assets configuradas.
- Estilos: cascada, herencia, overrides y procedencia.
- Adaptadores: salida, capacidades, pérdidas y errores.
- CLI: códigos de salida, rutas, opciones y Windows/Linux.
- Visor: interacción, accesibilidad y mapas grandes.

## 5. Corpus de referencia

Mantener fixtures pequeños, independientes y legibles: mapa mínimo, jerarquía profunda, contenido estructurado, estilos, notas, relaciones, boundaries, summaries, assets, mapa combinado e inputs inválidos.

Comparar semántica y propiedades, no bytes completos del ZIP XMind, ya que metadatos y empaquetado pueden variar.

## 6. Diagnóstico y afirmaciones

Los diagnósticos tienen código estable, severidad, mensaje y ruta; la validación semántica añade posición de origen cuando existe. Distinguir typecheck, lint, tests ejecutados, build, validación estructural, validación semántica, apertura en XMind Desktop y fidelidad visual. No afirmar un nivel a partir de otro.
