# Hoja de ruta

Las fases se ejecutan secuencialmente. Al terminar una tarea/fase se presenta el resultado y se espera autorización expresa antes de comenzar la siguiente.

## Estado de fases

AUD-010 fue autorizada el 2026-11-11. Guía, ejemplos y empaquetado están implementados. CI 43012605756 pasa en Ubuntu/Windows (124/124 pruebas por sistema, ejemplos y paquete instalado). El workflow 43012600819 publica un artefacto temporal instalable. El canal acordado es GitHub Releases; npm queda aplazado. `private: true` se mantiene porque no se publicará en npm. La primera release pública sigue pendiente de auditoría individual de dependencias/licencias, workflow de GitHub Releases y criterios de aceptación. La licencia MIT ya está incorporada. Ver [preparación de distribución](release-readiness.md).

| Fase | Alcance | Resultado verificable | Estado |
|---|---|---|---|
| 1 | Prompt maestro y documentación funcional/técnica | Documentación base y plan | Completada |
| 2 | Contrato IR y JSON Schema | IR v1, tipos generados, schema, fixture y matriz de conformidad | Completada |
| 3 | Esqueleto TypeScript y tooling | Configuración estricta, lockfile, lint, formato, Vitest y CI | Completada |
| 4 | Parser Markdown | Gramática, directivas, diagnósticos y corpus de parser | Completada |
| 5 | Validación semántica e identidad | IDs, referencias, ciclos, límites y diagnósticos | Completada |
| 6 | Motor de estilos | Catálogo tipado, StyleSets, herencia, precedencia, fusión y procedencia | Completada; AUD-001/002 verificadas |
| 7 | Adaptador JSON y CLI | parse, validate, export JSON; stdin/stdout y códigos de salida | Completada; AUD-005 verificada |
| 8 | Evaluación e integración XMind | SDK evaluado, decisión ADR, exportador XMind y diagnósticos | Completada; AUD-006/007 verificadas |
| 9 | Adaptador SVG | SVG autocontenido, determinista y con metadatos IR | Completada; AUD-008 verificada |
| 10 | Corpus XMind y validación Desktop | Abrir, inspeccionar, guardar y reabrir artefactos en XMind Desktop | Completada; apertura, jerarquía, guardado y reapertura confirmados por el usuario; versión/SO no registrados; AUD-009 |
| 11 | Documentación de usuario y publicación | Guía de instalación/uso, ejemplos, limitaciones, releases y artefactos | En curso; guía, ejemplos, CI y artefacto instalable verificados; release pública pendiente de decisiones de licencia y seguridad; AUD-010 |
| 12 | Visor web TypeScript | Aplicación web que consume IR, accesibilidad y pruebas Playwright | Pendiente; AUD-011 |

## Auditorías transversales

| ID | Alcance | Estado |
|---|---|---|
| AUD-001 | Estabilizar CI y eliminar automatización que modificaba el repositorio | Completada y verificada |
| AUD-002 | Robustez del motor de estilos | Completada y verificada |
| AUD-003 | Validación JSON Schema runtime y tipos generados | Completada y verificada |
| AUD-004 | Corpus de conformidad Markdown/IR | Completada y verificada |
| AUD-005 | Adaptador JSON y CLI | Completada y verificada |
| AUD-006 | Evaluación del SDK oficial XMind | Completada y verificada |
| AUD-007 | Exportador XMind inicial | Completada y verificada |
| AUD-008 | Exportador SVG | Completada y verificada |
| AUD-009 | Validación de paquetes con XMind Desktop | Completada y verificada: apertura, visualización, guardado y reapertura confirmados por el usuario; versión/SO no registrados |
| AUD-010 | Documentación de usuario y publicación | En curso: guía, ejemplos, CI y artefacto instalable verificados; release pública pendiente de auditoría de vulnerabilidades y preparación del workflow de GitHub Releases; licencia MIT incorporada, canal acordado |
| AUD-011 | Visor web | Pendiente |
| AUD-013 | Corregir derivación de nombre de salida y formato de errores de exportación en CLI | Completada y verificada; CI 43003867274, 124/124 pruebas Ubuntu/Windows |

AUD-012 (generación de tipos TypeScript desde el JSON Schema y control de sincronización) se considera incorporada en AUD-003 y cerrada en la rama activa.

## Rama y evidencia de referencia

- Rama activa de desarrollo: feature/aud-003-runtime-schema.
- Código probado más reciente: fe1d3e510a76719f12d4eeaf0e081304720196b8.
- HEAD observado tras preparar el workflow AUD-009 y antes de la última sincronización documental: c8295b031551a7a421fa3b7f550dceb99b865651. Desde el código probado fe1d3e510a76719f12d4eeaf0e081304720196b8 se han añadido únicamente fixture, documentación y workflow; no se ha modificado el código de aplicación.
- CI general AUD-008 [42989195843](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42989195843): 118/118 pruebas por sistema.
- CI AUD-013 [43003867274](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43003867274): 124/124 pruebas en Ubuntu y Windows; formato, lint, tipos generados, typecheck, build y smoke test CLI.
- Probe SDK AUD-008 [42989195787](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42989195787): Ubuntu y Windows.
- Probe SDK AUD-013 [43003867447](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43003867447): Ubuntu y Windows.
- main sigue en 6aca81b59dbfcfc13034e7e1115c70f7691c5035; no se ha hecho merge.

## AUD-009 — Validación Desktop completada

- Fixture: `fixtures/aud-009-desktop-validation.md`.
- Workflow: `.github/workflows/aud-009-xmind-desktop-artifact.yml`.
- Artefacto esperado: `aud-009-xmind-desktop-validation` (XMind + README + SHA-256).
- Procedimiento: [docs/aud-009-xmind-desktop-validation.md](aud-009-xmind-desktop-validation.md).
- Workflow [43009405102](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43009405102) satisfactorio; el archivo también está publicado en `artifacts/aud-009/aud-009-desktop-validation.xmind`.
- El usuario confirmó apertura, visualización de la jerarquía (captura), guardado de copia y reapertura correcta.
- Versión exacta de XMind Desktop y sistema operativo no facilitados.

## Reglas de avance

- No empezar una fase/tarea siguiente sin autorización expresa.
- No declarar finalización por el mero hecho de compilar.
- Separar implementación, pruebas automatizadas, CI, validación de formato y validación en aplicaciones de escritorio.
- Cada cambio actualiza auditoría, roadmap y documentación funcional afectada.
- El estado detallado y el protocolo de recuperación están en Auditoría y continuidad.


## Estado comprobado 2026-11-11

- HEAD: `72c411eed5b497d2399d152f1b27595ad468dd19`; CI [43015959095](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43015959095) success en Ubuntu/Windows, 124/124 pruebas por sistema; SDK probe [43015959098](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43015959098) success en ambos.
- Distribución [43015946683](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43015946683) success; artefacto ID `13852422612`, caduca 2026-12-11.
- `main` permanece en `6aca81b59dbfcfc13034e7e1115c70f7691c5035`; rama activa 471 commits ahead, 0 behind.
- Próximo paso AUD-010: auditoría de vulnerabilidades y licencias, política de versionado/compatibilidad IR, preparación y prueba del workflow GitHub Releases. No crear una release pública sin autorización.
- AUD-011 continúa pendiente y no autorizada.


## Estado y continuación verificados — 2026-11-11 (16:52 Europe/Madrid)

SHA de código/workflows verificado: `e66a0da529cd249c54c6d922c80dfcdaa7f7fef4`. CI [43053653473](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43053653473) success en Ubuntu/Windows, 124/124 pruebas por sistema; probe SDK [43053653384](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43053653384) success en ambos.

AUD-010 sigue en curso. La auditoría npm actual informa 12 vulnerabilidades moderadas, ninguna alta ni crítica (artefacto 13870876663). El inventario de licencias se ejecutó correctamente en Ubuntu y Windows (run [43053653465](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43053653465)): 120 dependencias de producción y 246 instaladas en total por plataforma. Excepciones/expresiones compuestas revisadas: JSZip MIT OR GPL, Pako MIT AND Zlib; MPL-2.0 solo en Lightning CSS de desarrollo. Detalle en [auditoría de licencias](third-party-license-audit-2026-11-11.md).

Siguientes tareas de AUD-010:
1. Política de versionado semántico y compatibilidad del IR.
2. Workflow de GitHub Releases preparado y probado, sin publicación.
3. Prueba integral de distribución desde un SHA verificado y revisión de checksums/contenido.
4. Revisión final de riesgos y criterios; solicitar autorización explícita antes de publicar.

`main` permanece en `6aca81b59dbfcfc13034e7e1115c70f7691c5035`; la rama de desarrollo estaba 487 commits por delante y 0 por detrás en el SHA auditado. AUD-011 continúa pendiente y no autorizada. No abrir PR, fusionar ni publicar release.

## Actualización AUD-010 — 2026-11-12

La política de versionado y compatibilidad IR se ha documentado en `docs/versioning-and-compatibility.md`, registrada en `docs/decisions.md` y vinculada desde la especificación. El contrato admitido sigue siendo exactamente IR `1.0.0`; paquete `0.1.0`. La matriz estructural se amplía con SC-111/SC-112 y la validación semántica prueba el rechazo de versiones patch/minor no implementadas. CI [43195892325](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43195892325) completada correctamente en Ubuntu y Windows (129/129 pruebas por sistema), incluida la comprobación de sincronización paquete/CLI. La política de versionado y compatibilidad queda completada. Siguiente tarea: workflow seguro de GitHub Releases, previa autorización expresa.

Se añade `check:version` a `npm run verify` y como paso explícito de CI para comprobar que `applicationVersion` en `src/index.ts` coincide con `package.json`. La nueva ejecución CI debe confirmar esta última parte.


## Actualización AUD-010 — 2026-11-12: preflight de GitHub Releases

Implementado `.github/workflows/aud-010-release-preflight.yml`, con permisos read-only, ejecución automática de dry-run en la rama de trabajo y modo manual opcional para validar un tag existente desde `main`. Comprueba la sincronización paquete/CLI, ejecuta `npm run verify`, empaqueta e instala el tarball en un directorio temporal, prueba la CLI, genera SHA-256/manifiesto y sube un artefacto temporal. No crea tags, releases ni publica en npm. Diseño: [docs/github-release-preflight.md](github-release-preflight.md).

Pendiente: ejecutar y verificar el workflow en Actions, inspeccionar el artefacto y sus checksums, y completar la prueba integral de distribución. No publicar.


## Resultado AUD-010 — workflow preflight — 2026-11-12

Paso 4 completado en el alcance autorizado: workflow de preflight read-only implementado, acciones fijadas a SHA completos y dry-run verificado. Runs: preflight [43211658439](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43211658439), CI [43211658590](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43211658590), SDK probe [43211658454](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43211658454). CI: Ubuntu/Windows, 129/129 tests por sistema. Artefacto ID `13941362391`; tarball SHA-256 verificado: `b7abc4d2b1dc83af1130eb16b468bda532ee51e65b0c104f66b6fed69ec8137a`.

Pendiente: prueba integral final del paquete y avisos de terceros/riesgo residual. No se han creado tags ni releases, no se ha publicado en npm y `main` permanece intacta. El modo de tag del preflight no se ha ejecutado por falta de tag/release autorizada.


## AUD-010 — auditoría del paquete de distribución — 2026-11-12

Actividad 1 ejecutada. Informe: [distribution-package-audit-2026-11-12.md](distribution-package-audit-2026-11-12.md). El tarball real y su checksum se inspeccionaron. La estructura CLI es válida, pero se detectaron seis puntos previos a distribución (artefacto desfasado en documentación, allowlist demasiado amplia, source maps sin fuentes, API root no declarada, notas de pruebas obsoletas y guía de instalación no adaptada a GitHub Releases). No se modificó el paquete; queda pendiente decidir y aplicar correcciones antes de reconstruir el candidato final.


## AUD-010 — revisión de licencias y avisos de terceros — 2026-11-12

Actividad 2 completada. Informe: [docs/third-party-notices-audit-2026-11-12.md](third-party-notices-audit-2026-11-12.md). Se contrastó el inventario de 120 dependencias de producción y el tarball real. JSZip se utilizará bajo la alternativa MIT; Pako conserva las obligaciones MIT y Zlib. El artefacto no incorpora `node_modules` ni código de dependencias vendorizado, por lo que no se considera bloqueante la ausencia de un `THIRD-PARTY-NOTICES` en este candidato concreto. No se alteró el paquete.

**Siguiente actividad propuesta (3):** reevaluar las vulnerabilidades moderadas residuales, separando runtime/producción de herramientas de desarrollo, verificando advisories y rutas de dependencia, y dejando documentada la decisión de mitigación o aceptación. Requiere autorización expresa antes de comenzar.


## AUD-010 — evaluación de vulnerabilidades residuales — 2026-11-12

Actividad 3 completada. Informe: [docs/security-dependency-audit-2026-11-12.md](security-dependency-audit-2026-11-12.md). CI [43224408690](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43224408690) pasó en Ubuntu y Windows. Npm audit reporta 12 registros moderados, 0 altos y 0 críticos, correspondientes a dos advisories.

- PROD-SEC-001: `uuid@3.4.0` transitiva de XMind. El SDK inspeccionado usa `uuid/v4` sin buffer externo; no se observa llamada a las funciones v3/v5/v6 afectadas. Sigue siendo riesgo residual en la dependencia runtime. No se fuerza un override incompatible.
- DEV-SEC-001: `minimatch@10.2.6`, solo desarrollo y tooling ESLint/TypeScript ESLint. No afecta directamente al runtime distribuido.

**Siguiente paso:** revisión final de AUD-010, incluyendo DP-001–DP-006 y decisión expresa sobre el riesgo runtime PROD-SEC-001. Requiere autorización antes de corregir el paquete o realizar cualquier publicación.


## Cierre de revisión final AUD-010 — 2026-11-12

Actividad 4 completada. Informe: [docs/aud-010-final-readiness-review-2026-11-12.md](aud-010-final-readiness-review-2026-11-12.md).

- HEAD revisado: `81e9ad95dd89e4fc765806e64c87e554c9c39460`; `main` permanece en `6aca81b59dbfcfc13034e7e1115c70f7691c5035`.
- CI [43225888536](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43225888536), SDK probe [43225888541](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43225888541) y distribución [43225888690](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43225888690): success en Ubuntu/Windows donde aplica.
- El tarball inspeccionado se generó desde el SHA exacto del run `81e9ad9`; no obstante, el commit documental `e8a100b` añade archivos/cambios bajo `docs/`, que se empaqueta íntegramente. DP-001 queda abierto hasta regenerar el candidato después de las correcciones. DP-002/003/005/006 continúan abiertos; DP-004 queda condicionado a documentar alcance CLI-only.
- La prueba `verify-package` instala el tarball en un directorio limpio y prueba CLI `--help`, `--version` y validación de ejemplo.
- No existe workflow de publicación de GitHub Releases; el preflight es read-only.
- La publicación sigue NO-GO por defectos de empaquetado y por el riesgo runtime PROD-SEC-001 (`uuid@3.4.0`) sin aceptación expresa.

Siguiente actividad propuesta: corrección documental y del empaquetado (DP-002/003/004/005/006), reconstrucción e inspección de un nuevo candidato. Requiere autorización expresa. Resolver PROD-SEC-001 por decisión separada antes de publicar.


## Cierre de correcciones de distribución AUD-010 — 2026-11-12

Completada la actividad correctiva DP-001–DP-006. Informe: [distribution-corrections-2026-11-12.md](distribution-corrections-2026-11-12.md).

- Allowlist de 12 documentos públicos en `package.json`.
- Build sin source maps/declaration maps.
- Paquete CLI-only explícito (`exports: {}`, `bin.xmind-md`).
- Changelog 0.1.0 candidato no publicado; 129/129 pruebas por plataforma.
- Guía de instalación desde tarball de GitHub Release y verificación SHA-256.
- Manifiesto de build interno con commit y run.
- Verificación CI Ubuntu/Windows, SDK probe, distribución y preflight read-only correctos. El tarball inspeccionado: 46 ficheros, 12 docs, cero mapas y cero enlaces Markdown rotos.

**Pendiente antes de publicación:** resolver PROD-SEC-001 (`uuid@3.4.0` runtime vía XMind) mediante aceptación expresa o mitigación compatible; diseñar y validar por separado el workflow publicador con permisos mínimos y aprobación. No publicar, crear tags ni releases sin autorización expresa.
