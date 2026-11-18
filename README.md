# RoboChef Pizzas

Sitio web de **RoboChef Pizzas**, pizzería en San Benito, Hermosillo, Sonora. Menú con carrito que envía el pedido por WhatsApp, horario con estado abierto/cerrado en vivo y una mascota robot que prepara pizzas en el hero.

## Estructura

```
.
├── .github/workflows/deploy.yml   # Deploy de src/ a GitHub Pages
├── docs/refero-styles.md          # Estándar visual
├── src/
│   ├── assets/img/                # og-image.jpg, favicon, apple-touch-icon
│   ├── assets/video/              # hero-video.mp4 + poster.jpg (pendiente)
│   ├── css/{tokens,main,parallax}.css
│   ├── js/{parallax,main}.js
│   ├── index.html
│   ├── robots.txt · sitemap.xml · site.webmanifest
├── CLAUDE.md
└── README.md
```

## Desarrollo local

Sin dependencias ni build:

```bash
python3 -m http.server -d src 8000
```

Abre http://localhost:8000.

## Deploy

El workflow publica `src/` en GitHub Pages en cada push a `main`. Actívalo en *Settings → Pages → Source: GitHub Actions*.

## Antes de publicar

- Reemplaza `https://robochefpizzas.example/` por el dominio real en `src/index.html`, `src/robots.txt` y `src/sitemap.xml`.
- Opcional: agrega coordenadas (`geo`) y perfiles sociales (`sameAs`) al JSON-LD.
- Valida con [Rich Results Test](https://search.google.com/test/rich-results) y registra el sitemap en Google Search Console.
