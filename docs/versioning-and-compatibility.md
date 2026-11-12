# Política de versionado y compatibilidad

**Estado:** política aprobada para el contrato actual  
**Paquete:** `xmind-md-ts 0.1.0`  
**IR admitido:** `1.0.0`  
**Ámbito:** rama `feature/aud-003-runtime-schema`

## 1. Dos ciclos de versión independientes

El número de versión del paquete identifica el compilador, la CLI y su distribución. `irVersion` identifica el contrato de datos serializado. Una nueva versión del compilador no implica necesariamente una nueva versión del IR, y una nueva versión del IR no obliga a publicar inmediatamente una versión estable del paquete.

### Paquete

- Mientras el paquete esté en `0.y.z`, no se declara estabilidad pública del API. Se usa patch para correcciones compatibles y minor para nuevas capacidades o cambios incompatibles durante el desarrollo inicial.
- Desde `1.0.0`, se aplica SemVer: patch para correcciones compatibles, minor para funcionalidad compatible y major para cambios incompatibles del API/CLI público.
- Los tags de publicación deben coincidir exactamente con `package.json` (prefijo `v` en el tag, por ejemplo `v0.1.0`).
- No se cambia la versión por una actualización puramente documental que no altere el paquete distribuido.

### Contrato IR

- La única versión admitida actualmente es exactamente `1.0.0`.
- No se considera automáticamente compatible una versión patch, minor o major diferente.
- Patch queda reservado a correcciones sin cambio de forma ni significado. Minor queda reservado a adiciones compatibles bajo una política de campos desconocidos definida y probada. Major identifica cambios incompatibles.
- Una versión nueva solo se admite después de implementar y probar su esquema, tipos, validación estructural y semántica, serialización, adaptadores, fixtures y documentación.
- El consumidor rechaza cualquier versión IR no admitida. No adivina, degrada ni migra silenciosamente.

## 2. Política de datos desconocidos para IR v1

| Elemento desconocido | Comportamiento |
|---|---|
| Versión IR | Rechazar antes de interpretar el contenido |
| Propiedad en objeto del núcleo | Rechazar (`additionalProperties: false`) |
| Tipo de bloque/discriminante | Rechazar |
| Valor enumerado | Rechazar |
| Namespace de extensión válido pero no reconocido | Conservar como JSON opaco en un round-trip; no interpretar ni modificar |
| Namespace de extensión inválido | Rechazar |

Las extensiones no pueden sobrescribir campos del núcleo. Que una extensión se conserve no garantiza que XMind, SVG u otro adaptador la represente.

## 3. Compatibilidad y migraciones

No se promete compatibilidad hacia delante de consumidores antiguos con documentos IR nuevos. La compatibilidad entre versiones minor solo se declarará si se ha diseñado expresamente y existe una matriz de pruebas que la demuestre.

Una migración major debe ser una transformación explícita y opt-in, con versiones de origen y destino identificadas, pruebas de fixtures antes/después y diagnóstico de cualquier pérdida. El original no se sobrescribe implícitamente.

## 4. Estado de implementación

El JSON Schema `spec/ir-v1.schema.json` fija `irVersion` a `1.0.0`; el validador semántico aplica la misma restricción. Las pruebas de conformidad verifican el rechazo de `1.0.1`, `1.1.0` y `2.0.0`. La matriz también verifica el rechazo de campos de núcleo desconocidos y la aceptación de extensiones namespaced válidas.

No se ha cambiado `package.json`, la versión CLI ni el contrato IR. Esta política no autoriza una release ni la publicación en npm.
