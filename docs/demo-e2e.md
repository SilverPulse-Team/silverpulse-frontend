# Guion de demo E2E — Epic 11

## Alcance

Este guion separa la demo local reproducible de la secuencia E2E que requiere
FastAPI. Todas las observaciones de ejemplo son sintéticas y no representan
mediciones clínicas, pacientes ni datos de NASA.

## Demo local mock

1. Instala dependencias con `npm ci`; configura `.env.local` con
   `VITE_DATA_PROVIDER=mock` y `VITE_MOCK_SCENARIO=offline`.
2. Inicia `npm run dev` y entra al perfil demo Astronauta.
3. Abre `/astronaut/import`, elige «Escenario sintético demo» y continúa.
4. Verifica los dos registros oficiales: 71 bpm y 372 min, ambos `inflight`,
   con fuente `synthetic`. No reclasifiques observaciones ni conviertas el
   baseline `preflight` en una observación individual.
5. Registra las observaciones. En modo mock, la pantalla debe decir «Resultado
   simulado · no persistido» y aclarar que no hubo escritura en FastAPI/SQLite.

El resto del recorrido —dashboard, tendencias, readiness e informe— puede
explorarse con snapshots demo. Los snapshots `offline`, `after-delivery` y
`after-return` no conservan una secuencia al cambiar de uno a otro.

## E2E futuro: pasos y evidencia requerida

Esta secuencia no debe ejecutarse durante la fase frontend-only. Cuando el
backend esté aprobado e implementado, usar un fixture oficial `is_synthetic=true`.
Si se necesita una observación individual `preflight`, solicitar un fixture
canónico; no inferirla del baseline ni fabricar una medición. No usar archivos DB
directamente.

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

No se ejecutaron solicitudes a backend en esta fase. Los pasos de entrega,
revisión y retorno, ACK perdido y desactivación de API IA quedan para una fase
futura. El mock no finge esos resultados.
