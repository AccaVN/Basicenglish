# Học Vui English — Phrase Learning MVP

Website học tiếng Anh cho người mới bắt đầu, nội dung tiến dần từ A1 lên A2 rồi B1, xây dựng bằng Next.js, TypeScript, Neon PostgreSQL và Drizzle ORM.

## ⚠️ Kiến trúc bản này: cụm từ là file JSON tĩnh trên Vercel, KHÔNG lưu trong database

Đây là bản **static** (khác bản merged trước đó). 500 cụm từ chỉ nằm trong file
`data/phrases-500.json`, được đóng gói cùng app khi deploy lên Vercel và đọc qua
`src/lib/content.ts`. **Neon chỉ lưu duy nhất:** tài khoản người dùng/auth, tiến độ
SRS, lịch sử ôn, XP, hoạt động ngày và lượt luyện nói.

- **Không có bước seed cụm từ vào database.** Lệnh `npm run db:seed` cũ đã bị xóa;
  `npm run db:seed` hiện tại chỉ in thông báo nhắc điều này, không chèn gì cả.
- **Sửa cụm từ =** sửa `data/phrases-500.json`, chạy `npm run content:validate`,
  commit và deploy lại trên Vercel. Trang admin cụm từ chỉ còn xem nội dung, không
  sửa được qua database nữa.
- **ID ổn định của cụm từ** (Neon lưu dạng text, không có khóa ngoại tới bảng nội
  dung): `topicSlug/lessonSlug/001`, ví dụ
  `greetings-introductions/basic-greetings/001` và
  `phone-email/phone-calls-and-emails/007`.
- **Đường dẫn bài học mới:** `/learn/<lessonSlug>`, ví dụ `/learn/basic-greetings`.
  Đường dẫn cũ của bản merged dùng uuid của database (`/learn/<uuid>`) **không còn
  hoạt động**, vì bảng `topics`/`lessons`/`phrases`/`phraseExamples` đã bị xóa khỏi
  schema và migration.
- **Chưa deploy:** người dùng chưa deploy bản này. Vì vậy migration ban đầu được thay
  thế hoàn toàn bằng file mới `drizzle/migrations/0000_fluffy_thaddeus_ross.sql`
  (tạo bằng `drizzle-kit generate` từ schema mới) — không có dữ liệu production nào
  cần giữ lại, nên việc thay migration là an toàn ở giai đoạn này.
- **Bản vá build Vercel 2026-10-29:** sửa `eslint.config.mjs` sang dùng FlatCompat
  (vì `eslint-config-next` 15.5.28 không còn file `core-web-vitals` không có đuôi
  `.js`), sửa 2 link `<a>` thành `<Link>` ở trang login/verify-request để qua
  lint của Next, và giới hạn `tsconfig.json` chỉ kiểm tra `src/` + `auth.ts`
  (thư mục `scripts/` không còn làm hỏng `next build` nếu còn sót file seed cũ).
  File `scripts/seed-phrases.ts` đã bị xóa khỏi bản này — nếu repo trên GitHub
  vẫn còn file đó, hãy xóa nó trước khi deploy lại.

## Bản sửa 2026-10-29: cụm từ khó hơn, có IPA, ví dụ hoặc hội thoại, layout mới

- **Nội dung khó hơn và phong phú hơn:** 500 cụm từ được viết lại, tiến dần
  A1 → A2 → B1, gồm collocations, phrasal verbs, ngôn ngữ văn phòng TOEIC,
  yêu cầu lịch sự, họp, email, du lịch và dịch vụ khách hàng. Không trùng
  cụm từ, không lặp mẫu câu ví dụ.
- **Mỗi cụm từ có đúng 1 minh họa sử dụng:** hoặc 1 câu ví dụ, hoặc 1 đoạn
  hội thoại ngắn 2–3 lượt dùng cụm từ đó. Trường `usageType` trong JSON là
  `"example"` hoặc `"dialogue"`.
- **Phiên âm IPA:** mỗi cụm từ có `ipa`, câu ví dụ có `exampleIpa`, mỗi lượt
  hội thoại (cả đoạn hội thoại theo cụm từ và 10 hội thoại mẫu trong
  `data/dialogues.json`) đều có `ipa`. **Phiên âm chỉ mang tính tham khảo,
  chưa được kiểm chứng bởi chuyên gia ngôn ngữ.** Trong giao diện, dòng
  phiên âm luôn kèm ghi chú này.
- **Layout và font tiếng Việt mới:** font chính là Be Vietnam Pro
  (vietnamese subset, qua `next/font/google`), line-height thân bài 1.7,
  tiêu đề không còn letter-spacing âm, bảng màu dịu hơn, thẻ bo tròn,
  bóng mềm, trạng thái focus rõ ràng và responsive tốt hơn trên mobile.
  Đây chỉ là thay đổi giao diện, không đổi logic SRS, auth hay luyện nói.
- **ID ổn định không đổi:** `topicSlug`, `lessonSlug` và `phraseSortOrder`
  của mọi cụm từ được giữ nguyên, nên ID `topicSlug/lessonSlug/001` và
  lịch ôn SRS đã lưu trong Neon vẫn khớp.
- **File CSV:** `data/phrases-500.csv` được tạo lại bằng script từ JSON cuối
  cùng (JSON vẫn là nguồn thật duy nhất).

## Rà soát IPA 2026-10-29 (bản `-checked` này)

Toàn bộ 1.387 chuỗi IPA đã được rà soát lại từng từ, từng chữ, theo từng
chủ đề: 500 `ipa` của cụm từ, 249 `exampleIpa`, 558 `ipa` của các lượt hội
thoại theo cụm từ trong `data/phrases-500.json`, và 80 `ipa` của 10 hội thoại
mẫu trong `data/dialogues.json`. Chỉ các trường IPA thay đổi; văn bản tiếng
Anh, tiếng Việt, `topicSlug`, `lessonSlug`, `phraseSortOrder`, ID ổn định,
level, `usageType`, layout, font và logic code đều không đổi.

Quy ước đã thống nhất và áp dụng xuyên suốt: phát âm Mỹ (General American),
kiểu từ điển cho người học, trong dấu gạch chéo `/.../`, trọng âm chính `ˈ`,
trọng âm phụ `ˌ` khi cần, giữ nguyên bộ ký hiệu cũ (kể cả `ː` cho nguyên âm
dài) chứ không đổi sang hệ ký hiệu khác. Các dạng yếu của từ chức năng được
thống nhất theo trọng âm trong câu, ví dụ `to` không nhấn là `/tə/`, `your`
không nhấn là `/jʊr/`, `and` không nhấn là `/ən/`, `for` không nhấn là
`/fər/`; các dạng mạnh ở cuối câu hoặc khi nhấn mạnh được giữ nguyên
(ví dụ `to` ở cuối câu, `four`, `too`, `two`).

Kết quả rà soát: 584/1.387 chuỗi IPA được sửa. Các lỗi chủ yếu là dạng yếu
không nhất quán, tiếp đó là nguyên âm, trọng âm, hậu tố `-ed`/`-es`, từ
thừa/thiếu trong phiên âm và ký tự lạ (gạch ngang dài, dấu ngoặc kép) lọt
vào IPA. **Nói rõ và trung thực: đây là một lần rà soát hệ thống bằng kiến
thức từ điển/AI, KHÔNG phải kiểm chứng của người bản ngữ hay chuyên gia ngữ
âm, và không thể khẳng định là chuẩn 100%.** Nếu phát hiện phiên âm nào vẫn
sai, hãy sửa trực tiếp trong JSON, chạy `npm run content:validate` rồi
deploy lại. File CSV cũng được tạo lại bằng script từ JSON cuối cùng.

## Tính năng hiện có

- Trang giới thiệu responsive và danh sách chủ đề/bài học từ file JSON tĩnh.
- Trang học theo bài với flashcard, lật thẻ, phiên âm IPA, ví dụ hoặc đoạn hội thoại ngắn Anh–Việt và phát âm qua Web Speech API của trình duyệt.
- Tự đánh giá mức độ ghi nhớ: Quên rồi / Khó nhớ / Đã nhớ / Rất dễ.
- Lưu lịch ôn SRS, lịch sử ôn, XP và hoạt động ngày qua API có xác thực (Neon chỉ lưu các dữ liệu này, kèm ID cụm từ dạng text).
- Trang ôn các thẻ đến hạn và dashboard thống kê cơ bản.
- Trang admin xem nội dung (chỉ xem), Auth.js Google OAuth/email, Neon PostgreSQL, Drizzle migrations.
- Bộ dữ liệu học có 500 cụm từ tiếng Anh, nghĩa tiếng Việt, phiên âm IPA và ví dụ hoặc hội thoại ngắn song ngữ, phân loại thành 23 chủ đề, lưu dạng JSON tĩnh. Phiên âm chỉ mang tính tham khảo.
- GitHub Actions chạy typecheck, lint và unit tests.

> AI đánh giá phát âm và hội thoại realtime chưa được tích hợp. Phát âm hiện tại dùng speech synthesis của trình duyệt; đây không phải công cụ chấm phát âm.

## Bản hợp nhất — MVP + luyện nói (mới)

Bản này giữ nguyên nền tảng MVP (SRS, Auth.js, dashboard, review) và thêm
phần luyện nói đã chạy được, port từ bản `english-toeic300`. Không thay đổi model đăng nhập
của MVP (vẫn yêu cầu đăng nhập mới vào khu vực học/luyện nói). Khác với bản merged gốc,
bản static này ĐÃ thay migration: bảng nội dung (`topics`/`lessons`/`phrases`/
`phrase_examples`) bị xóa, trang admin cụm từ chỉ còn xem nội dung (xem mục kiến trúc
ở đầu README).

### Luyện nói gồm những gì?

- **Trang `/speaking` (hub):** giới thiệu 2 chế độ, yêu cầu Chrome/Edge + quyền micro.
- **Nhại lại `/speaking/shadowing`:** chọn chủ đề trong 23 chủ đề, nghe câu mẫu
  (`speechSynthesis`), nói lại (`SpeechRecognition`), xem điểm khớp /100 và từ còn thiếu,
  có ô gõ câu để kiểm tra khi trình duyệt không hỗ trợ nhận diện. Trong bản static này
  trang chỉ lấy cụm từ từ file JSON tĩnh `data/phrases-500.json`, không truy vấn
  database lấy nội dung nữa.
- **Hội thoại mẫu `/speaking/roleplay`:** 10 hội thoại viết sẵn trong `data/dialogues.json`,
  mỗi hội thoại 8 lượt. Bạn đóng vai B, nói đúng câu trả lời đã cho sẵn; đạt từ 60/100 mới
  sang lượt tiếp theo.
- **Lưu kết quả:** `POST /api/speaking` lưu vào 2 bảng sẵn có của MVP là
  `speaking_sessions` và `speaking_turns` (không sửa migration). Vì schema không có cột điểm
  số riêng, điểm khớp được lưu trong `speaking_turns.feedback.pronunciation`
  (ví dụ: `Điểm khớp: 85/100`) và tóm tắt ở `speaking_sessions.summary`.
  Việc lưu là best-effort: nếu database lỗi, bạn vẫn thấy điểm ngay trên trang.

### Luyện nói làm được và chưa làm được

- Làm được, không cần API key trả phí: nghe mẫu, nhận diện giọng nói bằng Web Speech API
  của trình duyệt, so sánh từ với câu mẫu, hội thoại mẫu theo kịch bản.
- Chưa làm được: trò chuyện tự do với AI, chấm phát âm chuyên sâu (ngữ điệu, trọng âm),
  chấm ngữ pháp tự do. Muốn có các tính năng đó, cần thêm API key OpenAI/Gemini và một
  endpoint AI riêng — đó là bước nâng cấp sau, không có trong bản này.
- Giới hạn thực tế: nhận diện tốt nhất trên Chrome/Edge, nói chậm rõ, nơi yên tĩnh;
  Safari/Firefox hỗ trợ nhận diện kém hoặc không có — khi đó dùng ô gõ câu.

### File mới trong bản hợp nhất

- `src/lib/speech.ts` — helper Web Speech + tính điểm khớp từ.
- `src/lib/dialogues.ts` + `data/dialogues.json` — 10 hội thoại mẫu x 8 lượt.
- `src/components/speaking/Shadowing.tsx`, `src/components/speaking/Roleplay.tsx`.
- `src/app/(learn)/speaking/page.tsx` (hub, thay trang placeholder cũ),
  `src/app/(learn)/speaking/shadowing/page.tsx`,
  `src/app/(learn)/speaking/roleplay/page.tsx`.
- `src/app/api/speaking/route.ts` — lưu lượt luyện nói (đã đăng nhập, có database).

Biến môi trường không đổi so với MVP: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`,
`AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `EMAIL_SERVER`, `EMAIL_FROM`.
Luyện nói không cần thêm biến môi trường hay API key nào.

## Yêu cầu

- Node.js 20.9 trở lên
- Database Neon PostgreSQL
- Google OAuth credentials (nếu bật Google sign-in)
- SMTP dùng cho email magic link

## Chạy local

1. Clone repository và cài dependencies:

   ```bash
   git clone https://github.com/YOUR-USERNAME/english-learning-mvp.git
   cd english-learning-mvp
   npm install
   ```

2. Sao chép `.env.example` thành `.env` và cấu hình `DATABASE_URL`, `AUTH_SECRET`, OAuth/email provider.

3. Áp dụng migration SQL mới trên database development Neon bằng Neon SQL Editor:

   `drizzle/migrations/0000_fluffy_thaddeus_ross.sql`

   Migration này KHÔNG tạo bảng `topics`/`lessons`/`phrases`/`phraseExamples`
   nữa — chỉ tạo bảng auth, tiến độ SRS, lịch ôn, XP, hoạt động ngày, luyện nói
   và vai trò admin. Đây là migration thay thế hoàn toàn, vì app chưa từng deploy
   nên không có dữ liệu production cần migrate.

4. Kiểm tra bộ nội dung tĩnh (không cần kết nối database):

   ```bash
   npm run content:validate
   ```

   Kỳ vọng: 500 cụm từ, 23 chủ đề, 500 ID ổn định duy nhất.

5. **KHÔNG seed cụm từ vào database.** Trong bản static này không còn bước seed
   nội dung. Cụm từ đã nằm trong `data/phrases-500.json` và sẽ đi kèm bản deploy
   trên Vercel. Muốn sửa nội dung, sửa file JSON rồi deploy lại (xem mục kiến trúc
   ở đầu README và `docs/PHRASE_CONTENT_GUIDE.md`). File CSV chỉ là bản hỗ trợ
   biên tập, cần đồng bộ tay với JSON — hiện chưa có script chuyển CSV thành JSON.

   Nội dung được biên soạn cho mục tiêu A1–A2/TOEIC nền tảng, nhưng vẫn nên có người có chuyên môn rà soát trước khi coi đây là giáo trình chính thức.

6. Chạy app:

   ```bash
   npm run dev
   ```

7. Mở `http://localhost:3000`.

## Lệnh thường dùng

```bash
npm run dev          # development server
npm run typecheck    # TypeScript checks
npm run lint         # ESLint
npm test             # unit tests
npm run build        # production build
npm run db:generate  # generate Drizzle migration
npm run db:migrate   # apply migrations configured in drizzle.config.ts
npm run db:seed      # no-op message: phrases are static JSON, not seeded
npm run content:validate # validate static phrase content (500 phrases, unique stable IDs)
npm run admin:promote -- admin@example.com
```

## Auth.js và Google OAuth

- Local Google callback: `http://localhost:3000/api/auth/callback/google`
- Cấu hình `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_SECRET`, `EMAIL_SERVER`, `EMAIL_FROM`.
- Đăng nhập bằng email cần SMTP hoạt động.
- Để cấp admin: đăng nhập tài khoản cần cấp quyền ít nhất một lần, sau đó chạy `npm run admin:promote -- admin@example.com`.
- Không bao giờ cho phép user tự cấp role admin.

## Database và migrations

- `DATABASE_URL`: pooled connection URL cho truy vấn ứng dụng.
- `DATABASE_URL_UNPOOLED`: direct URL dùng cho migration.
- Neon chỉ lưu: users/auth, `user_phrase_progress`, `review_logs`, `xp_events`,
  `daily_activity`, `speaking_sessions`, `speaking_turns`, `user_roles`,
  `admin_audit_logs`. `phrase_id` trong `user_phrase_progress` và `review_logs`
  là text ID ổn định dạng `topicSlug/lessonSlug/001`, không có khóa ngoại tới
  bảng nội dung (vì bảng nội dung không còn tồn tại).
- Cập nhật schema trong `src/lib/db/schema`, chạy `npm run db:generate`, review SQL và thử trên database development trước khi chạy production.
- Giữ database Preview tách biệt với Production.

## Deploy GitHub + Vercel

1. Tạo repository mới trên GitHub và push source code.
2. Import repository từ Vercel.
3. Thêm biến môi trường trong Vercel Preview/Production. Không commit `.env` hoặc secret vào GitHub.
4. Dùng Neon branch/database riêng cho Preview; database production riêng cho Production.
5. Chạy migration mới (`drizzle/migrations/0000_fluffy_thaddeus_ross.sql`) trước khi deploy. Không chạy `db:seed` cho cụm từ — nội dung đã nằm trong code.
6. Thêm callback URL của domain production vào Google OAuth.
7. Kiểm tra đăng nhập, `/api/health`, học bài, ghi nhận ôn tập và quyền admin trên deployment.

## GitHub push lần đầu

```bash
git init
git add .
git commit -m "feat: phrase learning MVP"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/english-learning-mvp.git
git push -u origin main
```

## Trước khi public cho người dùng thật

- Rà soát nội dung 500 cụm từ và ví dụ với người biên tập tiếng Anh trước khi coi là giáo trình chính thức.
- Cấu hình rate limit cho endpoint ghi nhận ôn tập và endpoint AI tương lai.
- Xem xét timezone người dùng cho streak và hoạt động theo ngày.
- Thêm backup/restore drill, monitoring và chính sách lưu dữ liệu.
- Kiểm thử phân quyền và chống request lặp.
- Chỉ tích hợp upload/audio AI sau khi xác thực file type, kích thước và giới hạn chi phí.

## License

MIT — xem [LICENSE](./LICENSE).
