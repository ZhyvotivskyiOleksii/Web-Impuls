<?php
session_start();
require_once __DIR__ . '/db/db.php';

header('Content-Type: application/json');

$chatId = $_GET['chat_id'] ?? null;
if (!$chatId) {
    echo json_encode(['success' => false, 'message' => 'Chat ID не указан']);
    exit();
}

try {
    // Теперь выбираем также поле is_read
    $stmt = $pdo->prepare("
        SELECT sender, message, created_at, is_read
        FROM messages
        WHERE chat_id = ?
        ORDER BY created_at ASC
    ");
    $stmt->execute([$chatId]);
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'messages' => $messages
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Ошибка базы данных: ' . $e->getMessage()
    ]);
}
