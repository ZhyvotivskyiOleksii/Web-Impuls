<?php
session_start();
require_once __DIR__ . '/../db/db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['admin_id'])) {
    echo json_encode(['success' => false, 'message' => 'Не авторизован']);
    exit();
}

try {
    $stmt = $pdo->query("
        SELECT 
            c.id AS chat_id,
            u.name AS user_name,
            (SELECT message 
             FROM messages 
             WHERE chat_id = c.id AND sender = 'client' 
             ORDER BY created_at DESC LIMIT 1) AS last_message,
            (SELECT COUNT(*) 
             FROM messages 
             WHERE chat_id = c.id AND sender = 'client' AND is_read = 0) AS unread_count,
            MAX(m.created_at) AS last_message_time
        FROM chats c
        LEFT JOIN users u ON u.id = c.user_id
        LEFT JOIN messages m ON m.chat_id = c.id
        GROUP BY c.id, u.name
        ORDER BY last_message_time DESC
    ");
    $chats = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'chats' => $chats]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
