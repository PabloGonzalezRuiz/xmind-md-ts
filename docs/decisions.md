# Registro de decisiones

Este registro contiene decisiones iniciales y asuntos que deben confirmarse antes de implementar los contratos definitivos.

## Decisiones iniciales

| ID | Decisión | Estado | Motivo |
|---|---|---|---|
| D-001 | Implementación nueva en TypeScript | Acordada | Mejor integración con ecosistema JS/TS, tooling tipado y futuro visor |
| D-002 | Node.js para ejecución local y CI | Acordada | Entorno común para CLI y GitHub Actions |
| D-003 | Markdown enriquecido como fuente editable | Acordada | Legibilidad y control declarativo |
| D-004 | Un archivo Markdown equivale a una hoja | Acordada | Correspondencia simple y predecible |
| D-005 | IR neutral como contrato central | Acordada | Separar autoría y formatos de salida |
| D-006 | No admitir temas flotantes ni huérfanos en la primera versión | Acordada | Todo tema pertenece a una rama |
| D-007 | Bloques de contenido estructurados | Acordada | Preservar semántica de párrafos, listas, tablas, código, etc. |
| D-008 | Estilos globales y locales con precedencia definida | Acordada | Composición predecible y reutilizable |
| D-009 | Evaluar SDK oficial XMind antes de adoptarlo | Pendiente de evaluación | Evitar dependencia prematura y verificar cobertura/licencia |
| D-010 | JSON y SVG como salidas adicionales | Planificada | Interoperabilidad y publicación |
| D-011 | Visor web TypeScript posterior | Planificada | Reutilizar el ecosistema JS sin acoplar el IR a un visor |
| D-012 | Fases con autorización del usuario | Acordada | Control de alcance y revisión incremental |

## Decisiones que deben cerrarse en la fase 2

- Forma exacta del documento IR y de cada entidad.
- Algoritmo de IDs estables y preservación ante movimientos/renombrados.
- Tratamiento de varios encabezados raíz y saltos de nivel.
- Esquema de bloques estructurados y runs.
- Modelo de relaciones, boundaries y summaries.
- Modelo de assets y rutas.
- Namespaces de extensiones y modo strict/compatible.
- Estrategia de sincronización TypeScript ↔ JSON Schema.
- Política de compatibilidad y migración entre versiones IR.

## Cambios

Toda decisión que altere contratos debe incluir fecha, contexto, alternativas y consecuencias, y actualizar prompt maestro, arquitectura y especificaciones relacionadas.
