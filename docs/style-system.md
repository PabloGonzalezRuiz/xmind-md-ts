# Sistema de estilos

## 1. Contrato

El IR v1.0.0 conserva declaraciones de estilo en `styleSets` y referencias por elemento. La resolución genera una vista derivada con valores efectivos y procedencia; nunca muta el IR de origen.

## 2. Elementos estilables

Catálogo inicial: `map`, `topic`, `relationship`, `boundary`, `summary` y `textRun`. El tipo del elemento condiciona las propiedades admitidas. Los bloques de contenido no reciben estilo de bloque en v1 salvo el formato inline de los runs.

## 3. Conjuntos

Cada conjunto tiene un ID, defaults, perfiles por rol y estilos con nombre. Puede extender un único conjunto padre. La herencia múltiple queda excluida para evitar conflictos de precedencia difíciles de explicar. Los ciclos y referencias inexistentes son errores.

## 4. Referencias

`style.setId` selecciona conjunto, `style.role` selecciona perfil y `style.styleId` selecciona estilo con nombre. `style.overrides` declara propiedades locales. La referencia al conjunto del mapa puede establecerse en `styleSets`/configuración de hoja; el front matter se normaliza al IR sin inventar un segundo modelo de estilos.

## 5. Precedencia

De menor a mayor prioridad:

1. Defaults del sistema.
2. Defaults de mapa.
3. Defaults del conjunto efectivo.
4. Perfil del rol.
5. Estilo con nombre.
6. Overrides locales del elemento.
7. Formato inline del run, limitado al tramo de texto.

No hay herencia visual del padre al hijo. El contexto del conjunto sí puede propagarse por la jerarquía si no se sustituye explícitamente.

## 6. Fusión

- Objeto + objeto: fusión recursiva por clave.
- Escalar + escalar: gana el valor de mayor prioridad.
- Lista + lista: reemplazo completo.
- Propiedad ausente: conserva el valor previo.
- `null`: reinicia al default del sistema de esa propiedad.
- Tipos incompatibles: error.

La salida de resolución debe incluir valor efectivo y procedencia (capa, elemento y propiedad). Las propiedades neutrales, tipos, unidades, rangos y enums se definirán en un catálogo versionado antes de implementar el motor.

## 7. Adaptadores

Cada adaptador declara `native`, `mapped`, `approximate` o `unsupported` por propiedad y tipo de elemento. En modo estricto, una propiedad requerida no soportada bloquea la exportación. En modo compatible, solo se permite continuar si la pérdida queda registrada.
