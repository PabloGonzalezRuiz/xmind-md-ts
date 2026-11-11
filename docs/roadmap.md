# Hoja de ruta

Las fases se ejecutan secuencialmente. Al terminar una tarea/fase se presenta el resultado y se espera autorización expresa antes de comenzar la siguiente.

## Estado de fases

AUD-010 fue autorizada el 2026-11-11. Guía, ejemplos y empaquetado están implementados. CI 43012605756 pasa en Ubuntu/Windows (124/124 pruebas por sistema, ejemplos y paquete instalado). El workflow 43012600819 publica un artefacto temporal instalable. El canal acordado es GitHub Releases; npm queda aplazado. `private: true` se mantiene porque no se publicará en npm. La primera release pública sigue pendiente de auditoría de vulnerabilidades y criterios de aceptación. La licencia MIT ya está incorporada. Ver [preparación de distribución](release-readiness.md).

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
