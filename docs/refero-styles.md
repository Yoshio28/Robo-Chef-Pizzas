# RoboChef Pizzas — Estándar visual

Fuente de verdad del diseño. `src/css/tokens.css` refleja exactamente estos valores; si cambias algo aquí, cámbialo allá (y viceversa).

## Concepto

Pizzería de barrio con un toque robótico: fondo tinta oscuro, papel crema para las secciones de "carta", acentos rojo tomate / ámbar queso / turquesa circuito. Estética de **ticket de pedido**: bordes punteados, tipografía monoespaciada para datos y precios.

## Color

### Paleta base

| Token        | Valor     | Uso                                              |
|--------------|-----------|--------------------------------------------------|
| `--ink`      | `#14151A` | Fondo principal oscuro, nav, footer              |
| `--paper`    | `#FBF7EC` | Texto sobre oscuro, superficie "carta"           |
| `--paper-dim`| `#EFE9D8` | Fondo en modo claro                              |
| `--red`      | `#E1332B` | Acción primaria, contornos del robot             |
| `--red-deep` | `#A8241D` | Hover de primaria, precios                       |
| `--amber`    | `#F4B63F` | Acento 2: eyebrows, estrellas, masa de la pizza  |
| `--teal`     | `#35C9B0` | Acento 3: focus, hover de enlaces, ojos del robot|
| `--steel`    | `#8A8F98` | Texto terciario                                  |
| `--line`     | `rgba(251,247,236,0.14)` | Bordes sobre oscuro               |

### Tokens semánticos

`--bg`, `--surface`, `--surface-2`, `--text`, `--text-dim`, `--accent`, `--accent-2`, `--accent-3`, `--border`, `--paper-surface`, `--paper-text`.

- Siempre usa los semánticos en componentes; la paleta base solo para identidad (logo, robot, ilustraciones).
- Modo claro: se redefine en `@media (prefers-color-scheme: light)` bajo `:root:not([data-theme="dark"])`. Forzar oscuro con `data-theme="dark"` en `<html>`.

### Colores de ilustración (solo SVG)

Salsa/pepperoni `#C81E2C`, queso `#F0C15A`, albahaca `#3c8f3c`, cuerpo robot `#23262E` / `#1C1E24`.

### Botones de terceros

WhatsApp `#20B858` (hover `#1a9b4a`). No usar para otra cosa.

## Tipografía

| Token            | Familia                 | Uso                                        |
|------------------|-------------------------|--------------------------------------------|
| `--font-display` | Archivo Black           | h1–h3, nombres de platillo, marca          |
| `--font-mono`    | Space Mono 400/700      | Eyebrows, precios, legendas, metadatos     |
| `--font-body`    | Work Sans 400–700       | Texto corrido, botones                     |

Escala:

- h1 hero: `clamp(44px, 9.5vw, 104px)`, en mayúsculas, segunda palabra en `--accent-2`.
- h2 sección: `clamp(28px, 4.4vw, 46px)`.
- h3 grupo de menú: `clamp(22px, 3vw, 30px)`.
- Cuerpo: 17px (secciones), 14.5px (UI), 13.5px (descripciones de tarjeta).
- Mono pequeño: 11.5–12.5px con `letter-spacing: 0.02–0.06em`.
- `line-height`: 1.02 en display, 1.5–1.7 en cuerpo.

## Espaciado y layout

- Contenedor `.wrap`: `max-width: 1160px`, padding lateral 24px.
- Secciones: padding vertical 88–104px.
- Gaps de grid: 14–20px (tarjetas), 40–56px (columnas).
- `section-head` máx. 640px, margen inferior 36px.
- Breakpoints: 900px (grids a 1 columna), 820px (nav colapsa a menú móvil), 600px (menú a 1 columna).
- Respeta `env(safe-area-inset-*)` en nav, footer, carrito y modales.

## Radios

| Elemento                | Radio |
|-------------------------|-------|
| Botones, inputs, selects| 8–10px|
| Tarjetas                | 12–16px|
| Chips, badges, eyebrows | 16–20px (píldora)|
| Ticket de reseña        | 4px (papel)|

## Componentes

- **Eyebrow ticket**: mono 12.5px, borde `1px dashed` ámbar al 45%, fondo ámbar al 9%, píldora.
- **Botones**: `.btn-primary` (rojo), `.btn-ghost` (borde, hover turquesa), `.btn-wa` (verde WhatsApp). `:active` → `scale(0.97)`.
- **Tarjeta de menú**: blanca sobre papel, borde `#E6E0CF`, título display 16.5px, select de tamaño + botón "Agregar" tinta.
- **Ticket de reseña**: borde superior punteado ámbar (`repeating-linear-gradient`).
- **Chips** de ingredientes: píldora mono; `.on` rojo; `.disabled` al 40%.
- **Focus**: `outline: 3px solid var(--accent-3)` con offset 2px. Nunca quitarlo.

## Movimiento

- Parallax por capas con `[data-depth]` (js/parallax.js + requestAnimationFrame). Nunca uses `transform` en CSS sobre un elemento con `data-depth`: el JS lo sobrescribe.
- Mascota: flota (`bob` 3.2s) y prepara una pizza en ciclo de 9s (lanza masa → salsa → queso → ingredientes → vapor y sonrisa). Ver `src/css/parallax.css`.
- Duraciones UI: 150–300ms, `ease` o `cubic-bezier(.2,.8,.2,1)`.
- `prefers-reduced-motion: reduce` desactiva toda animación y muestra la pizza terminada.

## Reglas UI

1. Precios siempre en `--font-mono` y en MXN con `$` sin decimales.
2. Contenido del menú en HTML estático (indexable); el JS solo agrega comportamiento.
3. Los teléfonos siempre como `tel:+526623011744`.
4. Íconos SVG inline con `currentColor`; decorativos con `aria-hidden="true"`.
5. Contraste mínimo AA en texto; `--text-dim` solo sobre `--bg`/`--surface`.
