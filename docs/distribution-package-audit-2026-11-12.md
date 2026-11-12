# Auditoría del paquete de distribución — 2026-11-12

## Alcance y evidencia

Se inspeccionó el artefacto real de GitHub Actions `xmind-md-ts-release-candidate-0.1.0` (artifact ID `13941362391`, workflow run [43211658439](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43211658439)).

- Commit de origen declarado en el manifiesto: `2be69ed85ba22df524035e770d420ae117e72d94`.
- Paquete: `xmind-md-ts@0.1.0`; contrato IR: `1.0.0`.
- SHA-256 del tarball, comprobado con `sha256sum -c`: `b7abc4d2b1dc83af1130eb16b468bda532ee51e65b0c104f66b6fed69ec8137a`.
- ZIP exterior: 119,687 bytes. Tarball: 117,985 bytes. Contenido descomprimido del paquete: 78 ficheros, 482,079 bytes.
- CI del HEAD actual `352652fd96442872169400f5464657f44ffe3a5f`: [43212070056](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43212070056), success Ubuntu/Windows, 129/129 tests por plataforma; auditoría de dependencias success.
- El diff entre el commit del artefacto y el HEAD actual contiene seis cambios exclusivamente documentales. No hay cambios de código fuente, package.json o package-lock.json; sin embargo, esos documentos sí forman parte del tarball, por lo que el artefacto no representa exactamente la documentación distribuida en el HEAD actual.

## Inventario del tarball

El paquete incluye:

- `bin/xmind-md.js` como lanzador CLI.
- Código JavaScript compilado en `dist/src/**` y definiciones TypeScript `.d.ts`.
- JSON Schema IR en `spec/ir-v1.schema.json` y copia en `dist/spec/`.
- README, CHANGELOG, LICENSE, dos ejemplos y 21 documentos bajo `docs/`.
- Dependencias de runtime declaradas en package.json: remark-directive, remark-frontmatter, remark-gfm, remark-parse, unified, yaml, ajv2020, ajv-formats y xmind.

No se incluyen tests, scripts de desarrollo, configuraciones de compilación, lockfile ni dependencias de desarrollo. El campo `files` de package.json actúa como allowlist; no existe un `.npmignore`.

## Resultados y observaciones

### Correcto

1. El tarball tiene estructura npm válida y contiene el lanzador declarado en `bin`.
2. El manifiesto identifica versión de paquete, versión IR, commit de origen y run.
3. El checksum del tarball coincide.
4. La instalación limpia y las comprobaciones CLI `--help`, `--version` y validación del ejemplo están registradas como satisfactorias en el preflight.
5. El paquete declara Node.js `>=24.0.0`; el CI actual y el preflight se ejecutan con Node.js 24.
6. `private: true` impide publicar accidentalmente en npm, pero no impide adjuntar el tarball a una GitHub Release ni instalarlo localmente desde un archivo.

### Hallazgos que deben resolverse antes de una distribución final

**DP-001 — Artefacto no sincronizado con el HEAD documental actual (prioridad alta).** El tarball se construyó desde `2be69ed...`. El HEAD actual es `352652f...`; seis documentos que sí se incluyen en el paquete cambiaron después de construirlo (README y cinco documentos de `docs/`). Aunque no cambió el código ni el manifiesto de dependencias, el artefacto no contiene la documentación actual. Debe regenerarse desde el SHA exacto que se pretenda publicar.

**DP-002 — Documentación operativa incluida en el paquete (prioridad media).** La regla `"docs/"` incorpora indiscriminadamente 21 documentos, incluidos el prompt maestro para IA, auditorías técnicas, registro de continuidad y documentos de trabajo del proyecto. Recomiendo sustituir el directorio completo por una allowlist de documentación de usuario y técnica necesaria para instalar, utilizar y entender el formato. La decisión de qué documentos publicar debe confirmarse antes de cambiar el manifiesto `files`.

**DP-003 — Source maps sin fuentes TypeScript (prioridad media).** Se incluyen 24 mapas `.js.map`/ `.d.ts.map`, pero no los `.ts` originales ni `sourcesContent`. Sus rutas `sources` apuntan a archivos ausentes en el tarball. Debe decidirse entre incluir fuentes TypeScript y mantener mapas útiles, o desactivar/eliminar mapas en el artefacto de distribución.

**DP-004 — API programática no declarada en package root (prioridad media, condicionada al alcance).** El paquete contiene `dist/src/index.js`, pero package.json no declara `main`, `exports` ni `types`. La CLI está declarada correctamente mediante `bin`; la importación por nombre de paquete no está expuesta como API pública. Si el producto se distribuye como CLI exclusivamente, documentarlo explícitamente. Si se promete uso como librería, añadir entradas ESM/tipos y pruebas de importación desde una instalación limpia.

**DP-005 — Notas de versión obsoletas (prioridad media).** El `CHANGELOG.md` empaquetado y `RELEASE-NOTES-DRAFT.md` indican 124/124 pruebas, mientras que el CI más reciente en el HEAD actual informa 129/129. Las notas también presentan el contenido como `Unreleased`; deben regenerarse/revisarse al preparar la versión concreta.

**DP-006 — Documentación de uso todavía describe ejecución desde el repositorio (prioridad media).** `docs/user-guide.md` dice que no existe instalador independiente y explica clonar la rama de desarrollo. Para una GitHub Release descargable debe añadirse un procedimiento coherente de instalación desde el tarball y una declaración clara de que npm no es el canal de publicación.

## Conclusión de la actividad 1

La estructura básica de la CLI y el tarball es válida, el checksum es correcto y la CI reciente pasa en Ubuntu y Windows. Sin embargo, el artefacto inspeccionado no debe considerarse candidato final de publicación: está desfasado respecto a la documentación del HEAD, incluye documentación operativa no seleccionada, contiene mapas sin sus fuentes y las notas de versión están obsoletas.

No se modificó el paquete, no se creó ningún tag o release y no se publicó en npm. Los DP-001 a DP-006 quedan registrados para una decisión de corrección antes de cerrar la preparación de distribución.
