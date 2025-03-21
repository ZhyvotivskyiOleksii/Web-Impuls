document.addEventListener('DOMContentLoaded', function() {
    const myCarouselItems = document.querySelectorAll('.my-carousel-item');
    const totalItems = myCarouselItems.length;
    const angleIncrement = 360 / totalItems;
    let rotationAngle = 0;
    function getCarouselRadius() {
      return window.innerWidth > 768
        ? getComputedStyle(document.documentElement).getPropertyValue('--carousel-radius-desktop').trim()
        : getComputedStyle(document.documentElement).getPropertyValue('--carousel-radius-mobile').trim();
    }
    function updateCarouselRadius() {
      document.documentElement.style.setProperty('--carousel-radius', getCarouselRadius());
    }
    updateCarouselRadius();
    function positionCarouselItems() {
      const radius = getCarouselRadius();
      myCarouselItems.forEach((item, index) => {
        const angle = index * angleIncrement;
        item.style.transform = 'rotateY(' + angle + 'deg) translateZ(' + radius + ')';
      });
      updateCarousel();
    }
    function updateCarousel() {
      const carouselTrack = document.querySelector('.my-carousel-items');
      carouselTrack.style.transform = 'rotateY(' + -rotationAngle + 'deg)';
      let activeIndex = Math.round(rotationAngle / angleIncrement) % totalItems;
      if (activeIndex < 0) activeIndex += totalItems;
      myCarouselItems.forEach((item, idx) => {
        item.classList.toggle('active', idx === activeIndex);
      });
    }
    positionCarouselItems();
    const nextBtn = document.querySelector('.my-carousel-nav.my-next');
    const prevBtn = document.querySelector('.my-carousel-nav.my-prev');
    if (nextBtn && prevBtn) {
      nextBtn.addEventListener('click', () => {
        rotationAngle += angleIncrement;
        updateCarousel();
      });
      prevBtn.addEventListener('click', () => {
        rotationAngle -= angleIncrement;
        updateCarousel();
      });
    }
    const myModal = document.getElementById('myProjectModal');
    const myModalClose = document.querySelector('.my-modal-close');
    myCarouselItems.forEach(item => {
      item.addEventListener('click', () => {
        myModal.style.display = 'block';
      });
    });
    if (myModalClose) {
      myModalClose.addEventListener('click', () => {
        myModal.style.display = 'none';
      });
    }
    window.addEventListener('resize', () => {
      updateCarouselRadius();
      positionCarouselItems();
    });
  });
  