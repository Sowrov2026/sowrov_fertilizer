import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    where,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const reviewContainer =
document.getElementById("customerReviewList");

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

async function loadReviews(){

    if(!reviewContainer) return;

    reviewContainer.innerHTML="";

    try{

        const q = query(

            collection(db,"reviews"),

            where("status","==","approved"),

            orderBy("createdAt","desc")

        );

        const snapshot = await getDocs(q);

        if(snapshot.empty){

            reviewContainer.innerHTML=`

            <div class="no-review">

                <h3>No Reviews Yet</h3>

                <p>Be the first customer to review our products.</p>

            </div>

            `;

            return;

        }

        snapshot.forEach((doc)=>{

            const review = doc.data();

            const stars =
            "★".repeat(review.rating) +
            "☆".repeat(5-review.rating);

            const reviewDate =
            review.createdAt
            ?
            review.createdAt.toDate().toLocaleDateString()
            :
            "";

            reviewContainer.innerHTML += `

            <div class="review-card">

                <div class="review-header">

                    <img
                    src="assets/images/avatar.png"
                    class="review-avatar">

                    <div>

                        <h3>${escapeHtml(String(review.name))}</h3>

                        <span class="verified-badge">

                            ✅ Verified Customer

                        </span>

                    </div>

                </div>

                <div class="review-product">

                    🌱 ${escapeHtml(String(review.productName))}

                </div>

                <div class="review-stars">

                    ${stars}

                </div>

                <p class="review-message">

                    "${escapeHtml(String(review.message))}"

                </p>

                <small class="review-date">

                    📅 ${reviewDate}

                </small>

            </div>

            `;

        });

    }

    catch(error){

        console.error(error);

    }

}

loadReviews();