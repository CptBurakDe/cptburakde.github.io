<?php
// Log dizini ve dosyası
$log_file = __DIR__ . '/mail_open.log';

// IP ve User-Agent
$ip = $_SERVER['REMOTE_ADDR'] ?? 'Unknown IP';
$ua = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown UA';
$time = date('c'); // ISO 8601 format

// Log satırı
$log_line = "$time | $ip | $ua\n";

// Log dosyasına ekle
file_put_contents($log_file, $log_line, FILE_APPEND | LOCK_EX);

// 1x1 GIF gönder
header('Content-Type: image/gif');
echo base64_decode("R0lGODlhAQABAPAAAP///wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==");
?>
