# Casos de conformidad IR v1.0.0

Estos casos son la base independiente para las pruebas automáticas que se incorporarán con Vitest en la fase 3. El fixture válido de referencia es `../fixtures/ir-v1-minimal.json`.

## A. Casos que debe aceptar JSON Schema

| ID | Caso | Resultado |
|---|---|---|
| SC-001 | Fixture mínimo | Válido |
| SC-002 | Documento con notas y enlaces válidos | Válido |
| SC-003 | Contenido con listas, tablas, citas y código | Válido |
| SC-004 | Extensión namespaced con valores JSON | Válido |
| SC-005 | Estilo con defaults, roles y estilos con nombre | Válido |

## B. Casos que debe rechazar JSON Schema

| ID | Caso | Motivo |
|---|---|---|
| SC-101 | Falta `irVersion` | Campo obligatorio |
| SC-102 | `irVersion` distinto de `1.0.0` | Versión no admitida |
| SC-103 | Falta `sheet.rootTopic` | Raíz obligatoria |
| SC-104 | Topic sin `children` o `content` | Arrays canónicos obligatorios |
| SC-105 | Bloque sin `type` discriminante | Unión inválida |
| SC-106 | Bloque con tipo desconocido | Unión inválida |
| SC-107 | Propiedad desconocida en objeto del núcleo | Contrato cerrado |
| SC-108 | ID vacío, con espacios o de más de 128 caracteres | Restricción local |
| SC-109 | Lista sin elementos o tabla sin filas | Restricción local |
| SC-110 | Extensión con namespace que no cumple el patrón | Namespace inválido |

## C. Casos que requieren validador semántico

JSON Schema no puede garantizar por sí solo estas invariantes de todo el documento.

| ID | Caso | Resultado esperado |
|---|---|---|
| SEM-001 | Dos temas con el mismo ID | Error de duplicidad |
| SEM-002 | ID de relación duplicado con un tema | Error de duplicidad |
| SEM-003 | Relación cuyo origen no existe | Error de referencia |
| SEM-004 | Relación cuyo destino no existe | Error de referencia |
| SEM-005 | Relación de un tema consigo mismo | Error de autorreferencia |
| SEM-006 | Imagen cuyo asset no existe | Error de referencia |
| SEM-007 | Boundary o summary con un tema inexistente | Error de referencia |
| SEM-008 | `defaultStyleSetId` no declarado en `styleSets` | Error de referencia |
| SEM-009 | Conjunto que extiende uno inexistente | Error de referencia |
| SEM-010 | Ciclo en la cadena `extends` | Error de ciclo |
| SEM-011 | Alineaciones de tabla con longitud distinta al número de columnas | Error de estructura semántica |
| SEM-012 | URI/ruta de asset que escapa del directorio permitido | Error de seguridad/ruta |

## D. Propiedades de determinismo

- Serializar dos veces el mismo IR normalizado produce el mismo JSON lógico.
- La validación no muta el objeto de entrada.
- El orden de temas, bloques, runs, filas y referencias se conserva.
- Extensiones desconocidas se conservan en modo compatible.
- Una versión major desconocida se rechaza antes de interpretar el contenido.

Cada caso deberá convertirse en fixture ejecutable y aserción Vitest. No se considerará automatizado hasta que exista test y se haya ejecutado en CI.
