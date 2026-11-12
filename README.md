# XMind MD TS

**XMind MD TS** convierte documentos Markdown enriquecidos en mapas mentales mediante un compilador TypeScript. El modelo interno es un IR neutral y versionado; XMind, JSON y SVG son formatos de salida.

No es una traducción línea por línea del proyecto Python anterior. Reutiliza requisitos y decisiones funcionales, pero mantiene implementación, contratos, pruebas y ciclo de desarrollo propios.

## Estado actual

Rama de trabajo: **feature/aud-003-runtime-schema**.

**Implementado y verificado en la rama de trabajo:** contrato IR v1.0.0, parser Markdown, validación estructural y semántica, motor de estilos, corpus de conformidad, adaptador JSON, CLI, exportador XMind inicial y exportador SVG. AUD-009 confirmó manualmente apertura, guardado y reapertura en XMind Desktop.

- CI del SHA de código/workflows verificado: [43053653473](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43053653473), 124/124 pruebas en Ubuntu y Windows; formato, lint, tipos, typecheck, build, CLI, ejemplos, paquete y auditoría npm correctos.
- Prueba aislada del SDK XMind: [43053653384](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43053653384), Ubuntu y Windows.
- SHA de código/workflows verificado: `e66a0da529cd249c54c6d922c80dfcdaa7f7fef4`; los commits posteriores de sincronización son documentales.
- `main` permanece en `6aca81b59dbfcfc13034e7e1115c70f7691c5035`; el desarrollo no está integrado. En el SHA verificado, la rama estaba 487 commits por delante y 0 por detrás.

**Validación Desktop completada:** AUD-009. El workflow [43009405102](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43009405102) generó y publicó el artefacto; el usuario confirmó que XMind Desktop abre el archivo, muestra la jerarquía, permite guardar una copia y volver a abrirla conservando el contenido. La versión exacta de XMind Desktop y el sistema operativo no quedaron registrados. La validación cubre apertura, estructura visible y persistencia; no equivale a una certificación exhaustiva de todas las funciones o estilos de XMind. AUD-010 ha generado y probado un artefacto instalable de GitHub Actions ([run 43012600819](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43012600819)); la CI general más reciente [43013195119](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43013195119) pasa en Ubuntu y Windows, con 124 pruebas por sistema y validación del paquete instalado. La licencia MIT está incorporada y el canal acordado es GitHub Releases (npm aplazado). La publicación pública sigue pendiente de auditoría de dependencias/licencias, política de versión/compatibilidad y preparación/prueba del workflow de release. AUD-011 (visor web) permanece pendiente y no está autorizada.

AUD-013 está corregida y verificada: la CLI deriva correctamente los nombres de salida XMind/SVG cuando se omite --output y los mensajes de error terminan con saltos de línea reales. Hay pruebas de regresión para entradas Markdown y JSON, y para ambos errores; CI pasa en Ubuntu y Windows.

**Estado de AUD-010:** la auditoría de vulnerabilidades actual registra 12 avisos moderados y ninguno alto/crítico; las alertas restantes están clasificadas y documentadas. El inventario de licencias se ha ejecutado correctamente en Ubuntu y Windows (120 dependencias de producción y 246 instaladas por plataforma). JSZip admite la opción MIT; Pako declara MIT AND Zlib; MPL-2.0 solo aparece en Lightning CSS de desarrollo. Consulta [auditoría de licencias](docs/third-party-license-audit-2026-11-11.md). Siguen pendientes la política de versionado/compatibilidad IR, el workflow GitHub Releases, la prueba integral final y la decisión sobre el riesgo residual/avisos de terceros. No hay release pública; npm sigue aplazado.

## Objetivos

- Un archivo Markdown representa una hoja.
- Los encabezados Markdown definen el árbol jerárquico.
- Párrafos, listas, tablas, código, citas e imágenes se representan estructuradamente.
- Las directivas definen estilos y elementos avanzados.
- Un IR neutral, tipado, versionado y validable separa autoría y destinos.
- Los adaptadores generan JSON, XMind y SVG con diagnósticos explícitos de pérdidas.
- La CLI funciona en Windows y Linux.
- Las pruebas de conformidad detectan regresiones.

## Empezar a usarlo

- [Guía de usuario](docs/user-guide.md): instalación desde el repositorio, validación y exportación.
- [Ejemplo de inicio rápido](examples/quick-start.md).
- [Ejemplo con notas y estilos](examples/with-notes-and-styles.md).
- [Preparación de distribución y releases](docs/release-readiness.md): estado real y requisitos pendientes antes de publicar.\n- [Diseño del preflight GitHub Releases](docs/github-release-preflight.md): permisos, validaciones y límites del workflow sin publicación.

## Documentación y fuentes de verdad

- [Changelog](CHANGELOG.md)

- [Prompt maestro para IA](docs/ai-master-prompt.md)
- [Auditoría y registro de continuidad](docs/project-audit-and-continuation.md)
- [Auditoría técnica detallada 2026-11-11](docs/technical-audit-2026-11-11.md)
- [Auditoría de licencias de terceros 2026-11-11](docs/third-party-license-audit-2026-11-11.md)
- [Arquitectura](docs/architecture.md)
- [Especificación IR](docs/ir-specification.md)
- [JSON Schema IR v1.0.0](spec/ir-v1.schema.json)
- [Tipos TypeScript generados](spec/ir-v1.types.ts)
- [Validación estructural](docs/schema-validation.md)
- [Gramática Markdown](docs/grammar.md)
- [Sistema de estilos](docs/style-system.md)
- [Adaptadores y matriz de capacidades](docs/adapters.md)
- [CLI](docs/cli.md)
- [Procedimiento de aceptación XMind Desktop (AUD-009)](docs/aud-009-xmind-desktop-validation.md)
- [Calidad y pruebas](docs/quality-and-testing.md)
- [Desarrollo local y GitHub Actions](docs/development.md)
- [Hoja de ruta](docs/roadmap.md)
- [Registro de decisiones](docs/decisions.md)
- [ADR-0001: SDK oficial XMind](docs/decisions/ADR-0001-xmind-sdk.md)

## Tecnologías

- Node.js 24, TypeScript 6.0.3, npm.
- Vitest 5.0.5, ESLint 10.14.0, typescript-eslint 8.72.2 y Prettier 3.9.10.
- Ajv 8.20.0 mediante alias ajv2020, ajv-formats 3.0.1.
- xmind 2.2.33 encapsulado en el adaptador.
- GitHub Actions en Ubuntu y Windows.

## Desarrollo

npm ci
npm run verify
npm run build
npm start -- --help

No integrar ramas, crear releases ni iniciar la siguiente tarea de producto sin respetar el protocolo de autorización documentado en el prompt maestro y la auditoría.

## Licencia

Este proyecto se distribuye bajo la licencia [MIT](LICENSE), Copyright (c) 2026 Pablo González Ruiz.


**Última comprobación técnica (2026-11-11):** código/workflows verificados en `e66a0da529cd249c54c6d922c80dfcdaa7f7fef4`; los commits documentales posteriores no cambian la aplicación. CI [43053653473](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43053653473), SDK probe [43053653384](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43053653384) y auditoría de licencias [43053653465](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43053653465) correctos en Ubuntu y Windows. Informe npm audit: artefacto `13870876663`; licencias: artefactos `13869797169` (Ubuntu) y `13871485171` (Windows), temporales hasta 2026-12-11. Próximo paso: política de versionado/compatibilidad IR; después workflow seguro de GitHub Releases y prueba integral, sin publicar hasta autorización expresa.

## Versionado y compatibilidad

El paquete y el contrato IR tienen versiones independientes. El paquete está en `0.1.0` y el único contrato IR admitido actualmente es `1.0.0`; las versiones IR no registradas se rechazan. Consulta la [política de versionado y compatibilidad](docs/versioning-and-compatibility.md) para las reglas de evolución, extensiones y migraciones.

La CI [43195892325](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43195892325) verifica también la sincronización de versión entre paquete y CLI y pasa en Ubuntu y Windows (129/129 pruebas por sistema).


## AUD-010 — preparación segura de releases (2026-11-12)

Se ha incorporado un workflow de preflight de GitHub Releases, documentado en [docs/github-release-preflight.md](docs/github-release-preflight.md). Solo genera un artefacto temporal verificable; no crea tags/releases ni publica en npm. Requiere CI satisfactoria y autorización expresa antes de cualquier publicación. La versión del paquete sigue en `0.1.0` y el contrato IR admitido en `1.0.0`.


**Última verificación AUD-010 (2026-11-12):** preflight GitHub Releases [43211658439](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43211658439) success; CI [43211658590](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43211658590) success Ubuntu/Windows (129/129 pruebas por sistema); SDK probe [43211658454](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43211658454) success en ambos. Artefacto temporal ID `13941362391`; SHA-256 del tarball verificado `b7abc4d2b1dc83af1130eb16b468bda532ee51e65b0c104f66b6fed69ec8137a`. No se ha creado una release pública.
