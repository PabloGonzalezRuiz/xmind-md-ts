# Calidad, pruebas y diagnóstico

## 1. Puertas de calidad

Cada cambio debe superar, según el alcance: Prettier, ESLint, typecheck, pruebas unitarias, integración, build, validación JSON Schema y validación semántica. Los comandos se establecerán en package.json durante la fase 3.

## 2. Contrato IR v1

La fuente normativa se materializa en `spec/ir-v1.schema.json` y `spec/ir-v1.types.ts`; ambos deben comprobar su equivalencia automáticamente. Los fixtures de `spec/fixtures/` y los casos de `spec/conformance/` son independientes de la implementación. Nunca se mantienen dos contratos manuales divergentes sin pruebas.

La matriz de casos está en `spec/conformance/README.md`. Pruebas de conformidad obligatorias:
- Fixture mínimo válido.
- Rechazo de versión IR desconocida.
- Rechazo de propiedades desconocidas en objetos del núcleo.
- Aceptación y conservación de extensiones namespaced.
- Detección semántica de IDs duplicados.
- Detección de referencias a topics/assets inexistentes.
- Rechazo de relaciones autorreferentes.
- Detección de ciclos en conjuntos de estilos.
- Verificación de orden y determinismo de serialización.
- Validación de alineaciones de tabla y número de columnas.

JSON Schema no sustituye al validador semántico: las referencias cruzadas y la unicidad global requieren recorrido del documento.

## 3. Pruebas por capas

- Parser: gramática válida, inválida, ubicación y escapes.
- IR: schema, tipos, serialización y versionado.
- Validación: IDs, referencias, jerarquía y ciclos.
- Estilos: cascada, herencia, overrides y procedencia.
- Adaptadores: salida, capacidades, pérdidas y errores.
- CLI: códigos de salida, rutas, opciones y Windows/Linux.
- Visor: interacción, accesibilidad y mapas grandes.

## 4. Corpus de referencia

Mantener fixtures pequeños, independientes y legibles: mapa mínimo, jerarquía profunda, contenido estructurado, estilos, notas, relaciones, boundaries, summaries, assets, mapa combinado e inputs inválidos.

Comparar semántica y propiedades, no bytes completos del ZIP XMind, ya que metadatos y empaquetado pueden variar.

## 5. Conformidad entre implementaciones

Si se compara con el proyecto Python, ambos motores consumen los mismos fixtures y producen IR equivalentes conforme al contrato. Ninguna implementación se toma automáticamente como verdad de la otra.

## 6. Diagnóstico y afirmaciones

Los diagnósticos tienen código estable, severidad, mensaje, archivo/ubicación y contexto. Distinguir typecheck, lint, tests ejecutados, build, validación estructural, apertura en XMind Desktop y fidelidad visual. No afirmar un nivel a partir de otro.
