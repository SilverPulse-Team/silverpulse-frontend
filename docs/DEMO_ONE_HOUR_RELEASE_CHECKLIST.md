# SilverPulse — cierre de demo y subida en 60 minutos

Este checklist prioriza lo que puede romper la demostración. No intenta convertir el prototipo en producción clínica.

## 0–10 minutos · Arranque limpio

Terminal 1:

```bash
cd /Users/monsserrattesquivelgonzalez/Downloads/silverpulse-backend
.venv/bin/python -m uvicorn app.main:app --port 8000
```

Comprobar `http://localhost:8000/api/v1/health` y `http://localhost:8000/docs`.

Terminal 2:

```bash
cd /Users/monsserrattesquivelgonzalez/Downloads/silverpulse-frontend
npm run dev
```

Confirmar en `.env.local`:

```dotenv
VITE_DATA_PROVIDER=http
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Si FastAPI no está activo, Comunicaciones, Evaluación y el asistente HTTP no pueden funcionar. No cambiar a MOCK para ocultar el problema.

## 10–20 minutos · Smoke visual obligatorio

Probar manualmente en 1440 px y 390 px como mínimo:

- Login DEMO y cambio de entorno.
- Resumen de Nave sin breadcrumbs duplicados en el topbar.
- Sidebar abre/cierra y ningún botón parte su etiqueta de forma ilegible.
- Launcher del asistente no tapa acciones y abre/cierra con Escape.
- Comunicaciones muestra contenido, error explícito o estado vacío accionable; nunca una pantalla blanca.
- Evidencia abre Fuentes, Metodología, Evaluación y Alcance del demo.

Si queda tiempo, repetir en 320, 768 y 1024 px.

## 20–35 minutos · Flujo Nave

1. Importar el fixture sintético de vuelo.
2. Abrir el asistente, elegir astronauta, fecha y fase.
3. Confirmar conteos reales de Decision 1.
4. Responder una pregunta cerrada si aparece.
5. Ejecutar Zoeh y comprobar `partial`, `completed` o abstención honesta.
6. Verificar que `deterministic_fallback` no se presenta como LLM exitoso.
7. Abrir el detalle y recargar: la sesión debe persistir.

Bloquea la subida si falla crear, recuperar, responder, refrescar o ejecutar una sesión.

## 35–50 minutos · Comunicaciones y Tierra

1. Generar un informe ORBIT VERIFY desde Nave.
2. Entrar en Comunicaciones y confirmar que aparece en la trazabilidad.
3. Poner el enlace offline, comprobar cola y reconectar en modo delayed.
4. Avanzar el simulador hasta que el informe aparezca en Tierra.
5. Abrir el entorno médico y revisar el informe recibido.
6. Registrar una nota DEMO con confirmación explícita.
7. Confirmar estado `queued`; avanzar el simulador y comprobar el inbox de Nave.

Bloquea la subida si Tierra muestra un informe no entregado, si la revisión se envía sin confirmación o si se afirma ACK antes de recibirlo.

## 50–55 minutos · Evidencia útil para la presentación

- Fuentes: deben venir del backend y abrir enlaces reales.
- Evaluación: ejecutar `analysis_abc` desde «Comparar análisis A/B/C».
- Opcional: ejecutar `link_drop` para demostrar el enlace intermitente.
- Alcance del demo: leer los tres bloques y usar ese lenguaje en la presentación.

La Evaluación es P1: aporta credibilidad reproducible, pero no debe bloquear la demo principal si Nave → Tierra → retorno funciona. Fuentes y Alcance sí conviene conservar para evitar afirmaciones exageradas.

## 55–60 minutos · Validación y subida

Ejecutar:

```bash
cd /Users/monsserrattesquivelgonzalez/Downloads/silverpulse-frontend
npm run lint
npm run build
npm test -- --run
git diff --check
git status --short
```

Si todo pasa, revisar los cambios y después:

```bash
git add src docs
git commit -m "feat: complete conversational demo and release UX"
git push -u origin feat/conversational-assistant-ui
```

Estos comandos de Git son recomendados; no fueron ejecutados automáticamente. Antes del push confirma que el remoto y la rama son los del proyecto correcto.

## Qué bloquea realmente la demo

- Backend inaccesible o CORS incorrecto.
- Build o pruebas fallidas.
- Sesión Decision 1/Zoeh que no persiste.
- Pantalla blanca o error no visible en Comunicaciones.
- Informe que no llega a Tierra después de avanzar el simulador.
- Revisión que no entra en cola o retorno que se declara recibido sin ACK.
- Contenido superpuesto o inaccesible en móvil.

## Qué puede esperar

- NASA RAG.
- Integración automática entre sesión Zoeh e informe ORBIT VERIFY.
- Optimización del aviso de bundle mayor a 500 kB.
- Navegación de evaluación avanzada y catálogo dinámico de fixtures.
- Hardening, autorización real por rol y validación clínica de producción.
