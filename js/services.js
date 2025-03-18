// Оновлюваний список послуг
let services = [];

// Функція для оновлення списку послуг на основі вибраної мови
function updateServicesLanguage() {
  const selectedLanguage = localStorage.getItem('selectedLanguage') || 'ua';
  services = [
    { 
      title: translations[selectedLanguage]?.service1_title || "Розробка сайтів", 
      description: translations[selectedLanguage]?.service1_description || "Опис послуги.", 
      icon: "/images/services/Monitoring.png" 
    },
    { 
      title: translations[selectedLanguage]?.service2_title || "Вебдизайн", 
      description: translations[selectedLanguage]?.service2_description || "Опис послуги.", 
      icon: "/images/services/Group.png" 
    },
    { 
      title: translations[selectedLanguage]?.service3_title || "Мобільні додатки", 
      description: translations[selectedLanguage]?.service3_description || "Опис послуги.", 
      icon: "/images/services/Mobile.png" 
    },
    { 
      title: translations[selectedLanguage]?.service4_title || "Графіка", 
      description: translations[selectedLanguage]?.service4_description || "Опис послуги.", 
      icon: "/images/services/Id.png" 
    },
    { 
      title: translations[selectedLanguage]?.service5_title || "Маркетинг", 
      description: translations[selectedLanguage]?.service5_description || "Опис послуги.", 
      icon: "/images/services/Pie-Chart.png" 
    },
    { 
      title: translations[selectedLanguage]?.service6_title || "Аналіз даних", 
      description: translations[selectedLanguage]?.service6_description || "Опис послуги.", 
      icon: "/images/services/Graph.png" 
    },
    { 
      title: translations[selectedLanguage]?.service7_title || "Платіжні системи", 
      description: translations[selectedLanguage]?.service7_description || "Опис послуги.", 
      icon: "/images/services/Cards.png" 
    },
    { 
      title: translations[selectedLanguage]?.service8_title || "Мережа", 
      description: translations[selectedLanguage]?.service8_description || "Опис послуги.", 
      icon: "/images/services/Global.png" 
    }
  ];
  updateSlider(); // Оновлюємо карусель після зміни мови
}

// Ініціалізація змінних
let currentIndex = 0;

const mainTitle = document.getElementById('main-title');
const mainDesc = document.getElementById('main-desc');
const mainIcon = document.getElementById('main-icon');

const sideCard1 = document.getElementById('side-card-1');
const sideTitle1 = document.getElementById('side-title-1');
const sideIcon1 = document.getElementById('side-icon-1');

const sideCard2 = document.getElementById('side-card-2');
const sideTitle2 = document.getElementById('side-title-2');
const sideIcon2 = document.getElementById('side-icon-2');

const dotsContainer = document.getElementById('dots');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

function renderDots() {
  dotsContainer.innerHTML = '';
  services.forEach((_, index) => {
    const dot = document.createElement('span');
    dot.className = 'dot';
    dot.addEventListener('click', () => setSlide(index));
    dotsContainer.appendChild(dot);
  });
}

function updateMainCard() {
  const current = services[currentIndex];
  mainTitle.textContent = current.title;
  mainDesc.textContent = current.description;
  mainIcon.src = current.icon;
}

// Використовуємо модульну арифметику для безкінечної каруселі
function updateSideCards() {
  const idx1 = (currentIndex + 1) % services.length;
  const idx2 = (currentIndex + 2) % services.length;

  const s1 = services[idx1];
  const s2 = services[idx2];

  sideTitle1.textContent = s1.title;
  sideIcon1.src = s1.icon;

  sideTitle2.textContent = s2.title;
  sideIcon2.src = s2.icon;

  // Клік по бічних картках міняє активну послугу
  sideCard1.onclick = () => {
    currentIndex = idx1;
    updateSlider();
  };

  sideCard2.onclick = () => {
    currentIndex = idx2;
    updateSlider();
  };
}

function updateDots() {
  const allDots = dotsContainer.querySelectorAll('.dot');
  allDots.forEach(dot => dot.classList.remove('active'));
  if (allDots[currentIndex]) {
    allDots[currentIndex].classList.add('active');
  }
}

function updateButtons() {
  prevBtn.disabled = false;
  nextBtn.disabled = false;
}

function updateSlider() {
  updateMainCard();
  updateSideCards();
  updateDots();
  updateButtons();
}

function nextSlide() {
  currentIndex = (currentIndex + 1) % services.length;
  updateSlider();
}

function prevSlide() {
  currentIndex = (currentIndex - 1 + services.length) % services.length;
  updateSlider();
}

function setSlide(index) {
  currentIndex = index % services.length;
  updateSlider();
}

// Ініціалізація
document.addEventListener('DOMContentLoaded', () => {
  updateServicesLanguage(); // Завантажуємо мову при старті
  renderDots();
  updateSlider();
});

prevBtn.addEventListener('click', prevSlide);
nextBtn.addEventListener('click', nextSlide);




