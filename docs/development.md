# Desarrollo local y automatización

## 1. Entorno local

Requisitos:
- Windows 10/11, Linux o macOS.
- Node.js 24 o superior.
- npm incluido con Node.js.
- Git.
- Visual Studio Code recomendado.

La versión de referencia está fijada en `.nvmrc` (24). No instalar dependencias globales.

## 2. Instalación y comandos

En la raíz del repositorio:

```powershell
npm ci
npm run verify
```

Scripts disponibles:
- `npm run dev`: ejecución de desarrollo con recarga.
- `npm run build`: compila TypeScript en `dist/`.
- `npm start`: ejecuta la salida compilada.
- `npm run typecheck`: comprueba tipos sin emitir archivos.
- `npm run lint`: ejecuta ESLint.
- `npm run format` / `npm run format:check`: formatea o comprueba formato.
- `npm test` / `npm run test:watch`: ejecuta Vitest.
- `npm run verify`: ejecuta todas las comprobaciones anteriores.

`package-lock.json` está versionado. Utiliza `npm ci` tanto en local como en CI; no edites el lockfile manualmente.

## 3. Parser Markdown

La API se exporta desde `src/index.ts`:
- `parseMarkdown(markdown, options)` devuelve un `IrDocument`.
- `parseMarkdownWithDiagnostics(markdown, options)` devuelve el IR y los avisos del modo compatible.

Las opciones incluyen `sourcePath` y `mode` (`compatible` o `strict`). La gramática y sus límites se describen en `docs/grammar.md`.

## 4. Validación semántica

`validateIrDocument(input, options)` acepta una entrada `unknown` y devuelve:

- `valid`: indica si no se encontraron errores semánticos.
- `diagnostics`: lista de errores con código estable, mensaje, ruta JSON y posición de origen cuando está disponible.

La función no modifica el IR. Comprueba unicidad de IDs, referencias a temas y assets, relaciones, boundaries, summaries, conjuntos de estilos, ciclos de herencia, enlaces, URI, tablas y límites de tamaño/profundidad.

Límites predeterminados: 100 niveles de temas/contenido, 100.000 temas, 250.000 bloques y 10.000 assets. Se pueden ajustar con `maxDepth`, `maxTopics`, `maxContentBlocks` y `maxAssets`. Para impedir que una URI relativa de asset salga de un directorio permitido, configura `assetRootDirectory`.

Esta API valida invariantes semánticas; no sustituye todavía la validación completa contra `spec/ir-v1.schema.json`.

## 5. Ejecución de la CLI

La CLI se diseñará para invocarse desde PowerShell y terminales compatibles. Debe ofrecer ayuda, validación sin exportar, selección de adaptador, rutas de entrada/salida, modo estricto/compatible y diagnóstico detallado. La CLI aún no está implementada.

## 6. Depuración

VS Code puede depurar Node.js/TypeScript mediante source maps. Los errores deben conservar stack trace en modo debug y ofrecer mensajes concisos en modo normal.

## 7. GitHub Actions

El workflow `.github/workflows/ci.yml` se activa en push, pull_request y workflow_dispatch. Configura Node.js 24 e instala dependencias para ejecutar formato, lint, typecheck, pruebas y build.

## 8. Contribución asistida por IA

Antes de pedir a la IA un cambio, indicar objetivo y criterio de aceptación. Mantener tareas pequeñas, exigir pruebas, revisar diff y comprobar que la documentación coincide con el comportamiento.

## 9. Reproducibilidad y seguridad

- Versiones directas de desarrollo fijadas en `package.json`.
- Versionar `package-lock.json` y mantener las instalaciones reproducibles con `npm ci`.
- Revisar licencias de dependencias directas y transitivas.
- Evitar scripts de instalación innecesarios.
- No almacenar tokens ni secretos en el repositorio.
