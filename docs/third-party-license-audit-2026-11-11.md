# Auditoría de licencias de dependencias — 2026-11-11

## Alcance y método

- Repositorio: `PabloGonzalezRuiz/xmind-md-ts`.
- Rama: `feature/aud-003-runtime-schema`.
- SHA auditado: `e66a0da529cd249c54c6d922c80dfcdaa7f7fef4`.
- Herramienta: `license-checker@25.0.1`.
- Instalación: `npm ci --ignore-scripts --no-audit --no-fund`.
- Alcance: inventario `--production` y árbol completo instalado; dos runners independientes, Ubuntu y Windows.
- Workflow: [AUD-010 · Dependency license audit #43053653465](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43053653465). Ambos jobs y todos sus pasos terminaron correctamente.
- Artefactos JSON: Ubuntu [13869797169](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43053653465), Windows [13871485171](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43053653465). Caducidad: 2026-12-11. Cada ZIP contiene `license-production.json`, `license-all.json` y `license-summary.json`.

El workflow excluye del resumen el paquete raíz `xmind-md-ts@0.1.0`: license-checker lo etiqueta como `UNLICENSED` por ser `private: true`, aunque `package.json` declara MIT y el repositorio contiene `LICENSE`. No es una dependencia de terceros.

## Recuento

Los dos sistemas produjeron el mismo número de entradas y las mismas expresiones de licencia:

| Alcance | Paquetes instalados | Resultado |
|---|---:|---|
| Producción | 120 | Inventario idéntico en Ubuntu y Windows |
| Árbol completo (producción + desarrollo/optional) | 246 | Inventario idéntico en número y categorías; cambia el nombre del binario de Lightning CSS según SO |

### Dependencias de producción

| Expresión de licencia | Paquetes |
|---|---:|
| MIT | 114 |
| ISC | 2 |
| BSD-2-Clause | 1 |
| BSD-3-Clause | 1 |
| MIT OR GPL-3.0-or-later | 1 |
| MIT AND Zlib | 1 |
| **Total** | **120** |

Las dos expresiones compuestas identificadas son:

- `jszip@3.10.1`: `MIT OR GPL-3.0-or-later`. La expresión ofrece una alternativa; para este proyecto se seleccionará y respetará la opción MIT, conservando atribución y texto de licencia.
- `pako@1.0.11`: `MIT AND Zlib`. La expresión es conjuntiva; deben conservarse los avisos y condiciones de ambas licencias.

El resto de dependencias de producción usa MIT, ISC, BSD-2-Clause o BSD-3-Clause. No se detectó una dependencia de producción con licencia exclusivamente GPL o MPL.

### Árbol completo, incluidas dependencias de desarrollo

| Expresión de licencia | Paquetes |
|---|---:|
| MIT | 208 |
| Apache-2.0 | 16 |
| BSD-2-Clause | 6 |
| BSD-3-Clause | 3 |
| ISC | 8 |
| BlueOak-1.0.0 | 1 |
| MPL-2.0 | 2 |
| MIT OR GPL-3.0-or-later | 1 |
| MIT AND Zlib | 1 |
| **Total** | **246** |

Los dos paquetes MPL-2.0 son `lightningcss@1.33.0` y el binario de plataforma (`lightningcss-linux-x64-gnu@1.33.0` en Ubuntu; `lightningcss-win32-x64-msvc@1.33.0` en Windows). Aparecen solo en el inventario completo, no en producción. BlueOak-1.0.0 corresponde a una dependencia de herramientas de desarrollo.

## Evaluación y acciones

1. **Producción:** las licencias detectadas son permisivas o expresiones con opción permisiva/conjuntiva. No se detecta copyleft fuerte obligatorio para el runtime.
2. **JSZip:** elegir la alternativa MIT y conservar su atribución y texto MIT.
3. **Pako:** conservar las atribuciones/avisos MIT y Zlib.
4. **Desarrollo:** registrar Apache-2.0, MPL-2.0 y BlueOak-1.0.0 en el inventario; MPL se limita a Lightning CSS de la toolchain y no aparece en producción.
5. **Antes de GitHub Release:** verificar el contenido de avisos de terceros del paquete final y asegurar que las atribuciones/licencias aplicables acompañan a la distribución. La auditoría automatizada inventaría expresiones y rutas de licencia, pero no sustituye esa verificación del paquete.
6. No interpretar el inventario como asesoramiento jurídico ni como autorización para publicar.

## Estado

**Estado: inventario reproducible completado.**

La auditoría se considera ejecutada en ambos sistemas. La incorporación/verificación de avisos de terceros en el paquete final sigue siendo criterio de release y se mantiene pendiente dentro de AUD-010.


## Addendum — revisión de avisos y expresiones compuestas — 2026-11-12

La revisión del artefacto real y de los ficheros de licencia originales se documenta en [third-party-notices-audit-2026-11-12.md](third-party-notices-audit-2026-11-12.md).

- JSZip `3.10.1` permite elegir entre MIT y GPL-3.0-or-later; el proyecto adopta expresamente la alternativa MIT y conserva su atribución.
- Pako `1.0.11` exige considerar MIT **y** Zlib. Su fichero raíz `LICENSE` contiene MIT; el aviso Zlib se conserva en los encabezados de `lib/zlib/` y en su README. Una futura generación agregada de avisos debe contemplar ambos.
- El tarball inspeccionado no incluye `node_modules` ni código de dependencias empaquetado; las dependencias se instalan separadamente. Por ello, la ausencia de `THIRD-PARTY-NOTICES` no se considera un bloqueo demostrado para este artefacto concreto. Se recomienda mantener el registro y repetir la auditoría si se distribuye código de terceros integrado.
- Se confirma que las 120 dependencias de producción tienen un fichero de licencia identificado en el inventario automatizado. El paquete raíz se excluye del recuento de terceros: su `UNLICENSED` en la salida de `license-checker` deriva de `private: true`, no de la licencia declarada MIT.
