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

## 6. Adaptador SVG

Renderiza el IR como SVG autocontenido o con recursos referenciados según una política documentada. Debe preservar metadatos semánticos (IDs, jerarquía, texto y propiedades recuperables) cuando sea posible.

SVG no es la fuente de verdad. La reconstrucción exacta del Markdown original requiere conservar la fuente original o metadatos suficientes; un SVG gráfico convencional no preserva comentarios, orden de directivas ni sintaxis exacta.

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
