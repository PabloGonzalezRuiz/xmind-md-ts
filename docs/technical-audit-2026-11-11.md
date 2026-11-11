# Auditoría técnica de XMind MD TS — 2026-11-11

## 1. Alcance y método

Esta auditoría se realizó sobre el repositorio GitHub y la rama activa, no sobre una copia local.

Se inspeccionaron:
- Metadatos del repositorio, ramas y diferencias frente a main.
- README, prompt maestro, roadmap, auditoría previa y documentación de arquitectura, desarrollo, calidad, gramática, IR, estilos, validación, CLI, adaptadores y decisiones.
- package.json, workflow CI y workflow de prueba aislada del SDK.
- Generador de tipos, tipos generados, parser, validador semántico, validador completo, CLI y adaptadores XMind/SVG.
- Suite de pruebas y logs de los jobs Ubuntu/Windows de la ejecución general y de la prueba SDK.

No se ejecutó npm run verify en una máquina local durante esta auditoría. La evidencia de ejecución procede de los logs de GitHub Actions. Tampoco se abrió ni guardó ningún archivo mediante XMind Desktop.

## 2. Estado real del repositorio

Repositorio: https://github.com/PabloGonzalezRuiz/xmind-md-ts

- Rama activa: feature/aud-003-runtime-schema.
- HEAD al iniciar la auditoría: 8a8b28953ac29d7bcd5d3707f19b484d8834915c.
- Último commit con código probado: 980279a6e61a990769e9884ea1fc51888d5bf054.
- Los dos commits entre ambos SHAs cambiaron únicamente documentación: docs/adapters.md, docs/cli.md, docs/project-audit-and-continuation.md y docs/roadmap.md.
- main: 6aca81b59dbfcfc13034e7e1115c70f7691c5035.
- La rama activa contiene 353 commits por delante de main y no está integrada.
- La búsqueda de pull requests y de issues abiertos del repositorio no devolvió resultados.
- No se ha creado PR ni se ha modificado main.

### Ramas encontradas

| Rama | HEAD observado | Commits por delante de main | Interpretación |
|---|---|---:|---|
| main | 6aca81b59dbfcfc13034e7e1115c70f7691c5035 | 0 | Contrato/documentación inicial; no contiene la aplicación |
| feature/phase-3-project-scaffold | 43a006096aa65f72c73b5ec20ab3d457fe698019 | 36 | Scaffold y toolchain |
| feature/phase-4-markdown-parser | d31892ba0895f513b8b19a284de929623d10af6b | 84 | Parser Markdown |
| feature/phase-5-semantic-validation | 954216e99a13106d88ba72652460047d826b9c55 | 119 | Validación semántica |
| feature/phase-6-style-engine | 005301060582b193327ae10244cbe7ade9cd413f | 255 | Rama anterior del motor de estilos y prototipo de comprobación de tipos |
| feature/aud-003-runtime-schema | 8a8b28953ac29d7bcd5d3707f19b484d8834915c | 353 | Línea acumulada activa; fases 3–9/AUD-001…008 |

La rama feature/phase-6-style-engine contiene un prototipo anterior de checker estructural AUD-012. La rama activa feature/aud-003-runtime-schema utiliza la estrategia posterior de generación de tipos desde JSON Schema. No copiar el prototipo anterior encima de la implementación activa sin comparar los contratos y decisiones.

## 3. Estado funcional

### Implementado

1. Contrato IR 1.0.0, JSON Schema Draft 2020-12, fixture mínimo y matriz de conformidad.
2. Toolchain TypeScript estricto, Node 24, npm y lockfile.
3. Parser Markdown basado en Unified/Remark: CommonMark, GFM, front matter, directivas, bloques, posiciones y diagnósticos.
4. Validador semántico: IDs, referencias, ciclos, tablas, URI, límites y rutas de assets.
5. Motor de estilos: catálogo, precedencia, StyleSets, herencia, roles, estilos nombrados, overrides, fusión, reinicios y procedencia.
6. Validador estructural runtime con Ajv 8 Draft 2020-12 y pipeline completo estructural→semántico.
7. Generación de tipos TypeScript desde el schema y comprobación de sincronización.
8. Corpus parser/IR positivo, negativo y de diagnósticos.
9. Adaptador JSON y CLI parse/validate/export.
10. Evaluación SDK XMind y decisión ADR-0001.
11. Adaptador XMind inicial con modos strict/compatible y diagnósticos de pérdidas.
12. Adaptador SVG autocontenido y determinista con metadata IR.

### No implementado

- Visor web.
- Importación de archivos XMind existentes o round-trip XMind.
- Integración/merge de las ramas de desarrollo en main.
- Release pública o paquete publicado.
- Automatización de apertura/guardado en XMind Desktop (la validación de escritorio se realizó manualmente por el usuario, no mediante pruebas automatizadas).

## 4. Arquitectura y APIs observadas

| Componente | Ruta | Responsabilidad |
|---|---|---|
| Parser | src/markdown/parser.ts | Markdown/front matter/directivas → IR |
| Schema | src/validation/schema-validator.ts | Ajv estructural |
| Semántica | src/validation/semantic-validator.ts | Invariantes globales |
| Pipeline | src/validation/complete-validator.ts | Schema primero; semántica solo si pasa |
| Estilos | src/styles/catalog.ts, src/styles/style-engine.ts | Catálogo y resolución con procedencia |
| JSON | src/adapters/json/json-adapter.ts | Serialización del IR |
| XMind | src/adapters/xmind/xmind-adapter.ts | Generación .xmind mediante SDK |
| SVG | src/adapters/svg/svg-adapter.ts | Render SVG y metadata |
| CLI | src/cli/main.ts | parse, validate, export |
| Binario | bin/xmind-md.js | Ejecutable npm |
| Tipos | scripts/generate-ir-types.js | Generación de tipos desde schema |

### Validación

validateIrDocumentComplete recibe unknown, ejecuta primero validateIrSchema y retorna inmediatamente si el schema falla. Solo entonces ejecuta validateIrDocument. Esta separación es correcta y evita que el validador semántico recorra estructuras malformadas.

El schema es la fuente de verdad estructural. Los tipos TypeScript están generados y no deben editarse manualmente. El generador falla ante keywords estructurales no admitidas; las restricciones no representables en TypeScript permanecen bajo Ajv.

### CLI

Comandos observados:
- parse: Markdown a IR JSON.
- validate: Markdown o JSON.
- export: JSON, XMind o SVG.
- stdin/stdout, formato de entrada explícito, modo compatible/strict, raíz de assets y códigos de salida 0–3.
- La CLI valida el IR completo antes de exportar.

## 5. Toolchain y evidencia de CI

Dependencias/versiones principales:
- Node.js 24.
- TypeScript 6.0.3.
- Vitest 5.0.5.
- ESLint 10.14.0 y typescript-eslint 8.72.2.
- Prettier 3.9.10.
- Ajv 8.17.1 vía alias ajv2020, ajv-formats 3.0.1.
- xmind 2.2.33.

### CI general

[Run 42989195843](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42989195843)

Dos jobs completados con conclusión success:
- Ubuntu latest.
- Windows latest.

En cada job:
- npm ci.
- Prettier check.
- ESLint.
- Check generated IR types.
- Typecheck.
- Vitest: 11 archivos, 118/118 pruebas.
- Build.
- CLI compiled smoke test.

Los logs de ambos jobs fueron inspeccionados y confirman 118 pruebas correctas en cada sistema.

### Probe del SDK XMind

[Run 42989195787](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42989195787)

Ubuntu y Windows completados con success. Se instaló el SDK en un directorio temporal aislado y se generó/inspeccionó un paquete. Esta prueba no equivale a validar el adaptador completo ni a abrir el archivo con XMind Desktop.

### Workflow

.github/workflows/ci.yml concede contents: read, ejecuta CI en Ubuntu/Windows y no modifica ni hace push al repositorio. El workflow xmind-sdk-probe.yml prueba el SDK de forma aislada.

## 6. Limitaciones funcionales por adaptador

### XMind

Dependencia fijada xmind 2.2.33, MIT, encapsulada. El SDK no carga XMind existentes desde 2.2.0; no hay importación ni round-trip. El helper Topic.addLabel presenta un defecto (escribe array aunque el modelo espera string); el adaptador evita ese helper y escribe el campo labels como string.

La matriz actual indica:
- Jerarquía y títulos: mapeados/nativos.
- Notas y contenido: contenido aplanado a texto en notas.
- Marcadores e hipervínculos de temas no centrales: mapeados.
- Varias etiquetas: colapsadas en cadena.
- Resúmenes: solo rangos cuyos extremos sean hermanos.
- Relaciones, boundaries, StyleSets/overrides y assets binarios: no soportados por esta primera versión.
- Etiquetas e hipervínculo de raíz: omitidos con diagnóstico.

strict detiene cuando hay diagnósticos de error; compatible permite un paquete parcial con pérdidas declaradas.

### SVG

Produce SVG UTF-8 autocontenido, determinista para el mismo IR y versión del renderizador. Incluye jerarquía, relaciones, boundaries, summaries, estilos mapeables, enlaces filtrados y metadata con el IR completo.

Limitaciones:
- Assets/imágenes no se dibujan; strict bloquea y compatible diagnostica la omisión.
- Sombras no se representan visualmente.
- Padding puede ser aproximado.
- Contenido y notas se exponen en descripciones accesibles y metadata, no como cuerpo visible del nodo.
- Métricas tipográficas aproximadas: los glifos pueden variar entre fuentes/motores SVG.
- Un SVG convencional no permite recuperar la sintaxis Markdown original, aunque se preserve el IR.

## 7. Hallazgos de revisión estática detectados inicialmente: AUD-013

Se encontraron dos defectos en src/cli/main.ts:

### AUD-013.1 — extensión de salida derivada

El patrón de la expresión regular en la línea que deriva outputPath está escapado de más: /\\.[^.\\/]+$/.

Comprobación del patrón:
- mapa.md → no coincide.
- C:\docs\mapa.md → no coincide.
- mapa\\.md → sí coincide.

Por tanto, al omitir --output en una exportación XMind/SVG desde un archivo normal, la extensión de entrada no se elimina. El nombre queda como mapa.md.xmind o mapa.md.svg, en vez de mapa.xmind/mapa.svg.

La suite actual usa --output explícito en los tests de exportación; por eso el defecto no fue detectado por las 118 pruebas.

### AUD-013.2 — salto de línea en errores de exportación

Los bloques que capturan XMindExportError y SvgExportError escriben la secuencia \n escapada como texto literal en el template string, en lugar de un salto de línea. Afecta a la presentación del mensaje de error en stderr, no al código de salida.

La suite actual no contiene aserciones específicas de estos mensajes.

### Corrección propuesta

- Corregir la expresión regular para eliminar la extensión final en rutas POSIX y Windows.
- Sustituir la secuencia literal por salto de línea real en ambos mensajes.
- Añadir pruebas de CLI sin --output para entradas Markdown y JSON, comprobando el nombre final y existencia del archivo.
- Añadir pruebas de stderr para ambos errores de exportación.
- Ejecutar CI completa en Ubuntu y Windows.
- Mantenerlo como tarea AUD-013; no se modificó código en esta auditoría.

## 8. Calidad de documentación antes de esta auditoría

Se detectaron documentos desincronizados respecto al código:
- README afirmaba que XMind y SVG seguían pendientes.
- Roadmap no reflejaba el cierre de AUD-005…AUD-008.
- Prompt maestro describía la fase 6 como en desarrollo y la validación schema como no integrada.
- docs/development.md afirmaba que no existía validación completa y describía la CLI solo para JSON.
- docs/quality-and-testing.md seguía describiendo comandos y cobertura previos al pipeline Ajv y los adaptadores.
- docs/decisions.md mantenía la evaluación del SDK como pendiente y JSON/SVG como planificados.

Se sincronizaron: README.md, docs/ai-master-prompt.md, docs/roadmap.md, docs/architecture.md, docs/development.md, docs/quality-and-testing.md, docs/decisions.md, docs/cli.md y docs/project-audit-and-continuation.md; se creó este informe. También se revisaron docs/adapters.md, docs/schema-validation.md, docs/ir-specification.md, docs/grammar.md, docs/style-system.md, spec/conformance/README.md y docs/decisions/ADR-0001-xmind-sdk.md, que ya describían correctamente el comportamiento observado y no necesitaron reescritura. La auditoría de continuidad y este informe son las referencias operativas para la siguiente sesión.

## 9. Backlog y orden de continuación

| ID | Estado | Próximo criterio |
|---|---|---|
| AUD-001 | Verificada | CI read-only estable |
| AUD-002 | Verificada | Robustez del motor de estilos |
| AUD-003 | Verificada | Ajv runtime, tipos generados y pipeline |
| AUD-004 | Verificada | Corpus parser/IR |
| AUD-005 | Verificada | JSON y CLI |
| AUD-006 | Verificada | Evaluación SDK y ADR |
| AUD-007 | Verificada | Exportador XMind inicial |
| AUD-008 | Verificada | Exportador SVG |
| AUD-009 | Completada y verificada | Workflow 43009405102 correcto; usuario confirmó apertura, jerarquía visible, guardado y reapertura en XMind Desktop. Versión/SO no registrados |
| AUD-010 | En curso | Guía, ejemplos, CI y artefacto instalable verificados; release pública pendiente de licencia, auditoría de vulnerabilidades y canal |
| AUD-011 | Pendiente | Visor web, accesibilidad y Playwright |
| AUD-013 | Resuelta posteriormente | Corrección y pruebas de regresión verificadas en la sección 11 |

AUD-009 y AUD-013 están cerradas. AUD-010 está autorizada y en curso; AUD-011 permanece pendiente.

## 10. Protocolo para recuperar contexto

En una conversación nueva, ejecutar este orden:

1. Leer este informe y docs/project-audit-and-continuation.md completos.
2. Leer docs/ai-master-prompt.md y docs/roadmap.md.
3. Consultar en GitHub el HEAD real de main y feature/aud-003-runtime-schema; no reutilizar los SHA del informe como HEAD actual.
4. Revisar los commits posteriores al último SHA con CI verde y distinguir cambios de código de cambios documentales.
5. Consultar los runs 42989195843 y 42989195787 como evidencia histórica de AUD-008.
6. Revisar el backlog. AUD-009 está completada; AUD-010 está autorizada y en curso; AUD-011 requiere autorización expresa.
7. No fusionar ramas, abrir PR, modificar main ni crear release sin autorización.
8. Al terminar cualquier tarea, actualizar este informe, el registro de continuidad, el roadmap, README y los documentos técnicos afectados.
9. Registrar SHA exacto de código probado, SHA documental, run IDs, matriz de sistemas, número de pruebas y limitaciones.
10. No afirmar que XMind Desktop abre un archivo basándose solo en un ZIP generado correctamente en CI.
## 11. Seguimiento posterior: AUD-013 corregida y verificada

La incidencia registrada en la auditoría inicial se resolvió en la rama activa `feature/aud-003-runtime-schema`.

- Código de corrección: `f3a9ed8081e1c55a62888550e586b6ee8dc98c7e`.
- HEAD de código y pruebas verificado: `fe1d3e510a76719f12d4eeaf0e081304720196b8`.
- Derivación XMind/SVG: se elimina la extensión final con un patrón compatible con separadores POSIX y Windows.
- stderr: los errores XMind y SVG terminan con un salto de línea real.
- Regresiones: exportación sin `--output` desde Markdown y JSON para XMind y SVG; formato de stderr para ambos errores.
- CI [43003867274](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43003867274): 11 archivos y 124/124 pruebas en Ubuntu y Windows. Formato, lint, tipos generados, typecheck, build y smoke test correctos.
- Probe SDK [43003867447](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43003867447): Ubuntu y Windows correctos.

AUD-013 y AUD-009 quedan **completadas y verificadas**. AUD-010 está autorizada y en curso; AUD-011 (visor web) sigue pendiente. No se ha modificado `main` ni se ha creado una release o PR.


## 12. Seguimiento posterior: AUD-009 completada

El 2026-11-11 se autorizó iniciar AUD-009. En `feature/aud-003-runtime-schema` se añadieron un fixture Markdown (`fixtures/aud-009-desktop-validation.md`), un workflow (`.github/workflows/aud-009-xmind-desktop-artifact.yml`) que ejecuta `npm ci`, `npm run verify`, exporta mediante la CLI compilada, verifica el ZIP, calcula SHA-256 y publica el artefacto `aud-009-xmind-desktop-validation`, y el procedimiento `docs/aud-009-xmind-desktop-validation.md`.

El HEAD de preparación del workflow es `323caef1df653fc569a169acda87a1f6ae088d66`. El diff desde el último código probado `fe1d3e510a76719f12d4eeaf0e081304720196b8` no modifica el código de aplicación. El workflow [43009405102](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43009405102) terminó correctamente. El usuario confirmó que el archivo abre en XMind Desktop, que la jerarquía se visualiza correctamente (aportó captura), que pudo guardar una copia con otro nombre y que la copia volvió a abrirse tras cerrar la aplicación conservando el contenido. No se comunicaron incidencias. La versión exacta de XMind Desktop y el sistema operativo no se facilitaron. AUD-009 queda **completada y verificada funcionalmente**; los metadatos del entorno quedan sin registrar.

## 13. Cierre de AUD-009 — 2026-11-11

La prueba de aceptación de escritorio se completó con confirmación directa del usuario. La evidencia cubre apertura, inspección visual de la estructura, guardado de copia y reapertura. No debe describirse como prueba automatizada: la automatización genera y publica el artefacto; la compatibilidad Desktop se comprobó manualmente. Workflow: [43009405102](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43009405102). Artefacto: `artifacts/aud-009/aud-009-desktop-validation.xmind`. Versión de XMind Desktop y sistema operativo: no facilitados.

## 14. AUD-010 — documentación y preparación de distribución en curso

Se añadieron `docs/user-guide.md`, los ejemplos `examples/quick-start.md` y `examples/with-notes-and-styles.md`, `CHANGELOG.md`, `docs/release-readiness.md`, `scripts/verify-examples.js` y `scripts/verify-package.js`. `npm run verify` incorpora las comprobaciones de ejemplos y de empaquetado/instalación limpia. La CI de empaquetado [43012605756](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43012605756) terminó correctamente en Ubuntu y Windows: 11 archivos y 124/124 pruebas por sistema; formato, lint, tipos generados, typecheck, build, smoke test CLI, validación de ambos ejemplos, exportación JSON/XMind/SVG e instalación del tarball en un directorio limpio. La CI final [43013195119](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43013195119), sobre el HEAD `3163ad7190494f21a9289468ea22438ce4544700`, también terminó correctamente en Ubuntu y Windows.

El workflow de distribución [43012600819](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43012600819) generó el artefacto `xmind-md-ts-distribution` (ID `13851262408`), con `xmind-md-ts-0.1.0.tgz`, `README.txt` y `SHA256SUMS.txt`. SHA-256 del tarball: `8276da05de8d3d2c96781b48c6acd30780152b8d7d34adab4b430cdea89827dd`. El artefacto temporal está disponible hasta el 2026-12-11. El único commit entre el SHA de generación y el HEAD final elimina un workflow temporal de formateo; no cambia el paquete.

La licencia del proyecto se ha fijado como MIT, con `Copyright (c) 2026 Pablo González Ruiz`, mediante `LICENSE`; `package.json` declara `license: MIT` e incluye el archivo en el paquete. La publicación npm sigue deshabilitada porque `private: true`; la versión continúa en `0.1.0`. Una instalación de dependencias reportó 15 vulnerabilidades (14 moderadas y 1 alta), aún sin clasificación individual. No se ha publicado paquete en npm ni creado release pública. Quedan pendientes la revisión de dependencias y la decisión del canal de distribución.

## Addendum de estado — 2026-11-11 (13:25 Europe/Madrid)

La inspección actual del repositorio y de GitHub Actions actualiza las referencias históricas de este documento:

- HEAD vigente: `72c411eed5b497d2399d152f1b27595ad468dd19` en `feature/aud-003-runtime-schema`.
- Último código probado sigue siendo el contenido de aplicación cubierto por las CI anteriores; el último HEAD actual contiene cambios documentales de decisión de distribución. CI ejecutada directamente sobre HEAD: [43015959095](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43015959095), Ubuntu/Windows success, 124/124 pruebas por sistema y verificaciones de ejemplos/paquete; probe SDK [43015959098](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43015959098), ambos sistemas success.
- Workflow de distribución [43015946683](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43015946683): success; artefacto ID `13852422612`, caduca 2026-12-11. Digest del ZIP del artefacto: `b50009e4761e2d14b84b5eb84da2cb06b89e15503ccc851c74815ebf49022846`.
- `main` continúa en `6aca81b59dbfcfc13034e7e1115c70f7691c5035`; la rama activa está 471 commits por delante, 0 por detrás.
- El README y el prompt maestro históricos contienen SHA y decisiones de distribución desactualizados; esta auditoría se sincroniza en este commit.
- El aviso de 15 vulnerabilidades (14 moderadas, 1 alta) procede de una instalación anterior y aún no ha sido auditado individualmente contra el lockfile actual. Permanece como riesgo pendiente, no como resultado vigente confirmado.
- La ruta de distribución acordada es GitHub Releases; npm aplazado. No existe release pública. AUD-011 sigue sin autorización.

**Siguiente tarea autorizada: completar AUD-010**, comenzando por auditoría de vulnerabilidades y licencias, después política de versionado/compatibilidad y workflow de GitHub Releases en modo de preparación/prueba. No crear la release pública sin autorización expresa.


## 15. Auditoría reproducible de dependencias — 2026-11-11

La CI [43053653473](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43053653473), sobre `e66a0da529cd249c54c6d922c80dfcdaa7f7fef4`, ejecutó `npm audit --json` con el lockfile vigente. Artefacto `npm-audit-report`: ID `13870876663`.

- Resumen: 12 moderadas, 0 altas, 0 críticas.
- Dependencias declaradas en el lockfile: prod 121, dev 181, optional 53, peer 36, total 301 (recuentos npm; no equivalen a paquetes físicos únicos).
- Se actualizaron `yaml` a 2.9.1, Ajv a 8.20.0 (incluido el alias `ajv2020` y el Ajv usado por `ajv-formats`) y `fast-uri` a 3.1.9. Sus avisos previos ya no aparecen en el informe actual.
- Alertas de desarrollo: `minimatch` (GHSA-g3hv-75wg-m249) y el conjunto de ESLint/TypeScript-ESLint que lo incorpora. La propuesta automática incluye bajar ESLint 10 a 9.39.5 y cambiar la versión de TypeScript-ESLint; no se ha aplicado porque requiere revisar compatibilidad y toolchain.
- Alertas de producción: `xmind@2.2.33` y su dependencia transitiva `uuid@3.4.0` (GHSA-w5hq-g745-h8pq). La ruta descrita por el aviso afecta a UUID v3/v5/v6 cuando se suministra un búfer. El código inspeccionado del SDK usa `require('uuid/v4')` y llama `v4()` sin búfer; esto reduce la exposición identificada, pero no elimina la alerta del árbol. La propuesta npm de sustituir `xmind` por 0.5.0 supone un cambio mayor y no se ha aceptado.
- No hay avisos altos/críticos en el informe actual. No equivale a un árbol libre de vulnerabilidades; queda pendiente la decisión documentada sobre el riesgo moderado residual antes de publicar.

## 16. Auditoría de licencias — 2026-11-11

Workflow reproducible [43053653465](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43053653465), `license-checker@25.0.1`, `npm ci --ignore-scripts`, ejecutado en Ubuntu y Windows. Ambos jobs terminaron success. Artefactos: Ubuntu `13869797169`, Windows `13871485171`.

- En cada plataforma: 120 dependencias de producción y 246 dependencias instaladas en total.
- Producción: 114 MIT, 2 ISC, 1 BSD-2-Clause, 1 BSD-3-Clause, `jszip@3.10.1` (`MIT OR GPL-3.0-or-later`) y `pako@1.0.11` (`MIT AND Zlib`).
- Desarrollo/optional: además aparecen Apache-2.0 (16), BlueOak-1.0.0 (1), MPL-2.0 (2), más los paquetes de licencias permisivas ya presentes en producción. MPL-2.0 corresponde a `lightningcss@1.33.0` y al binario de plataforma; no aparece en el inventario de producción.
- La expresión de JSZip permite optar por MIT; debe conservarse la atribución y el texto MIT. Pako declara MIT AND Zlib, por lo que deben respetarse ambas condiciones y conservarse sus avisos. Antes de release se debe verificar que los avisos/licencias de terceros queden disponibles junto al paquete distribuido.
- `license-checker` etiqueta el paquete raíz privado como UNLICENSED en el JSON bruto; se excluye de los recuentos de terceros. El repositorio declara MIT en `package.json` y contiene `LICENSE`.
- Los informes completos JSON son los artefactos citados; el resumen y la evaluación están en `docs/third-party-license-audit-2026-11-11.md`.

La auditoría de vulnerabilidades y el inventario de licencias están ejecutados y documentados. Esto no constituye asesoramiento jurídico ni una aceptación automática de riesgos: las obligaciones de avisos de terceros y el riesgo moderado residual siguen siendo puntos de control de release.
