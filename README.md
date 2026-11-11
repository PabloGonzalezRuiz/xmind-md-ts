# XMind MD TS

**XMind MD TS** convierte documentos Markdown enriquecidos en mapas mentales mediante un compilador TypeScript. El modelo interno es un IR neutral y versionado; XMind, JSON y SVG son formatos de salida.

No es una traducción línea por línea del proyecto Python anterior. Reutiliza requisitos y decisiones funcionales, pero mantiene implementación, contratos, pruebas y ciclo de desarrollo propios.

## Estado actual

Rama de trabajo: **feature/aud-003-runtime-schema**.

**Implementado y verificado en la rama de trabajo:** contrato IR v1.0.0, parser Markdown, validación estructural y semántica, motor de estilos, corpus de conformidad, adaptador JSON, CLI, exportador XMind inicial y exportador SVG.

- CI general: [42989195843](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42989195843), 118/118 pruebas, Ubuntu y Windows.
- Prueba aislada del SDK XMind: [42989195787](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42989195787), Ubuntu y Windows.
- Código probado: 980279a6e61a990769e9884ea1fc51888d5bf054.
- HEAD actual de la rama: 8a8b28953ac29d7bcd5d3707f19b484d8834915c; los dos commits posteriores solo modifican documentación.
- main permanece en 6aca81b59dbfcfc13034e7e1115c70f7691c5035; el desarrollo no está integrado.

**Pendiente:** validación de apertura/guardado en XMind Desktop, documentación final/publicación y visor web. Generar un paquete XMind válido estructuralmente no demuestra que XMind Desktop lo abra, lo guarde o lo represente fielmente.

La auditoría estática detectó una incidencia en la CLI: la derivación automática del nombre de salida XMind/SVG no elimina correctamente la extensión de entrada y los mensajes de error de exportación contienen un salto de línea escapado incorrectamente. Está registrada como AUD-013; las pruebas actuales no cubren esos casos.

## Objetivos

- Un archivo Markdown representa una hoja.
- Los encabezados Markdown definen el árbol jerárquico.
- Párrafos, listas, tablas, código, citas e imágenes se representan estructuradamente.
- Las directivas definen estilos y elementos avanzados.
- Un IR neutral, tipado, versionado y validable separa autoría y destinos.
- Los adaptadores generan JSON, XMind y SVG con diagnósticos explícitos de pérdidas.
- La CLI funciona en Windows y Linux.
- Las pruebas de conformidad detectan regresiones.

## Documentación y fuentes de verdad

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
