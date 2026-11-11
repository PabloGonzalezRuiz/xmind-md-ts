# Adaptadores de salida

## 1. Contrato común

Cada adaptador recibe un IR validado/resuelto y devuelve un artefacto más un informe de diagnósticos y capacidades. No interpreta Markdown ni modifica el IR.

## 2. Adaptador XMind

El backend inicial utiliza el SDK oficial `xmind@2.2.33`, fijado exactamente en `package.json` y `package-lock.json`. La integración está encapsulada en `src/adapters/xmind/xmind-adapter.ts`; los tipos del SDK no se filtran al IR, parser ni CLI.

La prueba aislada `scripts/probe-xmind-sdk.js` y el workflow `.github/workflows/xmind-sdk-probe.yml` verifican la generación e inspección del ZIP/JSON con Node 24 en Ubuntu y Windows. No se ha probado todavía la apertura y guardado en XMind Desktop; esa validación corresponde a AUD-009. El SDK no carga archivos XMind existentes desde la versión 2.2.0, por lo que no se ofrece importación ni round-trip.

No se utiliza `Topic.addLabel()`: el helper oficial escribe un array, aunque el schema del SDK espera una cadena. El adaptador asigna directamente la propiedad `labels` como cadena.

## 3. Matriz de capacidades XMind (AUD-007 inicial)

Estados: **native** (representación directa), **mapped** (mapeo semántico), **approximate** (pérdida o aplanado explícito) y **unsupported** (no se exporta).

| Elemento IR | Estado | Tratamiento / diagnóstico |
|---|---|---|
| Hoja y jerarquía de temas | mapped | Hoja y temas anidados mediante `Workbook`, `Topic` y `Zipper` |
| Título del tema | native | Se conserva como título del componente |
| Notas | mapped | Bloques convertidos a texto plano en nota |
| Contenido de tema | approximate | Se concatena como nota; `XMIND_CONTENT_AS_NOTE` |
| Marcadores | mapped | Solo nombres coincidentes con el catálogo del SDK |
| Hipervínculos en temas no centrales | mapped | Campo `href` del modelo |
| Etiquetas | approximate | Varias etiquetas se unen en una cadena; `XMIND_LABELS_COLLAPSED` |
| Etiquetas del tema central | unsupported | `XMIND_ROOT_LABELS_OMITTED` |
| Hipervínculo del tema central | unsupported | `XMIND_ROOT_HYPERLINK_OMITTED` |
| Resúmenes | mapped | Solo rangos cuyos extremos sean hermanos |
| Relaciones | unsupported | `XMIND_RELATIONSHIPS_UNSUPPORTED` |
| Límites | unsupported | `XMIND_BOUNDARIES_UNSUPPORTED` |
| StyleSets y overrides | unsupported | `XMIND_STYLES_UNSUPPORTED` |
| Assets/imágenes binarias | unsupported | `XMIND_ASSETS_NOT_EMBEDDED` |
| Listas, tablas, código y citas | approximate | Aplanado a texto legible dentro de notas |

El modo `strict` (predeterminado) detiene la exportación si hay diagnósticos de error. El modo `compatible` permite continuar con salida parcial, siempre que el usuario lo solicite expresamente mediante `--export-mode compatible`; los diagnósticos se emiten por stderr. Las aproximaciones se notifican incluso en modo compatible.

## 4. Integración CLI XMind

```text
xmind-md export <archivo.md|archivo.json> --format xmind [--output <archivo.xmind>] [--export-mode strict|compatible]
```

La CLI valida el IR estructural y semánticamente antes de exportar. Si no se indica `--output`, genera un archivo `.xmind` junto a la entrada (o `map.xmind` para stdin). La salida binaria requiere una ruta de archivo y no se escribe en stdout.

## 5. Adaptador JSON

Implementado en `src/adapters/json/json-adapter.ts`: `serializeIrJson(ir)` serializa el IR validado para inspección, pruebas, intercambio y consumo por herramientas externas. La serialización es determinista, versionada por `irVersion` y no modifica el documento. La validación JSON Schema y semántica se ejecuta antes, en el pipeline.

## 6. Adaptador SVG (AUD-008)

Implementado en `src/adapters/svg/svg-adapter.ts`. Recibe el IR ya validado, no depende del parser y no modifica el documento. Produce un SVG UTF-8 autocontenido, con geometría y orden deterministas para un mismo IR y versión del renderizador.

### Representación visual

| Elemento IR | Estado | Tratamiento |
|---|---|---|
| Hoja, jerarquía y títulos | mapped | Árbol horizontal con conectores curvos, cajas de tamaño calculado y ajuste de líneas |
| Identidad de temas | native | `id` SVG estable y `data-ir-id`/`data-ir-type` |
| Etiquetas y marcadores | mapped | Línea secundaria bajo el título |
| Hipervínculos | mapped | Enlaces relativos y esquemas `http`, `https`, `mailto` y `tel`; se omiten esquemas no permitidos con `SVG_HYPERLINK_OMITTED` |
| Relaciones | mapped | Curvas entre los bordes de los nodos, etiqueta y flechas configurables |
| Boundaries | approximate | Rectángulo envolvente de los temas indicados; si no son contiguos puede incluir temas intermedios |
| Summaries | approximate | Corchete y etiqueta alrededor del rango geométrico |
| Colores, tipografía y formas | mapped | Colores, fuente, tamaño, peso, estilo, decoración, alineación, forma, radio, opacidad y trazos admitidos |
| Padding personalizado | approximate | Se conserva en el IR embebido; se emite `SVG_PADDING_APPROXIMATE` |
| Sombras activadas | unsupported visualmente | Se conservan en el IR; se emite `SVG_SHADOW_NOT_RENDERED` |
| Contenido y notas | mapped semánticamente | Texto accesible en `<desc>` del tema y contenido íntegro en metadatos; no se representa como cuerpo visible del nodo |
| Assets/imágenes | unsupported visualmente | No se dibujan; strict bloquea y compatible continúa con `SVG_ASSETS_NOT_RENDERED`; las referencias permanecen en metadatos |

El SVG raíz incluye `<title>`, `<desc>` y un elemento `<metadata id="xmind-md-ir">` que contiene el IR completo serializado. Los elementos de tema, relación, límite y resumen conservan identificadores y tipo mediante atributos de datos. Esto permite recuperar el IR, pero no reconstruir la sintaxis Markdown original a partir de un SVG convencional.

El diseño utiliza métricas tipográficas aproximadas para calcular cajas y saltos de línea. La geometría del SVG es determinista; la apariencia final de los glifos puede variar según las fuentes instaladas y el motor SVG. Los caracteres incompatibles con XML 1.0 se excluyen del texto visible; el IR original se mantiene en los metadatos JSON escapados.

### Política de exportación

- `strict` (predeterminado): detiene la exportación cuando existen assets que no pueden dibujarse.
- `compatible`: permite el SVG con omisiones visuales diagnosticadas.
- Los diagnósticos del motor de estilos y las aproximaciones de padding/sombras se notifican en stderr.
- Los hipervínculos con esquemas no permitidos se omiten del enlace SVG aunque el IR original se conserve en metadatos.

### Integración CLI SVG

```text
xmind-md export <archivo.md|archivo.json> --format svg [--output <archivo.svg>] [--export-mode strict|compatible]
```

Si se omite `--output`, se genera un `.svg` junto a la entrada (o `map.svg` para stdin). La salida SVG requiere una ruta de archivo y no se escribe en stdout.

## 7. Visor web futuro

El visor consumirá el IR serializado. Se evaluarán bibliotecas según su modelo de datos, licencia, accesibilidad, interacción, rendimiento y compatibilidad con mapas complejos. No se acoplará el IR al modelo de una biblioteca de visualización.

## 8. Validación de XMind

Niveles separados:

1. Validación del IR.
2. Validación del paquete ZIP y JSON interno.
3. Comparación semántica de la estructura exportada.
4. Apertura y guardado en XMind Desktop.
5. Inspección visual con fixtures y pruebas de regresión.

Solo los niveles realmente ejecutados pueden declararse completados. La apertura en XMind Desktop debe indicar versión y resultado.
