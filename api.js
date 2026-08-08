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

function renderMenu(search = ""){

    menuContainer.innerHTML = "";

    let totalProducts = 0;

    const keyword = search.toLowerCase().trim();

    menu.forEach(category=>{

        const products = category.products.filter(product=>{

            return(

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

        if(products.length===0){

            return;

        }

        totalProducts += products.length;

        const section =
        document.createElement("section");

        section.className = "category";

        let html = `

        <h2
        class="category-title"
        onclick="toggleCategory('${category.category}')">

            <span>

                <span
                id="icon-${category.category}">

                ▼

                </span>

                ${category.category}

            </span>

            <span
            class="category-count">

            ${products.length}

            </span>

        </h2>

        <div
        id="cat-${category.category}">

        `;

        products.forEach(product=>{

            html += `

            <div class="product-row">

                <div class="product-name">

                    ${product.name}

                </div>

                <div class="product-info">

                    ${product.weight}

                    •

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

        html += "</div>";

        section.innerHTML = html;

        menuContainer.appendChild(section);

    });

    document.getElementById("productCount")
    .innerText = totalProducts;

    if(totalProducts===0){

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

function changeQty(categoryName, productName, change){

    const category = menu.find(
        c => c.category === categoryName
    );

    if(!category) return;

    const product = category.products.find(
        p => p.name === productName
    );

    if(!product) return;

    product.qty += change;

    if(product.qty < 0){
        product.qty = 0;
    }

    updateCart();

    renderMenu(searchInput.value);

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
    document.getElementById(
        "cat-" + category
    );

    const icon =
    document.getElementById(
        "icon-" + category
    );

    if(!box) return;

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
   VOICE ORDER
=========================== */

if (voiceBtn && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();

    recognition.lang = "gu-IN";

    recognition.interimResults = false;

    recognition.continuous = false;

    recognition.maxAlternatives = 1;

    voiceBtn.addEventListener("click", () => {

        recognition.start();

        voiceBtn.classList.add("listening");

        voiceResult.innerHTML = "🎤 સાંભળી રહ્યું છે...";

    });

    recognition.onresult = function (event) {

        const text =
            event.results[0][0].transcript;

        voiceResult.innerHTML =
            "🎤 " + text;

console.log("VOICE =", text);
alert(text);
        processVoiceOrder(text);

    };

    recognition.onend = function () {

        voiceBtn.classList.remove("listening");

    };

}

/* ===========================
   PROCESS VOICE
=========================== */

function processVoiceOrder(text){

console.log("VOICE :", text);
alert(text);
    text = text.toLowerCase();

    alert("તમે કહ્યું : " + text);

    // Version 6.1 માં અહીં
    // Product Auto Match આવશે.

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
/* ===========================
   VOICE SEARCH V1
=========================== */

if (voiceBtn && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();

    recognition.lang = "gu-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    voiceBtn.addEventListener("click", () => {

        recognition.start();

        voiceBtn.classList.add("listening");

        voiceResult.innerHTML = "🎤 બોલો...";

    });

    recognition.onresult = function(event){

        const text = event.results[0][0].transcript
            .toLowerCase()
            .trim();

        processVoiceSearch(text);

    };

    recognition.onend = function(){

        voiceBtn.classList.remove("listening");

    };

}


/* ===========================
   PROCESS VOICE SEARCH
=========================== */

function processVoiceSearch(text){

    voiceResult.innerHTML = "🎤 " + text;

    text = text.toLowerCase().trim();

    // Search box માં લખો
    searchInput.value = text;

    // Product filter કરો
    renderMenu(text);

}

    /* CLEAR CART */

    menu.forEach(category=>{

        category.products.forEach(product=>{

            product.qty = 0;

        });

    });

    updateCart();

    renderMenu();

});

/* ===========================
   VOICE ORDER V10
=========================== */

if (voiceBtn && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();

    recognition.lang = "gu-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    voiceBtn.addEventListener("click", function () {

        recognition.start();

        voiceBtn.classList.add("listening");

        voiceResult.innerHTML = "🎤 બોલો...";

    });

    recognition.onresult = function (event) {

        const text = event.results[0][0].transcript
            .toLowerCase()
            .trim();

        processVoiceOrder(text);

    };

    recognition.onerror = function () {

        voiceBtn.classList.remove("listening");

        voiceResult.innerHTML =
            "❌ ફરી પ્રયત્ન કરો";

    };

    recognition.onend = function () {

        voiceBtn.classList.remove("listening");

    };

}

/* ===========================
   PROCESS VOICE
=========================== */

function processVoiceOrder(text){

    voiceResult.innerHTML = "🎤 " + text;

    text = text.toLowerCase().trim();

    if(
        text.includes("order") ||
        text.includes("ઓર્ડર")
    ){
        document.getElementById("orderBtn").click();
        return;
    }

    if(findVoiceProduct(text)){
        return;
    }

    searchInput.value = text;

    renderMenu(text);

}

/* ===========================
   FIND PRODUCT
=========================== */

function findVoiceProduct(text){

    text = text.toLowerCase().trim();

    let qty = 1;

    const num = text.match(/\d+/);

    if(num){
        qty = parseInt(num[0]);
    }

    text = text
        .replace(/\d+/g,"")
        .replace(/packet|pack|gm|gram|grams|add|order|please/gi,"")
        .trim();

    let bestProduct = null;
    let bestScore = -1;

    menu.forEach(category => {

        category.products.forEach(product => {

            if(!product.voiceKeywords) return;

            product.voiceKeywords.forEach(keyword => {

                keyword = keyword.toLowerCase().trim();

                let score = -1;

                if(text === keyword){

                    score = 1000;

                }else if(text.includes(keyword)){

                    score = keyword.length;

                }

                if(score > bestScore){

                    bestScore = score;
                    bestProduct = product;

                }

            });

        });

    });

    if(bestProduct){

        bestProduct.qty += qty;

        updateCart();

        renderMenu(searchInput.value);

        voiceResult.innerHTML =
            "✅ " + bestProduct.name + " × " + qty;

        return true;

    }

    voiceResult.innerHTML = "❌ Product Not Found";

    return false;

}