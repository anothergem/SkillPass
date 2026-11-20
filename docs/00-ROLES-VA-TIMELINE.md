# Phân vai, lịch 2 ngày và checklist nộp bài — Team1 UniHack 2026

## Thể lệ cần nhớ (nguồn: team1vn.xyz)
| Mục | Nội dung |
|---|---|
| **Hạn nộp** | **23:59 thứ Bảy 21/11/2026** (giờ VN). Nên nộp trước 18:00 để còn sửa lỗi link |
| Quy mô đội | Tối đa 3 người → **đội 2 người hợp lệ** |
| Bắt buộc | Chạy trên Avalanche (L1 riêng / **Fuji testnet** / C-Chain mainnet). Phần Avalanche Integration chiếm 25 điểm |
| Nộp ở đâu | team1vn.xyz → đăng nhập → trang hồ sơ → **Submit Project** (có lưu nháp, **chỉ tính khi bấm Submit**) |
| Cần nộp | (1) GitHub repo công khai, hoặc riêng tư và thêm collaborator **tuantqse90**; (2) Slide pitch (link Canva/Google Slides); (3) Video demo 2–3 phút; (4) Tài liệu khác nếu có |
| Cảnh báo | Mọi link phải mở được với giám khảo, nếu không có thể bị loại → mở thử bằng cửa sổ ẩn danh |
| Chung kết | Demo Day 09:00–11:30, 30/11/2026 tại Greenwich Vietnam, 20 Công Hòa, TP.HCM (chỉ 10 đội vào chung kết phải có mặt) |

## Vì sao SkillPass là đề tài dễ nhất
- Thể lệ cho phép chọn chủ đề gợi ý, kết hợp, hoặc **tự đề xuất**; dự án web2 cũng được nếu có phần Avalanche.
- SkillPass chỉ cần **1 contract Solidity ~40 dòng** (đã viết, đã biên dịch, đã test chạy trong EVM cục bộ), không cần database, không cần token.
- Có sẵn phần AI (Claude + rubric offline) để ăn điểm Creativity.
- Hỏi lại ban tổ chức (Telegram t.me/Team1VNbuilders) xem đề tài này có khớp danh mục gợi ý nào không; **không bắt buộc** theo danh mục.

## Phân vai

### Người A — Tech (Dev + deploy)
- Cài đặt, chạy app, **deploy contract lên Fuji** (`npm run deploy:fuji`), cấu hình `.env`.
- Phát hành 3+ credential thật, 1 revoke thật, lưu link Snowtrace → `docs/02-avalanche-proof.md`.
- Deploy web (Vercel) + API (Render) hoặc quay demo từ local nếu thiếu thời gian.
- Nối Claude API (tuỳ chọn), chạy ví dụ AI → `docs/03-ai-feature.md`.
- Dọn repo, README, đẩy GitHub, kiểm tra link.

### Người B — Product, Pitch, Video
- Làm slide (Canva/Google Slides) theo `docs/05-pitch-deck-outline.md`.
- Phỏng vấn nhanh 3–5 người (sinh viên/BTC CLB) lấy 2–3 câu trích dẫn cho slide Vấn đề và Impact.
- Quay + dựng video 2–3 phút theo `docs/06-demo-video-script.md`.
- Điền `docs/01` và `docs/07`; điền form **Submit Project**.

### Cả hai
Họp 10 phút đầu/cuối mỗi ngày · A kiểm tra tính đúng kỹ thuật của deck · B dùng thử app như người ngoài · tập pitch 3 lần.

## Lịch (hôm nay Thứ Năm 19/11 đã 17:30)
| Khi nào | Người A | Người B |
|---|---|---|
| **Tối 19/11** | `npm install`, chạy local, lấy AVAX test ở team1vn.xyz/faucet.html, **deploy contract** | Đăng nhập team1vn.xyz, xem form Submit; lên dàn ý slide; hẹn 3–5 người phỏng vấn |
| **Ngày 20/11** | Phát hành 3 credential + 1 revoke; deploy web; test link xác minh trên máy khác; push GitHub | Phỏng vấn; hoàn thiện slide bản 1; viết `01`, `07` |
| **Sáng 21/11** | Sửa lỗi, đóng băng code, quay màn hình demo | Dựng video, hoàn thiện slide |
| **Chiều 21/11** | Kiểm tra mọi link bằng cửa sổ ẩn danh | **Bấm Submit trước 18:00**, chụp màn hình xác nhận |

## Checklist nộp bài
- [ ] Contract đã deploy trên Fuji, địa chỉ ghi trong README và `docs/02`
- [ ] ≥3 credential + 1 revoke thật, có link Snowtrace
- [ ] GitHub repo (public hoặc đã add `tuantqse90`), không chứa `.env`/private key
- [ ] Slide pitch: link xem được không cần đăng nhập
- [ ] Video 2–3 phút có **demo thật** (YouTube unlisted/Drive "anyone with link")
- [ ] Đã bấm **Submit** (không chỉ lưu nháp)
