# Guía demostrativa de SilverPulse Sync

> La configuración versionada conserva MOCK como proveedor predeterminado. La
> secuencia HTTP de esta guía se verificó localmente con datos sintéticos.

## Alcance y límites

`/mission-control` presenta una simulación local de enlace diferido; no es una red espacial real ni una integración NASA DTN/ION-DTN. El diagrama muestra la ruta lógica `spacecraft.db → outbox → enlace simulado → recepción → earth.db`; no conecta bases de datos.

La pantalla no usa `/health` como señal de enlace y el contrato v0.2.0 no ofrece un endpoint de paquetes ni de reinicio. La tabla usa únicamente mensajes de informes de `/ship/reports` y respuestas recibidas de `/ship/inbox`; muestra `—` para reintentos, que el contrato no proporciona.

## Recorrido HTTP verificado

1. Configura `.env.local` con `VITE_DATA_PROVIDER=http` y
   `VITE_API_BASE_URL=http://localhost:8000/api/v1`. La configuración de CORS se
   aplica en FastAPI.
2. Importa el escenario de dos observaciones sintéticas; confirma la respuesta
   de importación y que dashboard y tendencias reflejen los datos backend.
3. Genera un informe desde `/astronaut`; la ejecución comprobada creó
   `RPT-BCDAEAC7BD`.
4. En Mission Control, configura `offline`. Se observó un informe en cola y
   cero informes en `/medical`; la cola no significa entrega.
5. Configura `delayed` y avanza 3600 segundos simulados. La API confirmó una
   entrega, cero duplicados y cola vacía; el informe apareció en
   `/earth/reports` con hora de recepción.
6. Revisa el informe en `/medical/reports/{report_id}` con una nota demo y
   `is_demo=true`. El backend guardó `review_status=reviewed` y devolvió el
   mensaje `MSG-RETURN-9EDA2A498E` en estado `queued`.
7. Avanza otros 3600 segundos. `/ship/inbox` confirmó la respuesta recibida; la
   bandeja de nave mostró un mensaje. Se observó persistencia al recargar el
   navegador.

Los IDs y métricas citados corresponden a una ejecución local aislada y pueden
cambiar al repetirla. `/simulator/metrics` reportó `has_run=true`; sus
contadores son mediciones de esa ejecución, no proyecciones.

Un informe ya marcado como revisado no vuelve a ofrecer el formulario de envío. El enlace a la secuencia de sincronización lleva a Mission Control; la recepción se confirma únicamente desde `/ship/inbox`. Los enlaces a informes de nave, bandeja Tierra y revisión están disponibles desde la secuencia guiada. Cada pantalla vuelve a consultar su propio endpoint al abrirse o al reintentar.

## Proveedor MOCK (predeterminado)

- Los GET reproducen fixtures; el fixture inicial de métricas tiene `has_run=false` y la UI muestra «No ejecutada / Sin resultados» para valores no medidos.
- `POST /simulator/config` actualiza solo el status mock en memoria; no persiste al recargar ni entrega mensajes.
- `POST /simulator/step` no tiene una ejecución fixture. El mock devuelve un error explícito y no cambia métricas, colas, informe de Tierra ni inbox.
- `VITE_MOCK_SCENARIO=offline`, `after-delivery` y `after-return` son snapshots separados, no una reproducción persistente de todos los pasos.

No existe una acción de reset en el contrato; para comenzar otro ensayo se requiere la preparación del backend o el snapshot mock correspondiente. La secuencia no marca pasos futuros como completados.
