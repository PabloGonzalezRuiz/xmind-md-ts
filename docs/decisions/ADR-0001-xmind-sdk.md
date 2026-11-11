# ADR-0001: estrategia de integración del SDK oficial XMind

- **Estado:** Aceptada provisionalmente para AUD-007
- **Fecha:** 2026-11-11
- **Tarea:** AUD-006
- **Candidato:** paquete npm `xmind@2.2.33`
- **Repositorio:** https://github.com/xmindltd/xmind-sdk-js

## Contexto

El proyecto necesita convertir el IR neutral a un paquete `.xmind` sin acoplar el modelo de dominio a una biblioteca externa. El SDK oficial es un candidato natural, pero su antigüedad, cobertura y compatibilidad deben medirse antes de incorporarlo.

## Evidencia

- La versión publicada más reciente observada es `2.2.33`, publicada el 29-09-2023. El último commit del repositorio observado es de 13-06-2024.
- Licencia MIT.
- La documentación declara soporte para Node.js en Linux y Windows; el soporte de navegador está marcado como incompleto.
- El paquete expone `Workbook`, `Topic`, `Marker` y `Zipper`. El modelo admite jerarquía, notas, marcadores, etiquetas, imágenes, hipervínculos, resúmenes, límites, relaciones y datos de estilo, aunque varias capacidades avanzadas requieren acceder al modelo de bajo nivel.
- El paquete genera un ZIP `.xmind` con `content.json`, `metadata.json`, `manifest.json`, `content.xml` y, cuando procede, recursos.
- El SDK eliminó la carga de archivos XMind existentes en la versión 2.2.0; no debe considerarse un lector ni una solución de round-trip.
- Dependencias de ejecución declaradas: `ajv` 6, `debug`, `iconv-lite`, `jszip` 3, `tree-model`, `uuid` 3 y `xmind-model` 1.1.12. La cadena de dependencias es antigua y exige fijación de versión y vigilancia.
- La prueba aislada ejecutada con Node `v24.22.2` pasó en Ubuntu y Windows. Se comprobó interoperabilidad CommonJS desde ESM mediante `createRequire`, validación del workbook, creación del ZIP y lectura de los ficheros JSON internos.

## Defecto observado

`Topic.addLabel()` termina escribiendo un array en `labels`, pero el schema de `xmind-model` exige una cadena. El propio `Workbook.validate()` rechaza el workbook después de llamar a ese helper. El campo `labels` como cadena, pasado directamente al modelo de tema, sí supera la validación y queda en el `content.json` generado.

No se utilizará `addLabel()` en el adaptador. Se mantendrá una prueba de regresión para evitar introducir el defecto.

## Matriz de capacidades y limitaciones

| Capacidad | Resultado de la evaluación |
|---|---|
| Hojas y jerarquía de temas | API de alto nivel disponible |
| Notas | Texto plano mediante helper; modelo interno con estructura HTML |
| Marcadores | API disponible, con grupos y nombres predefinidos |
| Etiquetas | Campo de modelo utilizable; helper oficial defectuoso |
| Hipervínculos | Campo de modelo `href` |
| Imágenes | API disponible; requiere insertar bytes en recursos y manifest |
| Resúmenes | API disponible; rango entre hermanos |
| Límites | Modelo de bajo nivel con rango |
| Relaciones | API de bajo nivel `Sheet.addRelationship`; requiere puntos de control |
| Estilos | Tres temas predefinidos y estructura de estilo de bajo nivel |
| Listas, tablas, código y citas del IR | Sin mapeo directo de alto nivel; requiere conversión explícita o diagnóstico |

## Decisión

Adoptar una estrategia **SDK-first provisional** para AUD-007:

1. Utilizar `xmind@2.2.33` como backend del primer exportador, sujeto a la validación posterior en XMind Desktop.
2. Añadirlo como dependencia solo al iniciar AUD-007 y fijar la versión exacta.
3. Encapsular todas las llamadas en el adaptador XMind. No exponer tipos del SDK en el parser, IR, CLI ni API pública.
4. Validar el IR antes de mapearlo y el workbook antes de guardar.
5. Mantener una matriz de capacidades y diagnósticos por propiedad.
6. No llamar a `Topic.addLabel()`; asignar `labels` como cadena mediante el modelo.
7. No prometer importación ni round-trip: el SDK no carga archivos XMind existentes.
8. Reconsiderar generación directa del paquete solo si la prueba Desktop o la cobertura real revelan bloqueos no resolubles mediante el adaptador.

## Riesgos y condiciones pendientes

- El paquete no recibe actualizaciones frecuentes; fijar versión y ejecutar CI de compatibilidad.
- La prueba técnica valida el ZIP y el JSON interno, no la apertura/guardado en XMind Desktop.
- No se ha demostrado fidelidad visual ni compatibilidad con todas las versiones de XMind Desktop.
- Las estructuras de contenido del IR (listas, tablas, código, citas y runs) requieren una política explícita de mapeo o rechazo.
- Las relaciones y límites requieren validar rangos, IDs y puntos de control.

## Evidencia reproducible

- Script: `scripts/probe-xmind-sdk.js`
- Workflow: `.github/workflows/xmind-sdk-probe.yml`
- Prueba SDK: https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42982529970
- CI general: https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42982530041
- Documentación oficial: https://github.com/xmindltd/xmind-sdk-js
- Release: https://github.com/xmindltd/xmind-sdk-js/releases/tag/v2.2.33
- Paquete npm: https://www.npmjs.com/package/xmind
