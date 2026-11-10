# Registro de decisiones

Este registro contiene decisiones normativas del diseño del IR v1.0.0 y asuntos aplazados. Los cambios de contrato requieren una nueva entrada con contexto, alternativas y consecuencias.

## Decisiones acordadas

| ID | Decisión | Estado | Motivo |
|---|---|---|---|
| D-001 | Implementación nueva en TypeScript | Acordada | Ecosistema JS/TS y visor futuro |
| D-002 | Node.js para ejecución local y CI | Acordada | Entorno común |
| D-003 | Markdown enriquecido como fuente editable | Acordada | Legibilidad y control declarativo |
| D-004 | Un archivo Markdown equivale a una hoja | Acordada | Correspondencia simple |
| D-005 | IR neutral como contrato central | Acordada | Separar autoría y destinos |
| D-006 | No admitir temas flotantes ni huérfanos en v1 | Acordada | Árbol conectado |
| D-007 | Bloques estructurados y runs | Acordada | Preservar semántica |
| D-008 | Estilos globales/locales con precedencia | Acordada | Composición determinista |
| D-009 | Evaluar SDK oficial XMind antes de adoptarlo | Pendiente | Evitar dependencia prematura |
| D-010 | JSON y SVG como salidas | Planificada | Interoperabilidad |
| D-011 | Visor web TypeScript posterior | Planificada | Reutilizar IR |
| D-012 | Fases con autorización del usuario | Acordada | Revisión incremental |

## Decisiones de fase 2 — IR v1.0.0

| ID | Decisión | Motivo / consecuencia |
|---|---|---|
| IR-001 | Un objeto raíz `IrDocument` con `irVersion`, `document`, `sheet`, `assets`, `styleSets` y `extensions` | Contrato único serializable |
| IR-002 | Una hoja con un único `rootTopic` | Refuerza la correspondencia un archivo/hoja |
| IR-003 | Los temas se identifican por ID opaco; IDs explícitos prevalecen | No acoplar identidad al título |
| IR-004 | IDs derivados por namespace + ruta estructural | Determinismo sin estado externo; movimientos pueden cambiar el ID |
| IR-005 | Contenido mediante unión discriminada `contentBlock` | Validación exhaustiva y extensibilidad controlada |
| IR-006 | Runs con marcas tipadas | Preservar formato inline sin HTML arbitrario |
| IR-007 | Relaciones, boundaries y summaries referencian IDs | Sin dependencia de títulos |
| IR-008 | Assets separados del contenido y referenciados por ID | Empaquetado y seguridad de rutas desacoplados |
| IR-009 | Estilos declarados en IR; resolución en vista derivada | No destruir datos de autoría |
| IR-010 | Extensiones bajo namespaces | Aislamiento de formatos |
| IR-011 | JSON Schema Draft 2020-12 + validación semántica | Separar forma de invariantes globales |
| IR-012 | Versionado semántico independiente del paquete | Evolución explícita |
| IR-013 | Exactamente un H1; sin saltos de nivel | Evitar padres implícitos y raíces ambiguas |
| IR-014 | Tablas sin spans ni semántica especial de cabecera en v1 | Simplificar interoperabilidad inicial |

## Pendiente para fases posteriores

- Catálogo tipado completo de propiedades visuales y unidades.
- Sintaxis final de atributos/directivas y parser fixtures.
- Política completa de carga remota de imágenes.
- Restricciones geométricas específicas de boundaries/summaries por adaptador.
- Migraciones automáticas entre versiones major.
- Evaluación de SDK XMind y su licencia/cobertura.

