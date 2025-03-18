<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/db/db.php';

$data = json_decode(file_get_contents('php://input'), true);
$message = trim($data['message'] ?? '');
$chat_id = $data['chat_id'] ?? null;

if (empty($message) || empty($chat_id)) {
    echo json_encode(['success' => false, 'message' => 'Не все данные заполнены']);
    exit;
}

try {
    // Проверяем, существует ли чат и не закрыт ли он
    $stmt = $pdo->prepare("
        SELECT status, last_message_at
        FROM chats
        WHERE id = ?
    ");
    $stmt->execute([$chat_id]);
    $chatInfo = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$chatInfo) {
        echo json_encode(['success' => false, 'message' => 'Чат не найден']);
        exit;
    }

    // Если чат закрыт
    if ($chatInfo['status'] === 'closed') {
        echo json_encode(['success' => false, 'message' => 'Чат уже закрыт']);
        exit;
    }

    // Проверяем таймаут 5 минут
    if (!empty($chatInfo['last_message_at'])) {
        $lastMsgTime = strtotime($chatInfo['last_message_at']);
        $diffSeconds = time() - $lastMsgTime;
        if ($diffSeconds > 5 * 60) {
            $pdo->prepare("UPDATE chats SET status='closed' WHERE id=?")
                ->execute([$chat_id]);
            echo json_encode([
                'success' => false,
                'message' => 'Чат был автоматически закрыт из-за 5 минут бездействия'
            ]);
            exit;
        }
    }

    // Вставляем сообщение с is_read=0 (по умолчанию сообщение не прочитано)
    $stmt = $pdo->prepare("
        INSERT INTO messages (chat_id, sender, message, created_at, is_read)
        VALUES (?, 'client', ?, NOW(), 0)
    ");
    $stmt->execute([$chat_id, $message]);

    // Обновляем время последнего сообщения
    $stmt = $pdo->prepare("
        UPDATE chats
        SET last_message_at = NOW()
        WHERE id = ?
    ");
    $stmt->execute([$chat_id]);

    echo json_encode([
        'success' => true,
        'message' => 'Сообщение отправлено!',
        'chat_id' => $chat_id
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Ошибка базы данных: ' . $e->getMessage()
    ]);
}
