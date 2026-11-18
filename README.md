# RoboChef Pizzas

Sitio web de **RoboChef Pizzas**, pizzería en San Benito, Hermosillo, Sonora. Menú con carrito que envía el pedido por WhatsApp, horario con estado abierto/cerrado en vivo y una mascota robot que prepara pizzas en el hero.

## Estructura

```
.
├── netlify.toml                   # Config de deploy en Netlify (publica src/)
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

Netlify, conectado al repo. `netlify.toml` ya define la carpeta a publicar (`src/`) y que no hay comando de build, así que Netlify despliega solo en cada push a `main` y genera *deploy previews* para cada PR.

## Antes de publicar

- Reemplaza `https://robochefpizzas.example/` por el dominio real en `src/index.html`, `src/robots.txt` y `src/sitemap.xml`.
- Opcional: agrega coordenadas (`geo`) y perfiles sociales (`sameAs`) al JSON-LD.
- Valida con [Rich Results Test](https://search.google.com/test/rich-results) y registra el sitemap en Google Search Console.
