# QA responsive, accesibilidad y estados — Epic 11

## Matriz de viewport

Se inspeccionaron las rutas siguientes en 1440×900, 768×900 y 390×844:

| Ruta | Áreas revisadas |
| --- | --- |
| `/login` | Selector de perfiles demo |
| `/astronaut` | Dashboard y métricas |
| `/astronaut/import` | Stepper, selección de fuente, formulario y mapeo |
| `/astronaut/trends` | Gráfica, leyenda y tabla |
| `/astronaut/return` | Matriz y comparación de evidencia |
| `/mission-control` | Estado, métricas y controles |
| `/medical` | Bandeja Tierra |
| `/medical/reports/RPT-0001` | Detalle/revisión |
| `/astronaut/reports/RPT-0001` | Detalle de informe de nave |
| `/evidence` | Fuentes, metodología y limitaciones |

En las 30 combinaciones, el ancho de `documentElement` coincidió con el
viewport: no se observó overflow horizontal de página. El sidebar mide 240 px
en desktop, se colapsa en tablet y se reemplaza por menú en móvil. Las tablas
anchas conservan scroll horizontal dentro de su contenedor; ese scroll es
intencional.
La revisión inicial encontró overflow en `/astronaut/return` a 390 px, corregido
con `min-w-0` en la cuadrícula y el comparador, y la matriz se repitió después.

## Accesibilidad comprobada y pendiente

- En `/astronaut/import` a 390 px, el menú abre un diálogo con nombre accesible
  y `aria-modal`; un evento Escape lo cierra y devuelve el foco al botón
  «Abrir menú». La secuencia nativa completa por teclado no se pudo validar
  con el navegador de esta sesión.
- En los pasos de origen y mapeo de `/astronaut/import` a 390 px, los botones
  y controles de formulario visibles medidos alcanzan al menos 44×44 px; se
  excluyeron los inputs de archivo nativos ocultos de 1×1 px.
- El selector de fuente y los pasos del import tienen nombres/roles accesibles.
  La tabla móvil usa controles etiquetados; las tablas incluyen captions y
  encabezados de columna.
- La gráfica longitudinal expone unidad, cantidad de observaciones y que una
  observación se muestra como punto sin línea de tendencia. El baseline comunica
  su `n`.
- No se ejecutó una auditoría automatizada WCAG, lector de pantalla ni medición
  cuantitativa de contraste. La navegación completa por teclado y los targets
  táctiles de todas las rutas requieren una revisión adicional.

## Estados y pruebas automatizadas

La suite Vitest cubre datos nulos (`Sin datos`), etiqueta sintética, una
observación sin línea, baseline con `n=12`, la importación de valores/fases oficiales y controles de
Mission Control deshabilitados durante un POST pendiente. El repositorio también
mantiene pruebas de errores de importación y estados de sincronización.

Última ejecución registrada: `npm test` — 21 archivos y 82 pruebas correctas;
`npm run build` y `npm run lint` correctos. La ejecución no requiere hardware ni
servicio FastAPI.

Los estados de API HTTP (incluidos errores de red y servidor) no pudieron
probarse contra un backend activo. Los snapshots mock `offline`,
`after-delivery` y `after-return` son estados separados, no una secuencia
persistente de desconexión, entrega y retorno.
