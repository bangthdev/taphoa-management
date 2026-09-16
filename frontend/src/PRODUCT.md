# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Người dùng chính (đã xác nhận 09/09/2026):** chủ cửa hàng và nhân viên bán hàng của một
cửa hàng tạp hóa gia đình, làm việc trên **laptop/PC màn hình lớn**, ngồi, dùng chuột và bàn
phím. Không phải tablet cầm tay, không phải điện thoại. Mật độ thông tin cao là chấp nhận
được; thao tác chạm bằng ngón tay không phải ràng buộc.

Hai vai trò trong hệ thống: `admin` (Quản lý — thấy Báo cáo) và `staff` (Nhân viên — bắt
buộc mở ca trước khi bán).

**Khán giả thứ hai, hiện đang là ưu tiên số một:** hiring manager xem demo 2–3 phút qua màn
hình chia sẻ. Cửa hàng **chưa dùng chính thức**, nên hiện chưa có thói quen người dùng nào
cần bảo vệ ngoài luồng POS.

## Product Purpose

Thay thế KiotViet cho cửa hàng tạp hóa của gia đình tác giả. KiotViet chạy được nhưng người
nhà dùng không quen, và ba việc quan trọng nhất thì nó không giải quyết:

1. **Hạn sử dụng** — hàng nằm quá hạn không ai để ý, phát hiện ra thì chỉ còn bỏ.
2. **Công nợ khách** — khách lẻ không lưu được thông tin (chưa có chương trình tích điểm nên
   không có cớ để hỏi); chỉ người quen mới ghi nợ được. Đây vẫn là phần khó nhất, chưa xong.
3. **Lãi thật** — trước chỉ nhìn được doanh thu, không tính ra lợi nhuận thực.

## Positioning

Quản lý tồn kho **theo lô kèm hạn sử dụng**, không chỉ theo số lượng — đó là thứ khiến cảnh
báo hết hạn có thật thay vì chỉ là báo tồn thấp. Lợi nhuận tính từ giá vốn (COGS) theo từng
hoá đơn, không suy từ doanh thu.

## Operating Context

- Cửa hàng mở sớm, đóng muộn; ca bán hàng là đơn vị làm việc thật (mở ca → bán → đóng ca,
  đối chiếu tiền mặt lý thuyết với thực tế).
- Phần lớn khách là khách lẻ không định danh. Chỉ khách quen mới có hồ sơ và công nợ.
- Hàng nhập theo lô từ nhà cung cấp, mỗi lô có hạn sử dụng riêng.

## Capabilities and Constraints

**Đã chạy được:** POS bán hàng · tồn kho theo lô + hạn dùng · nhập hàng · nhà cung cấp ·
kiểm kê · xuất hủy · khách hàng · công nợ · hoá đơn · ca bán hàng · trả hàng · báo cáo
doanh thu/lợi nhuận · cảnh báo hết hạn và sắp hết hàng.

**Làm dở:** trợ lý chat AI (LangGraph) — tác giả nhận phần này để tự học, hiện chỉ trả lời
được câu hỏi đơn giản về dữ liệu cửa hàng.

**RÀNG BUỘC CỨNG (người dùng xác nhận 09/09/2026):** nghiệp vụ màn POS không được đổi —
phím tắt F1, nút tiền nhanh 10k/20k/50k, và luồng quét mã → giỏ hàng → thanh toán. Ngoài
luồng đó ra, không có ràng buộc bắt buộc nào khác: Ant Design và cách gọi tên các mục đều
là lựa chọn có thể thay, không phải cam kết.

**Kỹ thuật:** React 19 + TypeScript + Vite + Ant Design 6 (frontend); Go + Gin + PostgreSQL
(backend). Toàn bộ màu đã được gom về `src/theme/colors.ts` với một cổng lint chặn viết màu
rải rác. Cỡ chữ, khoảng cách, bo góc thì **chưa** — còn 426 giá trị viết cứng rải rác.

## Brand Commitments

- Toàn bộ giao diện bằng **tiếng Việt**.
- Tên ứng dụng lấy từ hằng `APP_NAME` trong `src/constants`.
- Không có logo, bộ nhận diện, hay cam kết thương hiệu nào khác.

## Evidence on Hand

- `docs/DanhSachSanPham_KV07042026-210506-019.xlsx` — danh sách sản phẩm thật xuất từ
  KiotViet của cửa hàng (chưa commit, có thể chứa dữ liệu thật).
- `backend/seed_demo.sql` — dữ liệu mẫu để demo (chưa commit).

**Không có:** người dùng thật đang chạy, số liệu sử dụng, lời chứng thực, khách hàng, hay
bất kỳ số đo hiệu quả nào. Cửa hàng chưa dùng chính thức. Không được bịa những thứ này
trong bất kỳ màn hình hay tài liệu nào.

## Product Principles

1. **Bám việc thật ngoài cửa hàng, không bám danh sách tính năng.** Thứ tự ưu tiên đến từ
   yêu cầu người nhà đưa ra, không từ việc phần mềm khác có gì.
2. **Hạn sử dụng là lý do tồn tại của phần kho.** Mọi thiết kế liên quan tới tồn kho phải
   làm hạn dùng nhìn thấy được, không chôn nó sau một cột phụ.
3. **Con số phải bảo vệ được.** Lợi nhuận tính từ giá vốn thật; không hiển thị con số nào
   mà không truy được nguồn.
4. **Luồng bán hàng là bất khả xâm phạm.** Mọi thay đổi khác phải chứng minh không làm chậm
   người đứng quầy.
5. **Không bịa bằng chứng.** Cửa hàng chưa dùng thật — giao diện không được ngụ ý ngược lại.

## Accessibility & Inclusion

Chuẩn đang áp dụng: **WCAG AA cho tương phản chữ** (4.5:1 với chữ thân bài, 3:1 với chữ
lớn). Chuẩn này được nhận trong đợt gom màu 09/09/2026 và đã bắt được bốn lỗi thật, trong
đó có ô hiển thị tiền thừa trả khách ở màn POS. Mọi màu chữ mới phải đo trước khi dùng.
