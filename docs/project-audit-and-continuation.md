# Auditoría del proyecto y registro de continuidad

> Documento operativo para auditar el estado real, mantener el backlog y retomar el desarrollo sin depender del historial del chat.
>
> **Última auditoría:** 2026-11-11  
> **Repositorio:** https://github.com/PabloGonzalezRuiz/xmind-md-ts  
> **Rama de trabajo auditada:** `feature/aud-003-runtime-schema`  
> **HEAD de código probado:** `980279a6e61a990769e9884ea1fc51888d5bf054` (AUD-008; CI general [42989195843](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42989195843) y probe SDK [42989195787](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42989195787), ambos verdes en Ubuntu y Windows)  
> **Rama principal:** `main` — `6aca81b59dbfcfc13034e7e1115c70f7691c5035`

## 1. Resumen ejecutivo

El proyecto tiene definido el contrato IR v1.0.0 y dispone de parser Markdown, validación estructural y semántica, motor de estilos, adaptadores JSON/XMind/SVG y CLI. Los exportadores XMind y SVG generan sus respectivos artefactos con límites documentados. Todavía no existe visor web y la apertura/guardado en XMind Desktop no se ha validado.

El trabajo está distribuido en ramas de características. No hay pull requests abiertos y no se ha integrado el desarrollo de las fases 3–7 en `main`. No se debe confundir que una fase esté implementada y verificada en su rama con que esté integrada en la rama principal.

### Estado verificable

| Área | Estado auditado | Evidencia / limitación |
|---|---|---|
| Fases 1–2: definición y contrato IR | Completadas | Documentación, JSON Schema Draft 2020-12, tipos TS, fixture mínimo y matriz de conformidad están en `main` |
| Fase 3: base TypeScript | Completada y CI verde | Rama `feature/phase-3-project-scaffold`; CI run [42818879886](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42818879886) |
| Fase 4: parser Markdown → IR | Completada y CI verde | Rama `feature/phase-4-markdown-parser`; CI run [42820998921](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42820998921) |
| Fase 5: validación semántica e identidad | Completada y CI verde | Commit `954216e99a13106d88ba72652460047d826b9c55`; CI run [42823341031](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42823341031) |
| Fase 6: motor de estilos | Motor implementado; robustez AUD-002 verificada | Rama `feature/phase-6-style-engine`; CI completo verde sobre el HEAD registrado. La fase aún requiere integración/exportadores y validación real XMind/SVG |
| JSON Schema en ejecución | Completada y verificada (AUD-003) | Ajv 8 Draft 2020-12; 15 casos SC definidos; pipeline estructural-semántico; tipos generados desde el schema; comprobación de sincronización y CI verde en HEAD `957ae096359cfa9d62ddbe70883bfa2020efe5ed` |
| Adaptador JSON y CLI | Completada y verificada (AUD-005) | `src/adapters/json/json-adapter.ts`; comandos `parse`, `validate` y `export`; bin `xmind-md`; CI Ubuntu/Windows [42856600346](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42856600346) |
| Evaluación SDK XMind (AUD-006) | Completada y verificada | `xmind@2.2.33`; prueba aislada Node 24 en Ubuntu/Windows; decisión ADR-0001 |
| Adaptador XMind (AUD-007) | Completada y verificada | `src/adapters/xmind/xmind-adapter.ts`; exportación CLI `--format xmind`; matriz de capacidades y diagnósticos; 111 pruebas en cierre AUD-007; CI Ubuntu/Windows verde |
| Adaptador SVG (AUD-008) | Completada y verificada | `src/adapters/svg/svg-adapter.ts`; CLI `--format svg`; SVG determinista con IR íntegro en metadatos; 118 pruebas; CI Ubuntu/Windows verde |
| Validación en XMind Desktop | Pendiente | No hay pruebas de apertura/guardado ni corpus real |
| Visor web | Pendiente | No existe aplicación web ni pruebas Playwright |

## 2. Ramas, commits y política de integración

| Rama | HEAD auditado | Propósito / estado |
|---|---|---|
| `main` | `6aca81b59dbfcfc13034e7e1115c70f7691c5035` | Contiene documentación base y contrato IR; no contiene la implementación TypeScript |
| `feature/phase-3-project-scaffold` | `43a006096aa65f72c73b5ec20ab3d457fe698019` | Scaffold, configuración, dependencias, tests y CI |
| `feature/phase-4-markdown-parser` | `d31892ba0895f513b8b19a284de929623d10af6b` | Parser Markdown y pruebas |
| `feature/phase-5-semantic-validation` | `954216e99a13106d88ba72652460047d826b9c55` | Validador semántico, IDs deterministas y pruebas |
| `feature/phase-6-style-engine` | `21dae3248be2963ccc77b00b79dffd1afd92a98d` | Catálogo y motor de estilos; AUD-001 y AUD-002 verificadas |
| `feature/aud-003-runtime-schema` | `980279a6e61a990769e9884ea1fc51888d5bf054` | Ajv runtime, corpus parser/IR, adaptadores JSON, XMind y SVG, CLI; AUD-003 a AUD-008 verificadas |

Las ramas de fase están encadenadas por orden de desarrollo y contienen cambios acumulados. No hay PRs abiertos ni issues registrados en el repositorio en el momento de esta auditoría. **No fusionar ni reescribir `main` sin autorización expresa.**

## 3. Inventario técnico real

### 3.1 Contrato y especificación

- `spec/ir-v1.schema.json`: JSON Schema Draft 2020-12.
- `spec/ir-v1.types.ts`: tipos TypeScript generados desde `spec/ir-v1.schema.json` mediante `scripts/generate-ir-types.js`.
- `spec/fixtures/ir-v1-minimal.json`: fixture mínimo.
- `spec/conformance/README.md`: matriz SC y SEM.
- `docs/ir-specification.md`, `docs/grammar.md`, `docs/style-system.md`: especificaciones funcionales.

**AUD-003 verificada:** los quince casos SC realmente definidos se ejecutan; Ajv valida el schema en runtime y el generador convierte `$defs`, referencias locales, objetos, arrays, uniones, constantes y enumeraciones a TypeScript. `npm run check:generated-types` comprueba la sincronización y se ejecuta en CI. Las restricciones no representables en TypeScript continúan protegidas por Ajv.

### 3.2 Código implementado

- `src/markdown/parser.ts`: parser basado en Unified/Remark (CommonMark, GFM, front matter y directivas); genera IR v1 y diagnósticos compatibles.
- `src/validation/semantic-validator.ts`: validación semántica sobre `unknown`, IDs, referencias, ciclos, tablas, URI, límites y contención léxica de assets.
- `src/styles/catalog.ts`: catálogo de propiedades, tipos, compatibilidad, defaults y validadores.
- `src/styles/style-engine.ts`: resolución por capas, herencia de StyleSets, roles, estilos con nombre, overrides, runs y procedencia.
- `src/adapters/json/json-adapter.ts`: serialización determinista del IR validado a JSON, sin mutar el documento.
- `src/adapters/xmind/xmind-adapter.ts`: exportador encapsulado con `xmind@2.2.33`, modos `strict`/`compatible`, notas, marcadores, hipervínculos, etiquetas aproximadas y resúmenes; diagnósticos para propiedades no soportadas.
- `src/adapters/svg/svg-adapter.ts`: renderizador SVG determinista; jerarquía, relaciones, límites, resúmenes, estilos mapeables, enlaces filtrados y metadatos IR completos; modos `strict`/`compatible` para assets no dibujados.
- `src/cli/main.ts`: comandos `parse`, `validate` y `export` JSON/XMind/SVG, stdin/stdout, diagnósticos y códigos de salida.
- `bin/xmind-md.js`: punto de entrada del ejecutable `xmind-md`.
- `scripts/probe-xmind-sdk.js`: prueba aislada reproducible de generación/inspección del paquete `xmind@2.2.33`; no es dependencia ni código de producción.
- `.github/workflows/xmind-sdk-probe.yml`: ejecuta la prueba del SDK en Node 24 sobre Ubuntu y Windows.
- `package.json` y `package-lock.json`: dependencia exacta `xmind@2.2.33` y dependencias transitivas fijadas.

No existe todavía aplicación `viewer/`. La validación con XMind Desktop continúa pendiente.

### 3.3 Toolchain y CI

- Node.js 24, npm, TypeScript 6, Vitest 5, ESLint 10 y Prettier 3.
- CI ejecutada en `ubuntu-latest` y `windows-latest`; `.gitattributes` y `.editorconfig` fijan finales LF.
- `npm ci`, `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
- `npm run verify` agrupa las puertas locales de calidad.
- `package-lock.json` está versionado.

**Hallazgo de CI corregido en AUD-001:** el workflow ahora concede `contents: read` y solo comprueba formato; ya no crea commits ni hace push. El formato debe corregirse en commits normales del desarrollo.

## 4. Auditoría de la fase 6

### 4.1 Implementado

- Catálogo de estilos con tipos, compatibilidad por elemento y valores por defecto.
- Validación de color, longitud, número, cadena, booleano, enumeración, objeto y lista numérica.
- Precedencia: sistema → defaults de mapa → StyleSets heredados → rol → estilo con nombre → override → inline.
- Contexto de StyleSet heredado a temas descendientes, sin herencia visual automática desde el tema padre.
- Fusión recursiva de objetos; reemplazo completo de arrays; reinicio por `null`.
- Procedencia por propiedad.
- Diagnósticos para propiedades desconocidas, incompatibles, inválidas, referencias a conjuntos ausentes y ciclos.
- Pruebas unitarias del motor.

### 4.2 Resultado de CI observado

- La incidencia inicial de formato se corrigió aplicando el formato exacto de Prettier a `src/styles/catalog.ts` y `test/style-engine.test.ts`.
- Se retiró el paso temporal de diagnóstico y se restauró el workflow normal, de solo lectura.
- Verificación final limpia: [CI run 42833075950](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42833075950), commit `21dae3248be2963ccc77b00b79dffd1afd92a98d`; conclusión **success**.
- La ejecución final corresponde al workflow normal y confirma la cadena de calidad sobre el HEAD final: formato, lint, typecheck, tests y build.
- El run diagnóstico [42832932075](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42832932075) también fue verde, pero no se utiliza como evidencia de cierre porque ejecutaba Prettier antes de comprobar el formato.

### 4.3 Deuda técnica restante

1. El catálogo de estilos sigue siendo neutral: sus propiedades y compatibilidad no están contrastadas todavía con las capacidades reales de XMind ni con las del exportador SVG.
2. Los IDs de runs son deterministas para un mismo IR, pero pueden variar si se insertan o reordenan elementos antes de rutas basadas en índices. Esta limitación está documentada.
3. La validación de color cubre los formatos CSS admitidos por el contrato actual, no toda la especificación CSS Color 4.
4. El contrato de sombras y la reinicialización de procedencia de objetos están validados en el motor, pero necesitarán pruebas de integración cuando existan adaptadores.

`AUD-002` se considera cerrada respecto de la robustez interna definida en sus criterios. Estos puntos quedan como deuda explícita para las tareas de adaptadores y validación de interoperabilidad.

## 5. Backlog maestro ordenado

Los IDs de tarea son permanentes. Cambiar el orden o el alcance exige actualizar este documento y la hoja de ruta.

| ID | Prioridad | Tarea | Criterio de aceptación | Estado |
|---|---:|---|---|---|
| AUD-001 | P0 | Estabilizar CI y recuperar la puerta de calidad de la fase 6 | Test de procedencia corregido; workflow read-only sin auto-push; format, lint, typecheck, tests y build verdes sobre el commit de código | Completada y verificada |
| AUD-002 | P1 | Completar revisión de robustez del motor de estilos | Validadores de color/objetos robustos; procedencia coherente; referencias y ciclos diagnosticados; contrato de IDs y límites de compatibilidad documentados; pruebas y CI verdes | Completada y verificada |
| AUD-003 | P1 | Integrar validación JSON Schema runtime | Ajv 2020; todos los casos SC definidos automatizados; tipos generados desde el schema y sincronización comprobada; integración estructural-semántica; CI verde | Completada y verificada |
| AUD-004 | P1 | Completar corpus de conformidad parser/IR | Fixtures positivos y negativos de bloques/directivas; códigos estables; diagnósticos y posiciones de origen; validez estructural/semántica del IR; regresión reproducible en CI | Completada y verificada |
| AUD-005 | P1 | Implementar adaptador JSON y CLI | Comandos de parse, validate y export JSON; códigos de salida; rutas Windows; ejecución local y CI | Completada y verificada |
| AUD-006 | P1 | Evaluar SDK oficial XMind y decidir estrategia | Informe de API, formatos, Node, licencia, actividad, cobertura, dependencias y prueba mínima en Ubuntu/Windows | Completada y verificada |
| AUD-007 | P1 | Implementar exportador XMind inicial | Paquete generado, matriz de capacidades y diagnósticos de pérdidas; estructura ZIP/JSON comprobada; CI Ubuntu/Windows verde | Completada y verificada |
| AUD-008 | P2 | Implementar adaptador SVG | SVG autocontenido y determinista; metadatos IR; jerarquía, relaciones, límites, resúmenes, estilos y enlaces; pruebas y CI Ubuntu/Windows | Completada y verificada |
| AUD-009 | P2 | Crear corpus real y validar con XMind Desktop | Fixtures de referencia abiertos y guardados en versión Desktop identificada; informe de fidelidad | Pendiente |
| AUD-010 | P2 | Documentación de usuario y publicación | Instalación, gramática, ejemplos, CLI, limitaciones, releases y artefactos | Pendiente |
| AUD-011 | P3 | Diseñar e implementar visor web | Arquitectura aprobada, IR consumido sin duplicar semántica, accesibilidad y pruebas Playwright | Pendiente |

### Dependencias

- AUD-001 desbloquea el cierre formal de la fase 6.
- AUD-002 y AUD-003 deben estar resueltas antes de considerar estable el pipeline de compilación.
- AUD-005 consume parser, validador, schema y serialización JSON.
- AUD-006 precede a AUD-007: no elegir SDK ni formato de salida antes de evaluar.
- AUD-008 puede avanzar tras estabilizar el IR y el motor de estilos.
- AUD-009 depende de AUD-007 y de disponer de XMind Desktop para validar.
- AUD-010 documenta el comportamiento real de la CLI y adaptadores.
- AUD-011 depende del contrato IR estable y de la decisión sobre la biblioteca de visualización.

## 6. Criterios globales de finalización

Una tarea solo pasa a **Completada** cuando:
1. El código o documento está en la rama acordada.
2. Sus criterios de aceptación están cubiertos por pruebas o evidencia verificable.
3. Se ejecutan las puertas de calidad aplicables y se registra el commit probado.
4. Se actualizan este registro, `docs/roadmap.md` y, si corresponde, especificaciones/decisiones.
5. No quedan limitaciones relevantes ocultas.

Los estados permitidos son: **Pendiente**, **En curso**, **Bloqueada**, **Completada** y **Verificada**. Implementado no equivale a verificado.

## 7. Protocolo para retomar el desarrollo

Al iniciar una sesión de trabajo:

1. Leer este documento completo.
2. Consultar HEAD actual de `main` y de la rama de trabajo; no asumir que coinciden con los SHA registrados.
3. Consultar la última ejecución de CI para ese HEAD y sus logs.
4. Revisar el estado de la tarea en curso y su diff respecto de la rama base.
5. Continuar únicamente la primera tarea no completada del backlog, salvo autorización expresa para cambiar prioridades.
6. Actualizar el registro después de cada unidad de trabajo: cambios, commit, pruebas, CI y siguiente paso.
7. Detenerse al cerrar la tarea/fase y solicitar confirmación antes de iniciar la siguiente.

### Primera acción de continuación

**AUD-001 a AUD-008 están completadas y verificadas.** La siguiente tarea del backlog es AUD-009 (corpus real y validación de apertura/guardado en XMind Desktop), pendiente de autorización. Esta validación de escritorio es independiente de la generación estructural de los paquetes XMind.

## 8. Registro de sesiones

| Fecha | Trabajo | Resultado / commit | Próxima acción |
|---|---|---|---|
| 2026-11-10 | Auditoría inicial completa y AUD-001 | Auditoría registrada; commit `2c594eaadd3a3bb794c73d5607ef39bb5b15a9ac`; CI [42826867694](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42826867694) verde con 46/46 pruebas, lint, typecheck, formato y build | AUD-002 |
| 2026-11-10 | AUD-002: revisión, endurecimiento y verificación del motor | Corregidos catálogo de color, `shadow`, procedencia de reinicios, referencias inexistentes y cadenas de herencia incompletas; añadidas pruebas de regresión y actualizado `docs/style-system.md`. CI normal verde: [42833075950](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42833075950), SHA `21dae3248be2963ccc77b00b79dffd1afd92a98d` | Solicitar autorización para AUD-003 |

| 2026-11-10 | AUD-003: integración inicial de JSON Schema runtime | Rama `feature/aud-003-runtime-schema`; Ajv 8 Draft 2020-12 y `ajv-formats`; validador estructural sin coerciones ni mutaciones; pipeline estructural→semántico; tests de los 15 casos SC actualmente definidos; decisión técnica documentada. Aún sin CI verificada ni prueba automatizada de equivalencia de tipos | Completar equivalencia schema/tipos, ejecutar CI y corregir incidencias |

| 2026-11-10 | AUD-003: validador estructural y pipeline completo | Ajv 8 Draft 2020-12; alias `ajv2020` para coexistir con Ajv 6 de ESLint; formatos URI; diagnósticos con rutas/keyword/params; 15 casos SC definidos más pruebas de parser tipado, URI, paths, no mutación y pipeline semántico. CI verde: [42842076938](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42842076938), SHA `f27022a82a6e87bbab328ce105469a89a0cf4a68`. Pendiente: decidir e implementar comprobación completa o generación de tipos desde schema | Resolver fuente de verdad para los tipos TypeScript y completar CI final |

| 2026-11-10 | AUD-003: generación de tipos desde el contrato | Añadido `scripts/generate-ir-types.js`; `spec/ir-v1.types.ts` regenerado; `npm run generate:types` y `npm run check:generated-types`; comprobación incluida en `verify` y workflow CI. El generador falla ante keywords estructurales no soportadas y deja las restricciones no representables a Ajv. Pendiente CI final sobre el HEAD con documentación actualizada | Verificar CI final y cerrar AUD-003 |

| 2026-11-10 | AUD-003: cierre y verificación final | Generación TypeScript desde JSON Schema; `npm run check:generated-types` integrada en CI; workflow sin pasos de modificación automática y con `contents: read`. CI final verde: [42845837785](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42845837785), SHA `957ae096359cfa9d62ddbe70883bfa2020efe5ed`; formato, lint, generación sincronizada, typecheck, 79 tests y build correctos | Solicitar autorización para AUD-004 |

| 2026-11-10 | AUD-004: corpus inicial de conformidad Markdown | Añadidos fixtures positivos, negativos y de diagnóstico; batería `test/markdown-conformance.test.ts` con comprobación de bloques Markdown, directivas, códigos de error, posiciones y validación IR. Se corrigieron expectativas detectadas por CI (filas GFM, etiquetas HTML separadas e import de fixtures). CI pendiente de verificación final tras actualizar la documentación | Completar matriz de casos, confirmar CI verde y actualizar el estado de auditoría |

| 2026-11-10 | AUD-004: cierre y verificación final del corpus parser/IR | Fixtures versionados para bloques Markdown, front matter y directivas XMind; casos positivos, negativos y diagnósticos; códigos de error estables, líneas/columnas, posiciones de temas/bloques y validación estructural/semántica. Matriz registrada en `spec/conformance/README.md`. CI verde: [42850018812](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42850018812), SHA `a6a8afc31886170fbe5f4836c0587a746e31eb30`; 96 tests, format, lint, typecheck y build correctos | Solicitar autorización para AUD-005 |


| 2026-11-10 | AUD-005: adaptador JSON y CLI | Añadido adaptador tipado `serializeIrJson`; CLI `parse`, `validate` y `export`; códigos de salida 0–3; rutas con espacios y Windows; stdin/stdout; `--mode`, `--asset-root` y detección/forzado de formato. Añadido bin `xmind-md`, documentación y CI multiplataforma. `.gitattributes` fija LF para evitar diferencias de formato en Windows. CI verde: [42856600346](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42856600346), SHA `55c1700e2d4df7787dddcc65a273e267d112ff42`; 9 archivos de test y 107 pruebas correctas en Ubuntu y Windows; formato, lint, tipos generados, typecheck, build y smoke test CLI correctos | Solicitar autorización para AUD-006 |


| 2026-11-11 | AUD-006: evaluación SDK oficial XMind | Evaluado `xmind@2.2.33` (MIT), API, formato ZIP/JSON, cobertura, limitaciones, actividad y dependencias. Prueba aislada con Node `v24.22.2`: genera `.xmind`, valida Workbook y comprueba `content.json`, `manifest.json`, temas anidados, notas, etiquetas vía modelo, marcadores, resumen y tema en Ubuntu/Windows. Se detecta defecto de `Topic.addLabel()` (array frente a schema string); workaround probado mediante campo `labels` string. Decisión ADR-0001: SDK-first provisional, encapsulado en adaptador, versión fijada, sin añadirlo aún como dependencia de producción. CI general [42982530041](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42982530041) verde; 9 archivos y 107 pruebas en Ubuntu/Windows. Probe SDK [42982529970](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42982529970) verde en ambos sistemas. `main` verificada en `6aca81b59dbfcfc13034e7e1115c70f7691c5035`. No se ha probado apertura/guardado en XMind Desktop: queda en AUD-009 | Solicitar autorización para AUD-007 |


| 2026-11-11 | AUD-007: primera implementación del adaptador XMind | Añadido `xmind@2.2.33`, adaptador aislado, exportación CLI `--format xmind`, modos strict/compatible, diagnósticos para pérdidas y pruebas iniciales. La primera CI detectó lockfile incompleto (corregido) y formato (corregido por Prettier en la rama). Pendiente CI de HEAD posterior a los arreglos, revisión de cobertura y cierre | Ejecutar CI completa en Ubuntu/Windows, corregir fallos, eliminar workflow temporal de formato y completar documentación |


| 2026-11-11 | AUD-008: adaptador SVG y cierre | Añadido `src/adapters/svg/svg-adapter.ts`, exportación CLI `--format svg`, geometría determinista, temas y metadatos accesibles, relaciones, límites, resúmenes, estilos mapeables y metadatos XML con el IR completo. Los assets no se dibujan: strict detiene y compatible informa. Se filtran esquemas de hipervínculo no permitidos y se escapan caracteres para XML 1.0. Añadidas pruebas de determinismo, jerarquía, estilos, metadatos, assets, enlaces y CLI. CI [42989195843](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42989195843) verde en Ubuntu y Windows; 11 archivos de test y 118 pruebas. Probe SDK [42989195787](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42989195787) también verde. HEAD de código `980279a6e61a990769e9884ea1fc51888d5bf054`. `main` sigue en `6aca81b59dbfcfc13034e7e1115c70f7691c5035` | Solicitar autorización para AUD-009 |
