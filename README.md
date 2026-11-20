# SkillPass ✓ — chứng chỉ sinh viên có điểm AI, xác minh trên Avalanche

Dự án cho **Team1 Vietnam UniHack 2026** (team1vn.xyz). Chạy trên **Avalanche Fuji testnet**.

- Contract Solidity `SkillPassRegistry`: issue / revoke / records (chỉ lưu SHA-256 hash, không có dữ liệu cá nhân)
- AI (Claude + rubric offline dự phòng) chấm bằng chứng của sinh viên
- Link xác minh mở được không cần ví

## Chạy nhanh

Yêu cầu: **Node.js ≥ 20.12**, ví **Core Wallet** hoặc **MetaMask**.

```bash
npm install
cp .env.example .env            # (tuỳ chọn) điền ANTHROPIC_API_KEY; bỏ trống = dùng rubric offline

# 1) Deploy contract lên Fuji (dùng ví TEST riêng, có AVAX test từ https://team1vn.xyz/faucet.html)
PRIVATE_KEY=0x<khoá ví test> npm run deploy:fuji
#   -> in ra địa chỉ; dán vào .env:  VITE_REGISTRY_ADDRESS=0x...

# 2) Chạy web (http://localhost:5173) + API (http://localhost:8787)
npm run dev
```

Trong app: **Connect wallet** (tự chuyển sang Fuji) → *Fill demo data* → **Evaluate with AI** → **Sign & issue** → mở link xác minh. Sửa 1 ký tự trong JSON → "Not found"; bấm **Revoke** ở tab 3 → "Revoked".

## Lệnh
| Lệnh | Việc |
|---|---|
| `npm run dev` | Web + API |
| `npm test` | 20 test (contract trong EVM cục bộ, credential, AI rubric) |
| `npm run compile` | Biên dịch contract → `src/contract/SkillPassRegistry.json` |
| `npm run deploy:fuji` | Biên dịch + deploy lên Fuji |
| `npm run build` | Typecheck + build web |

## Deploy
- **Web:** Vercel/Netlify (`npm run build`, thư mục `dist`). Biến: `VITE_REGISTRY_ADDRESS`, `VITE_FUJI_RPC`, `VITE_TRUSTED_ISSUERS`, `VITE_API_URL`.
- **API:** Render/Railway/Fly (`npm start`; biến `ANTHROPIC_API_KEY`, `PORT`).
- **Không bao giờ commit `.env` hay private key.**

## Việc BẮT BUỘC làm tay (mình không truy cập được Avalanche RPC lúc tạo project)
1. Deploy contract, gửi giao dịch thật bằng ví, dán link Snowtrace vào `docs/02-avalanche-proof.md`.
2. Chạy thử AI thật (nếu dùng key), điền `docs/03-ai-feature.md`.
3. Điền các ô `[ĐIỀN]` ở `docs/01`, `docs/07`.
4. Làm slide theo `docs/05`, quay video theo `docs/06`, nộp trên team1vn.xyz **trước 23:59 21/11/2026**.

**Bắt đầu từ `docs/00-ROLES-VA-TIMELINE.md`** (phân vai 2 người, lịch 2 ngày, checklist nộp bài).
