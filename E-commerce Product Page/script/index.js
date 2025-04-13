// ==================== Data Setup ====================

function getProducts() {
  return JSON.parse(localStorage.getItem('products')) || [];
}

let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

const productGrid = document.getElementById('productGrid');
const cartItems = document.getElementById('cartItems');
const wishlistItems = document.getElementById('wishlistItems');
const cartTotal = document.getElementById('cartTotal');

// ==================== Product Renderer ====================
function renderProducts(filter = '') {
  const products = getProducts();
  productGrid.innerHTML = '';
  let filteredProducts = products;

  if (filter && filter !== 'all') {
    filteredProducts = products.filter(p => p.category === filter);
  }

  const searchInput = document.getElementById('searchInput');
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
  if (searchTerm) {
    filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(searchTerm));
  }

  // ✅ Now apply sorting here
  const sortBy = document.getElementById('sortSelect')?.value;
  if (sortBy === 'price-low') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'name-az') {
    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
  }

  console.log("Sort applied:", sortBy);

  // Now render the products
  filteredProducts.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-id', product.id);
    card.setAttribute('data-name', product.name);
    card.setAttribute('data-price', product.price);
    const outOfStock = product.stock <= 0;

    let stockLabel = "";
    if (product.stock === 0) {
      stockLabel = `<p class="stock-badge out">Out of Stock</p>`;
    } else if (product.stock === 1) {
      stockLabel = `<p class="stock-badge danger">🔥 Only 1 left!</p>`;
    } else if (product.stock <= 3) {
      stockLabel = `<p class="stock-badge warn">⚠️ Few left</p>`;
    } else {
      stockLabel = `<p class="stock-badge ok">✅ In Stock</p>`;
    }

    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p>$${product.price}</p>
      ${stockLabel}
      ${product.stock <= 0
        ? `<p class="out-of-stock">⚠️ Out of Stock</p>`
        : `<button onclick="addToCart(this)">🛒 Add to Cart</button>
           <button onclick="addToWishlist('${product.id}')">❤️</button>`}
    `;
    productGrid.appendChild(card);
  });
}


// ==================== Cart Functions ====================
 
function addToCart(button) {
  const card = button.closest('.product-card');
  const product = {
    id: card.dataset.id,
    name: card.dataset.name,
    price: parseFloat(card.dataset.price)
  };
  if (product.stock <= 0) {
    showToast("❌ This item is out of stock");
    return;
  }
  

  const existing = cart.find(p => p.id === product.id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  saveCart();
  renderCart();
  showToast("✅ Item added to cart");
  updateCounts();

}

function addToCartById(id) {
  const product = getProducts().find(p => p.id === id);
  if (!product) return;

  const existing = cart.find(p => p.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  saveCart();
  renderCart();
  showToast("✅ Item added to cart");
}

function renderCart() {
  cartItems.innerHTML = '';
  let total = 0;

  cart.forEach(item => {
    total += item.price * item.qty;
    const div = document.createElement('div');
    div.innerHTML = `
  <div class="cart-item">
    <img src="${getProducts().find(p => p.id === item.id)?.image || ''}" alt="${item.name}" class="cart-item-image" />
    <div class="cart-item-details">
      <strong>${item.name}</strong><br/>
      $${item.price} x ${item.qty}
      <br/>
      <button onclick="changeQty('${item.id}', 1)">+</button>
      <button onclick="changeQty('${item.id}', -1)">−</button>
      <button onclick="removeFromCart('${item.id}')">🗑️</button>
    </div>
  </div>
`;

    cartItems.appendChild(div);
  });

  cartTotal.textContent = total.toFixed(2);
  updateCounts();
}
function updateCounts() {
  document.getElementById("cartCount").textContent = cart.reduce((sum, item) => sum + item.qty, 0);
}

function changeQty(id, delta) {
  const item = cart.find(p => p.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(p => p.id !== id);
  }
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(p => p.id !== id);
  saveCart();
  renderCart();
  showToast("❌ Item removed to cart");
  updateCounts();
}

function checkout() {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  const products = getProducts();

  // Update product stock
  cart.forEach(cartItem => {
    const product = products.find(p => p.id === cartItem.id);
    if (product) {
      product.stock = Math.max(0, product.stock - cartItem.qty);
    }
  });

  // Save updated products to localStorage
  localStorage.setItem("products", JSON.stringify(products));

  alert("✅ Thank you for your purchase!");
  cart = [];
  saveCart();
  renderCart();
  renderProducts();
  renderWishlist();
  updateCategoryFilter();
}


// ==================== Wishlist ====================
function addToWishlist(id) {
  const products = getProducts();
  const exists = products.find(p => p.id === id);
  if (!wishlist.includes(id) && exists) {
    wishlist.push(id);
    saveWishlist();
    renderWishlist();
    showToast("💖 Added to Wishlist");
  } else if (wishlist.includes(id)) {
    showToast("❤️ Already in Wishlist");
  }

}

function renderWishlist() {
  const products = getProducts();
  wishlistItems.innerHTML = '';
  wishlist.forEach(id => {
    const item = products.find(p => p.id === id);
    if (!item) return;

    const div = document.createElement('div');
    div.innerHTML = `
      <p>${item.name} - $${item.price}
        <button onclick="addToCartById('${item.id}')">Add to Cart</button>
        <button onclick="removeFromWishlist('${item.id}')">🗑️</button>
      </p>
    `;
    wishlistItems.appendChild(div);
  });
}


function addToCartFromWishlist(id) {
  addToCartById(id);
  removeFromWishlist(id);
}

function removeFromWishlist(id) {
  wishlist = wishlist.filter(pid => pid !== id);
  saveWishlist();
  renderWishlist();
  showToast("❌ Removed from Wishlist");

}

// ==================== Filter & Search ====================
document.getElementById('sortSelect').addEventListener('change', () =>
  renderProducts(document.getElementById('categoryFilter').value)
);
+
document.getElementById('searchInput').addEventListener('input', () =>
  renderProducts(document.getElementById('categoryFilter').value)
);
document.getElementById('categoryFilter').addEventListener('change', e =>
  renderProducts(e.target.value)
);

// ==================== Theme Toggle ====================
document.getElementById('themeToggle').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

// ==================== Modal Controls ====================
function toggleCart() {
  document.getElementById('cartModal').classList.toggle('hidden');
}
function toggleWishlist() {
  document.getElementById('wishlistModal').classList.toggle('hidden');
}

document.getElementById('cartBtn').onclick = toggleCart;
document.getElementById('wishlistBtn').onclick = toggleWishlist;

// ==================== Helpers ====================
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function saveWishlist() {
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

function updateCategoryFilter() {
  const products = getProducts();
  const categories = ['all', ...new Set(products.map(p => p.category))];
  const select = document.getElementById('categoryFilter');
  select.innerHTML = '';
  categories.forEach(c => {
    const option = document.createElement('option');
    option.value = c;
    option.textContent = c.charAt(0).toUpperCase() + c.slice(1);
    select.appendChild(option);
  });
}

// ==================== Init ====================
window.onload = () => {
  renderProducts();
  renderCart();
  renderWishlist();
  updateCategoryFilter();
  updateCounts();
};

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("hidden");
  }, 2000);
}
