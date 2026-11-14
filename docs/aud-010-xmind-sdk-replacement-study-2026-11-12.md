# AUD-010 — Investigación de sustitución del SDK XMind (2026-11-12)

## Alcance y estado

Investigación autorizada, **sin modificar el motor de exportación, dependencias, lockfile, pruebas o workflows**. Referencia inicial: commit `5a4ebe8c840f492a70b963dc7b7bf2485c3328c7`. El hallazgo PROD-SEC-001 sigue abierto y la publicación sigue en NO-GO.

## Alternativas verificadas en repositorios oficiales

### 1. xmind-generator (primera candidata)

- Repositorio: https://github.com/xmindltd/xmind-generator
- Licencia MIT, paquete `xmind-generator` y versión declarada en `main/package.json`: `1.0.1` (no equivale a verificar el paquete publicado actualmente).
- API oficial documentada: `Workbook`, `RootTopic`, `Topic`, `Marker`, `Summary`, `Relationship`, `writeLocalFile` y `archive()`. Ofrece jerarquías, notas, etiquetas como array, marcadores, imágenes, resúmenes y relaciones.
- ESM y CJS declarados mediante `exports`, con tipos TypeScript.
- `package.json` inspeccionado **no declara `uuid` ni otras dependencias de producción**; `jszip@3.10.1` figura como dependencia de desarrollo. **No se ha ejecutado `npm audit` ni inspeccionado el tarball instalado**: no se afirma que la cadena de suministro esté libre de vulnerabilidades.
- Posibles ventajas frente al SDK actual: relaciones e imágenes documentadas, etiquetas como array y generación moderna de XMind.
- Riesgos por validar: formato exacto del ZIP/JSON, semántica de resúmenes, marcadores y referencias, compatibilidad con XMind Desktop 26.x, cobertura de estilos avanzados (especialmente estructura de tabla/árbol), consistencia de IDs, comportamiento de archivo y seguridad del paquete distribuido.

### 2. xmindmark (referencia de lenguaje, no sustituto prioritario)

- Repositorio: https://github.com/xmindltd/xmindmark
- MIT; versión declarada en `main/package.json`: `0.3.2`.
- Traduce texto XMindMark a XMind y SVG. Resulta útil para estudiar la representación declarativa y la gramática de PMD.
- Su interfaz principal recibe texto y produce un ArrayBuffer XMind; añadiría una transformación textual intermedia al pipeline IR ya existente.
- Dependencias declaradas incluyen `jszip`, `nanoid` y `puppeteer-core`; la conversión SVG documentada necesita entorno gráfico y descargas externas.
- No se recomienda como backend principal sin demostrar ventajas específicas de fidelidad y seguridad.

### 3. Generador propio de ZIP/JSON

- Permite conservar explícitamente propiedades del `content.json` y evolucionar estilos/estructuras PMD.
- Coste: mantenimiento del formato, assets, compatibilidad Desktop, pruebas de regresión y cambios de esquema.
- Alternativa estratégica si el generador oficial no representa fielmente tablas de árbol, estilos, relaciones o metadatos requeridos.

### 4. Mantener SDK xmind@2.2.33

- Mantiene la compatibilidad actual demostrada, pero conserva `uuid@3.4.0` y PROD-SEC-001.
- No es solución permanente al hallazgo.

## Matriz de compatibilidad por comprobar

| Capacidad | SDK actual | xmind-generator documentado | Validación pendiente |
|---|---|---|---|
| Hojas y jerarquía | Sí | Sí | Equivalencia semántica y orden |
| Notas | Sí | Sí | Unicode, multilínea |
| Etiquetas múltiples | Aproximadas/colapsadas | API array | Serialización Desktop |
| Marcadores | Sí, catálogo SDK | Sí, catálogo propio | Mapeo de IDs |
| Resúmenes | Sí, limitados | Sí | Rangos y referencias |
| Relaciones | No soportadas por adaptador actual | Sí | Exportación y apertura |
| Imágenes | No soportadas por adaptador actual | Sí | ZIP/manifest/paths |
| Estilos avanzados y tabla de árbol | No soportados por adaptador actual | No demostrados por README | Inspección del código y fixtures |
| Seguridad de dependencias | PROD-SEC-001 abierto | Sin `uuid` declarado directamente | Auditoría de instalación limpia |
| XMind Desktop | Smoke previo | No probado aquí | Smoke manual antes de sustituir |

## Propuesta de implementación futura, **no autorizada aún**

1. Crear una rama o conjunto de cambios aislados de prueba **solo tras autorización**, sin reemplazar el adaptador de producción.
2. Verificar versión npm efectiva, integridad y dependencias de producción de `xmind-generator`; ejecutar auditoría de vulnerabilidades y licencias.
3. Construir un prototipo desde IR con fixtures representativos (legislación, tabla de árbol, etiquetas, notas, marcadores, resúmenes, relaciones y estilos).
4. Comparar `content.json`, estructura ZIP, IDs y diagnósticos contra SDK actual y archivos de referencia de XMind Desktop.
5. Ejecutar CI Ubuntu/Windows, prueba de instalación limpia y smoke de apertura/guardado/reapertura en XMind Desktop.
6. Preparar informe de decisión go/no-go de migración; únicamente después, y con autorización independiente, sustituir el adaptador y actualizar lockfile/documentación.

## Decisión de esta investigación

**Recomendación:** priorizar `xmind-generator` para un prototipo de compatibilidad, mantener `xmindmark` como referencia semántica de PMD y reservar el generador ZIP/JSON propio para las funciones de fidelidad que no cubra la biblioteca.

**No se ha probado aún** que xmind-generator elimine todos los advisories o reproduzca los estilos del usuario. **No se ha realizado migración.** No crear PR, merge, tags, releases ni publicar.

## Prototipo aislado y hallazgo confirmado (2026-11-12)

- Se añadieron `scripts/probe-xmind-generator.js` y `.github/workflows/aud-010-xmind-generator-prototype.yml` en la rama de trabajo. El workflow prueba Ubuntu y Windows con Node 24, sin modificar las dependencias del proyecto ni el adaptador de producción.
- La primera ejecución [43291032629](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43291032629) detectó en Ubuntu un **fallo de empaquetado upstream**: la instalación aislada de `xmind-generator@1.0.1` añadió un solo paquete y el import falló con `ERR_MODULE_NOT_FOUND: Cannot find package 'jszip'`. El `package.json` upstream declara `jszip` como `devDependency`, aunque `src/internal/serializer.ts` lo importa en runtime. No puede asumirse que el paquete publicado sea autocontenido.
- Para continuar el experimento se ha añadido una **solución temporal solo en el workflow**: instalar explícitamente `jszip@3.10.1` junto al generador en el directorio aislado. Esto **no corrige upstream** ni modifica `package.json` o `package-lock.json` del proyecto.
- Otra diferencia detectada en el código upstream: `src/internal/common.ts` genera IDs UUID v4 mediante `Math.random()`, no un generador criptográficamente seguro. Debe valorarse la unicidad y el control de IDs si se adopta la biblioteca.
- La prueba comprueba ZIP, `content.json`, notas, etiquetas múltiples, resúmenes y relaciones; los resultados del experimento con workaround deben verificarse en GitHub Actions antes de declararlo compatible. Aún no se ha ejecutado smoke manual de XMind Desktop.
- **Estado:** investigación y prototipo aislado en marcha; PROD-SEC-001 no resuelto; publicación NO-GO.


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
