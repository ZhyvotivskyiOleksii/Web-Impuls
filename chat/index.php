<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" 
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    
    <link rel="stylesheet" href="/chat/assets/style.css">
    <meta name="robots" content="noindex, nofollow">
    <title>Online Chat</title>
</head>
<body>
    <div class="chat-container">
        <div class="chat-wrap" >
            
        
        <!-- Header -->
        <div class="chat-header">
            <div class="header-left">
                <h2>We are Online</h2>
            </div>
            <span class="status-indicator"></span>
            <div class="header-right">
                <button id="close-button" class="close-button">×</button>
            </div>
        </div>

        <!-- Pinned text -->
        <div class="sub-header-fixed">
            <p>Business messenger</p>
        </div>

        <!-- Chat messages field -->
        <div class="chat-messages" id="chat-messages">
            <!-- Messages will be added dynamically -->
        </div>

        <!-- Input area -->
        <div class="chat-input">
            <textarea
                id="message-input"
                placeholder="Enter your message..."
            ></textarea>
            <button
                id="send-button"
                class="send-button disabled"
            >
                ➤
            </button>
        </div>

        <!-- Buttons container -->
        <div class="icon-container">
            <button id="more-button" class="icon-button">⋮</button>
            <button id="attach-button" class="icon-button">📎</button>
            <button id="emoji-button" class="icon-button">😀</button>
        </div>

        <!-- Popups -->
        <div id="emoji-picker" class="popup"></div>
        <div id="more-menu" class="popup">
            <button id="download-history" class="icon-button">
                <span class="dialog-txt">Download chat history</span>
            </button>
        </div>
        <input type="file" id="file-input" class="hidden">

        <!-- Footer -->
        <footer>
            <p>
                Developed by
                <span class="chat-web-cop">Web-</span
                ><span class="chat-impuls-cop">Impuls</span>
            </p>
        </footer>
        </div>
    </div>

    <script>
        // Сообщаем родительскому окну о закрытии чата (если нужно)
        document.getElementById('close-button').addEventListener('click', () => {
            window.parent.postMessage('closeChat', '*');
        });
    </script>

    <!-- Основной скрипт чата -->
    <script src="/chat/assets/script.js"></script>

    <!-- jQuery (if нужно) -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <!-- Typed.js (if нужно) -->
    <script src="https://cdn.jsdelivr.net/npm/typed.js@2.0.12"></script>

</body>
</html>
