document.addEventListener("DOMContentLoaded", () => {
    const serviceList = document.getElementById("service-list");
    const additionalServiceList = document.getElementById("additional-service-list");
    const totalPriceElement = document.getElementById("total-price");
    const fixedTotalPriceElement = document.getElementById("fixed-total-price");
    const fixedSubmitOrderButton = document.getElementById("fixed-submit-order");
    const selectedServicesContainer = document.getElementById("selected-services");
    const selectedAdditionalServicesContainer = document.getElementById("selected-additional-services");
    const privateButton = document.getElementById("private-person");
    const companyButton = document.getElementById("company");
    const checkButton = document.getElementById("check-domain");
    const domainInput = document.getElementById("domain");
    const domainStatus = document.getElementById("domain-status");
    const promoCodeInput = document.getElementById("promo-code-input");
    const applyPromoButton = document.getElementById("apply-promo");

    let totalPrice = 0; 
    let isCompany = false; 
    let promoApplied = false;

    const currentLang = localStorage.getItem("selectedLanguage") || "ua";

    // === Отримати переклад ===
    function getTranslation(key) {
        return translations?.[currentLang]?.[key] || key;
    }

    // === Перевірка домену ===
    checkButton.addEventListener("click", async () => {
        const domain = domainInput.value.trim();
        if (!domain) {
            domainStatus.textContent = "Введите домен для проверки!";
            domainStatus.style.color = "red";
            return;
        }

        domainStatus.textContent = "Examination...";
        domainStatus.style.color = "blue";

        try {
            const response = await fetch(
                `https://domain-availability.whoisxmlapi.com/api/v1?apiKey=at_qB1wIKvR8lgdJjszuIJFjRGkQ1OY9&domainName=${domain}`
            );
            const data = await response.json();
            domainStatus.textContent = data.DomainInfo?.domainAvailability === "AVAILABLE" 
                ? "The domain is free!" 
                : "The domain is registered.";
            domainStatus.style.color = data.DomainInfo?.domainAvailability === "AVAILABLE" ? "green" : "red";
        } catch (error) {
            domainStatus.textContent = "Ошибка при подключении к API!";
            domainStatus.style.color = "red";
        }
    });

    applyPromoButton.addEventListener("click", () => {
        const promoCode = promoCodeInput.value.trim();
        const promoMessage = document.getElementById("promo-code-message");
      
        if (promoCode === "DISCOUNT10") {
          promoApplied = true;
          promoMessage.textContent = "-10% discount successfully collected!";
          promoMessage.classList.remove("error");
          promoMessage.style.display = "block";
        } else {
          promoApplied = false;
          promoMessage.textContent = "Невірний промокод!";
          promoMessage.classList.add("error");
          promoMessage.style.display = "block";
        }
      
        updateTotalPrice();
    });

    // === Оновлення загальної ціни ===
    function updateTotalPrice() {
        let finalPrice = totalPrice;
        if (isCompany) finalPrice *= 1.23;
        if (promoApplied) finalPrice *= 0.9;

        totalPriceElement.textContent = finalPrice.toFixed(2);
        fixedTotalPriceElement.textContent = finalPrice.toFixed(2);
    }

    // === Додавання/видалення послуг ===
    function toggleService(serviceElement, isAdditional = false) {
        const nameKey = serviceElement.querySelector("[data-translate-key]")?.dataset.translateKey;
        const price = parseFloat(serviceElement.dataset.price);
        const imgSrc = serviceElement.dataset.img;
        const targetList = isAdditional ? additionalServiceList : serviceList;
        const targetContainer = isAdditional ? selectedAdditionalServicesContainer : selectedServicesContainer;

        const translatedName = getTranslation(nameKey);

        if (serviceElement.classList.contains("selected")) {
            serviceElement.classList.remove("selected");
            targetList.querySelectorAll("li").forEach((item) => {
                if (item.querySelector(".service-name").textContent === translatedName) {
                    totalPrice -= price;
                    targetList.removeChild(item);
                }
            });
        } else {
            serviceElement.classList.add("selected");
            const li = document.createElement("li");
            li.innerHTML = `
                <img src="${imgSrc}" alt="${translatedName}" class="service-img">
                <span class="service-name">${translatedName}</span>
                <strong class="service-price">${price.toFixed(2)} USD</strong>
                <span class="remove-service" role="button">×</span>
            `;
            li.querySelector(".remove-service").addEventListener("click", () => {
                serviceElement.classList.remove("selected");
                totalPrice -= price;
                targetList.removeChild(li);
                updateTotalPrice();
            });
            targetList.appendChild(li);
            totalPrice += price;
        }
        updateTotalPrice();
        targetContainer.style.display = targetList.hasChildNodes() ? "block" : "none";
    }

    document.querySelectorAll(".services .service").forEach((service) => {
        service.addEventListener("click", () => toggleService(service));
    });

    document.querySelectorAll(".additional-services .service").forEach((additionalService) => {
        additionalService.addEventListener("click", () => toggleService(additionalService, true));
    });

    // === Обробка кнопок "Особа приватна" і "Фірма" ===
    privateButton.addEventListener("click", () => {
        isCompany = false;
        privateButton.classList.add("active");
        companyButton.classList.remove("active");
        updateTotalPrice();
    });

    companyButton.addEventListener("click", () => {
        isCompany = true;
        companyButton.classList.add("active");
        privateButton.classList.remove("active");
        updateTotalPrice();
    });

    // === Обробка фіксованої кнопки ===
    fixedSubmitOrderButton.addEventListener("click", () => {
        alert(`Загальна вартість: ${totalPrice.toFixed(2)} USD. Ваше замовлення відправлено!`);
    });

    updateTotalPrice();
});
