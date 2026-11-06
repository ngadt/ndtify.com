<?php
/**
 * NDTify Live Chat – visitor API (called by js/chat-widget.js)
 *
 * POST JSON: { action, token, ... }
 *   init      → create/resume a conversation, returns history
 *   send      → visitor message → Telegram topic
 *   poll      → new messages since id
 *   identify  → set name / email
 *   typing    → forward "typing…" to Telegram (throttled)
 */
declare(strict_types=1);

require_once __DIR__ . '/lib.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    json_fail('POST only', 405);
}

// Same-origin guard: browsers always send Origin on cross-site POSTs.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '') {
    $originHost = parse_url($origin, PHP_URL_HOST);
    $selfHost   = explode(':', $_SERVER['HTTP_HOST'] ?? '')[0];
    if ($originHost !== null && $selfHost !== '' && strcasecmp($originHost, $selfHost) !== 0) {
        json_fail('Forbidden origin', 403);
    }
}

$in     = read_json_body();
$action = (string) ($in['action'] ?? '');
$token  = (string) ($in['token'] ?? '');
$now    = time();

set_exception_handler(function (Throwable $e): void {
    error_log('[ndt-chat] api error: ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
    if (empty($GLOBALS['ndt_responded'])) {
        json_fail('Server error, please try again.', 500);
    }
});

switch ($action) {

    /* ---------------------------------------------------------------- */
    case 'init': {
        $conv = $token !== '' ? conv_by_token($token) : null;

        if ($conv === null) {
            // Throttle brand-new conversations per IP.
            $ip = client_ip();
            $st = db()->prepare('SELECT COUNT(*) FROM conversations WHERE ip = ? AND created_at > ?');
            $st->execute([$ip, $now - 3600]);
            if ((int) $st->fetchColumn() >= CHAT_NEW_CONV_PER_HOUR) {
                json_fail('Too many conversations, please try later.', 429);
            }

            $token = bin2hex(random_bytes(16));
            db()->prepare('INSERT INTO conversations (token, page, referrer, ua, ip, lang, status, created_at, updated_at, last_seen_at)
                           VALUES (?,?,?,?,?,?,"open",?,?,?)')
                ->execute([
                    $token,
                    str_limit($in['page'] ?? '', 500),
                    str_limit($in['referrer'] ?? '', 500),
                    str_limit($_SERVER['HTTP_USER_AGENT'] ?? '', 300),
                    $ip,
                    str_limit($in['lang'] ?? ($_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? ''), 40),
                    $now, $now, $now,
                ]);
            $conv = conv_by_token($token);
        } else {
            $fields = ['last_seen_at' => $now];
            if (!empty($in['page'])) {
                $fields['page'] = str_limit($in['page'], 500);
            }
            conv_touch((int) $conv['id'], $fields);
            retry_pending($conv);
        }

        $st = db()->prepare('SELECT * FROM messages WHERE conv_id = ? ORDER BY id DESC LIMIT 200');
        $st->execute([$conv['id']]);
        $rows = array_reverse($st->fetchAll());

        json_out([
            'ok'       => true,
            'token'    => $conv['token'],
            'conv'     => [
                'id'     => (int) $conv['id'],
                'name'   => $conv['name'],
                'email'  => $conv['email'],
                'status' => $conv['status'],
            ],
            'messages' => array_map(fn($r) => message_public($r, $conv['token']), $rows),
            'online'   => agent_online(),
            'agent'    => CHAT_AGENT_NAME,
            'now'      => $now,
        ]);
    }

    /* ---------------------------------------------------------------- */
    case 'send': {
        $conv = conv_by_token($token);
        if ($conv === null) {
            json_fail('Unknown conversation', 404, ['reset' => true]);
        }

        $text = str_limit($in['text'] ?? '', CHAT_MAX_MESSAGE_LEN);
        $text = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/u', '', $text) ?? $text;
        if ($text === '') {
            json_fail('Empty message');
        }

        // Rate limit per conversation.
        $st = db()->prepare('SELECT COUNT(*) FROM messages WHERE conv_id = ? AND sender = "visitor" AND created_at > ?');
        $st->execute([$conv['id'], $now - 60]);
        if ((int) $st->fetchColumn() >= CHAT_RATE_PER_MINUTE) {
            json_fail('You are sending messages too fast. Please wait a moment.', 429);
        }

        // Optional identity sent together with the first message.
        $identity = [];
        if (isset($in['name']))  $identity['name']  = str_limit($in['name'], 80);
        if (isset($in['email'])) {
            $email = str_limit($in['email'], 120);
            $identity['email'] = filter_var($email, FILTER_VALIDATE_EMAIL) ? $email : null;
        }
        if ($identity) {
            conv_touch((int) $conv['id'], $identity);
            $conv = array_merge($conv, $identity);
        }

        // Deliver any queued messages first so ordering is preserved.
        retry_pending($conv);
        $conv = conv_by_token($token);

        $msgId = insert_message((int) $conv['id'], 'visitor', [
            'text'   => $text,
            'status' => 'pending',
            'created_at' => $now,
        ]);
        $st = db()->prepare('SELECT * FROM messages WHERE id = ?');
        $st->execute([$msgId]);
        $saved = $st->fetch();

        // Reply to the browser right away (message shows with a clock icon),
        // then push to Telegram. poll() flips the icon to ✓ once delivered.
        json_out_and_continue([
            'ok'        => true,
            'message'   => message_public($saved, $token),
            'delivered' => false,
            'status'    => $conv['status'],
            'online'    => agent_online(),
        ]);

        deliver_visitor_message($conv, ['id' => $msgId, 'text' => $text]);
        exit;
    }

    /* ---------------------------------------------------------------- */
    case 'poll': {
        $conv = conv_by_token($token);
        if ($conv === null) {
            json_fail('Unknown conversation', 404, ['reset' => true]);
        }
        $since = max(0, (int) ($in['since'] ?? 0));

        // Avoid a DB write on every poll – only refresh presence every 30 s.
        if ((int) $conv['last_seen_at'] < $now - 30) {
            conv_touch((int) $conv['id'], ['last_seen_at' => $now]);
        }
        retry_pending($conv);

        $st = db()->prepare('SELECT * FROM messages WHERE conv_id = ? AND id > ? ORDER BY id ASC LIMIT 100');
        $st->execute([$conv['id'], $since]);
        $rows = $st->fetchAll();

        // Report delivery state of visitor rows the widget still shows as pending.
        $resolved = [];
        $pendingIds = array_slice(array_values(array_filter(array_map('intval', (array) ($in['pending'] ?? [])))), 0, 30);
        if ($pendingIds) {
            $ph = implode(',', array_fill(0, count($pendingIds), '?'));
            $st = db()->prepare("SELECT * FROM messages WHERE conv_id = ? AND status NOT IN ('pending','sending') AND id IN ($ph)");
            $st->execute(array_merge([$conv['id']], $pendingIds));
            $resolved = array_map(fn($r) => message_public($r, $token), $st->fetchAll());
        }

        $conv = conv_by_token($token);
        json_out([
            'ok'       => true,
            'messages' => array_map(fn($r) => message_public($r, $token), $rows),
            'resolved' => $resolved,
            'status'   => $conv['status'],
            'online'   => agent_online(),
            'now'      => $now,
        ]);
    }

    /* ---------------------------------------------------------------- */
    case 'identify': {
        $conv = conv_by_token($token);
        if ($conv === null) {
            json_fail('Unknown conversation', 404, ['reset' => true]);
        }
        $fields = [];
        if (isset($in['name'])) {
            $fields['name'] = str_limit($in['name'], 80);
        }
        if (isset($in['email'])) {
            $email = str_limit($in['email'], 120);
            if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                json_fail('Invalid email');
            }
            $fields['email'] = $email === '' ? null : $email;
        }
        if (!$fields) {
            json_fail('Nothing to update');
        }
        conv_touch((int) $conv['id'], $fields);
        $conv = array_merge($conv, $fields);

        if (!empty($conv['thread_id']) && tg_configured()) {
            if (isset($fields['name'])) {
                tg('editForumTopic', [
                    'chat_id'           => TG_CHAT_ID,
                    'message_thread_id' => (int) $conv['thread_id'],
                    'name'              => topic_title($conv),
                ]);
            }
            $parts = [];
            if (isset($fields['name']))  $parts[] = '👤 ' . h($fields['name']);
            if (isset($fields['email'])) $parts[] = '✉️ ' . h((string) $fields['email']);
            tg('sendMessage', [
                'chat_id'           => TG_CHAT_ID,
                'message_thread_id' => (int) $conv['thread_id'],
                'text'              => "ℹ️ Visitor updated their details:\n" . implode("\n", $parts),
                'parse_mode'        => 'HTML',
            ]);
            if (!empty($conv['info_msg_id'])) {
                tg('editMessageText', [
                    'chat_id'    => TG_CHAT_ID,
                    'message_id' => (int) $conv['info_msg_id'],
                    'text'       => info_card_html($conv, true),
                    'parse_mode' => 'HTML',
                    'disable_web_page_preview' => true,
                ]);
            }
        }
        json_out(['ok' => true, 'conv' => ['name' => $conv['name'], 'email' => $conv['email']]]);
    }

    /* ---------------------------------------------------------------- */
    case 'typing': {
        $conv = conv_by_token($token);
        if ($conv === null || empty($conv['thread_id']) || !tg_configured()) {
            json_out(['ok' => true]);
        }
        if ((int) $conv['typing_sent_at'] > $now - 4) {
            json_out(['ok' => true]);
        }
        conv_touch((int) $conv['id'], ['typing_sent_at' => $now]);
        tg('sendChatAction', [
            'chat_id'           => TG_CHAT_ID,
            'message_thread_id' => (int) $conv['thread_id'],
            'action'            => 'typing',
        ], 4);
        json_out(['ok' => true]);
    }

    default:
        json_fail('Unknown action', 400);
}
