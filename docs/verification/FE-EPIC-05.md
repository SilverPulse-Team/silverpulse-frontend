# Verificación FE-EPIC-05 — Importación multifuente de observaciones

Fecha de verificación técnica: 15 de noviembre de 2026.

## Resultado general

Los tres subissues están implementados técnicamente en secuencia y cuentan con evidencia reproducible. El Epic padre **todavía no debe marcarse como completado** porque permanecen pendientes la vinculación administrativa de subissues/PR, la revisión visual manual y la integración contra un FastAPI operativo.

## Criterios de aceptación del issue padre

| Criterio | Estado | Evidencia / pendiente |
| --- | --- | --- |
| FE-16 está implementado, verificado y vinculado como subissue | Parcial | Implementación y verificación técnica completas en `docs/verification/FE-16.md`. La vinculación real en GitHub Project/subissues no fue comprobada desde esta sesión. |
| FE-17 está implementado, verificado y vinculado como subissue | Parcial | Parsing, mapeo, corrección y pruebas completos en `docs/verification/FE-17.md`. Vinculación administrativa pendiente de comprobar. |
| FE-18 está implementado, verificado y vinculado como subissue | Parcial | POST múltiple/individual, resultados, errores, refresh y pruebas completos en `docs/verification/FE-18.md`. Vinculación administrativa pendiente de comprobar. |
| Pantallas y acciones respetan OpenAPI v0.2.0 y fixtures | Cumple técnicamente | Se usa `ImportRequest` con JSON, `DataSource`, `ObservationInput`, `ImportResult` y `Observation`; endpoints y parsers corresponden al YAML. Tests verifican URL, método, headers, body y respuesta. |
| Datos ficticios/sintéticos tienen etiquetado visible y no se inventan resultados clínicos | Cumple | Escenario, preview, confirmación y resultado mock muestran DEMO/SINTÉTICO/no persistido. No hay inferencias clínicas; indicadores y unidades se validan contra catálogo. |
| Se verificaron carga, error, vacío y responsive donde corresponde | Parcial | Estados implementados y comprobados por TypeScript/lint. Responsive usa tabla/tarjetas y acciones móviles. Falta inspección visual manual en 1440, 768 y 390 px y recorrido real con teclado. |
| Existe Pull Request revisado con evidencia y limitaciones | No cumple todavía | Los documentos de evidencia existen localmente, pero no se creó ni verificó un PR revisado durante estas sesiones. |

## Cobertura de tareas del Epic

### FE-16 — Flujo guiado

- Cuatro pasos: origen, mapeo, validación y confirmación.
- CSV, JSON y escenario sintético.
- Proveedor, fuente, astronauta, fase, actividad y archivo.
- Drag-and-drop, extensión inválida, archivo vacío, loading/error/empty.
- Catálogo y preview responsive.

### FE-17 — Parsing y contrato canónico

- CSV/JSON convertidos localmente a `ImportRequest`.
- Mapeo de campos contractuales sin deducir indicadores.
- Fuente con identificador, tipo, proveedor y etiqueta sintética.
- Rechazo de fecha, unidad, métrica, fase, calidad, fuente o campo inválido.
- Registro original preservado en `context`.
- Filas editables y pruebas válidas/inválidas.

### FE-18 — Registro y respuesta

- POST múltiple e individual mediante la interfaz común `DataProvider`.
- Doble envío impedido con botón deshabilitado y lock síncrono.
- Aceptados, rechazados, IDs y errores mostrados desde la respuesta.
- Manejo de 400, 409 y 422 sin marcar éxito.
- Corrección de filas rechazadas sin reenviar las aceptadas en un resultado parcial.
- Refresh de historial y navegación a tendencias/panel.
- Resultado mock identificado como simulado y no persistente.

## Verificaciones acumuladas

- `npm test` — 5 archivos, 24 pruebas correctas.
- `npm run build` — correcto.
- `npm run lint` — correcto, sin errores ni advertencias.
- `git diff --check` — correcto.
- `/astronaut/import` servido localmente — `HTTP/1.1 200 OK`.
- No se ejecutó un backend FastAPI real.
- No había navegador conectado para capturas ni QA visual manual.

## Condiciones necesarias para cerrar el Epic

1. Ejecutar la importación con `VITE_DATA_PROVIDER=http` contra FastAPI v0.2.0 y conservar evidencia de POST + historial actualizado.
2. Revisar visualmente 1440, 768 y 390 px; recorrer selección, corrección, confirmación y cancelación con teclado.
3. Crear/revisar el Pull Request de integración con enlaces a FE-16, FE-17, FE-18 y estos documentos.
4. Confirmar en GitHub que los tres issues están vinculados como subissues del Epic y en el Project correcto.
5. Registrar limitaciones reales: provider mock no persiste; el frontend no valida clínicamente ni representa infraestructura espacial real.
