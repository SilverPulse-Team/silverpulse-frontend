# Verificación FE-EPIC-11 — Integración, calidad y demo

## Alcance y estado

Trabajo verificado en la rama existente
`34-fe-19---construir-matriz-de-evidencia-para-preparación-de-retorno-v4`.
El padre #54 y los subissues #55, #57, #58 y #60 existen y están vinculados en
GitHub; continúan abiertos. El criterio que exige un Pull Request revisado no
está satisfecho. No se creó PR ni se declara cerrado el Epic.

| Issue | Estado | Evidencia y limitaciones |
| --- | --- | --- |
| FE-34 · HTTP real/contratos | Pendiente para una fase futura | La arquitectura HTTP centralizada y parsers v0.2.0 están preparados. En esta fase no se consumen endpoints reales ni se conectó FastAPI. |
| FE-35 · Pruebas unitarias/contrato | Implementado en frontend | Testing Library y jsdom están instalados; `npm test` completó 21 archivos y 82 pruebas. Incluye null, `is_synthetic`, n=1, baseline n=12, los valores y fases exactos del fixture oficial, errores y POST pendiente. |
| FE-36 · Responsive/accesibilidad/estados | Parcial | 10 rutas en 3 tamaños sin overflow global; se reparó un overflow móvil. Hay verificaciones puntuales de teclado y targets en importación; auditoría WCAG, lector de pantalla y revisión exhaustiva de contraste pendientes. |
| FE-37 · E2E/demo/PR | Parcial para esta fase | El flujo mock se mantiene en los datos oficiales. El fixture de observaciones no incluye un registro individual preflight, así que no se fabrica uno para satisfacer el guion. El E2E de entrega/revisión/retorno pertenece a la futura fase backend; PR no creado. |

## Criterios del issue padre #54

| Criterio | Resultado | Evidencia |
| --- | --- | --- |
| FE-34 a FE-37 implementados, verificados y vinculados | Parcial | Los cuatro issues están vinculados; FE-34, FE-36 y FE-37 conservan bloqueos explícitos. |
| Contrato OpenAPI v0.2.0 y fixtures | Verificado en frontend, no contra servidor | Servicios/parsers y mock provider centralizan llamadas; la comparación con payload real queda pendiente. |
| Etiquetado sintético y sin resultados/autorizaciones inventados | Cumple en la demo verificada | El import mock muestra «Resultado simulado · no persistido». Los perfiles y registros demo están identificados como ficticios/sintéticos. |
| Carga, error, vacío y responsive | Parcial | Suite y pantallas cubren estados frontend; no se pudieron validar respuestas HTTP activas. Matriz de viewports registrada. |
| PR revisado con evidencia | Pendiente | No hay PR creado ni revisión solicitada. |

## Comprobaciones ejecutadas

- `npm test` — 21 archivos, 82 pruebas correctas.
- `npm run build` — correcto (TypeScript y Vite).
- `npm run lint` — correcto.
- `git diff --check` — resultado registrado después de la documentación.
- Navegador: 10 rutas × 3 tamaños (1440×900, 768×900 y 390×844), sin overflow
  horizontal del documento.
- El test de `ImportPage` protege los valores y la fase inflight exactos del
  fixture oficial; no convierte el baseline preflight en un registro medido.

## Pendiente antes de cerrar

1. Cuando se apruebe la fase backend, verificar CORS, `/docs`/`openapi.json`,
   health y payloads reales contra el contrato.
2. Solo con fixtures oficiales para las fases necesarias, ejecutar la secuencia
   completa hasta retorno de la nota; no derivar mediciones de baselines.
3. Completar revisión accesible (lector de pantalla, contraste y teclado en
   toda la navegación) y las condiciones clínicas sintéticas/ACK/IA que soporte
   el backend.
4. Actualizar esta evidencia con resultados reales y abrir un PR dirigido a la
   rama base acordada, solicitando revisión. No marcar los issues como completos
   antes de cubrir estos puntos.
