# Auditoría del proyecto y registro de continuidad

> Documento operativo para recuperar el estado del proyecto sin depender del historial de los chats. Se debe leer junto con docs/ai-master-prompt.md y docs/technical-audit-2026-11-11.md.

## 0. Identificación de la auditoría

- Fecha: 2026-11-11.
- Repositorio: https://github.com/PabloGonzalezRuiz/xmind-md-ts
- Rama activa de desarrollo: feature/aud-003-runtime-schema.
- HEAD al comenzar esta auditoría documental: 8a8b28953ac29d7bcd5d3707f19b484d8834915c.
- HEAD tras preparar el workflow AUD-009: 323caef1df653fc569a169acda87a1f6ae088d66. HEAD documental observado antes de esta actualización: c8295b031551a7a421fa3b7f550dceb99b865651; consultar GitHub para el HEAD vigente.
- Último commit probado con código y pruebas: fe1d3e510a76719f12d4eeaf0e081304720196b8.
- Corrección de código AUD-013: f3a9ed8081e1c55a62888550e586b6ee8dc98c7e.
- CI general posterior a AUD-013: run 43003867274 (124/124 pruebas en Ubuntu y Windows).
- Probe aislado SDK más reciente: run 43003867447 (Ubuntu y Windows).
- main: 6aca81b59dbfcfc13034e7e1115c70f7691c5035.
- Esta auditoría actualiza documentación y no cambia código de aplicación. Consultar GitHub para el HEAD resultante; no asumir que el SHA de inicio sigue siendo el HEAD actual.

## 1. Resumen ejecutivo

La aplicación TypeScript ya dispone de un pipeline funcional desde Markdown a IR y de exportación a JSON, XMind y SVG en la rama feature/aud-003-runtime-schema.

**AUD-001 a AUD-009 y AUD-013 están completadas y verificadas** en esa rama. AUD-010 está autorizada y en curso. La CI más reciente [43013195119](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43013195119) registra 124/124 pruebas correctas en Ubuntu y Windows; la CI de empaquetado [43012605756](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43012605756) incluye además la verificación de ejemplos y del paquete instalado. La distribución [43012600819](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43012600819) también se generó correctamente.

El proyecto todavía no está integrado en main. La rama principal permanece en el commit inicial 6aca81b59dbfcfc13034e7e1115c70f7691c5035. No hay pull requests ni issues abiertos devueltos por la búsqueda de GitHub. No se ha creado release.

No debe confundirse la generación/inspección estructural del paquete con una certificación visual exhaustiva. AUD-009 confirmó manualmente apertura, jerarquía visible, guardado y reapertura en XMind Desktop; no certifica todas las capacidades, estilos o versiones.

La auditoría estática detectó dos defectos de CLI, registrados como AUD-013. Ambos se corrigieron y se añadieron pruebas de regresión; CI 43003867274 confirma 124/124 pruebas en Ubuntu y Windows.

## 2. Estado verificable

| Área | Estado | Evidencia y límites |
|---|---|---|
| Fases 1–2: documentación y contrato IR | Completadas | Schema Draft 2020-12, tipos generados, fixture y matriz |
| Fase 3: scaffold TypeScript | Completada y CI verde | feature/phase-3-project-scaffold |
| Fase 4: parser Markdown | Completada y CI verde | feature/phase-4-markdown-parser |
| Fase 5: validación semántica | Completada y CI verde | feature/phase-5-semantic-validation |
| Fase 6: motor de estilos | Completada y verificada | AUD-001/AUD-002 |
| Validación JSON Schema runtime | Completada y verificada | AUD-003; Ajv y tipos generados |
| Corpus parser/IR | Completado y verificado | AUD-004 |
| JSON y CLI | Completados y verificados | AUD-005 y AUD-013; nombres de salida y errores cubiertos por regresiones |
| Evaluación SDK XMind | Completada y verificada | AUD-006; ADR-0001 |
| Adaptador XMind | Implementado y validado funcionalmente en Desktop para el fixture AUD-009 | La matriz de capacidades sigue documentando pérdidas y elementos no soportados |
| Adaptador SVG | Implementado y verificado | AUD-008; limitaciones visuales documentadas |
| XMind Desktop | Completado y verificado manualmente | AUD-009; apertura, jerarquía visible, guardado de copia y reapertura confirmados por el usuario |
| Documentación de usuario y publicación | En curso | AUD-010; guía, ejemplos, CI y artefacto instalable verificados; release pública pendiente de revisión de vulnerabilidades y canal; licencia MIT incorporada |
| Visor web | Pendiente | AUD-011 |
| Defectos CLI | Corregidos y verificados | AUD-013; CI 43003867274 |

## 3. Ramas y relación con main

| Rama | HEAD observado en la auditoría | Commits por delante de main | Contenido |
|---|---|---:|---|
| main | 6aca81b59dbfcfc13034e7e1115c70f7691c5035 | 0 | Contrato y documentación inicial; no incluye la aplicación |
| feature/phase-3-project-scaffold | 43a006096aa65f72c73b5ec20ab3d457fe698019 | 36 | Toolchain y scaffold |
| feature/phase-4-markdown-parser | d31892ba0895f513b8b19a284de929623d10af6b | 84 | Parser |
| feature/phase-5-semantic-validation | 954216e99a13106d88ba72652460047d826b9c55 | 119 | Validador semántico |
| feature/phase-6-style-engine | 005301060582b193327ae10244cbe7ade9cd413f | 255 | Rama anterior de estilos; conserva un prototipo anterior de checker de tipos |
| feature/aud-003-runtime-schema | 8a8b28953ac29d7bcd5d3707f19b484d8834915c | 353 | Rama acumulada activa, con fases 3–9 y AUD-001…008 |

La rama feature/aud-003-runtime-schema es la referencia de desarrollo actual. La estrategia final de AUD-012 en esta rama es generación de tipos desde el JSON Schema mediante scripts/generate-ir-types.js. No sustituirla por el checker experimental scripts/check-ir-types.mjs de la rama antigua sin una decisión explícita.

No fusionar, reescribir ni actualizar main sin autorización expresa.

## 4. Arquitectura e inventario

### Contrato y especificación

- docs/ir-specification.md: semántica IR 1.0.0.
- spec/ir-v1.schema.json: fuente de verdad estructural, JSON Schema Draft 2020-12.
- spec/ir-v1.types.ts: tipos generados; no editar manualmente.
- scripts/generate-ir-types.js: generador y comprobador.
- spec/fixtures/ir-v1-minimal.json: fixture mínimo.
- spec/conformance/README.md: quince casos SC, dieciocho casos SEM y corpus PAR.

Comandos de tipos:
- npm run generate:types
- npm run check:generated-types

Las restricciones que TypeScript no representa se validan en runtime con Ajv. Las referencias cruzadas y otras invariantes globales se comprueban en la capa semántica.

### Código

| Ruta | Responsabilidad |
|---|---|
| src/markdown/parser.ts | Markdown, front matter y directivas a IR |
| src/validation/schema-validator.ts | Validación Ajv estructural |
| src/validation/semantic-validator.ts | IDs, referencias, ciclos, tablas, URI, límites y assets |
| src/validation/complete-validator.ts | Schema primero y semántica después |
| src/styles/catalog.ts | Catálogo tipado de estilos |
| src/styles/style-engine.ts | Cascada, herencia, resolución y procedencia |
| src/adapters/json/json-adapter.ts | Serialización JSON del IR |
| src/adapters/xmind/xmind-adapter.ts | Exportación mediante SDK XMind |
| src/adapters/svg/svg-adapter.ts | Renderizado SVG y metadata |
| src/cli/main.ts | parse, validate y export |
| bin/xmind-md.js | Ejecutable npm |
| scripts/probe-xmind-sdk.js | Prueba aislada del SDK |

No existe viewer/ ni importador/lector de archivos XMind.

### Dependencias y scripts

Versiones directas relevantes:
- Node.js >=24.
- TypeScript 6.0.3.
- Vitest 5.0.5.
- ESLint 10.14.0, typescript-eslint 8.72.2.
- Prettier 3.9.10.
- Ajv 8.17.1 mediante alias ajv2020, ajv-formats 3.0.1.
- xmind 2.2.33.

Scripts principales:
- npm run format:check
- npm run lint
- npm run check:generated-types
- npm run typecheck
- npm test
- npm run build
- npm run verify

CI añade smoke test de la CLI compilada.

## 5. CI y pruebas verificadas

### CI general

[42989195843](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42989195843)

- Ubuntu: job success; 11 archivos de test, 118/118 pruebas.
- Windows: job success; 11 archivos de test, 118/118 pruebas.
- En ambos: npm ci, formato, lint, check de tipos generados, typecheck, tests, build y CLI compiled smoke test.

Los logs de ambos jobs se inspeccionaron; el número de pruebas se obtuvo de la salida de Vitest, no de una estimación.

### SDK XMind

[42989195787](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42989195787)

Ubuntu y Windows success. El workflow instala el SDK en un directorio temporal aislado, genera un paquete y examina su estructura. No es una prueba de XMind Desktop.

### SHA probado frente al HEAD documental

El código se probó en 980279a6e61a990769e9884ea1fc51888d5bf054. Después se añadieron dos commits documentales hasta 8a8b28953ac29d7bcd5d3707f19b484d8834915c. El diff entre esos SHAs contiene únicamente docs/adapters.md, docs/cli.md, docs/project-audit-and-continuation.md y docs/roadmap.md. No se ha observado un run de CI posterior al HEAD documental. No afirmar que ese HEAD documental tenga una ejecución propia; sí que el código sin cambios posteriores está probado en el SHA indicado.

## 6. Límites funcionales conocidos

### XMind

SDK xmind 2.2.33, MIT, fijado y encapsulado. El SDK no carga archivos XMind existentes desde 2.2.0, por lo que no hay importación ni round-trip.

La primera versión:
- mapea jerarquía, títulos, notas, marcadores e hipervínculos no centrales;
- aplana contenido estructurado a texto de nota;
- une varias etiquetas en una cadena;
- solo representa resúmenes cuyos extremos son hermanos;
- no representa relaciones, boundaries, StyleSets/overrides ni assets binarios;
- omite etiquetas e hipervínculo del tema raíz con diagnósticos.

strict detiene ante errores de capacidad; compatible permite salida parcial con diagnósticos.

### SVG

Salida autocontenida y determinista con jerarquía, relaciones, boundaries, summaries, estilos mapeables, enlaces filtrados y metadata con IR completo.

Limitaciones:
- assets no se dibujan;
- sombras no se representan visualmente;
- padding puede aproximarse;
- contenido y notas se exponen en descripciones accesibles y metadata, no como cuerpo visible del nodo;
- las métricas tipográficas son aproximadas y la apariencia de glifos depende del motor/fuentes;
- no se recupera la sintaxis Markdown original desde el SVG convencional.

Consultar docs/adapters.md para la matriz completa.

## 7. Hallazgo detectado en la auditoría inicial: AUD-013 (resuelto)

Revisión estática de src/cli/main.ts:

1. El patrón que elimina la extensión de la entrada para derivar el nombre XMind/SVG está escapado de más. No coincide con mapa.md ni C:\docs\mapa.md. Al omitir --output, la extensión .md permanece y el destino se convierte en mapa.md.xmind o mapa.md.svg.
2. Los mensajes de error de XMindExportError y SvgExportError contienen la secuencia literal \\n en lugar de un salto de línea real.

La suite actual pasa porque las pruebas de exportación proporcionan --output explícito y no comprueban esos mensajes. La corrección requiere:
- regex compatible con rutas POSIX/Windows;
- pruebas sin --output desde Markdown y JSON;
- comprobar archivo/ruta final;
- probar stderr de ambos errores;
- CI completa Ubuntu/Windows.

La auditoría inicial no modificó código. La corrección posterior y su verificación están registradas en la sección 11; AUD-013 ya no está pendiente.

## 8. Backlog maestro

| ID | Prioridad | Tarea | Estado |
|---|---:|---|---|
| AUD-001 | P0 | Estabilizar CI read-only | Completada y verificada |
| AUD-002 | P1 | Robustez del motor de estilos | Completada y verificada |
| AUD-003 | P1 | Ajv runtime, tipos generados y pipeline | Completada y verificada |
| AUD-004 | P1 | Corpus de conformidad Markdown/IR | Completada y verificada |
| AUD-005 | P1 | Adaptador JSON y CLI | Completada y verificada |
| AUD-006 | P1 | Evaluación del SDK XMind | Completada y verificada |
| AUD-007 | P1 | Exportador XMind inicial | Completada y verificada |
| AUD-008 | P2 | Exportador SVG | Completada y verificada |
| AUD-009 | P2 | Validación de apertura/guardado en XMind Desktop | Completada y verificada: apertura, visualización, guardado y reapertura confirmados por el usuario; versión de XMind y SO no registrados |
| AUD-010 | P2 | Documentación de usuario y publicación | En curso: guía, ejemplos, empaquetado e instalación limpia verificados en CI Ubuntu/Windows; artefacto generado; release pública pendiente de auditoría de vulnerabilidades y canal; licencia MIT incorporada |
| AUD-011 | P3 | Visor web TypeScript | Pendiente |
| AUD-013 | P1 | Corregir defectos de derivación de salida y stderr de CLI | Completada y verificada; CI 43003867274, 124/124 pruebas Ubuntu/Windows |

AUD-009 está cerrada. AUD-010 está autorizada y en curso; AUD-011 sigue pendiente y requiere autorización independiente. AUD-013 se cerró con corrección y pruebas de regresión.

## 9. Criterios globales de finalización

Una tarea solo pasa a completada cuando:
1. Está implementada en la rama acordada.
2. Los criterios de aceptación tienen pruebas/evidencia.
3. Se ejecutan las puertas de calidad aplicables.
4. Se registra el SHA exacto probado y los run IDs.
5. Se actualizan auditoría, roadmap, prompt maestro y documentación afectada.
6. Se explicitan las limitaciones restantes.

Estados permitidos: Pendiente, En curso, Bloqueada, Completada y Verificada. Implementado no equivale a verificado.

## 10. Protocolo de continuidad

Al abrir un chat nuevo:

1. Leer este documento completo.
2. Leer docs/technical-audit-2026-11-11.md.
3. Leer docs/ai-master-prompt.md y docs/roadmap.md.
4. Consultar el HEAD actual de main y feature/aud-003-runtime-schema en GitHub.
5. Comparar HEAD con el último SHA de código probado; revisar commits y diffs para separar código de documentación.
6. Consultar el último CI general y el probe SDK; abrir logs y confirmar los sistemas, pasos y número de pruebas.
7. Revisar backlog y autorizaciones existentes.
8. AUD-009 está completada y verificada. AUD-010 está autorizada y en curso. AUD-011 sigue pendiente y requiere autorización expresa.
9. No fusionar ramas, abrir PR, modificar main ni crear release sin autorización expresa.
10. Tras cada tarea, actualizar este documento, la auditoría técnica, roadmap, README, prompt maestro y documentación funcional.

### Primera acción al retomar

Verificar el HEAD actual y comparar con el código probado fe1d3e510a76719f12d4eeaf0e081304720196b8. AUD-013 está cerrada. AUD-009 está completada: workflow satisfactorio y validación manual en XMind Desktop confirmada por el usuario. AUD-010 está autorizada y en curso; AUD-011 requiere autorización independiente.

## 11. Registro de trabajo resumido

| Fecha | Tarea | Resultado verificable |
|---|---|---|
| 2026-11-10 | AUD-001 | CI read-only y puerta de calidad estabilizadas |
| 2026-11-10 | AUD-002 | Catálogo/engine reforzados; CI 42833075950 |
| 2026-11-10 | AUD-003 | Ajv runtime, tipos generados y CI 42845837785 |
| 2026-11-10 | AUD-004 | Corpus parser/IR; CI 42850018812 |
| 2026-11-10 | AUD-005 | JSON/CLI; CI 42856600346, 107 pruebas Ubuntu/Windows |
| 2026-11-11 | AUD-006 | Evaluación SDK y ADR-0001; CI 42982530041 y probe 42982529970 |
| 2026-11-11 | AUD-007 | Exportador XMind; CI 42985540873 y probe 42985540716 |
| 2026-11-11 | AUD-008 | SVG; CI 42989195843, 118 pruebas Ubuntu/Windows; probe 42989195787 |
| 2026-11-11 | AUD-013 | Corregida derivación de salida XMind/SVG sin --output; corregidos saltos de línea en errores XMind/SVG; añadidas seis regresiones (Markdown/JSON, XMind/SVG y stderr). CI 43003867274: 124/124 pruebas en Ubuntu y Windows; formato, lint, tipos generados, typecheck, build y smoke test correctos. Probe SDK 43003867447 correcto en ambos sistemas. Código probado: fe1d3e510a76719f12d4eeaf0e081304720196b8. | Completada y verificada |
| 2026-11-11 | AUD-009 | Workflow 43009405102 completado correctamente; artefacto XMind publicado en `artifacts/aud-009/aud-009-desktop-validation.xmind`. El usuario confirmó apertura en XMind Desktop, visualización de la jerarquía (captura), guardado de copia con otro nombre y reapertura correcta tras cerrar la aplicación. Versión exacta de XMind Desktop y sistema operativo no facilitados. | Completada y verificada |
| 2026-11-11 | AUD-010 | Guía `docs/user-guide.md`, ejemplos `examples/`, `CHANGELOG.md`, política `docs/release-readiness.md`, verificador de ejemplos y verificador de paquete instalable creados. CI 43012605756: Ubuntu y Windows success, 124/124 pruebas por sistema; formato, lint, tipos, typecheck, build, CLI, validación de ejemplos y empaquetado/instalación limpia correctos. Workflow 43012600819 generó artefacto `xmind-md-ts-distribution` (ID 13851262408), tarball 0.1.0, SHA-256 `8276da05de8d3d2c96781b48c6acd30780152b8d7d34adab4b430cdea89827dd`. La publicación pública sigue bloqueada por `private: true`, ausencia de licencia raíz y revisión pendiente de 15 vulnerabilidades reportadas (14 moderadas, 1 alta). | En curso |


## 12. Seguimiento AUD-009 — validación XMind Desktop completada

Autorización recibida el 2026-11-11. Se ha preparado en `feature/aud-003-runtime-schema` un fixture reproducible y un workflow independiente que compila la aplicación, ejecuta `npm run verify`, exporta un `.xmind` mediante la CLI compilada, comprueba el ZIP, calcula SHA-256 y publica el artefacto `aud-009-xmind-desktop-validation` durante 14 días.

- Fixture: `fixtures/aud-009-desktop-validation.md`.
- Workflow: `.github/workflows/aud-009-xmind-desktop-artifact.yml`.
- Procedimiento: `docs/aud-009-xmind-desktop-validation.md`.
- Commits de preparación: `fd367669a932bdb385819b1f9a77f2b641ef0a46` (fixture), `83cb7af187d1a00df91a53cbcffa64a17bb55739` (procedimiento) y `323caef1df653fc569a169acda87a1f6ae088d66` (workflow).
- El diff desde el código probado `fe1d3e510a76719f12d4eeaf0e081304720196b8` no modifica `src/`, `test/` ni `spec/`; añade fixture, workflow y documentación.
- Workflow [43009405102](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43009405102): completado con éxito; job y pasos de generación/publicación correctos. El artefacto contiene el archivo XMind y también está publicado en `artifacts/aud-009/aud-009-desktop-validation.xmind`.
- Validación manual confirmada por el usuario el 2026-11-11: apertura del archivo original; captura de la jerarquía visible; guardado de una copia con otro nombre; cierre y reapertura de la copia conservando el contenido. No se comunicaron incidencias.
- La versión exacta de XMind Desktop y el sistema operativo no se facilitaron y quedan sin registrar.
- AUD-009 queda completada y verificada funcionalmente. No se ha modificado `main`, ni creado PR, merge o release.
