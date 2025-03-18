document.addEventListener("DOMContentLoaded", function () {
    let translations = {};

    // Загружаем JSON с переводами
    fetch("translations.json")
        .then(response => response.json())
        .then(data => {
            translations = data;
            const userLang = localStorage.getItem("language") || "pl";
            changeLanguage(userLang);
        });

    // Функция смены языка
    function changeLanguage(lang) {
        localStorage.setItem("language", lang);

        // 1) Переводим элементы с data-i18n
        document.querySelectorAll("[data-i18n]").forEach((el) => {
            const key = el.getAttribute("data-i18n");
            if (translations[lang] && translations[lang][key]) {
                el.innerHTML = translations[lang][key];
            } else {
                el.innerHTML = key; // fallback: показываем сам ключ, если нет перевода
            }
        });

        // 2) Переводим просмотры (blog-views)
        document.querySelectorAll(".blog-views").forEach((el) => {
            const article = el.closest("article");
            if (!article) return;
            const h3 = article.querySelector("h3");
            if (!h3) return;

            const postTitle = h3.textContent;
            const post = translations[lang].blog_posts.find(p => p.title === postTitle);
            if (post) {
                el.innerHTML = `👀 ${post.views}`;
            }
        });

        // 3) Переводим кнопку «Назад на сайт»
        const backButton = document.querySelector(".back-to-site");
        if (backButton) {
            backButton.textContent = translations[lang].back_to_site || "← Powrót na stronę";
        }

        // 4) Обновляем динамические блоки (левое меню и, по желанию, контент)
        loadBlogPosts(lang);

        // 5) Подсвечиваем активную кнопку языка
        document.querySelectorAll(".language-switcher button").forEach(btn => {
            btn.classList.remove("active");
            if (btn.getAttribute("data-lang") === lang) {
                btn.classList.add("active");
            }
        });
    }

    // Навешиваем обработчик клика на кнопки смены языка
    document.querySelectorAll(".language-switcher button").forEach(btn => {
        btn.addEventListener("click", () => {
            changeLanguage(btn.getAttribute("data-lang"));
        });
    });

    // Функция для динамического наполнения: левое меню + (опционально) .blog-content
    function loadBlogPosts(lang) {
        const blogPosts = translations[lang].blog_posts;

        // Левое меню (sidebar)
        const popularContainer = document.querySelector(".popular-articles");
        if (popularContainer) {
            // Очищаем .popular-articles
            popularContainer.innerHTML = "";
            
            // Генерируем список ссылок
            blogPosts.forEach(post => {
                popularContainer.innerHTML += `
                    <li>
                        <a href="${post.link}">
                            <span>🌐</span> ${post.title}
                        </a>
                    </li>
                `;
            });
        }

        // Основной блок .blog-content (ТОЛЬКО если хотите и он есть на странице)
        const blogContainer = document.querySelector(".blog-content");
        if (blogContainer) {
            // Очищаем .blog-content
            blogContainer.innerHTML = "";

            // Генерируем карточки
            blogPosts.forEach(post => {
                blogContainer.innerHTML += `
                    <article class="blog-card">
                        <img src="${post.img}" alt="${post.title}">
                        <div class="blog-card-body">
                            <h3>${post.title}</h3>
                            <p>${post.excerpt}</p>
                            <div class="blog-views">${translations[lang].views}: ${post.views}</div>
                            <a href="${post.link}" class="read-more">
                                ${translations[lang].read_more} →
                            </a>
                        </div>
                    </article>
                `;
            });
        }
    }

    // Загружаем футер
    fetch("components/footer.html")
      .then((response) => response.text())
      .then((data) => {
        document.getElementById("footer-placeholder").innerHTML = data;
      });
});
