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
- Una instalación anterior registró 15 avisos (14 moderados, 1 alto). Ese recuento no se ha reproducido ni clasificado contra el lockfile actual; debe tratarse como señal histórica pendiente de auditoría, no como inventario vigente.
- El SDK `xmind@2.2.33` está fijado, pero es una dependencia antigua y el adaptador no ofrece importación/round-trip ni mapea todas las capacidades del IR.

Por estos motivos no se debe publicar todavía un paquete npm ni etiquetar una release estable como 1.0.0.

## Artefacto instalable de GitHub Actions

El workflow manual `.github/workflows/aud-010-distribution-artifact.yml` genera el tarball tras ejecutar `npm run verify`, calcula SHA-256 y lo publica como artefacto de Actions durante 30 días. Para ejecutarlo: GitHub → Actions → **AUD-010 · Distribution package** → Run workflow. Descarga `xmind-md-ts-distribution`, verifica `SHA256SUMS.txt` y, en Node.js 24, instala el tarball con `npm install --global ./xmind-md-ts-0.1.0.tgz`. Después comprueba `xmind-md --help` y `xmind-md --version`.

Este mecanismo es un artefacto temporal de CI, no una release permanente ni una publicación npm.

## Ruta de distribución acordada

**Canal principal: GitHub Releases.** El usuario ha elegido distribuir las versiones mediante la sección Releases del repositorio, adjuntando los paquetes descargables y sus checksums. La publicación en npm queda aplazada para una fase posterior.

1. Mantener el código fuente y los ejemplos en GitHub.
2. Generar desde un commit verificado un paquete reproducible que incluya CLI compilada, lanzador, schema IR, documentación, ejemplos y licencia.
3. Probar el paquete empaquetado en un entorno limpio con Node.js 24: instalación, `--help`, `--version`, validación de ejemplo y exportación JSON/XMind/SVG.
4. Revisar las licencias de dependencias de terceros y sus avisos, sin asumir que quedan cubiertas por la MIT del proyecto.
5. Preparar un workflow de publicación de GitHub Release, con tag/versionado, changelog, notas, artefactos y checksums.
6. Mantener npm fuera del alcance de esta primera distribución; se reconsiderará posteriormente.

`package.json` conserva `private: true` porque no se publicará en npm en esta fase. Esta propiedad no impide crear GitHub Releases.

## Criterios de aceptación de una release

- [x] Licencia MIT del proyecto elegida y archivo LICENSE incorporado.
- [ ] Política de versionado y compatibilidad IR documentada.
- [ ] Auditoría actual de vulnerabilidades y licencias de dependencias completada.
- [ ] Versión del paquete y tag coincidentes.
- [ ] Paquete construido desde un SHA identificado.
- [ ] Instalación probada en un directorio limpio con Node.js 24.
- [ ] CLI responde a `--help` y `--version`.
- [ ] Ejemplo validado y exportado a JSON, XMind y SVG.
- [ ] Checksums SHA-256 publicados.
- [ ] Notas de release describen capacidades, limitaciones y cambios.
- [ ] No se anuncia compatibilidad más amplia que la realmente probada.

## Restricciones de esta tarea

AUD-010 ya dispone de guía, ejemplos, verificación CI y artefacto instalable temporal. La licencia del proyecto ya está decidida (MIT, Pablo González Ruiz). La release pública permanece bloqueada hasta clasificar las vulnerabilidades, revisar las licencias de dependencias, preparar/probar el workflow GitHub Releases y completar los demás criterios de aceptación. La incorporación de la licencia no autoriza por sí sola a publicar en npm ni a crear una release pública. No modificar `main`, fusionar ramas ni crear una release estable por inferencia.


## Verificación más reciente — 2026-11-11

- HEAD: `72c411eed5b497d2399d152f1b27595ad468dd19`.
- CI del HEAD: [43015959095](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43015959095), Ubuntu y Windows success, 124/124 pruebas por sistema; incluye formato, lint, tipos, typecheck, build, CLI, ejemplos y verificación del paquete.
- SDK probe: [43015959098](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43015959098), Ubuntu y Windows success.
- Artefacto de distribución: [run 43015946683](https://github.com/PabloGonzalezRuiz/xmind-md-ts/actions/runs/43015946683), artefacto ID `13852422612`, disponible hasta 2026-12-11. Digest SHA-256 del ZIP de Actions: `b50009e4761e2d14b84b5eb84da2cb06b89e15503ccc851c74815ebf49022846`.
- Canal acordado: GitHub Releases. npm aplazado; mantener `private: true`.
- Próximo trabajo: auditoría actual reproducible de dependencias y licencias; política de versionado/compatibilidad IR; preparar y probar workflow de release sin publicar.
