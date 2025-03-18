<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db/db.php';

if (!isset($_FILES['file'])) {
    echo json_encode(['success' => false, 'message' => 'No file received']);
    exit;
}

$chat_id = $_POST['chat_id'] ?? null;
if (!$chat_id) {
    echo json_encode(['success' => false, 'message' => 'No chat_id']);
    exit;
}

$uploadDir = __DIR__ . '/uploads/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

$fileName = basename($_FILES['file']['name']);
$targetFile = $uploadDir . $fileName;

if (move_uploaded_file($_FILES['file']['tmp_name'], $targetFile)) {
    $baseURL = 'http://localhost:8000/chat/uploads/';
    $fileUrl = $baseURL . $fileName;
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $targetFile);
    finfo_close($finfo);
    $isImage = (strpos($mimeType, 'image/') === 0);

    try {
        $stmt = $pdo->prepare("SELECT status, last_message_at FROM chats WHERE id=?");
        $stmt->execute([$chat_id]);
        $chatInfo = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$chatInfo) {
            echo json_encode(['success' => false, 'message' => 'Chat not found']);
            exit;
        }
        if ($chatInfo['status'] === 'closed') {
            echo json_encode(['success' => false, 'message' => 'Chat is closed']);
            exit;
        }
        if (!empty($chatInfo['last_message_at'])) {
            $diffSeconds = time() - strtotime($chatInfo['last_message_at']);
            if ($diffSeconds > 5 * 60) {
                $pdo->prepare("UPDATE chats SET status='closed' WHERE id=?")->execute([$chat_id]);
                echo json_encode(['success' => false, 'message' => 'Chat closed by inactivity']);
                exit;
            }
        }
        if ($isImage) {
            $msg = "<img src=\"$fileUrl\" class=\"image-attachment\" alt=\"image\">";
        } else {
            $msg = "<a href=\"$fileUrl\" target=\"_blank\" class=\"file-link\">📎 $fileName</a>";
        }
        $stmt = $pdo->prepare("
            INSERT INTO messages (chat_id, sender, message, created_at)
            VALUES (?, 'client', ?, NOW())
        ");
        $stmt->execute([$chat_id, $msg]);
        $stmt = $pdo->prepare("UPDATE chats SET last_message_at=NOW() WHERE id=?");
        $stmt->execute([$chat_id]);

        echo json_encode(['success' => true, 'fileUrl' => $fileUrl, 'isImage' => $isImage]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'DB error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'File upload failed']);
}
