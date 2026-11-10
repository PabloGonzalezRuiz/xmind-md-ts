# Hoja de ruta

Las fases se ejecutan secuencialmente. Al terminar cada fase se presenta el resultado y se espera autorización del usuario antes de empezar la siguiente.

| Fase | Alcance | Resultado verificable |
|---|---|---|
| 1 | Prompt maestro y documentación funcional/técnica | Documentación coherente, alcance y plan aprobados |
| 2 | Contrato IR y JSON Schema | Tipos, esquema, fixtures y pruebas de conformidad |
| 3 | Esqueleto TypeScript y tooling | package.json, tsconfig estricto, lint, formato, Vitest y CI |
| 4 | Parser Markdown | Gramática implementada y corpus de parser |
| 5 | Validación semántica e identidad | IDs, referencias, jerarquía y diagnósticos |
| 6 | Motor de estilos | Conjuntos, roles, estilos, precedencia y procedencia |
| 7 | Adaptador JSON y CLI | Ejecución local reproducible |
| 8 | Evaluación e integración XMind | Matriz de capacidades, SDK evaluado y exportación inicial |
| 9 | Adaptador SVG | Renderizado y metadatos semánticos |
| 10 | Corpus XMind y validación Desktop | Pruebas estructurales y visuales documentadas |
| 11 | Documentación de usuario y publicación | Guía, ejemplos, releases y artefactos |
| 12 | Visor web TypeScript | Aplicación web que consume el IR, con pruebas Playwright |

## Reglas de avance

- No empezar una fase sin autorización expresa.
- Una fase puede dividirse en subfases si el alcance lo exige; solicitar autorización cuando cambie sustancialmente el plan.
- No declarar una fase completada si quedan criterios de aceptación pendientes.
- Si una decisión afecta al alcance, actualizar primero `docs/decisions.md` y los documentos relacionados.
- La fase 2 empieza solo después de aprobar la documentación de la fase 1.
