# CLI

La CLI coordina el parser Markdown y el validador completo del IR. No contiene reglas de parsing ni de validación duplicadas.

## Requisitos

- Node.js 24 o posterior.
- Dependencias instaladas con `npm ci`.
- Proyecto compilado con `npm run build`.

## Comandos

### Markdown a IR JSON

```powershell
node dist/src/cli/main.js parse .\documentos\mapa.md --output .\salida\mapa.json
```

Si se omite `--output`, el JSON se escribe en stdout. Los avisos del parser se escriben en stderr.

El comando `parse` admite `--mode compatible` (por defecto) y `--mode strict`. En modo estricto, cualquier característica Markdown que el parser solo pueda advertir provoca un error.

### Validar Markdown o IR JSON

```powershell
node dist/src/cli/main.js validate .\documentos\mapa.md
node dist/src/cli/main.js validate .\salida\mapa.json
```

La detección se basa en la extensión `.json`; cualquier otra extensión se interpreta como Markdown. Puede forzarse con `--input-format markdown|json`. La validación ejecuta JSON Schema Draft 2020-12 y, si la estructura es correcta, las reglas semánticas del IR. No modifica el documento.

Para restringir la resolución de assets relativos:

```powershell
node dist/src/cli/main.js validate .\salida\mapa.json --asset-root .\recursos
```

### Exportar JSON canónico

```powershell
node dist/src/cli/main.js export .\documentos\mapa.md --format json --output .\salida\mapa.json
node dist/src/cli/main.js export .\salida\mapa.json
```

La exportación acepta Markdown o IR JSON, valida el resultado y serializa el IR con indentación de dos espacios y salto de línea final.

## Entrada y salida estándar

El nombre de archivo `-` representa stdin o stdout. Para stdin hay que declarar el formato:

```powershell
Get-Content -Raw .\documentos\mapa.md | node dist/src/cli/main.js export - --input-format markdown
```

La salida va a stdout salvo que se indique `--output`. Los diagnósticos y mensajes de operación van a stderr, para permitir encadenar la salida JSON con otras herramientas.

## Códigos de salida

| Código | Significado |
|---:|---|
| 0 | Operación correcta |
| 1 | Error de parsing, sintaxis o validación del documento |
| 2 | Uso incorrecto o error de lectura/escritura |
| 3 | Error interno inesperado |

## Ejecutable instalado

El paquete registra el comando `xmind-md` mediante el campo `bin`. Tras compilar y enlazar/instalar el paquete, puede invocarse directamente:

```powershell
xmind-md --help
```

En el propio repositorio, `npm start -- --help` ejecuta la CLI compilada. `npm run build` debe ejecutarse antes de usar `start` o el ejecutable generado.


## Exportación XMind

El comando `export` admite también `--format xmind`:

```powershell
xmind-md export .\mapa.md --format xmind
xmind-md export .\mapa.md --format xmind --output .\salida\mapa.xmind
xmind-md export .\mapa.md --format xmind --export-mode compatible
```

El modo `strict` es el predeterminado y detiene la exportación cuando el IR contiene elementos que el adaptador no puede representar. `compatible` debe solicitarse expresamente y genera el paquete parcial junto con diagnósticos de pérdidas. La matriz completa está en [Adaptadores de salida](adapters.md).


## Exportación SVG

El comando `export` admite `--format svg` desde Markdown o IR JSON:

```powershell
xmind-md export .\mapa.md --format svg
xmind-md export .\mapa.md --format svg --output .\salida\mapa.svg
xmind-md export .\mapa.md --format svg --export-mode compatible
```

Por defecto se aplica `strict`: la exportación se detiene si el IR contiene assets que no se dibujan. `compatible` genera el SVG y comunica las omisiones. El IR completo se conserva dentro de `<metadata>`; las notas y el contenido también se exponen como descripciones accesibles de los temas. La matriz de capacidades y las limitaciones están en [Adaptadores de salida](adapters.md).
