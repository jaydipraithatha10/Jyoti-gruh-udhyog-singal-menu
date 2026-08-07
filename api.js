const menu = [
{
    category: "HAND MADE KHAKHRA",
    products: [

        {
            name: "Naylon Sada Khakhra",
            weight: "500 gm",
            price: 160,
            qty: 0
        },

        {
            name: "Naylon Jeera Khakhra",
            weight: "500 gm",
            price: 160,
            qty: 0
        },

        {
            name: "Naylon Methi Khakhra",
            weight: "500 gm",
            price: 160,
            qty: 0
        },

        {
            name: "Naylon Masala Khakhra",
            weight: "500 gm",
            price: 160,
            qty: 0
        },

        {
            name: "Kothmir Marcha Khakhra",
            weight: "500 gm",
            price: 180,
            qty: 0
        },

        {
            name: "Lasen Mirchi Khakhra",
            weight: "500 gm",
            price: 180,
            qty: 0
        },

        {
            name: "Mangroli Khakhra",
            weight: "500 gm",
            price: 180,
            qty: 0
        },

        {
            name: "Bajri Methi Khakhra",
            weight: "500 gm",
            price: 180,
            qty: 0
        },

        {
            name: "Ragi Khakhra",
            weight: "500 gm",
            price: 180,
            qty: 0
        },

        {
            name: "Juwar Khakhra",
            weight: "500 gm",
            price: 180,
            qty: 0
        }

    ]
}
];

const menuContainer = document.getElementById("menuContainer");
const searchInput = document.getElementById("searchInput");
const cartBar = document.getElementById("cartBar");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");

function renderMenu(search = "") {

    menuContainer.innerHTML = "";

    let totalProducts = 0;

    menu.forEach(category => {

        const products = category.products.filter(product =>
            product.name.toLowerCase().includes(search.toLowerCase())
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

            ${products.map((product,index)=>`

                <div class="product-row">

                    <div class="product-name">
                        ${product.name}
                    </div>

                    <div class="product-info">
                        ${product.weight} • ₹${product.price}
                    </div>

                    <div class="qty-box">

                        <button
                            class="qty-btn"
                            onclick="changeQty('${category.category}',${index},-1)">
                            −
                        </button>

                        <span class="qty">
                            ${product.qty}
                        </span>

                        <button
                            class="qty-btn"
                            onclick="changeQty('${category.category}',${index},1)">
                            +
                        </button>

                    </div>

                </div>

            `).join("")}

        `;

        menuContainer.appendChild(section);

    });

    document.getElementById("productCount").innerText = totalProducts;

}

searchInput.addEventListener("input",function(){

    renderMenu(this.value);

});

renderMenu();