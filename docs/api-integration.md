# Preparación para integración frontend–FastAPI

## Fase actual: solo MOCK

Esta fase frontend usa exclusivamente los snapshots oficiales del contrato
v0.2.0. `getDataProvider()` resuelve a mock por defecto y `.env.example` define
`VITE_DATA_PROVIDER=mock`. No cambiarlo a `http`, no iniciar llamadas a una API
real y no usar las rutas de este documento como funcionalidad disponible.

El proveedor HTTP, sus parsers y las pruebas con `fetch` simulado se mantienen
como preparación; las pruebas no conectan con FastAPI.

## Configuración reservada para una fase futura

Solo después de confirmar FastAPI y aprobar la integración se podría configurar
`.env.local` con:

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

No se ejecutaron solicitudes a un servidor FastAPI durante esta fase frontend.
Por ello `/docs`, `/openapi.json`, `GET /health`, CORS y payloads reales siguen
sin verificar. El proveedor HTTP existe como preparación, no como integración
funcional habilitada.

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
