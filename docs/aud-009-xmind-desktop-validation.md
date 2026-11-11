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

- [ ] El archivo original abre sin errores.
- [ ] La jerarquía y el orden de los temas son correctos.
- [ ] Los caracteres españoles se muestran correctamente.
- [ ] Las notas y el enlace se conservan según las capacidades documentadas.
- [ ] La copia se guarda correctamente.
- [ ] La copia guardada vuelve a abrirse sin errores y conserva el contenido.
- [ ] Se registra la versión exacta de XMind Desktop y el sistema operativo.

## Evidencia que debe registrarse

- Versión exacta de XMind Desktop.
- Sistema operativo.
- Resultado de apertura del archivo original.
- Resultado de guardado de la copia.
- Resultado de reapertura de la copia.
- Incidencias visuales o funcionales observadas.

No marcar AUD-009 como completada hasta disponer de esta evidencia. Si hay fallos, conservar el artefacto original y describir el mensaje exacto y el paso en que aparece.
