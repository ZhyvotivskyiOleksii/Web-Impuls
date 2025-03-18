
document.addEventListener('DOMContentLoaded', () => {
    const sendButton   = document.getElementById('send-button');
    const messageInput = document.getElementById('message-input');
    const chatMessages = document.getElementById('chat-messages');

    const emojiButton  = document.getElementById('emoji-button');
    const attachButton = document.getElementById('attach-button');
    const moreButton   = document.getElementById('more-button');
    const emojiPicker  = document.getElementById('emoji-picker');
    const moreMenu     = document.getElementById('more-menu');
    const fileInput    = document.getElementById('file-input');
    const closeButton  = document.getElementById('close-button');
    const downloadBtn  = document.getElementById('download-history');

    let userDetailsForm, userNameInput, userEmailInput, userPhoneInput;
    let formSubmitted  = sessionStorage.getItem('formSubmitted') === 'true';
    let chatId         = localStorage.getItem('chatId') || sessionStorage.getItem('chatId');

    let autoScrollEnabled = true;
    let previousMessages   = [];
    let lastServerCount    = -1;

    // === ИЗМЕНЕНИЕ №1: Флаг, который указывает, открыт ли чат визуально ===
    let chatIsOpen = true;

    //-----------------------------------------------------------------
    // Градиенты для аватарок, сохраняем в localStorage,
    // чтобы цвет не менялся при перезагрузке
    //-----------------------------------------------------------------
    const avatarGradients = {
        client: null,
        admin:  null
    };

    // Более нейтральный список градиентов
    const possibleGradients = [
        'linear-gradient(45deg, #f3ec78, #af4261)',
        'linear-gradient(45deg, #85FFBD, #FFFB7D)',
        'linear-gradient(45deg, #FBDA61, #FF5ACD)',
        'linear-gradient(45deg, #ff9966, #ff5e62)',
        'linear-gradient(45deg, #36D1DC, #5B86E5)',
        'linear-gradient(45deg, #11998e, #38ef7d)',
        'linear-gradient(45deg, #c471ed, #f7797d)',
        'linear-gradient(60deg, #abecd6 0%, #fbed96 100%)'
    ];

    // При загрузке проверяем, есть ли уже сохранённые цвета
    if (localStorage.getItem('client_gradient')) {
        avatarGradients.client = localStorage.getItem('client_gradient');
    }
    if (localStorage.getItem('admin_gradient')) {
        avatarGradients.admin = localStorage.getItem('admin_gradient');
    }

    function getRandomGradient() {
        return possibleGradients[
            Math.floor(Math.random() * possibleGradients.length)
        ];
    }

    // Имя клиента (для инициалов)
    let userNameValue = localStorage.getItem('client_name') || null;

    //-----------------------------------------------------------------
    // Прокрутка
    //-----------------------------------------------------------------
    function isUserAtBottom() {
        const threshold = 100;
        return (
            chatMessages.scrollHeight - chatMessages.scrollTop - chatMessages.clientHeight < threshold
        );
    }

    chatMessages.addEventListener('scroll', () => {
        autoScrollEnabled = isUserAtBottom();
    });

    function scrollToBottom() {
        if (autoScrollEnabled) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    //-----------------------------------------------------------------
    // Проверка, отправлял ли пользователь форму
    //-----------------------------------------------------------------
    if (!formSubmitted) {
        showForm();
        disableSendButton();
    } else {
        enableSendButton();
        loadMessagesFromLocalStorage();
        // setInterval, чтобы периодически подгружать сообщения
        setInterval(loadMessagesFromServer, 500);
    }

    function showForm() {
        const formHtml = `
            <div class="form-popup">
                <h3>Introduce Yourself 👋</h3>
                <form id="user-details-form">
                    <label>Your name</label>
                    <input type="text" id="user-name" required>

                    <label>Email</label>
                    <input type="email" id="user-email" required>

                    <label>Phone</label>
                    <input type="tel" id="user-phone" required>

                    <button type="submit">Send</button>
                </form>
            </div>
        `;
        chatMessages.insertAdjacentHTML('beforeend', formHtml);

        userDetailsForm = document.getElementById('user-details-form');
        userNameInput   = document.getElementById('user-name');
        userEmailInput  = document.getElementById('user-email');
        userPhoneInput  = document.getElementById('user-phone');

        userDetailsForm.addEventListener('submit', handleForm);
    }

    function handleForm(e) {
        e.preventDefault();
        const name  = userNameInput.value.trim();
        const email = userEmailInput.value.trim();
        const phone = userPhoneInput.value.trim();

        fetch('/chat/save_client_data.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone })
        })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                chatId = data.chat_id;
                localStorage.setItem('chatId', chatId);
                sessionStorage.setItem('chatId', chatId);

                // Сохраняем имя клиента (для инициалов)
                localStorage.setItem('client_name', name);
                userNameValue = name;

                const formPopup = document.querySelector('.form-popup');
                if (formPopup) formPopup.style.display = 'none';

                sessionStorage.setItem('formSubmitted', 'true');
                enableSendButton();

                loadMessagesFromLocalStorage();
                setInterval(loadMessagesFromServer, 500);

            } else {
                console.error('Ошибка:', data.message);
            }
        })
        .catch(err => console.error('Ошибка:', err));
    }

    //-----------------------------------------------------------------
    // Отправка сообщения
    //-----------------------------------------------------------------
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    function sendMessage() {
        const txt = messageInput.value.trim();
        if (!txt || !chatId) return;

        playSendSound();

        const msgObj = {
            sender: 'client',
            message: txt,
            created_at: new Date().toISOString(),
            is_read: 0
        };
        addMessageToChat(msgObj, true);
        saveMessageToLocalStorage(msgObj, chatId);

        messageInput.value = '';
        messageInput.style.height = '36px';
        toggleSendButton();

        fetch('/chat/send_message.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: txt, chat_id: chatId })
        })
        .then(r => r.json())
        .then(data => {
            if (!data.success) {
                console.error('Ошибка отправки:', data.message);
            }
        })
        .catch(err => console.error('Ошибка:', err));
    }

    //-----------------------------------------------------------------
    // Генерация сообщения: добавляем аватар и пузырёк с нужным классом
    //-----------------------------------------------------------------
    function addMessageToChat(msgObj, isLocal = false) {
        const senderType = (msgObj.sender === 'client') ? 'client' : 'admin';

        const wrapper = document.createElement('div');
        wrapper.classList.add('message-wrapper', senderType);

        // Аватар
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'msg-avatar';

        if (!avatarGradients[senderType]) {
            const randGrad = getRandomGradient();
            avatarGradients[senderType] = randGrad;
            if (senderType === 'client') {
                localStorage.setItem('client_gradient', randGrad);
            } else {
                localStorage.setItem('admin_gradient', randGrad);
            }
        }
        avatarDiv.style.background = avatarGradients[senderType];

        // Инициал (первая буква имени)
        let initial = 'A'; 
        if (senderType === 'client') {
            if (userNameValue) {
                initial = userNameValue.charAt(0).toUpperCase();
            } else {
                initial = 'U';
            }
        }
        avatarDiv.textContent = initial;

        // Определяем класс для пузырька:
        // если сообщение состоит только из смайликов, назначаем класс "msg-emoji",
        // если сообщение содержит файлы (теги <img> или <a>) — "msg-file",
        // иначе стандартный "msg-bubble".
        let bubbleClass = 'msg-bubble';
        if (isOnlyEmoji(msgObj.message)) {
            bubbleClass = 'msg-emoji';
        } else if (msgObj.message.includes('<img') || msgObj.message.includes('<a')) {
            bubbleClass = 'msg-file';
        }

        const bubble = document.createElement('div');
        bubble.className = bubbleClass;

        const timeStr = new Date(msgObj.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        let doubleChecks = '';

        if (senderType === 'client') {
            const isReadVal = parseInt(msgObj.is_read ?? 0, 10);
            const checkClass = (isReadVal === 1) ? 'read' : 'unread';
            doubleChecks = `
              <span class="double-checks ${checkClass}">
                <svg viewBox="0 0 16 15">
                  <path d="M5.7 9.2L2.0 5.5l1-1 2.7 2.7 4.8-4.8 1 1-5.8 5.9z"></path>
                  <path d="M10.6 9.2l-2-2 1-1 2 2 3.8-3.9 1 1-4.8 4.9z"></path>
                </svg>
              </span>
            `;
        }

        bubble.innerHTML = `
            <span>${msgObj.message}</span>
            <div class="timestamp">
                ${timeStr}
                ${doubleChecks}
            </div>
        `;

        wrapper.appendChild(avatarDiv);
        wrapper.appendChild(bubble);
        chatMessages.appendChild(wrapper);

        if (isLocal) {
            autoScrollEnabled = true;
        }
        scrollToBottom();

        // Если в сообщении есть изображения, обновляем прокрутку после их загрузки
        const images = bubble.querySelectorAll('img');
        images.forEach(img => {
            img.addEventListener('load', () => {
                scrollToBottom();
            });
        });
    }

    //-----------------------------------------------------------------
    // Локальная история
    //-----------------------------------------------------------------
    function loadMessagesFromLocalStorage() {
        if (!chatId) return;
        const chatHistory = JSON.parse(localStorage.getItem(chatId)) || [];
        chatMessages.innerHTML = '';
        chatHistory.forEach(m => addMessageToChat(m, false));
        scrollToBottom();
        previousMessages = chatHistory;
    }

    function saveMessageToLocalStorage(msgObj, chatId) {
        const chatHistory = JSON.parse(localStorage.getItem(chatId)) || [];
        chatHistory.push(msgObj);
        localStorage.setItem(chatId, JSON.stringify(chatHistory));
    }

    //-----------------------------------------------------------------
    // Опрос сервера
    //-----------------------------------------------------------------
    function loadMessagesFromServer() {
        if (!chatId) return;

        fetch(`/chat/get_messages.php?chat_id=${chatId}`)
        .then(r => r.json())
        .then(data => {
            if (!data.success) return;
            const serverMessages = data.messages;

            // Если пришли новые админские сообщения
            if (lastServerCount !== -1 && serverMessages.length > lastServerCount) {
                const newMsgs = serverMessages.slice(lastServerCount);
                const hasAdmin = newMsgs.some(x => x.sender === 'admin');
                if (hasAdmin) {
                    playReceiveSound();
                }
            }
            lastServerCount = serverMessages.length;

            // Проверяем, изменились ли сообщения
            if (!messagesAreDifferent(serverMessages, previousMessages)) {
                return;
            }

            // === ИЗМЕНЕНИЕ №2: Если чат скрыт (chatIsOpen = false), 
            // мы НЕ перерисовываем DOM, но продолжаем обновлять localStorage ===
            if (chatIsOpen) {
                chatMessages.innerHTML = '';
                serverMessages.forEach(m => addMessageToChat(m, false));
                scrollToBottom();
            }

            // В любом случае обновляем локальное хранилище
            localStorage.setItem(chatId, JSON.stringify(serverMessages));
            previousMessages = serverMessages;
        })
        .catch(err => console.error('Ошибка получения:', err));
    }

    function messagesAreDifferent(arr1, arr2) {
        if (arr1.length !== arr2.length) return true;
        for (let i = 0; i < arr1.length; i++) {
            if (
                arr1[i].sender      !== arr2[i].sender      ||
                arr1[i].message     !== arr2[i].message     ||
                arr1[i].created_at  !== arr2[i].created_at  ||
                (arr1[i].is_read ?? 0) !== (arr2[i].is_read ?? 0)
            ) {
                return true;
            }
        }
        return false;
    }

    //-----------------------------------------------------------------
    // Звуки
    //-----------------------------------------------------------------
    function playSendSound() {
        const snd = new Audio('/chat/sound/sentmessage.mp3');
        snd.play().catch(() => {});
    }
    function playReceiveSound() {
        const snd = new Audio('/chat/sound/mess-wan.mp3');
        snd.play().catch(() => {});
    }

    //-----------------------------------------------------------------
    // Прикрепление файлов
    //-----------------------------------------------------------------
    attachButton.addEventListener('click', () => {
        fileInput.click();
    });
    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (!file) return;
        if (!chatId) {
            console.error('Нет chatId. Сначала заполните форму.');
            return;
        }
        const formData = new FormData();
        formData.append('chat_id', chatId);
        formData.append('file', file);

        fetch('/chat/upload_file.php', {
            method: 'POST',
            body: formData
        })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                const msgObj = {
                    sender: 'client',
                    created_at: new Date().toISOString(),
                    is_read: 0
                };
                if (data.isImage) {
                    msgObj.message = `<img src="${data.fileUrl}" class="image-attachment" alt="image preview">`;
                } else {
                    msgObj.message = `
                        <a href="${data.fileUrl}" target="_blank" class="file-link">
                            📎 ${file.name}
                        </a>
                    `;
                }
                addMessageToChat(msgObj, true);
                saveMessageToLocalStorage(msgObj, chatId);
                playSendSound();
            } else {
                console.error('Ошибка загрузки файла:', data.message);
            }
        })
        .catch(err => console.error('Ошибка отправки файла:', err));

        fileInput.value = '';
    });

    //-----------------------------------------------------------------
    // Эмодзи / Меню
    //-----------------------------------------------------------------
    const emojiList = [
      '😀','😂','😍','😊','😎','👍','🔥','🎉','💜','💯','💬','👌','🧠','🙅','🌎',
      '😢','😜','😉','😇','🥳','🙃','😈','💪','👏','💔'
    ];
    emojiList.forEach(emoji => {
        const btn = document.createElement('button');
        btn.textContent = emoji;
        btn.className = 'icon-button';
        btn.addEventListener('click', () => {
            messageInput.value += emoji;
            toggleSendButton();
            emojiPicker.classList.remove('show');
        });
        emojiPicker.appendChild(btn);
    });

    emojiButton.addEventListener('click', () => {
        emojiPicker.classList.toggle('show');
        moreMenu.classList.remove('show');
    });
    moreButton.addEventListener('click', () => {
        moreMenu.classList.toggle('show');
        emojiPicker.classList.remove('show');
    });

    document.addEventListener('click', (e) => {
        if (!emojiPicker.contains(e.target) && e.target !== emojiButton) {
            emojiPicker.classList.remove('show');
        }
        if (!moreMenu.contains(e.target) && e.target !== moreButton) {
            moreMenu.classList.remove('show');
        }
    });

    //-----------------------------------------------------------------
    // Скачивание истории
    //-----------------------------------------------------------------
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            if (!chatId) {
                console.warn('Нет chatId — нечего скачивать.');
                return;
            }
            const chatHistory = JSON.parse(localStorage.getItem(chatId)) || [];
            if (!chatHistory.length) {
                console.warn('История пуста.');
                return;
            }
            const chatText = chatHistory.map(m => {
                const time = new Date(m.created_at).toLocaleString();
                const msgClean = m.message.replace(/<[^>]*>/g, '');
                return `[${m.sender}] ${msgClean} (${time})`;
            }).join('\n');
            const blob = new Blob([chatText], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);

            const tempLink = document.createElement('a');
            tempLink.href = url;
            tempLink.download = `chat_history_${chatId}.txt`;
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);
            URL.revokeObjectURL(url);
        });
    }

    //-----------------------------------------------------------------
    // Закрытие чата
    //-----------------------------------------------------------------
    closeButton.addEventListener('click', function() {
        const chatContainer = document.querySelector('.chat-container');
        if (chatContainer) {
            chatContainer.style.display = 'none';
        }
        // === ИЗМЕНЕНИЕ №3: Ставим флаг, что чат скрыт
        chatIsOpen = false;
    });

    //-----------------------------------------------------------------
    // Вспомогательные функции
    //-----------------------------------------------------------------
    function enableSendButton() {
        sendButton.disabled = false;
    }
    function disableSendButton() {
        sendButton.disabled = true;
    }

    function isOnlyEmoji(txt) {
        const emojiRegex = /^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{1F900}-\u{1F9FF}]+$/u;
        return emojiRegex.test(txt);
    }

    messageInput.addEventListener('input', () => {
        messageInput.style.height = '16px';
        messageInput.style.height = messageInput.scrollHeight + 'px';
        toggleSendButton();
    });

    function toggleSendButton() {
        if (messageInput.value.trim()) {
            sendButton.classList.add('active');
        } else {
            sendButton.classList.remove('active');
        }
    }
});

