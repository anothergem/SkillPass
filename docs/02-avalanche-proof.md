# Avalanche Integration Proof (điền sau khi deploy)

> Môi trường tạo project không truy cập được Avalanche RPC nên contract **chưa được deploy thật**. Contract đã biên dịch và pass 5 test trong EVM cục bộ. **Bạn phải deploy và dán link thật vào đây** trước khi nộp.

| Hạng mục | Giá trị |
|---|---|
| Mạng | Avalanche **Fuji** (C-Chain testnet, chainId 43113) |
| Contract | `contracts/SkillPassRegistry.sol` (Solidity 0.8, evmVersion paris) |
| Địa chỉ | `[ĐIỀN]` → https://testnet.snowtrace.io/address/`<địa chỉ>` |
| Tx deploy | `[ĐIỀN]` |
| Ví issuer | `[ĐIỀN]` |

## Giao dịch chứng minh
| # | Hành động | Tx hash | Snowtrace |
|---|---|---|---|
| 1 | issue | `[ĐIỀN]` | |
| 2 | issue | `[ĐIỀN]` | |
| 3 | issue | `[ĐIỀN]` | |
| 4 | revoke | `[ĐIỀN]` | |

Ảnh chụp cần có: ví ký giao dịch · trang Verify "Valid" · "Not found" sau khi sửa · "Revoked".

## Cách deploy (≈5 phút)
1. Tạo **ví riêng chỉ để test** (Core/MetaMask), xuất private key của ví này. Không dùng ví có tiền thật.
2. Lấy AVAX test tại https://team1vn.xyz/faucet.html (hoặc faucet chính thức của Avalanche).
3. `PRIVATE_KEY=0x… npm run deploy:fuji` → in ra địa chỉ contract.
4. Dán vào `.env`: `VITE_REGISTRY_ADDRESS=0x…` rồi `npm run dev`.
5. (Tuỳ chọn) Verify source trên Snowtrace để giám khảo đọc được code.

## Vì sao thiết kế này ăn điểm Avalanche (25đ)
- On-chain logic thật (không chỉ chuyển tiền): ghi, đọc, thu hồi, phân quyền issuer, event.
- Tương thích EVM: dùng viem, chạy được trên Fuji, C-Chain mainnet hoặc **L1 riêng** của trường/đơn vị chỉ bằng đổi RPC.
- Phí thấp, xác nhận nhanh: hợp với credential số lượng lớn.

## Hạn chế thật thà
- Ai cũng có thể là issuer; độ tin cậy dựa vào danh sách issuer tin cậy (`VITE_TRUSTED_ISSUERS`). Roadmap: registry cho phép issuer (allowlist/multisig).
- Hash dùng SHA-256 tính ở trình duyệt, không phải keccak (không ảnh hưởng bảo mật, chỉ khác chuẩn thường dùng của EVM).
- Chưa audit contract.
