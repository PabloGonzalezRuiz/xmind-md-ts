# Distribución y preparación de releases

## Estado actual

AUD-010 prepara la documentación de usuario, ejemplos reproducibles y criterios de empaquetado. A fecha de esta revisión:

- La aplicación funciona desde el repositorio con Node.js 24 y npm.
- El ejecutable CLI está compilado en `dist/src/cli/main.js` y el lanzador es `bin/xmind-md.js`.
- `package.json` declara `private: true`, por lo que npm impide publicar el paquete en el registro.
- La versión de paquete es `0.1.0`; no debe presentarse como una versión estable 1.0.
- No hay todavía un archivo de licencia en la raíz. La licencia del SDK XMind no determina la licencia de este proyecto.
- El SDK `xmind@2.2.33` está fijado, pero es una dependencia antigua y el adaptador no ofrece importación/round-trip ni mapea todas las capacidades del IR.

Por estos motivos no se debe publicar todavía un paquete npm ni etiquetar una release estable como 1.0.0.

## Artefacto instalable de GitHub Actions

El workflow manual `.github/workflows/aud-010-distribution-artifact.yml` genera el tarball tras ejecutar `npm run verify`, calcula SHA-256 y lo publica como artefacto de Actions durante 30 días. Para ejecutarlo: GitHub → Actions → **AUD-010 · Distribution package** → Run workflow. Descarga `xmind-md-ts-distribution`, verifica `SHA256SUMS.txt` y, en Node.js 24, instala el tarball con `npm install --global ./xmind-md-ts-0.1.0.tgz`. Después comprueba `xmind-md --help` y `xmind-md --version`.

Este mecanismo es un artefacto temporal de CI, no una release permanente ni una publicación npm.

## Ruta de distribución propuesta

1. Mantener el código fuente y los ejemplos en GitHub.
2. Generar desde un commit verificado un paquete reproducible que incluya CLI compilada, lanzador, schema IR y metadatos necesarios.
3. Probar el paquete empaquetado en un entorno limpio con Node.js 24: instalación, `--help`, `--version`, validación de ejemplo y exportación JSON/XMind/SVG.
4. Decidir y añadir explícitamente la licencia del proyecto.
5. Decidir el canal de distribución: GitHub Release con artefacto adjunto, npm público o ambos.
6. Solo después, fijar versión/tag, changelog, notas de release, checksums y política de soporte.

## Criterios de aceptación de una release

- [ ] Licencia del proyecto elegida y archivo LICENSE incorporado.
- [ ] Política de versionado y compatibilidad IR documentada.
- [ ] Versión del paquete y tag coincidentes.
- [ ] Paquete construido desde un SHA identificado.
- [ ] Instalación probada en un directorio limpio con Node.js 24.
- [ ] CLI responde a `--help` y `--version`.
- [ ] Ejemplo validado y exportado a JSON, XMind y SVG.
- [ ] Checksums SHA-256 publicados.
- [ ] Notas de release describen capacidades, limitaciones y cambios.
- [ ] No se anuncia compatibilidad más amplia que la realmente probada.

## Restricciones de esta tarea

La autorización de AUD-010 permite preparar la documentación y automatización de empaquetado. No implica elegir una licencia legal ni publicar en npm o crear una release pública sin una decisión explícita sobre esos dos puntos. No modificar `main`, fusionar ramas ni crear una release estable por inferencia.
