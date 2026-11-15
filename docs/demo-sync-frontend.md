# Guía demostrativa de SilverPulse Sync

> Guía de referencia para una fase futura de integración. En la fase frontend
> actual, conserva `VITE_DATA_PROVIDER=mock` y no ejecutes solicitudes a FastAPI.

## Alcance y límites

`/mission-control` presenta una simulación local de enlace diferido; no es una red espacial real ni una integración NASA DTN/ION-DTN. El diagrama muestra la ruta lógica `spacecraft.db → outbox → enlace simulado → recepción → earth.db`; no conecta bases de datos.

La pantalla no usa `/health` como señal de enlace y el contrato v0.2.0 no ofrece un endpoint de paquetes ni de reinicio. La tabla usa únicamente mensajes de informes de `/ship/reports` y respuestas recibidas de `/ship/inbox`; muestra `—` para reintentos, que el contrato no proporciona.

## Reproducir con el backend

1. Inicia FastAPI con el contrato SilverPulse v0.2.0 y el frontend con `VITE_DATA_PROVIDER=http` y `VITE_API_BASE_URL` apuntando a su API.
2. En `/astronaut`, genera un informe. Confirma su `report_id` en la respuesta de `POST /ship/reports/generate` y en `GET /ship/reports`.
3. En `/mission-control`, configura `offline`. La acción solo se considera aceptada cuando `POST /simulator/config` devuelve `mode=offline`; confirma la cola con `GET /simulator/status`.
4. Comprueba `queued_ship_to_earth > 0`. La cola no significa entrega.
5. Configura `online` o `delayed` y confirma el modo en la respuesta del simulador.
6. Avanza el reloj con un entero entre 1 y 86400. Después de la respuesta válida, la pantalla vuelve a consultar status, métricas e informes. Los resultados solo se muestran si `/simulator/metrics` informa `has_run=true`.
7. Comprueba recepción en Tierra mediante `GET /earth/reports` y `communication.status=delivered` con `delivered_at_utc`. Mission Control no deduce recepción solo por el cambio de modo o por avanzar el reloj.
8. Abre la bandeja Tierra (`/medical`), filtra por fase, fecha de recepción, astronauta o estado de revisión y abre un informe confirmado (`/medical/reports/{report_id}`). La ficha solo consulta `/earth/reports/{id}`. Registra la revisión ficticia con `review_status=reviewed` e `is_demo=true`; el resultado muestra `review_id`, `return_message_id` y el estado devuelto por la API. `queued` significa que la respuesta está en cola, no que volvió a nave.
9. Confirma el retorno solo cuando `GET /ship/inbox` incluya el `report_id`, el `message_id`, la nota y `received_at_utc`.

Un informe ya marcado como revisado no vuelve a ofrecer el formulario de envío. El enlace a la secuencia de sincronización lleva a Mission Control; la recepción se confirma únicamente desde `/ship/inbox`. Los enlaces a informes de nave, bandeja Tierra y revisión están disponibles desde la secuencia guiada. Cada pantalla vuelve a consultar su propio endpoint al abrirse o al reintentar.

## Modo mock

- Los GET reproducen fixtures; el fixture inicial de métricas tiene `has_run=false` y la UI muestra «No ejecutada / Sin resultados» para valores no medidos.
- `POST /simulator/config` actualiza solo el status mock en memoria; no persiste al recargar ni entrega mensajes.
- `POST /simulator/step` no tiene una ejecución fixture. El mock devuelve un error explícito y no cambia métricas, colas, informe de Tierra ni inbox.
- `VITE_MOCK_SCENARIO=offline`, `after-delivery` y `after-return` son snapshots separados, no una reproducción persistente de todos los pasos.

No existe una acción de reset en el contrato; para comenzar otro ensayo se requiere la preparación del backend o el snapshot mock correspondiente. La secuencia no marca pasos futuros como completados.
