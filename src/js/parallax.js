/* ==========================================================================
   parallax.js — Desplazamiento por capas del hero con requestAnimationFrame.
   Cada elemento con [data-depth] se mueve y * depth px al hacer scroll.
   Respeta prefers-reduced-motion y deja de calcular fuera del hero.
   ========================================================================== */
(function () {
  "use strict";

  var hero = document.querySelector(".hero");
  if (!hero) return;

  var motionQuery = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : { matches: false };

  var layers = Array.prototype.slice.call(hero.querySelectorAll("[data-depth]"));
  var depths = layers.map(function (el) { return parseFloat(el.dataset.depth) || 0; });
  var ticking = false;
  var heroVisible = true;

  function applyParallax() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset;
    // Más allá del alto del hero no se ve el efecto: no hace falta recalcular.
    if (y > hero.offsetHeight * 1.2) return;
    for (var i = 0; i < layers.length; i++) {
      layers[i].style.transform = "translate3d(0," + (y * depths[i]).toFixed(2) + "px,0)";
    }
  }

  function resetLayers() {
    layers.forEach(function (el) { el.style.transform = ""; });
  }

  function onScroll() {
    if (ticking || motionQuery.matches || !heroVisible) return;
    ticking = true;
    window.requestAnimationFrame(applyParallax);
  }

  // Pausa las animaciones CSS del hero (robot, flotantes) cuando no está a la vista.
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      heroVisible = entries[0].isIntersecting;
      hero.classList.toggle("is-offscreen", !heroVisible);
      if (heroVisible) onScroll();
    }, { threshold: 0 }).observe(hero);
  }

  function setup() {
    if (motionQuery.matches) {
      window.removeEventListener("scroll", onScroll);
      resetLayers();
    } else {
      window.addEventListener("scroll", onScroll, { passive: true });
      applyParallax();
    }
  }

  if (motionQuery.addEventListener) motionQuery.addEventListener("change", setup);
  setup();
})();
