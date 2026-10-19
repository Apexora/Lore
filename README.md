# Apexora — sitio de lore

Sitio estático (HTML + CSS + JS puro, sin frameworks ni build) para documentar el lore del mundo de Apexora.

## Estructura

```
apexora-site/
├── index.html            → portada
├── mitologia.html         → Mitología y Teogonía (Espacio y sus diez hijos)
├── mundo.html             → naciones (con Tharnok dentro de Boro), órdenes, bestias dormidas y razas
├── mapa.html              → mapa interactivo del continente (hover, click, sonido)
├── linea-tiempo.html      → cronología de eventos clave
├── personajes.html        → Guardianes de Apexora, linajes, Sinfalía, Ocho de Negatt, OCL
├── historias.html         → relatos completos (incluye El Linaje de Zarick) y el índice de campañas y arcos
├── escritos.html          → escritos de la comunidad (historias, sesiones, teorías) con recompensa en Sinfalita
├── css/style.css          → todo el diseño (colores, tipografía, layout, animaciones)
├── js/
│   ├── main.js            → menú móvil + aparición suave de contenido al hacer scroll
│   ├── orbit.js            → diagrama orbital de Espacio y sus diez hijos
│   ├── map.js              → interacción del mapa (halos, panel de info, sonido por nación)
│   └── escritos.js         → publicar/leer escritos (Firestore) y premio en Sinfalita
└── assets/                → logo, ilustraciones, mapa y línea de tiempo
```

No hay proceso de build: son archivos estáticos que podés abrir directamente con doble clic (`index.html`) para previsualizar, o publicar tal cual.

## Publicar en GitHub Pages (gratis)

1. Creá un repositorio nuevo en GitHub (público, para que Pages sea gratis).
2. Subí el contenido de esta carpeta a la raíz del repositorio.
3. **Settings → Pages** → Source: **Deploy from a branch** → branch `main`, carpeta `/ (root)`.
4. Esperá 1–2 minutos: el sitio queda en `https://tu-usuario.github.io/nombre-del-repo/`.

Alternativas igual de gratuitas: **Netlify** o **Vercel** (arrastrás la carpeta), o **Cloudflare Pages**.

## El mapa interactivo

El mapa de `assets/mapa-apexora.jpg` sigue siendo la ilustración original — encima se dibuja una capa de marcadores (uno por nación) definidos directamente en `mapa.html` con variables CSS (`--x`, `--y`) que ubican cada uno en porcentaje sobre la imagen. Al pasar el cursor se enciende un halo de color sobre el territorio aproximado; al hacer clic se abre el panel de información y suena una nota generada en el momento con Web Audio (sin archivos de audio) — cada nación tiene su propia combinación de tonos en `js/map.js`, en el objeto `NATION_SOUNDS`.

Para **reubicar** una nación: ajustá `--x`/`--y` (posición) y `--rx`/`--ry` (tamaño del halo, en `.map-halo`) directamente en `mapa.html`. Para **agregar** una nación nueva: sumá su `<div class="map-halo">` y su `<button class="map-marker">`, y una entrada nueva en `APEXORA_NATIONS` y `NATION_SOUNDS` dentro de `js/map.js`.

## Buscador global (Ctrl+K)

Cualquier página tiene un botón de búsqueda en la barra de navegación (o `Ctrl+K` / `Cmd+K` desde el teclado). Busca sobre un índice curado en `js/search-data.js` — páginas, naciones, deidades, personajes (PJ y PNJ), relatos y eventos de la cronología — y salta directo a la sección con scroll suave si ya estás en esa página, o navega a la otra página si hace falta. Para sumar una entrada nueva al buscador, agregá un objeto `{ title, category, page, anchor, sub }` a `APEXORA_SEARCH_INDEX`.

## Accesibilidad y lectura

- Los filtros de Escritos usan `aria-pressed` para lectores de pantalla.
- El modal de información del mapa atrapa el foco con Tab mientras está abierto, y devuelve el foco al elemento que lo abrió al cerrarse.
- Cada relato en Historias muestra su tiempo estimado de lectura y un enlace "Siguiente" al final, para leer todo en orden sin volver al índice.
- Los índices laterales de la portada arrancan colapsados en pantallas chicas para no alargar el scroll.
- Hay una barra de progreso de lectura arriba de la página y un botón "volver arriba" que aparece al bajar, en todas las páginas.

## Escritos de la comunidad y Sinfalita

`escritos.html` deja a cualquiera con cuenta de Apexora publicar un texto sobre el mundo (historia, crónica de sesión, personaje, lugar, teoría u otro). Leer es público; escribir pide la cuenta del Portal (la sesión se comparte porque usa la misma configuración de Firebase).

- Premio: 1 Sinfalita por cada 20 caracteres, desde 280 y hasta 60 por escrito, usando `premiar()` del Portal (que ya aplica su tope de 300 por día).
- Los escritos se guardan en la colección `apexora_lore_escritos`. **Hay que habilitarla en las reglas de Firestore** del proyecto `album-apexora`:

```
match /apexora_lore_escritos/{id} {
  allow read: if true;
  allow create: if request.auth != null
    && request.auth.token.email.matches('.*@apexora-sala.app')
    && request.resource.data.uid == request.auth.uid
    && request.resource.data.titulo is string && request.resource.data.titulo.size() <= 80
    && request.resource.data.texto is string && request.resource.data.texto.size() <= 8000
    && request.resource.data.creado == request.time;
  allow delete: if request.auth != null && resource.data.uid == request.auth.uid;
}
```

- El HUD del Portal (Sinfalita, Odita, racha) se carga en todas las páginas desde `js/apexora.js`, abajo a la izquierda (`css/apexora-theme.css`), para no chocar con "volver arriba" ni con la barra de navegación.

## Cómo agregar más lore

- **Una nueva nación en Mundo**: copiá un bloque `<article class="nation-card">...</article>`, y sumala al mapa (ver arriba) y a la lista de `mapa.html`.
- **Un nuevo personaje**: copiá un bloque `<article class="char-card">...</article>` en `personajes.html`.
- **Un nuevo relato**: agregá una nueva `<section>` en `historias.html` siguiendo el patrón de `.story-block`, y sumalo al `<nav class="toc">` de arriba.
- **Una página nueva por completo**: copiá cualquiera de las páginas existentes como base, reemplazá el contenido de `<main>`, y agregá el link en el `<ul class="nav-links">` de **las ocho páginas** del sitio.

## Notas de diseño

- Tipografías: **Cinzel** (títulos) y **EB Garamond** (texto de lectura), de Google Fonts.
- Paleta: fondo casi negro (`#08070d`), dorado (`#cf9d4f`) para lo asociado a Xora/orden/luz, vino-violeta (`#6f2f52`) para Ape/caos/oscuridad, y un tono neutro para fuerzas que no toman bando.
- El índice (tabla de contenidos) de cada página se muestra apenas debajo del título, antes de la bajada de texto, para que se vea de entrada.
- Las tarjetas, paneles y bloques de contenido aparecen con una transición suave al entrar en pantalla (`IntersectionObserver` en `main.js`); si JavaScript no corre, todo el contenido es visible igual desde el principio.
