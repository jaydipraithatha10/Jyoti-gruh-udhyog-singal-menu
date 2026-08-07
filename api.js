const SHEET_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vStfoYZJzDES0lAav3gzVi4hHMrr-g-vu6oHbAecwVN7-j5ZfyZCE4wy5qE8oaH0fSw14Y97pHMmUrU/pub?gid=1327834650&single=true&output=csv";

let menu = [];

const menuContainer = document.getElementById("menuContainer");
const searchInput = document.getElementById("searchInput");
const cartBar = document.getElementById("cartBar");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");

async function loadProducts(){

    const savedData = localStorage.getItem("jyotiProducts");

if(savedData){

    menu = JSON.parse(savedData);

    renderMenu();

}

    const response = await fetch(SHEET_URL);

    const csv = await response.text();

    const rows = csv.trim().split("\n");

    rows.shift();

    const categoryMap = {};

    rows.forEach(row=>{

        const cols = row.split(",");

        const category = cols[1].trim();
        const name = cols[2].trim();
        const weight = cols[3].trim();
        const price = Number(cols[4]);
        const status = cols[5].trim();

        if(status !== "Active") return;

        if(!categoryMap[category]){
            categoryMap[category]=[];
        }

        categoryMap[category].push({
            name,
            weight,
            price,
            qty:0
        });

    });

    menu = Object.keys(categoryMap).map(cat=>({

        category:cat,

        products:categoryMap[cat]

    }));

document.getElementById("loader").style.display = "none";

localStorage.setItem(
    "jyotiProducts",
    JSON.stringify(menu)
);

    renderMenu();

}

loadProducts();


function renderMenu(search = "") {

    menuContainer.innerHTML = "";

    let totalProducts = 0;

    menu.forEach(category => {

        const keyword = search.toLowerCase();

const products = category.products.filter(product =>

    product.name.toLowerCase().includes(keyword) ||

    category.category.toLowerCase().includes(keyword) ||

    product.weight.toLowerCase().includes(keyword) ||

    product.price.toString().includes(keyword)

);

        if (products.length === 0) return;

        totalProducts += products.length;

        const section = document.createElement("section");
        section.className = "category";

        let html = `
            
     let html = `
    <h2 class="category-title"
        onclick="toggleCategory('${category.category}')">

        <span>
            <span id="icon-${category.category}">▼</span>
            ${category.category}
        </span>

        <span class="category-count">
            (${products.length})
        </span>

    </h2>

    <div id="cat-${category.category}">
`;

        products.forEach(product => {

            html += `
                <div class="product-row">

                    <div class="product-name">
                        ${product.name}
                    </div>

                    <div class="product-info">
                        ${product.weight} • ₹${product.price}
                    </div>

                    <div class="qty-box">

                        <button class="qty-btn"
                        onclick="changeQty('${category.category}','${product.name}',-1)">
                        −
                        </button>

                        <span class="qty">
                            ${product.qty}
                        </span>

                        <button class="qty-btn"
                        onclick="changeQty('${category.category}','${product.name}',1)">
                        +
                        </button>

                    </div>

                </div>
            `;

        });
         

        
html += "</div>";
        section.innerHTML = html;

        menuContainer.appendChild(section);

    });

    


    document.getElementById("productCount").innerText = totalProducts;

    if(totalProducts === 0){

        menuContainer.innerHTML = `
            <div class="no-products">
                🔍<br><br>
                No Products Found
            </div>
        `;

    }

}

searchInput.addEventListener("input", function () {

    renderMenu(this.value);

});

function changeQty(categoryName, productName, change){

    const category = menu.find(c => c.category === categoryName);

    if(!category) return;

    const product = category.products.find(p => p.name === productName);

    if(!product) return;

    product.qty += change;

    if(product.qty < 0){
        product.qty = 0;
    }

    updateCart();

    renderMenu(searchInput.value);

}

function updateCart(){

    let items = 0;
    let total = 0;

    menu.forEach(category=>{

        category.products.forEach(product=>{

            items += product.qty;
            total += product.qty * product.price;

        });

    });

    cartItems.innerText = items;
    cartTotal.innerText = "₹" + total;

    cartBar.style.display = items > 0 ? "flex" : "none";

}

document.getElementById("orderBtn").addEventListener("click",function(){

    let total = 0;

    let message = "*Jyoti Gruh Udhyog*%0A%0A";
    message += "*Order Details*%0A%0A";

    menu.forEach(category=>{

        category.products.forEach(product=>{

            if(product.qty>0){

                const amount = product.qty * product.price;

                message +=
                "• " + product.name +
                "%0A" +
                product.weight + " × " + product.qty +
                " = ₹" + amount +
                "%0A%0A";

                total += amount;

            }

        });

    });

    message += "*Total : ₹" + total + "*";

    window.open(
        "https://wa.me/919712149344?text=" + message,
        "_blank"
    );

});

updateCart();

function toggleCategory(category){

    const box = document.getElementById("cat-" + category);

    const icon = document.getElementById("icon-" + category);

    if(box.style.display === "none"){

        box.style.display = "block";

        icon.innerHTML = "▼";

    }else{

        box.style.display = "none";

        icon.innerHTML = "▶";

    }

}