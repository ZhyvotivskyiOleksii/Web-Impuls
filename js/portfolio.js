document.addEventListener("DOMContentLoaded", function () {
  const myCarouselItems = document.querySelectorAll(".my-carousel-item");
  const totalItems = myCarouselItems.length;
  const angleIncrement = 360 / totalItems;
  let rotationAngle = 0;

  // ----------------------------
  // ОТРИМАТИ РАДІУС ЗАЛЕЖНО ВІД ШИРИНИ ЕКРАНУ
  // ----------------------------
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
    document.documentElement.style.setProperty("--carousel-radius", getCarouselRadius());
  }
  updateCarouselRadius();

  // ----------------------------
  // РОЗСТАВИТИ ЕЛЕМЕНТИ ПО КОЛУ
  // ----------------------------
  function positionCarouselItems() {
    const radius = getCarouselRadius();
    myCarouselItems.forEach((item, index) => {
      const angle = index * angleIncrement;
      item.style.transform = "rotateY(" + angle + "deg) translateZ(" + radius + ")";
    });
    updateCarousel();
  }

  // ----------------------------
  // ОНОВИТИ СТАН КАРУСЕЛІ
  // ----------------------------
  function updateCarousel() {
    const carouselTrack = document.querySelector(".my-carousel-items");
    carouselTrack.style.transform = "rotateY(" + -rotationAngle + "deg)";

    // Знайти активний елемент
    let activeIndex = Math.round(rotationAngle / angleIncrement) % totalItems;
    if (activeIndex < 0) activeIndex += totalItems;

    myCarouselItems.forEach((item, idx) => {
      item.classList.toggle("active", idx === activeIndex);
    });
  }

  // Ініціалізація позицій елементів
  positionCarouselItems();

  // ----------------------------
  // КНОПКИ ПЕРЕЛІСТУ (ВПЕРЕД / НАЗАД)
  // ----------------------------
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

  // ----------------------------
  // SWIPE / DRAG (POINTER + TOUCH EVENTS) + "Клік" для модалки
  // ----------------------------
  const carouselTrack = document.querySelector(".my-carousel-items");
  let isPointerDown = false;
  let startX = 0;
  let moved = false;       // Чи було перетягування/свайп
  let pressedItem = null;  // Елемент, по якому клікнули

  function handleStart(e) {
    isPointerDown = true;
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    moved = false;
    pressedItem = e.target.closest(".my-carousel-item") || null;
    // Якщо pointer event – встановлюємо захоплення
    if (e.type === "pointerdown") {
      carouselTrack.setPointerCapture(e.pointerId);
    }
  }

  function handleMove(e) {
    if (!isPointerDown) return;
    let currentX = e.touches ? e.touches[0].clientX : e.clientX;
    const deltaX = currentX - startX;
    if (Math.abs(deltaX) > 5) {
      moved = true;
    }
    rotationAngle -= deltaX * 0.5; // 0.5 – коефіцієнт чутливості
    updateCarousel();
    startX = currentX;
    // Якщо це touch event, забороняємо стандартний прокрут
    if (e.touches) e.preventDefault();
  }

  function handleEnd(e) {
    isPointerDown = false;
    snapToNearest();
    if (!moved && pressedItem) {
      openProjectModal(pressedItem);
    }
  }

  function snapToNearest() {
    let nearest = Math.round(rotationAngle / angleIncrement) * angleIncrement;
    rotationAngle = nearest;
    updateCarousel();
  }

  // Прикріплюємо pointer events
  carouselTrack.addEventListener("pointerdown", handleStart);
  carouselTrack.addEventListener("pointermove", handleMove);
  carouselTrack.addEventListener("pointerup", handleEnd);
  carouselTrack.addEventListener("pointerleave", handleEnd);

  // Прикріплюємо touch events для пристроїв, що їх підтримують
  carouselTrack.addEventListener("touchstart", handleStart, { passive: false });
  carouselTrack.addEventListener("touchmove", handleMove, { passive: false });
  carouselTrack.addEventListener("touchend", handleEnd);

  // ----------------------------
  // МОДАЛЬНЕ ВІКНО
  // ----------------------------
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

  if (myModalClose) {
    myModalClose.addEventListener("click", closeModal);
  }

  // ----------------------------
  // ВІДКРИВАТИ МОДАЛКУ ДЛЯ КОНКРЕТНОГО ЕЛЕМЕНТА
  // ----------------------------
  function openProjectModal(item) {
    const projectId = item.getAttribute("data-project");
    let content = "";

    switch (projectId) {
      case "1":
        content = `
          <div class="modal-project">
            <div class="modal-project-top">
              <div class="site-about">
                <h1>Design Business Unity</h1>
                <p>Design Business Unity — об’єднання українського бізнесу...</p>
                <div class="teh-portfolio">
                  <img class="portfolio-teh-icon" src="/images/services/html_5.svg" alt="HTML">
                  <img class="portfolio-teh-icon" src="/images/services/css_3.svg" alt="CSS">
                  <img class="portfolio-teh-icon" src="/images/services/js.svg" alt="JS">
                </div>
              </div>
              <img class="portfolio-icon" src="./images/portfolio/Mockup1.svg" alt="Ol Servis">
            </div>
            <div class="modal-project-bottom">
              <div class="modal-project-images">
                <div class="modal-image-block">
                  <img src="./images/portfolio/Desktop_DBU.png" alt="Image 1">
                </div>
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
                <h1>Norway</h1>
                <div class="teh-portfolio">
                  <img class="portfolio-teh-icon" src="/images/services/html_5.svg" alt="HTML">
                  <img class="portfolio-teh-icon" src="/images/services/css_3.svg" alt="CSS">
                  <img class="portfolio-teh-icon" src="/images/services/js.svg" alt="JavaScript">
                </div>
              </div>
              <img class="portfolio-icon" src="./images/portfolio/Mockup2.svg" alt="Admin Dashboard">
            </div>
            <div class="modal-project-bottom">
              <div class="modal-project-images">
                <div class="modal-image-block">
                  <img src="./images/portfolio/Desktop_Norway.png" alt="Dashboard Screenshot">
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
              <div class="site-about">
                <h1>Beauty Salon</h1>
                <p>Салон красоты для настоящих ценителей ухода и стиля.</p>
                <div class="teh-portfolio">
                  <img class="portfolio-teh-icon" src="/images/services/html_5.svg" alt="HTML">
                  <img class="portfolio-teh-icon" src="/images/services/css_3.svg" alt="CSS">
                  <img class="portfolio-teh-icon" src="/images/services/js.svg" alt="JavaScript">
                </div>
              </div>
              <img class="portfolio-icon" src="./images/portfolio/Mockup3.svg" alt="Beauty Salon">
            </div>
            <div class="modal-project-bottom">
              <div class="modal-project-images">
                <div class="modal-image-block">
                  <img src="./images/portfolio/Beauty-Salon.png" alt="Beauty Salon">
                </div>
              </div>
            </div>
          </div>
        `;
        break;

      case "4":
        content = `
          <div class="modal-project">
            <div class="modal-project-top">
              <div class="site-about">
                <h1>ELITE AUTO</h1>
                <p>Выберите свою мечту прямо сейчас!</p>
                <div class="teh-portfolio">
                  <img class="portfolio-teh-icon" src="/images/services/html_5.svg" alt="HTML">
                  <img class="portfolio-teh-icon" src="/images/services/css_3.svg" alt="CSS">
                  <img class="portfolio-teh-icon" src="/images/services/js.svg" alt="JavaScript">
                </div>
              </div>
              <img class="portfolio-icon" src="./images/portfolio/Mockup4.svg" alt="ELITE AUTO">
            </div>
            <div class="modal-project-bottom">
              <div class="modal-project-images">
                <div class="modal-image-block">
                  <img src="./images/portfolio/Desktop_Car.png" alt="ELITE AUTO">
                </div>
              </div>
            </div>
          </div>
        `;
        break;

      case "5":
        content = `
          <div class="modal-project">
            <div class="modal-project-top">
              <div class="site-about">
                <h1>CRYPTO-VISTA</h1>
                <p>Trade, Invest, and Earn – All in One Crypto Ecosystem!</p>
                <div class="teh-portfolio">
                  <img class="portfolio-teh-icon" src="/images/services/html_5.svg" alt="HTML">
                  <img class="portfolio-teh-icon" src="/images/services/css_3.svg" alt="CSS">
                  <img class="portfolio-teh-icon" src="/images/services/js.svg" alt="JavaScript">
                </div>
              </div>
              <img class="portfolio-icon" src="./images/portfolio/Mockup5.png" alt="CRYPTO-VISTA">
            </div>
            <div class="modal-project-bottom">
              <div class="modal-project-images">
                <div class="modal-image-block">
                  <img src="./images/portfolio/Desktop_Crypto.png" alt="CRYPTO-VISTA">
                </div>
              </div>
            </div>
          </div>
        `;
        break;

      case "6":
        content = `
          <div class="modal-project">
            <div class="modal-project-top">
              <div class="site-about">
                <h1>EduFlow</h1>
                <p>Rozpocznij swoją podróż edukacyjną онлайн.</p>
                <div class="teh-portfolio">
                  <img class="portfolio-teh-icon" src="/images/services/html_5.svg" alt="HTML">
                  <img class="portfolio-teh-icon" src="/images/services/css_3.svg" alt="CSS">
                  <img class="portfolio-teh-icon" src="/images/services/js.svg" alt="JavaScript">
                </div>
              </div>
              <img class="portfolio-icon" src="./images/portfolio/Mockup6.png" alt="EduFlow">
            </div>
            <div class="modal-project-bottom">
              <div class="modal-project-images">
                <div class="modal-image-block">
                  <img src="./images/portfolio/Desktop_Learn.png" alt="EduFlow">
                </div>
              </div>
            </div>
          </div>
        `;
        break;

      case "7":
        content = `
          <div class="modal-project">
            <div class="modal-project-top">
              <div class="site-about">
                <h1>Barber</h1>
                <p>Where Grooming Meets Style - Your Path to Timeless Elegance!</p>
                <div class="teh-portfolio">
                  <img class="portfolio-teh-icon" src="/images/services/html_5.svg" alt="HTML">
                  <img class="portfolio-teh-icon" src="/images/services/css_3.svg" alt="CSS">
                  <img class="portfolio-teh-icon" src="/images/services/js.svg" alt="JavaScript">
                </div>
              </div>
              <img class="portfolio-icon" src="./images/portfolio/Mockup7.png" alt="Barber">
            </div>
            <div class="modal-project-bottom">
              <div class="modal-project-images">
                <div class="modal-image-block">
                  <img src="./images/portfolio/1440.png" alt="Barber">
                </div>
              </div>
            </div>
          </div>
        `;
        break;

      case "8":
        content = `
          <div class="modal-project">
            <div class="modal-project-top">
              <div class="site-about">
                <h1>India Cafe</h1>
                <p>The spot for authentic cuisine and great customer service.</p>
                <div class="teh-portfolio">
                  <img class="portfolio-teh-icon" src="/images/services/html_5.svg" alt="HTML">
                  <img class="portfolio-teh-icon" src="/images/services/css_3.svg" alt="CSS">
                  <img class="portfolio-teh-icon" src="/images/services/js.svg" alt="JavaScript">
                </div>
              </div>
              <img class="portfolio-icon" src="./images/portfolio/Mockup8.png" alt="India Cafe">
            </div>
            <div class="modal-project-bottom">
              <div class="modal-project-images">
                <div class="modal-image-block">
                  <img src="./images/portfolio/Desctop_MainPage.png" alt="India Cafe">
                </div>
              </div>
            </div>
          </div>
        `;
        break;

      case "9":
        content = `
          <div class="modal-project">
            <div class="modal-project-top">
              <div class="site-about">
                <h1>Barber</h1>
                <p>Ми зробимо так, щоб ви завжди виглядали гарно та стильно!</p>
                <div class="teh-portfolio">
                  <img class="portfolio-teh-icon" src="/images/services/html_5.svg" alt="HTML">
                  <img class="portfolio-teh-icon" src="/images/services/css_3.svg" alt="CSS">
                  <img class="portfolio-teh-icon" src="/images/services/js.svg" alt="JavaScript">
                </div>
              </div>
              <img class="portfolio-icon" src="./images/portfolio/Mockup9.png" alt="Barber">
            </div>
            <div class="modal-project-bottom">
              <div class="modal-project-images">
                <div class="modal-image-block">
                  <img src="./images/portfolio/desctop-2variant.png" alt="Barber">
                </div>
              </div>
            </div>
          </div>
        `;
        break;

      case "10":
        content = `
          <div class="modal-project">
            <div class="modal-project-top">
              <div class="site-about">
                <h1>Admin Panel</h1>
                <p></p>
                <div class="teh-portfolio">
                  <img class="portfolio-teh-icon" src="/images/services/html_5.svg" alt="HTML">
                  <img class="portfolio-teh-icon" src="/images/services/css_3.svg" alt="CSS">
                  <img class="portfolio-teh-icon" src="/images/services/js.svg" alt="JavaScript">
                </div>
              </div>
              <img class="portfolio-icon" src="./images/portfolio/dashbord.webp" alt="admin">
            </div>
            <div class="modal-project-bottom">
              <div class="modal-project-images">
                <div class="modal-image-block">
                  <img src="./images/portfolio/dashb.png" alt="admin">
                </div>
              </div>
            </div>
          </div>
        `;
        break;
    }

    openModal(content);
  }

  // ----------------------------
  // ОНОВЛЕННЯ ПРИ РЕСАЙЗІ
  // ----------------------------
  window.addEventListener("resize", () => {
    updateCarouselRadius();
    positionCarouselItems();
  });
});
