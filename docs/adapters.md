# Adaptadores de salida

## 1. Contrato común

Cada adaptador recibe un IR validado/resuelto y devuelve un artefacto más un informe de diagnósticos/capacidades. No interpreta Markdown ni modifica el IR.

## 2. Adaptador XMind

Es el primer destino prioritario. AUD-006 ha evaluado el SDK oficial JavaScript/TypeScript y ha seleccionado una estrategia SDK-first provisional para AUD-007:

- API pública real y documentación.
- Formatos XMind admitidos y versiones.
- Entorno Node y soporte de navegador, si aplica.
- Cobertura de temas, notas, marcadores, etiquetas, enlaces, relaciones, límites, resúmenes, estilos y recursos.
- Serialización de ZIP y JSON, y capacidad de reimportación.
- Licencia, dependencias transitivas, actividad y mantenimiento.
- Compatibilidad con la versión de XMind Desktop que se use para validar.

Repositorio de referencia: https://github.com/xmindltd/xmind-sdk-js

**Decisión AUD-006 (ADR-0001):** utilizar `xmind@2.2.33` como backend provisional del primer exportador, encapsulado detrás del adaptador interno. No añadir la dependencia hasta AUD-007. Fijar versión exacta, no exponer tipos del SDK fuera del adaptador y conservar diagnósticos explícitos de pérdida. No utilizar `Topic.addLabel()` porque su implementación produce un array que el validador del propio paquete rechaza; pasar el campo `labels` como cadena mediante el modelo de tema. El SDK no carga/reimporta archivos `.xmind` desde la versión 2.2.0.\n\nLa prueba aislada `scripts/probe-xmind-sdk.js` y el workflow `.github/workflows/xmind-sdk-probe.yml` verifican generación e inspección ZIP/JSON con Node 24 en Ubuntu y Windows. No se ha probado todavía apertura/guardado en XMind Desktop; esa validación pertenece a AUD-009. No se debe confundir la API del SDK con la compatibilidad completa de XMind Desktop.

## 3. Matriz de capacidades

El adaptador publicará una matriz por entidad/propiedad con estados:
- native
- mapped
- approximate
- unsupported

La exportación no descartará datos sin advertencia. El modo estricto rechazará características estructurales no soportadas. El modo compatible podrá producir salida parcial únicamente con diagnóstico explícito y autorización de configuración.

## 4. Integración CLI XMind\n\n`xmind-md export <archivo.md|archivo.json> --format xmind [--output <archivo.xmind>] [--export-mode strict|compatible]` valida el IR antes de exportar. Si no se indica `--output`, genera un `.xmind` junto al archivo de entrada (o `map.xmind` para stdin). La salida binaria requiere una ruta de archivo; no se escribe en stdout.\n\n## 5. Adaptador JSON

Implementado en `src/adapters/json/json-adapter.ts`: `serializeIrJson(ir)` serializa el IR validado para inspección, pruebas, intercambio y consumo por herramientas externas. La serialización es determinista, versionada por `irVersion` y no modifica el documento. La validación JSON Schema y semántica se ejecuta antes, en el pipeline.

## 6. Adaptador SVG

Renderiza el IR como SVG autocontenido o con recursos referenciados según una política documentada. Debe preservar metadatos semánticos (IDs, jerarquía, texto y propiedades recuperables) cuando sea posible.

SVG no es la fuente de verdad. La reconstrucción exacta del Markdown original requiere conservar la fuente original o metadatos suficientes; un SVG gráfico convencional no preserva comentarios, orden de directivas ni sintaxis exacta.

## 7. Visor web futuro

El visor consumirá el IR serializado. Se evaluarán bibliotecas como Markmap u otras según su modelo de datos, licencia, accesibilidad, interacción, rendimiento y compatibilidad con mapas complejos. No se acoplará el IR al modelo de una biblioteca de visualización.

## 8. Validación de XMind

Niveles separados:
1. Validación del IR.
2. Validación del paquete ZIP y JSON interno.
3. Comparación semántica de la estructura exportada.
4. Apertura y guardado en XMind Desktop.
5. Inspección visual con fixtures y pruebas de regresión.

Solo los niveles realmente ejecutados pueden declararse completados. La apertura en XMind Desktop debe indicar versión y resultado.
