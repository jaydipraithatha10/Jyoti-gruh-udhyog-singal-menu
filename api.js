
const menu = [
  {
    category: "KHAKHRA",
    products: [
      "Naylon Sada Khakhra",
      "Naylon Jeera Khakhra",
      "Naylon Methi Khakhra",
      "Naylon Masala Khakhra"
    ]
  }
];

const menuContainer = document.getElementById("menuContainer");
const searchInput = document.getElementById("searchInput");

function renderMenu(search = "") {

    menuContainer.innerHTML = "";

    let totalProducts = 0;

    menu.forEach(category => {

        const products = category.products.filter(product =>
            product.toLowerCase().includes(search.toLowerCase())
        );

        if(products.length === 0) return;

        totalProducts += products.length;

        const section = document.createElement("section");
        section.className = "category";

        section.innerHTML = `
            <h2 class="category-title">${category.category}</h2>
            <ul class="product-list">
                ${products.map(product => `<li>${product}</li>`).join("")}
            </ul>
        `;

        menuContainer.appendChild(section);

    });

    document.getElementById("productCount").innerText = totalProducts;

}

searchInput.addEventListener("input", function () {
    renderMenu(this.value);
});

renderMenu();