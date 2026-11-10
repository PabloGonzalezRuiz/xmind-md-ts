# Calidad, pruebas y diagnóstico

## 1. Objetivo

El sistema debe ser verificable por personas y por herramientas de IA. El compilador TypeScript, el linter, las pruebas y los fixtures actúan como controles independientes; ninguno sustituye a los demás.

## 2. Puertas de calidad

Cada cambio debe superar, según el alcance:
1. Formato Prettier.
2. ESLint.
3. Comprobación TypeScript sin emitir archivos.
4. Pruebas unitarias.
5. Pruebas de integración.
6. Build.
7. Validación de JSON Schema y reglas semánticas.
8. Pruebas de adaptador y fixtures.
9. Pruebas de navegador si afecta al visor.

Los comandos definitivos se establecerán en package.json durante la implementación.

## 3. Tipado estricto

Configurar TypeScript en modo estricto y evaluar además:
- noUncheckedIndexedAccess
- exactOptionalPropertyTypes
- noImplicitOverride
- useUnknownInCatchVariables

Evitar any. Los datos externos se reciben como unknown, se validan en runtime y después se estrechan a tipos internos.

## 4. Pruebas por capas

- Parser: gramática válida, inválida, ubicación y escapes.
- IR: invariantes, serialización, esquema y versionado.
- Validación: IDs, referencias, jerarquía y ciclos.
- Estilos: cascada, herencia, overrides y procedencia.
- Adaptadores: salida, capacidades, pérdidas y errores.
- CLI: códigos de salida, rutas, opciones y ejecución en Windows/Linux.
- Visor: interacción, accesibilidad, navegación y mapas grandes.

## 5. Corpus de referencia

Mantener fixtures pequeños, independientes y legibles:
- mapa mínimo.
- jerarquía profunda.
- contenido estructurado.
- estilos y conjuntos.
- notas, etiquetas y marcadores.
- relaciones.
- boundaries y summaries.
- recursos e imágenes.
- mapa de características combinadas.
- entradas inválidas.

Conservar mapas creados manualmente en XMind como corpus de referencia cuando sea posible. Comparar estructura semántica y propiedades, no bytes completos del ZIP, ya que pueden variar metadatos y orden de empaquetado.

## 6. Pruebas de conformidad entre lenguajes

Los casos de entrada y resultados esperados deben ser independientes de la implementación. Si se compara con el proyecto Python, ambos motores deben consumir los mismos fixtures y producir IR equivalentes conforme a la especificación; no se debe tomar automáticamente la salida de uno como verdad del otro.

## 7. Diagnóstico

Cada diagnóstico tendrá código estable, severidad, mensaje, archivo/ubicación si existe y contexto útil. Los logs de CLI serán legibles y podrán ofrecer modo detallado. Los artefactos de CI deben incluir informes y salidas de prueba cuando ayuden a reproducir fallos.

## 8. Política de afirmaciones

Distinguir siempre:
- typecheck correcto;
- lint correcto;
- tests ejecutados;
- build generado;
- paquete XMind estructuralmente válido;
- archivo abierto en XMind Desktop;
- fidelidad visual verificada.

No afirmar un nivel a partir de otro.
