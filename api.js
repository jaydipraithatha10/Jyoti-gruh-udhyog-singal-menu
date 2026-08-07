/* ===========================
   GOOGLE SHEET
=========================== */

const SHEET_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vStfoYZJzDES0lAav3gzVi4hHMrr-g-vu6oHbAecwVN7-j5ZfyZCE4wy5qE8oaH0fSw14Y97pHMmUrU/pub?gid=1327834650&single=true&output=csv";

/* ===========================
   GLOBALS
=========================== */

let menu = [];

const menuContainer = document.getElementById("menuContainer");
const searchInput = document.getElementById("searchInput");
const loader = document.getElementById("loader");

const cartBar = document.getElementById("cartBar");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");

/* ===========================
   LOAD PRODUCTS
=========================== */

async function loadProducts(){

    // Load Cached Data

    const cache = localStorage.getItem("jyotiProducts");

    if(cache){

        menu = JSON.parse(cache);

        renderMenu();

    }

    try{

        const response = await fetch(SHEET_URL);

        if(!response.ok){

            throw new Error("Sheet not loaded");

        }

        const csv = await response.text();

        buildMenu(csv);

    }

    catch(error){

        console.log(error);

        if(menu.length===0){

            menuContainer.innerHTML=`
                <div class="no-products">
                    ⚠️<br><br>
                    Unable to load products.
                </div>
            `;

        }

    }

}

/* ===========================
   CSV TO MENU
=========================== */

function buildMenu(csv){

    const rows = csv.trim().split("\n");

    rows.shift();

    const categoryMap = {};

    rows.forEach(row=>{

        const cols = row.split(",");

        if(cols.length<6) return;

        const category = cols[1].trim();

        const product = {

            name:cols[2].trim(),

            weight:cols[3].trim(),

            price:Number(cols[4]),

            status:cols[5].trim(),

            qty:0

        };

        if(product.status!=="Active") return;

        if(!categoryMap[category]){

            categoryMap[category]=[];

        }

        categoryMap[category].push(product);

    });

    menu = Object.keys(categoryMap).map(cat=>({

        category:cat,

        products:categoryMap[cat]

    }));

    localStorage.setItem(

        "jyotiProducts",

        JSON.stringify(menu)

    );

    loader.style.display="none";

    renderMenu();

}

loadProducts();

/* ===========================
   RENDER MENU
=========================== */

function renderMenu(search = "") {

    menuContainer.innerHTML = "";

    let totalProducts = 0;

    const keyword = search.trim().toLowerCase();

    menu.forEach(category => {

        const products = category.products.filter(product => {

            return (
                product.name.toLowerCase().includes(keyword) ||
                category.category.toLowerCase().includes(keyword) ||
                product.weight.toLowerCase().includes(keyword) ||
                product.price.toString().includes(keyword)
            );

        });

        if(products.length === 0) return;

        totalProducts += products.length;

        const section = document.createElement("section");

        section.className = "category";

        let html = `
            <h2 class="category-title"
                onclick="toggleCategory('${category.category}')">

                <span>
                    <span id="icon-${category.category}">
                        ▼
                    </span>

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

                        ${product.weight}
                        &nbsp; • &nbsp;
                        ₹${product.price}

                    </div>

                    <div class="qty-box">

                        <button
                            class="qty-btn"

                            onclick="changeQty(
                                '${category.category}',
                                '${product.name}',
                                -1
                            )">

                            −

                        </button>

                        <span class="qty">

                            ${product.qty}

                        </span>

                        <button
                            class="qty-btn"

                            onclick="changeQty(
                                '${category.category}',
                                '${product.name}',
                                1
                            )">

                            +

                        </button>

                    </div>

                </div>

            `;

        });

        html += `</div>`;

        section.innerHTML = html;

        menuContainer.appendChild(section);

    });

    document.getElementById("productCount").innerText =
        totalProducts;

    if(totalProducts === 0){

        menuContainer.innerHTML = `

            <div class="no-products">

                🔍

                <br><br>

                No Products Found

            </div>

        `;

    }

}

/* ===========================
   SEARCH
=========================== */

searchInput.addEventListener("input", function(){

    renderMenu(this.value);

});

/* ===========================
   CHANGE QUANTITY
=========================== */

function changeQty(categoryName, productName, change){

    const category = menu.find(c => c.category === categoryName);

    if(!category) return;

    const product = category.products.find(
        p => p.name === productName
    );

    if(!product) return;

    product.qty += change;

    if(product.qty < 0){

        product.qty = 0;

    }

    localStorage.setItem(
        "jyotiProducts",
        JSON.stringify(menu)
    );

    updateCart();

    renderMenu(searchInput.value);

}

/* ===========================
   UPDATE CART
=========================== */

function updateCart(){

    let items = 0;

    let total = 0;

    menu.forEach(category=>{

        category.products.forEach(product=>{

            if(product.qty > 0){

                items += product.qty;

                total +=
                    product.qty * product.price;

            }

        });

    });

    cartItems.innerText = items;

    cartTotal.innerText = "₹" + total;

    cartBar.style.display =
        items > 0 ? "flex" : "none";

}

/* ===========================
   CATEGORY COLLAPSE
=========================== */

function toggleCategory(category){

    const box =
        document.getElementById(
            "cat-" + category
        );

    const icon =
        document.getElementById(
            "icon-" + category
        );

    if(!box) return;

    if(box.style.display==="none"){

        box.style.display="block";

        icon.innerHTML="▼";

    }else{

        box.style.display="none";

        icon.innerHTML="▶";

    }

}

/* ===========================
   INITIAL CART
=========================== */

updateCart();