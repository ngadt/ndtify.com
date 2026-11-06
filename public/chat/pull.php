<?php
/**
 * NDTify Live Chat – DEV ONLY: fetch updates with getUpdates instead of a webhook.
 * Useful on localhost where Telegram cannot reach webhook.php.
 *
 *   GET pull.php?key=SETUP_KEY          → process new updates once
 *   GET pull.php?key=SETUP_KEY&wait=25  → long-poll up to 25 s (call in a loop)
 *
 * Note: Telegram refuses getUpdates while a webhook is registered. This script
 * removes the webhook when ?drop_webhook=1 is passed; re-register it from
 * setup.php before going live.
 */
declare(strict_types=1);

require_once __DIR__ . '/handler.php';

if (!hash_equals(SETUP_KEY, (string) ($_GET['key'] ?? ''))) {
    http_response_code(403);
    exit('Forbidden');
}
if (isset($_GET['drop_webhook'])) {
    tg('deleteWebhook', ['drop_pending_updates' => false]);
}

db()->exec('CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT)');
$offset = (int) (db()->query('SELECT v FROM kv WHERE k = "tg_offset"')->fetchColumn() ?: 0);
$wait   = min(50, max(0, (int) ($_GET['wait'] ?? 0)));

$res = tg('getUpdates', [
    'offset'          => $offset,
    'timeout'         => $wait,
    'allowed_updates' => ['message', 'edited_message'],
], $wait + 10);

header('Content-Type: text/plain; charset=utf-8');
if (empty($res['ok'])) {
    echo 'getUpdates failed: ' . ($res['description'] ?? '?') . "\n";
    exit;
}
$n = 0;
foreach ($res['result'] as $u) {
    try {
        chat_handle_update($u);
    } catch (Throwable $e) {
        error_log('[ndt-chat] pull error: ' . $e->getMessage());
    }
    $offset = (int) $u['update_id'] + 1;
    $n++;
}
db()->prepare('INSERT INTO kv (k, v) VALUES ("tg_offset", ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v')->execute([(string) $offset]);
echo "processed $n update(s), next offset $offset\n";
