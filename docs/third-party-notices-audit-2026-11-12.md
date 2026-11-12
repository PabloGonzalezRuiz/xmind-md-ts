# Auditoría de licencias y avisos de terceros — 2026-11-12

## Alcance y evidencias

- Repositorio: `PabloGonzalezRuiz/xmind-md-ts`.
- Rama: `feature/aud-003-runtime-schema`.
- HEAD inspeccionado: `548a6525af252742bf344a16ac09ef68939ce9f3`.
- Inventario reproducible: workflow [AUD-010 · Dependency license audit #43053653465](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43053653465), ejecutado en Ubuntu y Windows con resultados equivalentes.
- Artefacto de inventario Ubuntu: `13869797169`; contiene `license-production.json`, `license-all.json` y `license-summary.json`.
- Paquete inspeccionado: artefacto de distribución [run 43221197595](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43221197595), artefacto `13945897977`, generado desde el HEAD indicado.
- SHA-256 del ZIP de Actions: `6aaf5647acf2d320d09c632cb216fa7cdd85e2fc9aa7cf33b182d94ffd749ba8`.
- SHA-256 del tarball `xmind-md-ts-0.1.0.tgz`: `41e04ccedc5c4d77c6a445b1148f730e586ae67e1d3e67641996348512f05ab9`.

## Inventario de producción

El JSON de `license-checker` contiene 121 entradas: 120 dependencias de terceros y el paquete raíz. El paquete raíz aparece como `UNLICENSED` porque `private: true`; es un falso positivo de clasificación: `package.json` declara `MIT` y el paquete incluye su `LICENSE` MIT.

Las 120 dependencias de terceros se distribuyen así:

| Expresión/licencia | Paquetes |
|---|---:|
| MIT | 114 |
| ISC | 2 |
| BSD-2-Clause | 1 |
| BSD-3-Clause | 1 |
| MIT OR GPL-3.0-or-later | 1 |
| MIT AND Zlib | 1 |
| **Total** | **120** |

El informe automatizado asigna un fichero de licencia a cada entrada de terceros. Los recuentos coinciden con el resumen del workflow y con la auditoría anterior. El árbol completo incluye 246 paquetes instalados por plataforma; las licencias Apache-2.0, MPL-2.0 y BlueOak-1.0.0 adicionales corresponden a herramientas/dependencias fuera del conjunto de producción y no aparecen en el tarball de distribución inspeccionado.

## Revisión de las expresiones compuestas

### JSZip 3.10.1 — `MIT OR GPL-3.0-or-later`

- Es una dependencia transitiva de `xmind@2.2.33`; no está declarada directamente por el proyecto.
- El texto oficial del paquete indica expresamente que el usuario puede elegir MIT o GPLv3.
- **Decisión del proyecto para esta dependencia: seleccionar MIT.** Debe preservarse el aviso de copyright y el texto MIT de JSZip. No se elige la alternativa GPL.
- Fuente primaria: [JSZip 3.10.1 — LICENSE.markdown](https://github.com/Stuk/jszip/blob/v3.10.1/LICENSE.markdown).

### Pako 1.0.11 — `MIT AND Zlib`

- Es una dependencia transitiva de JSZip.
- La expresión es conjuntiva: se aplican ambas licencias. SPDX define `AND` como obligación de cumplir ambas y `OR` como elección entre alternativas ([SPDX: Handling License Info](https://spdx.dev/learn/handling-license-info/)).
- El fichero raíz `LICENSE` del paquete Pako contiene el texto MIT. La licencia Zlib se conserva además en los encabezados de los módulos bajo `lib/zlib/`; el `lib/zlib/README` explica que esa parte es un port de zlib bajo la licencia Zlib, con la contribución JavaScript bajo licencia Expat/MIT.
- Por tanto, una futura generación de avisos agregados **no puede limitarse a copiar el fichero raíz `LICENSE` de Pako**: debe preservar también el aviso Zlib. No se debe simplificar la expresión a MIT.
- Fuentes primarias: [Pako 1.0.11 — LICENSE](https://github.com/nodeca/pako/blob/1.0.11/LICENSE), [lib/zlib/README](https://github.com/nodeca/pako/blob/1.0.11/lib/zlib/README) y [lib/zlib/deflate.js](https://github.com/nodeca/pako/blob/1.0.11/lib/zlib/deflate.js).

## Inspección del artefacto distribuido

El tarball tiene 79 entradas y no contiene `node_modules/`, copias de dependencias, ni un bundle que incorpore sus implementaciones. El código compilado conserva imports externos y `package.json` declara las dependencias necesarias para que el gestor de paquetes las instale por separado. El artefacto incluye la licencia MIT del proyecto, pero no un `THIRD-PARTY-NOTICES`.

Esta distinción importa: el artefacto inspeccionado distribuye el código propio del proyecto y metadatos de dependencias, no una copia empaquetada de los 120 paquetes de terceros. Las dependencias se obtienen como paquetes separados y cada paquete mantiene sus propios metadatos y ficheros de licencia. Con la estructura actual, no se ha detectado que el tarball omita textos de licencia correspondientes a código de terceros que haya incorporado materialmente.

## Conclusión y recomendación

1. **No se identifica un conflicto de licencias de producción** en el inventario actual. Las expresiones compuestas tienen un tratamiento definido: JSZip bajo la alternativa MIT y Pako bajo MIT y Zlib.
2. **No se considera un bloqueo legal demostrado** la ausencia de `THIRD-PARTY-NOTICES` en este tarball concreto, porque no incorpora el código de las dependencias. Esta conclusión se limita a la estructura inspeccionada y no constituye asesoramiento jurídico.
3. Se recomienda mantener este informe como registro de atribución y decisión. Un `THIRD-PARTY-NOTICES` agregado puede añadirse como mejora de transparencia, pero no debe generarse copiando ciegamente un único fichero por paquete: se deben conservar todos los avisos de copyright y tratar expresiones `AND`/`OR` correctamente.
4. Si una versión futura incorpora `node_modules`, código de dependencias dentro de un bundle, binarios de terceros o fuentes copiadas, la auditoría deberá repetirse sobre ese artefacto y los avisos correspondientes deberán acompañarlo.
5. Las licencias de herramientas de desarrollo no se mezclan con el inventario de runtime; se mantienen registradas en la auditoría global.

## Estado

**Actividad 2 de AUD-010: completada.** No se han cambiado dependencias, código de runtime ni el contenido del paquete. No se ha creado una release, tag, PR ni publicación npm. La rama `main` permanece intacta.

Siguiente actividad propuesta: revisar las vulnerabilidades moderadas residuales, confirmar su presencia y explotabilidad en el árbol de producción frente al de desarrollo, y documentar la decisión de aceptación o mitigación antes de la revisión final.
