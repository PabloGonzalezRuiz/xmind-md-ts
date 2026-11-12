# Changelog

Los cambios relevantes para usuarios se registran aquí. Las versiones publicadas se identificarán mediante tags y releases; no se considera publicada ninguna versión mientras no exista una release oficial.

## 0.1.0 — candidato de distribución (no publicado)

### Añadido
- Parser Markdown enriquecido con front matter YAML y directivas XMind.
- Validación estructural JSON Schema Draft 2020-12 y validación semántica del IR v1.0.0.
- Exportación del IR a JSON, XMind y SVG mediante CLI.
- Modos compatible/strict y diagnósticos de pérdidas en los adaptadores.
- Guía de usuario, instalación desde GitHub Release y ejemplos reproducibles.
- Distribución exclusivamente como CLI; no se ofrece una API JavaScript/TypeScript de importación.
- Comprobación CI de ejemplos y de instalación del paquete empaquetado.

### Corregido
- Derivación de los nombres de salida XMind/SVG cuando se omite `--output`.
- Terminación de mensajes de error de exportación con salto de línea real.

### Validación
- CI AUD-010 (2026-11-12): 129/129 pruebas en Ubuntu y Windows.
- AUD-009: apertura, inspección de jerarquía, guardado y reapertura confirmados manualmente en XMind Desktop para el fixture de aceptación.

### Limitaciones conocidas
- XMind: no hay importación ni round-trip; relaciones, boundaries, StyleSets/overrides y assets binarios no están soportados por el adaptador inicial; ciertos contenidos se aplanan a notas.
- SVG: assets y sombras no se dibujan; padding puede aproximarse; el contenido de tema se conserva en metadata/descripciones accesibles y no como cuerpo visible.
- No existe visor web.
- El paquete no se ha publicado en npm ni existe una release estable.
