<?php
/**
 * NDTify Live Chat – Telegram webhook endpoint.
 * Telegram POSTs every update from the support group here; the shared
 * handler stores agent replies so the widget can pick them up.
 */
declare(strict_types=1);

require_once __DIR__ . '/handler.php';

$secret = $_SERVER['HTTP_X_TELEGRAM_BOT_API_SECRET_TOKEN'] ?? '';
if (!hash_equals(TG_WEBHOOK_SECRET, $secret)) {
    http_response_code(403);
    echo 'forbidden';
    exit;
}

$update = read_json_body();
try {
    chat_handle_update($update);
} catch (Throwable $e) {
    error_log('[ndt-chat] webhook error: ' . $e->getMessage());
}

// Always answer 200 so Telegram does not retry forever.
http_response_code(200);
header('Content-Type: application/json');
echo '{"ok":true}';
