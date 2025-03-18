<?php
// Включаем отображение ошибок для отладки
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Массив URL-адресов страниц для парсинга
$urls = [
    'https://web-impuls.com',
    'https://web-impuls.com/o-nas',
    'https://web-impuls.com/services',
    'https://web-impuls.com/calculator',
    'https://web-impuls.com/contact',
];

// Функция для получения содержимого страницы через cURL
function getPageContent($url) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // Следуем за редиректами
    $content = curl_exec($ch);
    
    if(curl_errno($ch)) {
        echo 'Ошибка cURL: ' . curl_error($ch);
        return false;  // Если ошибка, возвращаем false
    }
    
    curl_close($ch);
    return $content;
}

// Функция для очистки текста
function cleanText($text) {
    $text = trim($text);  // Убираем пробелы в начале и в конце
    $text = preg_replace('/\s+/', ' ', $text); // Заменяем несколько пробелов на один
    return $text;
}

// Массив для хранения данных
$all_data = [];

foreach ($urls as $url) {
    echo "Парсим: $url\n";

    // Получаем содержимое страницы
    $html = getPageContent($url);

    if ($html === false) {
        echo "Не удалось загрузить страницу: $url\n";
        continue;  // Переходим к следующему URL
    }

    // Используем DOMDocument для парсинга HTML
    $dom = new DOMDocument();
    @$dom->loadHTML($html);  // Игнорируем предупреждения

    // Извлекаем заголовки h1, h2 и основной текст
    $headings = [];
    $paragraphs = [];
    
    // Собираем заголовки h1 и h2
    foreach ($dom->getElementsByTagName('h1') as $h1) {
        $headings[] = cleanText($h1->nodeValue);
    }
    foreach ($dom->getElementsByTagName('h2') as $h2) {
        $headings[] = cleanText($h2->nodeValue);
    }

    // Собираем все параграфы
    foreach ($dom->getElementsByTagName('p') as $p) {
        $paragraphs[] = cleanText($p->nodeValue);
    }

    // Собираем всю текстовую информацию
    $page_data = [
        'url' => $url,
        'headings' => $headings,
        'paragraphs' => $paragraphs
    ];

    $all_data[] = $page_data;
}

// Проверяем собранные данные перед записью в файл
echo "Данные перед записью:\n";
print_r($all_data);

// Путь к файлу в папке parser
$file_path = __DIR__ . '/parsed_data.json'; // Абсолютный путь к файлу в папке parser

// Проверка существования папки и прав на запись
if (is_writable(dirname($file_path)) || !file_exists($file_path)) {
    // Используем JSON_UNESCAPED_UNICODE для записи кириллицы без экранирования
    $result = file_put_contents($file_path, json_encode($all_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    if ($result === false) {
        echo "Ошибка при записи в файл: $file_path\n";
    } else {
        echo "Парсинг завершен! Данные сохранены в $file_path.\n";
    }
} else {
    echo "Нет прав на запись в папку: " . dirname($file_path) . "\n";
}
?>
