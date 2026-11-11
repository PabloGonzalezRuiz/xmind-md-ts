# Distribución y preparación de releases

## Estado actual

**Artefacto de distribución generado y verificado:** workflow [43012600819](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43012600819), basado en el commit `70bcbf42dd48fabb5108087f437d39446ce71f13`. Artefacto `xmind-md-ts-distribution` (ID `13851262408`), disponible hasta el 2026-12-11. Contiene `xmind-md-ts-0.1.0.tgz`, `README.txt` y `SHA256SUMS.txt`. SHA-256 del tarball: `8276da05de8d3d2c96781b48c6acd30780152b8d7d34adab4b430cdea89827dd`.

La CI [43012605756](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43012605756), sobre el HEAD documental final `c276c839bacaf8fce4ee03ee8cea7f5caca12bb4`, terminó correctamente en Ubuntu y Windows: 124/124 pruebas por sistema, formato, lint, tipos generados, typecheck, build, smoke CLI, validación de los dos ejemplos, exportaciones JSON/XMind/SVG e instalación del tarball en un directorio limpio. El único commit entre el SHA que produjo el artefacto y el HEAD final elimina el workflow temporal de formateo; no modifica el contenido del paquete.


AUD-010 prepara la documentación de usuario, ejemplos reproducibles y criterios de empaquetado. A fecha de esta revisión:

- La aplicación funciona desde el repositorio con Node.js 24 y npm.
- El ejecutable CLI está compilado en `dist/src/cli/main.js` y el lanzador es `bin/xmind-md.js`.
- `package.json` declara `private: true`, por lo que npm impide publicar el paquete en el registro.
- La versión de paquete es `0.1.0`; no debe presentarse como una versión estable 1.0.
- El proyecto incorpora `LICENSE` con licencia MIT y titularidad `Copyright (c) 2026 Pablo González Ruiz`. `package.json` declara `"license": "MIT"` y el paquete incluye el archivo `LICENSE`. Esta licencia cubre el código y la documentación de este repositorio; no altera las licencias de dependencias de terceros.
- La instalación de dependencias del workflow [43011667426](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43011667426) registró 15 avisos de vulnerabilidad (14 moderadas y 1 alta); aún no se ha realizado la clasificación individual ni una auditoría de dependencias específica para release.
- El SDK `xmind@2.2.33` está fijado, pero es una dependencia antigua y el adaptador no ofrece importación/round-trip ni mapea todas las capacidades del IR.

Por estos motivos no se debe publicar todavía un paquete npm ni etiquetar una release estable como 1.0.0.

## Artefacto instalable de GitHub Actions

El workflow manual `.github/workflows/aud-010-distribution-artifact.yml` genera el tarball tras ejecutar `npm run verify`, calcula SHA-256 y lo publica como artefacto de Actions durante 30 días. Para ejecutarlo: GitHub → Actions → **AUD-010 · Distribution package** → Run workflow. Descarga `xmind-md-ts-distribution`, verifica `SHA256SUMS.txt` y, en Node.js 24, instala el tarball con `npm install --global ./xmind-md-ts-0.1.0.tgz`. Después comprueba `xmind-md --help` y `xmind-md --version`.

Este mecanismo es un artefacto temporal de CI, no una release permanente ni una publicación npm.

## Ruta de distribución propuesta

1. Mantener el código fuente y los ejemplos en GitHub.
2. Generar desde un commit verificado un paquete reproducible que incluya CLI compilada, lanzador, schema IR y metadatos necesarios.
3. Probar el paquete empaquetado en un entorno limpio con Node.js 24: instalación, `--help`, `--version`, validación de ejemplo y exportación JSON/XMind/SVG.
4. Revisar las licencias de dependencias de terceros y sus avisos, sin asumir que quedan cubiertas por la MIT del proyecto.
5. Decidir el canal de distribución: GitHub Release con artefacto adjunto, npm público o ambos.
6. Solo después, fijar versión/tag, changelog, notas de release, checksums y política de soporte.

## Criterios de aceptación de una release

- [x] Licencia MIT del proyecto elegida y archivo LICENSE incorporado.
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

AUD-010 ya dispone de guía, ejemplos, verificación CI y artefacto instalable temporal. La licencia del proyecto ya está decidida (MIT, Pablo González Ruiz). La release pública permanece bloqueada hasta revisar las vulnerabilidades reportadas, decidir el canal de publicación y completar los demás criterios de aceptación. La incorporación de la licencia no autoriza por sí sola a publicar en npm ni a crear una release pública. No modificar `main`, fusionar ramas ni crear una release estable por inferencia.
