# XMind MD TS

**XMind MD TS** convierte documentos Markdown enriquecidos en mapas mentales mediante un compilador TypeScript. El modelo interno es un IR neutral y versionado; XMind, JSON y SVG son formatos de salida.

No es una traducción línea por línea del proyecto Python anterior. Reutiliza requisitos y decisiones funcionales, pero mantiene implementación, contratos, pruebas y ciclo de desarrollo propios.

## Estado actual

Rama de trabajo: **feature/aud-003-runtime-schema**.

**Implementado y verificado en la rama de trabajo:** contrato IR v1.0.0, parser Markdown, validación estructural y semántica, motor de estilos, corpus de conformidad, adaptador JSON, CLI, exportador XMind inicial y exportador SVG. AUD-009 confirmó manualmente apertura, guardado y reapertura en XMind Desktop.

- CI AUD-013: [43003867274](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43003867274), 124/124 pruebas en Ubuntu y Windows.
- Prueba aislada del SDK XMind: [42989195787](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42989195787), Ubuntu y Windows.
- Código probado: fe1d3e510a76719f12d4eeaf0e081304720196b8.
- HEAD observado tras preparar el workflow AUD-009 y antes de la última sincronización documental: c8295b031551a7a421fa3b7f550dceb99b865651. Desde el último código probado solo se han añadido fixture, documentación y workflow; no se ha modificado el código de la aplicación.
- main permanece en 6aca81b59dbfcfc13034e7e1115c70f7691c5035; el desarrollo no está integrado.

**Validación Desktop completada:** AUD-009. El workflow [43009405102](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43009405102) generó y publicó el artefacto; el usuario confirmó que XMind Desktop abre el archivo, muestra la jerarquía, permite guardar una copia y volver a abrirla conservando el contenido. La versión exacta de XMind Desktop y el sistema operativo no quedaron registrados. La validación cubre apertura, estructura visible y persistencia; no equivale a una certificación exhaustiva de todas las funciones o estilos de XMind. AUD-010 ha generado y probado un artefacto instalable de GitHub Actions ([run 43012600819](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43012600819)); la CI general [43012605756](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43012605756) pasa en Ubuntu y Windows, con 124 pruebas por sistema y validación del paquete instalado. La publicación estable sigue pendiente de licencia, revisión de vulnerabilidades y decisión de canal. AUD-011 (visor web) permanece pendiente.

AUD-013 está corregida y verificada: la CLI deriva correctamente los nombres de salida XMind/SVG cuando se omite --output y los mensajes de error terminan con saltos de línea reales. Hay pruebas de regresión para entradas Markdown y JSON, y para ambos errores; CI pasa en Ubuntu y Windows.

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
- [Preparación de distribución y releases](docs/release-readiness.md): estado real y requisitos pendientes antes de publicar.

## Documentación y fuentes de verdad

- [Changelog](CHANGELOG.md)

- [Prompt maestro para IA](docs/ai-master-prompt.md)
- [Auditoría y registro de continuidad](docs/project-audit-and-continuation.md)
- [Auditoría técnica detallada 2026-11-11](docs/technical-audit-2026-11-11.md)
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
- Ajv 8.17.1 mediante alias ajv2020, ajv-formats 3.0.1.
- xmind 2.2.33 encapsulado en el adaptador.
- GitHub Actions en Ubuntu y Windows.

## Desarrollo

npm ci
npm run verify
npm run build
npm start -- --help

No integrar ramas, crear releases ni iniciar la siguiente tarea de producto sin respetar el protocolo de autorización documentado en el prompt maestro y la auditoría.
