
document.addEventListener('DOMContentLoaded', () => {
    const chatMessages      = document.getElementById('chat-messages');
    const chatUserName      = document.getElementById('chat-user-name');
    const messageInput      = document.getElementById('message-input');
    const sendButton        = document.getElementById('send-button');
    const chatListDesktop   = document.querySelector('.chat-list');
    const unreadCountTotal  = document.querySelector('.unread-count-total');
    const chatBtn           = document.getElementById('chat-btn');

    // Проверка наличия списка чатов
    if (!chatListDesktop) {
        console.error('Ошибка: Не найден список чатов в DOM.');
        return;
    }

    // Текущее состояние
    let currentChatId         = null;
    let lastServerCount       = -1;
    let autoScrollEnabled     = true;
    let previousTotalUnread   = 0; // Для отслеживания общего количества непрочитанных

    // Звуки
    const sendSound    = new Audio('/chat/sound/sentmessage.mp3');
    const receiveSound = new Audio('/chat/sound/mess-wan.mp3');

    // При прокрутке проверяем, находится ли пользователь внизу
    chatMessages?.addEventListener('scroll', () => {
        if (!chatMessages) return;
        autoScrollEnabled = (
            chatMessages.scrollHeight - chatMessages.scrollTop - chatMessages.clientHeight <= 10
        );
    });

    // Прокрутка в самый низ, если включён autoScrollEnabled
    function scrollToBottom() {
        if (autoScrollEnabled && chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    // Открыть конкретный чат (при клике на него в списке)
    window.openChat = function (chatId) {
        currentChatId = chatId;

        // Удаляем метку непрочитанных из списка
        const desktopItem = document.querySelector(`.chat-item[data-chat-id="${chatId}"]`);
        desktopItem?.querySelector('.unread-count')?.remove();

        // Сбрасываем непрочитанные на сервере
        markMessagesRead(chatId);

        // Грузим сообщения с сервера
        fetch('/chat/admin/load_messages.php?chat_id=' + chatId)
            .then(response => response.json())
            .then(data => {
                if (!data.success) return;

                // Устанавливаем имя пользователя (клиента)
                if (chatUserName) {
                    chatUserName.textContent = data.user_name || '???';
                }

                // Очищаем чат и добавляем загруженные сообщения
                if (chatMessages) {
                    chatMessages.innerHTML = '';
                    data.messages.forEach(msg => addMessageToChat(msg, false));
                    scrollToBottom();
                }
                lastServerCount = data.messages.length;
            })
            .catch(err => console.error('Ошибка загрузки сообщений:', err));

        // Для мобильных устройств переключаемся на окно чата
        if (window.innerWidth <= 768) {
            document.body.classList.add('show-chat');
        }
    };

    // Отправка сообщения (админ)
    sendButton?.addEventListener('click', sendMessage);
    messageInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Убираем локальное добавление сообщения, чтобы не было дубликатов
    function sendMessage() {
        if (!currentChatId) return;
        const text = messageInput?.value.trim();
        if (!text) return;

        fetch('/chat/admin/send_message.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: currentChatId, message: text })
        })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                // Очищаем поле ввода
                if (messageInput) messageInput.value = '';
                // Проигрываем звук отправки
                sendSound.play();
                // Сообщение появится при следующем запросе (setInterval), чтобы избежать дублирования
            }
        })
        .catch(err => console.error('Ошибка отправки:', err));
    }

    // Добавить сообщение в чат (используется при загрузке с сервера)
    function addMessageToChat(msgObj, isLocal = false) {
        if (!chatMessages) return;

        // Определяем класс по типу отправителя
        const msgDiv = document.createElement('div');
        msgDiv.className = (msgObj.sender === 'admin') ? 'admin-message' : 'client-message';

        // Вставляем текст и время
        msgDiv.innerHTML = `
            <span>${msgObj.message}</span>
            <div class="timestamp">
                ${new Date(msgObj.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
        `;

        chatMessages.appendChild(msgDiv);

        if (isLocal) {
            autoScrollEnabled = true;
        }
        scrollToBottom();
    }

    // Сброс непрочитанных на сервере
    function markMessagesRead(chatId) {
        fetch('/chat/admin/mark_read.php?chat_id=' + chatId, { method: 'POST' })
            .catch(err => console.error('Ошибка сброса непрочитанных:', err));
    }

    // Обновляем общий счётчик непрочитанных
    function updateUnreadTotalCount(chats) {
        let totalUnread = chats.reduce((sum, chat) => sum + (chat.unread_count || 0), 0);

        // Если число непрочитанных выросло, проигрываем звук
        if (totalUnread > previousTotalUnread) {
            receiveSound.play().catch(err => console.error("Ошибка воспроизведения звука:", err));
        }
        previousTotalUnread = totalUnread;

        // Обновляем элемент на странице
        if (unreadCountTotal) {
            if (totalUnread > 0) {
                unreadCountTotal.textContent = totalUnread;
                unreadCountTotal.style.display = 'block';
            } else {
                unreadCountTotal.style.display = 'none';
            }
        }
    }

    // Опрос открытого чата на новые сообщения (каждые 500 мс)
    setInterval(() => {
        if (!currentChatId) return;

        fetch("/chat/admin/load_messages.php?chat_id=" + currentChatId)
            .then(r => r.json())
            .then(data => {
                if (!data.success) return;

                // Проверяем, появились ли новые сообщения
                if (data.messages.length > lastServerCount) {
                    const newMessages = data.messages.slice(lastServerCount);

                    // Добавляем новые сообщения
                    newMessages.forEach(msg => addMessageToChat(msg, false));

                    // Если пришли сообщения от клиента — звук и сброс непрочитанных
                    if (newMessages.some(m => m.sender !== 'admin')) {
                        receiveSound.play().catch(err => console.error("Ошибка воспроизведения звука:", err));
                        markMessagesRead(currentChatId);
                    }
                    lastServerCount = data.messages.length;
                }
            })
            .catch(err => console.error('Ошибка проверки новых сообщений:', err));
    }, 500);

    // Опрос списка чатов каждые 2 секунды (общее число непрочитанных)
    setInterval(() => {
        fetch("/chat/admin/check_new_messages.php")
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    updateChatList(data.chats);
                    updateUnreadTotalCount(data.chats);
                }
            })
            .catch(err => console.error('Ошибка обновления списка чатов:', err));
    }, 2000);

    // Обновление списка чатов (левая колонка)
    function updateChatList(chats) {
        if (!chatListDesktop) return;
        chatListDesktop.innerHTML = '';

        chats.forEach(chat => {
            const desktopItem = document.createElement('div');
            desktopItem.className = 'chat-item';
            desktopItem.dataset.chatId = chat.chat_id;
            desktopItem.onclick = () => openChat(chat.chat_id);

            // Аватарка (первая буква имени)
            const initial = (chat.user_name || '?').substr(0, 1);
            const avatarEl = document.createElement('span');
            avatarEl.className = 'chat-avatar';
            avatarEl.textContent = initial;
            desktopItem.appendChild(avatarEl);

            // Блок деталей
            const detailsEl = document.createElement('div');
            detailsEl.className = 'chat-details';

            const nameEl = document.createElement('span');
            nameEl.className = 'chat-name';
            nameEl.textContent = chat.user_name || '???';
            detailsEl.appendChild(nameEl);

            const previewEl = document.createElement('p');
            previewEl.className = 'chat-preview';
            previewEl.textContent = chat.last_message || 'Нет сообщений';
            detailsEl.appendChild(previewEl);

            const timeEl = document.createElement('span');
            timeEl.className = 'chat-time';
            timeEl.textContent = chat.last_message_time
                ? new Date(chat.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '—';
            detailsEl.appendChild(timeEl);

            desktopItem.appendChild(detailsEl);

            // Непрочитанные сообщения (кроме текущего чата)
            if (chat.unread_count > 0 && chat.chat_id != currentChatId) {
                const unreadCount = document.createElement('span');
                unreadCount.className = 'unread-count';
                unreadCount.textContent = chat.unread_count;
                desktopItem.appendChild(unreadCount);
            }
            chatListDesktop.appendChild(desktopItem);
        });
    }

    // Кнопка "назад" для мобильного вида
    if (chatBtn) {
        chatBtn.addEventListener('click', () => {
            document.body.classList.remove('show-chat');
        });
    }
});

