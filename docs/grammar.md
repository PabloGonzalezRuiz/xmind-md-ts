# Gramática Markdown enriquecida

## 1. Estado

Esta gramática implementa la superficie de autoría que alimenta el IR v1.0.0. El IR es normativo para la estructura resultante; este documento define cómo se expresa en Markdown. Los ejemplos ilustran sintaxis, pero no sustituyen las pruebas de conformidad.

## 2. Archivo y raíz

- Un archivo produce un documento y una hoja.
- Debe existir exactamente un encabezado H1; es el tema raíz.
- H2–H6 crean descendientes según el encabezado anterior compatible.
- No se admiten saltos que dejen un nivel sin padre (por ejemplo H2 seguido directamente de H4). Se emite error con ubicación; no se sintetizan nodos.
- Un segundo H1 es error. No se fusionan raíces ni se generan hojas adicionales.
- El contenido Markdown posterior a un encabezado pertenece al tema abierto hasta el siguiente encabezado de nivel igual o superior.

## 3. IDs explícitos

Se propone la forma `{#identificador}` al final del texto de encabezado. El identificador debe ser único, no vacío y sin espacios. Se elimina del título visible y se conserva como ID. En ausencia de ID, el parser deriva uno determinista de la ruta estructural; véase `docs/ir-specification.md`.

Los IDs de entidades no temáticas (relaciones, límites, resúmenes y assets) se declaran en sus respectivas directivas.

## 4. Front matter YAML

El front matter se sitúa al principio del archivo y solo puede aparecer una vez. Claves v1:

| Clave | Tipo | Significado |
|---|---|---|
| `id` | string | ID del documento |
| `title` | string | Título del documento/hoja; por defecto el H1 |
| `style_set` | string | Conjunto de estilos por defecto |
| `settings` | object | Ajustes neutrales de hoja definidos por el esquema |

Claves desconocidas producen advertencia en modo compatible y error en modo estricto. Una clave no puede contradecir otra fuente de metadatos sin regla definida: `title` del front matter prevalece sobre el título del H1 para el documento y la hoja, pero no cambia el título del tema raíz. `id` identifica el documento, no el tema raíz.

## 5. Bloques Markdown

El parser conserva semánticamente:
- párrafos y runs con negrita, cursiva, tachado, código inline y enlaces;
- listas ordenadas/no ordenadas y anidamiento;
- tablas y alineación por columna;
- bloques de código y lenguaje declarado;
- citas;
- imágenes mediante assets;
- separadores temáticos.

HTML arbitrario, footnotes, definiciones de referencia no resueltas, matemática y extensiones de terceros quedan fuera de v1: error o advertencia según modo, nunca descarte silencioso. Los bloques de contenido se asignan al tema vigente; listas y citas pueden contener bloques anidados según el IR.

## 6. Directivas

Las directivas son bloques fenced con nombre y cierre explícito. No se permite anidamiento de directivas v1. Los atributos se expresan como YAML restringido y validado.

- `:::xmind`: propiedades de mapa o del tema donde aparece.
- `:::xmind-note`: contenido de nota del tema vigente.
- `:::xmind-relationship`: relación con `id`, `from`, `to`, y atributos opcionales `label`, `kind`, `style`.
- `:::xmind-boundary`: boundary con `id`, `topics` (lista de IDs) y opcional `label`, `style`.
- `:::xmind-summary`: summary con `id`, `topics` (lista de IDs) y opcional `label`, `style`.

Las directivas de relación, boundary y summary se permiten en el ámbito del documento, fuera del contenido de un tema; deben referenciar IDs existentes. Las directivas de configuración y nota se permiten dentro del ámbito del tema. La forma exacta del bloque se fija mediante parser fixtures en la fase 4.

## 7. Estilos

El front matter `style_set` selecciona el conjunto por defecto. La configuración de tema puede declarar `role`, `style` y `overrides`. Los nombres de propiedades pertenecen al catálogo neutral. Los estilos no se aplican por inferencia del título ni del nivel de encabezado.

Las notaciones inline `@conjunto(...)` y `@estilo(...)` no se incluyen en la sintaxis v1 inicial: se aplazan hasta que exista una necesidad demostrada y una regla inequívoca de ámbito.

## 8. Escape y errores

El texto que parezca una directiva se escribe dentro de un bloque de código o se escapa conforme a las reglas Markdown del parser. Una directiva mal formada, desconocida o fuera de ámbito produce diagnóstico con código estable y ubicación. No se ignora silenciosamente.

## 9. Ejemplo

```md
---
id: doc:constitucion
title: Constitución Española
style_set: TAI_LEGISLACION
---

# Constitución Española {#topic:constitucion}

## Título preliminar {#titulo-preliminar}

:::xmind
role: main
style: concepto_importante
:::

### Artículo 1 {#articulo-1}

España se constituye en un Estado social y democrático de Derecho.

:::xmind-note
Contenido de la nota del tema.
:::
```

La sintaxis de ejemplo queda sujeta a pruebas del parser; el IR resultante debe cumplir íntegramente `spec/ir-v1.schema.json` y las reglas semánticas.
