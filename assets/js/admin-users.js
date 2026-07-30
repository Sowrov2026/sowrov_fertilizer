// ======================================
// Users
// Sowrov Fertilizer
// ======================================

import { db } from "./firebase.js";

import {

collection,
getDocs,
doc,
updateDoc,
deleteDoc

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// ======================================
// Elements
// ======================================

const usersTableBody = document.getElementById("usersTableBody");

const searchUser = document.getElementById("searchUser");

const totalUsers = document.getElementById("totalUsers");

const activeUsers = document.getElementById("activeUsers");

const blockedUsers = document.getElementById("blockedUsers");

const userModal = document.getElementById("userModal");

const userDetails = document.getElementById("userDetails");

const blockUserBtn = document.getElementById("blockUserBtn");

const deleteUserBtn = document.getElementById("deleteUserBtn");

const closeUserModal = document.getElementById("closeUserModal");

// ======================================
// Variables
// ======================================

let users = [];

let selectedUserId = null;

// ======================================
// Load Users
// ======================================

async function loadUsers(keyword = "") {

    try {

        usersTableBody.innerHTML = "";

        users = [];

        let active = 0;

        let blocked = 0;

        const snapshot = await getDocs(collection(db, "users"));

        snapshot.forEach((docSnap) => {

            const user = {

                id: docSnap.id,

                ...docSnap.data()

            };
            if (user.id === "User UID (Firebase Authentication UID)") {

    return;

}

            users.push(user);

        });

        users.forEach((user) => {

            if (

                keyword &&

                !(
                    user.name || ""
                ).toLowerCase().includes(keyword.toLowerCase()) &&

                !(
                    user.email || ""
                ).toLowerCase().includes(keyword.toLowerCase())

            ) {

                return;

            }

            if (user.status === "blocked") {

                blocked++;

            } else {

                active++;

            }

            usersTableBody.innerHTML += `

<tr>

<td>

<img

src="${user.photo || 'assets/images/logo/logo.png'}"

style="width:45px;height:45px;border-radius:50%;object-fit:cover;">

</td>

<td>${user.name || "-"}</td>

<td>${user.email || "-"}</td>

<td>${user.phone || "-"}</td>

<td>${user.totalOrders || 0}</td>

<td>৳${user.totalSpent || 0}</td>

<td>

<span class="${
user.status==="blocked"
?
"inactive-status"
:
"active-status"
}">

${user.status || "active"}

</span>

</td>

<td>

<button

class="view-user-btn"

data-id="${user.id}">

View

</button>

</td>

</tr>

`;

        });

        totalUsers.textContent = users.length;

        activeUsers.textContent = active;

        blockedUsers.textContent = blocked;

    }

    catch(error){

        console.error(error);

        alert("Failed to load users");

    }

}

loadUsers();

// ======================================
// Search
// ======================================

searchUser.addEventListener("input",()=>{

    loadUsers(searchUser.value);

});
// ======================================
// View User
// ======================================

document.addEventListener("click", (e) => {

    if (!e.target.classList.contains("view-user-btn")) return;

    const id = e.target.dataset.id;

    const user = users.find(u => u.id === id);

    if (!user) return;

    selectedUserId = id;

    userDetails.innerHTML = `

        <p><b>Name:</b> ${user.name || "-"}</p>

        <p><b>Email:</b> ${user.email || "-"}</p>

        <p><b>Phone:</b> ${user.phone || "-"}</p>

        <p><b>Address:</b> ${user.address || "-"}</p>

        <p><b>Total Orders:</b> ${user.totalOrders || 0}</p>

        <p><b>Total Purchase:</b> ৳${user.totalSpent || 0}</p>

        <p><b>Status:</b> ${user.status || "active"}</p>

    `;

    blockUserBtn.textContent =
        user.status === "blocked"
        ? "✅ Unblock"
        : "🚫 Block";

    userModal.style.display = "flex";

});

// ======================================
// Close Modal
// ======================================

closeUserModal.onclick = () => {

    userModal.style.display = "none";

};

window.addEventListener("click", (e) => {

    if (e.target === userModal) {

        userModal.style.display = "none";

    }

});

// ======================================
// Block / Unblock User
// ======================================

blockUserBtn.onclick = async () => {

    if (!selectedUserId) return;

    const user = users.find(u => u.id === selectedUserId);

    if (!user) return;

    const newStatus =
        user.status === "blocked"
        ? "active"
        : "blocked";

    try {

        await updateDoc(

            doc(db, "users", selectedUserId),

            {

                status: newStatus

            }

        );

        alert(
            newStatus === "blocked"
            ? "✅ User Blocked"
            : "✅ User Unblocked"
        );

        userModal.style.display = "none";

        loadUsers(searchUser.value);

    }

    catch(error){

        console.error(error);

        alert("Failed to update user.");

    }

};
// ======================================
// Delete User
// ======================================

deleteUserBtn.onclick = async () => {

    if (!selectedUserId) return;

    if (!confirm("Are you sure you want to delete this user?")) {

        return;

    }

    try {

        await deleteDoc(

            doc(db, "users", selectedUserId)

        );

        alert("✅ User Deleted Successfully");

        userModal.style.display = "none";

        selectedUserId = null;

        loadUsers(searchUser.value);

    }

    catch(error){

        console.error(error);

        alert("❌ Failed to delete user");

    }

};

// ======================================
// ESC Key Close Modal
// ======================================

document.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        userModal.style.display="none";

    }

});

// ======================================
// Refresh
// ======================================

window.refreshUsers=()=>{

    loadUsers(searchUser.value);

};

// ======================================
// Initialization
// ======================================

console.log("✅ Admin Users Loaded");