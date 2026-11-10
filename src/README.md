# Código fuente

La implementación se organizará por módulos según `docs/architecture.md`.

- `ir/`: modelo y operaciones del IR.
- `parser/`: Markdown y directivas.
- `validation/`: validación estructural y semántica.
- `styles/`: resolución de estilos.
- `adapters/`: exportadores por formato.
- `cli/`: interfaz de línea de comandos.

Los módulos se crearán cuando se implemente cada fase; no se añaden carpetas vacías como sustituto de funcionalidad.
