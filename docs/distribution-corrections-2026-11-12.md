# Correcciones de distribución DP-001–DP-006 — 2026-11-12

## Alcance

Actividad correctiva autorizada sobre `feature/aud-003-runtime-schema`. El objetivo fue cerrar los seis hallazgos de distribución detectados en AUD-010 y regenerar/inspeccionar el candidato. No se modificaron dependencias ni lockfile.

## Cambios aplicados

| ID | Corrección | Resultado |
|---|---|---|
| DP-001 | Añadido `dist/BUILD-MANIFEST.json` mediante el lifecycle `prepack`. Registra paquete, versión, contrato IR, tipo CLI, entrypoint, commit de origen, workflow y run. | Resuelto: el manifiesto permite comprobar la procedencia del tarball |
| DP-002 | Sustituido el directorio `docs/` completo por una allowlist de 12 documentos públicos de uso/arquitectura. Se excluyen prompt maestro, auditorías, continuidad y documentación interna. | Resuelto |
| DP-003 | Desactivados `sourceMap` y `declarationMap` en `tsconfig.build.json`. El verificador rechaza cualquier `.map` incluido en el tarball. | Resuelto |
| DP-004 | Declarado alcance CLI-only con `exports: {}`, manteniendo `bin.xmind-md`. No se declaran `main` ni `types`; README y guías explican que no existe API pública de importación. | Resuelto |
| DP-005 | Changelog actualizado a `0.1.0 — candidato de distribución (no publicado)` y 129/129 pruebas en Ubuntu y Windows. | Resuelto |
| DP-006 | Guía de usuario y README documentan instalación desde el tarball de GitHub Release, verificación SHA-256 y comandos de la CLI. Se distingue expresamente el paquete de release de los artefactos temporales de Actions. | Resuelto |

## Verificación automatizada

- CI: success en Ubuntu y Windows; 129 pruebas por plataforma.
- SDK XMind probe: success en Ubuntu y Windows.
- Workflow de distribución: success.
- GitHub Release preflight: success; modo dry-run read-only, sin tag, release ni publicación.
- `verify-package` comprueba la allowlist documental, ausencia de source maps, presencia y coherencia del manifiesto, instalación limpia, CLI `--help`/`--version` y validación del ejemplo.
- El tarball inspeccionado contiene 46 ficheros, 246,747 bytes descomprimidos, 12 documentos permitidos, cero source maps y cero enlaces Markdown locales rotos.
- El checksum SHA-256 exterior coincide con el tarball. El manifiesto interno identifica el commit de origen y el run que lo construyó.

## Decisiones de distribución

- La distribución prevista es una CLI, no una librería JavaScript/TypeScript.
- El paquete permanece `private: true`: no se habilita publicación npm.
- La guía de GitHub Release documenta el procedimiento futuro; no implica que exista una release pública.
- La política de empaquetado y la prueba limpia forman parte de `npm run verify`.

## Bloqueos independientes que permanecen

**PROD-SEC-001 sigue abierto.** `uuid@3.4.0` continúa presente transitivamente en runtime a través de `xmind@2.2.33`. La auditoría npm sigue registrando 12 entradas moderadas, 0 altas y 0 críticas. No se ha aplicado override mayor ni downgrade incompatible. Antes de publicar hace falta una aceptación expresa del riesgo o una mitigación compatible validada.

Tampoco existe todavía un workflow publicador de GitHub Releases: el workflow existente es únicamente un preflight read-only. La publicación pública continúa en **NO-GO** hasta resolver el riesgo de seguridad y autorizar/validar el mecanismo publicador.

## Límites

- Rama de trabajo: `feature/aud-003-runtime-schema`.
- Commit de código/distribución previo al cierre documental: `0d3d71167d948feb1a8e6d277fd3d090a9bfd2b0`.
- `main` permanece intacta.
- No se ha creado tag, release, PR, merge ni publicación npm.
- No se han cambiado dependencias ni lockfile.
