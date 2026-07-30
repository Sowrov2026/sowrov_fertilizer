document.addEventListener("DOMContentLoaded",()=>{

const btn=document.getElementById("menuToggle");

const sidebar=document.querySelector(".sidebar");

if(!btn || !sidebar) return;

btn.onclick=()=>{

sidebar.classList.toggle("hide");

};

});