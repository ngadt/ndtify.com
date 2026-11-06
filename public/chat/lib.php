<?php
/**
 * NDTify Live Chat – shared helpers (DB, Telegram API, utilities)
 */
declare(strict_types=1);

require_once __DIR__ . '/config.php';

date_default_timezone_set(CHAT_TIMEZONE);

// Never leak PHP notices into JSON responses; log them instead.
ini_set('display_errors', '0');
ini_set('log_errors', '1');
if (!is_dir(dirname(CHAT_DB_PATH))) {
    @mkdir(dirname(CHAT_DB_PATH), 0755, true);
}
ini_set('error_log', dirname(CHAT_DB_PATH) . '/php-error.log');

/* ------------------------------------------------------------------ */
/* Database                                                            */
/* ------------------------------------------------------------------ */

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }
    $dir = dirname(CHAT_DB_PATH);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    $pdo = new PDO('sqlite:' . CHAT_DB_PATH, null, null, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    $pdo->exec('PRAGMA journal_mode=WAL');
    $pdo->exec('PRAGMA busy_timeout=5000');
    $pdo->exec('PRAGMA synchronous=NORMAL');
    migrate($pdo);
    return $pdo;
}

function migrate(PDO $pdo): void
{
    $pdo->exec('CREATE TABLE IF NOT EXISTS conversations (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        token         TEXT    NOT NULL UNIQUE,
        thread_id     INTEGER,
        info_msg_id   INTEGER,
        name          TEXT,
        email         TEXT,
        page          TEXT,
        referrer      TEXT,
        ua            TEXT,
        ip            TEXT,
        lang          TEXT,
        status        TEXT    NOT NULL DEFAULT "open",
        typing_sent_at INTEGER NOT NULL DEFAULT 0,
        last_seen_at  INTEGER NOT NULL DEFAULT 0,
        created_at    INTEGER NOT NULL,
        updated_at    INTEGER NOT NULL
    )');
    $pdo->exec('CREATE INDEX IF NOT EXISTS idx_conv_thread ON conversations(thread_id)');
    $pdo->exec('CREATE INDEX IF NOT EXISTS idx_conv_ip ON conversations(ip, created_at)');

    $pdo->exec('CREATE TABLE IF NOT EXISTS messages (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        conv_id       INTEGER NOT NULL,
        sender        TEXT    NOT NULL,          -- visitor | agent | system
        agent_name    TEXT,
        text          TEXT,
        attach_type   TEXT,                      -- image | file
        attach_name   TEXT,
        attach_file_id TEXT,
        attach_path   TEXT,
        attach_size   INTEGER,
        tg_message_id INTEGER,
        status        TEXT    NOT NULL DEFAULT "sent",   -- sent | pending | failed
        created_at    INTEGER NOT NULL
    )');
    $pdo->exec('CREATE INDEX IF NOT EXISTS idx_msg_conv ON messages(conv_id, id)');
    add_column_if_missing($pdo, 'messages', 'claimed_at', 'INTEGER NOT NULL DEFAULT 0');
    add_column_if_missing($pdo, 'conversations', 'topic_lock', 'INTEGER NOT NULL DEFAULT 0');
    $pdo->exec('CREATE INDEX IF NOT EXISTS idx_msg_tg ON messages(tg_message_id)');
    $pdo->exec('CREATE INDEX IF NOT EXISTS idx_msg_sender_time ON messages(sender, created_at)');
}

function add_column_if_missing(PDO $pdo, string $table, string $column, string $def): void
{
    $cols = $pdo->query("PRAGMA table_info($table)")->fetchAll();
    foreach ($cols as $c) {
        if (strcasecmp($c['name'], $column) === 0) return;
    }
    $pdo->exec("ALTER TABLE $table ADD COLUMN $column $def");
}

/* ------------------------------------------------------------------ */
/* HTTP helpers                                                        */
/* ------------------------------------------------------------------ */

function json_out($data, int $code = 200): void
{
    $GLOBALS['ndt_responded'] = true;
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Send a JSON response to the browser immediately and keep running
 * (used so Telegram round-trips never delay the visitor's UI).
 */
function json_out_and_continue($data): void
{
    $GLOBALS['ndt_responded'] = true;
    ignore_user_abort(true);
    set_time_limit(60);
    $body = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    http_response_code(200);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('Content-Length: ' . strlen($body));
    header('Connection: close');
    echo $body;
    if (function_exists('fastcgi_finish_request')) {
        fastcgi_finish_request();
    } elseif (function_exists('litespeed_finish_request')) {
        litespeed_finish_request();
    } else {
        while (ob_get_level() > 0) { ob_end_flush(); }
        flush();
    }
}

function json_fail(string $message, int $code = 400, array $extra = []): void
{
    json_out(['ok' => false, 'error' => $message] + $extra, $code);
}

function read_json_body(): array
{
    $raw = file_get_contents('php://input') ?: '';
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function client_ip(): string
{
    foreach (['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'] as $k) {
        if (!empty($_SERVER[$k])) {
            $ip = trim(explode(',', (string) $_SERVER[$k])[0]);
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                return $ip;
            }
        }
    }
    return '0.0.0.0';
}

function str_limit(?string $s, int $max): string
{
    $s = trim((string) $s);
    if (function_exists('mb_substr')) {
        return mb_strlen($s) > $max ? mb_substr($s, 0, $max) : $s;
    }
    return strlen($s) > $max ? substr($s, 0, $max) : $s;
}

function h(?string $s): string
{
    return htmlspecialchars((string) $s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function site_base_url(): string
{
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    return ($https ? 'https' : 'http') . '://' . $host;
}

/** Path of the chat/ directory as seen by the browser, e.g. "/chat". */
function chat_base_path(): string
{
    return rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/chat/x.php')), '/');
}

function chat_base_url(): string
{
    $dir = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/chat/x.php')), '/');
    return site_base_url() . $dir;
}

/* ------------------------------------------------------------------ */
/* Telegram API                                                        */
/* ------------------------------------------------------------------ */

function tg_configured(): bool
{
    return TG_BOT_TOKEN !== 'PASTE_BOT_TOKEN_HERE' && TG_BOT_TOKEN !== ''
        && TG_CHAT_ID !== 'PASTE_SUPERGROUP_ID_HERE' && TG_CHAT_ID !== '';
}

/**
 * Call a Bot API method. Always returns an array with an "ok" key.
 */
function tg(string $method, array $params = [], int $timeout = 8): array
{
    $url  = rtrim(TG_API_BASE, '/') . '/bot' . TG_BOT_TOKEN . '/' . $method;
    $body = json_encode($params, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    $raw = false;
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $body,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => $timeout,
            CURLOPT_CONNECTTIMEOUT => 4,
        ]);
        $raw = curl_exec($ch);
        $err = $raw === false ? curl_error($ch) : null;
    } else {
        $ctx = stream_context_create(['http' => [
            'method'        => 'POST',
            'header'        => "Content-Type: application/json\r\n",
            'content'       => $body,
            'timeout'       => $timeout,
            'ignore_errors' => true,
        ]]);
        $raw = @file_get_contents($url, false, $ctx);
        $err = $raw === false ? 'request failed' : null;
    }

    if ($raw === false) {
        error_log("[ndt-chat] tg $method transport error: $err");
        return ['ok' => false, 'description' => 'transport: ' . $err];
    }
    $res = json_decode((string) $raw, true);
    if (!is_array($res)) {
        return ['ok' => false, 'description' => 'invalid json from telegram'];
    }
    if (empty($res['ok'])) {
        error_log("[ndt-chat] tg $method failed: " . ($res['description'] ?? '?'));
    }
    return $res;
}

/** Download a Telegram file by file_path (from getFile) to a stream; returns false on failure. */
function tg_file_url(string $filePath): string
{
    return rtrim(TG_API_BASE, '/') . '/file/bot' . TG_BOT_TOKEN . '/' . ltrim($filePath, '/');
}

/* ------------------------------------------------------------------ */
/* Conversation helpers                                                */
/* ------------------------------------------------------------------ */

function conv_by_token(string $token): ?array
{
    if (!preg_match('/^[a-f0-9]{32}$/', $token)) {
        return null;
    }
    $st = db()->prepare('SELECT * FROM conversations WHERE token = ?');
    $st->execute([$token]);
    $row = $st->fetch();
    return $row ?: null;
}

function conv_by_thread(int $threadId): ?array
{
    $st = db()->prepare('SELECT * FROM conversations WHERE thread_id = ? ORDER BY id DESC LIMIT 1');
    $st->execute([$threadId]);
    $row = $st->fetch();
    return $row ?: null;
}

function conv_touch(int $convId, array $fields = []): void
{
    $fields['updated_at'] = time();
    $sets = [];
    $vals = [];
    foreach ($fields as $k => $v) {
        $sets[] = "$k = ?";
        $vals[] = $v;
    }
    $vals[] = $convId;
    db()->prepare('UPDATE conversations SET ' . implode(', ', $sets) . ' WHERE id = ?')->execute($vals);
}

function conv_display_name(array $conv): string
{
    $name = trim((string) ($conv['name'] ?? ''));
    return $name !== '' ? $name : 'Visitor';
}

function topic_title(array $conv): string
{
    $title = '#' . $conv['id'] . ' · ' . conv_display_name($conv);
    return str_limit($title, 120);
}

function insert_message(int $convId, string $sender, array $m): int
{
    $st = db()->prepare('INSERT INTO messages
        (conv_id, sender, agent_name, text, attach_type, attach_name, attach_file_id, attach_path, attach_size, tg_message_id, status, created_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)');
    $st->execute([
        $convId,
        $sender,
        $m['agent_name']    ?? null,
        $m['text']          ?? null,
        $m['attach_type']   ?? null,
        $m['attach_name']   ?? null,
        $m['attach_file_id'] ?? null,
        $m['attach_path']   ?? null,
        $m['attach_size']   ?? null,
        $m['tg_message_id'] ?? null,
        $m['status']        ?? 'sent',
        $m['created_at']    ?? time(),
    ]);
    conv_touch($convId);
    return (int) db()->lastInsertId();
}

/** Shape a DB row for the widget. */
function message_public(array $row, string $token): array
{
    $out = [
        'id'     => (int) $row['id'],
        'sender' => $row['sender'],
        'text'   => $row['text'],
        'status' => $row['status'] === 'sending' ? 'pending' : $row['status'],
        'at'     => (int) $row['created_at'],
    ];
    if ($row['sender'] === 'agent' && !empty($row['agent_name'])) {
        $out['agent'] = $row['agent_name'];
    }
    if (!empty($row['attach_type'])) {
        $out['attachment'] = [
            'type' => $row['attach_type'],
            'name' => $row['attach_name'],
            'size' => $row['attach_size'] !== null ? (int) $row['attach_size'] : null,
            'url'  => chat_base_path() . '/file.php?m=' . $row['id'] . '&t=' . $token,
        ];
    }
    return $out;
}

/** Simple UA → "Chrome · macOS" label for the Telegram info card. */
function ua_label(?string $ua): string
{
    $ua = (string) $ua;
    $browser = 'Browser';
    if (preg_match('/Edg\/([\d.]+)/', $ua, $m))            $browser = 'Edge ' . strtok($m[1], '.');
    elseif (preg_match('/OPR\/([\d.]+)/', $ua, $m))        $browser = 'Opera ' . strtok($m[1], '.');
    elseif (preg_match('/Chrome\/([\d.]+)/', $ua, $m))     $browser = 'Chrome ' . strtok($m[1], '.');
    elseif (preg_match('/Firefox\/([\d.]+)/', $ua, $m))    $browser = 'Firefox ' . strtok($m[1], '.');
    elseif (preg_match('/Version\/([\d.]+).*Safari/', $ua, $m)) $browser = 'Safari ' . strtok($m[1], '.');

    $os = 'Unknown OS';
    if (stripos($ua, 'iPhone') !== false || stripos($ua, 'iPad') !== false) $os = 'iOS';
    elseif (stripos($ua, 'Android') !== false)   $os = 'Android';
    elseif (stripos($ua, 'Windows') !== false)   $os = 'Windows';
    elseif (stripos($ua, 'Mac OS X') !== false)  $os = 'macOS';
    elseif (stripos($ua, 'Linux') !== false)     $os = 'Linux';

    $device = preg_match('/Mobi|Android|iPhone/i', $ua) ? '📱' : '🖥';
    return "$device $browser · $os";
}

/** HTML card describing the visitor, posted & pinned at the top of each topic. */
function info_card_html(array $conv, bool $isNew = true): string
{
    $title = $isNew ? '🆕 <b>New conversation #' . $conv['id'] . '</b>' : 'ℹ️ <b>Conversation #' . $conv['id'] . '</b>';
    $lines = [$title];
    $lines[] = '👤 ' . h(conv_display_name($conv));
    if (!empty($conv['email'])) {
        $lines[] = '✉️ ' . h($conv['email']);
    }
    if (!empty($conv['page'])) {
        $path = parse_url($conv['page'], PHP_URL_PATH) ?: '/';
        $frag = parse_url($conv['page'], PHP_URL_FRAGMENT);
        $label = $path . ($frag ? '#' . $frag : '');
        $lines[] = '🌐 <a href="' . h($conv['page']) . '">' . h($label) . '</a>';
    }
    if (!empty($conv['referrer'])) {
        $lines[] = '↩️ ' . h(str_limit($conv['referrer'], 80));
    }
    $lines[] = ua_label($conv['ua']);
    $meta = [];
    if (!empty($conv['ip']))   $meta[] = h($conv['ip']);
    if (!empty($conv['lang'])) $meta[] = h($conv['lang']);
    if ($meta) $lines[] = '🌍 ' . implode(' · ', $meta);
    $lines[] = '🕒 ' . date('D d M, H:i', (int) $conv['created_at']);
    $lines[] = '';
    $lines[] = '<i>Reply in this topic to chat with the visitor. Commands: /close, /info</i>';
    return implode("\n", $lines);
}

/* ------------------------------------------------------------------ */
/* Telegram topic lifecycle                                            */
/* ------------------------------------------------------------------ */

/**
 * Make sure the conversation has an open forum topic. Returns updated conv
 * or null when Telegram is unreachable (caller should queue the message).
 */
function ensure_topic(array $conv): ?array
{
    if (!tg_configured()) {
        return null;
    }

    if (empty($conv['thread_id'])) {
        // Only ONE request may create the topic. Others back off; their
        // message stays "pending" and is retried once the topic exists.
        $now  = time();
        $lock = db()->prepare('UPDATE conversations SET topic_lock = ? WHERE id = ? AND thread_id IS NULL AND topic_lock < ?');
        $lock->execute([$now, $conv['id'], $now - 90]);
        if ($lock->rowCount() !== 1) {
            $fresh = conv_by_token($conv['token']);
            if ($fresh && !empty($fresh['thread_id'])) {
                $conv = $fresh;                 // somebody just created it
                return $conv['status'] === 'closed' ? ensure_topic($conv) : $conv;
            }
            return null;                        // creation in progress elsewhere
        }

        $res = tg('createForumTopic', [
            'chat_id'    => TG_CHAT_ID,
            'name'       => topic_title($conv),
            'icon_color' => 7322096,
        ]);
        if (empty($res['ok'])) {
            db()->prepare('UPDATE conversations SET topic_lock = 0 WHERE id = ?')->execute([$conv['id']]);
            return null;
        }
        $threadId = (int) $res['result']['message_thread_id'];
        conv_touch((int) $conv['id'], ['thread_id' => $threadId, 'status' => 'open', 'topic_lock' => 0]);
        $conv['thread_id'] = $threadId;
        $conv['status']    = 'open';

        $card = tg('sendMessage', [
            'chat_id'                  => TG_CHAT_ID,
            'message_thread_id'        => $threadId,
            'text'                     => info_card_html($conv, true),
            'parse_mode'               => 'HTML',
            'disable_web_page_preview' => true,
        ]);
        if (!empty($card['ok'])) {
            $mid = (int) $card['result']['message_id'];
            conv_touch((int) $conv['id'], ['info_msg_id' => $mid]);
            tg('pinChatMessage', [
                'chat_id'              => TG_CHAT_ID,
                'message_id'           => $mid,
                'disable_notification' => true,
            ]);
        }
        return $conv;
    }

    if ($conv['status'] === 'closed') {
        $res = tg('reopenForumTopic', [
            'chat_id'           => TG_CHAT_ID,
            'message_thread_id' => (int) $conv['thread_id'],
        ]);
        // "TOPIC_NOT_MODIFIED" means it is already open – treat as success.
        if (empty($res['ok']) && stripos($res['description'] ?? '', 'NOT_MODIFIED') === false) {
            // Topic may have been deleted – create a fresh one.
            if (stripos($res['description'] ?? '', 'not found') !== false || stripos($res['description'] ?? '', 'TOPIC_ID_INVALID') !== false) {
                conv_touch((int) $conv['id'], ['thread_id' => null]);
                $conv['thread_id'] = null;
                return ensure_topic($conv);
            }
            return null;
        }
        conv_touch((int) $conv['id'], ['status' => 'open']);
        $conv['status'] = 'open';
        tg('sendMessage', [
            'chat_id'           => TG_CHAT_ID,
            'message_thread_id' => (int) $conv['thread_id'],
            'text'              => '🔔 Visitor reopened the conversation.',
        ]);
    }
    return $conv;
}

/** Push a visitor message row to Telegram; updates its status. */
function deliver_visitor_message(array $conv, array $msg): bool
{
    // Atomically claim the row so two PHP processes never send it twice.
    $now   = time();
    $claim = db()->prepare('UPDATE messages SET status = "sending", claimed_at = ?
                            WHERE id = ? AND (status = "pending" OR (status = "sending" AND claimed_at < ?))');
    $claim->execute([$now, $msg['id'], $now - 90]);
    if ($claim->rowCount() !== 1) {
        return false; // already sent, or another request is sending it right now
    }

    try {
        $conv = ensure_topic($conv);
        if ($conv === null) {
            db()->prepare('UPDATE messages SET status = "pending" WHERE id = ?')->execute([$msg['id']]);
            return false;
        }
        $res = tg('sendMessage', [
            'chat_id'           => TG_CHAT_ID,
            'message_thread_id' => (int) $conv['thread_id'],
            'text'              => (string) $msg['text'],
            'disable_web_page_preview' => true,
        ]);
    } catch (Throwable $e) {
        error_log('[ndt-chat] deliver error: ' . $e->getMessage());
        db()->prepare('UPDATE messages SET status = "pending" WHERE id = ?')->execute([$msg['id']]);
        return false;
    }
    if (empty($res['ok'])) {
        db()->prepare('UPDATE messages SET status = "pending" WHERE id = ?')->execute([$msg['id']]);
        return false;
    }
    db()->prepare('UPDATE messages SET status = "sent", tg_message_id = ? WHERE id = ?')
        ->execute([(int) $res['result']['message_id'], $msg['id']]);
    return true;
}

/** Retry queued visitor messages for a conversation (Telegram was down earlier). */
function retry_pending(array $conv): void
{
    $now = time();
    $st = db()->prepare('SELECT * FROM messages WHERE conv_id = ? AND sender = "visitor"
                         AND ((status = "pending" AND created_at < ?) OR (status = "sending" AND claimed_at < ?))
                         ORDER BY id ASC LIMIT 20');
    $st->execute([$conv['id'], $now - 6, $now - 90]);
    $rows = $st->fetchAll();
    if (!$rows) {
        return;
    }
    foreach ($rows as $row) {
        if (!deliver_visitor_message($conv, $row)) {
            break; // still down – try again later
        }
        $conv = conv_by_token($conv['token']) ?? $conv;
    }
}

/** True when an agent replied to anyone recently. */
function agent_online(): bool
{
    $st = db()->prepare('SELECT 1 FROM messages WHERE sender = "agent" AND created_at > ? LIMIT 1');
    $st->execute([time() - CHAT_ONLINE_WINDOW]);
    return (bool) $st->fetchColumn();
}
