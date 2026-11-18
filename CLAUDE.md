# CLAUDE.md — RoboChef Pizzas

Sitio estático (HTML/CSS/JS sin build) de una pizzería en San Benito, Hermosillo.

## Antes de tocar diseño

Lee **`docs/refero-styles.md`**: es el estándar visual (tokens, tipografía, espaciados, componentes y reglas de movimiento). Todo color, fuente o radio nuevo debe salir de ahí y de `src/css/tokens.css`.

## Estructura

- `src/index.html` — HTML semántico, metadatos SEO/OG y JSON-LD (Schema.org `Restaurant` + `Menu`).
- `src/css/tokens.css` — variables CSS (espejo de refero-styles.md).
- `src/css/main.css` — layout y componentes.
- `src/css/parallax.css` — capas del hero, animación del robot chef y `prefers-reduced-motion`.
- `src/js/parallax.js` — parallax con requestAnimationFrame.
- `src/js/main.js` — menú móvil, tap-to-call, arma-tu-pizza, carrito → WhatsApp, modal de términos, estado abierto/cerrado.
- `src/assets/img/` — og-image, favicon, apple-touch-icon. `src/assets/video/` reservado para `hero-video.mp4` + `poster.jpg`.

## Reglas

- El menú vive en el HTML (para SEO). Si cambias un precio o platillo, actualiza **también** el JSON-LD `hasMenu` en el `<head>`.
- Datos del negocio (teléfono, dirección, horario) aparecen en: HTML visible, JSON-LD, `main.js` (WhatsApp y horario). Manténlos sincronizados.
- El dominio `https://robochefpizzas.example/` es un placeholder: aparece en canonical, OG, JSON-LD, `robots.txt` y `sitemap.xml`.
- No pongas `transform` en CSS a elementos con `data-depth`.
- Con `prefers-reduced-motion` no debe haber desplazamientos; solo se permiten fundidos de opacidad/color.
- Previsualizar: `python3 -m http.server -d src 8000`.
- Deploy: Netlify publica `src/` según `netlify.toml` (sin build).
