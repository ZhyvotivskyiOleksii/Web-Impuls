document.addEventListener('DOMContentLoaded', function () {
    const button = document.querySelector('.multibutton__button');
    const menu = document.querySelector('.multibutton');
    const chatIcon = document.querySelector('.icon-chat');
    const closeIcon = document.querySelector('.icon-close');
  
    button.addEventListener('click', function () {
      menu.classList.toggle('active'); // Переключаем класс активности
  
      // Переключаем видимость иконок
      if (menu.classList.contains('active')) {
        chatIcon.style.display = 'none'; // Скрыть иконку чата
        closeIcon.style.display = 'block'; // Показать крестик
      } else {
        chatIcon.style.display = 'block'; // Показать иконку чата
        closeIcon.style.display = 'none'; // Скрыть крестик
      }
    });
  });
  