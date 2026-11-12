# XMind MD TS

**XMind MD TS** es una herramienta de línea de comandos (CLI) que convierte documentos Markdown enriquecidos en mapas mentales XMind, JSON y SVG. Utiliza un modelo interno neutral y versionado (IR) para separar la autoría Markdown de los formatos de salida.

**Alcance del paquete:** distribución CLI exclusivamente. El paquete no ofrece una API JavaScript/TypeScript pública para importación desde otras aplicaciones.

## Estado del proyecto

- Versión del paquete en preparación: `0.1.0`.
- Contrato IR: `1.0.0`.
- Rama de trabajo: `feature/aud-003-runtime-schema`.
- La validación automatizada incluye formato, lint, generación de tipos, typecheck, pruebas, compilación, ejemplos e instalación limpia del tarball.
- La publicación pública en GitHub Releases sigue pendiente de las correcciones y autorizaciones finales; los artefactos temporales de Actions no son releases oficiales.
- No se ha publicado el paquete en npm.

## Instalación desde GitHub Releases

Cuando exista una release oficial, descarga el tarball `xmind-md-ts-0.1.0.tgz` y `SHA256SUMS.txt` desde sus Assets. Verifica el checksum y ejecuta:

```powershell
Get-FileHash .\\xmind-md-ts-0.1.0.tgz -Algorithm SHA256
npm install --global .\\xmind-md-ts-0.1.0.tgz
xmind-md --help
```

La guía completa está en [docs/user-guide.md](docs/user-guide.md). Hasta que se publique una release oficial, los artefactos temporales de Actions no deben considerarse versiones distribuidas.

## Inicio rápido

Ejemplo de validación:

```powershell
xmind-md validate .\\examples\\quick-start.md
```

Exportar a XMind:

```powershell
xmind-md export .\\examples\\quick-start.md --format xmind --output .\\salida\\quick-start.xmind
```

Exportar a SVG:

```powershell
xmind-md export .\\examples\\quick-start.md --format svg --output .\\salida\\quick-start.svg
```

## Documentación

- [Guía de usuario e instalación](docs/user-guide.md)
- [Gramática Markdown](docs/grammar.md)
- [Sistema de estilos](docs/style-system.md)
- [Especificación IR](docs/ir-specification.md)
- [JSON Schema IR v1.0.0](spec/ir-v1.schema.json)
- [Arquitectura](docs/architecture.md)
- [CLI](docs/cli.md)
- [Adaptadores y matriz de capacidades](docs/adapters.md)
- [Validación del esquema](docs/schema-validation.md)
- [Calidad y pruebas](docs/quality-and-testing.md)
- [Versionado y compatibilidad](docs/versioning-and-compatibility.md)
- [ADR-0001: SDK oficial XMind](docs/decisions/ADR-0001-xmind-sdk.md)
- [Changelog](CHANGELOG.md)

## Desarrollo desde el repositorio

Requisitos: Node.js 24 o posterior y npm.

```powershell
npm ci
npm run verify
npm run build
npm start -- --help
```

El paquete se construye desde el código TypeScript y se verifica mediante instalación limpia antes de distribuirlo.

## Formatos y limitaciones

- Markdown enriquecido con front matter, encabezados, listas, tablas, código, citas, imágenes y directivas.
- IR neutral con contrato versionado.
- Exportación a JSON, XMind y SVG.
- Los adaptadores pueden emitir diagnósticos de pérdida cuando el formato de destino no representa todos los elementos del IR. Consulta [adaptadores](docs/adapters.md).

## Licencia

Licencia MIT. Consulta [LICENSE](LICENSE).
