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

**Fase 2 — Contrato IR v1.0.0 en revisión**

La documentación inicial está completada. Se ha definido el contrato IR v1.0.0, su JSON Schema y un fixture mínimo. Todavía no existe código ejecutable ni se han ejecutado pruebas automatizadas; el contrato está pendiente de revisión antes de iniciar la fase 3.

## Documentación

- [Prompt maestro para IA](docs/ai-master-prompt.md)
- [Arquitectura](docs/architecture.md)
- [Especificación del IR](docs/ir-specification.md)
- [JSON Schema IR v1.0.0](spec/ir-v1.schema.json)\n- [Tipos TypeScript IR v1.0.0](spec/ir-v1.types.ts)\n- [Casos de conformidad](spec/conformance/README.md)
- [Fixture mínimo IR v1.0.0](spec/fixtures/ir-v1-minimal.json)
- [Gramática Markdown](docs/grammar.md)
- [Sistema de estilos](docs/style-system.md)
- [Adaptadores y XMind](docs/adapters.md)
- [Calidad y pruebas](docs/quality-and-testing.md)
- [Desarrollo local y GitHub Actions](docs/development.md)
- [Hoja de ruta](docs/roadmap.md)
- [Registro de decisiones](docs/decisions.md)

## Tecnologías previstas

- TypeScript con configuración estricta.
- Node.js como entorno de ejecución local y de CI.
- npm con archivo de bloqueo reproducible.
- Vitest para pruebas unitarias y de integración.
- JSON Schema para el contrato serializado del IR.
- ESLint y Prettier para calidad y formato.
- GitHub Actions para comprobaciones automáticas.
- SDK oficial de XMind como candidato para el adaptador, sujeto a evaluación técnica y de licencia.

Las versiones concretas se fijarán al iniciar la implementación y se registrarán en `package.json` y `package-lock.json`.

## Principio de desarrollo

Primero se acuerdan los contratos y los criterios de aceptación; después se implementan módulos pequeños. Ninguna característica se considerará terminada solo porque compile: debe superar pruebas y, cuando corresponda, validación con archivos abiertos en XMind Desktop.
