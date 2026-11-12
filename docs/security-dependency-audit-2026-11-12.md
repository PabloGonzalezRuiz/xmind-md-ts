# Auditoría de vulnerabilidades residuales — 2026-11-12

## Resumen ejecutivo

- HEAD auditado: `9a88d707d3f1cf00d4aeee86381e8b5b1b28b26a`.
- Workflow CI: [43224408690](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43224408690), completado correctamente en Ubuntu y Windows.
- Job de auditoría de dependencias: `Dependency security audit`, success.
- Artefacto JSON: `npm-audit-report`, ID `13946637379`, SHA-256 del ZIP `f2f3e4dc53786f9259a48e467822e4a67acf417b190710f2903f02f14f81e500`; comprobado localmente.
- Resultado npm audit: **12 registros moderados, 0 altos, 0 críticos y 0 bajos**.
- Los 12 registros no representan 12 avisos distintos: corresponden a dos advisories (minimatch y uuid), propagados a los paquetes que los incorporan.
- No se han cambiado versiones, overrides, código ni lockfile.

## Separación por ámbito

El informe npm identifica 121 dependencias de producción (incluido el paquete raíz), 181 de desarrollo, 53 opcionales y 36 peer; hay solapamientos entre categorías. En el conjunto de registros afectados:

- **Producción:** `uuid@3.4.0` y su consumidor `xmind@2.2.33` (dos registros de paquete, un advisory).
- **Desarrollo:** diez registros relacionados con ESLint, typescript-eslint y minimatch. `minimatch@10.2.6` está marcado `dev: true` en el lockfile y no pertenece al conjunto runtime.

## Hallazgo PROD-SEC-001 — uuid 3.4.0 (moderado)

- Ruta: `xmind@2.2.33 → uuid@3.4.0`.
- Advisory: [GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq), CVE-2026-41907.
- Afecta a las funciones UUID v3/v5/v6 cuando reciben un buffer de salida externo y un offset/tamaño fuera de rango; puede producir escrituras parciales silenciosas. La base de datos del advisory fija versiones corregidas desde `11.1.1` (y líneas posteriores).
- **Comprobación de alcanzabilidad en el consumidor:** se inspeccionó el código fuente de XMind SDK en el tag exacto `v2.2.33`. `src/core/base.ts` importa `require('uuid/v4')` y el getter `id` llama a `v4()` sin proporcionar buffer ni offset. No se encontraron llamadas del SDK a v3, v5 o v6 en sus fuentes principales inspeccionadas. La condición descrita por el advisory no se alcanza por el uso normal de UUID que realiza este SDK.
- Esto reduce la exposición observable del proyecto, pero **no elimina el hecho de que el árbol runtime contiene una versión vulnerable** ni demuestra que cualquier ruta futura o uso adicional esté libre de riesgo.
- El SDK declara el subpath legado `uuid/v4`. No se fuerza una actualización mayor de `uuid` mediante override: una sustitución puede romper esa ruta de importación o la compatibilidad de XMind. La actualización debe hacerse junto con una versión/fork de XMind compatible y pruebas de generación/serialización de mapas.
- **Decisión:** riesgo residual moderado de cadena de suministro, con alcanzabilidad no observada en el flujo actual. Mantener bloqueada la publicación hasta que se acepte expresamente este riesgo o se valide una mitigación compatible.

Fuente primaria: [GitHub Advisory GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq). Fuente de uso: [XMind SDK v2.2.33 — src/core/base.ts](https://github.com/xmindltd/xmind-sdk-js/blob/v2.2.33/src/core/base.ts).

## Hallazgo DEV-SEC-001 — minimatch 10.2.6 (moderado)

- Ruta principal: `eslint@10.14.0 → minimatch@10.2.6`; también forma parte de la cadena de herramientas TypeScript ESLint.
- Advisory: [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249), CVE-2026-118764.
- El advisory describe amplificación de patrones glob controlados por un atacante cuando `optimizationLevel >= 2`, con consumo excesivo de CPU/memoria. El rango afectado es `>=7.0.0 <11.0.1`; la versión corregida publicada es `11.0.1`.
- El lockfile marca `minimatch@10.2.6` como dependencia de desarrollo. No forma parte del cierre de dependencias runtime del paquete publicado.
- La versión 11 es un major y no satisface el rango `^10.2.6` solicitado por ESLint 10 ni el rango 10.x solicitado por TypeScript ESLint. El informe de npm propone cambios de versión mayores/downgrades en la cadena ESLint; no se aplican automáticamente porque pueden alterar la configuración, reglas y compatibilidad de la toolchain.
- **Decisión:** riesgo limitado a tooling de desarrollo/CI, sin exposición en runtime del paquete. Mantener la configuración de CI bajo control y no procesar patrones glob no confiables en esa cadena. Revaluar cuando ESLint/TypeScript ESLint publiquen dependencias compatibles con minimatch corregido o tras una migración probada de toolchain.

Fuente primaria: [GitHub Advisory GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249).

## Registros propagados de ESLint / TypeScript ESLint

Los otros diez registros moderados corresponden a `eslint@10.14.0`, `@eslint/js@10.0.1`, `@eslint/config-array` y paquetes `@typescript-eslint/*` / `typescript-eslint@8.72.2`. Npm los marca como afectados por la ruta a minimatch o por la cadena asociada. No son advisories adicionales independientes.

## Decisiones y criterios

1. No ejecutar `npm audit fix` a ciegas: la solución automática propuesta implica cambios de major o downgrades de tooling y no constituye una mitigación validada.
2. No añadir un override de `uuid` 11.x mientras XMind siga dependiendo de la ruta CommonJS heredada `uuid/v4`.
3. Mantener el advisory de `uuid` como riesgo residual runtime moderado, aunque el flujo de XMind inspeccionado use exclusivamente v4 sin buffer externo.
4. Mantener `minimatch` como riesgo de desarrollo, sin impacto directo en el tarball runtime; revisar de nuevo al actualizar ESLint/TypeScript ESLint.
5. Antes de la publicación debe existir una decisión explícita del responsable sobre PROD-SEC-001. Esta auditoría técnica no equivale a aceptación formal ni asesoramiento jurídico.

## Estado

**Actividad 3 de AUD-010: evaluación completada.** La rama no recibió cambios de dependencias ni código. La CI del commit auditado pasó en Ubuntu y Windows. La publicación sigue bloqueada hasta resolver los hallazgos de distribución DP-001–DP-006 y obtener una decisión expresa sobre el riesgo PROD-SEC-001. No crear tags, releases ni publicar sin autorización.


## Reevaluación autorizada de PROD-SEC-001 — 2026-11-12

**Alcance:** análisis de alcanzabilidad y opciones de mitigación; no se modifican dependencias ni código, ni se autoriza publicación.

- HEAD de referencia al iniciar: `7629800a0cfa60e2f7106360c1c918f364834435`.
- `package.json` mantiene `xmind@2.2.33` como dependencia de producción.
- La fuente primaria [GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq) identifica la falta de comprobación de límites al pasar un búfer externo a los métodos `v3()`, `v5()` y `v6()`; `uuid@3.4.0` está en el rango afectado. Versiones corregidas: `11.1.1`, `12.0.1` y `13.0.1` en sus respectivas líneas.
- Inspección directa de [`xmind-sdk-js@v2.2.33/src/core/base.ts`](https://github.com/xmindltd/xmind-sdk-js/blob/v2.2.33/src/core/base.ts): `const v4 = require('uuid/v4')` y getter `id` que ejecuta `v4()` sin argumentos. Este uso no satisface la precondición del advisory.
- **Conclusión de alcanzabilidad acotada:** la ruta de creación de identificadores comprobada no alcanza el comportamiento vulnerable; esto **no** demuestra ausencia de todas las posibles rutas transitivas o futuras, ni elimina el hallazgo de composición de dependencias.
- **Opción A (preferida a medio plazo):** reemplazar o adaptar el SDK XMind por una implementación compatible y mantenida, sin `uuid@3.4.0`, validando formato ZIP/content.json, pruebas Ubuntu/Windows y smoke en XMind Desktop. Requiere fase de ingeniería independiente y pruebas; no es una actualización trivial.
- **Opción B:** fork/parche compatible del SDK que preserve la semántica `uuid/v4` y elimine la dependencia vulnerable. Requiere auditoría de licencia, mantenimiento y pruebas de compatibilidad.
- **Opción C:** aceptación formal, expresa y temporal del riesgo residual para la versión CLI actual, documentando la ruta comprobada, la limitación de alcance y un plazo de revisión. No constituye corrección de la dependencia y no se infiere automáticamente de esta evaluación.
- **Descartado sin pruebas:** override de `uuid` a versión mayor; el import legado `uuid/v4` del SDK puede dejar de resolver. Tampoco se recomienda `npm audit fix --force`.

**Decisión técnica:** no aplicar cambios automáticos de dependencias. Mantener **PROD-SEC-001 abierto** y publicación en **NO-GO** hasta decisión expresa del responsable sobre mitigación o aceptación del riesgo. El workflow publicador de GitHub Releases permanece fuera de alcance y sin autorización.
