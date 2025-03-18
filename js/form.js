document.addEventListener("DOMContentLoaded", function () {
  const selectedOption = document.getElementById("selected-option");
  const optionsList = document.getElementById("options-list");
  const selectedFlag = document.getElementById("selected-flag");
  const selectedCode = document.getElementById("selected-code");
  const contactForm = document.getElementById("contact-form");

  const countries = [
    { code: "+1", flag: "🇺🇸", name: "United States" },
    { code: "+380", flag: "🇺🇦", name: "Ukraine" },
    { code: "+48", flag: "🇵🇱", name: "Poland" },
    { code: "+49", flag: "🇩🇪", name: "Germany" },
    { code: "+33", flag: "🇫🇷", name: "France" },
    { code: "+39", flag: "🇮🇹", name: "Italy" },
  ];

  function populateCountryList() {
    countries.forEach((country) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span>${country.flag}</span>
        <span>${country.code}</span>
      `;
      li.addEventListener("click", () => setSelectedCountry(country));
      if (country.code === "+380") li.classList.add("selected");
      optionsList.appendChild(li);
    });
  }

  function setSelectedCountry(country) {
    selectedFlag.textContent = country.flag;
    selectedCode.textContent = country.code;
    document.querySelectorAll("#options-list li").forEach((item) => item.classList.remove("selected"));
    const listItem = Array.from(optionsList.children).find((li) => li.innerText.includes(country.code));
    if (listItem) listItem.classList.add("selected");
    optionsList.style.display = "none";
  }

  function detectCountryByIP() {
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        const userCountry = countries.find((c) => c.name === data.country_name);
        if (userCountry) setSelectedCountry(userCountry);
      })
      .catch((err) => console.warn("Не удалось определить страну пользователя", err));
  }

  selectedOption.addEventListener("click", () => {
    const isOpen = optionsList.style.display === "block";
    optionsList.style.display = isOpen ? "none" : "block";
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".custom-select")) {
      optionsList.style.display = "none";
    }
  });

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const emailField = contactForm.querySelector("[name='email']");
    const phoneField = contactForm.querySelector("[name='phone']");
    const nameField = contactForm.querySelector("[name='name']");
    const messageField = contactForm.querySelector("[name='message']");
    const email = emailField.value.trim();
    const phone = phoneField.value.trim();
    const name = nameField.value.trim();
    const message = messageField.value.trim();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[0-9\s\-\+]{7,}$/;

    let valid = true;

    if (!emailPattern.test(email)) {
      emailField.style.border = "2px solid red";
    } else {
      emailField.style.border = "";
    }

    if (!phonePattern.test(phone)) {
      phoneField.style.border = "2px solid red";
    } else {
      phoneField.style.border = "";
    }

    if (!name) {
      nameField.style.border = "2px solid red";
      valid = false;
    } else {
      nameField.style.border = "";
    }

    if (!message) {
      messageField.style.border = "2px solid red";
      valid = false;
    } else {
      messageField.style.border = "";
    }

    if (emailPattern.test(email) && phonePattern.test(phone) && name && message) {
      const successOverlay = document.getElementById("success-overlay");
      successOverlay.classList.add("show");
      setTimeout(() => successOverlay.classList.remove("show"), 3000);
      contactForm.reset();
      setSelectedCountry(countries.find((c) => c.code === "+380"));
    }
  });

  populateCountryList();
  detectCountryByIP();
});
