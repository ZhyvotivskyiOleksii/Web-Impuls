<?php
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
?>
