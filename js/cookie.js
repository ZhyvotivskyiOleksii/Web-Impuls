// Получаем элементы
const cookieBanner = document.getElementById('cookie-banner');
const acceptButton = document.getElementById('accept-button');

// Проверяем, было ли уже принято соглашение
if (localStorage.getItem('cookieAccepted') === 'true') {
  cookieBanner.style.display = 'none'; // Скрываем баннер, если соглашение уже принято
}

// Обработка клика на кнопку "ACCEPT"
acceptButton.addEventListener('click', () => {
  // Записываем согласие и произвольную строку в localStorage
  localStorage.setItem('cookieAccepted', 'true'); // Записываем факт принятия
  localStorage.setItem('cookieData', 'User has accepted the cookie policy'); // Записываем строку

  // Скрываем баннер
  cookieBanner.style.display = 'none';
});
