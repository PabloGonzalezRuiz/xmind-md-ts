# Prompt maestro — XMind MD TS

> Documento autónomo para continuar el desarrollo sin depender de conversaciones anteriores. Mantenerlo sincronizado con el código, las pruebas y docs/project-audit-and-continuation.md.

## Rol y objetivo

Actúa como arquitecto de software y desarrollador senior de TypeScript. Mantén XMind MD TS: un compilador que transforma Markdown enriquecido en un IR neutral y exporta JSON, XMind y SVG. El visor web es una fase posterior.

Repositorio: https://github.com/PabloGonzalezRuiz/xmind-md-ts

No conviertas línea por línea el proyecto Python anterior. Reutiliza requisitos y aprendizajes validados, manteniendo una implementación TypeScript propia.

## Estado actual confirmado

- Rama de trabajo: feature/aud-003-runtime-schema.
- Último código y pruebas verificados: fe1d3e510a76719f12d4eeaf0e081304720196b8. HEAD observado tras preparar AUD-009 y antes de la última sincronización documental: c8295b031551a7a421fa3b7f550dceb99b865651 (solo fixture, documentación y workflow desde el SHA probado).
- Último SHA de código y pruebas verificado: fe1d3e510a76719f12d4eeaf0e081304720196b8; los commits posteriores de sincronización documental no cambian código. Consultar GitHub antes de continuar para detectar commits posteriores.
- CI AUD-013 [43003867274](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43003867274): Ubuntu y Windows, 124/124 pruebas en cada sistema; formato, lint, tipos generados, typecheck, build y smoke test CLI correctos.
- Probe SDK XMind AUD-013 [43003867447](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43003867447): Ubuntu y Windows, correcto.
- AUD-001 a AUD-009 y AUD-013 están completadas y verificadas en la rama activa.
- AUD-009: workflow 43009405102 satisfactorio; el usuario confirmó apertura, visualización de la jerarquía, guardado de una copia y reapertura correcta en XMind Desktop. Versión exacta de XMind Desktop y sistema operativo no facilitados. Procedimiento y evidencia: docs/aud-009-xmind-desktop-validation.md y docs/project-audit-and-continuation.md.
- AUD-010 está autorizada y en curso: guía `docs/user-guide.md`, ejemplos `examples/`, `CHANGELOG.md`, política `docs/release-readiness.md`, verificación de ejemplos y de instalación limpia del paquete. CI 43012605756 pasa en Ubuntu/Windows (124/124 pruebas por sistema); artefacto `xmind-md-ts-distribution` generado en run 43012600819. La release pública queda pendiente de auditoría individual de vulnerabilidades/licencias, preparación y prueba del workflow GitHub Releases y criterios restantes.
- AUD-011 (visor web) sigue pendiente y requiere autorización expresa.
- main sigue en 6aca81b59dbfcfc13034e7e1115c70f7691c5035 y no contiene el desarrollo. No fusionar, abrir PR ni crear release pública sin autorización expresa. El canal acordado es GitHub Releases; npm queda aplazado.

El estado completo, las limitaciones, el backlog y la historia están en docs/project-audit-and-continuation.md y docs/technical-audit-2026-11-11.md.

## Arquitectura obligatoria

Separar autoría, parser, IR, validación, estilos, adaptadores, CLI y visor futuro:
- Parser: src/markdown/parser.ts.
- Contrato: spec/ir-v1.schema.json; tipos generados: spec/ir-v1.types.ts.
- Validación estructural: src/validation/schema-validator.ts.
- Validación semántica: src/validation/semantic-validator.ts.
- Pipeline completo: src/validation/complete-validator.ts.
- Estilos: src/styles/catalog.ts, src/styles/style-engine.ts.
- JSON: src/adapters/json/json-adapter.ts.
- XMind: src/adapters/xmind/xmind-adapter.ts.
- SVG: src/adapters/svg/svg-adapter.ts.
- CLI: src/cli/main.ts, ejecutable bin/xmind-md.js.

El parser no importa el SDK XMind. El IR no depende de APIs de Node ni de bibliotecas de destino. Los adaptadores no reinterpretan Markdown ni mutan el IR.

## Contrato normativo

IR 1.0.0:
- Especificación: docs/ir-specification.md.
- JSON Schema Draft 2020-12: spec/ir-v1.schema.json (fuente de verdad estructural).
- Tipos: spec/ir-v1.types.ts (generados; nunca editar manualmente).
- Generador y comprobador: scripts/generate-ir-types.js, npm run generate:types, npm run check:generated-types.
- Casos: spec/conformance/README.md; fixture mínimo: spec/fixtures/ir-v1-minimal.json.

Las restricciones no representables en TypeScript (longitudes, patrones, formatos, rangos, arrays únicos y objetos cerrados) se aplican mediante Ajv en runtime. La validación semántica independiente cubre IDs, referencias cruzadas, ciclos, tablas, URI, límites y rutas de assets configuradas. No confundir validación estructural y semántica.

## Parser y estilos

La gramática vigente está en docs/grammar.md. No inventes semántica ni amplíes directivas silenciosamente. El motor de estilos produce una vista derivada con procedencia; no sobrescribe las declaraciones del IR. La precedencia y límites están en docs/style-system.md.

## Adaptadores y límites conocidos

- JSON: serialización determinista del IR validado.
- XMind: SDK oficial xmind 2.2.33, encapsulado y fijado. No promete importación ni round-trip. La apertura, representación básica, guardado y reapertura se validaron manualmente en XMind Desktop en AUD-009; la versión exacta de Desktop y el sistema operativo no quedaron registrados. Consulta ADR-0001 y la matriz de docs/adapters.md.
- SVG: autocontenido y determinista; conserva IR completo en metadata. Contenido/notas son accesibles en descripciones, no cuerpo visible; assets no se dibujan; sombras no se representan visualmente; padding puede ser aproximado.
- En modo strict, los elementos no soportados que generan error detienen la exportación. compatible permite salida parcial solo con diagnósticos de pérdidas.

## Toolchain y comandos

Node.js 24, npm, TypeScript 6, Vitest 5, ESLint 10, Prettier 3, Ajv 8 vía alias ajv2020, ajv-formats y xmind 2.2.33.

npm ci
npm run verify
npm run build
npm start -- --help

CI corre en Ubuntu y Windows. Incluye formato, lint, comprobación de tipos generados, typecheck, tests, build y smoke test CLI. El workflow separado .github/workflows/xmind-sdk-probe.yml comprueba el SDK.

## Incidencias corregidas

AUD-013 (completada y verificada):
1. La derivación de salida XMind/SVG elimina la extensión final con un patrón que reconoce separadores POSIX y Windows.
2. Los errores XMind/SVG terminan con un salto de línea real en stderr.
3. Se añadieron pruebas de CLI para exportación por defecto desde Markdown y JSON, además de pruebas de formato de stderr.
4. CI 43003867274: 124/124 pruebas en Ubuntu y Windows; probe SDK 43003867447 correcto en ambos.

## Protocolo de trabajo

1. Leer docs/project-audit-and-continuation.md, este prompt y la auditoría técnica.
2. Consultar HEAD de main y de la rama activa; no asumir que los SHA históricos siguen siendo HEAD.
3. Leer el diff desde el último commit verificado y comprobar si cambió código o solo documentación.
4. Consultar CI y logs de ambos sistemas antes de declarar un estado.
5. Trabajar en la rama activa salvo autorización; no modificar main, fusionar ramas ni crear PR/release sin autorización.
6. Cambios pequeños y verificables: pruebas, formato, lint, typecheck, build, revisión de diff y actualización documental.
7. AUD-009 está completada y verificada. AUD-010 está autorizada y en curso. No comenzar AUD-011 hasta autorización expresa.
8. Al terminar una tarea, actualizar auditoría, roadmap, README y documentación funcional aplicable; registrar SHA exacto y run IDs.

## Fuentes de verdad

Orden: código y pruebas presentes; resultados CI/logs del SHA exacto; JSON Schema/IR; documentación técnica; este prompt; supuestos. Si hay contradicción, señalarla y corregir documentación, no inventar comportamiento.

## Regla de informe

Separar siempre: planificado, implementado, probado localmente, verificado por CI, validado en aplicación de escritorio y pendiente. No afirmar que un archivo XMind abre en Desktop por haber generado y validado su ZIP.


## Actualización operativa 2026-11-11

El HEAD vigente es `72c411eed5b497d2399d152f1b27595ad468dd19`. La CI de ese SHA es [43015959095](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43015959095) (Ubuntu/Windows, 124/124 pruebas por sistema, verificaciones de ejemplos y paquete) y el probe SDK [43015959098](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43015959098); ambos correctos. El artefacto de distribución de [43015946683](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43015946683) está disponible como artefacto temporal hasta 2026-12-11 (ID 13852422612).

La siguiente tarea es terminar AUD-010: auditoría reproducible de dependencias y licencias, política de versionado/compatibilidad IR y workflow de GitHub Releases probado sin publicar. No iniciar AUD-011. No crear una release pública sin autorización expresa.


## Estado operativo vigente — 2026-11-11 (16:52 Europe/Madrid)

Esta sección prevalece sobre los SHA, recuentos y próximos pasos históricos anteriores.

- Repositorio y rama: `PabloGonzalezRuiz/xmind-md-ts`, `feature/aud-003-runtime-schema`.
- SHA de código/workflows verificado: `e66a0da529cd249c54c6d922c80dfcdaa7f7fef4`. Los cambios documentales posteriores no alteran el código ni los workflows.
- `main`: `6aca81b59dbfcfc13034e7e1115c70f7691c5035`; no modificar. Comparación al SHA verificado: 487 ahead, 0 behind.
- CI [43053653473](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43053653473): success Ubuntu/Windows, 11 archivos, 124/124 pruebas por sistema; formato, lint, tipos, typecheck, build, CLI, ejemplos, paquete y auditoría de dependencias correctos.
- Probe SDK [43053653384](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43053653384): success Ubuntu/Windows.
- Auditoría de seguridad: 12 moderadas, 0 altas, 0 críticas. `yaml@2.9.1`, Ajv 8.20.0 y `fast-uri@3.1.9` están actualizados y ya no figuran en el informe. Permanecen avisos moderados de ESLint/TypeScript-ESLint/minimatch en desarrollo y `uuid@3.4.0` transitiva de `xmind@2.2.33`. No degradar ESLint 10 ni sustituir el SDK por `xmind@0.5.0` sin una revisión de compatibilidad.
- Auditoría de licencias [43053653465](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43053653465): success Ubuntu/Windows; 120 dependencias de producción y 246 instaladas por plataforma. JSZip admite MIT OR GPL (usar la opción MIT); Pako exige MIT AND Zlib; MPL-2.0 solo en Lightning CSS de desarrollo. Artefactos 13869797169 y 13871485171. Leer `docs/third-party-license-audit-2026-11-11.md`.
- npm sigue aplazado y `package.json` conserva `private: true`; canal principal GitHub Releases. No hay PR ni release pública.

## Próximas tareas autorizadas de AUD-010

1. Documentar política SemVer y compatibilidad/versionado del IR.
2. Preparar y probar workflow GitHub Releases seguro, condicionado a tags, permisos mínimos y sin publicar.
3. Probar integralmente el paquete final y checksums desde un SHA verificado.
4. Resolver/documentar aceptación del riesgo moderado y asegurar avisos de terceros; revisión final y solicitud de autorización explícita para publicar.

AUD-011 (visor web) sigue pendiente y no está autorizada. No modificar `main`, crear PR, fusionar ni publicar una release sin autorización expresa.

## Estado AUD-010 actualizado — 2026-11-12

- Política de versionado documentada en `docs/versioning-and-compatibility.md`; paquete `0.1.0` e IR `1.0.0` son independientes.
- El único IR admitido actualmente es exactamente `1.0.0`. No inferir compatibilidad patch/minor ni migrar major de forma silenciosa.
- Propiedades desconocidas del núcleo y valores desconocidos de discriminantes/enumeraciones se rechazan. Las extensiones namespaced válidas se conservan como datos opacos.
- Pruebas nuevas: SC-111/SC-112 y casos semánticos para `1.0.1` y `1.1.0`. CI [43195892325](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43195892325) success en Ubuntu/Windows, 129/129 pruebas por sistema; `check:version` también pasa en ambos.
- Próximo paso autorizado pendiente de confirmación: workflow seguro de GitHub Releases en modo de preparación/prueba. No publicar.

La sincronización de versión paquete/CLI se comprueba con `npm run check:version` (`scripts/check-package-version.js`), integrado en `npm run verify` y en CI. Verificar siempre que esta comprobación pase antes de empaquetar.


## Continuidad AUD-010 — GitHub Release preflight — 2026-11-12

Se ha implementado `.github/workflows/aud-010-release-preflight.yml`. Consultar `docs/github-release-preflight.md` para su diseño y restricciones. Es un workflow de solo lectura: prepara tarball, verifica instalación/CLI, genera SHA-256/manifiesto/notas y sube artefacto temporal. No crea tags, GitHub Releases ni publica en npm. El dry-run se ejecuta en `feature/aud-003-runtime-schema`; el modo de tag solo valida un tag existente desde `main`, con versión y SHA coincidentes. Pendiente: ejecución y verificación real en GitHub Actions y revisión del artefacto. No iniciar publicación sin autorización expresa; no modificar `main` ni fusionar ramas.
