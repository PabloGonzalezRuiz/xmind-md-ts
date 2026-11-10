# Sistema de estilos

## 1. Contrato y API

El IR v1.0.0 conserva declaraciones de estilo. El motor genera una vista derivada con valores efectivos y procedencia; nunca modifica el IR de origen.

La API pública es `resolveIrStyles(ir)`, exportada desde `src/index.ts`. Devuelve:
- `styles[]`: un resultado por mapa, tema, relación, boundary, summary y run de texto.
- `diagnostics[]`: propiedades desconocidas, no aplicables o con valores inválidos.

Cada resultado contiene `elementId`, `elementType`, `values` y `provenance`. La procedencia identifica la capa y el origen que aportó el valor de cada propiedad.

## 2. Elementos estilables

Catálogo v1:
- `map`
- `topic`
- `relationship`
- `boundary`
- `summary`
- `textRun`

No hay estilos de bloque para párrafos, listas, tablas, citas o código. Los runs sí pueden declarar formato inline.

## 3. Catálogo tipado v1

El catálogo ejecutable está en `src/styles/catalog.ts`. Cada propiedad define tipos admitidos, elementos compatibles, valor por defecto y, cuando procede, rango o enumeración.

| Propiedad | Elementos | Tipo / restricciones |
|---|---|---|
| `backgroundColor` | map, topic, boundary, textRun | color CSS |
| `color` | topic, relationship, boundary, summary, textRun | color CSS |
| `fill` | topic, boundary | color CSS |
| `stroke` | topic, relationship, boundary, summary | color CSS |
| `fontFamily` | topic, textRun | cadena no vacía |
| `fontSize` | topic, textRun | longitud 1–256 |
| `fontWeight` | topic, textRun | normal, bold o 100–900 |
| `fontStyle` | topic, textRun | normal, italic, oblique |
| `textDecoration` | topic, textRun | none, underline, line-through |
| `textAlign` | topic, textRun | left, center, right |
| `opacity` | map, topic, boundary | número 0–1 |
| `strokeWidth` | topic, relationship, boundary, summary | número 0–32 |
| `lineStyle` | relationship, boundary, summary | solid, dashed, dotted |
| `shape` | topic | rectangle, rounded-rectangle, ellipse, diamond |
| `padding` | topic | longitud 0–256 |
| `borderRadius` | topic, boundary | longitud 0–256 |
| `shadow` | topic, boundary | objeto JSON fusionado recursivamente |

Las longitudes admiten números o cadenas con unidades `px`, `pt`, `em`, `rem` y `%`. Los colores admiten hexadecimal, nombres CSS y funciones rgb/rgba/hsl/hsla. Las propiedades y sus rangos son deliberadamente neutrales; los adaptadores traducirán o declararán pérdidas.

Una propiedad desconocida, no compatible con el tipo de elemento o con un valor fuera de rango genera un diagnóstico. El motor no descarta silenciosamente una declaración explícita inválida.

## 4. Conjuntos y contexto efectivo

Un `StyleSet` contiene `defaults`, perfiles `roles`, estilos con nombre `styles` y un único padre `extends`. La cadena de herencia se resuelve de ancestro a descendiente. Dentro de una misma capa, el conjunto descendiente prevalece sobre el ancestro.

El conjunto efectivo de un tema se determina así:
1. `topic.style.setId`, si se declara.
2. El conjunto efectivo del tema padre.
3. `sheet.defaultStyleSetId`.

El contexto de conjunto se propaga a los temas hijos, pero no se heredan propiedades visuales del tema padre. Relaciones, boundaries y summaries parten del conjunto predeterminado de la hoja. El mapa también utiliza ese conjunto.

Los defaults de conjunto son compartidos y solo se aplican a las propiedades del catálogo compatibles con el elemento concreto. Una referencia explícita a un rol o estilo con propiedades incompatibles produce diagnóstico.

## 5. Defaults de mapa

Los defaults específicos del mapa se declaran en `sheet.settings.styleDefaults`, agrupados por tipo de elemento:

```json
{
  "styleDefaults": {
    "map": { "backgroundColor": "#FFFFFF" },
    "topic": { "fontFamily": "Arial", "fontSize": 14 },
    "textRun": { "color": "#334155" }
  }
}
```

Cada bloque de propiedades se aplica solo a su tipo de elemento. Estos valores tienen más prioridad que los defaults del sistema y menos que los defaults del conjunto.

## 6. Precedencia

De menor a mayor prioridad:
1. Defaults del sistema.
2. Defaults de mapa.
3. Defaults de conjuntos heredados (ancestro → descendiente).
4. Perfiles del rol (ancestro → descendiente).
5. Estilos con nombre (ancestro → descendiente).
6. Overrides locales del elemento.
7. Formato inline del run.

El formato de un run se limita a ese tramo de texto. El estilo del tema se utiliza como base tipográfica del run; el estilo inline del run prevalece.

## 7. Fusión y reinicio

- Objeto + objeto: fusión recursiva por clave.
- Escalar + escalar: gana el valor de mayor prioridad.
- Lista + lista: reemplazo completo.
- Propiedad ausente: conserva el valor previo.
- `null`: reinicia la propiedad al default del sistema.
- Un valor incompatible con el tipo/rango de catálogo genera diagnóstico y no sustituye el último valor válido.

La procedencia se conserva por propiedad, incluso al fusionar objetos. Un reinicio registra la capa `system` y el origen que solicitó el reinicio.

## 8. Adaptadores

Cada adaptador declara `native`, `mapped`, `approximate` o `unsupported` por propiedad y tipo de elemento. En modo estricto, una propiedad requerida no soportada bloquea la exportación. En modo compatible, solo se permite continuar si la pérdida queda registrada.
