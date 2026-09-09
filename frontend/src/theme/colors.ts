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
  slate600: '#475569',
  slate800: '#1e293b',
} as const;

export const colors = {
  /* ---------- Thương hiệu ---------- */
  brand: scale.indigo500,
  brandHover: scale.indigo600,
  brandActive: scale.indigo700,
  /** Nền nhạt cho vùng mang màu thương hiệu: header bảng, mục menu đang chọn */
  brandSoft: scale.indigo50,
  brandSoftStrong: scale.indigo100,
  brandBorder: scale.indigo200,
  /** Chữ đặt trên `brandSoft` — indigo 900 để giữ tương phản trên nền nhạt */
  brandInk: scale.indigo900,
  /** Chữ và icon đặt trên nền thương hiệu đậm hoặc trên sidebar */
  onBrand: scale.white,
  onBrandMuted: 'rgba(255, 255, 255, 0.72)',
  onBrandBorder: 'rgba(255, 255, 255, 0.28)',
  onBrandActiveBg: 'rgba(255, 255, 255, 0.18)',

  /* ---------- Trạng thái hệ thống ---------- */
  success: scale.emerald500,
  warning: scale.amber500,
  danger: scale.red500,
  info: scale.blue500,

  /* ----------
   * Màu ngữ nghĩa theo nghiệp vụ. Mỗi màu mang đúng một nghĩa trên toàn app —
   * nhìn màu là đoán được loại thông tin mà không cần đọc nhãn.
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

  /* ---------- Chữ ---------- */
  text: '#1f2937',
  /** Nhãn, mô tả. Gray 600 để đạt tỉ lệ tương phản 4.5:1 trên nền trắng */
  textSecondary: '#4b5563',
  /** Chữ mờ nhất còn đọc được: placeholder, trạng thái rỗng */
  textMuted: scale.slate400,

  /* ---------- Bề mặt ---------- */
  /** Nền ngoài cùng của trang */
  bg: '#f6f6fb',
  /** Nền của card, bảng, modal */
  surface: scale.white,
  /** Nền chìm: vùng bị vô hiệu, ô tổng kết */
  surfaceSunken: scale.slate50,
  border: scale.slate200,
  borderStrong: scale.slate300,

  /* ---------- Gradient (hướng Aurora tím) ---------- */
  /** Nền sidebar dọc */
  sidebar: `linear-gradient(170deg, ${scale.indigo600} 0%, ${scale.violet600} 55%, ${scale.purple600} 100%)`,
  /** Nút hành động chính */
  brandGradient: `linear-gradient(90deg, ${scale.indigo500}, ${scale.purple500})`,
  /** Hai quầng màu mờ trên nền trang, tạo chiều sâu mà không cản việc đọc */
  auroraGlow: `radial-gradient(720px 240px at 88% -10%, ${scale.purple500}24, transparent 70%), radial-gradient(560px 240px at 4% 108%, ${scale.sky500}1f, transparent 70%)`,

  /* ---------- Đổ bóng ---------- */
  /** Bóng mềm hai lớp thay cho viền cứng */
  shadowCard: `0 1px 2px ${scale.indigo900}0f, 0 8px 24px ${scale.indigo900}12`,
  shadowCardHover: `0 2px 4px ${scale.indigo900}14, 0 12px 32px ${scale.indigo900}1f`,
  shadowRaised: `0 4px 12px ${scale.indigo900}2e`,
} as const;

export type ColorToken = keyof typeof colors;

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
}
