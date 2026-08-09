/* ===========================
   JYOTI GRUH UDHYOG
   API.JS V7
=========================== */

/* ===========================
   GOOGLE SHEET
=========================== */

const SHEET_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vStfoYZJzDES0lAav3gzVi4hHMrr-g-vu6oHbAecwVN7-j5ZfyZCE4wy5qE8oaH0fSw14Y97pHMmUrU/pub?gid=1327834650&single=true&output=csv";


/* ===========================
   GLOBALS
=========================== */

let menu = [];

/*
   false = category closed
   true  = category open
*/
let openCategories = {};


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

        console.error(
            "Products Loading Error:",
            error
        );

        loader.style.display = "none";

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
        csv.trim().split(/\r?\n/);

    if(rows.length <= 1){

        throw new Error(
            "No products found in Google Sheet"
        );

    }

    rows.shift();

    const categoryMap = {};


    rows.forEach(row => {

        const cols =
            row.split(",");


        /*
           Minimum columns:

           0 = ID
           1 = Category
           2 = Product
           3 = Weight
           4 = Price
           5 = Status
           6 = Voice Keywords (optional)
        */

        if(cols.length < 6){

            return;

        }


        const category =
            cols[1].trim();


        const product = {

            name:
                cols[2].trim(),

            weight:
                cols[3].trim(),

            price:
                Number(cols[4]),

            status:
                cols[5].trim(),

            voiceKeywords:
                cols[6]
                ? cols[6]
                    .toLowerCase()
                    .split("|")
                    .map(k => k.trim())
                : [],

            qty: 0

        };


        /*
           Only Active Products
        */

        if(
            product.status
                .toLowerCase() !== "active"
        ){

            return;

        }


        if(!categoryMap[category]){

            categoryMap[category] = [];

        }


        categoryMap[category].push(
            product
        );

    });


    menu =
        Object.keys(categoryMap)
        .map(category => ({

            category: category,

            products:
                categoryMap[category]

        }));


    /*
       Restore Cart BEFORE render
    */

    restoreCart();


    /*
       Loader hide
    */

    loader.style.display = "none";


    /*
       First display:
       ALL categories CLOSED
    */

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

function renderMenu(search = ""){

    menuContainer.innerHTML = "";

    let totalProducts = 0;

    const keyword =
        search
        .toLowerCase()
        .trim();


    menu.forEach(category => {


        /* ===========================
           FILTER
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


        if(
            filteredProducts.length === 0
        ){

            return;

        }


        /* ===========================
           GROUP SAME PRODUCT NAME
        =========================== */

        const grouped = {};


        filteredProducts.forEach(product => {

            const key =
                product.name
                    .toLowerCase()
                    .trim();


            if(!grouped[key]){

                grouped[key] = [];

            }


            grouped[key].push(
                product
            );

        });


        const productGroups =
            Object.values(grouped);


        totalProducts +=
            productGroups.length;


        /* ===========================
           CATEGORY
        =========================== */

        const section =
            document.createElement("section");

        section.className =
            "category";


        /*
           IMPORTANT

           Only category explicitly opened
           by customer will be open.
        */

        const isOpen =
            openCategories[
                category.category
            ] === true;


        let html = `

            <h2
                class="category-title"
                onclick="toggleCategory('${escapeHtml(category.category)}')"
            >

                <span>

                    <span
                        id="icon-${escapeHtml(category.category)}"
                    >

                        ${isOpen ? "▼" : "▶"}

                    </span>

                    ${escapeHtml(category.category)}

                </span>

                <span class="category-count">

                    (${productGroups.length})

                </span>

            </h2>


            <div
                id="cat-${escapeHtml(category.category)}"
                style="
                    display:${isOpen ? "block" : "none"};
                "
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

                        ${escapeHtml(
                            firstProduct.name
                        )}

                    </div>

            `;


            /* ===========================
               WEIGHT / PRICE
            =========================== */

            products.forEach(product => {

                html += `

                    <div
                        class="product-option"

                        data-product-name="${escapeHtml(
                            product.name
                        )}"

                        data-weight="${escapeHtml(
                            product.weight
                        )}"
                    >

                        <div class="product-info">

                            ${escapeHtml(
                                product.weight
                            )}

                            &nbsp; • &nbsp;

                            ₹${product.price}

                        </div>


                        <div class="qty-box">

                            <button
                                type="button"
                                class="qty-btn"

                                onclick="event.stopPropagation(); changeQty(
                                    '${escapeHtml(category.category)}',
                                    '${escapeHtml(product.name)}',
                                    '${escapeHtml(product.weight)}',
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
                                    '${escapeHtml(category.category)}',
                                    '${escapeHtml(product.name)}',
                                    '${escapeHtml(product.weight)}',
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


        section.innerHTML =
            html;


        menuContainer.appendChild(
            section
        );

    });


    /* ===========================
       PRODUCT COUNT
    =========================== */

    const countElement =
        document.getElementById(
            "productCount"
        );


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
   ESCAPE HTML
=========================== */

function escapeHtml(value){

    return String(value)

        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");

}


/* ===========================
   SEARCH
=========================== */

if(searchInput){

    searchInput.addEventListener(
        "input",
        function(){

            renderMenu(
                this.value
            );

        }
    );

}


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
            c =>
                c.category ===
                categoryName
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


    product.qty += change;


    if(product.qty < 0){

        product.qty = 0;

    }


    /*
       Save Cart
    */

    saveCart();


    /*
       Update Cart
    */

    updateCart();


    /*
       IMPORTANT

       Do NOT close category.

       renderMenu() reads
       openCategories and keeps
       the category open.
    */

    renderMenu(
        searchInput
        ? searchInput.value
        : ""
    );

}


/* ===========================
   UPDATE CART
=========================== */

function updateCart(){

    let totalItems = 0;

    let totalPrice = 0;


    menu.forEach(category => {

        category.products.forEach(product => {

            if(product.qty > 0){

                totalItems +=
                    product.qty;

                totalPrice +=
                    product.qty *
                    product.price;

            }

        });

    });


    if(cartItems){

        cartItems.innerText =
            totalItems;

    }


    if(cartTotal){

        cartTotal.innerText =
            "₹" + totalPrice;

    }


    if(cartBar){

        cartBar.style.display =
            totalItems > 0
            ? "flex"
            : "none";

    }

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


    if(!box){

        return;

    }


    if(
        box.style.display === "none"
    ){

        /*
           OPEN
        */

        box.style.display =
            "block";

        if(icon){

            icon.innerHTML =
                "▼";

        }

        openCategories[
            category
        ] = true;


    }else{

        /*
           CLOSE
        */

        box.style.display =
            "none";

        if(icon){

            icon.innerHTML =
                "▶";

        }

        openCategories[
            category
        ] = false;

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

const orderBtn =
    document.getElementById(
        "orderBtn"
    );


if(orderBtn){

    orderBtn.addEventListener(
        "click",
        function(){

            let total = 0;


            let message =
                "🛒 *Jyoti Gruh Udhyog*\n\n";


            menu.forEach(category => {

                let found = false;


                category.products.forEach(product => {

                    if(product.qty > 0){

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


                        total +=
                            amount;


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


            if(total === 0){

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


            /*
               Open WhatsApp
            */

            window.open(

                "https://wa.me/919712149344?text=" +

                encodeURIComponent(
                    message
                ),

                "_blank"

            );


            /*
               CLEAR CART
            */

            menu.forEach(category => {

                category.products.forEach(product => {

                    product.qty = 0;

                });

            });


            localStorage.removeItem(
                "jyotiCart"
            );


            updateCart();


            /*
               After order:
               all categories closed
            */

            openCategories = {};


            renderMenu();

        }
    );

}


/* ===========================
   SAVE CART
=========================== */

function saveCart(){

    const cart = [];


    menu.forEach(category => {

        category.products.forEach(product => {

            if(product.qty > 0){

                cart.push({

                    category:
                        category.category,

                    name:
                        product.name,

                    weight:
                        product.weight,

                    qty:
                        product.qty

                });

            }

        });

    });


    localStorage.setItem(

        "jyotiCart",

        JSON.stringify(cart)

    );

}


/* ===========================
   RESTORE CART
=========================== */

function restoreCart(){

    const savedCart =
        localStorage.getItem(
            "jyotiCart"
        );


    if(!savedCart){

        return;

    }


    try{

        const cart =
            JSON.parse(
                savedCart
            );


        if(!Array.isArray(cart)){

            return;

        }


        cart.forEach(saved => {

            const category =
                menu.find(
                    c =>
                        c.category ===
                        saved.category
                );


            if(!category){

                return;

            }


            const product =
                category.products.find(
                    p =>
                        p.name ===
                            saved.name &&

                        p.weight ===
                            saved.weight
                );


            if(product){

                product.qty =
                    Number(saved.qty) || 0;

            }

        });

    }

    catch(error){

        console.error(
            "Cart Restore Error:",
            error
        );

    }

}