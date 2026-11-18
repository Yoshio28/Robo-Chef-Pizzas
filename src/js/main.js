/* ==========================================================================
   main.js — Interacciones: menú móvil, tap-to-call, armado de pizza,
   carrito con envío por WhatsApp, modal de términos y estado abierto/cerrado.
   El menú está escrito en el HTML (indexable por buscadores); aquí solo
   se le da comportamiento.
   ========================================================================== */
(function () {
  "use strict";

  var WA_NUMBER = "526623011744";
  var MAX_INGREDIENTS = 4;
  var $ = function (id) { return document.getElementById(id); };

  $("year").textContent = new Date().getFullYear();

  /* ---------- MENÚ MÓVIL ---------- */
  var header = document.querySelector("header.nav");
  var menuToggle = $("menuToggle");
  function setMenu(open) {
    header.classList.toggle("menu-open", open);
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    menuToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  }
  menuToggle.addEventListener("click", function () {
    setMenu(!header.classList.contains("menu-open"));
  });
  $("mobileNav").addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });

  /* ---------- TAP-TO-CALL ----------
     Los enlaces tel: funcionan nativo en móvil. En escritorio, si el
     navegador no tiene app de llamadas, se copia el número al portapapeles. */
  var isTouch = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  document.addEventListener("click", function (e) {
    var tel = e.target.closest('a[href^="tel:"]');
    if (!tel || isTouch || !navigator.clipboard) return;
    navigator.clipboard.writeText("(662) 301-1744").then(function () {
      tel.setAttribute("data-copied", "Número copiado");
      setTimeout(function () { tel.removeAttribute("data-copied"); }, 1800);
    }).catch(function () {});
  });

  /* ---------- ARMA TU PIZZA ---------- */
  var chipsEl = $("buildChips");
  var chips = Array.prototype.slice.call(chipsEl.querySelectorAll(".chip"));
  var selectedChips = [];

  function refreshChips() {
    $("chipCount").textContent = selectedChips.length;
    chips.forEach(function (c) {
      var on = selectedChips.indexOf(c.dataset.ing) > -1;
      c.classList.toggle("on", on);
      c.setAttribute("aria-pressed", on ? "true" : "false");
      c.classList.toggle("disabled", selectedChips.length >= MAX_INGREDIENTS && !on);
    });
  }
  chipsEl.addEventListener("click", function (e) {
    var chip = e.target.closest(".chip");
    if (!chip) return;
    var ing = chip.dataset.ing;
    var idx = selectedChips.indexOf(ing);
    if (idx > -1) selectedChips.splice(idx, 1);
    else if (selectedChips.length < MAX_INGREDIENTS) selectedChips.push(ing);
    refreshChips();
  });

  /* ---------- CARRITO ---------- */
  var cart = [];
  try {
    var raw = localStorage.getItem("robochef_cart");
    if (raw) cart = JSON.parse(raw) || [];
  } catch (e) { cart = []; }

  function saveCart() {
    try { localStorage.setItem("robochef_cart", JSON.stringify(cart)); } catch (e) {}
  }
  function cartTotal() {
    return cart.reduce(function (s, it) { return s + it.price; }, 0);
  }
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function addItem(item) {
    cart.push(item);
    saveCart();
    renderCart();
    openCart();
  }
  function removeItem(i) {
    cart.splice(i, 1);
    saveCart();
    renderCart();
  }

  function renderCart() {
    var el = $("cartItems");
    var countEl = $("cartCount");
    if (cart.length === 0) {
      el.innerHTML = '<p class="cart-empty">Aún no agregas nada. Explora el menú y dale a "Agregar".</p>';
      countEl.hidden = true;
    } else {
      countEl.hidden = false;
      countEl.textContent = cart.length;
      el.innerHTML = cart.map(function (it, i) {
        return '<div class="cart-item">' +
          "<div>" +
            '<div class="ci-name">' + escapeHtml(it.name) + "</div>" +
            (it.meta ? '<div class="ci-meta">' + escapeHtml(it.meta) + "</div>" : "") +
            '<button class="ci-remove" data-i="' + i + '">Quitar</button>' +
          "</div>" +
          '<div class="ci-price">$' + it.price + "</div>" +
        "</div>";
      }).join("");
    }
    $("cartTotal").textContent = "$" + cartTotal();
    updateWaLink();
  }

  document.body.addEventListener("click", function (e) {
    var btn = e.target.closest(".add-btn");
    if (!btn) return;

    if (btn.id === "buildAddBtn") {
      if (selectedChips.length !== MAX_INGREDIENTS) {
        alert("Elige exactamente 4 ingredientes para tu pizza.");
        return;
      }
      var sv = $("buildSize").value.split("|");
      addItem({ name: "Arma tu pizza", meta: sv[0] + " · " + selectedChips.join(", "), price: parseInt(sv[1], 10) });
      selectedChips = [];
      refreshChips();
      return;
    }

    if (btn.dataset.kind === "sized") {
      var parts = $(btn.dataset.sel).value.split("|");
      addItem({ name: btn.dataset.name, meta: parts[0], price: parseInt(parts[1], 10) });
    } else if (btn.dataset.kind === "fixed") {
      addItem({ name: btn.dataset.name, meta: "", price: parseInt(btn.dataset.price, 10) });
    }
  });

  $("cartItems").addEventListener("click", function (e) {
    var rm = e.target.closest(".ci-remove");
    if (rm) removeItem(parseInt(rm.dataset.i, 10));
  });

  var orderType = "Recoger en el local";
  $("orderType").addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    orderType = b.dataset.type;
    Array.prototype.forEach.call(this.querySelectorAll("button"), function (x) {
      x.classList.toggle("sel", x === b);
    });
    updateWaLink();
  });
  $("custName").addEventListener("input", updateWaLink);
  $("custNote").addEventListener("input", updateWaLink);

  function buildWaMessage() {
    var lines = ["Hola RoboChef Pizzas! Quiero hacer un pedido:"];
    if (cart.length) {
      cart.forEach(function (it) {
        lines.push("• " + it.name + (it.meta ? " (" + it.meta + ")" : "") + " — $" + it.price);
      });
      lines.push("Total estimado: $" + cartTotal());
    } else {
      lines.push("(agregar productos desde el menú)");
    }
    lines.push("Tipo de pedido: " + orderType);
    var name = $("custName").value.trim();
    if (name) lines.push("Nombre: " + name);
    var note = $("custNote").value.trim();
    if (note) lines.push("Notas: " + note);
    return lines.join("\n");
  }
  function updateWaLink() {
    var url = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(buildWaMessage());
    ["sendWaBtn", "navWaBtn", "heroWaBtn", "footerWaBtn"].forEach(function (id) {
      $(id).href = url;
    });
  }

  function openCart() {
    $("cartPanel").classList.add("open");
    $("cartOverlay").classList.add("open");
  }
  function closeCart() {
    $("cartPanel").classList.remove("open");
    $("cartOverlay").classList.remove("open");
  }
  $("cartOpenBtn").addEventListener("click", openCart);
  $("cartCloseBtn").addEventListener("click", closeCart);
  $("cartOverlay").addEventListener("click", closeCart);

  renderCart();

  /* ---------- TÉRMINOS / AVISO DE PRIVACIDAD ---------- */
  function openTerms() { $("termsOverlay").classList.add("open"); }
  function closeTerms() { $("termsOverlay").classList.remove("open"); }
  $("termsOpenBtn").addEventListener("click", openTerms);
  $("termsCloseBtn").addEventListener("click", closeTerms);
  $("termsOverlay").addEventListener("click", function (e) {
    if (e.target.id === "termsOverlay") closeTerms();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeTerms(); closeCart(); setMenu(false); }
  });

  /* ---------- ABIERTO / CERRADO (America/Hermosillo, UTC-7 fijo, sin horario de verano) ---------- */
  function computeStatus() {
    var now = new Date();
    var hmo = new Date(now.getTime() + now.getTimezoneOffset() * 60000 - 7 * 3600000);
    var day = hmo.getDay(); // 0 dom .. 6 sáb
    var mins = hmo.getHours() * 60 + hmo.getMinutes();
    var isFriSat = day === 5 || day === 6;
    var yesterday = (day + 6) % 7;
    var windows = isFriSat
      ? [[11 * 60, 14 * 60], [17 * 60, 26 * 60]]
      : [[11 * 60, 14 * 60], [17 * 60, 23 * 60]];
    var openNow = windows.some(function (w) { return mins >= w[0] && mins < w[1]; }) ||
      // viernes y sábado cierran a las 2 am del día siguiente
      (mins < 2 * 60 && (yesterday === 5 || yesterday === 6));

    $("statusBadge").className = "status-badge " + (openNow ? "open" : "closed");
    $("statusText").textContent = openNow ? "Abierto ahora" : "Cerrado ahora";
  }
  computeStatus();
  setInterval(computeStatus, 60000);
})();
