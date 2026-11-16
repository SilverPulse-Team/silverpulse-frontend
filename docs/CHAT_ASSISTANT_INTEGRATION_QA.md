# SilverPulse 2.0 — Integración y QA del asistente conversacional

Fecha de verificación: 2026-11-15 (America/Costa_Rica)  
Alcance: frontend React/TypeScript y APIs FastAPI ya existentes.  
Estado: implementación P0 terminada y automatizada; la validación visual con navegador real queda pendiente porque no había un navegador controlable disponible en esta sesión.

## 1. Inventario y hallazgos previos

Se revisaron los dos repositorios y los cinco adjuntos suministrados, distinguiendo diseños y propuestas de funciones operativas:

- `stitch_silverpulse_mission_health_monitoring.zip`: 38 recursos de pantallas Stitch (HTML y capturas). Se usó como referencia de composición, paleta y densidad, no como código ni fuente de datos.
- `stitch_silverpulse_mission_health_monitoring.rtf`: material descriptivo complementario de Stitch.
- `SilverPulse_Issues_Subissues_Frontend_EPIC02-11.txt`: backlog y criterios históricos; no se asumieron como funciones existentes.
- `SilverPulse_Prompts_Stitch_AI_v0_2.txt`: instrucciones visuales históricas; se trataron como referencia, no como contrato ejecutable.
- `SilverPulse_Paquete_Arquitectura_v0_2.zip`: contiene especificación Markdown, OpenAPI YAML, mocks JSON, arquitectura PNG, README y DOCX. Se extrajo el texto del DOCX y se inspeccionó el diagrama PNG. El render visual completo del DOCX no pudo ejecutarse porque el entorno carecía de `pdf2image`; no se presenta como validado visualmente.

Antes de editar, ambos repositorios estaban limpios. Las afirmaciones del informe anterior sobre cambios staged sin commit ya no eran actuales: FE-34 estaba confirmado en los HEAD indicados abajo. Se crearon ramas nuevas sin reset, clean, rebase, merge, commit ni push.

Hallazgos verificados en código:

- Existen `AnalysisSessionRow`, la tabla SQLite `ship_analysis_session` y los seis endpoints `/ship/analyses`.
- `/astronaut/analysis`, `GuidedQuestionsPanel` y `AnalysisResultsPanel` siguen operativos.
- Existen los endpoints Earth para listar, abrir y revisar informes recibidos.
- La sesión Zoeh y el informe ORBIT VERIFY son objetos y circuitos independientes. Ejecutar Zoeh no crea ni envía un informe.
- Hay código experimental de recuperación de documentos, pero no existe un endpoint público probado, corpus NASA verificable y respuesta con citas que permita anunciar un NASA Knowledge Assistant funcional. La opción se mantiene oculta.

## 2. Cambios implementados

No se requirieron cambios backend ni de OpenAPI para P0: los contratos existentes cubren los dos flujos.

Frontend:

- `src/components/assistant/AssistantWidget.tsx`: selecciona exactamente una variante por entorno y ruta reales.
- `src/components/assistant/AssistantLauncher.tsx`: launcher fijo, accesible y compatible con safe area.
- `src/components/assistant/AssistantWindow.tsx`: shell conversacional responsivo, historial con scroll interno, header/footer fijos, Escape, carga y foco.
- `src/components/assistant/AssistantMessage.tsx`: mensajes de asistente, usuario y sistema.
- `src/components/assistant/AssistantQuickReplies.tsx`: opciones cerradas con botones de al menos 44 px.
- `src/components/assistant/ShipAssistant.tsx`: controlador conversacional de Decision 1/Zoeh mediante `DataProvider`.
- `src/components/assistant/EarthAssistant.tsx`: listado Earth, detalle y revisión confirmada mediante `DataProvider`.
- `src/components/assistant/types.ts` e `index.ts`: tipos y exportación del módulo.
- `src/components/assistant/AssistantWidget.test.tsx`: cinco pruebas nuevas de rol, flujo, persistencia, error, vacío, parcial/fallback y teclado.
- `src/components/layout/AppShell.tsx`: montaje único del widget dentro del layout autenticado DEMO.
- `src/components/layout/navigation.ts`: retiro de «Análisis guiado» como opción principal del sidebar de nave.
- `src/pages/AstronautOverviewPage.tsx`: retiro del CTA redundante «Ver análisis».
- `src/styles/global.css`: animación sutil, respeto a movimiento reducido y apilado móvil de acciones largas.

## 3. Estado de `/astronaut/analysis`

La ruta no se eliminó ni se reimplementó. Continúa siendo la vista ampliada/deep link de una sesión. El widget puede abrirla con `?id=<analysis_id>` y, al estar en esa URL, recupera la misma sesión persistida. La entrada primaria del usuario es ahora el launcher flotante; por eso se retiró la opción redundante del sidebar y del bloque de accesos rápidos.

## 4. Flujo del asistente de a bordo

1. El launcher solo aparece cuando el entorno es `ship` y la ruta comienza con `/astronaut`.
2. El usuario elige «Iniciar análisis» o «Continuar sesión».
3. Se consulta la lista real de astronautas. Con más de uno se exige selección explícita; nunca se escoge silenciosamente el primero.
4. Para una sesión nueva se pide día UTC y fase de forma progresiva.
5. `POST /api/v1/ship/analyses` crea o recupera idempotentemente la sesión. FastAPI consulta `spacecraft.db`; React no reconstruye Decision 1.
6. Se muestran conteos reales `reliable`, `unverified`, `missing`, revisión del snapshot y procedencia sintética/mixta.
7. Las preguntas de `guided_questions` se presentan una por vez con las opciones exactas del backend. La burbuja de respuesta aparece después del `PATCH /answers` exitoso.
8. Si la respuesta es «Ya la repetí», se explica que no crea una medición; «Importar» abre la ruta existente y «Actualizar» llama a `/refresh`.
9. Solo cuando la sesión queda `ready`, «Analizar observaciones» llama a `/run`.
10. El resultado diferencia `partial`, `completed`, `insufficient_evidence` y fallos; muestra cobertura, faltantes, modo de ejecución, razón del fallback y texto realmente recibido.
11. Las preguntas posteriores son informativas y separadas; no se ofrece un input porque no existe endpoint para responderlas.
12. Reabrir desde `/astronaut/analysis?id=...` vuelve a consultar la sesión real. No se guardan datos sensibles en `localStorage`.

Persistencia: `ship_analysis_session` en `spacecraft.db`, gestionada por FastAPI.

## 5. Flujo del asistente de revisión

1. El launcher solo aparece cuando el entorno es `earth` y la ruta comienza con `/medical`.
2. «Ver informes recibidos» llama a `GET /api/v1/earth/reports`; no consulta ni muestra la cola de nave.
3. Un resultado vacío indica que Tierra no ha recibido informes. No introduce tarjetas ficticias.
4. Elegir un ID real llama a `GET /api/v1/earth/reports/{id}` y muestra explicación existente, cantidad de observaciones, faltantes, entrega, estado de revisión, método y validación declarada.
5. «Ver informe» navega a `/medical/reports/:id`.
6. «Preparar revisión» abre progresivamente la nota y la opción de seguimiento. No genera redacción clínica automática.
7. Antes de enviar se muestra una confirmación explícita con el efecto real.
8. «Confirmar envío» hace `POST /api/v1/earth/reports/{id}/review` con `review_status`, `note`, `followup_requested` e `is_demo=true`.
9. El widget muestra `review_id`, `return_message_id` y el estado real `queued`. No afirma llegada a nave; explica que depende del simulador y ACK.
10. En `/medical/reports/:id`, abrir el widget recupera el informe de esa ruta.

## 6. Capacidades deliberadamente no mostradas

- NASA Knowledge Assistant/RAG: no hay una API pública y pruebas de recuperación con corpus NASA y citas verificables. No se muestra la acción y no se fabrican citas.
- Envío de una sesión Zoeh a Tierra: no existe integración. Zoeh no se presenta como ORBIT VERIFY ni como mensaje entregado.
- Respuestas a preguntas posteriores de Zoeh: no hay endpoint de persistencia; solo se muestran como seguimiento informativo.
- Autorización real por rol: el selector de entorno DEMO configura la interfaz, pero no sustituye autenticación/autorización de producción.

## 7. Endpoints reutilizados y comportamiento

No se creó ningún endpoint.

| Endpoint | Uso del widget | Respuesta relevante | Errores manejados |
|---|---|---|---|
| `POST /ship/analyses` | Crear/recuperar sesión | `AnalysisSession`; 201 al crear, 200 si ya existe | 400/404/422 según contrato |
| `GET /ship/analyses` | Continuar una sesión | lista paginada | error HTTP visible, sin fallback MOCK |
| `GET /ship/analyses/{id}` | Deep link/reapertura | sesión persistida | 404 visible |
| `PATCH /ship/analyses/{id}/answers` | Guardar respuesta cerrada | sesión recalculada | 400 `UNKNOWN_QUESTION`, 404, 422 |
| `POST /ship/analyses/{id}/refresh` | Releer observaciones persistidas | snapshot/sesión actualizados | 404/409/422 |
| `POST /ship/analyses/{id}/run` | Ejecutar Zoeh | sesión completed/partial/insufficient | 400/404/409/422/503 |
| `GET /earth/reports` | Bandeja recibida en Tierra | `ListReports` | vacío u error visible |
| `GET /earth/reports/{id}` | Detalle de informe real | `Report` | 404 visible |
| `POST /earth/reports/{id}/review` | Revisión médica DEMO confirmada | `review_id`, `return_message_id`, `status` | validación/404/conflicto visibles |

Comprobación HTTP aislada del 2026-11-15:

- Importación sintética: 31 aceptadas, 0 rechazadas.
- Sesión `ANL-CDBB69DDDE`: creación 201, GET 200, lista 200, refresh 200.
- PATCH con ID inventado: 400 y código `UNKNOWN_QUESTION`.
- Run: 200, `status=partial`, `execution_mode=deterministic_fallback`, razón `ollama_no_disponible`.
- Informe `RPT-AF95A47EC9`: Earth list/detail 200 después de entrega simulada.
- Revisión: 201, `status=queued`. Se usó `/private/tmp/silverpulse-http.S7Tjta`; el servidor se detuvo al terminar.

## 8. Ejecución local

Backend:

```bash
cd /Users/monsserrattesquivelgonzalez/Downloads/silverpulse-backend
.venv/bin/python -m uvicorn app.main:app --port 8000
```

Variables relevantes: `SILVERPULSE_DATA_DIR`, `SILVERPULSE_CORS_ORIGINS`, `SILVERPULSE_SEED_DEMO`, `SILVERPULSE_AI_URL`, `SILVERPULSE_AI_TIMEOUT_S`.

Frontend, en `.env.local`:

```dotenv
VITE_DATA_PROVIDER=http
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

```bash
cd /Users/monsserrattesquivelgonzalez/Downloads/silverpulse-frontend
npm ci
npm run dev
```

MOCK solo se activa explícitamente con `VITE_DATA_PROVIDER=mock`; un fallo HTTP no cambia de proveedor.

## 9. QA ejecutado

| Verificación | Resultado |
|---|---|
| Frontend Vitest completo | 27 archivos, 93 pruebas aprobadas |
| Pruebas nuevas del widget | 5 aprobadas |
| ESLint | aprobado |
| TypeScript + build Vite | aprobado; aviso no bloqueante de chunk principal de 520.53 kB |
| Backend pytest completo | 193 aprobadas en 25.45 s |
| HTTP FastAPI real con SQLite temporal | aprobado para análisis y revisión Earth descritos arriba |
| `git diff --check` | aprobado |
| Navegador/E2E visual real | no ejecutado: la herramienta disponible reportó cero navegadores controlables |

Las pruebas RTL cubren exclusión de roles, apertura/cierre, Escape y retorno de foco, selección explícita, creación/run, resultado parcial y fallback, persistencia de pregunta cerrada, revisión con confirmación, bandeja vacía y error Earth. No sustituyen una inspección visual real.

Viewports 320/390/768/1024/1440: se implementaron límites con `100dvh`, ancho acotado al viewport, safe areas, historial interno, acciones móviles apiladas y ausencia de anchuras fijas mayores al viewport. No se declara aprobación visual de esos cinco tamaños hasta probarlos en navegador.

## 10. Checklist de botones y acciones

| Acción | Destino | Resultado comprobado |
|---|---|---|
| Abrir/cerrar asistente | estado UI | diálogo correcto, Escape y retorno de foco probados |
| Iniciar análisis | GET astronautas + POST `/ship/analyses` | probado con selección explícita |
| Continuar sesión | GET `/ship/analyses` y GET `/{id}` | provider y HTTP comprobados |
| Opción de Decision 1 | PATCH `/{id}/answers` | persistencia antes de mostrar respuesta probada |
| Importar | `/astronaut/import?analysis=...` | ruta existente; no crea medición por sí sola |
| Actualizar | POST `/{id}/refresh` | HTTP 200 comprobado |
| Analizar observaciones | POST `/{id}/run` | parcial/fallback comprobado |
| Abrir detalle | `/astronaut/analysis?id=...` | deep link y recuperación probados |
| Nuevo análisis | reinicio local del controlador | sin borrar la sesión backend |
| Ver informes recibidos | GET `/earth/reports` | vacío, error y lista probados |
| Seleccionar informe | GET `/earth/reports/{id}` | detalle real probado |
| Ver/Abrir informe | `/medical/reports/:id` | usa ID seleccionado real |
| Preparar revisión | estado UI | no envía nada todavía |
| Continuar/seguimiento | validación UI | prepara payload, sin POST anticipado |
| Confirmar envío | POST `/earth/reports/{id}/review` | 201/queued comprobado |
| Otra revisión | reinicio local | no modifica informes existentes |

## 11. Ajustes UX/UI y accesibilidad

- Launcher de 56 px (60 px desde `sm`), margen 20–24 px y safe area inferior.
- Panel de hasta 416 px y altura máxima responsiva; en móvil usa 12 px laterales y acciones largas apiladas.
- Solo el historial desplaza; header y controles permanecen visibles.
- Texto base 14 px, título 16 px, botones táctiles de al menos 44 px, iconos Lucide y etiquetas de acción sin saltos innecesarios.
- Una sola instancia por entorno/ruta; no aparece en login ni Mission Control.
- `aria-label`, `aria-haspopup`, diálogo etiquetado, `aria-live`, estados de carga, `focus-visible`, Escape y retorno al launcher.
- Animación de 180 ms y desactivación con `prefers-reduced-motion`.
- Paleta basada en tokens SilverPulse; no se usa marca oficial NASA.

## 12. Demo frente a producción

Para demo: las suites, build y HTTP pasan; falta inspección visual real de los cinco viewports antes de declarar cierre visual completo.

Para producción todavía se necesita, como mínimo, autenticación/autorización real por rol, evaluación de privacidad y datos clínicos, telemetría y auditoría, seguridad de contenido, manejo de concurrencia y duplicados en revisión, accesibilidad con tecnologías asistivas reales, recuperación ante fallos, despliegue endurecido y validación clínica/regulatoria. El prototipo no es un dispositivo médico.

## 13. Pendientes priorizados

| Prioridad | Pendiente y causa | Archivo/área | Paso concreto | Dueño sugerido |
|---|---|---|---|---|
| P0 | QA visual real no disponible | widget y layouts | Ejecutar Playwright/Browser en 320, 390, 768, 1024 y 1440; corregir cualquier solapamiento | Frontend + QA |
| P0 | Verificar teclado móvil real | `AssistantWindow` | Probar iOS/Android con teclado abierto, textarea y safe areas | QA móvil |
| P1 | Evitar revisión duplicada también en servidor | endpoint Earth review | Definir idempotencia/conflicto y añadir prueba contractual | Backend |
| P1 | Reducir chunk principal de 520.53 kB | router/build | Lazy loading por ruta y análisis de bundle | Frontend |
| P1 | Vincular análisis e informe solo si producto lo aprueba | dominios Analysis/Report | Diseñar contrato aditivo explícito y trazable; no reutilizar IDs implícitamente | Producto + Backend |
| P2 | NASA RAG real | nuevo dominio de conocimiento | Corpus local versionado, licencias, retrieval, endpoint, citas verificables, abstención y tests | IA/Backend + Legal |
| P2 | Responder preguntas posteriores | Analysis API | Definir esquema y persistencia; después habilitar UI | Producto + Backend |

## 14. Estado Git y comandos recomendados

Backend:

- Rama: `feat/conversational-assistant-api`
- HEAD: `f88f753952c60c1c51215e776141225a60ff0e03`
- Cambios de esta tarea: ninguno.

Frontend:

- Rama: `feat/conversational-assistant-ui`
- HEAD base: `2754fa63bf2d5249de37b23f6315f1b35c9cccda`
- Cambios: archivos modificados y nuevos descritos en la sección 2; sin commit ni push.

Comandos recomendados, no ejecutados:

```bash
cd /Users/monsserrattesquivelgonzalez/Downloads/silverpulse-frontend
git add src/components/assistant src/components/layout/AppShell.tsx src/components/layout/navigation.ts src/pages/AstronautOverviewPage.tsx src/styles/global.css docs/CHAT_ASSISTANT_INTEGRATION_QA.md
git commit -m "feat: add role-aware conversational assistants"
git push -u origin feat/conversational-assistant-ui
```

No se recomienda un commit backend vacío. La rama puede eliminarse o conservarse para una futura extensión de contrato, según el flujo del equipo.

## 15. Guía de demostración de 3–5 minutos

1. Arrancar FastAPI y frontend en modo HTTP. Entrar al entorno Nave y abrir el launcher inferior derecho.
2. Elegir «Iniciar análisis», seleccionar astronauta, día y fase. Mostrar conteos y procedencia reales de Decision 1.
3. Si hay pregunta cerrada, responderla y destacar que se guarda por PATCH. Si solicita repetición, abrir Importación, añadir una lectura y usar «Actualizar».
4. Ejecutar «Analizar observaciones». Mostrar honestamente `partial` o `insufficient_evidence`; si aparece `deterministic_fallback`, explicarlo como fallback local, no como LLM exitoso.
5. Abrir «detalle» para enseñar que `/astronaut/analysis?id=...` recupera la sesión.
6. Generar y entregar por el circuito ORBIT VERIFY un informe independiente. Cambiar a Tierra, abrir el asistente y listar solo informes recibidos.
7. Abrir el informe, preparar una nota DEMO, elegir seguimiento y confirmar. Mostrar `queued` y aclarar que aún no llegó a nave.
8. Avanzar el simulador y revisar el inbox de nave. Aclarar que se retornó la revisión del informe ORBIT VERIFY, no el resultado Zoeh.
