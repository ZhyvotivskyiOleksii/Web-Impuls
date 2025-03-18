document.addEventListener("DOMContentLoaded", () => {
  const modals = document.querySelectorAll(".unique-modal");
  const infoIcons = document.querySelectorAll(".info-icon");
  const closeButtons = document.querySelectorAll(".close");

  // Open modal on info icon click
  infoIcons.forEach((icon) => {
    icon.addEventListener("click", () => {
      const modalId = icon.getAttribute("data-modal");
      const modal = document.querySelector(`.${modalId}`);
      if (modal) {
        modal.classList.add("show");
      }
    });
  });

  // Close modal on close button click
  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const modal = button.closest(".unique-modal");
      if (modal) {
        modal.classList.remove("show");
      }
    });
  });

  // Close modal on outside click
  modals.forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.classList.remove("show");
      }
    });
  });
});
