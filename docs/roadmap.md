# Hoja de ruta

Las fases se ejecutan secuencialmente. Al terminar cada fase se presenta el resultado y se espera autorización del usuario antes de empezar la siguiente.

| Fase | Alcance | Resultado verificable | Estado |
|---|---|---|---|
| 1 | Prompt maestro y documentación funcional/técnica | Documentación base y plan | Completada |
| 2 | Contrato IR y JSON Schema | IR v1, tipos TS, schema, fixture y matriz de conformidad | Completada |
| 3 | Esqueleto TypeScript y tooling | package.json, tsconfig estricto, lockfile, lint, formato, Vitest y CI verificados | Completada |
| 4 | Parser Markdown | Gramática implementada y corpus de parser | Completada |
| 5 | Validación semántica e identidad | IDs deterministas, unicidad, referencias, ciclos, límites y diagnósticos probados | Verificación CI final pendiente |
| 6 | Motor de estilos | Conjuntos, roles, estilos, precedencia y procedencia | Pendiente |
| 7 | Adaptador JSON y CLI | Ejecución local reproducible | Pendiente |
| 8 | Evaluación e integración XMind | Matriz de capacidades, SDK evaluado y exportación inicial | Pendiente |
| 9 | Adaptador SVG | Renderizado y metadatos semánticos | Pendiente |
| 10 | Corpus XMind y validación Desktop | Pruebas estructurales y visuales documentadas | Pendiente |
| 11 | Documentación de usuario y publicación | Guía, ejemplos, releases y artefactos | Pendiente |
| 12 | Visor web TypeScript | Aplicación web que consume el IR, con pruebas Playwright | Pendiente |

## Reglas de avance

- No empezar una fase sin autorización expresa.
- Una fase puede dividirse en subfases si el alcance lo exige; solicitar autorización cuando cambie sustancialmente el plan.
- No declarar una fase completada si quedan criterios de aceptación pendientes.
- Cada fase empieza solo después de verificar la anterior y recibir autorización expresa.
