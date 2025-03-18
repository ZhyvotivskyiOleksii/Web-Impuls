<?php
$password = 'galaganberta';
$hashedPassword = password_hash($password, PASSWORD_BCRYPT);
echo $hashedPassword;
?>
