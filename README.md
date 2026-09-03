# Lab Log

Trang học tập chạy trên máy cá nhân. React + TypeScript + Vite.
Không đăng nhập, không server, không Docker.

```bash
npm install
npm run dev      # http://localhost:5173
```

## Mỗi bài gồm hai phần

**1 · Lý thuyết** — năm tầng, đi từ trên xuống. Mỗi tầng trả lời một câu hỏi khác nhau:

| Tầng | Câu hỏi nó trả lời |
|---|---|
| Vấn đề | Chuyện gì đang hỏng nếu không có kỹ thuật này? |
| Vì sao không dùng cách khác | Những cách hiển nhiên hơn sai ở đâu? |
| Ý tưởng cốt lõi | Nói một câu thì nó là gì? |
| Cơ chế | Máy thật sự làm gì? |
| Chi tiết và đánh đổi | Dùng sai thì hỏng kiểu nào? |

Mỗi tầng có phần **tự kiểm** — câu hỏi hiện trước, đáp án ẩn cho tới khi bấm.
Đánh dấu "đã nắm" từng tầng, tiến độ lý thuyết hiện ở trang chủ.

**2 · Thực hành** — các task, mỗi task có mục tiêu, các bước kèm code, điều kiện hoàn thành,
và ô dán kết quả (văn bản + ảnh).

## Song ngữ

Nút chuyển ở góc trên: **Việt / Song ngữ / English**. Chế độ song ngữ đặt nguyên văn
tiếng Anh lên trên (chữ nghiêng, có vạch bên trái), bản dịch ngay dưới.

Trong code, mỗi đoạn là `bi(en, vi)`. Đoạn nào chỉ có tiếng Việt thì dùng `vi(...)`.

## Nội dung nằm ở đâu

```
src/content/
  a00.ts            A00 — dựng môi trường
  a01.ts            A01 — chạm mặt dữ liệu
  a02.ts            A02 — task thực hành
  a02.theory.ts     A02 — lý thuyết + thuật ngữ (tách riêng vì dài)
  index.ts          danh sách 16 bài; A03–A15 đang khoá
```

Mở bài mới: viết `src/content/aNN.ts` theo khuôn `a02.ts`, import vào `index.ts`,
thay dòng `locked('ANN', …)` tương ứng.

## Kết quả lưu ở đâu

Mỗi bài một bản ghi riêng: `lab-log:progress:a02`. Xoá một bài không ảnh hưởng bài khác.
Sao lưu ở **Cài đặt** — xuất toàn bộ hoặc riêng từng bài.

Ảnh lưu base64, trình duyệt giới hạn ~5 MB cho cả trang, tức chừng 10–15 ảnh.
Đầy thì trang báo lỗi lúc lưu chứ không im lặng bỏ qua.
