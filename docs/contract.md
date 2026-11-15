# Contrato de API del frontend

## Fuente de verdad

Los tipos de `src/types` reflejan `SilverPulse_API_v0_2.yaml`, contrato OpenAPI
**0.2.0**. El YAML y `SilverPulse_Mocks_v0_2.json` son la fuente de verdad: el
frontend no cambia nombres de campos para adaptarlos a la interfaz ni agrega
propiedades o endpoints no definidos allí.

## Decisión de implementación

Los tipos se mantienen manualmente porque el repositorio todavía no incorpora un
generador OpenAPI. Se separan por dominio y `src/types/index.ts` ofrece un único
punto de importación. Cada cambio del YAML exige actualizar estos tipos y comprobar
el proyecto con `npm run build`.

TypeScript comprueba la forma estática de los datos, pero no valida en tiempo de
ejecución restricciones como `format: date-time`, mínimos, máximos o
`exclusiveMinimum`. El cliente HTTP deberá validar la respuesta antes de afirmarla
como un tipo del contrato.

## Nulos y opcionales

Un campo nullable del YAML usa `| null`. Un campo declarado en `properties` pero no
incluido en `required` es opcional (`?`). Esto es importante para fechas de entrega,
baseline, evaluación, valores ausentes y métricas aún no ejecutadas. Las listas de
observaciones e informes conservan `{ items, total, limit, offset }`.

## Enums preservados

- Fase: `preflight | inflight | postflight`.
- Simulador: `online | offline | delayed`.
- Prioridad de comunicación: `routine | priority`.
- Estado logístico: `queued | transmitting | delivered | failed_retryable`.

Los campos que el YAML define solo como `string` permanecen abiertos aunque los
mocks actuales contengan uno de esos valores; cerrarlos sería imponer una regla que
el contrato 0.2.0 no expresa.
