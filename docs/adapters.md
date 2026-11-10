# Adaptadores de salida

## 1. Contrato común

Cada adaptador recibe un IR validado/resuelto y devuelve un artefacto más un informe de diagnósticos/capacidades. No interpreta Markdown ni modifica el IR.

## 2. Adaptador XMind

Es el primer destino prioritario. Antes de elegir la implementación se evaluará el SDK oficial JavaScript/TypeScript:

- API pública real y documentación.
- Formatos XMind admitidos y versiones.
- Entorno Node y soporte de navegador, si aplica.
- Cobertura de temas, notas, marcadores, etiquetas, enlaces, relaciones, límites, resúmenes, estilos y recursos.
- Serialización de ZIP y JSON, y capacidad de reimportación.
- Licencia, dependencias transitivas, actividad y mantenimiento.
- Compatibilidad con la versión de XMind Desktop que se use para validar.

Repositorio de referencia: https://github.com/xmindltd/xmind-sdk-js

El SDK es candidato, no una dependencia aprobada por anticipado. Se comparará con generación directa del formato solo si la especificación y las pruebas lo permiten. No se debe confundir la API del SDK con la capacidad completa de XMind Desktop.

## 3. Matriz de capacidades

El adaptador publicará una matriz por entidad/propiedad con estados:
- native
- mapped
- approximate
- unsupported

La exportación no descartará datos sin advertencia. El modo estricto rechazará características estructurales no soportadas. El modo compatible podrá producir salida parcial únicamente con diagnóstico explícito y autorización de configuración.

## 4. Adaptador JSON

Serializa el IR canónico para inspección, pruebas, intercambio y consumo por herramientas externas. Debe ser determinista, versionado y validado con JSON Schema.

## 5. Adaptador SVG

Renderiza el IR como SVG autocontenido o con recursos referenciados según una política documentada. Debe preservar metadatos semánticos (IDs, jerarquía, texto y propiedades recuperables) cuando sea posible.

SVG no es la fuente de verdad. La reconstrucción exacta del Markdown original requiere conservar la fuente original o metadatos suficientes; un SVG gráfico convencional no preserva comentarios, orden de directivas ni sintaxis exacta.

## 6. Visor web futuro

El visor consumirá el IR serializado. Se evaluarán bibliotecas como Markmap u otras según su modelo de datos, licencia, accesibilidad, interacción, rendimiento y compatibilidad con mapas complejos. No se acoplará el IR al modelo de una biblioteca de visualización.

## 7. Validación de XMind

Niveles separados:
1. Validación del IR.
2. Validación del paquete ZIP y JSON interno.
3. Comparación semántica de la estructura exportada.
4. Apertura y guardado en XMind Desktop.
5. Inspección visual con fixtures y pruebas de regresión.

Solo los niveles realmente ejecutados pueden declararse completados. La apertura en XMind Desktop debe indicar versión y resultado.
