# Código fuente

La implementación se organizará por módulos según `docs/architecture.md`.

- `ir/`: modelo y operaciones del IR.
- `markdown/parser.ts`: Markdown y directivas a IR v1.
- `validation/semantic-validator.ts`: invariantes semánticas y referencias cruzadas.
- `styles/`: resolución de estilos.
- `adapters/`: exportadores por formato.
- `cli/`: interfaz de línea de comandos.

Los módulos se crearán cuando se implemente cada fase; no se añaden carpetas vacías como sustituto de funcionalidad.
