document.addEventListener("DOMContentLoaded", () => {
  const modalOverlay = document.getElementById("modal-overlay");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const modalForm = document.getElementById("modal-form");
  const successOverlay = document.getElementById("success-overlay");
  const contactForm = document.getElementById("contact-form");

  const openModalElements = document.querySelectorAll(".open-modal");
  const submitOrderButton = document.getElementById("submit-order");
  const fixedSubmitOrderButton = document.getElementById("fixed-submit-order");

  // === Функция для открытия модального окна ===
  function openModal() {
    if (modalOverlay) {
      modalOverlay.classList.add("show");
    }
  }

  // === Функция для закрытия модального окна ===
  function closeModal() {
    if (modalOverlay) {
      modalOverlay.classList.remove("show");
    }
  }

  // === Обработчик кнопок для открытия модального окна ===
  openModalElements.forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    });
  });

  if (submitOrderButton) {
    submitOrderButton.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    });
  }

  if (fixedSubmitOrderButton) {
    fixedSubmitOrderButton.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    });
  }

  // === Закрытие модального окна при клике на кнопку закрытия ===
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", closeModal);
  }

  // === Закрытие модального окна при клике вне его области ===
  if (modalOverlay) {
    modalOverlay.addEventListener("click", (event) => {
      if (event.target === modalOverlay) {
        closeModal();
      }
    });
  }

  // === Отображение успешного сообщения ===
  function showSuccess() {
    successOverlay.classList.add("show");
    setTimeout(() => successOverlay.classList.remove("show"), 3000);
  }

  // === Валидация и отправка формы ===
  function handleFormSubmit(form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const emailField = form.querySelector("[name='email']");
      const phoneField = form.querySelector("[name='phone']");
      const email = emailField.value.trim();
      const phone = phoneField.value.trim();

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phonePattern = /^[0-9\s\-\+]{7,}$/;

      let valid = true;

      if (!emailPattern.test(email)) {
        emailField.style.border = "2px solid red";
        valid = false;
      } else {
        emailField.style.border = "";
      }

      if (!phonePattern.test(phone)) {
        phoneField.style.border = "2px solid red";
        valid = false;
      } else {
        phoneField.style.border = "";
      }

      if (valid) {
        const submitButton = form.querySelector("button[type='submit']");
        submitButton.disabled = true;
        submitButton.textContent = "Отправка...";

        fetch("send_form.php", {
          method: "POST",
          body: new FormData(form),
        })
          .then((response) => response.text())
          .then((data) => {
            if (data.includes("успешно") || data.includes("success")) {
              showSuccess();
              form.reset();
            }
          })
          .catch((err) => console.error("Ошибка:", err))
          .finally(() => {
            submitButton.disabled = false;
            submitButton.textContent = "Отправить";
            if (form === modalForm) {
              closeModal();
            }
          });
      }
    });
  }

  if (modalForm) handleFormSubmit(modalForm);
  if (contactForm) handleFormSubmit(contactForm);
});
