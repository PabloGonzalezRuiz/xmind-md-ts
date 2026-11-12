# Registro de decisiones

Este registro contiene decisiones normativas del IR v1.0.0, decisiones de arquitectura y asuntos aplazados. Los cambios de contrato requieren una nueva entrada con contexto, alternativas y consecuencias.

## Decisiones generales

| ID | Decisión | Estado | Motivo / consecuencia |
|---|---|---|---|
| D-001 | Implementación nueva en TypeScript | Acordada | Ecosistema JS/TS y visor futuro |
| D-002 | Node.js para ejecución local y CI | Acordada | Entorno común |
| D-003 | Markdown enriquecido como fuente editable | Acordada | Legibilidad y control declarativo |
| D-004 | Un archivo Markdown equivale a una hoja | Acordada | Correspondencia simple |
| D-005 | IR neutral como contrato central | Acordada | Separar autoría y destinos |
| D-006 | No admitir temas flotantes ni huérfanos en v1 | Acordada | Árbol conectado |
| D-007 | Bloques estructurados y runs | Acordada | Preservar semántica |
| D-008 | Estilos globales/locales con precedencia | Acordada | Composición determinista |
| D-009 | Evaluar SDK oficial XMind antes de adoptarlo | Aceptada provisionalmente; aplicada | Evaluación AUD-006 y ADR-0001; SDK encapsulado en adaptador |
| D-010 | JSON y SVG como salidas | Acordada e implementada | JSON canónico y SVG determinista |
| D-011 | Visor web TypeScript posterior | Planificada | Consumirá IR serializado sin duplicar semántica |
| D-012 | Fases con autorización del usuario | Acordada | Revisión incremental y control del alcance |

## Decisiones del contrato IR v1.0.0

| ID | Decisión | Motivo / consecuencia |
|---|---|---|
| IR-001 | Un objeto raíz IrDocument con irVersion, document, sheet, assets, styleSets y extensions | Contrato único serializable |
| IR-002 | Una hoja con un único rootTopic | Correspondencia un archivo/hoja |
| IR-003 | Los temas se identifican por ID opaco; IDs explícitos prevalecen | No acoplar identidad al título |
| IR-004 | IDs derivados por namespace + ruta estructural | Determinismo sin estado externo; movimientos pueden cambiar el ID |
| IR-005 | Contenido mediante unión discriminada contentBlock | Validación exhaustiva y extensibilidad controlada |
| IR-006 | Runs con marcas tipadas | Preservar formato inline sin HTML arbitrario |
| IR-007 | Relaciones, boundaries y summaries referencian IDs | Sin dependencia de títulos |
| IR-008 | Assets separados del contenido y referenciados por ID | Empaquetado y seguridad de rutas desacoplados |
| IR-009 | Estilos declarados en IR; resolución en vista derivada | Preservar autoría |
| IR-010 | Extensiones bajo namespaces | Aislamiento de formatos |
| IR-011 | JSON Schema Draft 2020-12 + validación semántica | Separar forma de invariantes globales |
| IR-012 | Versionado semántico independiente del paquete | Evolución explícita |
| IR-013 | Exactamente un H1; sin saltos de nivel | Evitar padres implícitos y raíces ambiguas |
| IR-014 | Tablas sin spans ni semántica especial de cabecera en v1 | Simplificar interoperabilidad inicial |

## Decisiones de estilos

| ID | Decisión | Motivo / consecuencia |
|---|---|---|
| ST-001 | La resolución produce vista derivada y no modifica IR | Preserva declaraciones y permite varios adaptadores |
| ST-002 | Catálogo tipado por propiedad y tipo de elemento | Detecta propiedades desconocidas/incompatibles |
| ST-003 | Precedencia sistema → mapa → StyleSets heredados → rol → estilo nombrado → overrides → inline | Resultado determinista y explicable |
| ST-004 | La herencia de conjuntos fluye del ancestro al descendiente | Contexto de conjunto sin herencia visual del tema padre |
| ST-005 | Defaults de mapa en sheet.settings.styleDefaults | Evita cambiar estructura superior IR |
| ST-006 | null reinicia al default del sistema; objetos se fusionan y listas se reemplazan | Semántica uniforme |
| ST-007 | Cada propiedad resuelta conserva capa y origen | Explicabilidad y diagnóstico de pérdidas |

## Decisiones de adaptadores

- **ADR-0001 — SDK XMind:** xmind 2.2.33, licencia MIT, adoptado provisionalmente como backend del primer exportador; versión fijada, dependencia de producción, encapsulado. No ofrece importación/round-trip y requiere validación con XMind Desktop.
- **JSON:** serialización canónica/determinista del IR validado.
- **SVG:** salida autocontenida y determinista con IR completo en metadata; limitaciones documentadas en docs/adapters.md.

## Pendiente de decisión o evolución

- Compatibilidad de cada propiedad de estilo con versiones concretas de XMind Desktop.
- Política de incrustación/carga remota de imágenes.
- Restricciones geométricas y fidelidad de boundaries/summaries por adaptador.
- Migraciones entre versiones major del IR.
- Estrategia del visor web y biblioteca de visualización.

## Decisiones de versionado y compatibilidad

| ID | Decisión | Estado | Motivo / consecuencia |
|---|---|---|---|
| VER-001 | El paquete y el contrato IR tienen versiones independientes | Acordada | El ciclo de publicación del compilador no fuerza una versión del formato |
| VER-002 | Solo IR `1.0.0` se considera admitido actualmente | Implementada | Schema y validador rechazan versiones no registradas |
| VER-003 | Campos del núcleo y valores discriminantes desconocidos se rechazan | Implementada en IR v1 | Evita pérdida o reinterpretación silenciosa |
| VER-004 | Extensiones namespaced desconocidas se conservan como JSON opaco en round-trip | Contrato documentado | El consumidor no debe interpretarlas ni modificarlas |
| VER-005 | Migraciones entre major son explícitas, opt-in y probadas | Política acordada; migradores pendientes | Evita cambios de significado silenciosos |
| VER-006 | La versión del paquete es la fuente de la versión CLI | Pendiente de automatización | Evitar divergencia entre `package.json` y CLI |

No se incrementa ninguna versión por el mero hecho de documentar esta política. Cada futura versión IR deberá actualizar coordinadamente esquema, tipos, validadores, fixtures, conformidad, documentación y pruebas.

