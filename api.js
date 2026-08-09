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
     
    restoreCart();

    loader.style.display = "none";

    renderMenu();

    updateCart();

}

/* ===========================
   START
=========================== */

loadProducts();
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

saveCart();

updateCart();

renderMenu(searchInput.value);


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

    const box =
        document.getElementById("cat-" + category);

    const icon =
        document.getElementById("icon-" + category);

    if(!box) return;

    if(box.style.display === "none"){

        box.style.display = "block";

        icon.innerHTML = "▼";

        openCategories[category] = true;

    }else{

        box.style.display = "none";

        icon.innerHTML = "▶";

        openCategories[category] = false;

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


localStorage.removeItem("jyotiCart");
updateCart();

renderMenu();

});


/* ===========================
   SAVE CART
=========================== */

function saveCart(){

    const cart = [];

    menu.forEach(category => {

        category.products.forEach(product => {

            if(product.qty > 0){

                cart.push({

                    category: category.category,

                    name: product.name,

                    weight: product.weight,

                    qty: product.qty

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
        localStorage.getItem("jyotiCart");

    if(!savedCart) return;

    const cart =
        JSON.parse(savedCart);

    cart.forEach(saved => {

        const category =
            menu.find(
                c => c.category === saved.category
            );

        if(!category) return;

        const product =
            category.products.find(
                p =>
                    p.name === saved.name &&
                    p.weight === saved.weight
            );

        if(product){

            product.qty = saved.qty;

        }

    });

}
