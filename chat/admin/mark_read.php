<?php
session_start();
require_once __DIR__ . '/../db/db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['admin_id'])) {
    echo json_encode(['success' => false, 'message' => 'Не авторизован']);
    exit();
}

$chatId = $_GET['chat_id'] ?? null;

if (!$chatId) {
    echo json_encode(['success' => false, 'message' => 'Не указан chat_id']);
    exit();
}

try {
    // Помечаем сообщения клиента как прочитанные
    $stmt = $pdo->prepare("
        UPDATE messages
        SET is_read = 1
        WHERE chat_id = ? AND sender = 'client'
    ");
    $stmt->execute([$chatId]);

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
