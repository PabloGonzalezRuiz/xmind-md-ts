# Revisión final de preparación de distribución — AUD-010 — 2026-11-12

## Alcance y estado inspeccionado

- Repositorio: `PabloGonzalezRuiz/xmind-md-ts`.
- Rama: `feature/aud-003-runtime-schema`.
- HEAD inspeccionado: `81e9ad95dd89e4fc765806e64c87e554c9c39460`.
- `main` permanece en `6aca81b59dbfcfc13034e7e1115c70f7691c5035`.
- CI [43225888536](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43225888536): success en Ubuntu y Windows. Incluye formato, lint, tipos generados, typecheck, pruebas, build, smoke CLI y verificación de instalación limpia del tarball.
- SDK probe [43225888541](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43225888541): success en Ubuntu y Windows.
- Distribución [43225888690](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43225888690): success; artefacto Actions `xmind-md-ts-distribution`, ID `13947289242`.
- Los tres workflows corresponden exactamente al HEAD `81e9ad95dd89e4fc765806e64c87e554c9c39460`.

## Inspección del artefacto más reciente

Se descargó y examinó el ZIP de Actions y el tarball real:

- ZIP de Actions: SHA-256 `eebe554fea434ab05d8c6c3b205183bedccf7aef0526988c68c02af0ee888c56`.
- Tarball `xmind-md-ts-0.1.0.tgz`: SHA-256 `3dda161f34543f325aa48f1eaf362b975319c6c6f1615b1259dce20ff8d53272`.
- Tarball: 81 entradas y 519,447 bytes descomprimidos.
- Contiene CLI, código compilado, declaraciones TypeScript, schema IR, ejemplos, LICENSE, README, CHANGELOG y 24 documentos bajo `docs/`.
- El artefacto exterior contiene `README.txt`, `SHA256SUMS.txt` y el tarball. No incluye un manifiesto de build que identifique el SHA de origen dentro del paquete.
- `scripts/verify-package.js`, ejecutado dentro de `npm run verify`, empaqueta el proyecto, lo instala en un directorio temporal limpio y prueba `--help`, `--version` y la validación del ejemplo. El job CI pasó esos pasos.

## Estado de DP-001 a DP-006

| ID | Resultado de la revisión final | Estado |
|---|---|---|
| DP-001 | El artefacto inspeccionado se construyó desde `81e9ad95dd89e4fc765806e64c87e554c9c39460`, que era el HEAD exacto del run. Sin embargo, esta revisión ha añadido documentación bajo `docs/` y actualizado `docs/release-readiness.md`, que también se empaqueta. El HEAD actual pasó a `e8a100b598dbebed65191558f0db9e373f5e96cb`; por tanto el tarball inspeccionado ya no representa todo el contenido documental del HEAD actual. Además, no incluye manifiesto interno de procedencia. | Abierto de nuevo para el HEAD actual; el candidato inspeccionado es válido como snapshot anterior |
| DP-002 | `package.json` sigue incluyendo todo `docs/`. El tarball contiene 24 documentos, entre ellos prompt maestro, auditorías de seguridad/licencias, continuidad y documentos de trabajo. | Abierto |
| DP-003 | El tarball contiene 24 source maps JS/declaraciones, pero no incluye los fuentes TypeScript originales; los mapas inspeccionados no tienen `sourcesContent` y apuntan a rutas ausentes. | Abierto |
| DP-004 | El paquete declara `bin.xmind-md`, pero no `main`, `exports` ni `types` en la raíz. La documentación y el objetivo de distribución describen una CLI; no hay evidencia de una API de librería pública comprometida. | Condicionado: declarar explícitamente CLI-only; no añadir API sin decisión de producto |
| DP-005 | `CHANGELOG.md` todavía indica 124/124 pruebas, mientras el CI actual valida el conjunto actualizado y pasa. También conserva el encabezado `Unreleased`. | Abierto |
| DP-006 | `docs/user-guide.md` todavía indica que no hay instalador independiente y explica clonar la rama de desarrollo. El README exterior del artefacto sí da instrucciones básicas de instalación, pero no sustituye una guía versionada dentro del paquete. | Abierto |

DP-001 se resolvió para el snapshot `81e9ad9`, pero volvió a abrirse al actualizar documentos que forman parte de `docs/` en el commit `e8a100b`. DP-002, DP-003, DP-005 y DP-006 también impiden considerar el tarball candidato final. DP-004 debe cerrarse mediante una decisión explícita de alcance/documentación; la recomendación actual es CLI-only.

## Workflow y controles de publicación

- Se encontraron seis workflows en el repositorio. Existe un preflight de GitHub Release, pero **no existe todavía un workflow publicador de GitHub Releases**.
- `.github/workflows/aud-010-release-preflight.yml` es de solo lectura: `contents: read`, checkout con `persist-credentials: false`, sin token npm ni permisos de publicación. Sus acciones externas están fijadas a SHA completos.
- El preflight genera un candidato temporal y puede validar un tag preexistente desde `main`; no crea tags, releases ni publica.
- El dry-run por push se verificó en [43211658439](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43211658439). El modo de validación de tag y el despacho manual no se han probado; no hay tag autorizado.
- El workflow de distribución de artefacto usa referencias major (`checkout@v5`, `setup-node@v6`, `upload-artifact@v4`) con permisos de solo lectura. No publica. Para un futuro publisher, se deben fijar todas las acciones externas a SHA completos, separar el job con permiso de escritura mínimo y requerir aprobación de entorno.
- La documentación oficial de GitHub recomienda permisos mínimos y fijar acciones externas a SHA completos; también describe attestations para enlazar un artefacto con su repositorio, commit y workflow. Referencias: [seguridad de Actions](https://docs.github.com/en/actions/reference/security/secure-use), [sintaxis de permisos](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax) y [artifact attestations](https://docs.github.com/en/actions/concepts/security/artifact-attestations).

## Riesgo de dependencias y licencias

- La auditoría npm vigente registró 12 entradas moderadas, 0 altas y 0 críticas, agrupadas en dos advisories.
- `minimatch` se mantiene como riesgo de desarrollo/tooling.
- `uuid@3.4.0` sigue presente en runtime vía `xmind@2.2.33`. La ruta inspeccionada de XMind usa UUID v4 sin buffer externo, pero no se ha eliminado la dependencia vulnerable ni se ha aceptado formalmente el riesgo.
- PROD-SEC-001 sigue siendo un bloqueo: se necesita aceptación expresa del riesgo o una mitigación compatible validada antes de publicar.
- La revisión de licencias concluye que el tarball no incorpora `node_modules` ni código de dependencias vendorizado; la ausencia de `THIRD-PARTY-NOTICES` no se considera un bloqueo demostrado para la estructura actual. Se deben conservar las decisiones JSZip MIT y Pako MIT AND Zlib.

## Veredicto

**NO-GO para una GitHub Release pública.**

La CI, el probe del SDK y el empaquetado están verdes, y se ha inspeccionado el artefacto real del HEAD actual. Eso acredita la reproducibilidad de la construcción y la validez básica de la CLI, pero no corrige los defectos de contenido del tarball ni resuelve el riesgo de seguridad runtime.

Bloqueos restantes:
1. DP-001: regenerar el artefacto después de cerrar los cambios documentales.
2. DP-002: allowlist de documentación incluida.
3. DP-003: source maps sin fuentes.
4. DP-005: recuento/estado de notas de versión obsoleto.
5. DP-006: guía de instalación desde GitHub Release.
6. DP-004: declarar formalmente el alcance CLI-only.
7. PROD-SEC-001: decisión expresa sobre `uuid@3.4.0` o mitigación compatible.

Mejoras recomendadas antes de publicar: incorporar manifiesto de build dentro del artefacto, actualizar disparadores del preflight para cubrir todos los ficheros documentales incluidos y preparar un publisher separado con acciones fijadas, permisos mínimos, aprobación y verificación de artefactos/attestation.

## Límites de esta actividad

La actividad 4 de revisión final queda completada. No se han modificado código, dependencias, lockfile, manifiesto de paquete ni artefactos de distribución; solo se documenta el resultado. No se ha creado tag, release, PR ni publicación npm. `main` permanece intacta.

La siguiente tarea recomendada es una actividad correctiva específica para DP-002/003/004/005/006 y regeneración del candidato. La decisión de riesgo PROD-SEC-001 debe resolverse por separado antes de autorizar una publicación.


## Corrección de estado tras registrar este informe

El artefacto inspeccionado corresponde al HEAD `81e9ad95`. La documentación de esta revisión se ha añadido en el commit `e8a100b598dbebed65191558f0db9e373f5e96cb`, y `docs/` completo está incluido en `package.json`. En consecuencia, el tarball anterior ya no contiene el estado documental completo del HEAD actual. DP-001 queda **abierto de nuevo** hasta reconstruir el candidato después de terminar las correcciones restantes. No se ha generado otro artefacto porque DP-002/003/005/006 continúan pendientes.


## Cierre de correcciones de distribución — 2026-11-12

La actividad correctiva posterior a esta revisión ha cerrado DP-001–DP-006. Ver [informe de correcciones](distribution-corrections-2026-11-12.md).

- El paquete contiene una allowlist de 12 documentos públicos y excluye los documentos internos.
- El build no genera source maps ni declaration maps; el verificador impide empaquetarlos.
- El alcance es CLI-only: `exports: {}` y `bin.xmind-md`, sin API pública de importación.
- Changelog actualizado a 0.1.0 candidato no publicado y 129/129 pruebas por sistema.
- Guía de instalación desde GitHub Release, comprobación SHA-256 y distinción frente a artefactos temporales.
- Manifiesto interno de procedencia con commit y workflow run.
- Inspección final: 46 ficheros, 12 documentos, cero source maps y cero enlaces Markdown locales rotos. CI Ubuntu/Windows, SDK probe, distribución y preflight read-only correctos.

**El veredicto de publicación sigue siendo NO-GO** por PROD-SEC-001 (`uuid@3.4.0` runtime vía XMind) sin aceptación expresa/mitigación compatible y por no existir todavía un workflow publicador de GitHub Releases. No se ha creado tag, release, PR, merge ni publicación npm; `main` sigue intacta.


## Estado verificado y punto de continuidad — 2026-11-14

> **Esta sección prevalece sobre las instantáneas históricas anteriores para determinar el estado vigente.** Evidencia consultada en GitHub el 2026-11-14; HEAD antes de la actualización documental: `7a195177a62604caa07d7825100e6473ee8c34cd`; `main`: `6aca81b59dbfcfc13034e7e1115c70f7691c5035`.

### Ejecuciones del HEAD comprobado

| Workflow | Run | Resultado |
|---|---|---|
| CI Ubuntu/Windows | [43291494469](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43291494469) | **FAILURE** en ambos sistemas: ESLint rechaza 5 referencias globales no definidas en `scripts/probe-xmind-generator.js` (`process` dos veces al inicio y una al final, `Buffer`, `console`). El job de auditoría de dependencias de esta ejecución sí finalizó correctamente; no implica que PROD-SEC-001 esté cerrado. |
| SDK XMind heredado | [43291494431](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43291494431) | **SUCCESS**; el adaptador de producción permanece en `xmind@2.2.33`. |
| Prototipo aislado `xmind-generator` | [43291494503](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43291494503) | **SUCCESS** Ubuntu/Windows; solo prueba de ZIP y estructura, **no** equivalencia visual ni apertura/guardado en Desktop. |
| Paquete de distribución | [43291494529](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43291494529) | **FAILURE** en verificación por ESLint; no hay tarball validado de este HEAD. |
| Preflight de GitHub Release (solo lectura) | [43291494483](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43291494483) | **FAILURE** en verificación por ESLint; no hay candidato validado de este HEAD. |

### Implementación y límites

- El prototipo reside en `scripts/probe-xmind-generator.js` y `.github/workflows/aud-010-xmind-generator-prototype.yml`; instala aisladamente `xmind-generator@1.0.1` y `jszip@3.10.1`, sin alterar `package.json`, `package-lock.json` ni el exportador actual.
- **Defecto upstream reproducido:** `xmind-generator@1.0.1` requiere `jszip` en ejecución pero no lo instala como dependencia de producción; sin instalación explícita falla `ERR_MODULE_NOT_FOUND` ([43291032629](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43291032629)). La instalación conjunta permitió pasar el prototipo ([43291239013](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43291239013)).
- El prototipo verifica jerarquía, etiquetas múltiples, nota, resumen, relación y entradas ZIP. **No** demuestra fidelidad de tabla de árbol, estilos, IDs, assets, compatibilidad XMind Desktop ni ausencia de avisos de seguridad en el paquete instalado.
- Se mantiene el alcance **CLI-only**, paquete `0.1.0` no publicado, contrato IR `1.0.0`, correcciones DP-001–DP-006 incorporadas pero sin nueva verificación integral del HEAD vigente.
- **PROD-SEC-001 abierto:** `uuid@3.4.0` transitiva de `xmind@2.2.33`; la ruta inspeccionada `uuid/v4()` sin búfer externo no satisface la precondición del aviso, pero el componente vulnerable sigue instalado. **DEV-SEC-001** (`minimatch`) continúa como riesgo documentado de tooling.
- No existe workflow publicador de GitHub Releases; el preflight es read-only. **Publicación: NO-GO.** No se ha creado tag, release, PR, merge ni publicación npm; `main` no se ha modificado.

### Punto de reanudación y permisos

1. **Bloqueo inmediato:** corregir únicamente las referencias globales de ESLint en el script aislado y verificar CI, distribución y preflight para el nuevo HEAD; requiere autorización de cambio de código. No afirmar que el error ya está corregido.
2. Auditar licencias/dependencias reales del generador con workaround y comparar fixtures `content.json`, tabla de árbol, estilos, notas, etiquetas, relaciones y resúmenes; obtener smoke Desktop antes de cualquier migración.
3. Evaluar sustitución del SDK y mitigación de PROD-SEC-001 mediante decisión separada; después, y solo con permiso, diseñar el publicador de releases.
4. **Siguiente interacción:** recibir y analizar la nueva propuesta del usuario antes de iniciar otras fases. Esta actualización es documental; no autoriza implementación de esa propuesta, migración, publicación ni cambios en `main`.
