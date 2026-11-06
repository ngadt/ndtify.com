<?php
/**
 * NDTify Live Chat – streams an attachment the agent sent from Telegram.
 * GET file.php?m=<message id>&t=<conversation token>
 */
declare(strict_types=1);

require_once __DIR__ . '/lib.php';

$mid   = (int) ($_GET['m'] ?? 0);
$token = (string) ($_GET['t'] ?? '');

$conv = conv_by_token($token);
if ($conv === null || $mid <= 0) {
    http_response_code(404);
    exit('Not found');
}

$st = db()->prepare('SELECT * FROM messages WHERE id = ? AND conv_id = ? AND attach_file_id IS NOT NULL');
$st->execute([$mid, $conv['id']]);
$row = $st->fetch();
if (!$row) {
    http_response_code(404);
    exit('Not found');
}

// Resolve (and cache) the Telegram file path.
$path = $row['attach_path'];
if (empty($path)) {
    $res = tg('getFile', ['file_id' => $row['attach_file_id']]);
    if (empty($res['ok'])) {
        http_response_code(502);
        exit('File unavailable');
    }
    $path = $res['result']['file_path'];
    db()->prepare('UPDATE messages SET attach_path = ? WHERE id = ?')->execute([$path, $mid]);
}

$url  = tg_file_url($path);
$name = preg_replace('/[^\w.\-]+/u', '_', (string) ($row['attach_name'] ?: basename($path))) ?: 'file';
$ext  = strtolower(pathinfo($path, PATHINFO_EXTENSION));
$mimes = [
    'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png', 'gif' => 'image/gif', 'webp' => 'image/webp',
    'pdf' => 'application/pdf', 'zip' => 'application/zip', 'mp4' => 'video/mp4', 'ogg' => 'audio/ogg', 'oga' => 'audio/ogg',
    'mp3' => 'audio/mpeg', 'txt' => 'text/plain',
];
$mime = $mimes[$ext] ?? 'application/octet-stream';

header('Content-Type: ' . $mime);
header('Cache-Control: private, max-age=86400');
header('X-Content-Type-Options: nosniff');
header('Content-Disposition: ' . ($row['attach_type'] === 'image' ? 'inline' : 'attachment') . '; filename="' . $name . '"');

// Stream the file through so the bot token is never exposed to the browser.
$ctx = stream_context_create(['http' => ['timeout' => 30, 'ignore_errors' => true]]);
$fp  = @fopen($url, 'rb', false, $ctx);
if (!$fp) {
    http_response_code(502);
    exit('File unavailable');
}
fpassthru($fp);
fclose($fp);
