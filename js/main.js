document.addEventListener("DOMContentLoaded", () => {
  fetch("components/header.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("header-placeholder").innerHTML = data;


      initializeBurgerMenu();
      initializeThemeToggle();
      initializeLanguageSelect();

      const savedLanguage = localStorage.getItem("selectedLanguage") || getDefaultLanguage();
      applyLanguage(savedLanguage);
      updateSelectedLanguageDisplay(savedLanguage);

      const savedTheme = localStorage.getItem("theme") || getDefaultTheme();
      applyTheme(savedTheme);

      if (typeof updateServicesLanguage === "function") {
        updateServicesLanguage();
      }
    });

  fetch("components/footer.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("footer-placeholder").innerHTML = data;
    });

  function getDefaultLanguage() {
    const userLang = navigator.language || navigator.userLanguage;
    if (userLang.startsWith("uk")) return "ua";
    if (userLang.startsWith("pl")) return "pl";
    if (userLang.startsWith("ru")) return "ru";
    return "en";
  }

  function getDefaultTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function initializeThemeToggle() {
    document.querySelectorAll(".theme-toggle").forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const currentTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";
        applyTheme(currentTheme);
      });
    });
  }

  function applyTheme(theme) {
    const isDarkMode = theme === "dark";
    document.body.classList.toggle("dark-mode", isDarkMode);
    localStorage.setItem("theme", theme);

    document.querySelectorAll(".theme-toggle").forEach((toggle) => {
      toggle.classList.toggle("dark", isDarkMode);
    });
  }

  function initializeBurgerMenu() {
    const burgerIcon = document.getElementById("burger-icon");
    const closeIcon = document.getElementById("close-icon");
    const mobileMenu = document.getElementById("mobile-menu");
    const overlay = document.getElementById("overlay");

    if (burgerIcon && closeIcon && mobileMenu && overlay) {
      burgerIcon.addEventListener("click", () => {
        mobileMenu.classList.add("open");
        overlay.classList.add("open");
        burgerIcon.style.display = "none";
        closeIcon.style.display = "block";

        // Отключаем прокрутку страницы
        document.documentElement.classList.add("no-scroll");
        document.body.classList.add("no-scroll");
      });

      closeIcon.addEventListener("click", closeMenu);
      overlay.addEventListener("click", closeMenu);

      function closeMenu() {
        mobileMenu.classList.remove("open");
        overlay.classList.remove("open");
        burgerIcon.style.display = "block";
        closeIcon.style.display = "none";

        // Включаем прокрутку страницы
        document.documentElement.classList.remove("no-scroll");
        document.body.classList.remove("no-scroll");
      }
    }
  }

  function initializeLanguageSelect() {
    document.querySelectorAll(".language-select").forEach((selector) => {
      selector.addEventListener("click", (event) => {
        event.stopPropagation();
        document.querySelectorAll(".language-select").forEach((el) => el.classList.remove("open"));
        selector.classList.toggle("open");
      });
    });

    document.querySelectorAll(".dropdown-option").forEach((option) => {
      option.addEventListener("click", (event) => {
        event.stopPropagation();
        const lang = option.dataset.lang;
        applyLanguage(lang);
        closeLanguageDropdowns();
      });
    });

    document.addEventListener("click", closeLanguageDropdowns);

    function closeLanguageDropdowns() {
      document.querySelectorAll(".language-select").forEach((selector) => {
        selector.classList.remove("open");
      });
    }
  }

  function applyLanguage(lang) {
    localStorage.setItem("selectedLanguage", lang);
    updateContent(lang);
    updateSelectedLanguageDisplay(lang);

    if (typeof updateServicesLanguage === "function") {
      updateServicesLanguage();
    }
  }

  function updateContent(lang) {
    document.querySelectorAll("[data-translate-key]").forEach((element) => {
      const key = element.getAttribute("data-translate-key");
      const translation = translations?.[lang]?.[key];

      if (!translation) return;

      const tagName = element.tagName.toLowerCase();
      if (tagName === "img") {
        element.alt = translation;
      } else if ((tagName === "input" || tagName === "textarea") && element.hasAttribute("placeholder")) {
        element.placeholder = translation;
      } else {
        element.textContent = translation;
      }
    });

    document.querySelectorAll("[data-translate-key-title]").forEach((element) => {
      const key = element.getAttribute("data-translate-key-title");
      const translation = translations?.[lang]?.[key];
      if (translation) {
        element.setAttribute("data-title", translation);
      }
    });

    document.querySelectorAll("[data-translate-key-content]").forEach((element) => {
      const key = element.getAttribute("data-translate-key-content");
      const translation = translations?.[lang]?.[key];
      if (translation) {
        element.setAttribute("data-content", translation);
      }
    });
  }

  function updateSelectedLanguageDisplay(lang) {
    document.querySelectorAll(".selected-language").forEach((span) => {
      span.textContent = lang.toUpperCase();
    });
    document.querySelectorAll(".selected-language-flag").forEach((img) => {
      img.src = `/images/swg/${lang}.png`;
      img.alt = `${lang.toUpperCase()} Flag`;
    });
  }
});





