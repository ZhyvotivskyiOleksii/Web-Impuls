<?php
session_start();
require_once __DIR__ . '/../db/db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['admin_id'])) {
    echo json_encode(['success' => false, 'message' => 'Не авторизован']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);
$chatId  = $data['chat_id'] ?? null;
$message = trim($data['message'] ?? '');

if (!$chatId || !$message) {
    echo json_encode(['success' => false, 'message' => 'Параметры отсутствуют']);
    exit();
}

try {
    $stmt = $pdo->prepare("
        INSERT INTO messages (chat_id, sender, message, created_at)
        VALUES (?, 'admin', ?, NOW())
    ");
    $stmt->execute([$chatId, $message]);

    echo json_encode(['success' => true, 'message' => 'Сообщение отправлено']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
