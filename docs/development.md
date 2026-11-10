# Desarrollo local y automatización

## 1. Entorno local

Requisitos previstos:
- Windows 10/11, Linux o macOS.
- Node.js LTS compatible con el proyecto.
- npm incluido con Node.js.
- Git.
- Visual Studio Code recomendado.

La versión exacta de Node se fijará en `.nvmrc` o `.node-version` y en la configuración de CI. No instalar dependencias globales salvo que exista una razón documentada.

## 2. Instalación y comandos

Una vez creado el proyecto ejecutable, el flujo previsto será:

```powershell
npm ci
npm run typecheck
npm run lint
npm test
npm run build
```

Los nombres y scripts se consideran planificados hasta que existan en package.json. No ejecutar ni documentar comandos como disponibles antes de implementarlos.

## 3. Ejecución de la CLI

La CLI se diseñará para poder invocarse localmente desde PowerShell y terminales compatibles. Debe ofrecer ayuda, validación sin exportar, selección de adaptador, rutas de entrada/salida, modo estricto/compatible y diagnóstico detallado.

## 4. Depuración

Se recomienda VS Code con depurador Node.js, source maps y scripts de desarrollo. Los errores deben conservar stack trace en modo debug y ofrecer mensajes concisos en modo normal.

## 5. GitHub Actions

El workflow principal deberá:
- Activarse en push y pull_request.
- Permitir ejecución manual con workflow_dispatch.
- Configurar Node.js desde la versión fijada.
- Instalar dependencias con npm ci.
- Ejecutar typecheck, lint, pruebas y build.
- Publicar artefactos de diagnóstico cuando proceda.
- No depender de secretos para las pruebas normales.
- Ejecutar en Linux y añadir Windows si hay pruebas de compatibilidad de rutas/ZIP.

El entorno de GitHub es efímero: no sustituye al desarrollo local ni a la validación con una aplicación de escritorio.

## 6. Contribución asistida por IA

Antes de pedir a la IA un cambio, indicar objetivo y criterio de aceptación. Mantener tareas pequeñas, exigir pruebas, revisar diff y comprobar que la documentación coincide con el comportamiento. No aceptar cambios únicamente porque la IA diga que están terminados.

## 7. Reproducibilidad y seguridad

- Mantener package-lock.json versionado.
- Usar npm ci en CI.
- Revisar licencias de dependencias directas y transitivas.
- Evitar scripts de instalación innecesarios.
- Fijar versiones de acciones y dependencias según la política del proyecto.
- No almacenar tokens ni secretos en el repositorio.
