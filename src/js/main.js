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
  // Cada línea del carrito: {name, meta, price (unitario), qty}.
  // Productos iguales (mismo nombre y tamaño/ingredientes) se agrupan en una sola línea.
  var cart = [];
  function itemKey(it) { return it.name + "|" + (it.meta || ""); }
  try {
    var raw = JSON.parse(localStorage.getItem("robochef_cart") || "[]");
    if (Array.isArray(raw)) {
      raw.forEach(function (it) {
        if (!it || !it.name) return;
        mergeIntoCart({ name: it.name, meta: it.meta || "", price: Number(it.price) || 0, qty: Math.max(1, parseInt(it.qty, 10) || 1) });
      });
    }
  } catch (e) { cart = []; }

  function mergeIntoCart(item) {
    var key = itemKey(item);
    for (var i = 0; i < cart.length; i++) {
      if (itemKey(cart[i]) === key) { cart[i].qty += item.qty; return cart[i]; }
    }
    cart.push(item);
    return item;
  }

  function saveCart() {
    try { localStorage.setItem("robochef_cart", JSON.stringify(cart)); } catch (e) {}
  }
  function cartTotal() {
    return cart.reduce(function (s, it) { return s + it.price * it.qty; }, 0);
  }
  function cartQty() {
    return cart.reduce(function (s, it) { return s + it.qty; }, 0);
  }
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // Agregar NO abre el carrito: se confirma en el botón, el contador y un aviso.
  function addItem(item, btn) {
    item.qty = 1;
    var line = mergeIntoCart(item);
    saveCart();
    renderCart();
    confirmAdded(btn, line);
  }
  function changeQty(i, delta) {
    if (!cart[i]) return;
    cart[i].qty += delta;
    if (cart[i].qty <= 0) cart.splice(i, 1);
    saveCart();
    renderCart();
  }
  function removeItem(i) {
    cart.splice(i, 1);
    saveCart();
    renderCart();
  }

  var toastTimer, btnTimers = new WeakMap();
  function confirmAdded(btn, line) {
    if (btn) {
      var original = btn.dataset.label || btn.textContent;
      btn.dataset.label = original;
      btn.textContent = "Agregado ✓";
      btn.classList.add("added");
      clearTimeout(btnTimers.get(btn));
      btnTimers.set(btn, setTimeout(function () {
        btn.textContent = original;
        btn.classList.remove("added");
      }, 1400));
    }
    var badge = $("cartCount");
    badge.classList.remove("bump");
    void badge.offsetWidth; // reinicia la animación
    badge.classList.add("bump");

    $("cartToastText").textContent = (line.qty > 1 ? line.qty + "× " : "") + line.name + " en tu pedido";
    var toast = $("cartToast");
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 3200);
  }
  $("cartToastBtn").addEventListener("click", function () {
    $("cartToast").classList.remove("show");
    openCart();
  });

  function renderCart() {
    var el = $("cartItems");
    var countEl = $("cartCount");
    if (cart.length === 0) {
      el.innerHTML = '<p class="cart-empty">Aún no agregas nada. Explora el menú y dale a "Agregar".</p>';
      countEl.hidden = true;
    } else {
      countEl.hidden = false;
      countEl.textContent = cartQty();
      el.innerHTML = cart.map(function (it, i) {
        var name = escapeHtml(it.name);
        return '<div class="cart-item">' +
          "<div>" +
            '<div class="ci-name">' + (it.qty > 1 ? it.qty + "× " : "") + name + "</div>" +
            (it.meta ? '<div class="ci-meta">' + escapeHtml(it.meta) + "</div>" : "") +
            '<div class="ci-actions">' +
              '<span class="ci-qty">' +
                '<button type="button" data-i="' + i + '" data-delta="-1" aria-label="Quitar uno de ' + name + '">−</button>' +
                '<output aria-label="Cantidad">' + it.qty + "</output>" +
                '<button type="button" data-i="' + i + '" data-delta="1" aria-label="Agregar uno más de ' + name + '">+</button>' +
              "</span>" +
              '<button class="ci-remove" data-i="' + i + '">Quitar</button>' +
            "</div>" +
          "</div>" +
          "<div>" +
            '<div class="ci-price">$' + it.price * it.qty + "</div>" +
            (it.qty > 1 ? '<div class="ci-unit">$' + it.price + " c/u</div>" : "") +
          "</div>" +
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
      // Orden alfabético: la misma combinación se agrupa aunque se elija en otro orden.
      var ings = selectedChips.slice().sort(function (a, b) { return a.localeCompare(b, "es"); });
      addItem({ name: "Arma tu pizza", meta: sv[0] + " · " + ings.join(", "), price: parseInt(sv[1], 10) }, btn);
      selectedChips = [];
      refreshChips();
      return;
    }

    if (btn.dataset.kind === "sized") {
      var parts = $(btn.dataset.sel).value.split("|");
      addItem({ name: btn.dataset.name, meta: parts[0], price: parseInt(parts[1], 10) }, btn);
    } else if (btn.dataset.kind === "fixed") {
      addItem({ name: btn.dataset.name, meta: "", price: parseInt(btn.dataset.price, 10) }, btn);
    }
  });

  $("cartItems").addEventListener("click", function (e) {
    var rm = e.target.closest(".ci-remove");
    if (rm) { removeItem(parseInt(rm.dataset.i, 10)); return; }
    var q = e.target.closest(".ci-qty button");
    if (q) changeQty(parseInt(q.dataset.i, 10), parseInt(q.dataset.delta, 10));
  });

  var orderType = "Recoger en el local";
  $("orderType").addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    orderType = b.dataset.type;
    Array.prototype.forEach.call(this.querySelectorAll("button"), function (x) {
      x.classList.toggle("sel", x === b);
    });
    var delivery = isDelivery();
    $("addressWrap").hidden = !delivery;
    $("custAddress").required = delivery;
    if (!delivery) setAddressError(false);
    updateWaLink();
  });
  $("custName").addEventListener("input", updateWaLink);
  $("custNote").addEventListener("input", updateWaLink);
  $("custAddress").addEventListener("input", function () {
    if (this.value.trim()) setAddressError(false);
    updateWaLink();
  });

  var DELIVERY = "Entrega a domicilio";
  function isDelivery() { return orderType === DELIVERY; }
  function setAddressError(show) {
    $("addressError").hidden = !show;
    $("custAddress").setAttribute("aria-invalid", show ? "true" : "false");
  }
  // A domicilio, el domicilio es obligatorio: sin él no se abre WhatsApp.
  $("sendWaBtn").addEventListener("click", function (e) {
    if (isDelivery() && !$("custAddress").value.trim()) {
      e.preventDefault();
      setAddressError(true);
      $("custAddress").focus();
    }
  });

  function buildWaMessage() {
    var lines = ["Hola RoboChef Pizzas! Quiero hacer un pedido:"];
    if (cart.length) {
      cart.forEach(function (it) {
        lines.push("• " + (it.qty > 1 ? it.qty + "× " : "") + it.name + (it.meta ? " (" + it.meta + ")" : "") +
          " — $" + it.price * it.qty + (it.qty > 1 ? " ($" + it.price + " c/u)" : ""));
      });
      lines.push("Total estimado: $" + cartTotal());
    } else {
      lines.push("(agregar productos desde el menú)");
    }
    lines.push("Tipo de pedido: " + orderType);
    var name = $("custName").value.trim();
    if (name) lines.push("Nombre: " + name);
    var address = $("custAddress").value.trim();
    if (isDelivery() && address) lines.push("Domicilio: " + address);
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
