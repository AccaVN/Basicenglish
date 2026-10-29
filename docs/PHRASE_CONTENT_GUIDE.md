# Hướng dẫn chuẩn hóa nội dung cụm từ (bản static)

## Nội dung nằm ở đâu?

Trong bản này, cụm từ **không lưu trong database**. Nguồn duy nhất là file
`data/phrases-500.json`, được đóng gói cùng app khi deploy lên Vercel và đọc qua
`src/lib/content.ts`. Neon chỉ lưu tài khoản, tiến độ SRS, lịch ôn, XP, hoạt động
ngày và lượt luyện nói.

Để sửa nội dung: sửa `data/phrases-500.json`, chạy `npm run content:validate`,
commit và deploy lại trên Vercel. File `data/phrases-500.csv` được tạo lại từ
JSON cuối cùng để hỗ trợ biên tập bằng bảng tính, nhưng JSON vẫn là nguồn thật
duy nhất — nếu sửa bằng CSV thì phải đồng bộ tay sang JSON. Không chạy
bước seed nào vào database, và trang admin cụm từ chỉ xem nội dung, không sửa
được qua database.

Mỗi cụm từ được gắn với một bài học; bài học thuộc một chủ đề. Mỗi cụm từ có
đúng 1 minh họa sử dụng, được ghi bằng `usageType`: `"example"` hoặc
`"dialogue"`. Trước khi deploy, hãy kiểm tra:

- `phrase`: cụm từ tiếng Anh tự nhiên, tối đa 300 ký tự.
- `meaningVi`: nghĩa tiếng Việt rõ ràng, không dịch từng chữ nếu không tự nhiên.
- `ipa`: phiên âm Mỹ của cụm từ, trong dấu gạch chéo, ví dụ `/həˈloʊ/`.
  Phiên âm đã qua một lần rà soát hệ thống từng từ (1.387 chuỗi IPA, xem
  README), nhưng vẫn chỉ mang tính tham khảo: đó là rà soát bằng kiến thức
  từ điển/AI, chưa được kiểm chứng bởi người bản ngữ hay chuyên gia ngữ âm,
  và không khẳng định chuẩn 100%. Quy ước: phát âm Mỹ, trọng âm chính `ˈ`,
  trọng âm phụ `ˌ` khi cần, giữ `ː` cho nguyên âm dài; từ chức năng không
  nhấn dùng dạng yếu (`to` → `/tə/`, `your` → `/jʊr/`, `and` → `/ən/`,
  `for` → `/fər/`), dạng mạnh chỉ giữ khi nhấn mạnh hoặc ở cuối câu.
- Nếu `usageType` là `"example"`: `exampleEn` là câu ví dụ ngắn dùng cụm từ,
  `exampleVi` là bản dịch tự nhiên, `exampleIpa` là phiên âm của câu ví dụ.
- Nếu `usageType` là `"dialogue"`: `dialogue` là 2–3 lượt hội thoại ngắn,
  mỗi lượt có `speaker` (`"A"` hoặc `"B"`), `en`, `vi` và `ipa`, và ít nhất
  một lượt dùng cụm từ đó một cách tự nhiên.
- Phát âm dùng speech synthesis của trình duyệt (không có trường audio URL trong JSON này).
- Nội dung tiến dần A1 → A2 → B1, ưu tiên collocations, phrasal verbs và
  ngôn ngữ văn phòng TOEIC, tránh lặp mẫu câu.

## ID ổn định — đừng đổi bừa

ID của mỗi cụm từ được sinh từ `src/lib/content.ts` theo dạng
`topicSlug/lessonSlug/phraseSortOrder` (ví dụ
`greetings-introductions/basic-greetings/001`). Neon lưu ID này dạng text trong
`user_phrase_progress` và `review_logs`. Vì vậy:

- Đừng đổi `topicSlug`/`lessonSlug` của bài đang có người học, nếu không lịch ôn
  cũ của họ sẽ không khớp với cụm từ mới (trang ôn sẽ bỏ qua các ID không còn
  trong JSON, không crash, nhưng người học mất lịch ôn của thẻ đó).
- Đừng đổi `phraseSortOrder` trong một bài, vì nó là một phần của ID.
- Thêm cụm từ mới thì dùng `phraseSortOrder` chưa từng dùng trong bài đó để ID
  mới không trùng ID cũ.

Đường dẫn bài học là `/learn/<lessonSlug>`, ví dụ `/learn/basic-greetings`.

## Quy tắc biên tập

1. Ưu tiên cụm từ giao tiếp đời sống và môi trường làm việc cơ bản.
2. Tránh ví dụ dài, thành ngữ hiếm hoặc ngữ pháp vượt xa trình độ mục tiêu.
3. Giữ cách viết nhất quán (dấu câu, chữ hoa, dạng rút gọn).
4. Không sao chép nguyên bộ nội dung từ nguồn không có quyền sử dụng.
5. Kiểm tra trùng lặp sau khi chuẩn hóa chữ thường và khoảng trắng, và kiểm tra
   ID ổn định không trùng (script `content:validate` làm cả hai việc này).
6. Nên được người biên tập tiếng Anh kiểm duyệt trước khi xuất bản công khai.

Bộ nội dung hiện có 500 cụm từ phân loại theo 23 chủ đề, với nghĩa tiếng Việt, phiên âm IPA và ví dụ hoặc hội thoại ngắn song ngữ. Chạy `npm run content:validate` để kiểm tra số lượng, trường bắt buộc (IPA, ví dụ/hội thoại), trùng lặp và ID ổn định duy nhất. Nội dung và phiên âm nên có người biên tập tiếng Anh rà soát trước khi giới thiệu là giáo trình chính thức, vì phiên âm hiện chỉ mang tính tham khảo.
