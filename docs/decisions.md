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

## Decisiones de fase 6 — motor de estilos

| ID | Decisión | Motivo / consecuencia |
|---|---|---|
| ST-001 | La resolución produce una vista derivada y no modifica el IR | Preserva las declaraciones de autoría y permite varios adaptadores |
| ST-002 | Catálogo tipado y versionado por propiedad y tipo de elemento | Detecta propiedades desconocidas, incompatibles y valores fuera de rango |
| ST-003 | Precedencia sistema → mapa → defaults heredados → rol → estilo nombrado → overrides → inline | Resultado determinista y explicable |
| ST-004 | La herencia de conjuntos fluye del ancestro al descendiente; el contexto del conjunto se propaga a temas hijos | No implica herencia visual del tema padre |
| ST-005 | Los defaults de mapa se almacenan en `sheet.settings.styleDefaults`, agrupados por tipo de elemento | Usa el espacio de configuración existente sin alterar la forma superior del IR |
| ST-006 | Los valores `null` reinician la propiedad al default del sistema; objetos se fusionan y listas se reemplazan | Semántica uniforme para todos los adaptadores |
| ST-007 | Cada propiedad resuelta conserva capa y origen | Permite explicar decisiones y registrar pérdidas en adaptadores |

## Pendiente para fases posteriores

- Ampliar el catálogo de propiedades visuales y unidades según necesidades verificadas de XMind/SVG.
- Sintaxis final de atributos/directivas y parser fixtures.
- Política completa de carga remota de imágenes.
- Restricciones geométricas específicas de boundaries/summaries por adaptador.
- Migraciones automáticas entre versiones major.
- Evaluación de SDK XMind y su licencia/cobertura.

