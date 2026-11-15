# Integración frontend–FastAPI

## Estado

La integración HTTP con FastAPI v0.2.0 está implementada y se verificó de
extremo a extremo con datos sintéticos en un directorio SQLite aislado. El
proveedor predeterminado sigue siendo MOCK: `getDataProvider()` usa mock si no
se selecciona expresamente otro proveedor y `.env.example` conserva
`VITE_DATA_PROVIDER=mock`.

La configuración HTTP es local y opt-in. No se incluyen credenciales en el
frontend y la aplicación no accede directamente a archivos `.db`.

## Configuración local HTTP

Para usar una instancia FastAPI local, crea o edita `.env.local` (ignorado por
Git):

```env
VITE_DATA_PROVIDER=http
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Inicia el backend con el contrato SilverPulse v0.2.0 y permite CORS para
`http://localhost:5173` en FastAPI; no desactives CORS en el navegador. Las
variables `VITE_*` se publican en el bundle y no deben contener secretos.
`GET /health` indica que la API responde, no que el enlace simulado esté online;
el estado del enlace se obtiene de `GET /simulator/status`.

## Rutas consumidas por el proveedor HTTP

| Flujo frontend | Endpoints |
| --- | --- |
| Catálogo y carga de importación | `GET /catalog/metrics`, `GET /ship/astronauts` |
| Overview, tendencias y readiness | `GET /ship/astronauts/{id}/overview`, `/baselines`, `/trends`, `/return-readiness` |
| Observaciones e importación | `GET /ship/observations`, `POST /ship/observations`, `POST /ship/observations/import` |
| Informes de nave e inbox | `GET /ship/reports`, `GET /ship/reports/{id}`, `POST /ship/reports/generate`, `GET /ship/inbox` |
| Bandeja y revisión en Tierra | `GET /earth/reports`, `GET /earth/reports/{id}`, `POST /earth/reports/{id}/review` |
| Mission Control | `GET /simulator/status`, `GET /simulator/metrics`, `POST /simulator/config`, `POST /simulator/step` |

Las páginas usan el `DataProvider` común y los servicios HTTP validan las
respuestas con parsers del contrato. Nave y Tierra consultan sus propios
endpoints; el navegador no accede directamente a archivos `.db`. Los errores
HTTP se conservan como errores de operación y no se convierten en éxito mock.

## Preflight verificado

La verificación local confirmó `GET /health`, `/docs` (HTTP 200), OpenAPI
v0.2.0 con 30 rutas y preflight CORS desde `http://localhost:5173`. El catálogo
de métricas devolvió 18 entradas.

Se importaron dos observaciones sintéticas (`heart_rate=71 bpm` y
`sleep_duration=372 min`): el backend aceptó ambas y devolvió sus IDs. El
dashboard y tendencias reflejaron los datos del proveedor HTTP; el dashboard
se recargó desde el backend.

También se generó un informe a bordo con enlace offline. Tierra permaneció
vacía hasta reconectar en modo delayed y avanzar el simulador; entonces
`/earth/reports` confirmó la entrega. Se registró una revisión demo y se avanzó
el simulador de nuevo hasta que `/ship/inbox` confirmó la respuesta de retorno.
La secuencia y el estado de revisión persistieron después de recargar el
navegador. Los resultados pertenecen a una ejecución local sintética, no son
resultados clínicos ni una afirmación de rendimiento operacional.

El backend completó sus 188 tests durante esta verificación. Ejecuta las
pruebas, build y lint frontend indicados en el README para validar los cambios
locales.

## Alcance no cubierto

No se modificó el repositorio backend. La demo no prueba autenticación,
autorización, infraestructura espacial real, pérdida de ACK ni recuperación
tras reinicio. El contrato tampoco ofrece un endpoint de reinicio, un listado
independiente de paquetes ni un contador de reintentos; la UI no debe inferir
esos estados. Registra cualquier futura diferencia 404/409/422 contra
`docs/contract.md` y los parsers, sin adaptar datos silenciosamente.

## Entradas guiadas de IA: punto de integración futuro

El módulo Python `silverpulse_ai/inputs/` no forma parte de este repositorio y no
se ha confirmado un endpoint para consumirlo. No portar sus reglas a TypeScript,
crear rutas ni representar respuestas de IA en el mock.

Cuando exista un contrato/API aprobados, integrar primero los tipos de respuesta
en `src/types/` y el servicio en `src/services/`; después presentar preguntas
cerradas en el flujo frontend que defina el contrato (por ejemplo, junto a la
captura de observaciones), manteniendo sus opciones y validaciones derivadas de
la especificación. Renderizar `reliable`, `repeat` e `insufficient` únicamente
como estados recibidos y validados desde esa respuesta, nunca calculados por la
interfaz. Hasta entonces, esas preguntas y estados quedan fuera de alcance.
