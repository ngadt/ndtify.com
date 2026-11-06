<?php
/**
 * NDTify Live Chat – processes one Telegram update (shared by webhook.php and pull.php)
 */
declare(strict_types=1);

require_once __DIR__ . '/lib.php';

function chat_handle_update(array $update): void
{
    $msg    = $update['message'] ?? null;
    $edited = $update['edited_message'] ?? null;

    /* ---------------- Edited agent message → update text ---------------- */
    if ($edited && isset($edited['message_id'])) {
        if ((string) ($edited['chat']['id'] ?? '') !== (string) TG_CHAT_ID) return;
        $text = $edited['text'] ?? $edited['caption'] ?? null;
        if ($text !== null) {
            db()->prepare('UPDATE messages SET text = ? WHERE tg_message_id = ? AND sender = "agent"')
                ->execute([str_limit($text, 4000), (int) $edited['message_id']]);
        }
        return;
    }

    if (!$msg || (string) ($msg['chat']['id'] ?? '') !== (string) TG_CHAT_ID) {
        return;
    }

    $threadId = isset($msg['message_thread_id']) ? (int) $msg['message_thread_id'] : 0;
    if ($threadId === 0) {
        return; // General topic – not a conversation
    }

    $conv = conv_by_thread($threadId);
    if ($conv === null) {
        return;
    }

    /* ---------------- Service messages (topic closed / reopened) ---------- */
    if (isset($msg['forum_topic_closed'])) {
        if ($conv['status'] !== 'closed') {
            conv_touch((int) $conv['id'], ['status' => 'closed']);
            insert_message((int) $conv['id'], 'system', ['text' => 'This conversation has been closed. Send a message to start again.']);
        }
        return;
    }
    if (isset($msg['forum_topic_reopened'])) {
        if ($conv['status'] !== 'open') {
            conv_touch((int) $conv['id'], ['status' => 'open']);
        }
        return;
    }
    if (isset($msg['forum_topic_created']) || isset($msg['forum_topic_edited']) || isset($msg['pinned_message'])) {
        return;
    }

    /* ---------------- Ignore the bot's own messages ----------------------- */
    if (!empty($msg['from']['is_bot'])) {
        return;
    }

    $from      = $msg['from'] ?? [];
    $agentName = trim(($from['first_name'] ?? '') . ' ' . ($from['last_name'] ?? ''));
    if ($agentName === '') $agentName = CHAT_AGENT_NAME;
    $text = $msg['text'] ?? $msg['caption'] ?? '';

    /* ---------------- Commands ------------------------------------------- */
    if ($text !== '' && $text[0] === '/') {
        $cmd = strtolower(strtok(substr($text, 1), " @\n"));
        switch ($cmd) {
            case 'close':
            case 'end':
                conv_touch((int) $conv['id'], ['status' => 'closed']);
                insert_message((int) $conv['id'], 'system', ['text' => 'This conversation has been closed. Send a message to start again.']);
                tg('sendMessage', [
                    'chat_id'           => TG_CHAT_ID,
                    'message_thread_id' => $threadId,
                    'text'              => '✅ Conversation closed. It reopens automatically if the visitor writes again.',
                ]);
                tg('closeForumTopic', ['chat_id' => TG_CHAT_ID, 'message_thread_id' => $threadId]);
                break;

            case 'info':
                tg('sendMessage', [
                    'chat_id'           => TG_CHAT_ID,
                    'message_thread_id' => $threadId,
                    'text'              => info_card_html($conv, false),
                    'parse_mode'        => 'HTML',
                    'disable_web_page_preview' => true,
                ]);
                break;

            case 'help':
                tg('sendMessage', [
                    'chat_id'           => TG_CHAT_ID,
                    'message_thread_id' => $threadId,
                    'text'              => "Just type to reply to the visitor.\n/close – end the conversation\n/info – show visitor details",
                ]);
                break;
        }
        return;
    }

    /* ---------------- Attachments ----------------------------------------- */
    $attach = [];
    if (!empty($msg['photo']) && is_array($msg['photo'])) {
        $best = end($msg['photo']);
        $attach = [
            'attach_type'    => 'image',
            'attach_name'    => 'photo.jpg',
            'attach_file_id' => $best['file_id'],
            'attach_size'    => $best['file_size'] ?? null,
        ];
    } elseif (!empty($msg['document'])) {
        $d = $msg['document'];
        $isImage = isset($d['mime_type']) && strpos($d['mime_type'], 'image/') === 0;
        $attach = [
            'attach_type'    => $isImage ? 'image' : 'file',
            'attach_name'    => $d['file_name'] ?? 'file',
            'attach_file_id' => $d['file_id'],
            'attach_size'    => $d['file_size'] ?? null,
        ];
    } elseif (!empty($msg['video'])) {
        $d = $msg['video'];
        $attach = [
            'attach_type'    => 'file',
            'attach_name'    => $d['file_name'] ?? 'video.mp4',
            'attach_file_id' => $d['file_id'],
            'attach_size'    => $d['file_size'] ?? null,
        ];
    } elseif (!empty($msg['voice']) || !empty($msg['audio'])) {
        $d = $msg['voice'] ?? $msg['audio'];
        $attach = [
            'attach_type'    => 'file',
            'attach_name'    => $d['file_name'] ?? 'audio.ogg',
            'attach_file_id' => $d['file_id'],
            'attach_size'    => $d['file_size'] ?? null,
        ];
    } elseif (!empty($msg['sticker'])) {
        $text = $text !== '' ? $text : (($msg['sticker']['emoji'] ?? '') ?: '🙂');
    }

    if ($text === '' && !$attach) {
        return; // nothing we can show
    }

    /* ---------------- Store the agent reply ------------------------------ */
    insert_message((int) $conv['id'], 'agent', $attach + [
        'agent_name'    => str_limit($agentName, 60),
        'text'          => $text !== '' ? str_limit($text, 4000) : null,
        'tg_message_id' => (int) $msg['message_id'],
        'created_at'    => (int) ($msg['date'] ?? time()),
    ]);

    // Agent replying means the conversation is live again.
    if ($conv['status'] !== 'open') {
        conv_touch((int) $conv['id'], ['status' => 'open']);
    }

    return;
}
