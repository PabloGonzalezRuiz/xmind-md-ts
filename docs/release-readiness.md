# Distribución y preparación de releases

## Estado actual

**Artefacto de distribución generado y verificado:** workflow [43012600819](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43012600819), basado en el commit `70bcbf42dd48fabb5108087f437d39446ce71f13`. Artefacto `xmind-md-ts-distribution` (ID `13851262408`), disponible hasta el 2026-12-11. Contiene `xmind-md-ts-0.1.0.tgz`, `README.txt` y `SHA256SUMS.txt`. SHA-256 del tarball: `8276da05de8d3d2c96781b48c6acd30780152b8d7d34adab4b430cdea89827dd`.

La CI [43012605756](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43012605756), sobre el HEAD documental final `c276c839bacaf8fce4ee03ee8cea7f5caca12bb4`, terminó correctamente en Ubuntu y Windows: 124/124 pruebas por sistema, formato, lint, tipos generados, typecheck, build, smoke CLI, validación de los dos ejemplos, exportaciones JSON/XMind/SVG e instalación del tarball en un directorio limpio. El único commit entre el SHA que produjo el artefacto y el HEAD final elimina el workflow temporal de formateo; no modifica el contenido del paquete.


AUD-010 prepara la documentación de usuario, ejemplos reproducibles y criterios de empaquetado. A fecha de esta revisión:

- La aplicación funciona desde el repositorio con Node.js 24 y npm.
- El ejecutable CLI está compilado en `dist/src/cli/main.js` y el lanzador es `bin/xmind-md.js`.
- `package.json` declara `private: true`, por lo que npm impide publicar el paquete en el registro.
- La versión de paquete es `0.1.0`; no debe presentarse como una versión estable 1.0.
- El proyecto incorpora `LICENSE` con licencia MIT y titularidad `Copyright (c) 2026 Pablo González Ruiz`. `package.json` declara `"license": "MIT"` y el paquete incluye el archivo `LICENSE`. Esta licencia cubre el código y la documentación de este repositorio; no altera las licencias de dependencias de terceros.
- Una instalación anterior registró 15 avisos (14 moderados, 1 alto). Ese recuento no se ha reproducido ni clasificado contra el lockfile actual; debe tratarse como señal histórica pendiente de auditoría, no como inventario vigente.
- El SDK `xmind@2.2.33` está fijado, pero es una dependencia antigua y el adaptador no ofrece importación/round-trip ni mapea todas las capacidades del IR.

Por estos motivos no se debe publicar todavía un paquete npm ni etiquetar una release estable como 1.0.0.

## Artefacto instalable de GitHub Actions

El workflow manual `.github/workflows/aud-010-distribution-artifact.yml` genera el tarball tras ejecutar `npm run verify`, calcula SHA-256 y lo publica como artefacto de Actions durante 30 días. Para ejecutarlo: GitHub → Actions → **AUD-010 · Distribution package** → Run workflow. Descarga `xmind-md-ts-distribution`, verifica `SHA256SUMS.txt` y, en Node.js 24, instala el tarball con `npm install --global ./xmind-md-ts-0.1.0.tgz`. Después comprueba `xmind-md --help` y `xmind-md --version`.

Este mecanismo es un artefacto temporal de CI, no una release permanente ni una publicación npm.

## Ruta de distribución acordada

**Canal principal: GitHub Releases.** El usuario ha elegido distribuir las versiones mediante la sección Releases del repositorio, adjuntando los paquetes descargables y sus checksums. La publicación en npm queda aplazada para una fase posterior.

1. Mantener el código fuente y los ejemplos en GitHub.
2. Generar desde un commit verificado un paquete reproducible que incluya CLI compilada, lanzador, schema IR, documentación, ejemplos y licencia.
3. Probar el paquete empaquetado en un entorno limpio con Node.js 24: instalación, `--help`, `--version`, validación de ejemplo y exportación JSON/XMind/SVG.
4. Revisar las licencias de dependencias de terceros y sus avisos, sin asumir que quedan cubiertas por la MIT del proyecto.
5. Preparar un workflow de publicación de GitHub Release, con tag/versionado, changelog, notas, artefactos y checksums.
6. Mantener npm fuera del alcance de esta primera distribución; se reconsiderará posteriormente.

`package.json` conserva `private: true` porque no se publicará en npm en esta fase. Esta propiedad no impide crear GitHub Releases.

## Criterios de aceptación de una release

- [x] Licencia MIT del proyecto elegida y archivo LICENSE incorporado.
- [x] Política de versionado y compatibilidad IR documentada y verificada por CI [43195892325](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43195892325) (Ubuntu/Windows, 129/129 pruebas por sistema).
- [x] Auditoría actual de vulnerabilidades y licencias de dependencias ejecutada e inventariada; quedan riesgos moderados y avisos de terceros que deben resolverse/aceptarse antes de publicar.
- [ ] Versión del paquete y tag coincidentes.
- [ ] Paquete construido desde un SHA identificado.
- [ ] Instalación probada en un directorio limpio con Node.js 24.
- [ ] CLI responde a `--help` y `--version`.
- [ ] Ejemplo validado y exportado a JSON, XMind y SVG.
- [ ] Checksums SHA-256 publicados.
- [ ] Notas de release describen capacidades, limitaciones y cambios.
- [ ] No se anuncia compatibilidad más amplia que la realmente probada.
- [ ] Decisión explícita sobre los 12 avisos moderados restantes de npm audit.
- [ ] Avisos de terceros (JSZip MIT y Pako MIT AND Zlib) verificados e incluidos en el paquete de distribución.

## Restricciones de esta tarea

AUD-010 ya dispone de guía, ejemplos, verificación CI y artefacto instalable temporal. La licencia del proyecto ya está decidida (MIT, Pablo González Ruiz). La release pública permanece bloqueada hasta clasificar las vulnerabilidades, revisar las licencias de dependencias, preparar/probar el workflow GitHub Releases y completar los demás criterios de aceptación. La incorporación de la licencia no autoriza por sí sola a publicar en npm ni a crear una release pública. No modificar `main`, fusionar ramas ni crear una release estable por inferencia.


## Verificación más reciente — 2026-11-11

- HEAD: `72c411eed5b497d2399d152f1b27595ad468dd19`.
- CI del HEAD: [43015959095](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43015959095), Ubuntu y Windows success, 124/124 pruebas por sistema; incluye formato, lint, tipos, typecheck, build, CLI, ejemplos y verificación del paquete.
- SDK probe: [43015959098](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43015959098), Ubuntu y Windows success.
- Artefacto de distribución: [run 43015946683](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43015946683), artefacto ID `13852422612`, disponible hasta 2026-12-11. Digest SHA-256 del ZIP de Actions: `b50009e4761e2d14b84b5eb84da2cb06b89e15503ccc851c74815ebf49022846`.
- Canal acordado: GitHub Releases. npm aplazado; mantener `private: true`.
- Próximo trabajo: auditoría actual reproducible de dependencias y licencias; política de versionado/compatibilidad IR; preparar y probar workflow de release sin publicar.


## Estado de auditoría actualizado — 2026-11-11 (16:52 Europe/Madrid)

La rama `feature/aud-003-runtime-schema` tiene como SHA de código/workflows verificado `e66a0da529cd249c54c6d922c80dfcdaa7f7fef4`.

- CI [43053653473](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43053653473): success en Ubuntu y Windows, 124/124 pruebas por sistema; calidad, ejemplos, paquete y auditoría npm correctos.
- SDK probe [43053653384](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43053653384): success en ambos sistemas.
- Auditoría de vulnerabilidades: 12 moderadas, 0 altas, 0 críticas. No se han aplicado downgrades mayores de ESLint ni del SDK XMind. El informe está en el artefacto 13870876663.
- Auditoría de licencias [43053653465](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43053653465): success en Ubuntu y Windows; 120 dependencias de producción y 246 instaladas en total por plataforma. Artefactos 13869797169 y 13871485171. Excepciones de producción: JSZip `MIT OR GPL-3.0-or-later` (se optará por MIT) y Pako `MIT AND Zlib` (conservar ambas atribuciones/avisos). MPL-2.0 solo en Lightning CSS de desarrollo.
- El inventario y la clasificación están documentados en `docs/third-party-license-audit-2026-11-11.md`.

La auditoría de seguridad/licencias se considera realizada, pero la release sigue bloqueada hasta decidir el riesgo moderado residual y asegurar los avisos de terceros. También siguen pendientes la política de versionado/compatibilidad IR, el workflow de GitHub Releases y la prueba integral final. npm continúa aplazado (`private: true`); canal acordado GitHub Releases. No crear una release pública sin autorización expresa.

## Política de versionado y compatibilidad — 2026-11-12

La política aprobada está en [docs/versioning-and-compatibility.md](versioning-and-compatibility.md). El paquete sigue en `0.1.0` y el IR admitido sigue siendo exactamente `1.0.0`; sus versiones son independientes. No se promete compatibilidad automática con versiones IR minor/patch futuras. La política de campos desconocidos, extensiones y migraciones está documentada y cubierta por la matriz de conformidad. La casilla de versionado solo se marcará como completada tras CI Ubuntu/Windows satisfactoria.

La sincronización entre la versión declarada en `package.json` y la expuesta por la CLI se comprueba automáticamente mediante `npm run check:version`, incluido en `npm run verify` y en CI Ubuntu/Windows. Pendiente de verificar la ejecución asociada al commit que incorpora el control.


## AUD-010 — workflow de preflight implementado (2026-11-12)

Se ha añadido `.github/workflows/aud-010-release-preflight.yml` y su diseño de seguridad está descrito en [github-release-preflight.md](github-release-preflight.md). El workflow prepara un tarball, prueba la instalación aislada, genera SHA-256, manifiesto y borrador de notas; sube únicamente un artefacto temporal de Actions (30 días).

El flujo tiene permisos `contents: read`, no conserva credenciales de checkout y no dispone de pasos de publicación. El modo automático de la rama de trabajo es dry-run. El modo con tag solo comprueba un tag ya existente, exige `v<package.json version>`, ejecución desde `main` y coincidencia exacta del SHA; no crea tags ni releases.

**Estado:** workflow implementado; pendiente de ejecución real en GitHub Actions y revisión de logs/artefacto. No se ha creado ningún tag ni release. La política de publicación pública continúa bloqueada y requiere autorización expresa.


## Verificación del workflow GitHub Release preflight — 2026-11-12

<details>
</details>

- Workflow [43211658439](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43211658439): success. Artefacto `xmind-md-ts-release-candidate-0.1.0`, ID `13941362391`, temporal hasta 2026-12-12.
- CI [43211658590](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43211658590): success en Ubuntu y Windows, 129/129 pruebas por sistema; auditoría npm correcta.
- SDK probe [43211658454](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43211658454): success en ambos sistemas.
- SHA fuente del artefacto: `2be69ed85ba22df524035e770d420ae117e72d94`.
- SHA-256 del tarball: `b7abc4d2b1dc83af1130eb16b468bda532ee51e65b0c104f66b6fed69ec8137a`; comprobación independiente `sha256sum -c`: OK.
- Digest del ZIP de Actions: `e6dbde3dcf1bde495d4f9c72c9a83ea3614d873022cc52962aa8ef6ae10776c4`.
- El paquete se instaló en un directorio temporal limpio; CLI `--help`, `--version` y validación del ejemplo correctos.
- Las acciones externas del preflight están fijadas a SHA completos revisados.

**Resultado del paso 4:** implementación y dry-run read-only verificados. Pendiente de ejecutar el modo de validación de tag cuando exista una release autorizada en `main`; no se crea ni publica ninguna release en esta fase. El paso 5 (prueba integral final y revisión de distribución/avisos) sigue pendiente.


## Auditoría integral del paquete — 2026-11-12

La inspección del tarball real se registra en [distribution-package-audit-2026-11-12.md](distribution-package-audit-2026-11-12.md). El checksum del artefacto existente es correcto y la CLI está presente, pero no debe usarse como candidato final: se construyó desde un SHA anterior al HEAD documental, incluye documentos operativos indiscriminadamente, contiene source maps sin fuentes TypeScript, no declara API de importación desde package root y conserva notas de versión con un recuento de pruebas obsoleto (124 frente a 129 actual).

- [x] Inspección real del tarball, manifiesto, metadatos npm, inventario de ficheros, CLI, ejemplos y dependencias directas.
- [ ] Resolver DP-001 a DP-006 y reconstruir el artefacto desde el SHA exacto de publicación.


## AUD-010 — revisión de licencias y avisos de terceros — 2026-11-12

Actividad 2 completada. Evidencias y razonamiento: [third-party-notices-audit-2026-11-12.md](third-party-notices-audit-2026-11-12.md).

- Se han contrastado los 120 paquetes de producción con el inventario de licencias ejecutado en Ubuntu y Windows.
- Se adopta la alternativa MIT para JSZip `3.10.1`; Pako `1.0.11` permanece bajo MIT **y** Zlib, con el aviso Zlib preservado en sus fuentes.
- El tarball real no contiene `node_modules` ni código de dependencias vendorizado; declara las dependencias para instalación separada. Incluye la licencia MIT del proyecto. En este alcance, no se considera que la falta de `THIRD-PARTY-NOTICES` sea un bloqueo legal demostrado. El informe recomienda repetir la revisión si se incorpora código/bundles/binarios de terceros.
- No se modificaron dependencias, código ni paquete distribuido.

**Estado:** revisión de licencias/avisos completada. Pendiente actividad 3: reevaluar vulnerabilidades moderadas residuales y documentar aceptación/mitigación. No publicar sin autorización expresa.


## AUD-010 — evaluación de vulnerabilidades residuales — 2026-11-12

Actividad 3 completada. Informe: [security-dependency-audit-2026-11-12.md](security-dependency-audit-2026-11-12.md).

- CI [43224408690](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43224408690): success Ubuntu/Windows; auditoría npm incluida.
- Npm audit: 12 registros moderados, 0 altos, 0 críticos. Se agrupan en dos advisories: minimatch y uuid.
- Runtime: `uuid@3.4.0` llega por `xmind@2.2.33`. El SDK XMind v2.2.33 inspeccionado llama a `uuid/v4` sin buffer externo; el advisory afecta a v3/v5/v6 con buffer/offset fuera de rango. No se fuerza un override mayor por riesgo de romper la ruta heredada `uuid/v4`. Se mantiene riesgo residual moderado y requiere aceptación explícita o mitigación compatible.
- Desarrollo: `minimatch@10.2.6` y los registros propagados por ESLint/TypeScript ESLint están en dependencias de desarrollo; no entran en el runtime distribuido. No se aplican downgrades/overrides automáticos incompatibles.
- No se han cambiado dependencias, código ni lockfile.

**Bloqueo de publicación:** PROD-SEC-001 requiere decisión explícita. También siguen pendientes las correcciones DP-001–DP-006 del paquete de distribución. No publicar sin autorización.


## Revisión final AUD-010 — 2026-11-12

Informe autoritativo: [aud-010-final-readiness-review-2026-11-12.md](aud-010-final-readiness-review-2026-11-12.md).

- HEAD: `81e9ad95dd89e4fc765806e64c87e554c9c39460`; `main` sigue en `6aca81b59dbfcfc13034e7e1115c70f7691c5035`.
- CI [43225888536](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43225888536): success Ubuntu/Windows; verificación de paquete e instalación limpia incluidas.
- SDK probe [43225888541](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43225888541): success Ubuntu/Windows.
- Distribución [43225888690](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43225888690): success; artefacto ID `13947289242`. Tarball SHA-256: `3dda161f34543f325aa48f1eaf362b975319c6c6f1615b1259dce20ff8d53272`.
- El artefacto inspeccionado se construyó desde el HEAD exacto del run `81e9ad9`, pero la documentación añadida después en `e8a100b` también se incluye en `docs/`; DP-001 queda abierto de nuevo hasta reconstruir tras las correcciones. DP-002, DP-003, DP-005 y DP-006 siguen abiertos; DP-004 requiere declarar CLI-only.
- No existe aún un workflow publicador de GitHub Releases; solo existe el preflight read-only.
- PROD-SEC-001 (`uuid@3.4.0` transitiva de XMind) sigue pendiente de aceptación expresa o mitigación compatible.

**Veredicto: NO-GO.** No crear tag ni publicar una GitHub Release hasta resolver los bloqueos enumerados en el informe. La actividad 4 de revisión final está completada; la siguiente actividad requiere autorización expresa.


## Correcciones DP-001–DP-006 — 2026-11-12

Actividad correctiva completada. Informe: [distribution-corrections-2026-11-12.md](distribution-corrections-2026-11-12.md).

- DP-001 resuelto con manifiesto de procedencia dentro de `dist/BUILD-MANIFEST.json`, que enlaza commit y ejecución.
- DP-002 resuelto: allowlist de 12 documentos públicos; excluye auditorías, prompt maestro y documentos de continuidad.
- DP-003 resuelto: build sin source maps ni declaration maps; verificador rechaza `.map`.
- DP-004 resuelto: paquete declarado CLI-only mediante `exports: {}` y `bin.xmind-md`; no se promete API de importación.
- DP-005 resuelto: changelog identifica `0.1.0` como candidato no publicado y recoge 129/129 pruebas por plataforma.
- DP-006 resuelto: README y guía explican descarga, verificación SHA-256 e instalación del tarball de GitHub Release, distinguiéndolo de los artefactos temporales.

La verificación integral ha pasado en Ubuntu y Windows; el SDK probe, la distribución y el preflight read-only también han pasado. El tarball inspeccionado contiene 46 ficheros, 12 documentos permitidos, ningún source map y ningún enlace Markdown local roto. El manifiesto interno identifica commit y run de construcción.

**NO-GO para publicación pública:** PROD-SEC-001 (`uuid@3.4.0` transitiva de XMind) sigue pendiente de aceptación expresa o mitigación compatible. Además, no existe todavía workflow publicador de GitHub Releases; solo preflight read-only. No se ha creado tag, release, PR ni publicación npm. `main` permanece intacta.


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
