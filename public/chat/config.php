<?php
/**
 * NDTify Live Chat – configuration
 *
 * 1. Create a bot with @BotFather → copy the token into TG_BOT_TOKEN.
 * 2. Create a Telegram group → Group settings → enable "Topics" (forum mode).
 * 3. Add the bot to the group as ADMIN with the "Manage Topics" permission.
 * 4. Get the group chat id (negative number starting with -100). Easiest way:
 *    open https://ndtify.com/chat/setup.php?key=<SETUP_KEY> and follow the steps.
 * 5. Open setup.php once to register the webhook.
 */

declare(strict_types=1);

// Secrets live in chat/.env.local (KEY=value per line), NOT in this file, so the
// repo can be public. See chat/.env.example. The file is blocked from the web by .htaccess.
(static function (): void {
    $f = __DIR__ . '/.env.local';
    if (!is_file($f)) return;
    foreach (file($f, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#' || strpos($line, '=') === false) continue;
        [$k, $v] = explode('=', $line, 2);
        $k = trim($k); $v = trim($v, " \t\"'");
        if ($k !== '' && getenv($k) === false) putenv("$k=$v");
    }
})();

// ---- Telegram ----
define('TG_BOT_TOKEN',     getenv('NDT_TG_BOT_TOKEN') ?: 'PASTE_BOT_TOKEN_HERE');
define('TG_CHAT_ID',       getenv('NDT_TG_CHAT_ID')   ?: 'PASTE_SUPERGROUP_ID_HERE'); // e.g. -1001234567890
define('TG_API_BASE',      getenv('NDT_TG_API_BASE')  ?: 'https://api.telegram.org');

// Random strings – change them! (any long random text)
define('TG_WEBHOOK_SECRET', getenv('NDT_TG_WEBHOOK_SECRET') ?: 'change-me-webhook-secret');
define('SETUP_KEY',         getenv('NDT_SETUP_KEY')         ?: 'change-me-setup-key');

// ---- Storage ----
define('CHAT_DB_PATH', __DIR__ . '/data/chat.sqlite');

// ---- Widget / behaviour ----
define('CHAT_SITE_NAME',        'NDTify');
define('CHAT_AGENT_NAME',       'NDTify Support');
define('CHAT_MAX_MESSAGE_LEN',  2000);
define('CHAT_RATE_PER_MINUTE',  15);    // visitor messages per minute per conversation
define('CHAT_NEW_CONV_PER_HOUR', 30);   // new conversations per IP per hour
define('CHAT_ONLINE_WINDOW',    600);   // seconds since last agent reply to show "Online now"
define('CHAT_TIMEZONE',         'Asia/Ho_Chi_Minh');

// ---- Contact form (/contact/ → chat/contact.php) ----
// New project requests go to the Telegram group above AND to this mailbox.
define('CONTACT_NOTIFY_EMAIL', getenv('NDT_CONTACT_EMAIL') ?: 'support@ndtify.com');
