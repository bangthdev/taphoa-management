# Kế hoạch thang chữ và dựng lại khung vỏ

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rút 70 cỡ chữ viết cứng thành sáu bậc có vai trò trong một file token duy nhất, rồi dựng lại khung vỏ ứng dụng theo hướng Aurora tím — sidebar dọc là một mảng màu cam kết, thứ bậc do cỡ chữ gánh chứ không do khung viền.

**Architecture:** `src/theme/typography.ts` giữ thang chữ, khoảng cách, bo góc, độ đậm; nó soi gương đúng cấu trúc `src/theme/colors.ts` đã có — bảng thô private, bảng vai trò export, và một hàm đổ ra biến CSS `--t-*`. Cổng `scripts/check-colors.mjs` mở rộng thành `check-tokens.mjs`, chặn thêm `fontSize`/`fontWeight`/`borderRadius` viết bằng số, mang theo một allowlist rút dần y như lần trước. Khung vỏ đổi từ thanh ngang sang `Sider` dọc; 20 trang nội dung không bị đụng vì chúng render bên trong `Outlet`.

**Tech Stack:** React 19 · TypeScript · Vite · Ant Design 6 (`ConfigProvider`) · Recharts · Be Vietnam Pro (Google Fonts) · ESLint + Prettier

**Spec:** `frontend/src/.impeccable/surfaces/frontend-src-components-applayout-tsx.md` (hợp đồng hướng, seed key `ca3926bf`) và `frontend/src/PRODUCT.md`

## Global Constraints

- **Không cỡ chữ, độ đậm, hay bo góc viết bằng số ngoài `src/theme/typography.ts`.** Giống hệt luật đã áp cho màu.
- **Thang chữ đúng sáu bậc: 13 / 16 / 20 / 26 / 34 / 44.** Không thêm bậc thứ bảy. Thiếu thì dùng bậc gần nhất, không nội suy.
- **Font: Be Vietnam Pro**, fallback về stack hệ thống. Lý do chọn: phủ đủ dấu tiếng Việt, dấu đặt đúng trên `ế`, `ữ`, `ộ` — nhiều font display vỡ ở đây.
- **`colors.ts` là nguồn màu duy nhất và không đổi trong kế hoạch này.** Kế hoạch này chỉ thêm token phi màu.
- **RÀNG BUỘC CỨNG từ PRODUCT.md: nghiệp vụ màn POS không được đổi** — phím tắt F1, nút tiền nhanh 10k/20k/50k, luồng quét mã → giỏ → thanh toán. Đổi cỡ chữ thì được; đổi thao tác thì không.
- **Không đụng logic nghiệp vụ.** Không đụng 20 trang nội dung ngoài những trang plan gọi tên.
- Comment giải thích **tại sao**, không bao giờ giải thích **cái gì**. Comment mới viết tiếng Việt.
- Mọi màu chữ mới phải đo tương phản trước khi dùng — chuẩn dự án là WCAG AA (4.5:1 thân bài, 3:1 chữ lớn).
- Cổng kiểm tra sau mỗi task: `npx tsc --noEmit`, `npm run lint`, `npm run build` đều sạch.
- Mỗi task một commit. Message tiếng Anh, mệnh lệnh, dòng đầu ≤72 ký tự, không nhãn AI.

## Bối cảnh cần biết trước khi bắt đầu

- **Số đo hiện trạng** (đếm ngày 09/09/2026 trên `frontend/src`): 70 chỗ `fontSize` dùng **12 cỡ khác nhau** (10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 36, 64); 39 `borderRadius`; 9 `fontWeight`; 101 `padding`/`margin`; 181 `width`/`height`; 26 `gap`.
- **`POSPage.tsx` một mình giữ 30 trong 70 chỗ `fontSize`**, phần lớn là 13–15px. Đây là lý do người dùng thấy "chữ vẫn bé tí" ở màn bán hàng dù theme đã khai `fontSize: 16` — theme không với tới được vì các giá trị cứng đè lên.
- **`padding`/`margin`/`width`/`height` KHÔNG bị cổng chặn**, và đó là cố ý: `width: 120` cho một cột bảng là quyết định bố cục theo ngữ cảnh, không phải token. Chặn chúng sẽ tạo ra nhiễu nhiều hơn giá trị. Token khoảng cách vẫn được tạo và dùng ở chỗ có nhịp thật.
- **`/pos` nằm NGOÀI `AppLayout`** (`App.tsx`, route riêng, ghi rõ "Full-screen pages — không có sidebar navigation"). Nên việc dựng lại khung vỏ **không chạm màn bán hàng**. Đây là lý do task khung vỏ rẻ và an toàn hơn vẻ ngoài của nó.
- **`AppLayout.tsx` hiện dùng `Header` + `Menu mode="horizontal"`** với 8 mục, trong đó 4 mục có submenu. Chuyển sang `mode="inline"` là dùng đúng thứ chế độ dọc sinh ra để làm.
- Cổng `check-colors.mjs` hiện đã chặn hex và `rgb`/`rgba`/`hsl`. Kế hoạch này đổi tên nó thành `check-tokens.mjs` vì nó sẽ không còn chỉ canh màu.

## File Structure

| File | Trạng thái | Trách nhiệm |
|---|---|---|
| `frontend/src/theme/typography.ts` | Tạo mới | Nguồn duy nhất của cỡ chữ, độ đậm, khoảng cách, bo góc. |
| `frontend/scripts/check-tokens.mjs` | Đổi tên từ `check-colors.mjs` | Chặn màu (như cũ) cộng `fontSize`/`fontWeight`/`borderRadius` viết số. |
| `frontend/package.json` | Sửa | Trỏ script `lint` sang tên file mới. |
| `frontend/index.html` | Sửa | Nạp Be Vietnam Pro. |
| `frontend/src/index.tsx` | Sửa | Gọi `injectTypographyVariables()`. |
| `frontend/src/App.tsx` | Sửa | Theme antd đọc thang chữ từ token. |
| `frontend/src/components/AppLayout.tsx` | Viết lại phần khung | `Sider` dọc gradient + header mảnh. |
| `frontend/src/pages/DashboardPage.tsx` | Sửa | Màn hình mở đầu theo FIRST VIEWPORT. |
| `frontend/src/pages/POSPage.tsx` | Sửa | 30 cỡ chữ cứng → token; THÀNH TIỀN lên bậc `hero`. |
| `frontend/src/pages/*.tsx` còn lại | Sửa | Quét nốt cỡ chữ, độ đậm, bo góc. |
| `frontend/src/DESIGN.md` | Tạo ở task cuối | Do impeccable documenter viết từ bản đã dựng xong. |

---

### Task 1: Dựng file token và cổng kiểm tra

**Files:**
- Create: `frontend/src/theme/typography.ts`
- Rename + modify: `frontend/scripts/check-colors.mjs` → `frontend/scripts/check-tokens.mjs`
- Modify: `frontend/package.json`, `frontend/src/index.tsx`

**Interfaces:**
- Consumes: `injectColorVariables` pattern từ `src/theme/colors.ts`
- Produces: `type`, `weight`, `space`, `radius` (object vai trò) và `injectTypographyVariables(root?: HTMLElement): void` từ `src/theme/typography.ts`. Biến CSS: `--t-` + kebab-case của khoá, ví dụ `type.metric` → `--t-type-metric`.

- [ ] **Step 1: Viết file token**

Tạo `frontend/src/theme/typography.ts`:

```ts
/**
 * Nguồn duy nhất định nghĩa cỡ chữ, độ đậm, khoảng cách và bo góc.
 *
 * Cùng khế ước với `colors.ts`: ngoài file này không nơi nào được viết số cho
 * ba thứ đó. TypeScript đọc qua các bảng dưới đây, file .css đọc qua biến
 * `--t-*` do `injectTypographyVariables` đổ ra.
 */

/**
 * Sáu bậc, tỉ lệ khoảng 1.28. Trước đây giao diện dùng 12 cỡ rời rạc, tức là
 * không có thang — mắt không đọc ra thứ bậc khi mọi thứ chênh nhau 1-2px.
 */
export const type = {
  /** Nhãn KPI, header bảng. Đi kèm chữ hoa và giãn ký tự, không đi một mình. */
  label: 13,
  /** Thân bài, ô nhập, nội dung bảng. 16px là ngưỡng chữ thân bài của web. */
  body: 16,
  /** Tiêu đề card, dòng nhấn trong danh sách. */
  lead: 20,
  /** Tiêu đề trang. */
  title: 26,
  /** Số liệu KPI ở trang Tổng quan. */
  metric: 34,
  /** Con số quan trọng nhất một màn hình có: THÀNH TIỀN ở màn bán hàng. */
  hero: 44,
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

const groups = { type, weight, space, radius } as const;

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
```

- [ ] **Step 2: Gọi hàm đổ biến**

Trong `frontend/src/index.tsx`, thêm import và lời gọi ngay cạnh `injectColorVariables()`:

```tsx
import { injectColorVariables } from './theme/colors';
import { injectTypographyVariables } from './theme/typography';

injectColorVariables();
injectTypographyVariables();
```

- [ ] **Step 3: Mở rộng cổng và đổi tên nó**

```bash
cd frontend
git mv scripts/check-colors.mjs scripts/check-tokens.mjs
```

Trong `scripts/check-tokens.mjs`:
- Đổi `SOURCE_OF_TRUTH` thành một mảng: `const SOURCES = ['theme/colors.ts', 'theme/typography.ts'];`
- Thêm mẫu thứ hai bên cạnh `COLOR`:

```js
// Cỡ chữ, độ đậm, bo góc là token thiết kế — chúng phải rút từ theme/typography.ts.
// KHÔNG chặn padding/margin/width/height: `width: 120` cho một cột bảng là quyết
// định bố cục theo ngữ cảnh, chặn chúng tạo nhiễu nhiều hơn giá trị.
const SIZING = /\b(fontSize|fontWeight|borderRadius)\s*:\s*[0-9]/g;
```
- Quét cả hai mẫu, gộp kết quả, in kèm loại vi phạm.
- Đặt lại `ALLOWLIST` với đúng các file còn chứa `fontSize`/`fontWeight`/`borderRadius` viết số. Xác định danh sách này bằng lệnh bên dưới, đừng đoán:

```bash
grep -rlE '\b(fontSize|fontWeight|borderRadius)\s*:\s*[0-9]' --include='*.tsx' --include='*.ts' src | sed 's|^src/||' | sort
```

- [ ] **Step 4: Trỏ npm script sang tên mới**

Trong `frontend/package.json`, đổi `node scripts/check-colors.mjs` thành `node scripts/check-tokens.mjs` trong `lint`.

- [ ] **Step 5: Chứng minh cổng bắt được, rồi commit**

Tạm bỏ một file khỏi `ALLOWLIST`, chạy `npm run lint`, dán output cho thấy nó chỉ đúng dòng và đúng loại vi phạm. Thêm lại.

```bash
npx tsc --noEmit
npm run lint
git add frontend/src/theme/typography.ts frontend/scripts/check-tokens.mjs frontend/package.json frontend/src/index.tsx
git commit -m "Add a single source for type scale and spacing" \
  -m "Problem:
- Seventy call sites set font size by hand across twelve different values,
  so the interface had no scale and the theme's own size was overridden
  wherever a component disagreed.

Solution:
- Add src/theme/typography.ts with six named steps, four weights, a 4px
  spacing rhythm and three radii, mirrored into --t-* custom properties.
- Extend the colour gate to sizing tokens and rename it check-tokens."
```

---

### Task 2: Nạp Be Vietnam Pro và nối vào theme

**Files:**
- Modify: `frontend/index.html`, `frontend/src/App.tsx`, `frontend/scripts/check-tokens.mjs`

**Interfaces:**
- Consumes: `type`, `weight`, `radius`, `fontFamily` từ Task 1
- Produces: theme antd đọc mọi cỡ chữ và bo góc từ token; font mới áp toàn app

- [ ] **Step 1: Nạp font**

Trong `frontend/index.html`, trước `</head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;800&display=swap"
  rel="stylesheet"
/>
```

Chỉ nạp bốn độ đậm khớp `weight` ở Task 1. Nạp thừa là tải thừa.

- [ ] **Step 2: Theme antd đọc token**

Trong `frontend/src/App.tsx`, thêm `import { type, weight, radius, fontFamily } from './theme/typography';` rồi thay:

| Thuộc tính | Từ | Thành |
|---|---|---|
| `token.fontSize` | `16` | `type.body` |
| `token.fontSizeSM` | `14` | `type.label` |
| `token.fontSizeLG` | `16` | `type.body` |
| `token.fontSizeHeading4` | `24` | `type.title` |
| `token.fontSizeHeading5` | `18` | `type.lead` |
| `token.fontFamily` | chuỗi cũ | `fontFamily` |
| `token.borderRadius` | `10` | `radius.md` |
| `token.borderRadiusLG` | `12` | `radius.lg` |
| `Button.borderRadius` | `8` | `radius.md` |
| `Button.contentFontSize` | `16` | `type.body` |
| `Button.contentFontSizeLG` | `18` | `type.lead` |
| `Card.borderRadius` | `12` | `radius.lg` |
| `Card.headerFontSize` | `18` | `type.lead` |
| `Menu.fontSize` | `15` | `type.body` |
| `Table.borderRadius` | `8` | `radius.md` |
| `Table.fontSize` | `16` | `type.body` |
| `Statistic.titleFontSize` | `14` | `type.label` |
| `Statistic.contentFontSize` | `28` | `type.metric` |
| `Input.borderRadius` | `8` | `radius.md` |
| `Modal.borderRadius` | `16` | `radius.lg` |
| `Tag.borderRadius` | `6` | `radius.sm` |

`Menu.fontSize` tăng 15 → 16: sidebar dọc rộng 248px, không còn ràng buộc "8 mục phải vừa một hàng ngang" đã ép nó xuống 15.

- [ ] **Step 3: Gỡ `App.tsx` khỏi allowlist, chạy cổng**

- [ ] **Step 4: Nhìn tận mắt**

Chạy `npm start`, mở trang Sản phẩm. Xác nhận: chữ đã đổi sang Be Vietnam Pro (chữ `ữ` trong "Hàng hóa" và `ế` trong "Kiểm kê" phải có dấu đặt gọn, không chồng lên chữ); nội dung bảng 16px; tiêu đề trang 26px.

- [ ] **Step 5: Commit**

```bash
npx tsc --noEmit && npm run lint && npm run build
git add frontend/index.html frontend/src/App.tsx frontend/scripts/check-tokens.mjs
git commit -m "Read the Ant Design type scale from tokens"
```

---

### Task 3: Dựng lại khung vỏ thành sidebar dọc

Đây là task đổi diện mạo mạnh nhất trên mỗi phút bỏ ra: nó chỉ sửa một file nhưng đổi mọi trang, vì 20 trang render bên trong `Outlet` của nó.

**Files:**
- Modify: `frontend/src/components/AppLayout.tsx`
- Modify: `frontend/src/index.css`
- Modify: `frontend/scripts/check-tokens.mjs`

**Interfaces:**
- Consumes: `colors.sidebar`, `colors.auroraGlow`, `colors.shadowCard`, `colors.onBrand*` từ `colors.ts`; `type`, `space`, `radius` từ `typography.ts`
- Produces: khung vỏ mới; các trang nội dung không cần biết gì về nó

- [ ] **Step 1: Đổi cấu trúc Layout**

Thay `<Layout>` + `<Header>` ngang hiện tại bằng:

```tsx
<Layout style={{ minHeight: '100vh' }}>
  <Layout.Sider
    width={248}
    collapsible
    collapsed={collapsed}
    onCollapse={setCollapsed}
    style={{ background: colors.sidebar }}
  >
    {/* logo, Menu mode="inline", khối người dùng ở đáy */}
  </Layout.Sider>
  <Layout style={{ background: colors.bg }}>
    <Layout.Header style={{ height: 56, background: colors.surface, padding: `0 ${space.xl}px` }}>
      {/* Breadcrumbs, ca hiện tại, nút Thoát */}
    </Layout.Header>
    <Layout.Content>{/* Outlet */}</Layout.Content>
  </Layout>
</Layout>
```

`collapsed` là `useState(false)` mới. Đây là state giao diện thuần, không phải logic nghiệp vụ.

- [ ] **Step 2: Menu chuyển sang dọc**

Đổi `mode="horizontal"` thành `mode="inline"`. Giữ nguyên `items={menuItems}`, `selectedKeys`, và toàn bộ `onClick` — kể cả nhánh `if (key === '/pos') window.open(key, '_blank')`. Đổi `defaultOpenKeys` thành `openKeys`/`onOpenChange` có state, vì chế độ inline cần điều khiển việc xổ submenu.

Nền menu phải trong suốt để gradient của `Sider` hiện qua: `style={{ background: 'transparent', borderInlineEnd: 'none' }}`.

- [ ] **Step 3: Chuyển khối người dùng xuống đáy sidebar**

Tên người dùng, vai trò, nút Thoát chuyển từ header xuống đáy `Sider`. Dùng `colors.onBrand` cho tên, `colors.onBrandMuted` cho vai trò, `colors.onBrandBorder` cho viền nút.

Thông tin ca và nút "Thay ca" **ở lại header** — chúng gắn với phiên làm việc hiện tại, không phải điều hướng.

- [ ] **Step 4: Nền aurora và bóng mềm**

Trong `frontend/src/index.css`, cho vùng nội dung:

```css
.taphoa-content {
  background-image: var(--c-aurora-glow);
  background-repeat: no-repeat;
}
```

Card bỏ viền cứng, dùng `box-shadow: var(--c-shadow-card)`.

- [ ] **Step 5: Kiểm tay rồi commit**

Chạy `npm start`. Kiểm từng mục:

- [ ] Sidebar hiện gradient indigo → tím, chữ trắng đọc rõ trên toàn dải
- [ ] Cả 8 mục điều hướng hiện ra, 4 submenu xổ được
- [ ] Bấm "Bán hàng" vẫn mở `/pos` ở tab mới
- [ ] Thu gọn sidebar còn 72px, icon vẫn bấm được
- [ ] Breadcrumb hiện đúng ở header mảnh
- [ ] Ca hiện tại và "Thay ca" vẫn ở header, modal thay ca vẫn mở
- [ ] Ở 1366px chiều rộng, nội dung không bị tràn ngang

```bash
npx tsc --noEmit && npm run lint && npm run build
git commit -m "Replace the top bar with a vertical sidebar"
```

---

### Task 4: Màn hình mở đầu

**Files:**
- Modify: `frontend/src/pages/DashboardPage.tsx`, `frontend/scripts/check-tokens.mjs`

- [ ] **Step 1: Thẻ KPI theo FIRST VIEWPORT**

Bốn thẻ, mỗi thẻ: vạch màu 2px trên đỉnh lấy từ màu ngữ nghĩa (`colors.revenue`, `colors.lowStock`, `colors.overdue`, `colors.customer`); nhãn `type.label` chữ hoa giãn `0.04em` màu `colors.textSecondary`; số `type.metric` với `weight.bold`.

- [ ] **Step 2: Bố cục hai phần ba / một phần ba**

Biểu đồ bảy ngày chiếm `xs={24} lg={16}`, dải cảnh báo chiếm `xs={24} lg={8}`, cùng một hàng. Hiện chúng nằm chồng nhau và nửa dưới trang trống.

- [ ] **Step 3: Cảnh báo in thẳng trong nội dung**

Mỗi dòng cảnh báo hiện tên hàng và số ngày còn lại dưới dạng chữ đọc được, không nén thành một con số trong badge. (Hiến tặng từ hướng phosphor terminal: trạng thái tự in ra thay vì nấp trong chrome.)

- [ ] **Step 4: Gỡ khỏi allowlist, chạy cổng**

- [ ] **Step 5: Kiểm tay rồi commit**

- [ ] Số doanh thu đọc được từ khoảng cách ngồi bình thường
- [ ] Nửa dưới trang không còn trống
- [ ] Ở 1366px, bốn thẻ KPI không vỡ hàng

```bash
git commit -m "Rebuild the dashboard first viewport"
```

---

### Task 5: Màn bán hàng — con số THÀNH TIỀN

**Files:**
- Modify: `frontend/src/pages/POSPage.tsx`, `frontend/scripts/check-tokens.mjs`

Task rủi ro nhất. `/pos` là màn cửa hàng bán qua.

- [ ] **Step 1: Quy đổi 30 cỡ chữ cứng sang bậc gần nhất**

| Cỡ cũ | Bậc mới |
|---|---|
| 10, 11, 12, 13 | `type.label` (13) |
| 14, 15, 16 | `type.body` (16) |
| 18, 20, 22 | `type.lead` (20) |
| 36 | `type.title` (26) hoặc `type.metric` (34) tùy vai trò — quyết định theo nghĩa, ghi lý do vào báo cáo |
| 64 | `type.hero` (44) |

Bậc gần nhất, không nội suy. Chỗ nào bậc gần nhất làm hỏng bố cục thì báo, đừng thêm bậc thứ bảy.

- [ ] **Step 2: THÀNH TIỀN lên bậc `hero`**

Con số tổng tiền phải là `type.hero` (44) với `weight.bold` và `font-variant-numeric: tabular-nums`. Đây là con số quan trọng nhất trong cả ứng dụng và hợp đồng hướng gọi tên đích danh nó.

- [ ] **Step 3: Không đụng nghiệp vụ**

Xác nhận không đụng: `changeAmount`, `handleCheckout`, listener phím F1, nút tiền nhanh, `handleMainSearch`, `createInvoiceMutation`. Nêu tên từng hàm đã kiểm trong báo cáo.

- [ ] **Step 4: Gỡ khỏi allowlist, chạy cổng**

- [ ] **Step 5: Bán thử một đơn thật rồi mới commit**

- [ ] Thêm 3 sản phẩm vào giỏ, sửa số lượng bằng +/−
- [ ] Bấm nút tiền nhanh 50k, ô tiền thừa hiện nền xanh nhạt chữ xanh đậm đọc rõ
- [ ] Nhấn F1, thanh toán chạy
- [ ] Hoàn tất đơn, in được hoá đơn
- [ ] Con số THÀNH TIỀN đọc được từ xa 60cm

```bash
git commit -m "Raise the POS total to the hero step"
```

---

### Task 6: Quét nốt và tháo allowlist

**Files:**
- Modify: các file còn lại trong `ALLOWLIST`
- Modify: `frontend/scripts/check-tokens.mjs` (xoá hẳn `ALLOWLIST`)

- [ ] **Step 1: Liệt kê chính xác việc còn lại**

```bash
cd frontend
grep -rnE '\b(fontSize|fontWeight|borderRadius)\s*:\s*[0-9]' --include='*.tsx' --include='*.ts' src
```

- [ ] **Step 2: Quy đổi theo bảng bậc gần nhất ở Task 5**

- [ ] **Step 3: Tháo `ALLOWLIST`**

Xoá hằng và comment của nó; đổi kiểm tra thành `const allowed = new Set(SOURCES);`, đổi thông báo thành_no-exception.

- [ ] **Step 4: Kiểm tra lời hứa của cả kế hoạch**

Mở `src/theme/typography.ts`, đổi `body: 16` thành `body: 20`, lưu, nhìn trình duyệt. Toàn bộ bảng, ô nhập, nút phải to lên cùng lúc. Đổi lại rồi mới commit. Mô tả đúng thứ đã quan sát được vào báo cáo — đây là điều cả kế hoạch đặt cược, nó xứng đáng có bằng chứng chứ không phải lời khẳng định.

- [ ] **Step 5: Commit**

```bash
npm run lint && npm run build
git commit -m "Finish the type scale migration and drop the allowlist"
```

---

### Task 7: Rà soát kết thúc và ghi DESIGN.md

Hợp đồng hướng đóng bằng dòng FINISH: *"unreviewed and undocumented is unfinished"*. Task này là chỗ trả nợ dòng đó.

**Files:**
- Create: `frontend/src/DESIGN.md`

- [ ] **Step 1: Chạy máy dò cơ học**

```bash
/home/thb/.claude/skills/impeccable/scripts/impeccable detect --json frontend/src/components/AppLayout.tsx frontend/src/pages/DashboardPage.tsx frontend/src/pages/POSPage.tsx
```

Chạy đúng một lần, sau khi giao diện đã xong.

- [ ] **Step 2: Sửa gọn một đợt những gì máy dò tìm ra**

Một đợt, không lặp. Ghi lại cái nào cố ý bỏ qua và vì sao.

- [ ] **Step 3: Rà soát kết thúc bằng subagent chuyên trách**

Dùng `impeccable-finish-reviewer` với hợp đồng hướng ở `frontend/src/.impeccable/surfaces/frontend-src-components-applayout-tsx.md`.

- [ ] **Step 4: Ghi DESIGN.md bằng `impeccable-documenter`**

Viết từ bản đã dựng xong, không viết từ ý định.

- [ ] **Step 5: Commit**

```bash
git commit -m "Record the design system in DESIGN.md"
```

---

## Self-Review

**Spec coverage.** Hợp đồng hướng có sáu khối. THESIS (thứ bậc do cỡ chữ, không do khung) phủ bởi Task 1 + 6. OWN-WORLD (sidebar gradient, nền aurora, bóng mềm, Be Vietnam Pro, sáu bậc) phủ bởi Task 2 + 3. STORY và FIRST VIEWPORT phủ bởi Task 4. Con số `hero` phủ bởi Task 5. FINISH phủ bởi Task 7. **Chưa phủ:** khoảng cách và bo góc mới chỉ được tạo token và áp ở chỗ plan gọi tên, chưa quét toàn bộ 101 chỗ `padding`/`margin` — cố ý, theo lý do đã ghi ở Global Constraints.

**Placeholder scan.** Không còn "TBD" hay bước nào chỉ mô tả mà không có mã hoặc bảng cụ thể. Con số hiện trạng đều là số đếm thật ngày 09/09/2026.

**Type consistency.** `type`, `weight`, `space`, `radius`, `fontFamily`, `injectTypographyVariables` giữ nguyên tên qua cả bảy task. Quy tắc biến CSS `--t-<group>-<token>` khai ở Task 1, dùng ở Task 3. `SOURCES` (số nhiều) thay `SOURCE_OF_TRUTH` khai ở Task 1, dùng lại ở Task 6.

**Rủi ro đã biết.**
- Đổi `Header` ngang sang `Sider` dọc là thay đổi cấu trúc thật, không phải đổi style. Task 3 có bảy mục kiểm tay chính vì thế.
- Be Vietnam Pro tải từ Google Fonts. Máy không có mạng sẽ rơi về stack hệ thống — chấp nhận được, nhưng bố cục sẽ xê dịch nhẹ vì hai font khác bề rộng.
- Quy đổi "bậc gần nhất" ở Task 5 và 6 là quyết định theo nghĩa, không phải phép chia. Chỗ nào 36 → 26 làm hỏng bố cục sẽ lộ ra ở bước kiểm tay.
