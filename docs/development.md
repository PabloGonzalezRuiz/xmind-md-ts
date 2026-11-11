# Desarrollo local y automatización

## 1. Entorno

Requisitos:
- Windows 10/11, Linux o macOS.
- Node.js 24 o superior; versión de referencia en .nvmrc.
- npm incluido con Node.js.
- Git.

No se requieren herramientas globales de TypeScript, Vitest, ESLint ni Prettier. Las dependencias se instalan desde el lockfile.

## 2. Instalación y verificación

En la raíz del repositorio:

    npm ci
    npm run verify
    npm run build
    npm start -- --help

Scripts:
- npm run dev: desarrollo con recarga.
- npm run build: compila a dist/.
- npm start: ejecuta la CLI compilada.
- npm run typecheck: TypeScript sin emitir.
- npm run lint: ESLint.
- npm run format / npm run format:check: Prettier.
- npm test / npm run test:watch: Vitest.
- npm run generate:types: genera spec/ir-v1.types.ts desde el JSON Schema.
- npm run check:generated-types: comprueba que los tipos versionados coinciden con el generador.
- npm run verify: formato, lint, tipos generados, typecheck, tests, build, validación de ejemplos y empaquetado/instalación de prueba.

Usa npm ci; no edites manualmente package-lock.json ni spec/ir-v1.types.ts.

## 3. Parser Markdown

API exportada desde src/index.ts:
- parseMarkdown(markdown, options): devuelve IrDocument.
- parseMarkdownWithDiagnostics(markdown, options): devuelve IR y diagnósticos del modo compatible.

Opciones: sourcePath, mode (compatible o strict). La gramática, directivas y límites están en docs/grammar.md.

## 4. Validación

- validateIrSchema(input): JSON Schema Draft 2020-12 mediante Ajv 8; acumula errores estructurales y no muta ni corrige la entrada.
- validateIrDocument(input, options): invariantes semánticas, IDs, referencias, ciclos, tablas, URI, límites y rutas de assets.
- validateIrDocumentComplete(input, options): ejecuta primero schema y después semántica; fail-fast si la estructura no es válida.

Límites semánticos por defecto: 100 niveles, 100.000 temas, 250.000 bloques y 10.000 assets. Se pueden configurar con maxDepth, maxTopics, maxContentBlocks, maxAssets; assetRootDirectory restringe la resolución de assets relativos.

Consulta Validación estructural y Calidad y pruebas.

## 5. Motor de estilos

resolveIrStyles(ir) produce estilos efectivos y procedencia por elemento/propiedad sin mutar el IR. La precedencia, catálogo, unidades, límites y semántica de null están en docs/style-system.md. Los adaptadores actuales consumen el resultado de estilos según sus capacidades; no todos los valores tienen representación visual equivalente.

## 6. CLI

La CLI está en src/cli/main.ts; el ejecutable npm es xmind-md (bin/xmind-md.js). Comandos:
- parse: Markdown a IR JSON.
- validate: valida Markdown o IR JSON.
- export --format json|xmind|svg: exporta al formato elegido.

Admite stdin/stdout, --input-format, --mode, --asset-root, --export-mode, rutas con espacios y códigos de salida 0–3. Las salidas XMind/SVG requieren ruta de archivo. Consulta docs/cli.md.

La derivación automática del nombre de salida XMind/SVG y los saltos de línea de los errores se corrigieron en AUD-013. Las regresiones se ejecutan en CI Ubuntu/Windows (run 43003867274).

## 7. Adaptadores

- JSON: serializa el IR validado.
- XMind: usa xmind 2.2.33; consulta docs/adapters.md y ADR-0001. CI comprueba el ZIP/JSON interno, no XMind Desktop.
- SVG: salida XML autocontenida con jerarquía, relaciones, boundaries, summaries y metadatos IR; assets no se dibujan.

Los adaptadores no reinterpretan Markdown ni modifican el IR. Los modos strict/compatible y diagnósticos de pérdidas están documentados por formato.

## 8. GitHub Actions

.github/workflows/ci.yml se ejecuta en Ubuntu y Windows con Node 24:
1. npm ci.
2. Prettier check.
3. ESLint.
4. Check de tipos generados.
5. Typecheck.
6. Vitest.
7. Build.
8. Smoke test de CLI compilada.

.github/workflows/xmind-sdk-probe.yml prueba el SDK oficial en un entorno temporal aislado, sin depender de que el adaptador de producción funcione. No sustituye a la CI general ni a la validación Desktop.

## 9. Reproducibilidad y seguridad

- Versiones directas fijadas y lockfile versionado.
- No guardar tokens ni secretos en el repositorio.
- Revisar licencias y mantenimiento de dependencias, especialmente el SDK XMind antiguo.
- La CI general tiene permiso contents: read y no modifica el repositorio. El workflow AUD-009 es independiente y publica el fixture de aceptación en su rama.
- Mantener finales LF mediante .gitattributes.
