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

## E2E con FastAPI local

El recorrido se verificó con FastAPI v0.2.0, proveedor HTTP y observaciones
sintéticas en almacenamiento local aislado. Para repetirlo, activa
`VITE_DATA_PROVIDER=http`, configura `VITE_API_BASE_URL` en `.env.local` y
permite CORS desde el origen Vite. No uses archivos DB directamente.

1. Confirma `/docs`, OpenAPI v0.2.0, `GET /health` y CORS desde Vite.
2. Importa el escenario sintético de dos observaciones. En la ejecución
   verificada se aceptaron frecuencia cardíaca (71 bpm) y duración de sueño
   (372 min); dashboard y tendencias las leyeron desde el backend.
3. Genera un informe local y configura el simulador como `offline`. Comprueba
   que la cola de nave contiene el informe y que `/medical` aún muestra cero
   informes.
4. Cambia a `delayed` y avanza el reloj simulado. Confirma la recepción solo
   cuando `/earth/reports` devuelva el informe con estado entregado y marca de
   tiempo; el cambio de modo por sí solo no confirma recepción.
5. Abre `/medical/reports/{report_id}` y guarda la revisión ficticia con
   `is_demo=true`. La respuesta confirma `review_status=reviewed` y deja el
   mensaje de retorno en cola.
6. Avanza el simulador otra vez y confirma la respuesta únicamente cuando
   `/ship/inbox` incluya el informe y el mensaje de retorno.
7. Recarga el navegador y verifica que el informe entregado, la revisión y la
   respuesta recibida sigan visibles desde la API.

`docs/demo-sync-frontend.md` contiene detalles de endpoints, status y estados
del simulador. Se observó una entrega en cada dirección, cero mensajes en cola
al finalizar y cero duplicados reportados en esa ejecución. Esos valores son
solo evidencia del escenario local, no una garantía de rendimiento. La nota de
revisión es ficticia; el análisis no es diagnóstico ni recomendación clínica.

## Límites

No se verificaron autenticación, pérdida de ACK, reinicio del proceso ni
desactivación de API IA. El contrato no incluye endpoint de reinicio. No infieras
mediciones faltantes, resultado clínico ni entrega a partir del modo o de una
cola vacía.
