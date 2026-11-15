# SilverPulse Frontend

Aplicación frontend de SilverPulse, un proyecto de NASA Space Apps Challenge 2026 orientado al monitoreo de la salud de astronautas.

Este repositorio contiene la base técnica de la interfaz web. En esta etapa solo se prepara un proyecto mínimo y reproducible; todavía no incluye pantallas funcionales, autenticación, gráficas, sensores, lógica de negocio ni conexión con el backend.

## Tecnologías

- React 19
- TypeScript
- Vite 8
- ESLint
- npm

## Prerrequisitos

- Git
- Node.js `^20.19.0` o `>=22.12.0`, según los requisitos de Vite 8
- npm (incluido con una instalación compatible de Node.js)

Las versiones utilizadas en la validación local fueron Node.js `24.18.0` y npm `11.16.0`.

## Instalación

Clona el repositorio e instala exactamente las dependencias registradas en `package-lock.json`:

```bash
git clone https://github.com/SilverPulse-Team/silverpulse-frontend.git
cd silverpulse-frontend
npm ci
```

## Desarrollo local

Inicia el servidor de desarrollo:

```bash
npm run dev
```

Vite mostrará en la terminal la dirección local de la aplicación, normalmente `http://localhost:5173`.

## Comandos disponibles

```bash
npm run dev      # Inicia el servidor de desarrollo
npm run build    # Verifica TypeScript y genera la compilación de producción
npm run lint     # Ejecuta la revisión estática del código
npm test         # Ejecuta las pruebas automatizadas una vez
npm run preview  # Sirve localmente la compilación de producción
```

La salida de producción se genera en `dist/` y no se versiona.

## Estructura del repositorio

```text
silverpulse-frontend/
├── public/             # Archivos estáticos servidos sin transformación
├── src/
│   ├── assets/         # Recursos importados por la aplicación
│   ├── components/     # Futuros componentes reutilizables de React
│   ├── pages/          # Futuras vistas principales
│   ├── services/       # Futuras funciones de comunicación con APIs
│   ├── styles/         # Estilos globales y futuros archivos de diseño
│   ├── App.tsx         # Componente raíz mínimo
│   └── main.tsx        # Punto de entrada y montaje de React
├── index.html          # Documento HTML de entrada para Vite
├── package.json        # Scripts y dependencias del proyecto
├── package-lock.json   # Versiones exactas para instalaciones reproducibles
├── tsconfig*.json      # Configuración de TypeScript
└── vite.config.ts      # Configuración de Vite y React
```

Los directorios todavía vacíos contienen un archivo `.gitkeep` para conservarlos en Git hasta que se añada su implementación.

## Variables de entorno

Los archivos `.env` locales están excluidos de Git para evitar publicar información sensible. Cuando el proyecto necesite configuración por variables de entorno, se deberá documentar un archivo `.env.example` sin credenciales reales.

El modo de datos se selecciona explícitamente desde una copia local de
`.env.example`:

```bash
VITE_DATA_PROVIDER=mock
VITE_MOCK_SCENARIO=offline
```

Los escenarios disponibles son `offline`, `after-delivery` y `after-return`.
Todos reproducen snapshots sintéticos del contrato v0.2.0; no guardan datos ni
confirman ACK reales. `offline` es el valor predeterminado y mantiene vacía la
bandeja médica de Tierra.

Las páginas deben consumir la interfaz común de `src/services/dataProvider.ts`,
obtenida mediante `getDataProvider()`, en lugar de importar fixtures directamente.
Esto permite sustituir el proveedor mock por HTTP sin reescribir los componentes.

### FastAPI local

Para consumir el backend en lugar de los fixtures:

```bash
VITE_DATA_PROVIDER=http
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Las variables `VITE_*` quedan visibles en el bundle del navegador y nunca deben
contener tokens, contraseñas ni otros secretos. El cliente no incluye credenciales
por defecto.

FastAPI debe permitir CORS para el origen de desarrollo de Vite, normalmente
`http://localhost:5173`, incluyendo los métodos `GET`, `POST` y `OPTIONS` y el
header `Content-Type`. Esta configuración se realiza en el backend; no se resuelve
deshabilitando seguridad en el navegador.

`GET /health` comprueba únicamente que el proceso de FastAPI responde. No indica
que el enlace simulado con Tierra esté online; ese estado procede exclusivamente
de `GET /simulator/status`.

## Navegación demo y control de acceso

React Router registra las vistas aprobadas de nave, Tierra, Mission Control y evidencia. La selección «Cambiar entorno demo» modifica únicamente el contexto visual y el menú mostrado; no autentica, autoriza ni protege información.

Todas las rutas del frontend pueden abrirse directamente durante el prototipo. Cuando FastAPI esté disponible, el backend debe aplicar autenticación, autorización y separación de datos para cada operación. Nunca se debe confiar en el rol almacenado en el navegador como barrera de seguridad.
