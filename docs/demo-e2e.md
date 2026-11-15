# Guion de demo E2E — Epic 11

## Alcance

Este guion separa la demo local reproducible de la secuencia E2E que requiere
FastAPI. Todas las observaciones de ejemplo son sintéticas y no representan
mediciones clínicas, pacientes ni datos de NASA.

## Demo local mock verificada

1. Instala dependencias con `npm ci`; configura `.env.local` con
   `VITE_DATA_PROVIDER=mock` y `VITE_MOCK_SCENARIO=offline`.
2. Inicia `npm run dev` y entra al perfil demo Astronauta.
3. Abre `/astronaut/import`, elige «Escenario sintético demo» y continúa.
4. Verifica una observación `preflight` y otra `inflight`, ambas etiquetadas
   como sintéticas. Continúa por la validación local y revisa el `ImportRequest`.
5. Registra las observaciones. En modo mock, la pantalla debe decir «Resultado
   simulado · no persistido» y aclarar que no hubo escritura en FastAPI/SQLite.

La comprobación manual del escenario actualizado mostró una fila preflight y una
inflight en el mapeo, avanzó por la validación local y obtuvo 2 aceptadas/0
rechazadas del proveedor mock. El historial local mostró 4 observaciones. La
pantalla indicó «Resultado simulado · no persistido» y aclaró que no hubo
escritura en FastAPI/SQLite. Los conteos e IDs no son resultados de backend; a
390×844, el ancho de documento permaneció en 390 px.

El resto del recorrido —dashboard, tendencias, readiness e informe— puede
explorarse con snapshots demo. Los snapshots `offline`, `after-delivery` y
`after-return` no conservan una secuencia al cambiar de uno a otro.

## E2E con backend: pasos y evidencia requerida

Con FastAPI v0.2.0 operativo y CORS configurado, cambia a
`VITE_DATA_PROVIDER=http` y `VITE_API_BASE_URL=http://localhost:8000/api/v1`.
Usa una importación marcada `is_synthetic=true` con observaciones en fases
`preflight` e `inflight`; no usar archivos DB directamente.

1. Ejecuta preflight HTTP (`/docs` u `/openapi.json`, `GET /health`) y confirma
   las respuestas contra `docs/contract.md`.
2. Importa las observaciones por `/astronaut/import`; guarda la respuesta real
   de `POST /ship/observations/import` y verifica la procedencia sintética.
3. Revisa `/astronaut`, `/astronaut/trends` y `/astronaut/return`; compara
   valores, unidades, fechas y fases con respuestas de API, sin inferir
   mediciones faltantes.
4. Genera un informe y conserva el `report_id` devuelto.
5. Configura el simulador offline; confirma que `/medical` no muestra el
   informe antes de recibirlo.
6. Configura el modo de enlace aprobado por el contrato y ejecuta el paso
   soportado por backend. Confirma la entrega con `GET /earth/reports` y estado
   `delivered`; no deducir entrega del cambio de modo o de un contador.
7. Revisa el informe en `/medical/reports/{report_id}`. Confirma que la nota no
   aparece en `/astronaut` ni `/ship/inbox` antes de retorno.
8. Verifica el retorno consultando `GET /ship/inbox`, y registra la respuesta
   real, el mensaje, la nota y su fecha.
9. Si el backend admite casos de prueba, registra también falta de fuerza/
   equilibrio, valores `null`, ACK perdido y API IA deshabilitada. No inferir
   respuestas cuando esos casos no estén disponibles.

`docs/demo-sync-frontend.md` contiene detalles de endpoints, status y estados
del simulador. Adjunta request/response anonimizado o evidencia visual al
ejecutar la demo; no incluyas credenciales.

## Resultado y bloqueos actuales

La importación descrita en «Demo local mock verificada» se ejecutó en esta
verificación. No había FastAPI respondiendo en `localhost:8000`, por lo que no
se ejecutaron los pasos backend de entrega, revisión y retorno, ni se verificó
ACK perdido o desactivación de API IA. El mock no finge esos resultados.
