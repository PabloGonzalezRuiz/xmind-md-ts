# Auditoría del proyecto y registro de continuidad

> Documento operativo para auditar el estado real, mantener el backlog y retomar el desarrollo sin depender del historial del chat.
>
> **Última auditoría:** 2026-11-10  
> **Repositorio:** https://github.com/PabloGonzalezRuiz/xmind-md-ts  
> **Rama de trabajo auditada:** `feature/phase-6-style-engine`  
> **Commit de código validado en AUD-001:** `2c594eaadd3a3bb794c73d5607ef39bb5b15a9ac`  
**Rama de trabajo:** actualizada durante AUD-002; consultar el último commit en GitHub antes de continuar  
> **Rama principal:** `main` — `6aca81b59dbfcfc13034e7e1115c70f7691c5035`

## 1. Resumen ejecutivo

El proyecto tiene definido el contrato IR v1.0.0 y ya dispone de una base TypeScript, parser Markdown, validador semántico y un motor de estilos en desarrollo. Todavía **no es una aplicación funcional de extremo a extremo**: no exporta XMind, JSON ni SVG, no dispone de CLI y no tiene visor.

El trabajo está distribuido en ramas de características. No hay pull requests abiertos y no se ha integrado el desarrollo de las fases 3–6 en `main`. No se debe confundir que una fase esté implementada y verificada en su rama con que esté integrada en la rama principal.

### Estado verificable

| Área | Estado auditado | Evidencia / limitación |
|---|---|---|
| Fases 1–2: definición y contrato IR | Completadas | Documentación, JSON Schema Draft 2020-12, tipos TS, fixture mínimo y matriz de conformidad están en `main` |
| Fase 3: base TypeScript | Completada y CI verde | Rama `feature/phase-3-project-scaffold`; CI run [42818879886](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42818879886) |
| Fase 4: parser Markdown → IR | Completada y CI verde | Rama `feature/phase-4-markdown-parser`; CI run [42820998921](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42820998921) |
| Fase 5: validación semántica e identidad | Completada y CI verde | Commit `954216e99a13106d88ba72652460047d826b9c55`; CI run [42823341031](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42823341031) |
| Fase 6: motor de estilos | Implementada parcialmente; no cerrada | Rama actual. AUD-001 ya está verificada; quedan pendientes las tareas de robustez AUD-002 |
| JSON Schema en ejecución | Pendiente | El esquema existe, pero no hay validador runtime conectado ni pruebas SC automáticas |
| Adaptador JSON y CLI | Pendientes | No existen módulos ejecutables de exportación ni comandos CLI |
| Adaptador XMind | Pendiente | SDK oficial aún no evaluado; no se genera paquete XMind |
| Adaptador SVG | Pendiente | No existe renderizador |
| Validación en XMind Desktop | Pendiente | No hay pruebas de apertura/guardado ni corpus real |
| Visor web | Pendiente | No existe aplicación web ni pruebas Playwright |

## 2. Ramas, commits y política de integración

| Rama | HEAD auditado | Propósito / estado |
|---|---|---|
| `main` | `6aca81b59dbfcfc13034e7e1115c70f7691c5035` | Contiene documentación base y contrato IR; no contiene la implementación TypeScript |
| `feature/phase-3-project-scaffold` | `43a006096aa65f72c73b5ec20ab3d457fe698019` | Scaffold, configuración, dependencias, tests y CI |
| `feature/phase-4-markdown-parser` | `d31892ba0895f513b8b19a284de929623d10af6b` | Parser Markdown y pruebas |
| `feature/phase-5-semantic-validation` | `954216e99a13106d88ba72652460047d826b9c55` | Validador semántico, IDs deterministas y pruebas |
| `feature/phase-6-style-engine` | Rama de trabajo activa | Catálogo y motor de estilos; AUD-001 verificada y AUD-002 en revisión/CI |

Las ramas de fase están encadenadas por orden de desarrollo y contienen cambios acumulados. No hay PRs abiertos ni issues registrados en el repositorio en el momento de esta auditoría. **No fusionar ni reescribir `main` sin autorización expresa.**

## 3. Inventario técnico real

### 3.1 Contrato y especificación

- `spec/ir-v1.schema.json`: JSON Schema Draft 2020-12.
- `spec/ir-v1.types.ts`: tipos TypeScript escritos manualmente.
- `spec/fixtures/ir-v1-minimal.json`: fixture mínimo.
- `spec/conformance/README.md`: matriz SC y SEM.
- `docs/ir-specification.md`, `docs/grammar.md`, `docs/style-system.md`: especificaciones funcionales.

**Deuda:** la matriz SC-001…SC-110 no se ejecuta contra JSON Schema. Los tipos y el schema tampoco tienen todavía una prueba automática de equivalencia. No está instalada una dependencia de validación JSON Schema runtime.

### 3.2 Código implementado

- `src/markdown/parser.ts`: parser basado en Unified/Remark (CommonMark, GFM, front matter y directivas); genera IR v1 y diagnósticos compatibles.
- `src/validation/semantic-validator.ts`: validación semántica sobre `unknown`, IDs, referencias, ciclos, tablas, URI, límites y contención léxica de assets.
- `src/styles/catalog.ts`: catálogo de propiedades, tipos, compatibilidad, defaults y validadores.
- `src/styles/style-engine.ts`: resolución por capas, herencia de StyleSets, roles, estilos con nombre, overrides, runs y procedencia.
- `src/index.ts`: exporta parser, validador y motor de estilos.

No existen todavía `src/adapters/`, `src/cli/` ni aplicación `viewer/`.

### 3.3 Toolchain y CI

- Node.js 24, npm, TypeScript 6, Vitest 5, ESLint 10 y Prettier 3.
- `npm ci`, `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
- `npm run verify` agrupa las puertas locales de calidad.
- `package-lock.json` está versionado.

**Hallazgo de CI corregido en AUD-001:** el workflow ahora concede `contents: read` y solo comprueba formato; ya no crea commits ni hace push. El formato debe corregirse en commits normales del desarrollo.

## 4. Auditoría de la fase 6

### 4.1 Implementado

- Catálogo de estilos con tipos, compatibilidad por elemento y valores por defecto.
- Validación de color, longitud, número, cadena, booleano, enumeración, objeto y lista numérica.
- Precedencia: sistema → defaults de mapa → StyleSets heredados → rol → estilo con nombre → override → inline.
- Contexto de StyleSet heredado a temas descendientes, sin herencia visual automática desde el tema padre.
- Fusión recursiva de objetos; reemplazo completo de arrays; reinicio por `null`.
- Procedencia por propiedad.
- Diagnósticos para propiedades desconocidas, incompatibles, inválidas, referencias a conjuntos ausentes y ciclos.
- Pruebas unitarias del motor.

### 4.2 Resultado de CI observado

- Run anterior [42824922887](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42824922887): verde, 42 pruebas; corresponde al commit `a39c4c9...`, anterior a las últimas modificaciones.
- Run más reciente [42825929592](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42825929592): fallido.
- En el último run: formato, lint y typecheck pasaron; 45 de 46 pruebas pasaron; falló una aserción que aún esperaba el antiguo `sourceId: topic:root:run:0`, mientras que el motor ya devuelve un identificador basado en la ruta del run. El build quedó omitido al fallar los tests.
- El run de formato generó además un commit automático de CI, motivo por el que el HEAD de la rama avanzó a `0fc17e933531245f700bf04ea5661d0601a48c56`.

### 4.3 Deuda técnica identificada en el motor

1. Corregir la aserción obsoleta del test de procedencia de runs.
2. El workflow debe ser de solo lectura y no debe hacer commits ni push automáticos.
3. La validación de color usa una expresión que acepta cualquier palabra alfabética; valores que no sean nombres CSS válidos podrían pasar.
4. `shadow` solo comprueba que el valor sea un objeto; no valida sus claves ni tipos internos.
5. El reinicio de una propiedad objeto con `null` actualiza la procedencia de la clave raíz, pero puede dejar procedencias antiguas de subclaves.
6. El resolutor no informa de forma explícita cuando un rol o estilo con nombre no existe; la validación semántica sí comprueba referencias, pero el motor debe tener un comportamiento documentado y probado al invocarse por separado.
7. Al detectar un ciclo de StyleSets, el motor genera diagnóstico, pero puede continuar resolviendo con una cadena parcial. Debe definirse si la resolución parcial es admisible.
8. Los IDs de runs se derivan de la ruta JSON de origen. Son únicos para la estructura actual, pero conviene formalizar su estabilidad y contrato.
9. El catálogo y las reglas de mapeo son neutrales; no están contrastados aún con capacidades reales de XMind/SVG.

## 5. Backlog maestro ordenado

Los IDs de tarea son permanentes. Cambiar el orden o el alcance exige actualizar este documento y la hoja de ruta.

| ID | Prioridad | Tarea | Criterio de aceptación | Estado |
|---|---:|---|---|---|
| AUD-001 | P0 | Estabilizar CI y recuperar la puerta de calidad de la fase 6 | Test de procedencia corregido; workflow read-only sin auto-push; format, lint, typecheck, tests y build verdes sobre el commit de código | Completada y verificada |
| AUD-002 | P1 | Completar revisión de robustez del motor de estilos | Validadores de color/objetos robustos; procedencia coherente; referencias y ciclos diagnosticados; contrato de IDs y límites de compatibilidad documentados; pruebas y CI verdes | En curso |
| AUD-003 | P1 | Integrar validación JSON Schema runtime | Dependencia seleccionada; SC-001…SC-110 automatizados; prueba de equivalencia schema/tipos o generación de tipos; integración con validación semántica | Pendiente |
| AUD-004 | P1 | Completar corpus de conformidad parser/IR | Fixtures positivos y negativos de cada bloque/directiva, diagnósticos y posiciones de origen; regresión reproducible | Pendiente |
| AUD-005 | P1 | Implementar adaptador JSON y CLI | Comandos de parse, validate y export JSON; códigos de salida; rutas Windows; ejecución local y CI | Pendiente |
| AUD-006 | P1 | Evaluar SDK oficial XMind y decidir estrategia | Informe de API, formatos, Node, licencia, actividad, cobertura, dependencias y prueba mínima | Pendiente |
| AUD-007 | P1 | Implementar exportador XMind inicial | Paquete generado, matriz de capacidades y diagnósticos de pérdidas; estructura ZIP/JSON comprobada | Pendiente |
| AUD-008 | P2 | Implementar adaptador SVG | SVG válido, renderizado determinista, metadatos semánticos y pruebas visuales/estructurales | Pendiente |
| AUD-009 | P2 | Crear corpus real y validar con XMind Desktop | Fixtures de referencia abiertos y guardados en versión Desktop identificada; informe de fidelidad | Pendiente |
| AUD-010 | P2 | Documentación de usuario y publicación | Instalación, gramática, ejemplos, CLI, limitaciones, releases y artefactos | Pendiente |
| AUD-011 | P3 | Diseñar e implementar visor web | Arquitectura aprobada, IR consumido sin duplicar semántica, accesibilidad y pruebas Playwright | Pendiente |

### Dependencias

- AUD-001 desbloquea el cierre formal de la fase 6.
- AUD-002 y AUD-003 deben estar resueltas antes de considerar estable el pipeline de compilación.
- AUD-005 consume parser, validador, schema y serialización JSON.
- AUD-006 precede a AUD-007: no elegir SDK ni formato de salida antes de evaluar.
- AUD-008 puede avanzar tras estabilizar el IR y el motor de estilos.
- AUD-009 depende de AUD-007 y de disponer de XMind Desktop para validar.
- AUD-010 documenta el comportamiento real de la CLI y adaptadores.
- AUD-011 depende del contrato IR estable y de la decisión sobre la biblioteca de visualización.

## 6. Criterios globales de finalización

Una tarea solo pasa a **Completada** cuando:
1. El código o documento está en la rama acordada.
2. Sus criterios de aceptación están cubiertos por pruebas o evidencia verificable.
3. Se ejecutan las puertas de calidad aplicables y se registra el commit probado.
4. Se actualizan este registro, `docs/roadmap.md` y, si corresponde, especificaciones/decisiones.
5. No quedan limitaciones relevantes ocultas.

Los estados permitidos son: **Pendiente**, **En curso**, **Bloqueada**, **Completada** y **Verificada**. Implementado no equivale a verificado.

## 7. Protocolo para retomar el desarrollo

Al iniciar una sesión de trabajo:

1. Leer este documento completo.
2. Consultar HEAD actual de `main` y de la rama de trabajo; no asumir que coinciden con los SHA registrados.
3. Consultar la última ejecución de CI para ese HEAD y sus logs.
4. Revisar el estado de la tarea en curso y su diff respecto de la rama base.
5. Continuar únicamente la primera tarea no completada del backlog, salvo autorización expresa para cambiar prioridades.
6. Actualizar el registro después de cada unidad de trabajo: cambios, commit, pruebas, CI y siguiente paso.
7. Detenerse al cerrar la tarea/fase y solicitar confirmación antes de iniciar la siguiente.

### Primera acción de continuación

**AUD-001 está completada y verificada.** **AUD-002 está en curso** en `feature/phase-6-style-engine`; no iniciar AUD-003 hasta cerrar esta tarea y recibir autorización expresa.

## 8. Registro de sesiones

| Fecha | Trabajo | Resultado / commit | Próxima acción |
|---|---|---|---|
| 2026-11-10 | Auditoría inicial completa y AUD-001 | Auditoría registrada; commit `2c594eaadd3a3bb794c73d5607ef39bb5b15a9ac`; CI [42826867694](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42826867694) verde con 46/46 pruebas, lint, typecheck, formato y build | AUD-002 |
| 2026-11-10 | AUD-002: revisión y endurecimiento del motor | Corregidos catálogo de color, `shadow`, procedencia de reinicios, referencias inexistentes y cadenas de herencia incompletas; añadidas pruebas de regresión y actualizado `docs/style-system.md`. Pendiente verificar format/lint/typecheck/tests/build y CI sobre el HEAD final | Completar verificación AUD-002 y registrar SHA/CI |
