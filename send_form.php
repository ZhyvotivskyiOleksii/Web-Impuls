<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Получаем данные из POST-запроса и очищаем их
    $name = htmlspecialchars(trim($_POST['name'] ?? ''));
    $email = htmlspecialchars(trim($_POST['email'] ?? ''));
    $phone = htmlspecialchars(trim($_POST['phone'] ?? ''));
    $message = htmlspecialchars(trim($_POST['message'] ?? ''));

    // Проверяем, что все обязательные поля заполнены
    if (empty($name) || empty($email) || empty($phone) || empty($message)) {
        echo "error: All fields are required.";
        exit;
    }

    // Email для отправки
    $to = "contact@web-impuls.com"; // Замените на ваш email
    $subject = "Новий запит з форми";

    // Формируем тело письма
    $body = "
        Ім’я та Прізвище: $name\n
        Електронна пошта: $email\n
        Телефон: $phone\n
        Повідомлення:\n$message
    ";

    // Заголовки для письма
    $headers = "From: $email\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    // Пытаемся отправить письмо
    if (mail($to, $subject, $body, $headers)) {
        echo "success";

        // Отправка уведомления в Telegram
        $bot_token = "7768995750:AAHbI7gwv4zA_q2rlywYPVcm0o9w2PKj1WE"; 
        $chat_id = "6968023779"; // Укажите ваш chat_id
        $text = urlencode("Нова заявка з сайту!\nІм’я: $name\nТелефон: $phone\nПовідомлення: $message");

        $telegram_url = "https://api.telegram.org/bot{$bot_token}/sendMessage?chat_id={$chat_id}&text={$text}";
        $telegram_response = file_get_contents($telegram_url);

        // Проверяем, успешно ли отправлено сообщение в Telegram
        if ($telegram_response === false) {
            error_log("Не удалось отправить уведомление в Telegram.");
        }
    } else {
        echo "error: Failed to send email.";
    }
} else {
    echo "error: Invalid request method.";
}
?>
