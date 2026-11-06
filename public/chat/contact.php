<?php
/**
 * NDTify – "Start a project" contact form endpoint (form on /contact/).
 *
 * Accepts a POST from js/contact-form.js (JSON) or a plain HTML form post (no JS).
 * Every request is:
 *   1. validated + spam-checked (honeypot, time trap, per-IP rate limit),
 *   2. saved to SQLite (table "leads") so nothing is lost if Telegram or mail fails,
 *   3. posted to the Telegram support group (General topic),
 *   4. emailed to CONTACT_NOTIFY_EMAIL with Reply-To set to the customer.
 */
declare(strict_types=1);

require_once __DIR__ . '/lib.php';

const LEAD_TYPES = [
    'website'     => 'Website',
    'store'       => 'Online store',
    'web-app'     => 'Web app / tool',
    'wp-plugin'   => 'WordPress plugin',
    'shopify-app' => 'Shopify app',
    'integration' => 'Integration / automation',
    'fix'         => 'Fix or improve an existing site',
];
const LEAD_BUDGETS = [
    'lt1k'   => 'Under $1,000',
    '1-3k'   => '$1,000 – $3,000',
    '3-10k'  => '$3,000 – $10,000',
    'gt10k'  => '$10,000+',
    'unsure' => 'Not sure yet',
];
const LEAD_TIMELINES = [
    'asap'     => 'As soon as possible',
    '1m'       => 'Within a month',
    '1-3m'     => '1 – 3 months',
    'flexible' => 'Flexible',
];
const LEAD_PER_IP_PER_HOUR = 5;
const LEAD_MIN_FILL_SECONDS = 3;

$wantsJson = stripos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false
    || stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== false;

/** Reply as JSON (JS form) or redirect back to the page (plain form post). */
function lead_reply(bool $ok, string $error = '', array $fields = []): void
{
    global $wantsJson;
    if ($wantsJson) {
        $ok ? json_out(['ok' => true]) : json_fail($error, 422, ['fields' => $fields]);
    }
    $q = $ok ? 'sent=1' : 'error=' . rawurlencode($error);
    header('Location: /contact/?' . $q . ($ok ? '' : '#form'), true, 303);
    exit;
}

set_exception_handler(function (Throwable $e): void {
    error_log('[ndt-contact] error: ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
    if (empty($GLOBALS['ndt_responded'])) {
        lead_reply(false, 'Something went wrong on our side. Please email us at ' . CONTACT_NOTIFY_EMAIL . '.');
    }
});

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    header('Location: /contact/', true, 303);
    exit;
}

// Same-origin guard (browsers send Origin on cross-site POSTs).
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '') {
    $originHost = parse_url($origin, PHP_URL_HOST);
    $selfHost   = explode(':', $_SERVER['HTTP_HOST'] ?? '')[0];
    if ($originHost !== null && $selfHost !== '' && strcasecmp((string) $originHost, $selfHost) !== 0) {
        json_fail('Forbidden origin', 403);
    }
}

$in = $wantsJson ? read_json_body() : $_POST;

// ---- Spam traps: pretend success so bots learn nothing ----
$honeypot = trim((string) ($in['website_url'] ?? ''));
$startedAt = (int) ($in['t'] ?? 0);
if ($honeypot !== '' || ($startedAt > 0 && (time() - intdiv($startedAt, 1000)) < LEAD_MIN_FILL_SECONDS)) {
    lead_reply(true);
}

// ---- Validate ----
$name     = str_limit((string) ($in['name'] ?? ''), 120);
$email    = str_limit((string) ($in['email'] ?? ''), 160);
$company  = str_limit((string) ($in['company'] ?? ''), 200);
$message  = str_limit((string) ($in['message'] ?? ''), 5000);
$budget   = (string) ($in['budget'] ?? '');
$timeline = (string) ($in['timeline'] ?? '');
$types    = $in['types'] ?? [];
$types    = array_values(array_intersect(is_array($types) ? $types : [$types], array_keys(LEAD_TYPES)));
$page     = str_limit((string) ($in['page'] ?? ($_SERVER['HTTP_REFERER'] ?? '')), 300);

$bad = [];
if ($name === '') $bad['name'] = 'Please tell us your name.';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $bad['email'] = 'Please enter a valid email address.';
if (mb_strlen($message) < 20) $bad['message'] = 'Please describe your project in a few sentences (20+ characters).';
if ($budget !== '' && !isset(LEAD_BUDGETS[$budget])) $budget = '';
if ($timeline !== '' && !isset(LEAD_TIMELINES[$timeline])) $timeline = '';
if ($bad) {
    lead_reply(false, reset($bad), $bad);
}

// ---- Rate limit + store ----
$pdo = db();
$pdo->exec('CREATE TABLE IF NOT EXISTS leads (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    email      TEXT NOT NULL,
    company    TEXT,
    types      TEXT,
    budget     TEXT,
    timeline   TEXT,
    message    TEXT NOT NULL,
    page       TEXT,
    ip         TEXT,
    ua         TEXT,
    tg_ok      INTEGER NOT NULL DEFAULT 0,
    mail_ok    INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
)');
$pdo->exec('CREATE INDEX IF NOT EXISTS idx_leads_ip ON leads(ip, created_at)');

$ip  = client_ip();
$now = time();
$st  = $pdo->prepare('SELECT COUNT(*) FROM leads WHERE ip = ? AND created_at > ?');
$st->execute([$ip, $now - 3600]);
if ((int) $st->fetchColumn() >= LEAD_PER_IP_PER_HOUR) {
    lead_reply(false, 'Too many requests from your network. Please email us at ' . CONTACT_NOTIFY_EMAIL . '.');
}

$typeLabels = array_map(fn ($t) => LEAD_TYPES[$t], $types);
$pdo->prepare('INSERT INTO leads (name, email, company, types, budget, timeline, message, page, ip, ua, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    ->execute([$name, $email, $company, implode(', ', $typeLabels), $budget, $timeline, $message, $page, $ip,
               str_limit($_SERVER['HTTP_USER_AGENT'] ?? '', 300), $now]);
$leadId = (int) $pdo->lastInsertId();

// Reply to the visitor right away; notifications continue in the background.
if ($wantsJson) {
    json_out_and_continue(['ok' => true]);
}

// ---- Telegram ----
$tgOk = false;
if (tg_configured()) {
    $lines = [
        '🆕 <b>New project request #' . $leadId . '</b>',
        '',
        '👤 <b>' . h($name) . '</b>' . ($company !== '' ? ' · ' . h($company) : ''),
        '✉️ ' . h($email),
    ];
    if ($typeLabels) $lines[] = '🧩 ' . h(implode(', ', $typeLabels));
    if ($budget !== '') $lines[] = '💰 ' . h(LEAD_BUDGETS[$budget]);
    if ($timeline !== '') $lines[] = '⏱ ' . h(LEAD_TIMELINES[$timeline]);
    $lines[] = '';
    $lines[] = h(mb_substr($message, 0, 3000));
    $lines[] = '';
    $lines[] = '<i>' . h($page !== '' ? $page : 'contact form') . ' · ' . h($ip) . '</i>';
    $res  = tg('sendMessage', [
        'chat_id'                  => TG_CHAT_ID,
        'text'                     => implode("\n", $lines),
        'parse_mode'               => 'HTML',
        'disable_web_page_preview' => true,
    ]);
    $tgOk = !empty($res['ok']);
}

// ---- Email ----
$mailOk = false;
if (CONTACT_NOTIFY_EMAIL !== '' && function_exists('mail')) {
    $host    = preg_replace('/[^a-z0-9.-]/i', '', explode(':', $_SERVER['HTTP_HOST'] ?? 'ndtify.com')[0]) ?: 'ndtify.com';
    $subject = '=?UTF-8?B?' . base64_encode('New project request #' . $leadId . ' – ' . $name) . '?=';
    $safeName = preg_replace('/[\r\n"]+/', ' ', $name);
    $body = "Name: $name\nEmail: $email\n"
        . ($company !== '' ? "Company / website: $company\n" : '')
        . ($typeLabels ? 'Needs: ' . implode(', ', $typeLabels) . "\n" : '')
        . ($budget !== '' ? 'Budget: ' . LEAD_BUDGETS[$budget] . "\n" : '')
        . ($timeline !== '' ? 'Timeline: ' . LEAD_TIMELINES[$timeline] . "\n" : '')
        . "\n$message\n\n--\nSent from $page\nIP: $ip\n";
    $headers = implode("\r\n", [
        'From: NDTify Website <no-reply@' . $host . '>',
        'Reply-To: "' . $safeName . '" <' . $email . '>',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
    ]);
    $mailOk = @mail(CONTACT_NOTIFY_EMAIL, $subject, $body, $headers);
}

$pdo->prepare('UPDATE leads SET tg_ok = ?, mail_ok = ? WHERE id = ?')->execute([(int) $tgOk, (int) $mailOk, $leadId]);
if (!$tgOk && !$mailOk) {
    error_log("[ndt-contact] lead #$leadId saved but neither Telegram nor mail succeeded");
}

if (!$wantsJson) {
    lead_reply(true);
}
