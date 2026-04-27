// ─────────────────────────────────────────
//  NutsNTreat – Admin Panel JavaScript
//  frontend/js/admin.js
// ─────────────────────────────────────────

// Guard: admin only
// ── GUARD: runs after DOM is ready ──
document.addEventListener('DOMContentLoaded', () => {

  if (!Auth.isLoggedIn() || !Auth.isAdmin()) {
    window.location.replace('login.html?redirect=admin.html');
    return; // stop everything else running
  }

  // rest of your init code here...
  const user = Auth.getUser();
  document.getElementById('admin-name').textContent = user?.name || 'Admin';
  document.getElementById('topbar-date').textContent = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  loadDashboard(); // init dashboard

});
document.body.style.visibility = 'visible';
const user = Auth.getUser();
document.getElementById('admin-name').textContent = user?.name || 'Admin';
document.getElementById('topbar-date').textContent = new Date().toLocaleDateString('en-IN', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

let allProducts = [], allOrders = [];

// ── PAGE NAVIGATION ──────────────────────
function showAdminPage(name) {
  document.querySelectorAll('.admin-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  document.querySelectorAll('.sidebar-item').forEach(i => {
    if (i.textContent.toLowerCase().includes(name.slice(0, 4))) i.classList.add('active');
  });
  const titles = {
    dashboard: 'Dashboard', products: 'Products', orders: 'Orders',
    subscriptions: 'Subscriptions', users: 'Customers', contacts: 'Messages'
  };
  document.getElementById('page-title').textContent = titles[name] || name;
  if (name === 'products')     loadProducts();
  if (name === 'orders')       loadOrders();
  if (name === 'subscriptions') loadSubscriptions();
  if (name === 'users')        loadUsers();
  if (name === 'contacts')     loadContacts();
}

function closeModal(id) { document.getElementById(id).classList.remove('open'); }
function doLogout() { Auth.clear(); window.location.href = 'login.html'; }

// ── DASHBOARD ────────────────────────────
async function loadDashboard() {
  try {
    const d = await apiCall('/admin/stats');
    document.getElementById('s-revenue').textContent  = '₹' + (d.stats.totalRevenue || 0).toLocaleString('en-IN');
    document.getElementById('s-orders').textContent   = d.stats.totalOrders;
    document.getElementById('s-users').textContent    = d.stats.totalUsers;
    document.getElementById('s-subs').textContent     = d.stats.totalSubs;
    document.getElementById('s-products').textContent = d.stats.totalProducts;
    document.getElementById('s-contacts').textContent = d.stats.newContacts;
    if (d.stats.newContacts > 0) document.getElementById('contacts-dot').style.display = 'inline-block';

    // Recent orders
    const rob = document.getElementById('recent-orders-body');
    rob.innerHTML = d.recentOrders.map(o => `
      <tr>
        <td style="font-weight:600;font-size:0.8rem">${o.orderId}</td>
        <td>${o.customerName}</td>
        <td style="font-weight:600">₹${o.total}</td>
        <td><span class="status-${o.status.toLowerCase()}">${o.status}</span></td>
      </tr>`).join('') || '<tr><td colspan="4" style="text-align:center;color:#aaa;padding:2rem">No orders yet</td></tr>';

    // Low stock
    const lsb = document.getElementById('low-stock-body');
    lsb.innerHTML = d.lowStock.map(p => `
      <tr>
        <td>${p.name}</td>
        <td>
          <span style="font-weight:700;color:${p.stock < 5 ? 'var(--red)' : 'var(--amber-dark)'}">${p.stock}</span>
          <div class="stock-bar">
            <div class="stock-fill" style="width:${Math.min(p.stock, 100)}%;background:${p.stock < 5 ? 'var(--red)' : 'var(--amber)'}"></div>
          </div>
        </td>
      </tr>`).join('') || '<tr><td colspan="2" style="text-align:center;color:#aaa;padding:2rem">All good!</td></tr>';

    renderCharts(d.monthlyRevenue, d.catSales);
  } catch (err) {
    console.error('Dashboard load failed:', err.message);
  }
}

function renderCharts(monthly, catSales) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const rc = document.getElementById('revenue-chart').getContext('2d');
  new Chart(rc, {
    type: 'bar',
    data: {
      labels: monthly.map(m => months[m._id.month - 1] + ' ' + m._id.year),
      datasets: [{
        label: 'Revenue (₹)',
        data: monthly.map(m => m.revenue),
        backgroundColor: 'rgba(200,131,42,0.7)',
        borderColor: '#C8832A',
        borderWidth: 2,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { ticks: { callback: v => '₹' + v.toLocaleString('en-IN') } } }
    }
  });

  const cc = document.getElementById('cat-chart').getContext('2d');
  const colors = ['#C8832A','#2D5016','#3B1F0A','#C0392B','#1565C0'];
  new Chart(cc, {
    type: 'doughnut',
    data: {
      labels: catSales.map(c => c._id),
      datasets: [{
        data: catSales.map(c => c.revenue),
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } }
    }
  });
}

// ── PRODUCTS ─────────────────────────────
async function loadProducts() {
  try {
    const adminData = await apiCall('/products');
    allProducts = adminData.products;
    renderProductsTable(allProducts);
  } catch (err) { showToast(err.message, 'error'); }
}

function renderProductsTable(products) {
  const tbody = document.getElementById('products-body');
  if (!products.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:3rem;color:#aaa">No products found</td></tr>';
    return;
  }
  tbody.innerHTML = products.map(p => `
    <tr>
      <td><img src="${p.image}" style="width:50px;height:50px;object-fit:cover;border-radius:8px" alt="${p.name}"></td>
      <td style="font-weight:600;max-width:160px">${p.name}</td>
      <td><span class="badge badge-amber" style="font-size:0.65rem">${p.category}</span></td>
      <td style="font-weight:700">₹${p.price}</td>
      <td>
        <span style="font-weight:600;color:${p.stock < 10 ? 'var(--red)' : 'var(--green)'}">${p.stock}</span>
        <div class="stock-bar">
          <div class="stock-fill" style="width:${Math.min(p.stock, 100)}%;background:${p.stock < 10 ? 'var(--red)' : 'var(--green)'}"></div>
        </div>
      </td>
      <td>${p.badge ? `<span class="badge ${p.badge === 'Hot' ? 'badge-red' : p.badge === 'New' ? 'badge-green' : 'badge-amber'}">${p.badge}</span>` : '—'}</td>
      <td><span style="color:${p.isActive ? 'var(--green)' : 'var(--red)'};font-weight:600">${p.isActive ? '✓ Active' : '✗ Hidden'}</span></td>
      <td class="action-btns">
        <button class="act-btn act-edit"   onclick="openProductModal('${p._id}')">Edit</button>
        <button class="act-btn act-delete" onclick="deleteProduct('${p._id}','${p.name}')">Remove</button>
      </td>
    </tr>`).join('');
}

function filterProducts() {
  const s   = document.getElementById('prod-search').value.toLowerCase();
  const cat = document.getElementById('prod-cat-filter').value;
  const filtered = allProducts.filter(p =>
    (!s   || p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s)) &&
    (!cat || p.category === cat)
  );
  renderProductsTable(filtered);
}

function previewProdImg() {
  const url  = document.getElementById('prod-image').value;
  const prev = document.getElementById('prod-img-preview');
  if (url) { prev.src = url; prev.style.display = 'block'; }
  else prev.style.display = 'none';
}

function openProductModal(id = null) {
  document.getElementById('prod-modal-title').textContent = id ? 'Edit Product' : 'Add Product';
  document.getElementById('save-prod-btn').textContent    = id ? 'Save Changes' : 'Add Product';
  if (id) {
    const p = allProducts.find(x => x._id === id);
    if (!p) return;
    document.getElementById('prod-id').value       = p._id;
    document.getElementById('prod-name').value     = p.name;
    document.getElementById('prod-desc').value     = p.description;
    document.getElementById('prod-price').value    = p.price;
    document.getElementById('prod-category').value = p.category;
    document.getElementById('prod-badge').value    = p.badge || '';
    document.getElementById('prod-weight').value   = p.weight;
    document.getElementById('prod-stock').value    = p.stock;
    document.getElementById('prod-rating').value   = p.rating;
    document.getElementById('prod-image').value    = p.image;
    document.getElementById('prod-active').value   = String(p.isActive);
    previewProdImg();
  } else {
    document.getElementById('prod-id').value = '';
    ['prod-name','prod-desc','prod-price','prod-weight','prod-stock','prod-image']
      .forEach(id => document.getElementById(id).value = '');
    document.getElementById('prod-rating').value              = '4.5';
    document.getElementById('prod-stock').value               = '100';
    document.getElementById('prod-img-preview').style.display = 'none';
  }
  document.getElementById('product-modal').classList.add('open');
}

function closeProductModal() { document.getElementById('product-modal').classList.remove('open'); }

async function saveProduct() {
  const id   = document.getElementById('prod-id').value;
  const body = {
    name:        document.getElementById('prod-name').value.trim(),
    description: document.getElementById('prod-desc').value.trim(),
    price:       parseFloat(document.getElementById('prod-price').value),
    category:    document.getElementById('prod-category').value,
    badge:       document.getElementById('prod-badge').value,
    weight:      document.getElementById('prod-weight').value.trim(),
    stock:       parseInt(document.getElementById('prod-stock').value),
    rating:      parseFloat(document.getElementById('prod-rating').value),
    image:       document.getElementById('prod-image').value.trim(),
    isActive:    document.getElementById('prod-active').value === 'true'
  };
  if (!body.name || !body.image || !body.price) return showToast('Please fill all required fields', 'error');
  try {
    const btn = document.getElementById('save-prod-btn');
    btn.disabled = true; btn.textContent = 'Saving...';
    if (id) await apiCall('/products/' + id, 'PUT', body);
    else    await apiCall('/products', 'POST', body);
    closeProductModal();
    await loadProducts();
    showToast(id ? '✓ Product updated!' : '✓ Product added!');
    btn.disabled = false;
  } catch (err) {
    showToast(err.message, 'error');
    const btn = document.getElementById('save-prod-btn');
    btn.disabled    = false;
    btn.textContent = id ? 'Save Changes' : 'Add Product';
  }
}

async function deleteProduct(id, name) {
  if (!confirm(`Remove "${name}" from the store?`)) return;
  try {
    await apiCall('/products/' + id, 'DELETE');
    await loadProducts();
    showToast(`✓ "${name}" removed`);
  } catch (err) { showToast(err.message, 'error'); }
}

// ── ORDERS ───────────────────────────────
async function loadOrders() {
  try {
    const status = document.getElementById('order-status-filter').value;
    const url    = '/orders' + (status ? '?status=' + status : '');
    const d      = await apiCall(url);
    allOrders    = d.orders;
    document.getElementById('order-count').textContent = d.total + ' orders';
    renderOrdersTable(allOrders);
  } catch (err) { showToast(err.message, 'error'); }
}

function renderOrdersTable(orders) {
  const tbody = document.getElementById('orders-body');
  if (!orders.length) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:3rem;color:#aaa">No orders found</td></tr>';
    return;
  }
  tbody.innerHTML = orders.map(o => `
    <tr>
      <td style="font-weight:700;font-size:0.82rem">${o.orderId}</td>
      <td>${new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
      <td style="font-weight:500">${o.customerName}</td>
      <td>${o.phone}</td>
      <td>${o.items.length} item${o.items.length > 1 ? 's' : ''}</td>
      <td style="font-weight:700">₹${o.total}</td>
      <td>${o.paymentMethod}</td>
      <td>
        <select class="status-select" onchange="updateOrderStatus('${o._id}',this.value)">
          ${['Placed','Confirmed','Processing','Shipped','Delivered','Cancelled']
            .map(s => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </td>
      <td class="action-btns">
        <button class="act-btn act-view" onclick="viewOrder('${o._id}')">View</button>
      </td>
    </tr>`).join('');
}

function filterOrdersTable() {
  const s = document.getElementById('order-search').value.toLowerCase();
  renderOrdersTable(allOrders.filter(o =>
    o.orderId.toLowerCase().includes(s) ||
    o.customerName.toLowerCase().includes(s) ||
    o.phone.includes(s)
  ));
}

async function updateOrderStatus(id, status) {
  try {
    await apiCall('/orders/' + id + '/status', 'PUT', { status });
    showToast(`✓ Order status updated to ${status}`);
  } catch (err) { showToast(err.message, 'error'); }
}

function viewOrder(id) {
  const o = allOrders.find(x => x._id === id);
  if (!o) return;
  document.getElementById('order-detail-body').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.2rem">
      <div style="background:#faf6f0;border-radius:10px;padding:1rem">
        <div style="font-size:0.72rem;color:#999;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px">Order ID</div>
        <div style="font-weight:700;color:var(--brown)">${o.orderId}</div>
      </div>
      <div style="background:#faf6f0;border-radius:10px;padding:1rem">
        <div style="font-size:0.72rem;color:#999;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px">Date</div>
        <div style="font-weight:600">${new Date(o.createdAt).toLocaleString('en-IN')}</div>
      </div>
      <div style="background:#faf6f0;border-radius:10px;padding:1rem">
        <div style="font-size:0.72rem;color:#999;text-transform:uppercase;margin-bottom:4px">Customer</div>
        <div style="font-weight:600">${o.customerName}<br>
          <span style="font-size:0.78rem;color:#888">${o.email}</span><br>
          <span style="font-size:0.78rem;color:#888">${o.phone}</span>
        </div>
      </div>
      <div style="background:#faf6f0;border-radius:10px;padding:1rem">
        <div style="font-size:0.72rem;color:#999;text-transform:uppercase;margin-bottom:4px">Delivery Address</div>
        <div style="font-size:0.85rem">${o.address}</div>
      </div>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:0.84rem;margin-bottom:1rem">
      <thead style="background:#faf6f0">
        <tr>
          <th style="padding:0.7rem;text-align:left">Product</th>
          <th style="padding:0.7rem;text-align:center">Qty</th>
          <th style="padding:0.7rem;text-align:right">Price</th>
          <th style="padding:0.7rem;text-align:right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${o.items.map(i => `
          <tr>
            <td style="padding:0.7rem">${i.name}</td>
            <td style="padding:0.7rem;text-align:center">${i.quantity}</td>
            <td style="padding:0.7rem;text-align:right">₹${i.price}</td>
            <td style="padding:0.7rem;text-align:right;font-weight:600">₹${i.price * i.quantity}</td>
          </tr>`).join('')}
      </tbody>
    </table>
    <div style="display:flex;justify-content:flex-end;gap:2rem;font-size:0.88rem;padding:0.8rem;background:#faf6f0;border-radius:10px">
      <span>Subtotal: ₹${o.subtotal}</span>
      <span>Shipping: ${o.shipping === 0 ? 'FREE' : '₹' + o.shipping}</span>
      <span style="font-weight:700;font-size:1rem">Total: ₹${o.total}</span>
    </div>
    <div style="margin-top:1rem;display:flex;gap:1rem;flex-wrap:wrap">
      <span>Payment: <strong>${o.paymentMethod}</strong></span>
      <span>Email Sent: <strong style="color:${o.emailSent ? 'var(--green)' : 'var(--red)'}">${o.emailSent ? 'Yes' : 'No'}</strong></span>
      <span>SMS Sent: <strong style="color:${o.smsSent ? 'var(--green)' : 'var(--red)'}">${o.smsSent ? 'Yes' : 'No'}</strong></span>
    </div>`;
  document.getElementById('order-modal').classList.add('open');
}

// ── SUBSCRIPTIONS ────────────────────────
async function loadSubscriptions() {
  try {
    const d     = await apiCall('/subscriptions');
    const tbody = document.getElementById('subs-body');
    if (!d.subscriptions.length) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:3rem;color:#aaa">No subscriptions yet</td></tr>';
      return;
    }
    tbody.innerHTML = d.subscriptions.map(s => `
      <tr>
        <td style="font-weight:600">${s.customerName}</td>
        <td>${s.email}</td>
        <td>${s.phone}</td>
        <td><span class="badge badge-amber">${s.plan}</span></td>
        <td style="font-weight:700">₹${s.price}/mo</td>
        <td style="text-align:center">${s.deliveryDay}${['st','nd','rd'][s.deliveryDay - 1] || 'th'}</td>
        <td><span class="sub-${s.status.toLowerCase()}">${s.status}</span></td>
        <td>${new Date(s.createdAt).toLocaleDateString('en-IN')}</td>
        <td class="action-btns">
          ${s.status === 'Active'    ? `<button class="act-btn act-edit"   onclick="updateSub('${s._id}','Paused')">Pause</button>`  : ''}
          ${s.status === 'Paused'   ? `<button class="act-btn act-green"  onclick="updateSub('${s._id}','Active')">Resume</button>` : ''}
          ${s.status !== 'Cancelled'? `<button class="act-btn act-delete" onclick="updateSub('${s._id}','Cancelled')">Cancel</button>` : '—'}
        </td>
      </tr>`).join('');
  } catch (err) { showToast(err.message, 'error'); }
}

async function updateSub(id, status) {
  if (!confirm(`${status} this subscription?`)) return;
  try {
    await apiCall('/subscriptions/' + id, 'PUT', { status });
    loadSubscriptions();
    showToast(`✓ Subscription ${status.toLowerCase()}`);
  } catch (err) { showToast(err.message, 'error'); }
}

// ── USERS ─────────────────────────────────
async function loadUsers() {
  try {
    const d     = await apiCall('/admin/users');
    const tbody = document.getElementById('users-body');
    if (!d.users.length) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:3rem;color:#aaa">No customers yet</td></tr>';
      return;
    }
    tbody.innerHTML = d.users.map(u => `
      <tr>
        <td style="font-weight:600">${u.name}</td>
        <td>${u.email}</td>
        <td>${u.phone || '—'}</td>
        <td>${new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
        <td><span style="color:${u.isActive ? 'var(--green)' : 'var(--red)'};font-weight:600">${u.isActive ? '✓ Active' : '✗ Disabled'}</span></td>
        <td><button class="act-btn ${u.isActive ? 'act-delete' : 'act-green'}" onclick="toggleUser('${u._id}')">${u.isActive ? 'Disable' : 'Enable'}</button></td>
      </tr>`).join('');
  } catch (err) { showToast(err.message, 'error'); }
}

async function toggleUser(id) {
  try {
    await apiCall('/admin/users/' + id + '/toggle', 'PUT');
    loadUsers();
    showToast('✓ User status updated');
  } catch (err) { showToast(err.message, 'error'); }
}

// ── CONTACTS ─────────────────────────────
async function loadContacts() {
  try {
    const d     = await apiCall('/contacts');
    const tbody = document.getElementById('contacts-body');
    if (!d.contacts.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:3rem;color:#aaa">No messages yet</td></tr>';
      return;
    }
    tbody.innerHTML = d.contacts.map(c => `
      <tr style="${c.status === 'New' ? 'font-weight:600;background:#fffbf5' : ''}">
        <td>${c.name}</td>
        <td>${c.email}</td>
        <td>${c.topic || '—'}</td>
        <td style="max-width:200px;font-size:0.8rem;color:#555">${c.message.slice(0, 80)}${c.message.length > 80 ? '...' : ''}</td>
        <td><span class="badge ${c.status === 'New' ? 'badge-red' : c.status === 'Read' ? 'badge-gray' : 'badge-green'}">${c.status}</span></td>
        <td>${new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
        <td class="action-btns">
          ${c.status === 'New'  ? `<button class="act-btn act-view"  onclick="markContact('${c._id}','Read')">Mark Read</button>`     : ''}
          ${c.status === 'Read' ? `<button class="act-btn act-green" onclick="markContact('${c._id}','Replied')">Mark Replied</button>` : ''}
        </td>
      </tr>`).join('');
  } catch (err) { showToast(err.message, 'error'); }
}

async function markContact(id, status) {
  try {
    await apiCall('/contacts/' + id, 'PUT', { status });
    loadContacts();
    showToast(`✓ Marked as ${status}`);
  } catch (err) { showToast(err.message, 'error'); }
}

// ── INIT ──────────────────────────────────
loadDashboard();