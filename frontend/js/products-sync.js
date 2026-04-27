/**
 * NutsNTreat – products-sync.js
 * Fetches live product IDs from the API and fires an event if any
 * deleted products were found. No localStorage involved — NNT handles
 * the actual cart/wishlist data on the server.
 */
const title = [
    "NutsNTreat:Snack Strong, Live Long!",
    "NutsNTreat:Go Nuts. Stay Fit.",
    "NutsNTreat:Smart Snacks for Smart Kids",
    "NutsNTreat:Healthy Starts with a Handful."
];

(function () {
  'use strict';

  const API_BASE = 'http://localhost:5000/api';

  /* ── Core purge: remove deleted products from NNT server state ── */
  async function purgeDeleted(validIds) {
    // NNT must be initialised before this runs
    if (typeof NNT === 'undefined') return;

    const cart     = NNT.getCart();
    const wishlist = NNT.getWishlist();

    const newCart     = cart.filter(i => validIds.has(String(i.id)));
    const newWishlist = wishlist.filter(i => validIds.has(String(i.id)));

    const cartChanged     = newCart.length !== cart.length;
    const wishlistChanged = newWishlist.length !== wishlist.length;

    if (cartChanged) {
      await NNT.setCart(newCart);
      console.info('[ProductSync] Removed', cart.length - newCart.length, 'deleted product(s) from cart.');
    }
    if (wishlistChanged) {
      await NNT.setWishlist(newWishlist);
      console.info('[ProductSync] Removed', wishlist.length - newWishlist.length, 'deleted product(s) from wishlist.');
    }

    if (cartChanged || wishlistChanged) {
      window.dispatchEvent(new CustomEvent('nnt:products-synced', {
        detail: { cartChanged, wishlistChanged, validIds: [...validIds] }
      }));
    }
  }

  /* ── Fetch valid product IDs and purge stale entries ── */
  async function syncProducts() {
    try {
      const res  = await fetch(API_BASE + '/products');
      if (!res.ok) return;
      const data = await res.json();
      const products = Array.isArray(data) ? data : (data.products || []);
      const validIds = new Set(products.map(p => String(p._id)));
      await purgeDeleted(validIds);
    } catch (e) {
      // Server offline – don't block the page
    }
  }

  /* ── Run after NNT is ready (so getCart/getWishlist are populated) ── */
  document.addEventListener('nnt:ready', syncProducts);

  // Expose for manual calls (e.g. after admin actions)
  window.NNTSync = { syncProducts, purgeDeleted };
})();