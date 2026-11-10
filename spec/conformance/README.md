# Casos de conformidad IR v1.0.0

Estos casos forman la matriz normativa de conformidad IR v1.0.0. Los casos semánticos se ejercitan mediante Vitest en `test/semantic-validator.test.ts`; los estructurales definidos se ejecutan contra JSON Schema Draft 2020-12 mediante `test/schema-validator.test.ts`. La matriz define quince casos estructurales: SC-001…SC-005 y SC-101…SC-110; no define SC-006…SC-100. El corpus de sintaxis Markdown del parser está en `test/fixtures/markdown/` y se ejecuta desde `test/markdown-conformance.test.ts`. El fixture IR mínimo de referencia es `../fixtures/ir-v1-minimal.json`.

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
| SEM-013 | ID vacío, con espacios o superior a 128 caracteres | Error de ID |
| SEM-014 | Rol o estilo definido en un conjunto heredado | Referencia válida |
| SEM-015 | Filas de tabla con distinto número de celdas | Error de estructura semántica |
| SEM-016 | Árbol o contenido que supera los límites configurados | Error de límite |
| SEM-017 | ID de documento igual a un ID de tema | Válido: namespace separado |
| SEM-018 | La validación modifica el objeto de entrada | No debe modificarlo |

## D. Propiedades de determinismo

- Serializar dos veces el mismo IR normalizado produce el mismo JSON lógico.
- La validación no muta el objeto de entrada.
- El orden de temas, bloques, runs, filas y referencias se conserva.
- Extensiones desconocidas se conservan en modo compatible.
- Una versión major desconocida se rechaza antes de interpretar el contenido.

Los casos SEM-001 a SEM-018 tienen cobertura automatizada en Vitest. Los quince casos SC definidos tienen cobertura automatizada contra JSON Schema. No se considera que existan casos SC-006…SC-100 mientras no se incorporen explícitamente a esta matriz.

## E. Corpus de conformidad del parser Markdown

Los fixtures de parser son archivos Markdown independientes, versionados y reutilizables como regresión. Cada caso positivo se transforma a IR y se contrasta con JSON Schema; el fixture de relaciones y grupos se contrasta además con la validación semántica completa.

| ID | Fixture | Cobertura / resultado esperado |
|---|---|---|
| PAR-001 | `valid/core-blocks.md` | Front matter, párrafos/runs, marcas inline, enlaces, listas anidadas y ordenadas, tablas GFM/alineación, citas, código, separador, imágenes y deduplicación de assets; IR válido |
| PAR-002 | `valid/relationships-and-groups.md` | Directivas de relación, boundary y summary; referencias semánticas válidas |
| PAR-003 | `valid/frontmatter.md` | Metadatos, style_set y settings de hoja |
| PAR-101 | `invalid/missing-root.md` | Rechazo: `MD_ROOT_HEADING` |
| PAR-102 | `invalid/multiple-roots.md` | Rechazo: `MD_MULTIPLE_ROOTS` |
| PAR-103 | `invalid/heading-gap.md` | Rechazo: `MD_HEADING_LEVEL_GAP` |
| PAR-104 | `invalid/content-before-root.md` | Rechazo: `MD_CONTENT_BEFORE_ROOT` |
| PAR-105 | `invalid/duplicate-topic-id.md` | Rechazo: `MD_DUPLICATE_TOPIC_ID` |
| PAR-106 | `invalid/unknown-directive.md` | Rechazo: `MD_UNKNOWN_DIRECTIVE` |
| PAR-107 | `invalid/invalid-directive-key.md` | Rechazo: `MD_DIRECTIVE_UNKNOWN_KEY` |
| PAR-108 | `invalid/invalid-relationship.md` | Rechazo: `MD_DIRECTIVE_FIELD` |
| PAR-109 | `invalid/invalid-boundary-topics.md` | Rechazo: `MD_DIRECTIVE_TOPICS` |
| PAR-110 | `invalid/invalid-frontmatter-settings.md` | Rechazo: `MD_FRONTMATTER_SETTINGS` |
| PAR-201 | `diagnostics/unsupported.md` | Diagnósticos compatibles de clave desconocida, HTML inline y HTML de bloque con líneas/columnas |
| PAR-202 | Caso inline HTML estricto | Rechazo estricto con código y posición |
| PAR-203 | Caso de directiva dentro de bloque de contenido | Rechazo: `MD_DIRECTIVE_CONTEXT` |

La batería también comprueba posiciones de origen de temas y bloques, preservación del orden y validez del IR generado. Los códigos de error son parte del contrato observable del parser; cambios deliberados deben actualizar la matriz y sus fixtures en el mismo cambio.
