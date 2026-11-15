# Verificación FE-EPIC-09 — Portal médico de Tierra y revisiones

## Alcance y estado

La implementación se realizó en la rama existente `34-fe-19---construir-matriz-de-evidencia-para-preparación-de-retorno-v4`; no se cambió de rama ni se modificaron los estados de GitHub.

| Issue | Estado técnico | Asociación GitHub |
| --- | --- | --- |
| FE-29 · Bandeja médica antes/después de entrega | Implementado y verificado | Subissue #47 de #46 |
| FE-30 · Detalle de informe recibido en Tierra | Implementado y verificado | Subissue #48 de #46 |
| FE-31 · Revisión y retorno diferido | Implementado y verificado | Subissue #49 de #46 |

La API de subissues de GitHub confirmó las relaciones #47, #48 y #49 → #46. Los issues continúan abiertos. El criterio del padre que exige un Pull Request revisado está pendiente; por eso el Epic no se declara cerrado.

## Criterios del issue padre #46

| Criterio | Resultado | Evidencia / limitación |
| --- | --- | --- |
| FE-29–FE-31 implementados, verificados y vinculados | Cumple técnicamente | Matriz por subissue abajo; asociaciones comprobadas en GitHub. |
| Contrato OpenAPI v0.2.0 y fixtures | Cumple técnicamente | Se usan los endpoints Earth existentes y `MedicalReviewInput`; los escenarios mock se conservan como snapshots. |
| Etiquetado sintético y límites clínicos | Cumple | Bandeja y detalle indican DEMO; no se generan diagnósticos, prescripciones ni autorizaciones. |
| Carga, error, vacío y responsive verificados | Cumple | Skeleton durante carga demorada, error HTTP, bandeja vacía y vistas a 1440/390 px. |
| Pull Request revisado con evidencia y limitaciones | Pendiente | No se creó ni revisó un PR. No cerrar el Epic todavía. |

## Verificación por subissue

### FE-29 — #47

- Antes de entrega, `GET /earth/reports` devuelve la bandeja vacía: 0 informes, 0 pendientes y «Aún no hay informes recibidos desde la nave». RPT-0001 no aparece ni abre como informe terrestre.
- Después de entrega, solo se muestran informes del endpoint con `communication.status=delivered` y `delivered_at_utc` confirmado. El estado `queued` por sí solo no se presenta en Tierra.
- La bandeja incluye filtros de fase, fecha de recepción UTC, astronauta y estado de revisión. Se aplican al conjunto recibido ya consultado; no llaman endpoints inexistentes ni fabrican resultados. Al no haber coincidencias se muestra un EmptyState; «Limpiar» restablece los filtros.
- Tabla accesible en escritorio y tarjetas en móvil mediante `ResponsiveDataTable`. Fuente, fase, timestamps y prioridad logística se presentan diferenciados; se aclara que `routine/priority` no representa riesgo médico.
- La vista no consulta observaciones live ni la base de datos de nave. El estado del simulador, si está disponible, se muestra solo como estado logístico.

### FE-30 — #48

- La ruta `/medical/reports/:id` solicita el informe mediante `GET /earth/reports/{id}`; una prueba del provider confirma que el detalle utiliza una sola solicitud Earth y no consulta la ruta de informes de nave.
- Si el informe no se ha recibido, la API/mock responde como no disponible y la ficha no se renderiza.
- La ficha presenta ID, astronauta, fase, fecha de creación en nave y fecha de entrega a Tierra separadas; incluye observaciones con unidad, fecha, fuente y calidad.
- Muestra método y versión ORBIT VERIFY, razones `SLEEP_TREND` / `MISSING_STRENGTH_TEST`, evidencia faltante y el aviso de que no es diagnóstico, prescripción ni autorización de retorno.
- Layout de dos columnas en escritorio y apilado en móvil; se comprobó ausencia de overflow a 390 px.

### FE-31 — #49

- La solicitud usa `review_status=reviewed`, nota no vacía, `followup_requested` booleano e `is_demo=true`, según `MedicalReviewInput`. El estado «Revisado» se muestra como fijo porque el contrato solo permite ese valor.
- Los controles de envío se deshabilitan mientras se procesa y tras una respuesta aceptada; `createSubmissionLock` protege contra doble envío. Un error HTTP permanece visible y deja disponible el reintento.
- Tras recibir `status=queued`, la confirmación muestra `review_id`, `return_message_id` y estado. No afirma recepción en nave; el enlace lleva al timeline de Mission Control y la recepción solo se confirma mediante `/ship/inbox`.
- Si el informe ya figura revisado, no se vuelve a ofrecer el formulario. La pantalla no consulta inbox ni presume que el retorno llegó.

## Comprobaciones ejecutadas

- `npm test` — 14 archivos, 69 pruebas correctas.
- `npm run build` — correcto (`tsc -b` y `vite build`).
- `npm run lint` — correcto.
- `git diff --check` — correcto.
- Navegador local: fixtures `offline`, `after-delivery` y `after-return`; filtros con resultado y sin coincidencias; envío de revisión y respuesta `queued`; vista previa de un informe ya revisado; error de API y skeleton de carga.
- Diseño responsive: bandeja y detalle revisados en 390 px; detalle en dos columnas a 1440 px, sin overflow horizontal.
- No se ejecutó integración contra FastAPI real ni se creó/revisó Pull Request.

## Pendiente antes de cerrar el Epic

1. Abrir y revisar el PR de esta rama, conservando los cambios previos del Epic 8; adjuntar esta evidencia y las limitaciones.
2. Ejecutar integración contra FastAPI v0.2.0 cuando esté disponible.
3. Actualizar estados de issues únicamente después de la revisión requerida.
