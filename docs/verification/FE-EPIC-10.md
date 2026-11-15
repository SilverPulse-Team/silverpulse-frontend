# Verificación FE-EPIC-10 — Evidencia científica y evaluación reproducible

## Alcance y estado

Trabajo realizado en la rama existente `34-fe-19---construir-matriz-de-evidencia-para-preparación-de-retorno-v4`.

| Issue | Estado técnico | Asociación GitHub |
| --- | --- | --- |
| FE-32 · Biblioteca de fuentes y metodología | Implementado y verificado en frontend | Subissue #52 de #51 |
| FE-33 · Comparación de evaluaciones y resultados | Implementado y verificado en frontend | Subissue #53 de #51 |

GitHub confirma que #52 y #53 están vinculados a #51. Los tres issues continúan abiertos. El criterio del padre que requiere un Pull Request revisado permanece pendiente; por eso el Epic no se declara cerrado.

## Criterios del issue padre #51

| Criterio | Resultado | Evidencia / limitación |
| --- | --- | --- |
| FE-32 y FE-33 implementados y vinculados | Cumple técnicamente | Verificación de cada subissue abajo; asociaciones consultadas en GitHub. |
| Contrato OpenAPI v0.2.0 y fixtures | Cumple en frontend | Fuentes, evaluación y métricas usan los tipos/parsers y rutas del contrato; el mock no inventa corridas. |
| Datos ficticios/sintéticos identificados; sin respaldo clínico inventado | Cumple | Aviso permanente en `/evidence`; no se afirman datos de pacientes ni resultados de NASA. |
| Carga, error, vacío y responsive | Cumple en frontend | Skeleton de ruta, errores con reintento, resultados vacíos; revisión en 390 px sin overflow horizontal. |
| Pull Request revisado con evidencia y limitaciones | Pendiente | No se creó ni revisó un PR. No cerrar los issues todavía. |

## FE-32 — #52

- `/evidence` contiene las pestañas Fuentes, Metodología, Evaluación y Limitaciones, con navegación de teclado mediante flechas, Home y End.
- `GET /research/sources` provee título, `id`, URL y relevancia. Las dos fuentes mock usan exactamente las URLs del catálogo `NASA-ASCR` y `NASA-DTN`; los enlaces permiten únicamente HTTP/HTTPS.
- El contrato v0.2.0 no dispone de un campo separado de autor/organismo. La vista presenta el `id` como atribución del catálogo y declara esa limitación.
- Las fuentes se describen como contexto de investigación, no como validación de SilverPulse. Se advierte que no hay historias clínicas NASA, afiliación/aprobación NASA ni pruebas clínicas; el simulador local no es infraestructura espacial real.
- Se manejan carga, error/reintento, endpoint no disponible y catálogo vacío sin agregar fuentes de reserva.

## FE-33 — #53

- Se documentan A (umbral fijo), B (contexto/referencia), C (calidad/contexto/persistencia/abstención) y las políticas FIFO/prioridad sin atribuirles resultados.
- `GET /evaluation/results` conserva `sample_n` y las métricas dinámicas del backend. `POST /evaluation/run` envía solo `{ fixture_id }` y refresca resultados y métricas si se acepta.
- `GET /simulator/metrics` muestra las cifras recibidas solo cuando `has_run` es verdadero; si no, presenta «No ejecutada / Sin resultados». Una corrida individual no se presenta como comparación FIFO vs prioridad.
- El fixture mock de evaluaciones está vacío y la ejecución mock falla explícitamente con operación no disponible; no simula resultados.
- El contrato no incluye algoritmo, fecha, fuente/dataset, versión del método ni limitaciones por corrida en las respuestas de evaluación. La vista lo comunica y no inventa esos campos ni porcentajes. No se pudo comprobar una corrida real porque no se dispuso de backend FastAPI.
- La página se carga con `lazy` para no bloquear las rutas P0.

## Comprobaciones ejecutadas

- `npm run test` — 16 archivos, 76 pruebas correctas (incluye pruebas HTTP/mock de evaluación y validación de URLs).
- `npm run build` — correcto (`tsc -b` y `vite build`); `/evidence` genera un chunk diferido.
- `npm run lint` — correcto.
- Navegador local: fuentes del catálogo y su aviso de alcance; pestaña Evaluación con A/B/C, FIFO/prioridad y estados vacíos; endpoint no disponible/error visible con reintento.
- Accesibilidad/responsive: tabs con teclado; a 390 px, `scrollWidth` y ancho del viewport fueron ambos 390 px.
- No se verificó integración contra FastAPI real, una corrida de evaluación real ni se creó/revisó un Pull Request.
