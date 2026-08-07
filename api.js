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