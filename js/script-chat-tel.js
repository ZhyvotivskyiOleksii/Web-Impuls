document.addEventListener('DOMContentLoaded', () => {
    const sendButton = document.getElementById('send-button');
    const messageInput = document.getElementById('message-input');
    const chatMessages = document.getElementById('chat-messages');
    const emojiButton = document.getElementById('emoji-button');
    const attachButton = document.getElementById('attach-button');
    const moreButton = document.getElementById('more-button');
    const emojiPicker = document.getElementById('emoji-picker');
    const moreMenu = document.getElementById('more-menu');
    const fileInput = document.getElementById('file-input');

    let formSubmitted = sessionStorage.getItem('formSubmitted') === 'true';
    let isSendingMessage = false;  // Flag to avoid duplicate sending

    // Show the form if not submitted
    if (!formSubmitted) {
        showForm();
        disableSendButton();  // Disable send button until form is submitted
    } else {
        enableSendButton();
        loadMessagesFromLocalStorage();
    }

    // Show the form for user details
    function showForm() {
        const formHtml = `
            <div class="form-popup">
                <h3>Представьтесь</h3>
                <form id="user-details-form">
                    <label>Ваше имя</label>
                    <input type="text" id="user-name" required>
                    <label>Email</label>
                    <input type="email" id="user-email" required>
                    <label>Телефон</label>
                    <input type="tel" id="user-phone" required>
                    <button type="submit">Отправить</button>
                </form>
            </div>
        `;
        chatMessages.insertAdjacentHTML('beforeend', formHtml);
        const userDetailsForm = document.getElementById('user-details-form');
        userDetailsForm.addEventListener('submit', handleForm);
    }

    // Handle the form submission
    function handleForm(e) {
        e.preventDefault();
        const name = document.getElementById('user-name').value.trim();
        const email = document.getElementById('user-email').value.trim();
        const phone = document.getElementById('user-phone').value.trim();
        submitFormData(name, email, phone);
    }

    // Submit form data and hide the form
    function submitFormData(name, email, phone) {
        sessionStorage.setItem('formSubmitted', 'true');
        document.querySelector('.form-popup').style.display = 'none'; // Hide form
        enableSendButton();  // Enable send button after form submission
        loadMessagesFromLocalStorage();
        sendFormDataToTelegram(name, email, phone);
    }

    // Send form data to Telegram
    function sendFormDataToTelegram(name, email, phone) {
        const token = '7686342991:AAH2D--NjQRed5k8Gx6x0EbA_iGVR3c0tHQ';
        const chatId = '6968023779'; // Your chat ID
        const message = `Новый клиент:\nИмя: ${name}\nEmail: ${email}\nТелефон: ${phone}`;
        const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.ok) {
                    console.log('Данные отправлены в Telegram');
                } else {
                    console.error('Ошибка отправки данных в Telegram:', data);
                }
            })
            .catch(err => console.error('Ошибка:', err));
    }

    // Enable send button
    function enableSendButton() {
        sendButton.disabled = false;
    }

    // Disable send button
    function disableSendButton() {
        sendButton.disabled = true;
    }

    // Logic to send message
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Send message
    function sendMessage() {
        if (isSendingMessage) return;  // Prevent duplicate sending

        const txt = messageInput.value.trim();
        if (!txt || !formSubmitted) return;  // Don't send if form is not submitted

        isSendingMessage = true;  // Set flag to prevent multiple sends

        addMessageToChat({
            sender: 'client',
            message: txt,
            created_at: new Date().toISOString()
        }, true);

        messageInput.value = '';
        messageInput.style.height = '36px';
        toggleSendButton();

        sendMessageToTelegram(txt);
    }

    // Send message to Telegram
    function sendMessageToTelegram(message) {
        const token = '7686342991:AAH2D--NjQRed5k8Gx6x0EbA_iGVR3c0tHQ';
        const chatId = '6968023779'; // Your chat ID
        const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.ok) {
                    console.log('Сообщение отправлено в Telegram');
                    isSendingMessage = false;  // Reset flag after successful sending
                } else {
                    console.error('Ошибка отправки в Telegram:', data);
                    isSendingMessage = false;  // Reset flag in case of error
                }
            })
            .catch(err => {
                console.error('Ошибка:', err);
                isSendingMessage = false;  // Reset flag in case of error
            });
    }

    // Add message to chat
    function addMessageToChat(msgObj, isLocal = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = msgObj.sender === 'client' ? 'text-message' : 'received-message';

        if (msgObj.message.match(/\.(jpeg|jpg|gif|png)$/)) {
            messageDiv.innerHTML = `<img src="${msgObj.message}" class="image-attachment" alt="image">`;
        } else {
            messageDiv.innerHTML = `<span>${msgObj.message}</span>`;
        }

        messageDiv.innerHTML += `
          <div class="timestamp">${new Date(msgObj.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        `;
        chatMessages.appendChild(messageDiv);

        scrollToBottom();
    }

    // Load messages from LocalStorage
    function loadMessagesFromLocalStorage() {
        const messages = JSON.parse(localStorage.getItem('messages')) || [];
        messages.forEach(msg => addMessageToChat(msg));
        scrollToBottom();
    }

    // Scroll chat to bottom
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // File attachment handler
    attachButton.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        // File upload via API
        fetch('/chat/upload_file.php', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const msgObj = {
                        sender: 'client',
                        created_at: new Date().toISOString(),
                        message: data.isImage ? `<img src="${data.fileUrl}" class="image-attachment" alt="image">` : `<a href="${data.fileUrl}" target="_blank" class="file-link">${file.name}</a>`
                    };

                    addMessageToChat(msgObj, true);
                    saveMessageToLocalStorage(msgObj);
                    sendFileToTelegram(data.fileUrl);
                }
            })
            .catch(err => console.error('Error uploading file:', err));

        fileInput.value = '';
    });

    // Send file to Telegram
    function sendFileToTelegram(fileUrl) {
        const token = '7686342991:AAH2D--NjQRed5k8Gx6x0EbA_iGVR3c0tHQ';
        const chatId = '6968023779'; // Your chat ID
        const url = `https://api.telegram.org/bot${token}/sendPhoto?chat_id=${chatId}&photo=${encodeURIComponent(fileUrl)}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.ok) {
                    console.log('Файл отправлен в Telegram');
                } else {
                    console.error('Ошибка отправки файла в Telegram:', data);
                }
            })
            .catch(err => console.error('Ошибка:', err));
    }

    // Emoji list
    const emojiList = ['😀', '😂', '😍', '😊', '😎', '👍', '🔥', '🎉', '❤️', '😢', '😜', '😉', '😇', '🥳', '🙃', '😈', '💪', '👏', '💔'];
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

    // Save messages to LocalStorage
    function saveMessageToLocalStorage(msgObj) {
        const messages = JSON.parse(localStorage.getItem('messages')) || [];
        messages.push(msgObj);
        localStorage.setItem('messages', JSON.stringify(messages));
    }

    // Enable or disable send button
    function toggleSendButton() {
        if (messageInput.value.trim()) {
            sendButton.classList.add('active');
        } else {
            sendButton.classList.remove('active');
        }
    }

    // Download chat history
    document.getElementById('download-history').addEventListener('click', () => {
        const messages = JSON.parse(localStorage.getItem('messages')) || [];
        const history = messages.map(msg => `${msg.sender}: ${msg.message}`).join('\n');
        const blob = new Blob([history], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'chat-history.txt';
        link.click();
    });
});
