// ======================================
// Admin Reviews
// Sowrov Fertilizer
// ======================================

import { db } from "./firebase.js";

import {

collection,
getDocs,
doc,
updateDoc,
deleteDoc,
orderBy,
query

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";



// Elements

const reviewsTableBody =
document.getElementById("reviewsTableBody");


const totalReviews =
document.getElementById("totalReviews");


const approvedReviews =
document.getElementById("approvedReviews");


const pendingReviews =
document.getElementById("pendingReviews");



// Load Reviews

async function loadReviews(){


try{


reviewsTableBody.innerHTML="";


let total = 0;

let approved = 0;

let pending = 0;



const q = query(

collection(db,"reviews"),

orderBy("createdAt","desc")

);



const snapshot = await getDocs(q);



snapshot.forEach((docSnap)=>{


const review = docSnap.data();


total++;



if(review.status === "approved"){

approved++;

}
else{

pending++;

}




reviewsTableBody.innerHTML += `


<tr>


<td>


<strong>
${review.name || "Customer"}
</strong>

<br>

<small>
${review.email || ""}
</small>


</td>



<td>

${"⭐".repeat(review.rating || 0)}

</td>



<td>

${review.message || "-"}

</td>



<td>


<span class="${
review.status==="approved"
?
"active-status"
:
"inactive-status"
}">

${review.status || "pending"}

</span>


</td>



<td>


<button

onclick="approveReview('${docSnap.id}')">

✅


</button>



<button

onclick="removeReview('${docSnap.id}')">

🗑


</button>


</td>


</tr>


`;



});



totalReviews.innerText = total;

approvedReviews.innerText = approved;

pendingReviews.innerText = pending;



}

catch(error){

console.error(error);

alert("Failed to load reviews");

}



}



loadReviews();




// Approve Review

window.approveReview = async(id)=>{


try{


await updateDoc(

doc(db,"reviews",id),

{

status:"approved"

}

);



alert("✅ Review Approved");


loadReviews();


}

catch(error){

console.error(error);

}



};




// Delete Review


window.removeReview = async(id)=>{


if(!confirm("Delete this review?")) return;



try{


await deleteDoc(

doc(db,"reviews",id)

);



alert("🗑 Review Deleted");


loadReviews();


}

catch(error){

console.error(error);

}



};



console.log("✅ Admin Reviews Loaded");