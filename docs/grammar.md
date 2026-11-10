# Gramática Markdown enriquecida

## 1. Objetivo

La fuente debe seguir siendo Markdown legible y editable. Las extensiones deben ser explícitas, acotadas y documentadas, sin convertir el documento en un lenguaje propietario difícil de mantener.

Esta gramática es una propuesta inicial para validación en la fase de especificación; las reglas marcadas como propuestas no deben implementarse hasta cerrar sus casos límite y pruebas.

## 2. Regla de hoja y jerarquía

- Un archivo Markdown produce una hoja.
- El primer encabezado de nivel 1 identifica el tema raíz de la hoja.
- Los encabezados de nivel 2 a 6 crean descendientes según nivel y orden.
- Los saltos de nivel se validan conforme a una regla explícita; no se inventan padres implícitos sin documentarlo.
- Los temas siempre pertenecen al árbol. No se admiten temas flotantes ni huérfanos en la primera versión.

## 3. Front matter

Se propone YAML front matter para metadatos del documento, por ejemplo título, ID, orientación, conjunto de estilos predeterminado y opciones de exportación. Las claves permitidas y sus tipos se definirán junto al IR. El front matter no puede duplicar ni contradecir metadatos sin una regla de precedencia explícita.

## 4. Directivas

Bloques propuestos:

- `:::xmind`: configuración del mapa o del tema, según ubicación.
- `:::xmind-note`: nota asociada al tema.
- `:::xmind-relationship`: relación entre temas por ID/referencia.
- `:::xmind-boundary`: límite que agrupa temas.
- `:::xmind-summary`: resumen asociado a temas.
- `@conjunto(NOMBRE)`: selección de conjunto de estilos, si se conserva la compatibilidad.
- `@estilo(NOMBRE)`: selección de estilo con nombre, si se conserva la compatibilidad.

La especificación final definirá ámbito, ubicación, multiplicidad, cierre, anidamiento, escape y comportamiento ante directivas desconocidas.

## 5. Contenido estructurado

Los bloques Markdown se conservan semánticamente: párrafos, runs, listas anidadas, tablas, código, citas e imágenes. No se aplanarán a texto plano en el IR. Cada adaptador decide cómo representarlos y declara las pérdidas o aproximaciones.

## 6. Identidad y referencias

La sintaxis de IDs explícitos y las referencias entre temas debe ser inequívoca. Las relaciones, boundaries y summaries no pueden depender de títulos visibles que puedan repetirse o cambiar. Se prefiere referenciar IDs estables.

## 7. Texto literal y errores

Debe existir una forma documentada de incluir texto que parezca una directiva sin ejecutarla. Las directivas mal formadas, desconocidas o fuera de ámbito generan diagnósticos con ubicación. No se ignoran silenciosamente.

## 8. Ejemplo conceptual

```md
---
id: constitucion
title: Constitución Española
style_set: TAI_LEGISLACION
---

# Constitución Española

## Título preliminar

:::xmind
style: concepto_importante
:::
### Artículo 1

España se constituye en un Estado social y democrático de Derecho.

:::xmind-note
Contenido de la nota del tema.
:::
```

Este ejemplo ilustra la dirección del diseño; no certifica que toda la sintaxis esté ya implementada.
