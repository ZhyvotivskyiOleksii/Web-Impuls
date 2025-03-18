<?php
session_start();
require_once __DIR__ . '/../db/db.php';

if (!isset($_SESSION['admin_id'])) {
    header('Location: login.php');
    exit();
}

if (isset($_POST['logout'])) {
    session_destroy();
    header('Location: login.php');
    exit();
}

$sql = "
    SELECT c.id AS chat_id,
           u.name AS user_name,
           MAX(m.created_at) AS last_message_time,
           (SELECT message 
            FROM messages 
            WHERE chat_id = c.id 
                  AND sender = 'client'
            ORDER BY created_at DESC LIMIT 1
           ) AS last_message,
           (SELECT COUNT(*) 
            FROM messages 
            WHERE chat_id = c.id 
                  AND sender = 'client' 
                  AND is_read = 0
           ) AS unread_count
    FROM chats c
    LEFT JOIN users u ON u.id = c.user_id
    LEFT JOIN messages m ON m.chat_id = c.id
    GROUP BY c.id, u.name
    ORDER BY last_message_time DESC
";
$result = $pdo->query($sql);
$chats = $result ? $result->fetchAll(PDO::FETCH_ASSOC) : [];
?>
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>CRM Чаты</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/chat/admin/adm-chat.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
</head>
<body>

  <!-- Общий админский хедер, который всегда виден -->
  <div class="admin-header">
    <div class="admin-avatar">
      <img src="/chat/img/srm-alex.png" alt="Admin Avatar">
    </div>
    <h2 class="crm-title">CRM</h2>
    <form method="POST" class="logout-form">
      <button type="submit" name="logout" class="logout-btn">
        <img src="/chat/img/exit.png" alt="Logout" class="logout-icon">
      </button>
    </form>
  </div>

  <!-- Основной контейнер -->
  <div class="admin-container">
    <!-- Боковая панель со списком чатов -->
    <div class="chat-sidebar">
      <div class="search-container">
        <form class="search-form">
          <i class="fas fa-search search-icon"></i>
          <input type="text" id="search-input" placeholder="Поиск..." class="search-input">
        </form>
      </div>

      <div class="tabs">
        <button class="tab-btn active" id="clients-tab">Клиенты</button>
        <button class="tab-btn" id="tasks-tab">Задачи</button>
        <button class="tab-btn" id="requests-tab">Заявки</button>
      </div>

      <div class="chat-list">
        <?php if (!empty($chats)): ?>
          <?php foreach ($chats as $chat): ?>
            <div class="chat-item" 
                 data-chat-id="<?= (int)$chat['chat_id'] ?>"
                 onclick="openChat(<?= (int)$chat['chat_id'] ?>)">
              <span class="chat-avatar"><?= htmlspecialchars(mb_substr($chat['user_name'] ?? '???', 0, 1)) ?></span>
              <div class="chat-details">
                <span class="chat-name"><?= htmlspecialchars($chat['user_name'] ?? '???') ?></span>
                <p class="chat-preview">
                  <?= htmlspecialchars(mb_strimwidth($chat['last_message'] ?? 'Нет сообщений', 0, 50, '...')) ?>
                </p>
                <span class="chat-time">
                  <?= $chat['last_message_time'] ? date('H:i', strtotime($chat['last_message_time'])) : '—' ?>
                </span>
              </div>
              <?php if (!empty($chat['unread_count'])): ?>
                <span class="unread-count"><?= $chat['unread_count'] ?></span>
              <?php endif; ?>
            </div>
          <?php endforeach; ?>
        <?php else: ?>
          <p>Нет активных чатов</p>
        <?php endif; ?>
      </div>
    </div>

    <!-- Окно выбранного чата -->
    <div class="chat-window">
      <div class="chat-header">
        <!-- Кнопка "Назад" для мобильных устройств -->
    
        <span id="chat-user-name">Выберите чат</span>
      </div>
      <div class="chat-messages" id="chat-messages">
        <p style="text-align:center; color:#888; margin-top:10px;">
          Выберите чат слева
        </p>
      </div>
      <div class="message-input">
        <textarea id="message-input" placeholder="Напишите сообщение..."></textarea>
        <button id="send-button">Отправить</button>
      </div>
    </div>
  </div>

  <!-- Общий футер, который всегда виден -->
  <div class="sidebar-footer">
    <button class="footer-btn" id="chat-btn">
      <i class="fas fa-comments"></i>
      <span class="unread-count-total">0</span>
    </button>
    <button class="footer-btn" id="settings-btn">
      <i class="fas fa-cog"></i>
    </button>
    <button class="footer-btn" id="info-btn">
      <i class="fas fa-info-circle"></i>
    </button>
  </div>

  <script src="/chat/admin/admin_script.js"></script>
</body>
</html>
