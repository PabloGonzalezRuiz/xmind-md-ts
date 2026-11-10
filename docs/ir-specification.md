# Especificación del modelo intermedio (IR)

## 1. Estado y alcance

Esta especificación define el contrato **IR v1.0.0**. Es la fuente normativa para los tipos TypeScript, la validación JSON y los fixtures. El JSON Schema asociado está en `spec/ir-v1.schema.json`; el ejemplo mínimo está en `spec/fixtures/ir-v1-minimal.json`.

Un archivo Markdown produce exactamente un documento IR y una hoja. El contrato es neutral respecto de XMind, SVG y el visor.

## 2. Estructura superior

```text
IrDocument
├── irVersion
├── document
├── sheet
├── assets[]
├── styleSets[]
└── extensions?
```

- `irVersion`: versión semántica exacta del contrato, inicialmente `1.0.0`.
- `document`: identidad y metadatos de la fuente.
- `sheet`: hoja única, raíz del árbol y elementos asociados.
- `assets`: recursos referenciados por ID.
- `styleSets`: conjuntos reutilizables incluidos en el documento.
- `extensions`: datos namespaced de adaptadores.

No se serializan valores calculados de forma que sustituyan los valores de origen. El IR de autoría conserva declaraciones; los resultados de resolución se representan en una estructura derivada en memoria, no sobrescribiendo el documento.

## 3. Hoja y árbol de temas

La hoja contiene un único `rootTopic`. La raíz es obligatoria y no tiene padre. `defaultStyleSetId` selecciona el conjunto de estilos predeterminado de la hoja; si no se declara, se aplican los defaults del sistema. Cada `Topic` contiene:

- `id`: identidad única dentro del documento.
- `title`: texto del encabezado, sin formato Markdown estructural.
- `role`: rol semántico opcional; no equivale al nivel H1–H6.
- `children`: temas hijos en orden de origen.
- `content`: bloques asociados al tema, en orden.
- `notes`: bloques de nota opcionales.
- `labels`, `markers`, `hyperlink`: metadatos semánticos.
- `style`: referencias y overrides declarados.
- `sourcePosition`: ubicación de origen cuando existe.
- `extensions`: extensiones namespaced.

Los temas forman un árbol conectado. No hay nodos flotantes, padres implícitos ni múltiples raíces. El orden de `children` y `content` es significativo. Los hijos no heredan automáticamente la apariencia visual del padre.

## 4. Identidad

Los IDs son cadenas opacas, no se interpretan por prefijos ni se derivan de títulos durante la validación. Deben ser únicos en el ámbito del documento entre temas, hoja, relaciones, boundaries, summaries y assets; el ID del documento pertenece a su propio ámbito.

Política de generación:
1. Un ID declarado explícitamente por el autor se conserva exactamente.
2. Sin ID explícito, el parser genera un ID determinista a partir del namespace del documento y de la ruta estructural del nodo (niveles y ordinales entre hermanos).
3. El generador detecta y diagnostica colisiones; nunca las resuelve silenciosamente.
4. Los IDs derivados son reproducibles para una misma estructura, pero pueden cambiar si se mueve/reordena el nodo o cambia su ruta. No se promete estabilidad frente a refactorizaciones estructurales.
5. Para preservar identidad entre renombrados o movimientos, el autor debe declarar un ID explícito.
6. No se incluyen UUID aleatorios ni timestamps en la identidad.

La sintaxis de IDs explícitos en Markdown se cerrará en la gramática. En v1 se recomienda un formato legible, por ejemplo `{#topic-id}`, sin que el validador del IR imponga ese formato de autoría.

## 5. Bloques de contenido

`contentBlock` es una unión discriminada por `type`:

| Tipo | Campos | Semántica |
|---|---|---|
| `paragraph` | `runs[]` | Texto en secuencia con marcas |
| `list` | `ordered`, `start?`, `items[]` | Lista anidada; cada elemento contiene bloques |
| `table` | `rows[]`, `alignments[]?` | Filas/celdas con bloques; la primera fila no se presupone cabecera |
| `code` | `language?`, `value` | Código literal, sin interpretación |
| `quote` | `blocks[]` | Bloques citados |
| `image` | `assetId`, `alt`, `title?` | Referencia lógica a un recurso |
| `thematicBreak` | — | Separador semántico |

Un `TextRun` contiene `text`, marcas opcionales (`strong`, `emphasis`, `strike`, `inlineCode`), enlace opcional y estilo inline opcional. Se conserva el orden de runs. Los adaptadores pueden aplanar o aproximar formatos solo si registran la pérdida.

Las tablas tienen filas y celdas explícitas. La alineación, cuando se declara, corresponde por posición a las columnas. La semántica de cabecera y los spans no forman parte de v1; se aplazan para evitar una interpretación ambigua de extensiones Markdown.

## 6. Notas, relaciones, límites y resúmenes

- Las notas son bloques de contenido asociados a un tema; no son temas hijos.
- Una relación conecta `sourceTopicId` con `targetTopicId`; ambos deben existir y ser distintos. No altera el árbol.
- Un boundary agrupa uno o más IDs de tema existentes, sin reparentar ni duplicar nodos.
- Un summary agrupa uno o más IDs de tema existentes y puede tener etiqueta/estilo. No crea un tema adicional en el árbol.
- El orden de las referencias en `topicIds` es el orden visual/de origen pretendido.
- La validación comprueba unicidad de IDs, referencias existentes y ausencia de autorreferencias. Restricciones geométricas o de contigüidad corresponden a la gramática/adaptador y se documentarán donde proceda.

## 7. Estilos

Una referencia de estilo puede declarar `setId`, `role`, `styleId` y `overrides`. Un `StyleSet` contiene `id`, herencia opcional mediante un único `extends`, `defaults`, perfiles `roles` y estilos con nombre `styles`.

En v1, el esquema valida la forma de las propiedades de estilo como valores JSON, pero el catálogo tipado de propiedades, unidades, rangos y compatibilidad por tipo de elemento se valida semánticamente en el motor de estilos. No se aceptan ciclos ni referencias inexistentes en `extends` o en referencias de estilo.

La precedencia normativa (de menor a mayor) es: defaults del sistema, defaults de mapa, defaults del conjunto efectivo, perfil del rol, estilo con nombre, overrides locales y formato inline de runs. El valor `null` reinicia la propiedad al default de esa propiedad; no significa borrar la clave. Las listas se reemplazan completas; los objetos se fusionan recursivamente; los escalares usan el valor de mayor prioridad. Se conserva procedencia por propiedad.

## 8. Recursos (assets)

Un asset tiene ID único, URI y metadatos opcionales `mediaType`, `alt` y `title`. La URI se interpreta respecto del archivo fuente cuando es relativa. No se incrustan bytes en el IR. El empaquetado, normalización de rutas, prevención de traversal, deduplicación y copia al destino son responsabilidad del pipeline de assets y deben validarse antes de exportar.

Cada bloque de imagen referencia un `assetId` existente. Una URI externa puede conservarse en la fuente; los adaptadores decidirán si la admiten, descargan o rechazan, según política explícita.

## 9. Extensiones

Las extensiones son objetos bajo namespaces en minúsculas, por ejemplo `xmind`. El núcleo no interpreta ni permite que una extensión sobrescriba campos estándar. Las extensiones desconocidas se conservan en modo compatible. En modo estricto, la política de rechazo se aplica a extensiones no registradas por el consumidor; el modo no altera la validación de campos del núcleo.

## 10. Validación

JSON Schema valida tipos, campos obligatorios, uniones discriminadas y restricciones locales. Un validador semántico adicional debe comprobar:

- unicidad global de IDs de entidades dentro del ámbito del documento;
- IDs explícitos no vacíos y sin espacios;
- referencias de imagen a assets existentes;
- relaciones entre temas existentes y distintos;
- referencias de boundary/summary a temas existentes;
- referencias y ciclos de conjuntos de estilos;
- referencias de roles/estilos;
- alineaciones de tabla compatibles con el número de columnas;
- validez de URI y restricciones de rutas de assets;
- límites de profundidad/tamaño configurables para entradas no confiables.

El esquema no pretende sustituir estas reglas semánticas.

## 11. Versionado y compatibilidad

La versión `1.0.0` identifica este contrato. Cambios aditivos compatibles incrementan minor; correcciones sin cambio semántico incrementan patch; cambios incompatibles incrementan major. Un consumidor debe rechazar versiones major desconocidas. Las migraciones entre major serán funciones explícitas y probadas; nunca se reinterpreta un documento silenciosamente.

El archivo Schema lleva su propio `$id` y `$schema`. La versión del contrato y la versión del paquete npm son independientes. Los tipos TypeScript se derivarán del esquema o se comprobarán automáticamente contra él; no se mantendrán dos definiciones divergentes a mano.

## 12. Exclusiones explícitas de v1

- Varias hojas por archivo.
- Temas flotantes o huérfanos.
- Celdas de tabla con colspan/rowspan y cabeceras complejas.
- Texto enriquecido arbitrario embebido en títulos.
- Adjuntos binarios inline.
- Herencia visual automática desde tema padre.
- IDs derivados garantizados frente a movimientos/renombrados.
- Semántica específica de XMind en el núcleo.

Estas exclusiones podrán revisarse mediante una decisión registrada y una nueva versión del contrato.
