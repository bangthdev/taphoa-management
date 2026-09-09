/**
 * Nguồn duy nhất định nghĩa màu của toàn ứng dụng.
 *
 * Quy ước: ngoài file này, không nơi nào được viết mã hex. Component TypeScript
 * đọc qua `colors`, file .css đọc qua biến `--c-*` do `injectColorVariables`
 * đổ ra. Cả hai lấy từ cùng một chỗ, nên đổi ở đây là đổi cả dự án.
 */

/**
 * Bậc màu gốc. Chỉ dùng để lắp vào `colors` bên dưới — component không đọc
 * trực tiếp, vì "indigo500" nói màu gì chứ không nói dùng vào việc gì.
 */
const scale = {
  white: '#ffffff',

  indigo50: '#eef2ff',
  indigo100: '#e0e7ff',
  indigo200: '#c7d2fe',
  indigo500: '#6366f1',
  indigo600: '#4f46e5',
  indigo700: '#4338ca',
  indigo900: '#312e81',

  violet500: '#8b5cf6',
  violet600: '#7c3aed',
  purple500: '#a855f7',
  purple600: '#9333ea',

  teal500: '#14b8a6',
  sky500: '#0ea5e9',
  emerald500: '#10b981',
  amber500: '#f59e0b',
  rose500: '#f43f5e',
  red500: '#ef4444',
  blue500: '#3b82f6',

  slate50: '#f8fafc',
  slate100: '#f1f5f9',
  slate200: '#e2e8f0',
  slate300: '#cbd5e1',
  slate400: '#94a3b8',
  slate500: '#64748b',
  slate600: '#475569',
  slate800: '#1e293b',

  gray600: '#4b5563',
  gray800: '#1f2937',
  violetPale: '#f6f6fb',

  emerald200: '#bbf7d0',
  amber400: '#facc15',
  orange500: '#f97316',

  emerald50: '#f0fdf4',
  green700: '#15803d',
  green800: '#166534',
  rose50: '#fef2f2',
  rose200: '#fecaca',
  rose800: '#991b1b',
  red600: '#dc2626',

  coral400: '#ff6b6b',
  yellow300: '#ffe66d',
  aqua400: '#4ecdc4',
} as const;

export const colors = {
  /* ---------- Thương hiệu ---------- */
  brand: scale.indigo500,
  brandHover: scale.indigo600,
  brandActive: scale.indigo700,
  /** Sắc thương hiệu sáng hơn, dùng cho hover và viền nhấn (không phải màu nhóm Khách hàng) */
  brandLight: scale.violet500,
  /** Nền nhạt cho vùng mang màu thương hiệu: header bảng, mục menu đang chọn */
  brandSoft: scale.indigo50,
  brandSoftStrong: scale.indigo100,
  brandBorder: scale.indigo200,
  /** Chữ đặt trên `brandSoft` — indigo 900 để giữ tương phản trên nền nhạt */
  brandInk: scale.indigo900,
  /** Chữ và icon đặt trên nền thương hiệu đậm hoặc trên sidebar */
  onBrand: scale.white,
  /** 4.55:1–5.01:1 trên brandGradient; đạt AA cho cả đoạn text, nhưng vẫn là biến thể mờ dành cho nhãn phụ */
  onBrandMuted: 'rgba(255, 255, 255, 0.85)',
  onBrandBorder: 'rgba(255, 255, 255, 0.28)',
  onBrandActiveBg: 'rgba(255, 255, 255, 0.18)',
  /** Nền khối biểu tượng (logo) nổi trên gradient thương hiệu */
  onBrandTint: 'rgba(255, 255, 255, 0.2)',
  /** Lớp phủ hover trên bề mặt sáng (nút nhỏ như đóng tab, không phải trên nền thương hiệu) */
  hoverTint: 'rgba(0, 0, 0, 0.08)',

  /* ---------- Trạng thái hệ thống ---------- */
  success: scale.emerald500,
  warning: scale.amber500,
  danger: scale.red500,
  info: scale.blue500,

  /* ----------
   * Màu ngữ nghĩa theo nghiệp vụ. Mỗi vai trò ghi nhận một ý nghĩa cụ thể tại call site.
   * Một số vai trò cố ý dùng chung giá trị (brand và revenue đều dùng indigo500;
   * warning và lowStock đều dùng amber500) để thống nhất thị giác và giảm bảng màu.
   * ---------- */
  /** Doanh thu, tiền vào */
  revenue: scale.indigo500,
  /** Lợi nhuận, chênh lệch dương */
  profit: scale.emerald500,
  /** Giá vốn, chênh lệch âm */
  cost: scale.slate600,
  /** Tồn thấp, sắp hết hạn */
  lowStock: scale.amber500,
  /** Hết hàng, quá hạn, nợ quá hạn */
  overdue: scale.rose500,
  /** Nhóm Kho, nhập hàng */
  stock: scale.sky500,
  /** Nhóm Khách hàng, công nợ */
  customer: scale.teal500,

  /** Nền vùng tô dưới đường lợi nhuận trên biểu đồ */
  profitSoft: scale.emerald200,

  /** Nền ô thông báo thành công (tiền thừa trả khách) */
  successSoft: scale.emerald50,
  /** Chữ nhãn trên successSoft (cỡ chữ nhỏ nên cần xanh đậm nhất để đủ tương phản) */
  successInk: scale.green800,
  /** Chữ số tiền trên successSoft (cỡ lớn, đậm nét — vẫn đạt tương phản dù nhạt hơn successInk) */
  successStrong: scale.green700,
  /** Nền ô cảnh báo lỗi */
  dangerSoft: scale.rose50,
  /** Viền ô cảnh báo lỗi */
  dangerBorder: scale.rose200,
  /** Chữ tiêu đề trong ô cảnh báo lỗi */
  dangerInk: scale.rose800,
  /** Chữ nội dung (số tiền, chi tiết) trong ô cảnh báo lỗi */
  dangerStrong: scale.red600,

  /* ---------- Huy hiệu xếp hạng (bảng sản phẩm bán chạy) ---------- */
  rankGold: scale.amber400,
  rankSilver: scale.slate400,
  rankBronze: scale.orange500,

  /* ---------- Chữ ---------- */
  text: scale.gray800,
  /** Nhãn, mô tả. Gray 600 để đạt tỉ lệ tương phản 4.5:1 trên nền trắng */
  textSecondary: scale.gray600,
  /** Chữ mờ nhất còn đọc được: placeholder, trạng thái rỗng. Tương phản 4.76:1 đạt chuẩn AA */
  textMuted: scale.slate500,

  /* ---------- Bề mặt ---------- */
  /** Nền ngoài cùng của trang */
  bg: scale.violetPale,
  /** Nền của card, bảng, modal */
  surface: scale.white,
  /** Nền chìm: vùng bị vô hiệu, ô tổng kết */
  surfaceSunken: scale.slate50,
  border: scale.slate200,
  borderStrong: scale.slate300,

  /* ---------- Gradient (hướng Aurora tím) ---------- */
  /** Nền sidebar dọc */
  sidebar: `linear-gradient(170deg, ${scale.indigo600} 0%, ${scale.violet600} 55%, ${scale.purple600} 100%)`,
  /** Nút hành động chính và header ứng dụng; chữ trắng trên nền này đạt AA (5.70:1–6.29:1) */
  brandGradient: `linear-gradient(90deg, ${scale.indigo600}, ${scale.violet600})`,
  /** Hai quầng màu mờ trên nền trang, tạo chiều sâu mà không cản việc đọc */
  auroraGlow: `radial-gradient(720px 240px at 88% -10%, ${scale.purple500}24, transparent 70%), radial-gradient(560px 240px at 4% 108%, ${scale.sky500}1f, transparent 70%)`,

  /* ---------- Đổ bóng ---------- */
  /** Bóng mềm hai lớp thay cho viền cứng */
  shadowCard: `0 1px 2px ${scale.indigo900}0f, 0 8px 24px ${scale.indigo900}12`,
  shadowCardHover: `0 2px 4px ${scale.indigo900}14, 0 12px 32px ${scale.indigo900}1f`,
  shadowRaised: `0 4px 12px ${scale.indigo900}2e`,
  /** Bóng mặc định của nút thao tác chính */
  shadowButton: `0 1px 2px ${scale.indigo900}3d`,
  /** Bóng của nút thao tác chính khi đang bấm xuống — đậm hơn shadowButton */
  shadowButtonActive: `0 1px 2px ${scale.indigo900}47`,
  /** Bóng khi trỏ vào thẻ có thể bấm (card-hoverable) */
  shadowCardHoverable: `0 8px 20px ${scale.indigo900}1f`,
  /** Bóng trung tính tách thanh header dính (sticky) khỏi nội dung bên dưới */
  shadowHeader: '0 2px 8px rgba(0, 0, 0, 0.15)',
  /** Bóng trung tính rất nhẹ, nâng khối nội dung khỏi nền trang */
  shadowPanel: '0 1px 3px rgba(0, 0, 0, 0.05)',
  /** Bóng trung tính cho panel nổi (floating), như widget chat góc màn hình */
  shadowFloating: '0 8px 24px rgba(0, 0, 0, 0.15)',

  /* ---------- Trang đăng nhập ---------- */
  /** Nền toàn màn hình của trang đăng nhập */
  loginBackdrop: `linear-gradient(135deg, ${scale.indigo600} 0%, ${scale.purple600} 100%)`,
  /** Ba khối trang trí nổi phía sau khung đăng nhập */
  loginAccentWarm: scale.coral400,
  loginAccentBright: scale.yellow300,
  loginAccentCool: scale.aqua400,
  /** Nền kính mờ (glassmorphism) của khung đăng nhập */
  loginCardBg: 'rgba(255, 255, 255, 0.85)',
  /** Viền và vệt sáng trắng quanh khung đăng nhập, dùng chung cho viền, inset-shadow khi hover, và vòng xoay loading */
  loginCardBorder: 'rgba(255, 255, 255, 0.3)',
  /** Vệt sáng inset ở trạng thái nghỉ, mờ hơn loginCardBorder */
  loginCardHighlight: 'rgba(255, 255, 255, 0.2)',
  shadowLoginCard: '0 8px 32px rgba(0, 0, 0, 0.1)',
  shadowLoginCardHover: '0 20px 40px rgba(0, 0, 0, 0.15)',
  /** Nền ô nhập liệu, sáng hơn nền thẻ để phân biệt vùng gõ */
  loginInputBg: 'rgba(255, 255, 255, 0.9)',
  /** rgb(139, 92, 246) = brandLight (violet500) ở alpha thấp — vòng nhấn khi ô nhập được focus */
  loginFocusRing: 'rgba(139, 92, 246, 0.1)',
  /** rgb(99, 102, 241) = brand (indigo500) — quầng sáng cho logo và nút đăng nhập, ba mức đậm nhạt */
  loginGlowSoft: 'rgba(99, 102, 241, 0.3)',
  loginGlowHover: 'rgba(99, 102, 241, 0.4)',
  loginGlowStrong: 'rgba(99, 102, 241, 0.5)',
} as const;

/** `brandSoft` → `--c-brand-soft` */
function toCssVarName(token: string): string {
  return `--c-${token.replace(/[A-Z]/g, char => `-${char.toLowerCase()}`)}`;
}

/**
 * Đổ `colors` thành biến CSS trên :root để file .css dùng chung nguồn với
 * TypeScript. Gọi một lần lúc khởi động, trước khi render.
 */
export function injectColorVariables(root: HTMLElement = document.documentElement): void {
  for (const [token, value] of Object.entries(colors)) {
    root.style.setProperty(toCssVarName(token), value);
  }

  // <meta name="theme-color"> tô màu chrome trình duyệt (thanh địa chỉ trên mobile),
  // không đọc được biến CSS nên phải set bằng JS để không lệch khỏi bảng màu.
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  themeColorMeta?.setAttribute('content', colors.brand);
}
