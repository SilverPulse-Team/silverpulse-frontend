# Verificación FE-EPIC-08 — SilverPulse Sync / Mission Control

## Alcance y estado

La implementación se hizo en la rama existente `34-fe-19---construir-matriz-de-evidencia-para-preparación-de-retorno-v4`; no se cambió de rama ni se modificaron los estados de GitHub.

| Issue | Estado técnico | Asociación GitHub |
| --- | --- | --- |
| FE-25 · Dashboard de estado y flujo nave–Tierra | Implementado y verificado | Subissue #42 de #41 |
| FE-26 · Controles de enlace y avance | Implementado y verificado | Subissue #43 de #41 |
| FE-27 · Métricas y estados logísticos | Implementado y verificado | Subissue #44 de #41 |
| FE-28 · Secuencia demostrativa | Implementado y verificado | Subissue #45 de #41 |

La API de subissues de GitHub confirmó las relaciones #42, #43, #44 y #45 → #41. Los issues continúan abiertos. El criterio del padre que exige un Pull Request revisado está pendiente; por eso el Epic no se declara cerrado.

## Criterios del issue padre #41

| Criterio | Resultado | Evidencia / limitación |
| --- | --- | --- |
| FE-25–FE-28 implementados, verificados y vinculados | Cumple técnicamente | Matriz por subissue abajo; asociaciones comprobadas en GitHub. |
| Contrato OpenAPI v0.2.0 y fixtures | Cumple técnicamente | Se reutilizan tipos, provider, parsers y endpoints existentes de status, metrics, reports e inbox. |
| Datos sintéticos etiquetados; sin inventar mediciones o autorizaciones clínicas | Cumple | Las vistas de Tierra indican DEMO/sintético; los resultados no ejecutados muestran «No ejecutada / Sin resultados». |
| Estados de carga, error, vacío y responsive verificados | Cumple | Skeleton durante consultas demoradas; error con API inaccesible; inbox Tierra vacío; flujo comprobado a 1440, 768 y 390 px. |
| Pull Request revisado con evidencia y limitaciones | Pendiente | No se creó ni revisó un PR. No cerrar el Epic todavía. |

## Verificación por subissue

### FE-25 — #42

- Mission Control refleja `mode`, `one_way_latency_simulated_s`, `time_acceleration`, `queued_ship_to_earth`, `queued_earth_to_ship`, `in_flight` y `last_delivered_at_utc` desde `/simulator/status`.
- El fixture offline muestra colas 3/1, latencia 1200 s, aceleración ×60 y última entrega «Sin fecha»; no presenta las colas como entregas.
- El diagrama muestra NAVE / `spacecraft.db` → outbox → enlace simulado → recepción → TIERRA / `earth.db`, además del retorno lógico observado en `/ship/inbox`.
- Incluye la nota de simulación local/no red espacial real. El flujo se representa verticalmente en 768/390 px y horizontalmente en 1440 px; no hubo desbordamiento horizontal en las tres vistas.

### FE-26 — #43

- Los formularios envían `mode`, latencia, aceleración, `drop_ack` opcional y `simulated_seconds` según sus schemas; la validación impide latencia negativa, aceleración no positiva y pasos fuera de 1–86400 o no enteros.
- La configuración mock de OFFLINE a ONLINE se confirmó en memoria y la UI indicó explícitamente que no confirmaba entrega ni ACK.
- Al avanzar el reloj en mock, la UI mostró el error explícito de operación no disponible; no cambió las métricas ni indicó que hubiera entrega. El backend HTTP se prueba con fetch controlado en tests; no se dispuso de FastAPI real.
- Los botones usan estado de solicitud y lock de envío; tras una respuesta de configuración/paso se vuelve a consultar estado y métricas.

### FE-27 — #44

- Se presentan `delivered_count`, `duplicates_suppressed`, `messages_lost_after_restart`, `priority_delivery_delay_simulated_s`, `bytes_transferred`, `queued_count` y `scenario_id`.
- Con `has_run=false`, cada resultado no medido indica «No ejecutada / Sin resultados»; no se calculan porcentajes.
- El log usa informes y respuestas de endpoints existentes, sin endpoint ficticio de paquetes. Reintentos no disponibles se indican como desconocidos; ACK/recepción solo se confirma con evidencia de entrega o `/ship/inbox`.
- En `after-delivery`, la recepción aparece confirmada en Tierra mientras la revisión queda pendiente. En `after-return`, se distinguen informe entregado, revisado y respuesta efectivamente recibida en nave.
- `/health` no se usa como señal de entrega del enlace.

### FE-28 — #45

- La secuencia incluye generar informe, modo offline, cola retenida, reconexión, avance/medición, recepción en Tierra, revisión y retorno a nave; cada hito depende de evidencia observable, no de un clic o una configuración solamente.
- Los escenarios `offline`, `after-delivery` y `after-return` muestran hitos y pendientes consistentes con los datos respectivos. La vista `after-return` enlaza informe de nave, bandeja Tierra y revisión recibida.
- Cada pantalla vuelve a consultar su propio dominio al abrirse/reintentar. No se ofrece reinicio porque el contrato no define ese endpoint.
- La guía [demo-sync-frontend.md](../demo-sync-frontend.md) documenta el flujo con backend y los límites del modo mock.

## Comprobaciones ejecutadas

- `npm test` — 13 archivos, 65 pruebas correctas.
- `npm run build` — correcto (`tsc -b` y `vite build`).
- `npm run lint` — correcto.
- `git diff --check` — correcto.
- Navegador local: fixture offline; configuración mock y error de avance; vistas Tierra vacía, entregada y revisada/retorno; error de API inaccesible y skeleton durante carga.
- Diseño responsive: Mission Control a 1440/768/390 px y vistas Tierra a 390 px.
- No se ejecutó integración contra FastAPI real ni se creó/revisó Pull Request.

## Pendiente antes de cerrar el Epic

1. Abrir y revisar el PR de esta rama sin incluir accidentalmente cambios staged del Epic 7; adjuntar esta evidencia y limitaciones.
2. Ejecutar integración contra FastAPI v0.2.0 cuando esté disponible.
3. Actualizar estados de issues únicamente después de la revisión requerida.
