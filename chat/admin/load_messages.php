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
    $stmt = $pdo->prepare("
        SELECT sender, message, created_at
        FROM messages
        WHERE chat_id = ?
        ORDER BY created_at ASC
    ");
    $stmt->execute([$chatId]);
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmtUser = $pdo->prepare("
        SELECT u.name AS user_name
        FROM chats c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = ?
    ");
    $stmtUser->execute([$chatId]);
    $user = $stmtUser->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'messages' => $messages,
        'user_name' => $user['user_name'] ?? 'Неизвестный пользователь'
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
