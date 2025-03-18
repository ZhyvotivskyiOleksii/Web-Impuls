<?php
// Подключение к базе данных
$host = '127.0.0.1';
$dbname = 'wisebets_chat_online';  // Название базы данных
$username = 'wisebets_chat_user';  // Логин для подключения к базе данных
$password = 'pZYV;i1e?j0,';        // Пароль для подключения к базе данных

try {
    // Устанавливаем соединение с базой данных с использованием кодировки utf8mb4
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    // Ошибка подключения
    die("Ошибка подключения к базе данных: " . $e->getMessage());
}
?>
