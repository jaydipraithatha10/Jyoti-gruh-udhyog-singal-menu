const SHEET_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vStfoYZJzDES0lAav3gzVi4hHMrr-g-vu6oHbAecwVN7-j5ZfyZCE4wy5qE8oaH0fSw14Y97pHMmUrU/pub?gid=1327834650&single=true&output=csv";

let menu = [];

const menuContainer = document.getElementById("menuContainer");
const searchInput = document.getElementById("searchInput");
const cartBar = document.getElementById("cartBar");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");

async function loadProducts(){

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

    renderMenu();

}

loadProducts();