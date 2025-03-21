document.addEventListener('DOMContentLoaded', function () {
    // Знаходимо всі посилання в навігаційному меню
    const scrollLinks = document.querySelectorAll('a[data-scroll-to]');
  
    // Додаємо обробник подій для кожного посилання
    scrollLinks.forEach(link => {
      link.addEventListener('click', function (event) {
        event.preventDefault(); // Відміняємо стандартну поведінку посилання
  
        // Отримуємо ID секції, до якої потрібно прокрутити, з атрибута data-scroll-to
        const targetId = this.getAttribute('data-scroll-to');
        const targetSection = document.getElementById(targetId);
  
        if (targetSection) {
          // Використовуємо scrollIntoView для плавної прокрутки
          targetSection.scrollIntoView({
            behavior: 'smooth', // Плавна прокрутка
            block: 'start'      // Прокрутка до початку секції
          });
        }
      });
    });
  });