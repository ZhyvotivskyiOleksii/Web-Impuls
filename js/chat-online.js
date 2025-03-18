document.addEventListener('DOMContentLoaded', () => {
  const chatContainer = document.querySelector('.chat-container');
  const chatBar = document.querySelector('.chat-online-bar');
  const chatMenu = document.querySelector('.chat-menu');
  const chatButton = document.getElementById('chat-button');
  const chatFrame = document.createElement('iframe');

  let isMenuOpen = false;
  let isChatOpen = false;

  // Отключаем анимацию при начальной загрузке
  chatBar.classList.add('no-animate');

  // Устанавливаем начальную ширину 190px при загрузке
  chatBar.style.width = '190px';

  // После полной загрузки страницы включаем анимацию
  window.addEventListener('load', () => {
    chatBar.classList.remove('no-animate');
  });

  // Открыть чат
  const openChat = () => {
    if (!isMenuOpen) {
      isMenuOpen = true;
      chatBar.style.width = '240px'; // Увеличиваем ширину при открытии
      chatMenu.style.display = 'flex';
      setTimeout(() => {
        chatMenu.style.opacity = '1';
        chatMenu.style.transform = 'translateY(0)';
        chatMenu.style.pointerEvents = 'auto';
      }, 200);
    }
  };

  // Закрыть чат
  const closeChat = () => {
    if (isMenuOpen) {
      chatMenu.style.opacity = '0';
      chatMenu.style.transform = 'translateY(30px)';
      chatMenu.style.pointerEvents = 'none';
      setTimeout(() => {
        chatBar.style.width = '190px'; // Сжимаем плашку обратно до 190px
        chatMenu.style.display = 'none';
        isMenuOpen = false;
      }, 200);
    }
  };

  const displayChat = () => {
    chatFrame.src = 'http://localhost:8000/chat/';
    chatFrame.style.display = 'block';
    document.body.appendChild(chatFrame);
    isChatOpen = true;
  };

  window.addEventListener('message', (event) => {
    if (event.data === 'closeChat') {
      chatFrame.style.display = 'none';
      isChatOpen = false;
      chatBar.style.pointerEvents = 'auto';
    }
  });

  // Переключение состояния плашки
  chatBar.addEventListener('click', () => {
    if (isMenuOpen) {
      closeChat();
    } else {
      openChat();
    }
  });

  document.addEventListener('click', (event) => {
    if (!chatContainer.contains(event.target) && isMenuOpen && !isChatOpen) {
      closeChat();
    }
  });

  // Открыть чат по кнопке
  chatButton.addEventListener('click', (event) => {
    event.preventDefault();
    displayChat();
    closeChat();
  });

  // Обеспечим, чтобы плашка всегда была видимой
  const keepChatVisible = () => {
    chatBar.style.display = 'flex';
  };

  keepChatVisible();
});
