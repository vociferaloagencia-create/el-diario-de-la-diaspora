# ESPECIFICACIÓN TÉCNICA Y DE DISEÑO: EL DIARIO DE LA DIÁSPORA
**Documento Maestro de Requisitos de Diseño, Arquitectura Visual y Buenas Prácticas**
*Fecha: 7 de Septiembre de 2026*

---

## 1. INTRODUCCIÓN Y PROPÓSITO
Este documento define con precisión quirúrgica cada uno de los cambios de interfaz de usuario, maquetación y comportamiento solicitados por la clienta según las capturas, bocetos y mensajes de WhatsApp. Sirve como matriz de comparación y verificación estricta ("Checklist de Control de Calidad") para auditar la implementación antes y después de su ejecución.

---

## 2. AUDITORÍA DE CAMBIOS: QUÉ SE HACE, CÓMO HACERLO Y CÓMO NO HACERLO

### 2.1. NUEVO LOGOTIPO OFICIAL (HORIZONTAL TIPOGRÁFICO)
* **Origen**: Archivo suministrado por la clienta (`media_1788821713343.png`), inspirado en la identidad sobria de *Diario Libre*.
* **Texto del Logo**:
  ```text
  EL DIARIO
  DE LA DIASPORA
  ```
  Tipografía robusta en mayúsculas, color azul marino oscuro (`#0F2557` o `#102A6B`), sin globo terráqueo superpuesto en la cabecera.
* **CÓMO HACERLO CORRECTAMENTE**:
  - Extraer la imagen original suministrada con la máxima fidelidad cromática.
  - Eliminar cualquier residuo blanco sucio en los bordes si se requiere transparencia o asegurar fondo blanco puro `#FFFFFF` homogéneo con la cabecera.
  - Recortar márgenes transparentes/blancos vacíos (tight crop) para que la altura en la barra sea uniforme (ej. `h-9` a `h-11`).
  - Colocarlo en `public/logo-horizontal.png` y vincularlo en `Header.tsx`.
* **CÓMO NO HACERLO (PROHIBIDO)**:
  - NO mantener el logo anterior del globo terráqueo en la cabecera principal (la clienta le colocó una gran X roja tachándolo).
  - NO deformar la relación de aspecto (aspect ratio) del logo al redimensionarlo.
  - NO colocar subtítulos largos como *"Información independiente para la comunidad hispana e internacional"* debajo del logo.

---

### 2.2. CABECERA (HEADER) Y BARRA SUPERIOR
* **Distribución en una sola línea elegante**:
  - **Extremo Izquierdo**: Logo horizontal compacto.
  - **Centro / Desplazado a la Derecha**: Fecha editorial en mayúsculas (`LUNES, 7 DE SEPTIEMBRE DE 2026 | EDICIÓN DIGITAL INTERNACIONAL`). La clienta señaló expresamente: *"Fecha más por acá"*.
  - **Extremo Derecho**:
    1. Selector de 4 idiomas: **`ES` | `FR` | `EN` | `AR`** (con estilo píldora o enlaces discretos, resaltando el idioma activo).
    2. Botón / icono de `🔍 Buscar`.
    3. Botón de suscripción `SUSCRÍBETE` (fondo azul oficial con texto blanco).
    4. Icono de perfil de usuario `👤` con menú de sesión.
* **Barra Azul de Navegación**:
  - Se mantiene azul oscuro institucional (`bg-primary` / `#102A6B`) con tipografía blanca en mayúsculas.
  - Categorías: `☰ MENÚ` | `ACTUALIDAD` | `LA DIÁSPORA` | `NACIONAL` | `INTERNACIONAL` | `ECONOMÍA` | `DEPORTES` | `CULTURA` | `LA COMUNIDAD` | `EDITORIAL / OPINIÓN`.
  - **Corrección obligatoria**: Renombrar `CULTURA / H` a **`CULTURA`** (la clienta anotó: *"Quitar H"*).
* **CÓMO HACERLO CORRECTAMENTE**:
  - Mantener la cabecera delgada y esbelta (altura máxima total de ambas filas combinadas ~90px a 95px).
  - Sticky header con transición suave y sombra sutil.
* **CÓMO NO HACERLO (PROHIBIDO)**:
  - NO permitir que el header vuelva a superar los 150px de altura vertical.
  - NO dejar la "H" en Cultura.
  - NO amontonar la fecha encima del logo.

---

### 2.3. LÍNEA ROJA DE "ÚLTIMA HORA" (BREAKING NEWS TICKER)
* **Requisito visual y funcional**:
  - Una barra horizontal roja brillante (`bg-red-600` o `#D32F2F`) situada inmediatamente debajo de la barra azul de menú.
  - Tipografía en blanco nítido, negrita, con distintivo de urgencia: `🔴 ÚLTIMA HORA: [Titular de la noticia...]`.
  - Enlace directo al artículo urgente al hacer clic.
* **Regla de negocio editorial**:
  - Cuando se active una noticia con el estado o etiqueta `Última Hora`, se proyectará en esta barra roja con prioridad máxima.
  - Al desactivarse la urgencia, el artículo se visualiza de forma natural en la sección regular de `Actualidad`.
* **CÓMO HACERLO CORRECTAMENTE**:
  - Si hay una noticia de última hora, mostrar la barra con animación sutil (o texto en marquesina / scroll suave si hay más de una, o titular fijo con botón de lectura).
  - Si no hay noticias de última hora activas, ocultar la barra limpiamente sin dejar huecos vacíos.
* **CÓMO NO HACERLO (PROHIBIDO)**:
  - NO colocar la franja de última hora como un elemento invasivo tipo popup modal.
  - NO ponerla en color azul; la clienta fue explícita: *"esa línea roja con escritura blanca"*.

---

### 2.4. PORTADA (HOME) LIMPIA Y AMPLIA
* **Eliminación de la columna lateral izquierda fija**:
  - En la versión previa, la columna `SECCIÓN NOTICIAS` estaba fija en el home ocupando 2.5 columnas de 12.
  - La clienta anotó textualmente en rojo: *"No debe aparecer aquí. Esta sección debe abrir solo cuando se da clic al Menú"*.
  - **Acción**: Eliminar por completo esa columna lateral fija del home.
* **Eliminación de la barra de países del Home**:
  - La franja de botones con países (`Todas`, `República Dominicana`, `México`, `Chile`, `Brasil`, `Cuba`, `Bahamas`, `Venezuela`, `EE.UU.`, `Canadá`, `Francia`, `España`) estaba en la portada.
  - La clienta anotó textualmente en rojo: *"Eliminar y dejarlo en sección de LA DIÁSPORA"*.
  - **Acción**: Retirar la barra del home y colocarla exclusivamente dentro de la página/sección de `La Diáspora`.
* **Nueva distribución de la Portada**:
  - El área principal ahora aprovecha de 8 a 9 columnas (`col-span-12 lg:col-span-8 xl:col-span-8.5`), brindando una presencia imponente al Reportaje Principal y a las noticias en cuadrícula.
  - La columna derecha (`col-span-12 lg:col-span-4 xl:col-span-3.5`) conserva de forma elegante: *Lo más leído*, banners publicitarios y *Reels*.
* **CÓMO HACERLO CORRECTAMENTE**:
  - Rejilla equilibrada inspirada en *El País*, *Diario Libre* y *The New York Times*.
  - Espaciado generoso entre secciones (`gap-8`).
* **CÓMO NO HACERLO (PROHIBIDO)**:
  - NO forzar 3 columnas con un sidebar izquierdo innecesario que ahogue el contenido.
  - NO dejar la barra de países en la portada principal.

---

### 2.5. MENÚ LATERAL DESPLEGABLE (`☰ MENÚ`)
* **Ajustes en el drawer / hoja lateral**:
  1. **Quitar "Última hora" de la lista de categorías**: La clienta anotó: *"Elimina en esta sección"* (ya que ahora vive en la barra roja principal).
  2. **Submenú de Países en "La Diáspora"**:
     - Al hacer clic o expandir `La Diáspora`, se despliega la lista de países asociados:
       - República Dominicana
       - México
       - Brasil
       - Chile
       - Cuba
       - Bahamas
       - Venezuela
       - EE.UU.
       - Canadá
       - Francia
       - España
  3. **Categoría Cultura corregida**: Etiquetada como `Cultura`.
* **CÓMO HACERLO CORRECTAMENTE**:
  - Acordeón suave o sublista indentada que permita navegar a cada país o a la sección general.
* **CÓMO NO HACERLO (PROHIBIDO)**:
  - NO dejar el botón de Última Hora redundante dentro del menú.

---

### 2.6. PÁGINA ESPECÍFICA DE "LA DIÁSPORA" (`/category/la-diaspora`)
* **Integración del Filtro de Países**:
  - La barra con los 11 países (`[Todas] [República Dominicana] [México]...`) se aloja en la cabecera de la página de la categoría *La Diáspora*.
  - Permite filtrar las noticias de la diáspora según el país seleccionado.

---

### 2.7. IDENTIDAD DEL NAVEGADOR (FAVICON Y METADATOS)
* **Captura de referencia**: Foto de la pestaña de *Diario Libre* (`Diario Libre: Ultimas Noticias de Republica Dominicana`).
* **Acción**:
  - Configurar `icon.png` / `favicon.ico` con el isotipo nítido del diario.
  - Configurar metadatos en `layout.tsx`:
    `title: "El Diario de la Diáspora: Últimas Noticias de la Comunidad Hispana e Internacional"`.

---

## 3. CHECKLIST DE CONTROL DE CALIDAD Y COMPARACIÓN

| # | Elemento / Requisito | Estado Antes | Estado Después | Verificación |
|---|----------------------|--------------|----------------|--------------|
| 1 | Logo de Cabecera | Globo terráqueo vertical grande | Logo tipográfico horizontal oficial (`EL DIARIO DE LA DIASPORA`) | [ ] |
| 2 | Posición de la Fecha | Esquina izquierda pegada | Movida hacia el centro/derecha | [ ] |
| 3 | Selector de Idiomas | Inexistente | Selector visible `ES` \| `FR` \| `EN` \| `AR` en cabecera | [ ] |
| 4 | Barra Roja "Última Hora" | No existía franja roja | Franja roja brillante con texto blanco bajo la barra azul | [ ] |
| 5 | Columna Izquierda en Home | Sidebar fijo ocupando ancho | Eliminado del Home (abre solo vía `☰ MENÚ`) | [ ] |
| 6 | Barra de Países en Home | Visible fija en portada | Eliminada de Portada y reubicada en `La Diáspora` | [ ] |
| 7 | Categoría Cultura | `CULTURA / H` | `Cultura` (letra H eliminada) | [ ] |
| 8 | Menú Drawer (`☰ MENÚ`) | Tenía Última Hora y sin países | Sin Última Hora y con países desplegables en `La Diáspora` | [ ] |
| 9 | Página La Diáspora | Sin filtro por países | Con barra interactiva de países | [ ] |
| 10 | Favicon y Título de Pestaña | Favicon por defecto | Icono oficial y título periodístico estilo Diario Libre | [ ] |
| 11 | Despliegue en Vercel | Versión anterior desplegada | Nueva versión desplegada y funcionando al 100% | [ ] |
