# Hướng dẫn chuẩn hóa nội dung cụm từ (bản static)

## Nội dung nằm ở đâu?

Trong bản này, cụm từ **không lưu trong database**. Nguồn duy nhất là file
`data/phrases-500.json`, được đóng gói cùng app khi deploy lên Vercel và đọc qua
`src/lib/content.ts`. Neon chỉ lưu tài khoản, tiến độ SRS, lịch ôn, XP, hoạt động
ngày và lượt luyện nói.

Để sửa nội dung: sửa `data/phrases-500.json`, chạy `npm run content:validate`,
commit và deploy lại trên Vercel. File `data/phrases-500.csv` chỉ là bản hỗ trợ
biên tập bằng bảng tính — hiện **chưa có script chuyển CSV thành JSON**, nên nếu
sửa bằng CSV thì phải đồng bộ tay sang JSON (JSON mới là nguồn thật). Không chạy
bước seed nào vào database, và trang admin cụm từ chỉ xem nội dung, không sửa
được qua database.

Mỗi cụm từ được gắn với một bài học; bài học thuộc một chủ đề. Trước khi deploy, hãy kiểm tra:

- `phrase`: cụm từ tiếng Anh tự nhiên, tối đa 300 ký tự.
- `meaningVi`: nghĩa tiếng Việt rõ ràng, không dịch từng chữ nếu không tự nhiên.
- `exampleEn`: câu ví dụ ngắn, phù hợp A1–A2, thể hiện đúng cách dùng cụm từ.
- `exampleVi`: bản dịch tự nhiên của câu ví dụ.
- Phát âm dùng speech synthesis của trình duyệt (không có trường audio URL trong JSON này).

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

Bộ nội dung hiện có 500 cụm từ phân loại theo 23 chủ đề, với nghĩa tiếng Việt và ví dụ song ngữ. Chạy `npm run content:validate` để kiểm tra số lượng, trường bắt buộc, trùng lặp và ID ổn định duy nhất. Nội dung phù hợp làm bản MVP; nên có người biên tập tiếng Anh rà soát trước khi giới thiệu là giáo trình chính thức.
