<?php
session_start();
require_once '../db/db.php';

if (!isset($_SESSION['admin_id'])) {
    header('Location: login.php');
    exit();
}

$chatId = $_GET['chat_id'] ?? null;
if (!$chatId) {
    die("Не указан chat_id");
}

// ...
