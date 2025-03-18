<?php
session_start();

// Проверка авторизации
if (isset($_SESSION['admin'])) {
    header('Location: /chat/admin/index.php'); // Если уже авторизован, перенаправляем в админку
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Подключаем базу данных
    include __DIR__ . '/../db/db.php';

    $username = trim($_POST['username']);
    $password = $_POST['password'];

    // Проверка, если поля пустые
    if (empty($username) || empty($password)) {
        $error = "Пожалуйста, введите логин и пароль!";
    } else {
        try {
            // Получаем данные о пользователе
            $stmt = $pdo->prepare("SELECT * FROM admins WHERE admin = ?");
            $stmt->execute([$username]);
            $admin = $stmt->fetch();

            if ($admin && password_verify($password, $admin['password'])) {
                $_SESSION['admin'] = $username;
                $_SESSION['admin_id'] = $admin['id']; // Сохраняем ID администратора
                header('Location: /chat/admin/index.php'); // Перенаправляем в админку
                exit();
            } else {
                $error = "Неверный логин или пароль!";
            }
        } catch (PDOException $e) {
            $error = "Ошибка при подключении к базе данных: " . $e->getMessage();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Вход в админку</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        .admin-login-wrapper {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-color: #f5f5f5;
            margin: 0;
            padding: 15px;
        }

        .admin-auth-container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 400px;
            text-align: center;
        }

        .admin-auth-container img {
            margin-bottom: 20px;
        }

        .admin-auth-container h2 {
            color: #333;
            margin-bottom: 30px;
            font-size: 24px;
        }

        .admin-input-group {
            margin-bottom: 20px;
            text-align: left;
            position: relative;
        }

        .admin-input-group label {
            display: block;
            margin-bottom: 8px;
            color: #555;
            font-size: 14px;
        }

        .admin-input-group input {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
            transition: border-color 0.3s;
            box-sizing: border-box;
        }

        .admin-input-group input:focus {
            border-color: #228ff8;
            outline: none;
        }

        .admin-submit-button {
            background-color: #228ff8;
            color: white;
            padding: 12px 25px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            width: 100%;
            font-size: 16px;
            transition: background-color 0.3s;
        }

        .admin-submit-button:hover {
            background-color: #1a7ad9;
        }

        .admin-error-message {
            color: #ff4444;
            margin-top: 15px;
            font-size: 14px;
        }

        /* Стили для кнопки показа пароля */
        .admin-password-toggle {
            position: absolute;
            right: 10px;
            top: 38px;
            border: none;
            background: none;
            cursor: pointer;
            color: #666;
            padding: 5px;
        }

        .admin-password-toggle:hover {
            color: #228ff8;
        }

        /* Мобильная адаптация */
        @media (max-width: 480px) {
            .admin-auth-container {
                padding: 20px;
                margin: 10px;
            }

            .admin-auth-container h2 {
                font-size: 20px;
            }

            .admin-input-group input {
                padding: 10px;
                font-size: 14px;
            }

            .admin-submit-button {
                padding: 10px 20px;
                font-size: 14px;
            }
        }
    </style>
</head>
<body>
    <div class="admin-login-wrapper">
        <div class="admin-auth-container">
            <img src="/images/img/logo-1.png" alt="logo">
            <h2>Вход в админку</h2>
            <form action="login.php" method="POST">
                <div class="admin-input-group">
                    <label for="username">Логин</label>
                    <input type="text" id="username" name="username" placeholder="Введите логин" required>
                </div>
                <div class="admin-input-group">
                    <label for="password">Пароль</label>
                    <input type="password" id="password" name="password" placeholder="Введите пароль" required>
                    <button type="button" class="admin-password-toggle" onclick="togglePassword()">
                        <i class="fas fa-eye" id="toggleIcon"></i>
                    </button>
                </div>
                <button type="submit" class="admin-submit-button">Войти</button>
            </form>
            <p class="admin-error-message" style="display: none;">Ошибка входа</p>
        </div>
    </div>

    <script>
        function togglePassword() {
            const passwordInput = document.getElementById('password');
            const toggleIcon = document.getElementById('toggleIcon');

            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggleIcon.classList.remove('fa-eye');
                toggleIcon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                toggleIcon.classList.remove('fa-eye-slash');
                toggleIcon.classList.add('fa-eye');
            }
        }
    </script>
</body>
</html>