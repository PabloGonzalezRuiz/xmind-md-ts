# Guía de usuario

Esta guía explica cómo preparar un documento Markdown, validarlo y exportarlo a JSON, XMind o SVG con XMind MD TS.

## 1. Requisitos

- Node.js 24 o posterior.
- npm, incluido con Node.js.
- Git.
- Para abrir el resultado XMind: XMind Desktop.

La versión actual se ejecuta desde el código fuente del repositorio. No hay todavía un paquete npm público ni un instalador independiente.

## 2. Obtener el proyecto

Clona el repositorio y entra en su directorio:

```powershell
git clone https://github.com/PabloGonzalezRuiz/xmind-md-ts.git
cd xmind-md-ts
```

Instala las dependencias exactas del lockfile, verifica el proyecto y compílalo:

```powershell
npm ci
npm run verify
npm run build
```

La rama de desarrollo documentada es `feature/aud-003-runtime-schema`. Hasta que exista una publicación versionada, no debe suponerse que `main` contiene la implementación completa.

## 3. Crear un mapa desde Markdown

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

## 4. Validar antes de exportar

Desde la raíz del repositorio:

```powershell
npm start -- validate .\\examples\\quick-start.md
```

Para validar un IR JSON:

```powershell
npm start -- validate .\\salida\\mapa.json
```

La validación ejecuta primero JSON Schema Draft 2020-12 y después las reglas semánticas. Si el documento contiene imágenes con rutas relativas, limita su resolución al directorio esperado:

```powershell
npm start -- validate .\\mapa.md --asset-root .\\recursos
```

## 5. Exportar

### XMind

```powershell
npm start -- export .\\examples\\quick-start.md --format xmind --output .\\salida\\quick-start.xmind
```

Abre el archivo resultante con XMind Desktop. Para una prueba de interoperabilidad sigue también el procedimiento de [AUD-009](aud-009-xmind-desktop-validation.md).

### SVG

```powershell
npm start -- export .\\examples\\quick-start.md --format svg --output .\\salida\\quick-start.svg
```

El SVG es autocontenido y puede abrirse en un navegador o editor compatible.

### JSON IR

```powershell
npm start -- parse .\\examples\\quick-start.md --output .\\salida\\quick-start.json
```

También puedes exportar JSON validado con:

```powershell
npm start -- export .\\examples\\quick-start.md --format json --output .\\salida\\quick-start.json
```

## 6. Modos de compatibilidad

Hay dos decisiones distintas:

- `--mode compatible|strict`: controla el tratamiento de características Markdown no reconocidas o no soportadas por el parser. El valor predeterminado es `compatible`.
- `--export-mode strict|compatible`: controla qué hace el adaptador de destino cuando no puede representar elementos del IR. El valor predeterminado es `strict`.

Ejemplo de exportación XMind permitiendo pérdidas diagnosticadas:

```powershell
npm start -- export .\\mapa.md --format xmind --export-mode compatible
```

El modo compatible no significa fidelidad completa: permite generar una salida parcial y comunica las pérdidas por stderr. Revisa siempre esos diagnósticos.

## 7. Entrada estándar

Para leer desde stdin hay que declarar el formato:

```powershell
Get-Content -Raw .\\mapa.md | npm start -- export - --input-format markdown --format json
```

JSON puede escribirse a stdout. XMind y SVG requieren una ruta de archivo.

## 8. Ayuda y códigos de salida

```powershell
npm start -- --help
npm start -- --version
```

| Código | Significado |
|---:|---|
| 0 | Operación correcta |
| 1 | Error de parsing, sintaxis o validación |
| 2 | Uso incorrecto o error de lectura/escritura |
| 3 | Error interno inesperado |

Los diagnósticos se escriben en stderr; los resultados JSON pueden escribirse en stdout.

## 9. Siguiente nivel

- [Gramática Markdown](grammar.md): front matter, encabezados, contenido y directivas.
- [Sistema de estilos](style-system.md): catálogo, herencia y precedencia.
- [Especificación IR](ir-specification.md): contrato neutral v1.0.0.
- [CLI](cli.md): referencia completa de comandos y opciones.
- [Adaptadores](adapters.md): capacidades y pérdidas de XMind y SVG.
- [Calidad y pruebas](quality-and-testing.md): verificaciones y evidencia CI.
