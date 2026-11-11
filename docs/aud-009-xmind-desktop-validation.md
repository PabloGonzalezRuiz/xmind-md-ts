# AUD-009 — Validación con XMind Desktop

## Objetivo

Comprobar la interoperabilidad real del paquete generado por la aplicación con XMind Desktop. La validación automatizada de ZIP/JSON en GitHub Actions no sustituye esta prueba de escritorio.

## Artefacto

El workflow `.github/workflows/aud-009-xmind-desktop-artifact.yml` genera el artefacto `aud-009-xmind-desktop-validation`, que contiene:

- `aud-009-desktop-validation.xmind`: mapa generado por la CLI compilada desde `fixtures/aud-009-desktop-validation.md`.
- `README.txt`: instrucciones y criterios de aceptación.
- `SHA256SUMS.txt`: hash SHA-256 del archivo XMind.

## Procedimiento de aceptación

1. En GitHub, abre la ejecución del workflow **AUD-009 · XMind Desktop artifact** que haya terminado correctamente.
2. Descarga el artefacto `aud-009-xmind-desktop-validation` y extrae su ZIP.
3. Comprueba que el hash del archivo XMind coincide con `SHA256SUMS.txt`.
4. Abre `aud-009-desktop-validation.xmind` con XMind Desktop.
5. Comprueba que el mapa se abre sin error ni aviso de archivo dañado.
6. Inspecciona la jerarquía: tema central, dos ramas, subtemas y el detalle anidado.
7. Comprueba los textos con tildes y eñe, las notas y el enlace de referencia.
8. Guarda una copia con otro nombre (no sobrescribas el original).
9. Cierra XMind Desktop por completo.
10. Abre de nuevo la copia guardada y comprueba que conserva jerarquía y contenido.

## Criterios de aceptación

- [x] El archivo original abre sin errores (confirmado por el usuario).
- [x] La jerarquía y el orden de los temas son correctos (captura aportada por el usuario).
- [ ] Los caracteres españoles se muestran correctamente.
- [ ] Las notas y el enlace se conservan según las capacidades documentadas.
- [x] La copia se guarda correctamente (confirmado por el usuario).
- [x] La copia guardada vuelve a abrirse sin errores y conserva el contenido (confirmado por el usuario).
- [ ] Se registra la versión exacta de XMind Desktop y el sistema operativo.

## Evidencia que debe registrarse

- Versión exacta de XMind Desktop: no facilitada; pendiente de registrar.
- Sistema operativo: no facilitado; pendiente de registrar.
- Resultado de apertura del archivo original.
- Resultado de guardado de la copia.
- Resultado de reapertura de la copia.
- Incidencias visuales o funcionales observadas.

## Resultado de la validación manual — 2026-11-11

El usuario confirmó que el archivo se abrió en XMind Desktop, que la copia con otro nombre se guardó correctamente y que, tras cerrar la aplicación, la copia volvió a abrirse conservando su contenido. La captura aportada muestra el tema central, las ramas, los subtemas y el detalle anidado; los textos visibles incluyen caracteres españoles. No se comunicaron errores ni incidencias.

**Resultado funcional: satisfactorio. AUD-009 queda completada y verificada en cuanto a apertura, representación de la jerarquía, guardado y reapertura.** La versión exacta de XMind Desktop y el sistema operativo no se facilitaron, por lo que quedan como metadatos de entorno no registrados; esta omisión no invalida las comprobaciones funcionales comunicadas.
