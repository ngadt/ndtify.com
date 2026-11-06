# NDTify – Portfolio & studio site

Site portfolio + nhận làm web/app/plugin/Shopify app/integration. Tiếng Anh.
HTML tĩnh nhiều trang (tốt cho SEO), sinh bằng 1 script Node không cần cài package.

## Cấu trúc

```
build.mjs              # chạy: node build.mjs → sinh HTML + sitemap.xml vào public/
src/site.mjs           # layout chung: <head>, header, footer, schema Organization, CTA
src/projects.mjs       # DỮ LIỆU các dự án + HubStock → sửa/thêm dự án ở đây
src/pages/*.mjs        # nội dung từng trang (home, services, work, hubstock, 404)
public/                # THƯ MỤC UPLOAD LÊN HOSTING (document root)
  index.html, services/, work/<slug>/, apps/hubstock/, 404.html, sitemap.xml  ← file sinh ra, đừng sửa tay
  css/ js/ images/ chat/ .htaccess robots.txt favicon.svg                      ← sửa tay bình thường
```

## Thêm một dự án mới

1. Chụp màn hình 1440×900 → `public/images/work/<ten>.webp` + bản 720×450 `<ten>-sm.webp`
   (`cwebp -q 78 -resize 1440 900 in.png -o x.webp`).
2. Thêm 1 object vào `PROJECTS` trong `src/projects.mjs` (copy object có sẵn, sửa nội dung).
3. `node build.mjs` → trang `/work/<slug>/`, card ở trang chủ/Work, footer và sitemap tự cập nhật.

## Xem local & deploy

```
node build.mjs
cd public && php -S localhost:8765     # mở http://localhost:8765
```
Deploy Namecheap: upload **nội dung** thư mục `public/` vào `public_html/`
(nhớ file ẩn `.htaccess`). Sau đó submit `https://ndtify.com/sitemap.xml` trong Google Search Console.

SEO backlink: thêm dòng "Website by NDTify" ở footer site khách, link về đúng `/work/<slug>/`.

## Live chat (thay Crisp) – trả lời từ Telegram

Mỗi khách mở chat = **1 topic riêng** trong group Telegram "NDTify Support".
Khách nhắn trên web → bot đẩy vào topic. Mình reply trong topic → khách thấy ngay trên web.

```
chat/config.php   # cấu hình chat; KHÔNG chứa secret
chat/.env.local   # bot token, group id, secrets – không commit (xem .env.example), PHẢI upload lên server
chat/contact.php  # form /contact/ → Telegram + email support@ndtify.com, lưu bảng leads
chat/api.php      # API cho widget (init / send / poll / identify / typing)
chat/webhook.php  # Telegram gọi vào đây khi có tin trong group
chat/handler.php  # xử lý update (dùng chung webhook + pull)
chat/file.php     # proxy ảnh/file agent gửi từ Telegram (không lộ bot token)
chat/setup.php    # trang kiểm tra cấu hình + đăng ký webhook
chat/pull.php     # DEV: kéo tin bằng getUpdates khi chạy localhost
chat/data/        # SQLite + log (Apache chặn truy cập trực tiếp)
```

### Cài đặt (1 lần)

1. Tạo bot với @BotFather → dán token vào `TG_BOT_TOKEN`.
2. Tạo group Telegram → Settings → bật **Topics**.
3. Add bot vào group → promote **Admin** với quyền **Manage Topics** + **Pin Messages**.
   (Bot không phải admin thì không nhận được tin trong topic và không tạo được topic.)
4. Lấy group id (dạng `-100…`) → `TG_CHAT_ID`. Nhắn 1 câu trong group rồi mở
   `https://api.telegram.org/bot<TOKEN>/getUpdates` để xem `"chat":{"id":-100…}`.
5. Đổi `TG_WEBHOOK_SECRET` và `SETUP_KEY` thành chuỗi ngẫu nhiên dài.
6. Upload cả thư mục `chat/` lên host (cần PHP ≥ 7.4 với `pdo_sqlite`, `curl`; `chat/data` phải ghi được).
7. Mở `https://ndtify.com/chat/setup.php?key=<SETUP_KEY>` → mọi dòng phải ✅ → bấm **Register webhook**.

### Dùng hằng ngày (trong Telegram)

- Gõ bình thường trong topic để trả lời khách. Ảnh / file / sticker đều gửi được.
- `/close` – đóng hội thoại (topic cũng đóng). Khách nhắn lại thì topic tự mở lại.
- `/info` – xem lại thông tin khách (tên, email, trang đang xem, trình duyệt, IP).
- Sửa tin nhắn trong Telegram → nội dung trên web cũng cập nhật.

### Widget

Cấu hình trong `index.html` qua `window.NDT_CHAT` (title, greeting, offlineGreeting, position `left|right`,
askEmail, sound). Mở chat từ bất kỳ link nào bằng `data-chat-open`, hoặc `NDTChat.open()`.
Trạng thái "Online" hiện khi có agent trả lời trong 10 phút gần nhất (`CHAT_ONLINE_WINDOW`).

### Chạy local

```bash
php -S 127.0.0.1:8080 -t .
# Telegram không gọi được webhook về localhost → kéo tin thủ công:
curl "http://127.0.0.1:8080/chat/pull.php?key=<SETUP_KEY>&drop_webhook=1"
# (nhớ đăng ký lại webhook ở setup.php khi lên production)
```

## Chạy thử

Live chat cần PHP, nên **không** mở `index.html` trực tiếp hay dùng `python -m http.server`
(widget sẽ báo "Chat server unavailable" và tin nhắn đỏ Retry). Chạy:

```bash
brew install php          # 1 lần, nếu máy chưa có
php -S 127.0.0.1:8080 -t .
# → http://127.0.0.1:8080
```

## Checklist trước khi launch

- [ ] Thay toàn bộ ảnh placeholder trong `images/` (xem `IMAGES.md`)
- [ ] Đổi domain `https://ndtify.com/` trong `<link rel="canonical">`, OG tags, JSON-LD nếu dùng domain khác
- [ ] Thay sản phẩm mẫu bằng sản phẩm thật (giá, mô tả, link mua)
- [ ] Xoá hoặc thay section Đánh giá bằng review thật
- [ ] Gắn form newsletter vào Mailchimp / Brevo / Google Sheets
- [ ] Nối nút "Buy now" với Lemon Squeezy / Paddle (checkout + license key + thuế)
- [ ] Live chat: đổi 2 secret trong `chat/config.php`, upload `chat/`, chạy `setup.php` đăng ký webhook
- [ ] Thêm `robots.txt`, `sitemap.xml`, Google Search Console, GA4
- [ ] Viết 4 trang pháp lý: Terms, Privacy, Refund Policy, License Agreement
