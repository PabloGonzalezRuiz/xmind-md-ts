# Arquitectura

## 1. Objetivo

Transformar Markdown enriquecido en mapas mentales mediante un compilador modular. El formato XMind es el primer destino, no el modelo interno.

## 2. Flujo lógico

```text
Markdown + YAML + directivas
            |
            v
      Parser Markdown
            |
            v
       AST semántico
            |
            v
   Construcción del IR tipado
            |
            v
  Validación + diagnósticos
            |
            v
 Resolución de estilos y referencias
            |
            v
      IR validado/resuelto
       /       |        \
      v        v         v
   XMind     JSON       SVG
                         |
                         v
                  Visor web futuro
```

El AST del parser puede ser transitorio. El IR es el contrato estable entre las fases del compilador y los adaptadores. La versión normativa actual es IR v1.0.0, definida en `docs/ir-specification.md` y validada estructuralmente por `spec/ir-v1.schema.json`.

## 3. Módulos y responsabilidades

| Módulo | Responsabilidad | No debe hacer |
|---|---|---|
| `authoring` | Tipos y metadatos de entrada | Serializar XMind |
| `parser` | Markdown y directivas a estructura semántica | Resolver estilos de destino |
| `ir` | Entidades, tipos, serialización y versionado | Importar SDK XMind |
| `validation` | Reglas estructurales y semánticas | Corregir silenciosamente datos |
| `styles` | Cargar, heredar y resolver estilos | Conocer campos internos de XMind |
| `adapters/xmind` | IR a paquete XMind | Interpretar Markdown |
| `adapters/json` | Exportar IR para inspección/intercambio | Cambiar el IR |
| `adapters/svg` | Renderizar SVG desde IR | Reinterpretar directivas |
| `cli` | Argumentos, rutas, opciones y coordinación | Contener lógica de dominio |
| `viewer` (futuro) | Visualización e interacción web | Mantener una segunda semántica del documento |

La estructura física definitiva se ajustará durante la fase de implementación, sin romper estas fronteras.

## 4. Modelo de ejecución

### Local

Node.js ejecuta la CLI en Windows, Linux o macOS. npm instala las dependencias y los scripts del proyecto ofrecen comandos uniformes para desarrollo, pruebas y build.

### GitHub Actions

Los workflows configuran Node.js, instalan con `npm ci`, ejecutan comprobación de tipos, lint, pruebas y build. Los workflows pueden activarse en `push`, `pull_request` y manualmente mediante `workflow_dispatch`.

GitHub Actions debe usar las mismas órdenes que el desarrollo local. No debe existir una implementación distinta para CI.

### Navegador

El visor futuro será una aplicación web separada del núcleo de Node. Consumirá IR serializado y compartirá tipos/contratos cuando sea viable, pero no dependerá de APIs exclusivas de Node. Los módulos compartidos deben evitar filesystem, procesos y otras APIs de Node.

## 5. Contratos entre capas

- El parser entrega una estructura semántica con ubicaciones de origen.
- El constructor produce un IR conforme a la versión de esquema.
- El validador devuelve diagnósticos tipados y no muta silenciosamente el documento.
- El resolutor produce valores efectivos y conserva procedencia.
- Cada adaptador declara sus capacidades y pérdidas.
- La CLI devuelve códigos de salida consistentes y mensajes útiles.
- Los adaptadores no alteran el IR de entrada.

## 6. Determinismo e identidad

La misma fuente y configuración deben producir el mismo IR lógico y los mismos identificadores, salvo campos explícitamente volátiles. Se admiten IDs explícitos para conservar identidad durante renombrados o movimientos. Los IDs derivados se calculan de forma determinista según namespace y ruta estructural; pueden cambiar al mover/reordenar nodos. Para preservar identidad entre refactorizaciones se requieren IDs explícitos.

## 7. Errores y diagnósticos

Los diagnósticos deben incluir código estable, severidad, mensaje, archivo y ubicación cuando exista, más una sugerencia cuando sea útil. Distinguir errores de sintaxis, validación, resolución y exportación. Los adaptadores deben fallar explícitamente ante datos que no puedan representar de forma segura.

## 8. Evolución

El IR se versiona independientemente del paquete npm. Los adaptadores declaran las versiones de IR que soportan. Los cambios incompatibles requieren migración o rechazo explícito; no se reinterpretan silenciosamente.
