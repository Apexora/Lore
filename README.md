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


## Notas de diseño

- Tipografías: **Cinzel** (títulos) y **EB Garamond** (texto de lectura), de Google Fonts.
- Paleta: fondo casi negro (`#08070d`), dorado (`#cf9d4f`) para lo asociado a Xora/orden/luz, vino-violeta (`#6f2f52`) para Ape/caos/oscuridad, y un tono neutro para fuerzas que no toman bando.
- El índice (tabla de contenidos) de cada página se muestra apenas debajo del título, antes de la bajada de texto, para que se vea de entrada.
- Las tarjetas, paneles y bloques de contenido aparecen con una transición suave al entrar en pantalla (`IntersectionObserver` en `main.js`); si JavaScript no corre, todo el contenido es visible igual desde el principio.
