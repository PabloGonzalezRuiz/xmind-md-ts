# Gramática Markdown enriquecida

## 1. Estado

Esta gramática implementa la superficie de autoría que alimenta el IR v1.0.0. El IR es normativo para la estructura resultante. El parser usa CommonMark + GFM y las extensiones YAML front matter y directivas de contenedor.

## 2. Archivo y raíz

- Un archivo produce un documento y una hoja.
- Debe existir exactamente un encabezado H1; es el tema raíz.
- H2–H6 crean descendientes según el encabezado anterior compatible.
- No se admiten saltos que dejen un nivel sin padre (por ejemplo H2 seguido directamente de H4).
- Un segundo H1 es error.
- El contenido posterior a un encabezado pertenece al tema abierto hasta el siguiente encabezado de nivel igual o superior.
- No se admite contenido antes del H1, salvo el front matter.

## 3. IDs explícitos

La forma `{#identificador}` al final del texto de encabezado declara el ID del tema. El identificador debe ser único, no vacío y sin espacios. Se elimina del título visible y se conserva como ID. Sin ID explícito, el parser genera un ID determinista a partir de la ruta estructural y el ordinal entre hermanos. La validación global de identidad corresponde a la fase 5.

## 4. Front matter YAML

El front matter se sitúa al principio del archivo y solo puede aparecer una vez. Claves v1:

| Clave | Tipo | Significado |
|---|---|---|
| `id` | string | ID del documento |
| `title` | string | Título del documento/hoja; por defecto el H1 |
| `style_set` | string | Conjunto de estilos por defecto |
| `settings` | object | Ajustes neutrales de hoja |

Claves desconocidas producen advertencia en modo compatible y error en modo estricto. `title` prevalece para el documento y la hoja, pero no cambia el título del tema raíz. `id` identifica el documento.

## 5. Bloques Markdown

Se conservan párrafos y runs (negrita, cursiva, tachado, código inline y enlaces), listas anidadas, tablas GFM y alineación, bloques de código, citas, imágenes mediante assets y separadores temáticos. Las imágenes repetidas con la misma URI comparten asset.

HTML arbitrario, footnotes y matemática quedan fuera de v1: se emite diagnóstico de advertencia en modo compatible. No se garantiza la conservación de extensiones Markdown no enumeradas. Los bloques de contenido se asignan al tema vigente.

## 6. Directivas

Las directivas son bloques de contenedor con cierre explícito. No se permite anidamiento de directivas v1. El cuerpo de configuración es YAML:

```md
:::xmind
role: main
style: concepto_importante
style_set: TAI_LEGISLACION
overrides:
  fill: "#fff2cc"
:::
```

- `:::xmind`: configuración del tema vigente. Admite `role`, `style`, `style_set` y `overrides`.
- `:::xmind-note`: bloques Markdown que se asignan a las notas del tema vigente; no es YAML.
- `:::xmind-relationship`: objeto YAML con `id`, `from`, `to` y opcionales `label`, `kind`, `role`, `style`, `style_set`, `overrides`.
- `:::xmind-boundary` y `:::xmind-summary`: objeto YAML con `id`, `topics` (lista de IDs) y opcionales `label`, `role`, `style`, `style_set`, `overrides`.

Las directivas de relación, boundary y summary se almacenan a nivel de hoja. La comprobación de referencias a temas existentes corresponde a la fase 5. Las directivas desconocidas o mal formadas producen error con código y ubicación.

## 7. Estilos

El front matter `style_set` selecciona el conjunto predeterminado. La configuración de tema puede declarar `role`, `style` y `overrides`. El parser conserva declaraciones; no resuelve estilos ni infiere apariencia por título o nivel.

## 8. Errores y diagnósticos

Los errores estructurales lanzan `MarkdownParseError`, con código estable y ubicación cuando existe. `parseMarkdownWithDiagnostics` devuelve advertencias compatibles junto al IR. El modo estricto convierte las claves desconocidas del front matter en errores. No se descarta silenciosamente contenido fuera del subconjunto soportado.

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

El IR resultante debe cumplir `spec/ir-v1.schema.json`. La validación semántica completa se realiza en la fase 5.
