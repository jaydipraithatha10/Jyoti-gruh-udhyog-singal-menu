
const menu = [
{
    category: "HAND MADE KHAKHRA",
    products: [

        {
            name: "Naylon Sada Khakhra",
            weight: "500 gm",
            price: "₹160"
        },

        {
            name: "Naylon Jeera Khakhra",
            weight: "500 gm",
            price: "₹160"
        },

        {
            name: "Naylon Methi Khakhra",
            weight: "500 gm",
            price: "₹160"
        },

        {
            name: "Naylon Masala Khakhra",
            weight: "500 gm",
            price: "₹160"
        },

        {
            name: "Kothmir Marcha Khakhra",
            weight: "500 gm",
            price: "₹180"
        },

        {
            name: "Lasen Mirchi Khakhra",
            weight: "500 gm",
            price: "₹180"
        },

        {
            name: "Mangroli Khakhra",
            weight: "500 gm",
            price: "₹180"
        },

        {
            name: "Bajri Methi Khakhra",
            weight: "500 gm",
            price: "₹180"
        },

        {
            name: "Ragi Khakhra",
            weight: "500 gm",
            price: "₹180"
        },

        {
            name: "Juwar Khakhra",
            weight: "500 gm",
            price: "₹180"
        }

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
            <h2 class="category-title">
    ${category.category}
    <span class="category-count">(${products.length})</span>
</h2>
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