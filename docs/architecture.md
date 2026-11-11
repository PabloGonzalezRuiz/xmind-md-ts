# Arquitectura

## 1. Objetivo

Transformar Markdown enriquecido en mapas mentales mediante un compilador modular. XMind es el primer destino, no el modelo interno.

## 2. Flujo lógico implementado

    Markdown + YAML + directivas
                |
                v
          Parser Markdown
                |
                v
          IR v1.0.0
                |
                v
      Validación estructural
          JSON Schema/Ajv
                |
                v
       Validación semántica
                |
                v
       Resolución de estilos
                |
                v
          IR validado
          /    |    \
         v     v     v
      XMind   JSON   SVG
                       |
                       v
                Visor web futuro

El pipeline completo de validación se implementa en src/validation/complete-validator.ts. La CLI y los adaptadores consumen IR validado; la resolución de estilos es una vista derivada y no muta las declaraciones del documento.

## 3. Módulos y responsabilidades

| Módulo | Responsabilidad | No debe hacer |
|---|---|---|
| src/markdown | Markdown, front matter y directivas a IR | Resolver estilos de destino |
| spec | Contrato IR, schema y tipos generados | Contener lógica de ejecución |
| src/validation | Validación estructural y semántica | Corregir silenciosamente datos |
| src/styles | Catálogo y resolución de estilos | Conocer campos internos del SDK XMind |
| src/adapters/json | Serialización canónica del IR | Cambiar el IR |
| src/adapters/xmind | IR a paquete XMind | Interpretar Markdown |
| src/adapters/svg | IR a SVG | Reinterpretar directivas |
| src/cli | Argumentos, rutas y coordinación | Contener reglas de dominio |
| viewer (futuro) | Visualización e interacción web | Mantener semántica duplicada |

La implementación está separada en archivos TypeScript; consulta el inventario de módulos en docs/project-audit-and-continuation.md.

## 4. Modelo de ejecución

### Local

Node.js 24 ejecuta la CLI en Windows, Linux o macOS. npm instala dependencias y scripts uniformes para desarrollo, pruebas y build.

### GitHub Actions

La CI general corre en Ubuntu y Windows, instala con npm ci y ejecuta formato, lint, comprobación de tipos generados, typecheck, Vitest, build y smoke test CLI. Un workflow separado prueba el SDK XMind en un directorio temporal aislado.

### Navegador

El visor futuro será una aplicación web separada del núcleo Node. Consumirá IR serializado y compartirá contratos cuando sea viable. No forma parte de la implementación actual.

## 5. Contratos entre capas

- El parser produce IR y diagnósticos con ubicaciones de origen.
- El JSON Schema define la estructura normativa; los tipos TS se generan desde él.
- El validador estructural no sustituye la validación semántica.
- El validador semántico comprueba referencias e invariantes globales.
- El resolutor produce estilos efectivos y procedencia sin modificar el IR.
- Cada adaptador declara capacidades, aproximaciones, omisiones y pérdidas.
- La CLI devuelve códigos de salida estables y separa salida de datos y diagnósticos.

## 6. Determinismo e identidad

La misma fuente y configuración deben producir el mismo IR lógico y los mismos identificadores, salvo campos explícitamente volátiles. Los IDs explícitos preservan identidad durante renombrados o movimientos. Los IDs derivados dependen de namespace y ruta estructural; pueden cambiar al mover o reordenar nodos.

## 7. Errores y diagnósticos

Los diagnósticos incluyen código estable, severidad, mensaje, ruta y ubicación cuando existe. Se distinguen errores de parsing, validación estructural, validación semántica, estilos y exportación. Los adaptadores fallan explícitamente ante datos que no pueden representar de forma segura.

## 8. Evolución

El IR se versiona independientemente del paquete npm. Los adaptadores declaran versiones soportadas. Los cambios incompatibles requieren migración o rechazo explícito; no se reinterpretan silenciosamente.

## 9. Estado de interoperabilidad

La exportación estructural XMind está implementada con xmind 2.2.33 y se prueba en CI sobre Ubuntu/Windows. No se ha validado apertura/guardado con XMind Desktop. El SVG es determinista y autocontenido, pero documenta pérdidas visuales para assets, sombras y contenido enriquecido. Consulta docs/adapters.md.
