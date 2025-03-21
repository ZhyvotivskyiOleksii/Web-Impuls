document.addEventListener("DOMContentLoaded", function () {
  const myCarouselItems = document.querySelectorAll(".my-carousel-item");
  const totalItems = myCarouselItems.length;
  const angleIncrement = 360 / totalItems;
  let rotationAngle = 0;

  function getCarouselRadius() {
    return window.innerWidth > 768
      ? getComputedStyle(document.documentElement)
          .getPropertyValue("--carousel-radius-desktop")
          .trim()
      : getComputedStyle(document.documentElement)
          .getPropertyValue("--carousel-radius-mobile")
          .trim();
  }

  function updateCarouselRadius() {
    document.documentElement.style.setProperty(
      "--carousel-radius",
      getCarouselRadius()
    );
  }
  updateCarouselRadius();

  function positionCarouselItems() {
    const radius = getCarouselRadius();
    myCarouselItems.forEach((item, index) => {
      const angle = index * angleIncrement;
      item.style.transform =
        "rotateY(" + angle + "deg) translateZ(" + radius + ")";
    });
    updateCarousel();
  }

  function updateCarousel() {
    const carouselTrack = document.querySelector(".my-carousel-items");
    carouselTrack.style.transform = "rotateY(" + -rotationAngle + "deg)";
    let activeIndex = Math.round(rotationAngle / angleIncrement) % totalItems;
    if (activeIndex < 0) activeIndex += totalItems;
    myCarouselItems.forEach((item, idx) => {
      item.classList.toggle("active", idx === activeIndex);
    });
  }

  positionCarouselItems();

  const nextBtn = document.querySelector(".my-carousel-nav.my-next");
  const prevBtn = document.querySelector(".my-carousel-nav.my-prev");
  if (nextBtn && prevBtn) {
    nextBtn.addEventListener("click", () => {
      rotationAngle += angleIncrement;
      updateCarousel();
    });
    prevBtn.addEventListener("click", () => {
      rotationAngle -= angleIncrement;
      updateCarousel();
    });
  }

  const myModal = document.getElementById("myProjectModal");
  const myModalClose = document.querySelector(".my-modal-close");

  function openModal(content) {
    myModal.style.display = "block";
    const modalInnerContent = myModal.querySelector(".my-modal-inner-content");
    modalInnerContent.innerHTML = content;
    setTimeout(() => {
      myModal.classList.add("show");
    }, 10);
  }

  function closeModal() {
    myModal.classList.remove("show");
    setTimeout(() => {
      myModal.style.display = "none";
    }, 500);
  }

  myModal.addEventListener("click", (e) => {
    if (e.target === myModal) {
      closeModal();
    }
  });

  myCarouselItems.forEach((item) => {
    item.addEventListener("click", () => {
      const projectId = item.getAttribute("data-project");
      let content = "";

      switch (projectId) {
        case "1":
          content = `
            <div class="modal-project">
              <div class="modal-project-top">
                <div class="site-about">
                  <h1> Montaż Demontaż Reklam Warszawa</h1>
                  <p>Prezentujemy stronę wykonaną dla firmy specjalizującej się w montażu i demontażu reklam w Warszawie. Strona oparta na HTML, CSS i JavaScript umożliwia klientowi łatwą aktualizację i edytowanie treści, gwarantując nowoczesny design oraz intuicyjną obsługę.</p>
                   <div class="teh-portfolio">
                  <img class="portfolio-teh-icon"  src="/images/services/html_5.svg" alt="HTML">
                  <img class="portfolio-teh-icon" src="/images/services/css_3.svg" alt="CSS">
                  <img class="portfolio-teh-icon" src="/images/services/js.svg" alt="JavaScript">
               </div>
                  </div>
                
                <img class="portfolio-icon" src="./images/portfolio/OL-SERV.svg" alt="Ol Servis">
              </div>
              <div class="modal-project-bottom">
                <div class="modal-project-images">
                  <div class="modal-image-block">
                    <img src="./images/portfolio/olservis.com.pl.png" alt="Image 1">
                  </div>
                </div>
            </div>
          `;
          break;
        case "2":
          content = `
     <div class="modal-project">
  <div class="modal-project-top">
    <div class="site-about">
      <h1>Responsive Admin Dashboard</h1>
      <p>This project showcases a modern, fully responsive admin dashboard designed to simplify data management and analytics. Built with HTML, CSS, and JavaScript, it allows easy customization, real-time updates, and intuitive navigation. The clean interface and well-structured layout ensure a user-friendly experience for administrators.</p>
      <div class="teh-portfolio">
        <img class="portfolio-teh-icon" src="/images/services/html_5.svg" alt="HTML">
        <img class="portfolio-teh-icon" src="/images/services/css_3.svg" alt="CSS">
        <img class="portfolio-teh-icon" src="/images/services/js.svg" alt="JavaScript">
      </div>
    </div>
    <img class="portfolio-icon" src="./images/portfolio/dashboard.svg" alt="Admin Dashboard">
  </div>
  <div class="modal-project-bottom">
    <div class="modal-project-images">
      <div class="modal-image-block">
        <img src="./images/portfolio/dashb.png" alt="Dashboard Screenshot">
      </div>
    </div>
  </div>
</div>

        `;
        break;
        case "3":
          content = `
            <div class="modal-project">
              <div class="modal-project-top">
                <img src="images/kuho-devices.webp" alt="Kuho">
              </div>
              <div class="modal-project-bottom">
                <div class="modal-project-images">
                  <div class="modal-image-block">
                    <img src="images/kuho-devices.webp" alt="Image 1">
                  </div>
                  <div class="modal-image-block">
                    <img src="images/kuho-devices.webp" alt="Image 2">
                  </div>
                  <div class="modal-image-block">
                    <img src="images/kuho-devices.webp" alt="Image 3">
                  </div>
                </div>
                <div class="modal-project-description">
                  <p>Описание проекта Kuho. Serwis blacharsko-lakierniczy.</p>
                </div>
              </div>
            </div>
          `;
          break;
        default:
          content = `<h1>Проект ${projectId}</h1><p>Описание не найдено.</p>`;
      }

      openModal(content);
    });
  });

  if (myModalClose) {
    myModalClose.addEventListener("click", closeModal);
  }

  window.addEventListener("resize", () => {
    updateCarouselRadius();
    positionCarouselItems();
  });
});
