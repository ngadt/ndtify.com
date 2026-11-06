<?php
/**
 * NDTify Live Chat – one-time setup & health check.
 * Open: https://your-domain/chat/setup.php?key=SETUP_KEY
 */
declare(strict_types=1);

require_once __DIR__ . '/lib.php';

if (!hash_equals(SETUP_KEY, (string) ($_GET['key'] ?? ''))) {
    http_response_code(403);
    exit('Forbidden – append ?key=SETUP_KEY from config.php');
}

$steps = [];
$ok = static fn(bool $b) => $b ? '✅' : '❌';

// 1. Config present
$steps[] = [$ok(tg_configured()), 'Bot token & chat id set in config.php' . (tg_configured() ? '' : ' – fill TG_BOT_TOKEN / TG_CHAT_ID first')];

if (tg_configured()) {
    // 2. Bot reachable
    $me = tg('getMe');
    $steps[] = [$ok(!empty($me['ok'])), 'getMe: ' . (!empty($me['ok']) ? '@' . $me['result']['username'] : ($me['description'] ?? 'failed'))];

    // 3. Group is a forum and bot is admin
    $chat = tg('getChat', ['chat_id' => TG_CHAT_ID]);
    if (!empty($chat['ok'])) {
        $c = $chat['result'];
        $steps[] = [$ok(($c['type'] ?? '') === 'supergroup'), 'Chat type: ' . ($c['type'] ?? '?') . ' (' . h($c['title'] ?? '') . ')'];
        $steps[] = [$ok(!empty($c['is_forum'])), 'Topics enabled: ' . (!empty($c['is_forum']) ? 'yes' : 'NO – enable "Topics" in group settings')];
        if (!empty($me['ok'])) {
            $member = tg('getChatMember', ['chat_id' => TG_CHAT_ID, 'user_id' => $me['result']['id']]);
            $m = $member['result'] ?? [];
            $isAdmin = in_array($m['status'] ?? '', ['administrator', 'creator'], true);
            $canTopics = !empty($m['can_manage_topics']) || ($m['status'] ?? '') === 'creator';
            $canPin    = !empty($m['can_pin_messages']) || ($m['status'] ?? '') === 'creator';
            $steps[] = [$ok($isAdmin), 'Bot is admin: ' . ($m['status'] ?? 'unknown')];
            $steps[] = [$ok($canTopics), 'Bot can manage topics' . ($canTopics ? '' : ' – grant "Manage Topics" permission')];
            $steps[] = [$ok($canPin), 'Bot can pin messages' . ($canPin ? '' : ' – optional, grant "Pin Messages"')];
        }
    } else {
        $steps[] = ['❌', 'getChat failed: ' . h($chat['description'] ?? '') . ' – check TG_CHAT_ID and that the bot is in the group'];
    }

    // 4. Webhook
    $webhookUrl = chat_base_url() . '/webhook.php';
    if (isset($_GET['set_webhook'])) {
        $r = tg('setWebhook', [
            'url'             => $webhookUrl,
            'secret_token'    => TG_WEBHOOK_SECRET,
            'allowed_updates' => ['message', 'edited_message'],
            'drop_pending_updates' => true,
        ]);
        $steps[] = [$ok(!empty($r['ok'])), 'setWebhook: ' . h($r['description'] ?? '')];
    }
    $info = tg('getWebhookInfo');
    $cur  = $info['result']['url'] ?? '';
    $steps[] = [$ok($cur === $webhookUrl), 'Webhook: ' . ($cur !== '' ? h($cur) : 'not set') . ($cur === $webhookUrl ? '' : ' → expected ' . h($webhookUrl))];
    if (!empty($info['result']['last_error_message'])) {
        $steps[] = ['⚠️', 'Last webhook error: ' . h($info['result']['last_error_message']) . ' (' . date('Y-m-d H:i', (int) $info['result']['last_error_date']) . ')'];
    }
    $steps[] = [$ok(isset($info['result']['pending_update_count']) && $info['result']['pending_update_count'] < 10), 'Pending updates: ' . ($info['result']['pending_update_count'] ?? '?')];
}

// 5. Database writable
try {
    db();
    $cnt = (int) db()->query('SELECT COUNT(*) FROM conversations')->fetchColumn();
    $steps[] = ['✅', "Database OK – $cnt conversation(s) stored"];
} catch (Throwable $e) {
    $steps[] = ['❌', 'Database error: ' . h($e->getMessage()) . ' – make chat/data writable (chmod 755/775)'];
}

$steps[] = [$ok(TG_WEBHOOK_SECRET !== 'change-me-webhook-secret-7f3a9c' && SETUP_KEY !== 'change-me-setup-key-2b8e1d'), 'Secrets changed from defaults'];
$steps[] = [$ok(function_exists('curl_init')), 'cURL extension' . (function_exists('curl_init') ? '' : ' missing – falling back to streams')];
$steps[] = [$ok(extension_loaded('pdo_sqlite')), 'pdo_sqlite extension'];

$self = strtok($_SERVER['REQUEST_URI'], '?') . '?key=' . urlencode(SETUP_KEY);
?><!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>NDTify chat – setup</title>
<meta name="robots" content="noindex">
<style>
body{font:15px/1.6 system-ui,sans-serif;max-width:760px;margin:40px auto;padding:0 20px;color:#0f172a}
li{margin:6px 0;list-style:none}code{background:#f1f5f9;padding:2px 6px;border-radius:4px}
a.btn{display:inline-block;margin-top:16px;padding:10px 18px;border-radius:8px;background:#5b5bf6;color:#fff;text-decoration:none;font-weight:600}
</style></head><body>
<h1>NDTify live chat – setup check</h1>
<ul><?php foreach ($steps as [$icon, $label]) echo "<li>$icon $label</li>"; ?></ul>
<?php
$logFile = dirname(CHAT_DB_PATH) . '/php-error.log';
if (isset($_GET['clear_log']) && is_file($logFile)) { file_put_contents($logFile, ''); }
$logTail = is_file($logFile) ? implode('', array_slice(file($logFile), -40)) : '';
$recent = [];
try {
    $recent = db()->query('SELECT m.id, m.conv_id, c.thread_id, m.sender, m.status, m.created_at, substr(m.text,1,40) AS t
                           FROM messages m JOIN conversations c ON c.id = m.conv_id ORDER BY m.id DESC LIMIT 15')->fetchAll();
} catch (Throwable $e) { /* shown above */ }
$journal = '';
try { $journal = (string) db()->query('PRAGMA journal_mode')->fetchColumn(); } catch (Throwable $e) {}
?>
<h2 style="font-size:17px;margin-top:28px">Recent messages <small style="color:#64748b;font-weight:400">(SQLite journal: <?= h($journal) ?>)</small></h2>
<table style="border-collapse:collapse;font-size:13px;width:100%">
<tr style="text-align:left;color:#64748b"><th>id</th><th>conv</th><th>topic</th><th>sender</th><th>status</th><th>time</th><th>text</th></tr>
<?php foreach ($recent as $r): ?>
<tr><td><?= (int)$r['id'] ?></td><td>#<?= (int)$r['conv_id'] ?></td><td><?= h((string)$r['thread_id']) ?></td><td><?= h($r['sender']) ?></td>
<td style="color:<?= $r['status']==='sent'?'#16a34a':'#b45309' ?>"><?= h($r['status']) ?></td><td><?= date('d/m H:i:s', (int)$r['created_at']) ?></td><td><?= h((string)$r['t']) ?></td></tr>
<?php endforeach; ?>
</table>
<h2 style="font-size:17px;margin-top:28px">PHP error log <a style="font-size:13px;font-weight:400" href="<?= h($self) ?>&clear_log=1">clear</a></h2>
<pre style="background:#0f172a;color:#e2e8f0;padding:12px;border-radius:8px;font-size:12px;white-space:pre-wrap;max-height:320px;overflow:auto"><?= $logTail !== '' ? h($logTail) : 'empty – no PHP errors recorded' ?></pre>
<?php if (tg_configured()): ?>
  <a class="btn" href="<?= h($self) ?>&set_webhook=1">Register / refresh webhook</a>
  <p style="color:#64748b">Webhook URL: <code><?= h(chat_base_url() . '/webhook.php') ?></code></p>
<?php endif; ?>
<p style="color:#64748b">Tip: to find the group id, add the bot to the group, send any message there, then open
<code>https://api.telegram.org/bot&lt;TOKEN&gt;/getUpdates</code> and look for <code>"chat":{"id":-100…}</code>.</p>
</body></html>
