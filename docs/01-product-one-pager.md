# SkillPass — Product One-Pager

**Một câu:** SkillPass biến bằng chứng học tập thành *chứng chỉ kỹ năng có điểm AI, xác minh trên Avalanche trong 10 giây*, không cần gọi điện hay xin email xác nhận.

| | |
|---|---|
| **Vấn đề** | Chứng nhận workshop/hackathon/CLB thường là PDF/ảnh: dễ làm giả, khó kiểm chứng; nhà tuyển dụng không có thời gian xác minh; sinh viên giỏi thật nhưng thiếu "bằng chứng đáng tin" |
| **Người dùng** | Sinh viên · Đơn vị cấp (BTC hackathon, CLB, trường, bootcamp) · Người xác minh (HR, học bổng, mentor) |
| **Giải pháp** | Đơn vị cấp nhập bằng chứng → **AI chấm theo rubric minh bạch** → ký giao dịch ghi **SHA-256 hash** vào contract trên Avalanche → sinh **link xác minh** mở không cần ví |
| **Khác biệt** | Chấm *bằng chứng* (không chỉ "đã tham dự") · Không lưu dữ liệu cá nhân on-chain · **Thu hồi được** · Không cần database · Phí gần 0 |

## Avalanche được dùng ở đâu
Contract `SkillPassRegistry` (Fuji): `issue(hash, student)`, `revoke(hash)`, `records(hash)` + event `CredentialIssued/Revoked`. Xác minh = đọc `records` (view call, miễn phí, không cần ví).

## Demo 60 giây
1. Issuer nhập bằng chứng → **Evaluate with AI** (điểm + kỹ năng).
2. **Sign & issue** → ví ký → Snowtrace thấy giao dịch.
3. Mở link xác minh → ✔ Valid. Sửa 1 ký tự → ✖ Not found. Revoke → ✖ Revoked.

## Chỉ số thành công (MVP)
≥3 credential thật · xác minh < 10 s · 100% sửa đổi bị phát hiện · ≥5 người dùng thử phản hồi.

## Lộ trình
Gói theo credential cho CLB/hackathon → bootcamp/trường → API cho nhà tuyển dụng; L1 riêng cho trường lớn; token hoá thưởng cho sinh viên (sau khi rà soát pháp lý).
