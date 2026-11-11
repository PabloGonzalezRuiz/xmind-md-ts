# Hoja de ruta

Las fases se ejecutan secuencialmente. Al terminar cada fase se presenta el resultado y se espera autorización del usuario antes de empezar la siguiente.

| Fase | Alcance | Resultado verificable | Estado |
|---|---|---|---|
| 1 | Prompt maestro y documentación funcional/técnica | Documentación base y plan | Completada |
| 2 | Contrato IR y JSON Schema | IR v1, tipos TS, schema, fixture y matriz de conformidad | Completada |
| 3 | Esqueleto TypeScript y tooling | package.json, tsconfig estricto, lockfile, lint, formato, Vitest y CI verificados | Completada |
| 4 | Parser Markdown | Gramática implementada y corpus de parser | Completada |
| 5 | Validación semántica e identidad | IDs deterministas, unicidad, referencias, ciclos, límites y diagnósticos probados | Completada y verificada |
| 6 | Motor de estilos | Catálogo tipado, conjuntos heredados, roles, estilos, precedencia, fusión y procedencia | Implementación en rama de trabajo; AUD-001/002 verificadas |
| 7 | Adaptador JSON y CLI | Comandos parse, validate y export JSON; códigos de salida y rutas Windows; ejecución local y CI en Ubuntu/Windows | Completada y verificada |
| 8 | Evaluación e integración XMind | AUD-006 evaluación del SDK y AUD-007 exportador inicial, CLI, matriz de capacidades y pruebas estructurales | Completada y verificada; validación Desktop pendiente en fase 10 |
| 9 | Adaptador SVG | Renderizado y metadatos semánticos | Pendiente |
| 10 | Corpus XMind y validación Desktop | Pruebas estructurales y visuales documentadas | Pendiente |
| 11 | Documentación de usuario y publicación | Guía, ejemplos, releases y artefactos | Pendiente |
| 12 | Visor web TypeScript | Aplicación web que consume el IR, con pruebas Playwright | Pendiente |

## Verificación transversal del contrato IR

Las auditorías AUD-001 a AUD-007 están completadas y verificadas en `feature/aud-003-runtime-schema`. El exportador XMind inicial usa `xmind@2.2.33`, valida el IR, genera paquetes `.xmind` y documenta diagnósticos y pérdidas. CI general y prueba SDK pasan en Ubuntu y Windows (Node 24). `main` permanece en `6aca81b59dbfcfc13034e7e1115c70f7691c5035`. La apertura/guardado en XMind Desktop sigue pendiente de AUD-009.

## Registro operativo

El estado detallado, las ramas/commits auditados, los criterios de aceptación y el backlog priorizado se mantienen en [Auditoría del proyecto y registro de continuidad](project-audit-and-continuation.md). Ese documento es la referencia para retomar el trabajo entre sesiones.

## Reglas de avance

- No empezar una fase sin autorización expresa.
- Una fase puede dividirse en subfases si el alcance lo exige; solicitar autorización cuando cambie sustancialmente el plan.
- No declarar una fase completada si quedan criterios de aceptación pendientes.
- Cada fase empieza solo después de verificar la anterior y recibir autorización expresa.
