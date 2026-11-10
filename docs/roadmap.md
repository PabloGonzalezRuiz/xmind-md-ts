# Hoja de ruta

Las fases se ejecutan secuencialmente. El número de fase puede cambiar al refinar el desglose; los identificadores AUD del backlog son las referencias estables para el trabajo técnico. Al terminar cada fase se presenta el resultado y se espera autorización del usuario antes de empezar la siguiente.

| Fase | Alcance | Resultado verificable | Estado |
|---|---|---|---|
| 1 | Prompt maestro y documentación funcional/técnica | Documentación base y plan | Completada |
| 2 | Contrato IR y JSON Schema | IR v1, tipos TS, schema, fixture y matriz de conformidad | Completada |
| 3 | Esqueleto TypeScript y tooling | package.json, tsconfig estricto, lockfile, lint, formato, Vitest y CI verificados | Completada |
| 4 | Parser Markdown | Gramática implementada y corpus de parser | Completada |
| 5 | Validación semántica e identidad | IDs deterministas, unicidad, referencias, ciclos, límites y diagnósticos probados | Completada y verificada |
| 6 | Motor de estilos | Catálogo tipado, conjuntos heredados, roles, estilos, precedencia, fusión y procedencia; robustez AUD-001/AUD-002 verificada en `feature/phase-6-style-engine` | Completada y verificada en su alcance actual |
| 7 | Validación JSON Schema runtime | Ajv Draft 2020-12, casos SC automatizados y pipeline estructural→semántico (AUD-003) | En curso |
| 8 | Adaptador JSON y CLI | Ejecución local reproducible | Pendiente |
| 9 | Evaluación e integración XMind | Matriz de capacidades, SDK evaluado y exportación inicial | Pendiente |
| 10 | Adaptador SVG | Renderizado y metadatos semánticos | Pendiente |
| 11 | Corpus XMind y validación Desktop | Pruebas estructurales y visuales documentadas | Pendiente |
| 12 | Documentación de usuario y publicación | Guía, ejemplos, releases y artefactos | Pendiente |
| 13 | Visor web TypeScript | Aplicación web que consume el IR, con pruebas Playwright | Pendiente |

## Registro operativo

El estado detallado, las ramas/commits auditados, los criterios de aceptación y el backlog priorizado se mantienen en [Auditoría del proyecto y registro de continuidad](project-audit-and-continuation.md). El prompt rector es [Prompt maestro para IA](ai-master-prompt.md). Ambos documentos deben leerse al retomar el trabajo.

## Reglas de avance

- No empezar una fase sin autorización expresa.
- Una fase puede dividirse en subfases si el alcance lo exige; solicitar autorización cuando cambie sustancialmente el plan.
- No declarar una fase completada si quedan criterios de aceptación pendientes.
- Cada fase empieza solo después de verificar la anterior y recibir autorización expresa.
