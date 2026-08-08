/* ===========================
   JYOTI GRUH UDHYOG
   API.JS V6 - PART 1
=========================== */

/* ===========================
   GOOGLE SHEET URL
=========================== */

const SHEET_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vStfoYZJzDES0lAav3gzVi4hHMrr-g-vu6oHbAecwVN7-j5ZfyZCE4wy5qE8oaH0fSw14Y97pHMmUrU/pub?gid=1327834650&single=true&output=csv";

/* ===========================
   GLOBAL VARIABLES
=========================== */

let menu = [];

const menuContainer =
document.getElementById("menuContainer");

const searchInput =
document.getElementById("searchInput");

const loader =
document.getElementById("loader");

const cartBar =
document.getElementById("cartBar");

const cartItems =
document.getElementById("cartItems");

const cartTotal =
document.getElementById("cartTotal");

const voiceBtn =
document.getElementById("voiceBtn");

const voiceResult =
document.getElementById("voiceResult");

/* ===========================
   LOAD PRODUCTS
=========================== */

async function loadProducts(){

    try{

        loader.style.display = "flex";

        const response =
        await fetch(SHEET_URL);

        if(!response.ok){

            throw new Error(
                "Google Sheet Error"
            );

        }

        const csv =
        await response.text();

        buildMenu(csv);

    }

    catch(error){

        console.log(error);

        menuContainer.innerHTML = `

            <div class="no-products">

                ⚠️

                <br><br>

                Products Loading Failed

            </div>

        `;

    }

}

/* ===========================
   BUILD MENU
=========================== */

function buildMenu(csv){

    const rows =
    csv.trim().split("\n");

    rows.shift();

    const categoryMap = {};

    rows.forEach(row=>{

        const cols = row.split(",");

        if(cols.length < 7){

            return;

        }

        const category =
        cols[1].trim();

        
const product = {

    name: cols[2].trim(),

    weight: cols[3].trim(),

    price: Number(cols[4]),

    status: cols[5].trim(),

    voiceKeywords: cols[6]
    ? cols[6].toLowerCase().split("|").map(k => k.trim())
    : [],

    qty: 0

};
        if(product.status !== "Active"){

            return;

        }

        if(!categoryMap[category]){

            categoryMap[category]=[];

        }

        categoryMap[category].push(product);

    });

    menu = Object.keys(categoryMap).map(cat=>({

        category:cat,

        products:
        categoryMap[cat]

    }));

    loader.style.display = "none";

    renderMenu();

    updateCart();

}

/* ===========================
   START
=========================== */

loadProducts();

/* ===========================
   RENDER MENU
=========================== */

       /* ===========================
   RENDER MENU
   SAME PRODUCT GROUPING
=========================== */

function renderMenu(search = ""){

    menuContainer.innerHTML = "";

    let totalProducts = 0;

    const keyword = search.toLowerCase().trim();

    menu.forEach(category => {

        /* ===========================
           FILTER PRODUCTS
        =========================== */

        const filteredProducts =
        category.products.filter(product => {

            return (
                product.name
                    .toLowerCase()
                    .includes(keyword)

                ||

                category.category
                    .toLowerCase()
                    .includes(keyword)

                ||

                product.weight
                    .toLowerCase()
                    .includes(keyword)

                ||

                product.price
                    .toString()
                    .includes(keyword)
            );

        });

        if(filteredProducts.length === 0){
            return;
        }


        /* ===========================
           GROUP SAME PRODUCT NAME
        =========================== */

        const grouped = {};

        filteredProducts.forEach(product => {

            const key =
                product.name.toLowerCase().trim();

            if(!grouped[key]){

                grouped[key] = [];

            }

            grouped[key].push(product);

        });


        const productGroups =
            Object.values(grouped);


        totalProducts += productGroups.length;


        /* ===========================
           CATEGORY
        =========================== */

        const section =
        document.createElement("section");

        section.className = "category";


        let html = `

        <h2
            class="category-title"
            onclick="toggleCategory('${category.category}')"
        >

            <span>

                <span
                    id="icon-${category.category}"
                >
                    ▶
                </span>

                ${category.category}

            </span>

            <span class="category-count">

                ${productGroups.length}

            </span>

        </h2>


        <div
            id="cat-${category.category}"
            style="display:none;"
        >
        `;


        /* ===========================
           PRODUCT GROUP
        =========================== */

        productGroups.forEach(products => {

            const firstProduct =
                products[0];


            html += `

            <div class="product-row">

                <div class="product-name">

                    ${firstProduct.name}

                </div>

            `;


            /* ===========================
               WEIGHT / PRICE OPTIONS
            =========================== */

            products.forEach(product => {

                html += `

                <div
                    class="product-option"
                    data-product-name="${product.name}"
                    data-weight="${product.weight}"
                >

                    <div class="product-info">

                        ${product.weight}

                        •

                        ₹${product.price}

                    </div>


                    <div class="qty-box">

                        <button
                            type="button"
                            class="qty-btn"
                            onclick="event.stopPropagation(); changeQty(
                                '${category.category}',
                                '${product.name}',
                                '${product.weight}',
                                -1
                            )"
                        >

                            −

                        </button>


                        <span class="qty">

                            ${product.qty}

                        </span>


                        <button
                            type="button"
                            class="qty-btn"
                            onclick="event.stopPropagation(); changeQty(
                                '${category.category}',
                                '${product.name}',
                                '${product.weight}',
                                1
                            )"
                        >

                            +

                        </button>

                    </div>

                </div>

                `;

            });


            html += `

            </div>

            `;

        });


        html += `

        </div>

        `;


        section.innerHTML = html;

        menuContainer.appendChild(section);

    });


    /* ===========================
       PRODUCT COUNT
    =========================== */

    const countElement =
        document.getElementById("productCount");

    if(countElement){

        countElement.innerText =
            totalProducts;

    }


    /* ===========================
       NO PRODUCTS
    =========================== */

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

searchInput.addEventListener(

"input",

function(){

    renderMenu(this.value);

});

/* ===========================
   CHANGE QUANTITY
=========================== */

/* ===========================
   CHANGE QUANTITY
=========================== */

function changeQty(
    categoryName,
    productName,
    weight,
    change
){

    const category =
        menu.find(
            c => c.category === categoryName
        );

    if(!category){
        return;
    }


    const product =
        category.products.find(
            p =>
                p.name === productName &&
                p.weight === weight
        );

    if(!product){
        return;
    }


    /* ===========================
       CHANGE QTY
    =========================== */

    product.qty += change;


    if(product.qty < 0){

        product.qty = 0;

    }


    /* ===========================
       UPDATE ONLY THIS QTY
       PAGE REFRESH / RERENDER નહીં
    =========================== */

    const rows =
        document.querySelectorAll(
            ".product-option"
        );


    rows.forEach(row => {

        if(
            row.dataset.productName === productName &&
            row.dataset.weight === weight
        ){

            const qty =
                row.querySelector(".qty");

            if(qty){

                qty.innerText =
                    product.qty;

            }

        }

    });


    /* ===========================
       UPDATE CART
    =========================== */

    updateCart();

}

/* ===========================
   UPDATE CART
=========================== */

function updateCart(){

    let totalItems = 0;
    let totalPrice = 0;

    menu.forEach(category=>{

        category.products.forEach(product=>{

            if(product.qty > 0){

                totalItems += product.qty;

                totalPrice +=
                product.qty * product.price;

            }

        });

    });

    cartItems.innerText = totalItems;

    cartTotal.innerText =
    "₹" + totalPrice;

    if(totalItems > 0){

        cartBar.style.display = "flex";

    }else{

        cartBar.style.display = "none";

    }

}

/* ===========================
   CATEGORY COLLAPSE
=========================== */


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
/* ===========================
   REVIEW
=========================== */

function sendReview(review){

    const message =
`નમસ્તે 🙏

મારો અભિપ્રાય:

${review}

આભાર.`;

    window.open(

        "https://wa.me/919712149344?text=" +

        encodeURIComponent(message),

        "_blank"

    );

}



/* ===========================
   WHATSAPP ORDER
=========================== */

document
.getElementById("orderBtn")
.addEventListener("click",function(){

    let total = 0;

    let message =
"🛒 *Jyoti Gruh Udhyog*\n\n";

    menu.forEach(category=>{

        let found = false;

        category.products.forEach(product=>{

            if(product.qty>0){

                if(!found){

                    message +=
"\n📦 *" +
category.category +
"*\n";

                    found = true;

                }

                const amount =
                product.qty *
                product.price;

                total += amount;

                message +=
"• " +
product.name +
"\n" +
product.weight +
" × " +
product.qty +
" = ₹" +
amount +
"\n";

            }

        });

    });

    if(total===0){

        alert(
"Please add product."
);

        return;

    }

    message +=
"\n━━━━━━━━━━━━━━\n";

    message +=
"💰 Total : ₹" +
total;

    window.open(

"https://wa.me/919712149344?text="+
encodeURIComponent(message),

"_blank"

);

/* CLEAR CART */

menu.forEach(category=>{

    category.products.forEach(product=>{

        product.qty = 0;

    });

});

updateCart();

renderMenu();

});


