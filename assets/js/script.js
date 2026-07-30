console.log("Sowrov Fertilizer Website Loaded");
// ==============================
// BACK TO TOP BUTTON
// ==============================

const backTop = document.getElementById("backTop");

if (backTop) {

    window.addEventListener("scroll", () => {

        if (window.scrollY > 300) {
            backTop.classList.add("show");
        } else {
            backTop.classList.remove("show");
        }

    });

    backTop.addEventListener("click", () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });

}
// ==============================
// REVIEW SYSTEM (Temporary)
// ==============================

const reviewBtn = document.getElementById("reviewBtn");

if(reviewBtn){

reviewBtn.addEventListener("click",()=>{

const name=document.getElementById("reviewName").value;

const review=document.getElementById("reviewText").value;

if(name===""||review===""){

alert("Please fill all fields.");

return;

}

const card=document.createElement("div");

card.className="review-card";

card.innerHTML=`

<h3>${name}</h3>

<p>${review}</p>

`;

document.getElementById("reviewList").prepend(card);

document.getElementById("reviewName").value="";

document.getElementById("reviewText").value="";

});

}