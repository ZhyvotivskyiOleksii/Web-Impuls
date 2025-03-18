<?php
session_start();
header('Content-Type: application/json');
include 'db/db.php'; // Подключаем файл с базой данных

// Получаем chat_id из запроса
$chat_id = $_GET['chat_id'] ?? null;

if (empty($chat_id)) {
    echo json_encode(['success' => false, 'message' => 'chat_id не указан']);
    exit();
}

try {
    // Загружаем сообщения для указанного chat_id
    $stmt = $pdo->prepare("SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at ASC");
    $stmt->execute([$chat_id]);
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Возвращаем сообщения в формате JSON
    echo json_encode(['success' => true, 'messages' => $messages]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Ошибка загрузки сообщений: ' . $e->getMessage()]);
}
?>
