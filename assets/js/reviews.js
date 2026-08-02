console.log("Review JS Loaded");
// ======================================
// Review Submit
// Sowrov Fertilizer
// ======================================

import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// ======================================
// STAR RATING
// ======================================

const stars = document.querySelectorAll(".star");
const reviewRating = document.getElementById("reviewRating");

let selectedRating = 0;
stars.forEach((star) => {

    star.addEventListener("click", () => {

        selectedRating =
        Number(star.dataset.value);

        reviewRating.value =
        selectedRating;

        stars.forEach((s) => {

            if (
                Number(s.dataset.value)
                <= selectedRating
            ) {

                s.classList.add("active");

            }

            else {

                s.classList.remove("active");

            }

        });

    });

});
// ======================================
// STAR HOVER EFFECT
// ======================================

stars.forEach((star) => {

    star.addEventListener("mouseover", () => {

        const value = Number(star.dataset.value);

        stars.forEach((s) => {

            if (Number(s.dataset.value) <= value) {

                s.classList.add("active");

            } else {

                s.classList.remove("active");

            }

        });

    });

});
// ======================================
// RESET HOVER
// ======================================

document.querySelector(".star-rating")
.addEventListener("mouseleave", () => {

    stars.forEach((s) => {

        if (Number(s.dataset.value) <= selectedRating) {

            s.classList.add("active");

        } else {

            s.classList.remove("active");

        }

    });

});
// ===============================
// Elements
// ===============================

const reviewName = document.getElementById("reviewName");
const reviewEmail = document.getElementById("reviewEmail");
const reviewProduct = document.getElementById("reviewProduct");
const reviewMessage = document.getElementById("reviewMessage");
const submitReviewBtn = document.getElementById("submitReviewBtn");

// ===============================
// Submit Review
// ===============================

submitReviewBtn.addEventListener("click", async (e) => {

    e.preventDefault();

    const name = reviewName.value.trim();
    const email = reviewEmail.value.trim();
    const productName = reviewProduct.value;
    const rating = Number(reviewRating.value);
    const message = reviewMessage.value.trim();

    if (!name || !email || !productName || !rating || !message) {

        alert("Please fill all fields.");

        return;
    }

    try {

        await addDoc(collection(db, "reviews"), {

            name,
            email,
            productName,
            rating,
            message,

            status: "pending",

            createdAt: serverTimestamp()

        });

        alert("✅ Review submitted successfully.");

        reviewName.value = "";
        reviewEmail.value = "";
        reviewProduct.selectedIndex = 0;
       reviewRating.value = 0;

selectedRating = 0;

stars.forEach(star => star.classList.remove("active"));
        reviewMessage.value = "";

    }

    catch (error) {

        console.error(error);

        alert("❌ Failed to submit review.");

    }

});

console.log("✅ Review JS Loaded");