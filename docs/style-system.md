# Sistema de estilos

## 1. Objetivo

Ofrecer un sistema declarativo, reutilizable y neutral respecto del adaptador. Las propiedades se expresan con nombres canónicos estables; las etiquetas de interfaz en español pueden mantenerse en un diccionario separado.

## 2. Elementos estilables

Catálogo inicial previsto:
- map
- topic
- branch
- relationship
- boundary
- summary
- summary_topic
- callout
- content_block (solo si un destino puede representarlo de forma coherente)

Cada estilo declara a qué tipo de elemento se aplica. Una incompatibilidad debe producir error.

## 3. Conjuntos completos

Un conjunto representa una apariencia coherente, no una simple colección de colores. Puede incluir defaults, perfiles por rol y estilos con nombre. Puede extender un único conjunto padre. Los ciclos y referencias inexistentes son errores.

## 4. Roles

Roles semánticos previstos: root, main, subtopic, emphasis, note y otros que se justifiquen. No se debe confundir el rol semántico con el nivel de encabezado Markdown.

## 5. Precedencia

De menor a mayor prioridad:

1. Defaults del sistema.
2. Defaults del mapa.
3. Propiedades base del conjunto efectivo.
4. Perfil del rol.
5. Estilo con nombre.
6. Overrides locales del elemento.
7. Formato de runs, limitado al tramo de texto correspondiente.

El tema padre no transmite automáticamente su apariencia visual a los hijos. El contexto del conjunto sí puede heredarse según las reglas de la gramática.

## 6. Fusión

- Mapping + mapping: fusión recursiva por clave.
- Escalar + escalar: gana el valor de mayor prioridad.
- Lista + lista: reemplazo completo por la lista de mayor prioridad.
- Propiedad ausente: conserva el valor anterior.
- `null`: reinicio al default definido para esa propiedad, no eliminación ambigua.
- Tipos incompatibles: error.

La resolución conserva la procedencia de cada valor.

## 7. Catálogo y extensibilidad

El catálogo neutral incluirá progresivamente tipografía, texto, forma, relleno, borde, líneas, espaciado, dimensiones, fondo y efectos. Unidades, rangos y enums se definirán por propiedad.

Las propiedades propietarias se encapsulan en extensiones del adaptador. No se presentan como universales.

## 8. Capacidades de adaptador

Cada adaptador declara por propiedad:
- native: soporte directo.
- mapped: conversión equivalente documentada.
- approximate: aproximación con advertencia.
- unsupported: no representable.

En modo estricto, una propiedad requerida no soportada impide exportar. En modo compatible, solo se permite continuar si la pérdida queda registrada explícitamente.

## 9. Criterios de aceptación

Pruebas para fusión recursiva, sustitución de listas, reinicio null, herencia de conjuntos, cambio de conjunto por rama, ciclos, roles, estilos globales/locales, overrides, runs, tipo de elemento, validación de rangos, capacidades y determinismo.
