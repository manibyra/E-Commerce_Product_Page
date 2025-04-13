let products = JSON.parse(localStorage.getItem("products")) || [];

function renderAdminProducts() {
  const grid = document.getElementById("adminProductGrid");
  grid.innerHTML = "";

  products.forEach((product, index) => {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <div id="editSection${index}">
        <h3>${product.name}</h3>
        <p>Price: $${product.price}</p>
        <p>Category: ${product.category}</p>
        <p>Stock: ${product.stock}</p>
        <button onclick="startEdit(${index})">✏️ Edit</button>
        <button onclick="deleteProduct(${index})">🗑️ Delete</button>
      </div>
    `;

    grid.appendChild(card);
  });
}

function startEdit(index) {
  const product = products[index];
  const section = document.getElementById(`editSection${index}`);
  section.innerHTML = `
    <input type="text" id="editName${index}" value="${product.name}" />
    <input type="number" id="editPrice${index}" value="${product.price}" />
    <input type="text" id="editCategory${index}" value="${product.category}" />
    <input type="number" id="editStock${index}" value="${product.stock}" />
    <button onclick="saveEdit(${index})">💾 Save</button>
    <button onclick="renderAdminProducts()">❌ Cancel</button>
  `;
}

function saveEdit(index) {
  const name = document.getElementById(`editName${index}`).value.trim();
  const price = parseFloat(document.getElementById(`editPrice${index}`).value);
  const category = document.getElementById(`editCategory${index}`).value.trim();
  const stock = parseInt(document.getElementById(`editStock${index}`).value);

  if (!name || isNaN(price) || !category || isNaN(stock)) {
    alert("Please fill out all fields correctly.");
    return;
  }

  products[index].name = name;
  products[index].price = price;
  products[index].category = category;
  products[index].stock = stock;

  localStorage.setItem("products", JSON.stringify(products));
  renderAdminProducts();
}

function deleteProduct(index) {
  if (confirm("Are you sure you want to delete this product?")) {
    products.splice(index, 1);
    localStorage.setItem("products", JSON.stringify(products));
    renderAdminProducts();
  }
}

function increaseStock(index) {
  const input = document.getElementById(`stockInput${index}`);
  const addedQty = parseInt(input.value);
  if (!addedQty || addedQty < 1) {
    alert("Please enter a valid stock quantity.");
    return;
  }
  products[index].stock += addedQty;
  localStorage.setItem("products", JSON.stringify(products));
  renderAdminProducts();
}

document.getElementById("addProductForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("productName").value.trim();
  const price = parseFloat(document.getElementById("productPrice").value);
  const category = document.getElementById("productCategory").value.trim();
  const stock = parseInt(document.getElementById("productStock").value);
  const imageInput = document.getElementById("productImage");

  const reader = new FileReader();
  reader.onload = function () {
    const newProduct = {
      id: Date.now().toString(), // ✅ Unique ID for each product
      name,
      price,
      category,
      stock,
      image: reader.result,
    };

    products.push(newProduct);
    localStorage.setItem("products", JSON.stringify(products));
    renderAdminProducts();
    document.getElementById("addProductForm").reset();
  };

  if (imageInput.files[0]) {
    reader.readAsDataURL(imageInput.files[0]);
  } else {
    alert("Please select an image.");
  }
});

window.onload = renderAdminProducts;
