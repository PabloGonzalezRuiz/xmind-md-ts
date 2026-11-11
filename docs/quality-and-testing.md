# Calidad, pruebas y diagnóstico

## 1. Puerta de calidad

El comando local completo es:

    npm ci
    npm run verify

npm run verify ejecuta:
1. npm run format:check
2. npm run lint
3. npm run check:generated-types
4. npm run typecheck
5. npm test
6. npm run build

El workflow .github/workflows/ci.yml ejecuta las mismas comprobaciones en Ubuntu y Windows y añade un smoke test de la CLI compilada. La prueba aislada del SDK XMind tiene workflow independiente.

## 2. Estado de verificación más reciente

Código probado: 980279a6e61a990769e9884ea1fc51888d5bf054.

- CI general [42989195843](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42989195843): dos jobs completados con éxito, Ubuntu y Windows.
- En cada sistema: 11 archivos de test, 118/118 pruebas correctas.
- Pasos correctos: instalación reproducible, formato, lint, generación/sincronización de tipos, typecheck, tests, build y smoke test CLI.
- Probe SDK [42989195787](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/42989195787): Ubuntu y Windows completados con éxito; instalación aislada, generación e inspección del paquete.
- HEAD actual de rama feature/aud-003-runtime-schema: 8a8b28953ac29d7bcd5d3707f19b484d8834915c. Los dos commits posteriores al código probado solo modifican documentación; no se ha observado una ejecución CI posterior para ese HEAD documental.

No se ha ejecutado npm run verify en una máquina local durante esta auditoría. La evidencia indicada corresponde a los logs de GitHub Actions.

## 3. Pruebas por capas

- Parser: CommonMark, GFM, front matter, directivas, bloques, posiciones de origen, modos compatible/strict y códigos de diagnóstico.
- IR: fixture mínimo, JSON Schema, tipos generados, serialización y versionado.
- Validación estructural: quince casos SC definidos (SC-001…SC-005 y SC-101…SC-110), URI, rutas de instancia y no mutación.
- Validación semántica: SEM-001…SEM-018, IDs, referencias, relaciones, ciclos, tablas, límites y rutas de assets.
- Estilos: precedencia, herencia, roles, estilos nombrados, overrides, validadores y procedencia.
- CLI: argumentos, stdin/stdout, formatos, rutas, códigos de salida, generación XMind/SVG y smoke test compilado.
- XMind: validación del workbook, ZIP y JSON interno; el probe aislado prueba SDK en Ubuntu/Windows.
- SVG: estructura, determinismo, jerarquía, relaciones, límites, resúmenes, estilos, enlaces, metadata y assets omitidos.

## 4. Contrato IR y generación de tipos

La fuente de verdad estructural es spec/ir-v1.schema.json (Draft 2020-12). spec/ir-v1.types.ts es generado por scripts/generate-ir-types.js; no editarlo a mano. El generador falla ante keywords estructurales no admitidas y el check de sincronización evita drift en CI.

TypeScript no representa restricciones como formatos URI, patrones, longitudes, rangos, arrays únicos ni todas las reglas de objetos cerrados. Ajv las aplica en runtime. El validador semántico comprueba invariantes globales que JSON Schema no cubre.

## 5. Matriz de conformidad

- SC: quince casos estructurales descritos en spec/conformance/README.md.
- SEM: dieciocho casos semánticos.
- PAR: fixtures positivos, negativos y de diagnóstico en test/fixtures/markdown/.
- Adaptadores: pruebas por formato y pruebas de CLI.

No inventar IDs de conformidad que no estén definidos en la matriz.

## 6. Límites de evidencia y defectos conocidos

- CI verde demuestra que el código compila y que las pruebas automatizadas pasan en esos runners; no demuestra fidelidad visual ni apertura/guardado en XMind Desktop.
- El SDK XMind 2.2.33 es antiguo, fijado y encapsulado; revisar su cadena de dependencias.
- El exportador XMind no representa todavía relaciones, boundaries, StyleSets/overrides ni assets binarios; varias estructuras se aplanan a notas. Ver matriz en docs/adapters.md.
- SVG no dibuja assets ni sombras; el contenido se conserva en metadata y descripciones accesibles; padding puede aproximarse.
- AUD-013: el nombre de salida XMind/SVG por defecto no elimina correctamente la extensión de entrada; los errores de exportación escriben una secuencia \\n literal. No hay pruebas dedicadas a esos dos comportamientos todavía.

## 7. Diagnósticos y afirmaciones

Los diagnósticos deben conservar código estable, severidad, mensaje, ruta y posición cuando exista. Diferenciar claramente typecheck, lint, pruebas ejecutadas, build, validación JSON Schema, validación semántica, inspección ZIP/JSON, apertura/guardado en XMind Desktop y fidelidad visual.

No afirmar un nivel de verificación basándose en otro.
