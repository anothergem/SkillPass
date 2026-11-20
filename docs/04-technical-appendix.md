# Technical Appendix

## Kiến trúc
```
Browser (Vite + React + TS + viem)
 ├─ credential.ts : canonicalize → SHA-256 (bytes32)
 ├─ chain.ts      : connect wallet (EIP-1193, Core/MetaMask) → Fuji → registry.issue / revoke / records
 └─ /api/evaluate ─────────► Express (server/index.ts)
                              ├─ Claude (Anthropic Messages API) nếu có key
                              └─ Rubric offline nếu lỗi/không key
Avalanche Fuji: SkillPassRegistry (Solidity)
Verify: records(hash) (view call) → so issuer + revoked → Valid / Revoked / Not found / Issuer mismatch
```

## Bảo mật
| Chủ đề | Quyết định |
|---|---|
| Dữ liệu cá nhân | Không ghi on-chain, chỉ hash; credential nằm trong link chia sẻ + localStorage |
| Chống sửa | Hash trên JSON chuẩn hoá (khoá sắp xếp đệ quy) |
| Giả mạo issuer | So `records(hash).issuer` với `credential.issuer`; badge trusted issuer |
| Thu hồi | `revoke(hash)` chỉ issuer gọi được |
| Prompt injection | Bằng chứng là dữ liệu không tin cậy; đầu ra ép kiểu + lọc |
| API key | Chỉ ở server; rate limit 20 req/phút/IP; body ≤ 32 KB |

## Kiểm thử (`npm test`, 20 test)
- `contracts/registry.test.ts` (5): chạy **bytecode đã biên dịch** trong EVM cục bộ (@ethereumjs/vm): issue, chặn trùng, chỉ issuer revoke, revoke 1 lần, hash lạ.
- `src/lib/credential.test.ts` (11): chuẩn hoá, hash ổn định, share link, 4 kết quả xác minh.
- `server/evaluate.test.ts` (4): rubric offline, kẹp điểm, lọc tag.

**Chưa kiểm thử tự động:** gửi giao dịch qua ví thật lên Fuji và gọi Claude thật (cần mạng/khoá) → làm thủ công theo `02`, `03`.

## Cấu trúc
```
contracts/  SkillPassRegistry.sol (+ test)      scripts/  compile.mjs · deploy.mjs
src/lib/    credential · chain · api · storage  src/components/  Issue · Verify · MyCredentials
server/     Express + AI evaluator              docs/  tài liệu nộp bài
```

## Hạn chế đã biết
Chưa verify source trên Snowtrace · bundle > 500 kB chưa chia chunk · rate limit trong bộ nhớ · localStorage mất khi xoá trình duyệt (link vẫn xác minh được).
