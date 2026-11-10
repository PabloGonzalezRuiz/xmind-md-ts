# XMind MD TS

**XMind MD TS** es una implementación nueva, escrita en TypeScript, para transformar documentos Markdown enriquecidos en mapas mentales. Su primer formato de salida será XMind; la arquitectura también contempla JSON/IR y SVG, y deja preparada la integración de un visor web.

El proyecto no es una traducción mecánica del código Python de `xmind-md`. Reutiliza sus requisitos y decisiones funcionales, pero tendrá una implementación, contratos, pruebas y ciclo de desarrollo propios.

## Objetivos

- Un archivo Markdown representa una hoja del mapa.
- Los encabezados Markdown definen el árbol jerárquico.
- Los bloques de contenido se representan estructuradamente: párrafos, listas, tablas, código, citas e imágenes.
- Las directivas permiten definir estilos, conjuntos de estilos y elementos avanzados.
- Un IR neutral, tipado, versionado y validable separa la autoría de los formatos de salida.
- Los adaptadores generan XMind, JSON y SVG sin introducir dependencias del formato de destino en el núcleo.
- El proyecto se ejecuta localmente en Windows y automáticamente mediante GitHub Actions.
- Las pruebas de conformidad permiten comparar implementaciones y detectar regresiones.

## Estado

**Fase 3 — Esqueleto TypeScript creado; lockfile y ejecución CI pendientes de verificación.**

Se ha creado la estructura de proyecto, configuración estricta de TypeScript, scripts npm, ESLint, Prettier, Vitest y workflow de GitHub Actions. No se ha implementado todavía el parser, la validación IR, el motor de estilos ni los adaptadores.

## Documentación

- [Prompt maestro para IA](docs/ai-master-prompt.md)
- [Arquitectura](docs/architecture.md)
- [Especificación del IR](docs/ir-specification.md)
- [JSON Schema IR v1.0.0](spec/ir-v1.schema.json)
- [Tipos TypeScript IR v1.0.0](spec/ir-v1.types.ts)
- [Casos de conformidad](spec/conformance/README.md)
- [Fixture mínimo IR v1.0.0](spec/fixtures/ir-v1-minimal.json)
- [Gramática Markdown](docs/grammar.md)
- [Sistema de estilos](docs/style-system.md)
- [Adaptadores y XMind](docs/adapters.md)
- [Calidad y pruebas](docs/quality-and-testing.md)
- [Desarrollo local y GitHub Actions](docs/development.md)
- [Hoja de ruta](docs/roadmap.md)
- [Registro de decisiones](docs/decisions.md)

## Tecnologías configuradas

- TypeScript 5.9.3 y Node.js 22.
- npm como gestor de dependencias.
- Vitest 3.2.4.
- ESLint 9.39.1 y typescript-eslint 8.46.2.
- Prettier 3.6.2.
- GitHub Actions.

Las versiones directas están fijadas en `package.json`. El archivo `package-lock.json` queda pendiente de generación mediante npm; no se ha fabricado manualmente.

## Principio de desarrollo

Primero se acuerdan los contratos y los criterios de aceptación; después se implementan módulos pequeños. Ninguna característica se considerará terminada solo porque compile: debe superar pruebas y, cuando corresponda, validación con archivos abiertos en XMind Desktop.
