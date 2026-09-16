---
version: 1
slug: "frontend-src-components-applayout-tsx"
primary_target: "frontend/src/components/AppLayout.tsx"
related_targets: []
---

## Direction contract

THESIS: Bảng điều khiển tạp hóa nơi thứ bậc do cỡ chữ gánh, không do khung viền. Từ chối lối "mọi thứ bọc trong một card viền xám" mà mọi admin panel mặc định ship.

OWN-WORLD: Cột trái là mảng gradient indigo600→violet600 đặc, trọn chiều cao. Vùng dữ liệu nền #f6f6fb với hai quầng aurora mờ. Card không viền, chỉ bóng mềm hai lớp ám indigo. Be Vietnam Pro (phủ đủ dấu tiếng Việt), sáu bậc 13/16/20/26/34/44, số dùng tabular-nums.

STORY: Người bán mở máy là thấy ngay doanh thu hôm nay ở cỡ 34, cảnh báo hết hạn đọc được không cần bấm, và một nút vào thẳng POS.

FIRST VIEWPORT: Sidebar 248px gradient bên trái. Header trắng 56px chứa breadcrumb, ca hiện tại, thoát. Nội dung: bốn thẻ KPI số cỡ 34 có vạch màu ngữ nghĩa trên đỉnh; dưới là biểu đồ bảy ngày chiếm hai phần ba và dải cảnh báo một phần ba.

FORM: Aurora tím — hướng người dùng ghim, thắng con xúc xắc. Nâng bằng bốn hiến tặng: thứ bậc bằng cỡ chữ (festival lineup), bỏ khung chỗ khung vô dụng (cracktro), màu cam kết ở cấp vùng (guide map), trạng thái in thẳng trong nội dung (phosphor terminal). Seed key ca3926bf.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
