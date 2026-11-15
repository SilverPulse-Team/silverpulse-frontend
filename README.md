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
