// ══════════════════════════════════════════════════════════════
// NutsNTreat — Shared Cart & Wishlist Storage  (v2 – fixed)
// SERVER-ONLY: No localStorage for cart data. All cart/wishlist
// data lives on the server, keyed by user UID.
// Auth reads cookies → sessionStorage → localStorage (same
// priority as login.html's Store.getSession()).
// Works across index.html, shop.html, cart.html, wishlist.html.
// ══════════════════════════════════════════════════════════════

const NNT = (() => {
  const API_BASE = 'https://nutsntreat-backend2.onrender.com/api';
  
  // ── AUTH — mirrors login.html Store.getSession() fallback chain ──
  function getCookie(name) {
    return decodeURIComponent(
      (document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)')) || [])[1] || ''
    ) || null;
  }

  /**
   * Reads the active session from:
   *   1. Cookies (nnt_token + nnt_user)  ← preferred
   *   2. sessionStorage (nnt_session)
   *   3. localStorage  (nnt_session)
   * Returns { token, user } or null.
   */
  function getSession() {
    // 1. Cookies
    try {
      const token = decodeURIComponent((document.cookie.match(/nnt_token=([^;]+)/) || [])[1] || '');
      const user  = JSON.parse(decodeURIComponent((document.cookie.match(/nnt_user=([^;]+)/) || [])[1] || 'null'));
      if (token && user) return { token, user };
    } catch(e) {}

    // 2. sessionStorage
    try {
      const s = JSON.parse(sessionStorage.getItem('nnt_session'));
      if (s && s.token && s.user) return s;
    } catch(e) {}

    // 3. localStorage
    try {
      const s = JSON.parse(localStorage.getItem('nnt_session'));
      if (s && s.token && s.user && Date.now() < s.exp) return s;
    } catch(e) {}

    return null;
  }

  function getToken() {
    const s = getSession();
    return s ? s.token : null;
  }

  function getUser() {
    const s = getSession();
    return s ? s.user : null;
  }

  function getUID() {
    const u = getUser();
    if (u && u.email) return btoa(u.email).replace(/[=+/]/g, '');
    return 'guest';
  }

  function apiHeaders() {
    const t = getToken();
    const h = { 'Content-Type': 'application/json' };
    if (t) h['Authorization'] = 'Bearer ' + t;
    return h;
  }

  // ── IN-MEMORY CACHE (single source of truth = server) ──
  let _cart     = [];
  let _wishlist = [];

  // ── SERVER FETCH ──
  async function fetchCartFromServer() {
    const uid = getUID();
    if (uid === 'guest') { _cart = []; return; }
    try {
      const res  = await fetch(`${API_BASE}/cart/${uid}`, { headers: apiHeaders() });
      if (!res.ok) { _cart = []; return; }
      const data = await res.json();
      _cart = Array.isArray(data)       ? data
            : Array.isArray(data.items) ? data.items
            : Array.isArray(data.cart)  ? data.cart
            : [];
    } catch(e) { _cart = []; }
  }

  async function fetchWishlistFromServer() {
    const uid = getUID();
    if (uid === 'guest') { _wishlist = []; return; }
    try {
      const res  = await fetch(`${API_BASE}/wishlist/${uid}`, { headers: apiHeaders() });
      if (!res.ok) { _wishlist = []; return; }
      const data = await res.json();
      _wishlist = Array.isArray(data.items) ? data.items
                : Array.isArray(data)       ? data
                : [];
    } catch(e) { _wishlist = []; }
  }

  // ── SERVER PUSH ──
  async function pushCartToServer() {
    const uid = getUID();
    if (uid === 'guest') return;
    try {
      await fetch(`${API_BASE}/cart/${uid}`, {
        method:  'PUT',
        headers: apiHeaders(),
        body:    JSON.stringify({ items: _cart })
      });
    } catch(e) { console.warn('[NNT] Cart server push failed:', e.message); }
  }

  async function pushWishlistToServer() {
    const uid = getUID();
    if (uid === 'guest') return;
    try {
      await fetch(`${API_BASE}/wishlist/${uid}`, {
        method:  'PUT',
        headers: apiHeaders(),
        body:    JSON.stringify({ items: _wishlist })
      });
    } catch(e) { console.warn('[NNT] Wishlist server push failed:', e.message); }
  }

  // ── CART READS ──
  function getCart()    { return [..._cart]; }
  function cartCount()  { return _cart.reduce((s, i) => s + (i.qty || 1), 0); }

  // ── CART WRITES (update in-memory + push to server immediately) ──
  async function addToCart(product) {
    const ex = _cart.find(i => String(i.id) === String(product.id));
    if (ex) ex.qty = (ex.qty || 1) + 1;
    else _cart.push({ ...product, qty: 1 });
    await pushCartToServer();
    return [..._cart];
  }

  async function removeFromCart(id) {
    _cart = _cart.filter(i => String(i.id) !== String(id));
    await pushCartToServer();
    return [..._cart];
  }

  async function updateQty(id, qty) {
    const item = _cart.find(i => String(i.id) === String(id));
    if (!item) return [..._cart];
    if (qty <= 0) return removeFromCart(id);
    item.qty = qty;
    await pushCartToServer();
    return [..._cart];
  }

  async function setCart(items) {
    _cart = Array.isArray(items) ? items : [];
    await pushCartToServer();
  }

  async function clearCart() {
    _cart = [];
    await pushCartToServer();
  }

  // ── WISHLIST READS ──
  function getWishlist()    { return [..._wishlist]; }
  function isInWishlist(id) { return _wishlist.some(w => String(w.id) === String(id)); }

  // ── WISHLIST WRITES ──
  async function addToWishlist(product) {
    if (!_wishlist.some(w => String(w.id) === String(product.id))) {
      _wishlist.push({ ...product });
      await pushWishlistToServer();
    }
    return [..._wishlist];
  }

  async function removeFromWishlist(id) {
    _wishlist = _wishlist.filter(w => String(w.id) !== String(id));
    await pushWishlistToServer();
    return [..._wishlist];
  }

  async function toggleWishlist(product) {
    if (isInWishlist(product.id)) {
      const wl = await removeFromWishlist(product.id);
      return { wl, added: false };
    }
    const wl = await addToWishlist(product);
    return { wl, added: true };
  }

  async function setWishlist(items) {
    _wishlist = Array.isArray(items) ? items : [];
    await pushWishlistToServer();
  }

  async function clearWishlist() {
    _wishlist = [];
    await pushWishlistToServer();
  }

  // ── INIT: pull from server, then fire nnt:ready ──
  async function init() {
    await Promise.all([fetchCartFromServer(), fetchWishlistFromServer()]);
    document.dispatchEvent(new CustomEvent('nnt:ready', {
      detail: { cart: getCart(), wishlist: getWishlist() }
    }));
  }

  return {
    getToken, getUser, getUID,
    // Cart
    getCart, setCart, addToCart, removeFromCart, updateQty, clearCart, cartCount,
    // Wishlist
    getWishlist, setWishlist, isInWishlist, addToWishlist, removeFromWishlist, toggleWishlist, clearWishlist,
    // Init
    init
  };
})();