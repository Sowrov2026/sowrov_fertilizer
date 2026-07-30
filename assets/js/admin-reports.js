// ======================================
// Admin Reports
// Sowrov Fertilizer
// ======================================


import { db } from "./firebase.js";


import {

collection,
getDocs

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";



// Elements

const reportSales =
document.getElementById("reportSales");


const reportRevenue =
document.getElementById("reportRevenue");


const reportOrders =
document.getElementById("reportOrders");


const reportProducts =
document.getElementById("reportProducts");





// Load Reports


async function loadReports(){


try{


// Products

const productSnap =
await getDocs(
collection(db,"products")
);



reportProducts.innerText =
productSnap.size;





// Orders

const orderSnap =
await getDocs(
collection(db,"orders")
);



reportOrders.innerText =
orderSnap.size;







// Sales

const salesSnap =
await getDocs(
collection(db,"sales")
);



let revenue = 0;


let salesCount = 0;



let monthlyRevenue = [

0,0,0,0,

0,0,0,0,

0,0,0,0

];




salesSnap.forEach((doc)=>{


const sale = doc.data();


salesCount++;



revenue +=
Number(
sale.totalPrice || 0
);





if(sale.createdAt){


const date =
sale.createdAt.toDate();


const month =
date.getMonth();



monthlyRevenue[month] +=

Number(
sale.totalPrice || 0
);



}



});





reportSales.innerText =
salesCount;



reportRevenue.innerText =
"৳" + revenue;





createChart(monthlyRevenue);



}

catch(error){


console.error(error);


alert(
"Failed to load reports"
);


}


}



loadReports();






// Chart


function createChart(data){


const canvas =
document.getElementById("reportChart");


if(!canvas) return;



new Chart(

canvas,

{


type:"line",



data:{


labels:[

"Jan",
"Feb",
"Mar",
"Apr",
"May",
"Jun",
"Jul",
"Aug",
"Sep",
"Oct",
"Nov",
"Dec"

],



datasets:[{


label:"Revenue",


data:data,


borderWidth:3


}]


},



options:{


responsive:true,


plugins:{


legend:{


display:true


}


}



}



}



);



}






// Print Report


const printBtn =
document.getElementById("printReport");



if(printBtn){


printBtn.onclick = ()=>{


window.print();


};


}




console.log(
"✅ Admin Reports Loaded"
);