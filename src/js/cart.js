// Cart panel injection and wiring for all pages
(function () {
  if (window.__cart_injected__) return; // avoid duplicate
  window.__cart_injected__ = true;

  // ============================
  // LocalStorage cart utilities
  // ============================
  const CART_KEY = 'motohub_cart';

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    } catch (_) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function addToCart(product, qty = 1) {
    const cart = getCart();
    const idx = cart.findIndex((x) => x.id === product.id);
    if (idx >= 0) cart[idx].qty += qty;
    else cart.push({ ...product, qty });
    saveCart(cart);
  }

  function updateQty(id, qty) {
    const cart = getCart();
    const i = cart.findIndex((x) => x.id === id);
    if (i >= 0) {
      cart[i].qty = Math.max(1, qty|0 || 1);
      saveCart(cart);
    }
  }

  function removeFromCart(id) {
    const cart = getCart().filter((x) => x.id !== id);
    saveCart(cart);
  }

  function clearCart() {
    localStorage.removeItem(CART_KEY);
  }

  function formatCurrency(n) {
    try {
      return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
    } catch {
      return `$${n}`;
    }
  }

  function createEl(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function injectCart() {
    if (document.getElementById('cart-panel')) return; // already

    const overlay = createEl('<div id="cart-overlay" class="cart-overlay" hidden></div>');
    const panel = createEl(`
      <aside id="cart-panel" class="cart-panel" aria-hidden="true" aria-labelledby="cart-title" role="dialog">
        <header class="cart-header">
          <h2 id="cart-title">Carrito</h2>
          <button id="close-cart" class="btn-icon" aria-label="Cerrar carrito">✕</button>
        </header>
        <section class="cart-items" aria-live="polite"></section>
        <footer class="cart-footer">
          <div class="cart-totals">
            <span>Subtotal</span>
            <strong class="subtotal" id="subtotal">$0</strong>
          </div>
          <div class="cart-actions">
            <a class="btn-secundario" href="/src/pages/Home.html">Seguir comprando</a>
            <button class="btn-primario" id="checkout">Proceder al pago</button>
          </div>
        </footer>
      </aside>
    `);

    document.body.appendChild(overlay);
    document.body.appendChild(panel);
  }

  // ===============
  // Render helpers
  // ===============
  function renderCart() {
    const list = document.querySelector('.cart-items');
    const subtotalEl = document.getElementById('subtotal');
    if (!list || !subtotalEl) return;

    const cart = getCart();
    if (!cart.length) {
      list.innerHTML = '<p class="hint">Tu carrito está vacío.</p>';
      subtotalEl.textContent = formatCurrency(0);
      return;
    }

    list.innerHTML = cart
      .map(
        (item) => `
        <article class="cart-item" data-id="${item.id}">
          <img src="${item.image || '/src/assets/images/logo.png'}" alt="${item.title || 'Producto'}" class="item-thumb" />
          <div class="item-info">
            <h3 class="item-title">${item.title || 'Producto'}</h3>
            <div class="item-meta">
              <span class="item-price">${formatCurrency(item.price || 0)}</span>
              <div class="item-qty">
                <button class="qty-btn" data-action="dec" aria-label="Disminuir">−</button>
                <input class="qty-input" type="number" value="${item.qty || 1}" min="1" aria-label="Cantidad" />
                <button class="qty-btn" data-action="inc" aria-label="Aumentar">+</button>
              </div>
            </div>
          </div>
          <button class="item-remove" aria-label="Quitar">Eliminar</button>
        </article>`
      )
      .join('');

    const subtotal = cart.reduce((acc, it) => acc + (Number(it.price) || 0) * (Number(it.qty) || 1), 0);
    subtotalEl.textContent = formatCurrency(subtotal);
  }

  function openCartPanel() {
    const panel = document.getElementById('cart-panel');
    const overlay = document.getElementById('cart-overlay');
    if (!panel) return;
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    if (overlay) overlay.hidden = false;
    document.body.classList.add('no-scroll');
  }

  function closeCartPanel() {
    const panel = document.getElementById('cart-panel');
    const overlay = document.getElementById('cart-overlay');
    if (!panel) return;
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    if (overlay) overlay.hidden = true;
    document.body.classList.remove('no-scroll');
  }

  function setupBehavior() {
    const panel = document.getElementById('cart-panel');
    const overlay = document.getElementById('cart-overlay');
    const closeBtn = document.getElementById('close-cart');

    // wire triggers: any element with aria-label="Carrito" or [data-cart-open]
    function wireTriggers() {
      const triggers = Array.from(document.querySelectorAll('[aria-label="Carrito"], [data-cart-open]'));
      triggers.forEach((el) => {
        if (el.__cart_wired__) return;
        el.addEventListener('click', (e) => {
          e.preventDefault();
          renderCart();
          openCartPanel();
        });
        el.__cart_wired__ = true;
      });
    }

    wireTriggers();

    closeBtn && closeBtn.addEventListener('click', closeCartPanel);
    overlay && overlay.addEventListener('click', closeCartPanel);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) closeCartPanel();
    });

    // quantity and remove (delegated)
    document.addEventListener('click', (e) => {
      // +/- quantity inside cart
      const qtyBtn = e.target.closest('.qty-btn');
      if (qtyBtn) {
        const article = qtyBtn.closest('.cart-item');
        if (!article) return;
        const id = article.getAttribute('data-id');
        const input = article.querySelector('.qty-input');
        const action = qtyBtn.dataset.action;
        const val = parseInt(input.value || '1', 10);
        const newVal = action === 'inc' ? val + 1 : Math.max(1, val - 1);
        input.value = String(newVal);
        updateQty(id, newVal);
        renderCart();
        return;
      }

      // remove item
      const rmBtn = e.target.closest('.item-remove');
      if (rmBtn) {
        const article = rmBtn.closest('.cart-item');
        if (!article) return;
        const id = article.getAttribute('data-id');
        removeFromCart(id);
        renderCart();
        return;
      }
    });

    // Add to cart buttons (delegated): support [data-action="add-to-cart"] or .ver-mas
    document.addEventListener('click', (e) => {
      const addBtn = e.target.closest('[data-action="add-to-cart"], .ver-mas');
      if (!addBtn) return;

      // Try dataset first
      let { id, title, price, image } = addBtn.dataset;

      // Fallback: infer from closest product card structure
      if (!id || !title || !price) {
        const card = addBtn.closest('.prod, .product-card');
        if (card) {
          const t = title || (card.querySelector('h2, .product-title, .item-title')?.textContent || '').trim() || 'Producto';
          const pTxt = price || (card.querySelector('p, .price, .product-price')?.textContent || '').replace(/[^0-9.,]/g, '').replace(',', '.') || '0';
          const p = parseFloat(pTxt) || 0;
          const img = image || card.querySelector('img')?.getAttribute('src') || '/src/assets/images/logo.png';
          title = t;
          price = p;
          image = img;
          id = id || `${t}|${p}|${img}`; // deterministic id
        }
      }

      const product = {
        id: String(id || Date.now()),
        title: String(title || 'Producto'),
        price: Number(price || 0),
        image: String(image || '/src/assets/images/logo.png'),
      };

      addToCart(product, 1);
      renderCart();
      openCartPanel();
    });

    // In case navbar or parts load later, re-scan triggers
    const obs = new MutationObserver(wireTriggers);
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }

  function ensureStyles() {
    // If page forgot to add carrito.css, optionally inject it (non-invasive check)
    const has = Array.from(document.styleSheets).some((s) => (s.href || '').includes('/src/css/carrito.css'));
    if (!has) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/src/css/carrito.css';
      document.head.appendChild(link);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    injectCart();
    ensureStyles();
    setupBehavior();
    renderCart();
  });
})();


(function () {
  const openBtn = document.getElementById('open-cart');
  const closeBtn = document.getElementById('close-cart');
  const panel = document.getElementById('cart-panel');
  const overlay = document.getElementById('cart-overlay');

  function openCart() {
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    overlay.hidden = false;
    document.body.classList.add('no-scroll');
  }

  function closeCart() {
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    overlay.hidden = true;
    document.body.classList.remove('no-scroll');
  }

  openBtn?.addEventListener('click', openCart);
  closeBtn?.addEventListener('click', closeCart);
  overlay?.addEventListener('click', closeCart);

  // Accesibilidad: cerrar con ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('is-open')) {
      closeCart();
    }
  });

  // Demo: botones +/- cantidad (sin persistencia)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.qty-btn');
    if (!btn) return;
    const input = btn.parentElement.querySelector('.qty-input');
    const action = btn.dataset.action;
    const val = parseInt(input.value || '1', 10);
    if (action === 'inc') input.value = String(val + 1);
    if (action === 'dec') input.value = String(Math.max(1, val - 1));
  });
})();