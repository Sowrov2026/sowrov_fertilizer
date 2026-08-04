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

// ==============================
// DASHBOARD NAVIGATION
// ==============================

(function() {
    // Desktop dropdown toggle
    const trigger = document.querySelector('.dash-trigger');
    if (trigger) {
        const btn = trigger.querySelector('.dash-trigger-btn');
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            trigger.classList.toggle('open');
        });
        document.addEventListener('click', function(e) {
            if (!trigger.contains(e.target)) {
                trigger.classList.remove('open');
            }
        });
        // Keyboard: Escape closes
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') trigger.classList.remove('open');
        });
    }

    // Mobile slide panel
    const overlay = document.querySelector('.dash-slide-overlay');
    const panel = document.querySelector('.dash-slide-panel');
    const closeBtn = document.querySelector('.dash-slide-close');
    const mobileToggle = document.querySelector('.mobile-toggle');

    function openSlide() {
        if (overlay) overlay.classList.add('open');
        if (panel) panel.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeSlide() {
        if (overlay) overlay.classList.remove('open');
        if (panel) panel.classList.remove('open');
        document.body.style.overflow = '';
    }

    if (mobileToggle) {
        mobileToggle.addEventListener('click', openSlide);
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', closeSlide);
    }
    if (overlay) {
        overlay.addEventListener('click', closeSlide);
    }
    // Escape closes slide
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeSlide();
    });

    // Mark active page in dropdowns
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.dash-dropdown a, .dash-slide-body a').forEach(function(link) {
        const href = link.getAttribute('href');
        if (href) {
            const page = href.split('/').pop();
            if (page === currentPage || (currentPage === '' && page === 'index.html') || (currentPage === '/' && page === '')) {
                link.classList.add('active-page');
            }
        }
    });

    // Mark active page in dashboard topnav
    document.querySelectorAll('.dash-topnav a').forEach(function(link) {
        const href = link.getAttribute('href');
        if (href && !link.getAttribute('onclick')) {
            const page = href.split('/').pop();
            if (page === currentPage || (currentPage === '' && page === 'index.html') || (currentPage === '/' && page === '')) {
                link.classList.add('topnav-active');
            }
        }
    });
})();