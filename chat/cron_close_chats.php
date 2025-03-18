<?php
// cron_close_chats.php
require_once __DIR__ . '/db/db.php';

// Как вариант, обновляем все чаты, где status='open',
// и время последнего сообщения (или создания чата) старше 24 часов
$sql = "
UPDATE chats
SET status = 'closed'
WHERE status = 'open'
  AND id IN (
    SELECT c.id 
    FROM chats c
    LEFT JOIN messages m ON m.chat_id = c.id
    -- Берём время последнего сообщения
    GROUP BY c.id
    HAVING MAX(m.created_at) < (NOW() - INTERVAL 24 HOUR)
           OR MAX(m.created_at) IS NULL  -- если нет сообщений
  )
";

// Выполняем
$rows = $pdo->exec($sql);
echo "Закрыто чатов: $rows\n";
