# Auditoría del proyecto y registro de continuidad

> Documento operativo para auditar el estado real, mantener el backlog y retomar el desarrollo sin depender del historial del chat.
>
> **Última auditoría:** 2026-11-10  
> **Repositorio:** https://github.com/PabloGonzalezRuiz/xmind-md-ts  
> **Rama de trabajo auditada:** `feature/phase-6-style-engine`  
> **Commit de código validado en AUD-001:** `2c594eaadd3a3bb794c73d5607ef39bb5b15a9ac`  
> **HEAD de código validado para AUD-002:** `21dae3248be2963ccc77b00b79dffd1afd92a98d`  
> **HEAD de implementación AUD-012:** `c559ae159546d9e6872c0d9082dcf53fa3b9ca53` (CI aún por verificar)  
> **HEAD actual:** consultar GitHub al reanudar; no reutilizar un SHA histórico como referencia de rama.  
> **Rama principal:** `main` — `6aca81b59dbfcfc13034e7e1115c70f7691c5035`

## 1. Resumen ejecutivo

El proyecto tiene definido el contrato IR v1.0.0 y dispone de una base TypeScript, parser Markdown, validador semántico y motor de estilos implementados y verificados en sus respectivas ramas. Todavía **no es una aplicación funcional de extremo a extremo**: no exporta XMind, JSON ni SVG, no dispone de CLI y no tiene visor.

El trabajo está distribuido en ramas de características. No hay pull requests abiertos y no se ha integrado el desarrollo de las fases 3–6 en `main`. No se debe confundir que una fase esté implementada y verificada en su rama con que esté integrada en la rama principal.

### Estado verificable

| Área | Estado auditado | Evidencia / limitación |
|---|---|---|
| Fases 1–2: definición y contrato IR | Completadas | Documentación, JSON Schema Draft 2020-12, tipos TS, fixture mínimo y matriz de conformidad están en `main` |
| Fase 3: base TypeScript | Completada y CI verde | Rama `feature/phase-3-project-scaffold`; CI run [42818879886](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42818879886) |
| Fase 4: parser Markdown → IR | Completada y CI verde | Rama `feature/phase-4-markdown-parser`; CI run [42820998921](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42820998921) |
| Fase 5: validación semántica e identidad | Completada y CI verde | Commit `954216e99a13106d88ba72652460047d826b9c55`; CI run [42823341031](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42823341031) |
| Fase 6: motor de estilos | Implementada y verificada en su alcance actual | Rama `feature/phase-6-style-engine`; CI normal verde sobre el HEAD `21dae3248be2963ccc77b00b79dffd1afd92a98d`. Quedan integración/exportadores y validación real XMind/SVG como tareas posteriores |
| JSON Schema en ejecución | Completada y verificada | Ajv 8 Draft 2020-12, `ajv-formats`, API estructural y pipeline compuesto; casos SC automatizados; CI normal verde en el HEAD `3720239503da81d950a9f83a2ebaa392302258fe` (run `42844634106`) |
| Coherencia schema/TypeScript | En curso (AUD-012) | Checker de proyección de tipos y equivalencia bidireccional añadido; CI de los nuevos cambios pendiente de comprobar |
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
| `feature/phase-6-style-engine` | `21dae3248be2963ccc77b00b79dffd1afd92a98d` | Catálogo y motor de estilos; AUD-001 y AUD-002 verificadas |

Las ramas de fase están encadenadas por orden de desarrollo y contienen cambios acumulados. No hay PRs abiertos ni issues registrados en el repositorio en el momento de esta auditoría. **No fusionar ni reescribir `main` sin autorización expresa.**

## 3. Inventario técnico real

### 3.1 Contrato y especificación

- `spec/ir-v1.schema.json`: JSON Schema Draft 2020-12.
- `spec/ir-v1.types.ts`: tipos TypeScript públicos mantenidos manualmente; su estructura se contrasta con el schema mediante `scripts/check-ir-types.mjs`.
- `spec/fixtures/ir-v1-minimal.json`: fixture mínimo.
- `spec/conformance/README.md`: matriz SC y SEM.
- `docs/ir-specification.md`, `docs/grammar.md`, `docs/style-system.md`: especificaciones funcionales.

**Estado AUD-012:** el checker genera una proyección TypeScript temporal desde el schema y exige equivalencia estructural bidireccional con cada tipo público y con el IR raíz. Falla si aparece una definición o keyword estructural no contemplada, y exige discriminadores `type` únicos para proyectar `oneOf` como unión TypeScript. Las restricciones no representables en TypeScript (longitudes, patrones y formatos) siguen cubiertas por Ajv.

### 3.2 Código implementado

- `src/markdown/parser.ts`: parser basado en Unified/Remark (CommonMark, GFM, front matter y directivas); genera IR v1 y diagnósticos compatibles.
- `src/validation/schema-validator.ts`: validación estructural runtime con Ajv 8 y schema Draft 2020-12; formatos URI registrados.
- `src/validation/validate-ir.ts`: pipeline estructural → semántico, fail-fast si el schema falla.
- `src/validation/semantic-validator.ts`: validación semántica sobre `unknown`, IDs, referencias, ciclos, tablas, URI, límites y contención léxica de assets.
- `src/styles/catalog.ts`: catálogo de propiedades, tipos, compatibilidad, defaults y validadores.
- `src/styles/style-engine.ts`: resolución por capas, herencia de StyleSets, roles, estilos con nombre, overrides, runs y procedencia.
- `src/index.ts`: exporta parser, validador y motor de estilos.

No existen todavía `src/adapters/`, `src/cli/` ni aplicación `viewer/`.

### 3.3 Toolchain y CI

- Node.js 24, npm, TypeScript 6, Vitest 5, ESLint 10, Prettier 3, Ajv 8 y `ajv-formats`.
- `npm ci`, `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm run check:ir-types`, `npm test`, `npm run build`.
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

- La incidencia inicial de formato se corrigió aplicando el formato exacto de Prettier a `src/styles/catalog.ts` y `test/style-engine.test.ts`.
- Se retiró el paso temporal de diagnóstico y se restauró el workflow normal, de solo lectura.
- Verificación final limpia: [CI run 42833075950](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42833075950), commit `21dae3248be2963ccc77b00b79dffd1afd92a98d`; conclusión **success**.
- La ejecución final corresponde al workflow normal y confirma la cadena de calidad sobre el HEAD final: formato, lint, typecheck, tests y build.
- El run diagnóstico [42832932075](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42832932075) también fue verde, pero no se utiliza como evidencia de cierre porque ejecutaba Prettier antes de comprobar el formato.

### 4.3 AUD-003 — validación JSON Schema runtime

- Dependencias directas: Ajv `8.20.0` y `ajv-formats` `3.0.1`; lockfile regenerado con `npm install --package-lock-only`.
- `src/validation/schema-validator.ts`: Ajv 2020-12, `allErrors`, formatos URI, diagnósticos estructurados y rutas de instancia.
- `src/validation/validate-ir.ts`: pipeline fail-fast; valida estructura y solo después ejecuta `validateIrDocument`.
- `src/index.ts` exporta `validateIrSchema`, `validateIr` y sus tipos.
- `test/ir-schema-validator.test.ts` automatiza SC-001…SC-005 y SC-101…SC-110, además de la integración estructural/semántica.
- CI normal [42844634106](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42844634106), SHA `3720239503da81d950a9f83a2ebaa392302258fe`: formato, lint, typecheck, 75/75 tests y build correctos.
- El workflow temporal usado para generar lockfile/formatear se eliminó; `.github/workflows/` contiene únicamente `ci.yml`.

**Límite separado:** `spec/ir-v1.types.ts` continúa mantenido manualmente, pero la estructura se contrasta ahora mediante AUD-012. TypeScript no expresa restricciones como `minLength`, `pattern` o `format`; Ajv sigue siendo la autoridad runtime para ellas.

### 4.4 AUD-012 — coherencia automática entre JSON Schema y tipos TypeScript (en curso)

- Añadido `scripts/check-ir-types.mjs`, sin dependencias nuevas: lee `spec/ir-v1.schema.json`, proyecta sus construcciones estructurales admitidas a tipos TypeScript temporales y compara ambos sentidos con los tipos exportados en `spec/ir-v1.types.ts` mediante el compilador TypeScript.
- Comprueba todas las definiciones de `$defs` y el objeto raíz `IrDocument`; una tabla de correspondencias explícita evita que se omitan definiciones.
- El checker falla ante keywords estructurales desconocidas o referencias no mapeadas. Para `oneOf`, exige ramas referenciadas con discriminadores `type` literales y únicos, condición necesaria para que la unión TypeScript represente el contrato actual.
- Se ha añadido `npm run check:ir-types` a `npm run verify` y como paso obligatorio de `.github/workflows/ci.yml`.
- No se han añadido dependencias ni se ha modificado `package-lock.json`.
- El checker incorpora una prueba negativa: altera temporalmente el tipo del campo raíz `document` y exige que TypeScript rechace la divergencia.
- **Pendiente de verificación:** ejecutar el control positivo y negativo, corregir cualquier fallo y comprobar la puerta completa de CI sobre el HEAD final.

### 4.5 Deuda técnica restante

1. El catálogo de estilos sigue siendo neutral: sus propiedades y compatibilidad no están contrastadas todavía con las capacidades reales de XMind ni con las del exportador SVG.
2. Los IDs de runs son deterministas para un mismo IR, pero pueden variar si se insertan o reordenan elementos antes de rutas basadas en índices. Esta limitación está documentada.
3. La validación de color cubre los formatos CSS admitidos por el contrato actual, no toda la especificación CSS Color 4.
4. El contrato de sombras y la reinicialización de procedencia de objetos están validados en el motor, pero necesitarán pruebas de integración cuando existan adaptadores.

`AUD-002` se considera cerrada respecto de la robustez interna definida en sus criterios. Estos puntos quedan como deuda explícita para las tareas de adaptadores y validación de interoperabilidad.

## 5. Backlog maestro ordenado

Los IDs de tarea son permanentes. Cambiar el orden o el alcance exige actualizar este documento y la hoja de ruta.

| ID | Prioridad | Tarea | Criterio de aceptación | Estado |
|---|---:|---|---|---|
| AUD-001 | P0 | Estabilizar CI y recuperar la puerta de calidad de la fase 6 | Test de procedencia corregido; workflow read-only sin auto-push; format, lint, typecheck, tests y build verdes sobre el commit de código | Completada y verificada |
| AUD-002 | P1 | Completar revisión de robustez del motor de estilos | Validadores de color/objetos robustos; procedencia coherente; referencias y ciclos diagnosticados; contrato de IDs y límites de compatibilidad documentados; pruebas y CI verdes | Completada y verificada |
| AUD-003 | P1 | Integrar validación JSON Schema runtime | Ajv Draft 2020-12 integrado; SC-001…SC-005 y SC-101…SC-110 automatizados; pipeline estructural→semántico; CI verde | Completada y verificada |
| AUD-004 | P1 | Completar corpus de conformidad parser/IR | Fixtures positivos y negativos de cada bloque/directiva, diagnósticos y posiciones de origen; regresión reproducible | Pendiente |
| AUD-005 | P1 | Implementar adaptador JSON y CLI | Comandos de parse, validate y export JSON; códigos de salida; rutas Windows; ejecución local y CI | Pendiente |
| AUD-006 | P1 | Evaluar SDK oficial XMind y decidir estrategia | Informe de API, formatos, Node, licencia, actividad, cobertura, dependencias y prueba mínima | Pendiente |
| AUD-007 | P1 | Implementar exportador XMind inicial | Paquete generado, matriz de capacidades y diagnósticos de pérdidas; estructura ZIP/JSON comprobada | Pendiente |
| AUD-008 | P2 | Implementar adaptador SVG | SVG válido, renderizado determinista, metadatos semánticos y pruebas visuales/estructurales | Pendiente |
| AUD-009 | P2 | Crear corpus real y validar con XMind Desktop | Fixtures de referencia abiertos y guardados en versión Desktop identificada; informe de fidelidad | Pendiente |
| AUD-010 | P2 | Documentación de usuario y publicación | Instalación, gramática, ejemplos, CLI, limitaciones, releases y artefactos | Pendiente |
| AUD-011 | P3 | Diseñar e implementar visor web | Arquitectura aprobada, IR consumido sin duplicar semántica, accesibilidad y pruebas Playwright | Pendiente |
| AUD-012 | P1 | Automatizar coherencia entre JSON Schema y tipos TypeScript | Checker estructural bidireccional de todas las definiciones y del IR raíz; rechazo de keywords no soportadas; prueba negativa de drift; documentar restricciones no expresables en TS; CI verde | En curso |

### Dependencias

- AUD-001 desbloquea el cierre formal de la fase 6.
- AUD-002 y AUD-003 deben estar resueltas antes de considerar estable el pipeline de compilación.
- AUD-012 depende de AUD-003: el runtime schema ya es operativo; el checker estructural está implementado inicialmente y necesita verificación positiva, prueba negativa de drift y CI verde.
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

**AUD-001, AUD-002 y AUD-003 están completadas y verificadas. AUD-012 está en curso en `feature/phase-6-style-engine`.** No iniciar AUD-004 ni otra tarea hasta cerrar y verificar AUD-012.

## 8. Registro de sesiones

### 8.1 Prompt maestro y continuidad

El documento rector es `docs/ai-master-prompt.md`. Se ha reescrito como especificación de producto greenfield: define misión, requisitos, arquitectura objetivo, contrato IR, estrategia de exportación, calidad, fuentes de verdad y protocolo de trabajo. No debe describir implementaciones ajenas ni depender de conversaciones anteriores. El estado dinámico (fase, tareas, ramas, commits, pruebas y siguiente paso) se mantiene en este registro y en `docs/roadmap.md`.


| Fecha | Trabajo | Resultado / commit | Próxima acción |
|---|---|---|---|
| 2026-11-10 | Auditoría inicial completa y AUD-001 | Auditoría registrada; commit `2c594eaadd3a3bb794c73d5607ef39bb5b15a9ac`; CI [42826867694](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42826867694) verde con 46/46 pruebas, lint, typecheck, formato y build | AUD-002 |
| 2026-11-10 | AUD-002: revisión, endurecimiento y verificación del motor | Corregidos catálogo de color, `shadow`, procedencia de reinicios, referencias inexistentes y cadenas de herencia incompletas; añadidas pruebas de regresión y actualizado `docs/style-system.md`. CI normal verde: [42833075950](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42833075950), SHA `21dae3248be2963ccc77b00b79dffd1afd92a98d` | Solicitar autorización para AUD-003 |
| 2026-11-10 | Reescritura del prompt maestro y sincronización documental | `docs/ai-master-prompt.md` reescrito desde cero como especificación greenfield; auditoría corregida para reflejar AUD-002 verificada y el HEAD real; hoja de ruta y README sincronizados | AUD-003 |
| 2026-11-10 | AUD-003: integración runtime JSON Schema | Ajv 8.20.0 + `ajv-formats` 3.0.1; `validateIrSchema`, pipeline `validateIr` y casos SC automatizados. CI normal verde: [42844634106](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42844634106), HEAD `3720239503da81d950a9f83a2ebaa392302258fe`, 75/75 tests; formato, lint, typecheck y build verdes. | AUD-012 |
| 2026-11-10 | AUD-012: implementación inicial del control schema/TypeScript | Añadido `scripts/check-ir-types.mjs`, comprobación de equivalencia estructural del IR raíz y todas las definiciones `$defs`, comando `check:ir-types` y paso CI. Commit de implementación `c559ae159546d9e6872c0d9082dcf53fa3b9ca53`; la prueba negativa ya está incorporada, pero la ejecución positiva/negativa y CI siguen pendientes. | Corregir y ejecutar el checker; después completar verificación |
