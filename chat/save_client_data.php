<?php
// save_client_data.php

session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/db/db.php';

$data = json_decode(file_get_contents('php://input'), true);

$name  = $data['name']  ?? '';
$email = $data['email'] ?? '';
$phone = $data['phone'] ?? '';

// Простейшая проверка
if (!$name || !$email || !$phone) {
    echo json_encode(['success' => false, 'message' => 'Все поля должны быть заполнены']);
    exit();
}

try {
    // Начинаем транзакцию
    $pdo->beginTransaction();

    // 1. Проверяем, существует ли уже пользователь с таким email или телефоном
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? OR phone = ?");
    $stmt->execute([$email, $phone]);
    $existingUser = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existingUser) {
        // Если пользователь существует, получаем его chat_id
        $chatId = $existingUser['chat_id'];

        if ($chatId) {
            // Проверяем статус чата
            $stmt = $pdo->prepare("SELECT status FROM chats WHERE id = ?");
            $stmt->execute([$chatId]);
            $chatRow = $stmt->fetch(PDO::FETCH_ASSOC);

            // Если чат закрыт, просто обновляем его статус на 'open'
            if ($chatRow && isset($chatRow['status']) && $chatRow['status'] === 'closed') {
                $stmt = $pdo->prepare("UPDATE chats SET status = 'open' WHERE id = ?");
                $stmt->execute([$chatId]);
            }
        } else {
            // Если чат еще не создан, создаём новый чат для пользователя со статусом 'open'
            $stmt = $pdo->prepare("INSERT INTO chats (user_id, user_name, status) VALUES (?, ?, 'open')");
            $stmt->execute([$existingUser['id'], $name]);
            $chatId = $pdo->lastInsertId();

            // Обновляем запись пользователя
            $stmt = $pdo->prepare("UPDATE users SET chat_id = ? WHERE id = ?");
            $stmt->execute([$chatId, $existingUser['id']]);
        }

        $pdo->commit();

        echo json_encode([
            'success' => true,
            'chat_id' => $chatId, 
            'message' => 'Пользователь найден. Чат открыт.'
        ]);
        exit();
    }

    // 2. Если пользователя нет, создаём нового
    $stmt = $pdo->prepare("INSERT INTO users (name, phone, email) VALUES (?, ?, ?)");
    $stmt->execute([$name, $phone, $email]);
    $userId = $pdo->lastInsertId();

    // 3. Создаём новый чат для этого пользователя со статусом 'open'
    $stmt = $pdo->prepare("INSERT INTO chats (user_id, user_name, status) VALUES (?, ?, 'open')");
    $stmt->execute([$userId, $name]);
    $chatId = $pdo->lastInsertId();

    // 4. Обновляем таблицу users, чтобы user.chat_id = созданный chatId
    $stmt = $pdo->prepare("UPDATE users SET chat_id = ? WHERE id = ?");
    $stmt->execute([$chatId, $userId]);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'chat_id' => $chatId, 
        'message' => 'Пользователь и чат созданы'
    ]);

} catch (PDOException $e) {
    $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => 'DB Error: ' . $e->getMessage()]);
}
