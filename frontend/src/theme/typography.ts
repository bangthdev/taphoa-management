/**
 * Nguồn duy nhất định nghĩa cỡ chữ, độ đậm, khoảng cách và bo góc.
 *
 * Cùng khế ước với `colors.ts`: ngoài file này không nơi nào được viết số cho
 * ba thứ đó. TypeScript đọc qua các bảng dưới đây, file .css đọc qua biến
 * `--t-*` do `injectTypographyVariables` đổ ra.
 */

/**
 * Sáu bậc, tỉ lệ 1.28 nới dần lên 1.35 ở hai bậc cuối. Trước đây giao diện dùng
 * 12 cỡ rời rạc, tức là không có thang — mắt không đọc ra thứ bậc khi mọi thứ
 * chênh nhau 1-2px.
 *
 * Thang được chỉnh cho màn hình đích: desktop 27 inch, viewport ~2340px, ngồi
 * cách ~70cm. Ở khoảng cách đó cùng một cỡ chữ trông nhỏ hơn ~20% so với laptop
 * ngồi cách 50cm, nên thang này lớn hơn thang cho laptop đúng chừng ấy.
 */
export const type = {
  /** Nhãn KPI, header bảng. Đi kèm chữ hoa và giãn ký tự, không đi một mình. */
  label: 12,
  /** Thân bài, ô nhập, nội dung bảng. 16px là ngưỡng chữ thân bài của web. */
  body: 16,
  /** Tiêu đề card, dòng nhấn trong danh sách. */
  lead: 20,
  /** Tiêu đề trang. */
  title: 25,
  /** Số liệu KPI ở trang Tổng quan. */
  metric: 31,
  /** Con số quan trọng nhất một màn hình có: THÀNH TIỀN ở màn bán hàng. */
  hero: 42,
} as const;

export const weight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  /** Chỉ dùng cho `type.metric` và `type.hero` — con số phải thắng mọi thứ quanh nó. */
  bold: 800,
} as const;

/** Nhịp 4px. Mọi khoảng cách có nhịp đều rút từ đây. */
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

/**
 * Trần bề rộng cột nội dung. KHÔNG phải bề rộng cố định — nó chỉ chặn bảng
 * giãn vô hạn trên màn siêu rộng, nơi mắt phải quét quá xa giữa cột đầu và cột
 * cuối của một dòng. 1800 chọn cho màn đích 27 inch (~2340px), chừa lề hai bên
 * mà vẫn còn là trần, không phải bề rộng cố định.
 */
export const layout = {
  contentMax: 1800,
  /**
   * Chiều cao mục điều hướng ngang. Phải sống ở đây chứ không phải trong theme
   * antd, vì CSS cũng cần nó: antd vẽ nền lên chính thẻ `li`, mà `li` là flex
   * item bị kéo giãn theo chiều cao của thanh — `line-height` không chặn được.
   */
  navItemHeight: 50,
} as const;

export const radius = {
  /** Tag, chip, ô nhỏ */
  sm: 6,
  /** Nút, ô nhập, card */
  md: 10,
  /** Modal, panel lớn */
  lg: 16,
} as const;

/**
 * Be Vietnam Pro phủ đủ dấu tiếng Việt và đặt dấu đúng trên `ế`, `ữ`, `ộ` —
 * nhiều font display phổ biến vỡ ở đúng những ký tự này.
 */
export const fontFamily =
  '"Be Vietnam Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const groups = { type, weight, space, radius, layout } as const;

/** `type.metric` → `--t-type-metric` */
function toCssVarName(group: string, token: string): string {
  return `--t-${group}-${token.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)}`;
}

/**
 * Đổ thang chữ thành biến CSS trên :root để file .css dùng chung nguồn với
 * TypeScript. Gọi một lần lúc khởi động, trước khi render.
 */
export function injectTypographyVariables(root: HTMLElement = document.documentElement): void {
  for (const [group, tokens] of Object.entries(groups)) {
    for (const [token, value] of Object.entries(tokens)) {
      const unit = group === 'weight' ? '' : 'px';
      root.style.setProperty(toCssVarName(group, token), `${value}${unit}`);
    }
  }
  root.style.setProperty('--t-font-family', fontFamily);
}
