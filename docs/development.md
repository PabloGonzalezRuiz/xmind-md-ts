# Desarrollo local y automatización

## 1. Entorno local

Requisitos:
- Windows 10/11, Linux o macOS.
- Node.js 24 o superior.
- npm incluido con Node.js.
- Git.
- Visual Studio Code recomendado.

La versión de referencia está fijada en `.nvmrc` (24). No instalar dependencias globales.

## 2. Instalación y comandos

En la raíz del repositorio:

```powershell
npm ci
npm run verify
```

Scripts disponibles:
- `npm run dev`: ejecución de desarrollo con recarga.
- `npm run build`: compila TypeScript en `dist/`.
- `npm start`: ejecuta la salida compilada.
- `npm run typecheck`: comprueba tipos sin emitir archivos.
- `npm run lint`: ejecuta ESLint.
- `npm run format` / `npm run format:check`: formatea o comprueba formato.
- `npm test` / `npm run test:watch`: ejecuta Vitest.
- `npm run verify`: ejecuta todas las comprobaciones anteriores.

`package-lock.json` está versionado. Utiliza `npm ci` tanto en local como en CI; no edites el lockfile manualmente.

## 3. Ejecución de la CLI

La CLI se diseñará para invocarse desde PowerShell y terminales compatibles. Debe ofrecer ayuda, validación sin exportar, selección de adaptador, rutas de entrada/salida, modo estricto/compatible y diagnóstico detallado. La CLI aún no está implementada.

## 4. Depuración

VS Code puede depurar Node.js/TypeScript mediante source maps. Los errores deben conservar stack trace en modo debug y ofrecer mensajes concisos en modo normal.

## 5. GitHub Actions

El workflow `.github/workflows/ci.yml` se activa en push, pull_request y workflow_dispatch. Configura Node.js 24 e instala dependencias para ejecutar formato, lint, typecheck, pruebas y build.

El workflow instala con `npm ci` y ejecuta formato, lint, typecheck, pruebas y build.

## 6. Contribución asistida por IA

Antes de pedir a la IA un cambio, indicar objetivo y criterio de aceptación. Mantener tareas pequeñas, exigir pruebas, revisar diff y comprobar que la documentación coincide con el comportamiento.

## 7. Reproducibilidad y seguridad

- Versiones directas de desarrollo fijadas en `package.json`.
- Versionar `package-lock.json` y mantener las instalaciones reproducibles con `npm ci`.
- Revisar licencias de dependencias directas y transitivas.
- Evitar scripts de instalación innecesarios.
- No almacenar tokens ni secretos en el repositorio.
