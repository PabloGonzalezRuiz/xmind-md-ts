# Prompt maestro — XMind MD TS

> Documento rector para cualquier agente o desarrollador que diseñe, implemente, revise o mantenga este producto. Describe el proyecto desde sus requisitos y contratos, sin depender de implementaciones externas ni de historiales de conversación.
>
> Antes de cada sesión, leer este documento y `docs/project-audit-and-continuation.md`. El registro de continuidad contiene el estado real, las ramas, los commits, las pruebas y la siguiente tarea autorizada.

## 1. Misión del producto

Construir desde cero una herramienta de compilación que transforme documentos Markdown enriquecidos en mapas mentales estructurados y los exporte a distintos formatos, con XMind como destino prioritario.

**Nombre del producto:** XMind MD TS  
**Repositorio:** https://github.com/PabloGonzalezRuiz/xmind-md-ts  
**Lenguaje principal:** TypeScript  
**Ejecución prevista:** local en Windows y automatizada mediante GitHub Actions.

El usuario escribe y mantiene el contenido en Markdown. La aplicación analiza ese contenido, construye un modelo intermedio neutral, valida su estructura y semántica, resuelve estilos y genera representaciones de salida. La arquitectura debe permitir añadir formatos y herramientas sin acoplar el núcleo a un proveedor concreto.

### Objetivos funcionales

1. Un documento Markdown representa una hoja de mapa mental.
2. Los encabezados Markdown expresan la jerarquía de temas.
3. El contenido asociado a los temas puede incluir párrafos, listas, tablas, código, citas, enlaces e imágenes.
4. Una gramática documentada de directivas permite expresar metadatos, estilos y elementos avanzados.
5. El contenido se transforma en un modelo intermedio (IR) neutral, tipado y versionado.
6. El IR se valida estructural y semánticamente antes de exportarse.
7. Los adaptadores generan XMind, JSON y SVG.
8. Una interfaz web podrá visualizar e inspeccionar el IR y los mapas en una fase posterior.
9. Las operaciones deben ser reproducibles, deterministas cuando el contrato lo permita y diagnosticables.
10. La herramienta debe conservar la mayor fidelidad posible entre el documento fuente, el IR y los formatos de salida, informando de las pérdidas o aproximaciones inevitables.

## 2. Principios de diseño no negociables

- **Separación de responsabilidades:** parser, IR, validación, estilos, adaptadores, CLI y visor son capas diferenciadas.
- **IR neutral:** el núcleo no adopta el modelo interno de XMind ni de ningún otro destino.
- **Contratos explícitos:** gramática, tipos, schema, diagnósticos y reglas de compatibilidad se documentan y prueban.
- **Sin semántica implícita:** no inventar comportamientos ni ampliar la gramática sin actualizar especificación, pruebas y documentación.
- **Pérdidas visibles:** si un destino no soporta una característica, registrarla como nativa, mapeada, aproximada o no soportada; no descartarla silenciosamente.
- **Entradas no confiables:** validar los datos externos como `unknown`; no confiar en el tipado estático para validar JSON o ficheros.
- **Determinismo:** mantener salidas estables cuando las entradas y opciones sean iguales, dentro de los límites documentados.
- **Trazabilidad:** diagnósticos con código, severidad, mensaje y ruta/origen cuando corresponda.
- **Compatibilidad:** cualquier cambio del contrato IR debe ser deliberado y acompañado de migración o versionado.
- **Calidad verificable:** no declarar una tarea terminada por el mero hecho de compilar.

## 3. Arquitectura objetivo

Flujo lógico:

```text
Markdown + assets
       |
       v
Parser y normalización
       |
       v
IR versionado
       |
       +----> Validación JSON Schema
       |
       +----> Validación semántica
       |
       v
Resolución de estilos y procedencia
       |
       +----> Adaptador JSON / serialización IR
       |
       +----> Adaptador XMind
       |
       +----> Adaptador SVG
       |
       v
CLI / automatización
       |
       v
Visor web futuro (consumidor del IR)
```

Responsabilidades:

- **Parser:** interpreta Markdown y directivas; produce IR y diagnósticos de sintaxis/origen. No conoce los SDK de exportación.
- **IR:** define la representación neutral y sus invariantes. No depende de APIs de Node ni de bibliotecas de salida.
- **Validación de schema:** comprueba la forma del documento conforme al JSON Schema publicado.
- **Validación semántica:** comprueba unicidad, referencias, ciclos, límites y reglas que el schema no puede expresar.
- **Motor de estilos:** resuelve defaults, herencia, roles, estilos con nombre y overrides; mantiene la procedencia de los valores.
- **Adaptadores:** convierten el IR ya validado al modelo de cada destino. No vuelven a interpretar Markdown.
- **CLI:** expone operaciones reproducibles y códigos de salida estables.
- **Visor:** consume el IR o una representación derivada; no debe duplicar la semántica del parser.

## 4. Contrato normativo vigente

La versión vigente del modelo intermedio es **IR v1.0.0**. Estos documentos y artefactos son las fuentes normativas:

- Especificación: `docs/ir-specification.md`.
- JSON Schema Draft 2020-12: `spec/ir-v1.schema.json`.
- Tipos TypeScript: `spec/ir-v1.types.ts`.
- Casos de conformidad: `spec/conformance/README.md`.
- Fixture mínimo: `spec/fixtures/ir-v1-minimal.json`.
- Gramática: `docs/grammar.md`.
- Sistema de estilos: `docs/style-system.md`.
- Arquitectura: `docs/architecture.md`.
- Decisiones: `docs/decisions.md`.

El documento raíz del IR contiene `irVersion`, `document`, `sheet`, `assets`, `styleSets` y `extensions`. Una hoja tiene un único `rootTopic`. Los bloques usan una unión discriminada.

Los identificadores explícitos se conservan. Los identificadores derivados son deterministas según la ruta estructural definida, pero pueden cambiar si se insertan o reordenan elementos anteriores. Para identidad durable deben utilizarse IDs explícitos. Las referencias se comprueban en la validación semántica.

**No confundir:**
- JSON Schema valida estructura y restricciones declarativas.
- La validación semántica comprueba relaciones e invariantes entre elementos.
- Los tipos TypeScript ayudan durante el desarrollo, pero no validan datos externos en ejecución.

Cualquier cambio del IR debe actualizar en el mismo cambio la especificación, schema, tipos o su mecanismo de generación, fixtures, matriz de conformidad, decisiones y pruebas afectadas.

## 5. Gramática Markdown y estilos

La gramática autorizada es la descrita en `docs/grammar.md`. Antes de añadir una directiva, bloque o regla:
1. definir sintaxis y semántica;
2. especificar errores y diagnósticos;
3. añadir ejemplos y fixtures;
4. implementar parser y validación;
5. actualizar la documentación y las pruebas.

La precedencia y resolución de estilos se definen en `docs/style-system.md`. Los valores resueltos y su procedencia son resultados de procesamiento y no deben confundirse con los datos originales del IR.

El catálogo de estilos debe permanecer neutral hasta que las capacidades de cada destino se hayan contrastado con evidencia. No asumir que una propiedad existe en XMind o SVG porque exista en el catálogo interno.

## 6. Estrategia de exportación

### JSON

Debe permitir serializar el IR de forma estable, legible y compatible con su versión. La CLI debe poder validar y exportar sin depender de XMind.

### XMind

Antes de adoptar una biblioteca o SDK:
- comprobar documentación y API reales;
- verificar versiones, compatibilidad con Node.js y mantenimiento;
- revisar licencia y dependencias;
- inspeccionar el formato de fichero producido;
- ejecutar una prueba mínima de creación, lectura y modificación;
- documentar límites y correspondencias con el IR.

No asumir soporte por el nombre de una propiedad o por ejemplos no ejecutados. Mantener una matriz de capacidades con los estados `native`, `mapped`, `approximate` y `unsupported`.

La compatibilidad real requiere abrir el fichero en una versión identificada de XMind Desktop, inspeccionar su estructura, guardarlo de nuevo y comprobar el resultado.

### SVG

Debe producir SVG válido y determinista, con geometría, tipografía, estilos y metadatos definidos. Las pruebas estructurales y visuales deben detectar regresiones. El SVG es una salida, no el contrato maestro del contenido.

## 7. Tecnología y calidad

La configuración actual del proyecto utiliza:
- Node.js 24 y npm con `package-lock.json`.
- TypeScript 6 con configuración estricta.
- Vitest 5.
- Ajv 8 con Draft 2020-12 y `ajv-formats` para validación estructural runtime.
- ESLint 10 y typescript-eslint.
- Prettier 3.
- GitHub Actions.

Las versiones y comandos efectivos se consultan en `package.json`, `package-lock.json` y `.github/workflows/ci.yml`; no copiar versiones de este prompt si la configuración cambia.

Mantener, como mínimo, las opciones estrictas aplicables: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride` y `useUnknownInCatchVariables`. Evitar `any`; validar fronteras externas como `unknown`.

La puerta de calidad actual incluye:
- `npm ci`
- `npm run format:check`
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`

Usar `npm run verify` cuando corresponda. Las pruebas deben cubrir unitarias, integración, fixtures positivos/negativos, determinismo, conformidad IR, regresión y, cuando existan adaptadores, estructura de ficheros y validación en las aplicaciones de destino. Las pruebas visuales y Playwright se incorporarán cuando exista el visor.

No afirmar que una prueba se ha ejecutado si no hay salida local o evidencia de CI que lo confirme. Registrar siempre el commit exacto probado y el resultado.

## 8. Estado de referencia y planificación

El estado vivo no se mantiene duplicado aquí: se registra en `docs/project-audit-and-continuation.md` y `docs/roadmap.md`.

A fecha de la última actualización de este prompt:
- Fases 1–5: completadas y verificadas.
- Fase 6 (motor de estilos): implementación y robustez AUD-001/AUD-002 completadas y verificadas en `feature/phase-6-style-engine`.
- AUD-003: validación JSON Schema runtime completada y verificada con Ajv 8 Draft 2020-12, formatos URI, API `validateIrSchema`, pipeline `validateIr` y casos SC automatizados.
- No hay exportadores JSON/XMind/SVG ni CLI terminados.
- No existe todavía visor web.
- El desarrollo de las ramas de características no se considera integrado en `main` por el mero hecho de superar CI.

AUD-003 está completada y verificada. La siguiente tarea priorizada es **AUD-012: automatizar la coherencia entre JSON Schema y tipos TypeScript**. No iniciarla hasta recibir autorización expresa.

## 9. Protocolo obligatorio de trabajo con el repositorio

Antes de cada tarea:
1. Leer este prompt y el registro de continuidad completo.
2. Consultar las ramas, HEAD y estado real del repositorio; no confiar ciegamente en SHA antiguos.
3. Consultar el estado de CI del HEAD que se vaya a modificar.
4. Inspeccionar los archivos, pruebas, contratos y documentación afectados.
5. Definir alcance, dependencias y criterios de aceptación antes de editar.

Durante la tarea:
1. Trabajar en la rama de característica acordada.
2. Realizar cambios pequeños y coherentes.
3. Añadir o actualizar pruebas junto con la implementación.
4. Actualizar especificaciones y documentación afectadas.
5. Ejecutar las comprobaciones disponibles y revisar el diff.
6. No introducir pasos temporales de diagnóstico en el workflow definitivo.
7. No conceder permisos adicionales a CI sin justificación.
8. No modificar ni fusionar `main` sin autorización expresa.

Al cerrar cada unidad:
1. Registrar archivos y comportamiento modificado.
2. Separar claramente lo implementado de lo probado y verificado.
3. Registrar commit, ejecución CI, pruebas y limitaciones.
4. Actualizar el backlog y el registro de sesiones.
5. Actualizar la hoja de ruta si cambia el estado de una fase.
6. Detenerse y solicitar autorización antes de empezar la siguiente tarea o fase.

## 10. Fuentes de verdad y resolución de contradicciones

Orden de autoridad:
1. Estado actual del repositorio, código, pruebas y resultados de ejecución comprobables.
2. Contrato IR, schema, gramática y especificaciones versionadas.
3. Decisiones arquitectónicas registradas.
4. Registro de auditoría y hoja de ruta.
5. Este prompt maestro.
6. Suposiciones o recuerdos de conversaciones.

Si dos fuentes discrepan:
- describir la contradicción;
- inspeccionar el estado real;
- decidir qué documento debe corregirse;
- registrar la resolución;
- no ocultar la incertidumbre ni inventar evidencia.

## 11. Formato de los informes de trabajo

Todo informe de avance debe incluir, cuando aplique:
- **Fase/tarea:** identificador y alcance.
- **Rama y commit:** rama real y SHA.
- **Estado:** pendiente, en curso, bloqueada, implementada, completada o verificada.
- **Cambios:** archivos y comportamiento.
- **Pruebas:** ejecutadas, resultado y evidencia.
- **CI:** URL, SHA y estado; distinguir pendiente de éxito.
- **Limitaciones/deuda:** aspectos no cubiertos.
- **Siguiente paso:** una sola tarea priorizada y si requiere autorización.

Nunca presentar una fase como finalizada si quedan criterios de aceptación pendientes. Nunca presentar una ejecución CI de otro commit como verificación del HEAD actual.
