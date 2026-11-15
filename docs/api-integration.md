# Integración frontend–FastAPI

## Configuración

El frontend selecciona un proveedor al iniciar. Para usar los snapshots de demo:

```env
VITE_DATA_PROVIDER=mock
VITE_MOCK_SCENARIO=offline
```

Para apuntar al backend local, configura `.env.local` (no versionar secretos):

```env
VITE_DATA_PROVIDER=http
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

El contrato esperado es SilverPulse OpenAPI v0.2.0. FastAPI debe responder a
`GET /health`, servir `/docs` o `/openapi.json` y permitir CORS para
`http://localhost:5173`, métodos `GET`, `POST`, `OPTIONS` y el header
`Content-Type`. El CORS debe configurarse en FastAPI, no desactivarse en el
navegador.

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

## Preflight antes de declarar integración

1. Iniciar FastAPI con la versión de contrato esperada.
2. Confirmar `/docs` u `/openapi.json` y `GET /health`.
3. Comparar requests/responses reales con `docs/contract.md`, los parsers y los
   fixtures v0.2.0 antes de cambiar cualquiera de ellos.
4. Verificar CORS desde el origen Vite y recorrer importación, lectura de nave,
   reportes, simulador, bandeja Tierra y revisión.
5. Registrar respuestas 404/409/422 y cualquier diferencia del YAML; no adaptar
   datos silenciosamente ni suponer que un modo online implica entrega.

## Estado de verificación de este Epic

Durante esta verificación no hubo un servidor FastAPI respondiendo en
`localhost:8000`. Por ello no se pudieron confirmar `/docs`, `/openapi.json`,
`GET /health`, CORS ni payloads reales. El proveedor HTTP y su validación de
contratos existen en frontend, pero FE-34 permanece pendiente de una
comprobación backend y no debe marcarse como integración real verificada.
