document.addEventListener("DOMContentLoaded", () => {
    const popup = document.querySelector(".unique-popup-calculator");
    const closeButton = document.querySelector(".popup-close");


    const isMobile = window.innerWidth <= 767;


    const delay = isMobile ? 10000 : 1000; 


    const isPopupShown = localStorage.getItem("popupShown");


    if (!isPopupShown) {
        setTimeout(() => {
            popup.style.display = "flex";
        }, delay);
    }


    closeButton.addEventListener("click", () => {
        popup.style.display = "none";

        localStorage.setItem("popupShown", "true");
    });


    popup.addEventListener("click", (event) => {
        if (event.target === popup) {
            popup.style.display = "none";

            localStorage.setItem("popupShown", "true");
        }
    });
});
