# Especificación del modelo intermedio (IR)

## 1. Propósito y estado

El IR es el contrato semántico canónico entre el parser, la validación, la resolución de estilos y los adaptadores. Esta versión define requisitos y entidades previstas; **no constituye todavía un esquema implementado ni una API congelada**. La fase de diseño detallado producirá tipos TypeScript, JSON Schema y fixtures concordantes.

## 2. Invariantes

1. Un documento Markdown representa una hoja.
2. Los temas forman un árbol jerárquico conectado; no se admiten temas flotantes ni huérfanos en la primera versión.
3. Se conserva el orden de temas y bloques.
4. Todo nodo tiene identidad; los IDs explícitos deben poder preservarse.
5. Las referencias internas deben resolverse o producir diagnósticos.
6. El IR no replica sin criterio el JSON de XMind.
7. El IR es serializable a JSON y validable en runtime.
8. El contenido es estructurado, no una cadena indiferenciada.
9. Los datos específicos de un adaptador se encapsulan en extensiones con namespace.
10. La versión del IR se declara en cada documento serializado.

## 3. Entidades previstas

### Document / Map

Metadatos del documento, versión del IR, identidad, título, origen, configuración de hoja y temas raíz.

### Topic

ID, título, rol semántico opcional, hijos ordenados, bloques de contenido, notas, etiquetas, marcadores, enlaces, referencias de estilo y overrides.

### ContentBlock

Unión discriminada inicial prevista:
- paragraph: texto y runs enriquecidos.
- list: elementos y sublistas ordenadas/no ordenadas.
- table: filas, celdas y alineación.
- code: lenguaje y contenido literal.
- quote: bloques de cita.
- image: referencia a asset, texto alternativo y metadatos.
- thematicBreak u otros bloques admitidos por la gramática.

### Relationship

ID, tema origen, tema destino, texto/etiqueta, tipo y propiedades visuales. Las referencias deben apuntar a temas existentes de la misma hoja, salvo que una futura especificación permita explícitamente otro alcance.

### Boundary y Summary

Entidades asociadas a grupos de temas existentes. La gramática debe declarar cómo se identifica el conjunto de temas y el adaptador debe comprobar si puede representarlo.

### StyleReference

Referencia a conjunto, rol y estilo con nombre, además de overrides declarados. Los valores resueltos y su procedencia se mantienen diferenciados de los valores de origen.

### Asset

Referencia lógica a imágenes u otros recursos, separada de la ruta física de origen. Debe definirse una política de rutas, duplicados y empaquetado.

## 4. Extensiones

Las extensiones específicas de formato se guardan bajo namespaces explícitos, por ejemplo `extensions.xmind`. No pueden sobrescribir campos neutrales. El núcleo conserva extensiones desconocidas en modo compatible y las rechaza en modo estricto si así se configura.

## 5. Identificadores

Se recomienda admitir:
- IDs explícitos proporcionados por la fuente.
- IDs derivados deterministas para nodos sin ID explícito.
- Un namespace por documento.
- Diagnóstico de colisiones.
- Independencia del título visible, para que renombrar no cambie necesariamente la identidad.

El algoritmo concreto, la persistencia entre movimientos y el tratamiento de duplicados se decidirán con fixtures antes de congelar el contrato.

## 6. Valores declarados y resueltos

Para estilos y configuración, distinguir:
- valor declarado en la fuente;
- referencia heredada/contextual;
- valor efectivo después de aplicar precedencia;
- procedencia del valor efectivo.

No sobrescribir los datos originales durante la resolución.

## 7. Versionado y validación

El IR serializado incluirá una versión explícita. JSON Schema validará forma y tipos; el validador semántico comprobará reglas que el esquema no puede expresar fácilmente: unicidad de IDs, referencias, jerarquía, alcance de relaciones, ciclos y compatibilidad de elementos.

La estrategia de compatibilidad entre versiones y migraciones se fijará antes de publicar una versión estable.
