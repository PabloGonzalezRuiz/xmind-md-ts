# Guía de usuario

Esta guía explica cómo instalar la CLI XMind MD TS desde un artefacto de GitHub Release, preparar documentos Markdown, validarlos y exportarlos a JSON, XMind o SVG.

XMind MD TS se distribuye como **CLI exclusivamente**. El paquete no expone una API JavaScript/TypeScript pública para importar desde otros programas.

## 1. Requisitos

- Node.js 24 o posterior.
- npm, incluido con Node.js.
- Para abrir los archivos generados en formato XMind: XMind Desktop.

## 2. Instalar desde GitHub Releases

Cuando exista una release oficial, descarga desde sus **Assets** el archivo `xmind-md-ts-0.1.0.tgz` y `SHA256SUMS.txt`. No descargues el código fuente (`Source code.zip` o `Source code.tar.gz`) como si fuera el paquete instalable.

En Windows PowerShell, sitúate en la carpeta de descarga y comprueba el hash:

```powershell
Get-FileHash .\\xmind-md-ts-0.1.0.tgz -Algorithm SHA256
Get-Content .\\SHA256SUMS.txt
```

Compara el valor SHA-256 calculado con la línea correspondiente de `SHA256SUMS.txt`. Si no coincide, no instales el archivo.

Instala la CLI globalmente desde el tarball local:

```powershell
npm install --global .\\xmind-md-ts-0.1.0.tgz
```

Comprueba la instalación:

```powershell
xmind-md --help
xmind-md --version
```

En macOS/Linux, los comandos equivalentes son:

```bash
sha256sum -c SHA256SUMS.txt
npm install --global ./xmind-md-ts-0.1.0.tgz
xmind-md --help
xmind-md --version
```

La instalación global puede requerir permisos de escritura sobre el directorio global de npm. También puedes instalar el tarball en un proyecto concreto omitiendo `--global` y ejecutar la CLI mediante `npx`.

**Estado de publicación:** esta guía describe el procedimiento previsto para una release oficial. Mientras no exista una release publicada, no hay un tarball oficial que descargar; no se debe interpretar el artefacto temporal de GitHub Actions como una release.

## 3. Ejecutar desde el código fuente (desarrollo)

Para contribuir o ejecutar la rama de desarrollo, clona el repositorio:

```powershell
git clone --branch feature/aud-003-runtime-schema https://github.com/PabloGonzalezRuiz/xmind-md-ts.git
cd xmind-md-ts
npm ci
npm run verify
npm run build
```

Esta ruta es para desarrollo y verificación, no es el procedimiento de instalación de una release.

## 4. Crear un mapa desde Markdown

Cada archivo representa una hoja y debe contener exactamente un encabezado H1. Los encabezados H2–H6 crean la jerarquía.

Ejemplo mínimo:

```md
# Plan de proyecto

## Análisis

Definir el alcance y los requisitos.

## Implementación

### Backend

Desarrollar los servicios.

### Interfaz

Preparar la interfaz de usuario.

## Validación

Comprobar el resultado.
```

La gramática completa está en [grammar.md](grammar.md). Puedes partir de [examples/quick-start.md](../examples/quick-start.md).

## 5. Validar antes de exportar

Desde la raíz del repositorio:

```powershell
xmind-md validate .\\examples\\quick-start.md
```

Para validar un IR JSON:

```powershell
xmind-md validate .\\salida\\mapa.json
```

La validación ejecuta primero JSON Schema Draft 2020-12 y después las reglas semánticas. Si el documento contiene imágenes con rutas relativas, limita su resolución al directorio esperado:

```powershell
xmind-md validate .\\mapa.md --asset-root .\\recursos
```

## 6. Exportar

### XMind

```powershell
xmind-md export .\\examples\\quick-start.md --format xmind --output .\\salida\\quick-start.xmind
```

Abre el archivo resultante con XMind Desktop. Para una prueba de interoperabilidad sigue también el procedimiento de [AUD-009](aud-009-xmind-desktop-validation.md).

### SVG

```powershell
xmind-md export .\\examples\\quick-start.md --format svg --output .\\salida\\quick-start.svg
```

El SVG es autocontenido y puede abrirse en un navegador o editor compatible.

### JSON IR

```powershell
xmind-md parse .\\examples\\quick-start.md --output .\\salida\\quick-start.json
```

También puedes exportar JSON validado con:

```powershell
xmind-md export .\\examples\\quick-start.md --format json --output .\\salida\\quick-start.json
```

## 7. Modos de compatibilidad

Hay dos decisiones distintas:

- `--mode compatible|strict`: controla el tratamiento de características Markdown no reconocidas o no soportadas por el parser. El valor predeterminado es `compatible`.
- `--export-mode strict|compatible`: controla qué hace el adaptador de destino cuando no puede representar elementos del IR. El valor predeterminado es `strict`.

Ejemplo de exportación XMind permitiendo pérdidas diagnosticadas:

```powershell
xmind-md export .\\mapa.md --format xmind --export-mode compatible
```

El modo compatible no significa fidelidad completa: permite generar una salida parcial y comunica las pérdidas por stderr. Revisa siempre esos diagnósticos.

## 8. Entrada estándar

Para leer desde stdin hay que declarar el formato:

```powershell
Get-Content -Raw .\\mapa.md | xmind-md export - --input-format markdown --format json
```

JSON puede escribirse a stdout. XMind y SVG requieren una ruta de archivo.

## 9. Ayuda y códigos de salida

```powershell
xmind-md --help
xmind-md --version
```

| Código | Significado |
|---:|---|
| 0 | Operación correcta |
| 1 | Error de parsing, sintaxis o validación |
| 2 | Uso incorrecto o error de lectura/escritura |
| 3 | Error interno inesperado |

Los diagnósticos se escriben en stderr; los resultados JSON pueden escribirse en stdout.

## 10. Siguiente nivel

- [Gramática Markdown](grammar.md): front matter, encabezados, contenido y directivas.
- [Sistema de estilos](style-system.md): catálogo, herencia y precedencia.
- [Especificación IR](ir-specification.md): contrato neutral v1.0.0.
- [CLI](cli.md): referencia completa de comandos y opciones.
- [Adaptadores](adapters.md): capacidades y pérdidas de XMind y SVG.
- [Calidad y pruebas](quality-and-testing.md): verificaciones y evidencia CI.
