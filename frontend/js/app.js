// ── NutsNTreat Frontend Config ──
const API = 'http://127.0.0.1:5000/api';

// ── Auth Helpers ──
const Auth = {
  getToken: () => localStorage.getItem('nnt_token'),
  getUser:  () => JSON.parse(localStorage.getItem('nnt_user') || 'null'),
  setSession: (token, user) => { localStorage.setItem('nnt_token', token); localStorage.setItem('nnt_user', JSON.stringify(user)); },
  clear: () => { localStorage.removeItem('nnt_token'); localStorage.removeItem('nnt_user'); },
  isLoggedIn: () => !!localStorage.getItem('nnt_token'),
  isAdmin: () => JSON.parse(localStorage.getItem('nnt_user') || '{}').role === 'admin'
};

// ── API Request Helper ──
async function apiCall(endpoint, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = Auth.getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(API + endpoint, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ── Cart ──
const Cart = {
  get: () => JSON.parse(localStorage.getItem('nnt_cart') || '[]'),
  save: (cart) => localStorage.setItem('nnt_cart', JSON.stringify(cart)),
  count: () => Cart.get().reduce((s, i) => s + i.qty, 0),
  add(product) {
    const cart = Cart.get();
    const ex = cart.find(i => i._id === product._id);
    if (ex) ex.qty++; else cart.push({ ...product, qty: 1 });
    Cart.save(cart);
    Cart.updateUI();
    showToast(`✓ ${product.name} added to cart!`);
  },
  remove(id) {
    Cart.save(Cart.get().filter(i => i._id !== id));
    Cart.updateUI();
  },
  changeQty(id, delta) {
    const cart = Cart.get();
    const item = cart.find(i => i._id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) Cart.remove(id);
    else { Cart.save(cart); Cart.updateUI(); }
  },
  clear() { localStorage.removeItem('nnt_cart'); Cart.updateUI(); },
  updateUI() {
    const n = Cart.count();
    document.querySelectorAll('.cart-count').forEach(el => el.textContent = n);
  }
};
// ── Logout ──
function doLogout() {
  Auth.clear();
  window.location.href = 'login.html';
}
// ── Toast ──
function showToast(msg, type = 'success') {
  let toast = document.getElementById('global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'global-toast';
    toast.style.cssText = 'position:fixed;bottom:2rem;right:2rem;padding:0.9rem 1.5rem;border-radius:14px;font-size:0.88rem;font-weight:500;transform:translateY(120px);opacity:0;transition:all 0.35s;z-index:9999;max-width:320px;box-shadow:0 8px 28px rgba(0,0,0,0.25);font-family:DM Sans,sans-serif';
    document.body.appendChild(toast);
  }
  toast.style.background = type === 'error' ? '#C0392B' : '#3B1F0A';
  toast.style.color = '#fff';
  toast.textContent = msg;
  toast.style.transform = 'translateY(0)';
  toast.style.opacity = '1';
  setTimeout(() => { toast.style.transform = 'translateY(120px)'; toast.style.opacity = '0'; }, 3000);
}

// ── Init nav on every page ──
document.addEventListener('DOMContentLoaded', () => {
  Cart.updateUI();
  // Update nav user state
  const userBtn = document.getElementById('nav-user-btn');
  if (userBtn) {
    if (Auth.isLoggedIn()) {
      const u = Auth.getUser();
      userBtn.textContent = `👤 ${u.name.split(' ')[0]}`;
      userBtn.onclick = () => window.location.href = 'profile.html';
    } else {
      userBtn.textContent = 'Login';
      userBtn.onclick = () => window.location.href = 'login.html';
    }
  }
  const adminLink = document.getElementById('nav-admin-link');
  if (adminLink) adminLink.style.display = Auth.isAdmin() ? 'inline-block' : 'none';
});
