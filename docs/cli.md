# CLI

La CLI coordina el parser Markdown, el pipeline de validación y los adaptadores. No duplica reglas de parsing ni de validación.

## Requisitos

- Node.js 24 o posterior.
- Para usar la release instalada, basta con Node.js y la CLI disponible en PATH.
- Para ejecutar desde el código fuente, instala dependencias con npm ci y compila con npm run build.

## Comandos

### Ayuda y versión

    xmind-md --help
    xmind-md --version

Desde el repositorio, después de compilar:

    npm start -- --help

### Markdown a IR JSON

    xmind-md parse .\documentos\mapa.md --output .\salida\mapa.json

Si se omite --output, el JSON se escribe en stdout. Los avisos del parser se escriben en stderr. parse admite --mode compatible (predeterminado) y --mode strict. En modo estricto, una característica Markdown que solo puede advertirse en modo compatible provoca un error.

### Validar Markdown o IR JSON

    xmind-md validate .\documentos\mapa.md
    xmind-md validate .\salida\mapa.json
    xmind-md validate .\salida\mapa.json --asset-root .\recursos

La detección se basa en la extensión .json; cualquier otra extensión se interpreta como Markdown. Puede forzarse con --input-format markdown|json. La validación ejecuta JSON Schema Draft 2020-12 y, si la estructura es correcta, las reglas semánticas del IR. No modifica el documento.

--asset-root restringe la resolución de assets relativos a un directorio permitido.

### Exportar JSON canónico

    xmind-md export .\documentos\mapa.md --format json --output .\salida\mapa.json
    xmind-md export .\salida\mapa.json

La exportación acepta Markdown o IR JSON, valida el resultado y serializa el IR con indentación de dos espacios y salto de línea final.

### Exportar XMind

    xmind-md export .\mapa.md --format xmind --output .\salida\mapa.xmind
    xmind-md export .\mapa.json --format xmind --export-mode compatible

El modo strict es el predeterminado y detiene la exportación si hay elementos que el adaptador no puede representar. compatible permite generar un paquete parcial con diagnósticos de pérdidas. La matriz está en docs/adapters.md.

### Exportar SVG

    xmind-md export .\mapa.md --format svg --output .\salida\mapa.svg
    xmind-md export .\mapa.json --format svg --export-mode compatible

strict es el modo predeterminado; compatible permite continuar con omisiones visuales diagnosticadas. El IR completo se conserva en el elemento metadata. El contenido y las notas se exponen como descripciones accesibles, no como cuerpo visible de los nodos.

## Entrada y salida estándar

El nombre de archivo - representa stdin o stdout. Para stdin hay que declarar el formato:

    Get-Content -Raw .\documentos\mapa.md | xmind-md export - --input-format markdown --format json

La salida JSON va a stdout salvo que se indique --output. Los diagnósticos y mensajes de operación van a stderr. Las salidas XMind y SVG requieren una ruta de archivo y no se escriben en stdout.

## Códigos de salida

| Código | Significado |
|---:|---|
| 0 | Operación correcta |
| 1 | Error de parsing, sintaxis o validación del documento |
| 2 | Uso incorrecto o error de lectura/escritura |
| 3 | Error interno inesperado |

## Ejecutable instalado

El paquete registra xmind-md mediante el campo bin. Tras compilar y enlazar/instalar el paquete, puede invocarse directamente. La CLI compilada está en dist/src/cli/main.js.

## Salida predeterminada y mensajes de error

Cuando se exporta a XMind o SVG sin indicar --output, la CLI elimina la extensión final de la entrada y genera el archivo en el mismo directorio:

- mapa.md → mapa.xmind o mapa.svg.
- mapa.json → mapa.xmind o mapa.svg.
- Para stdin (-), usa map.xmind o map.svg.

La derivación reconoce separadores de directorio POSIX y Windows. Los mensajes de error de exportación XMind y SVG se escriben en stderr terminados por un salto de línea real.

Estos comportamientos están cubiertos por pruebas de regresión para entradas Markdown y JSON, ejecutadas en Ubuntu y Windows en AUD-013. La evidencia de CI se conserva en los registros de GitHub Actions del repositorio.

## Límites de interoperabilidad

La CI inspecciona la estructura generada del paquete XMind, pero no abre ni guarda el archivo con XMind Desktop. AUD-009 completó la aceptación manual: apertura, inspección de jerarquía, guardado de copia y reapertura confirmados por el usuario. La versión exacta de Desktop y el sistema operativo no quedaron registrados. Consulta [el procedimiento AUD-009](aud-009-xmind-desktop-validation.md) y [la guía de usuario](user-guide.md).
