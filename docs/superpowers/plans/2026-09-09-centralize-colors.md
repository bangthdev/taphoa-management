# Kế hoạch gom toàn bộ màu về một nguồn duy nhất

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mọi mã màu của frontend chỉ tồn tại ở `src/theme/colors.ts`; sửa file đó là đổi màu cả dự án, và một script kiểm tra chặn không cho ai viết hex ở chỗ khác.

**Architecture:** `src/theme/colors.ts` giữ bảng màu gốc (`scale`, private) và bảng vai trò (`colors`, export). TypeScript đọc `colors` trực tiếp. File `.css` đọc qua biến `--c-*` do `injectColorVariables()` đổ lên `:root` lúc khởi động, nên CSS và TS dùng chung một nguồn thay vì chép hex hai lần. `scripts/check-colors.mjs` quét `src/` và fail nếu thấy hex ngoài bảng màu; nó được nối vào `npm run lint` nên vi phạm là gãy ngay ở cổng kiểm tra sẵn có.

**Tech Stack:** React 18 · TypeScript · Vite · Ant Design 5 (ConfigProvider theme) · Recharts · ESLint + Prettier

**Spec:** `/home/thb/Documents/Study/learning/decision-2026-09-09-huong-thi-giac-taphoa.html` (mục "2. Ba hướng thị giác" — hướng C, biến thể **Aurora tím** do thb chốt ngày 09/09/2026)

## Global Constraints

- **Không mã hex nào ngoài `src/theme/colors.ts`.** Kể cả `#fff`, `#999`. Áp dụng cho `.ts`, `.tsx`, `.css`.
- **Không đọc `scale` từ ngoài `colors.ts`.** Component chọn vai trò (`colors.revenue`), không chọn màu (`scale.indigo500`).
- **Thiếu token thì thêm token, không nội suy tại chỗ.** Gặp màu chưa có vai trò → thêm một mục vào `colors` kèm comment nói nó dùng vào việc gì, rồi mới dùng.
- **Bảng màu thương hiệu = Aurora tím.** `brand` = `#6366f1` (indigo 500). Teal cũ được giữ lại làm màu ngữ nghĩa của nhóm Khách hàng.
- **Không đổi bố cục, không đổi hành vi.** Kế hoạch này chỉ thay nguồn của màu. Việc dựng lại shell (sidebar dọc, gradient, nền aurora) là **kế hoạch riêng**, làm sau khi kế hoạch này xong.
- **Không đụng logic nghiệp vụ.** Nếu một thay đổi màu bắt phải sửa điều kiện, dừng lại và hỏi.
- Cổng kiểm tra sau mỗi task: `npx tsc --noEmit` và `npm run lint` đều sạch.
- Mỗi task một commit. Commit message tiếng Anh, mệnh lệnh, tối đa 72 ký tự ở dòng đầu, không kèm nhãn AI.

## Bối cảnh cần biết trước khi bắt đầu

- **`npm test` đang hỏng và nằm ngoài phạm vi.** `package.json` có script `"test": "vitest"` nhưng `vitest` không nằm trong `dependencies` lẫn `devDependencies`, và `src/App.test.tsx` vẫn gọi `jest.mock` (di sản Create React App). Kế hoạch này **không** dùng test làm cổng kiểm tra và **không** sửa nó. Ghi lại thành việc riêng.
- **`npm run lint` hiện có sẵn 19 lỗi Prettier + 1 warning**, không liên quan tới màu. Task 1 dọn chúng để lint xanh làm mốc, nếu không sẽ không phân biệt được lỗi mới với lỗi cũ.
- **`src/App.css` không được import ở đâu cả** (chỉ `LoginPage.tsx` import `LoginPage.css`). Đây là file mặc định còn sót của Create React App, chứa `#282c34` và `#61dafb` — màu logo React. Xoá, không migrate.
- **`src/styles/common.ts` là một file token đã chết.** 240 dòng, chỉ 2 nơi import và cả hai đều lấy style layout. Trong đó có `statusColors` dùng màu mặc định Ant Design v4 (`#52c41a`, `#faad14`, `#f5222d`, `#1890ff`) không khớp bản sắc nào. Đây là bằng chứng: tạo file token không đủ, phải có thứ chặn việc đi vòng.
- **`POSPage.tsx` và `CreatePurchaseOrderPage.tsx` chứa một khối `const THEME = {...}` 15 màu giống hệt nhau từng ký tự.** Xoá cả hai, thay bằng `colors`.

## File Structure

| File | Trạng thái | Trách nhiệm |
|---|---|---|
| `frontend/src/theme/colors.ts` | Đã tạo | Nguồn duy nhất của màu. Không chứa gì khác. |
| `frontend/scripts/check-colors.mjs` | Tạo mới | Quét `src/`, fail khi thấy hex ngoài bảng màu. Giữ danh sách file chưa migrate. |
| `frontend/package.json` | Sửa | Nối script kiểm tra vào `lint`. |
| `frontend/src/index.tsx` | Sửa | Gọi `injectColorVariables()` trước khi render. |
| `frontend/src/App.tsx` | Sửa | Theme Ant Design lấy màu từ `colors`. |
| `frontend/src/index.css` | Sửa | Dùng `var(--c-*)`. |
| `frontend/src/App.css` | Xoá | File chết. |
| `frontend/src/styles/common.ts` | Sửa | `statusColors` và các nền lấy từ `colors`. |
| `frontend/src/components/AppLayout.tsx` | Sửa | Gradient header + chữ trắng lấy từ `colors`. |
| `frontend/src/pages/DashboardPage.tsx` | Sửa | Màu biểu đồ và icon số liệu. |
| `frontend/src/pages/ReportsPage.tsx` | Sửa | Màu biểu đồ, huy hiệu xếp hạng. |
| `frontend/src/pages/POSPage.tsx` | Sửa | Xoá `THEME` cục bộ. |
| `frontend/src/pages/CreatePurchaseOrderPage.tsx` | Sửa | Xoá `THEME` cục bộ. |
| `frontend/src/pages/ProductsPage.tsx` | Sửa | 4 màu trạng thái. |
| `frontend/src/pages/LoginPage.css` | Sửa | Đổi bảng màu riêng sang biến chung. |
| `frontend/src/components/chat/ChatMessage.tsx` | Sửa | Bong bóng tin nhắn. |
| `frontend/src/components/chat/ChatInput.tsx` | Sửa | Viền ô nhập. |

---

### Task 1: Dựng cổng kiểm tra và mốc lint sạch

Task này phải làm trước, vì nó là thứ biến "quy ước" thành "không làm được".

**Files:**
- Create: `frontend/scripts/check-colors.mjs`
- Modify: `frontend/package.json` (script `lint`)
- Modify: nhiều file dưới `frontend/src` (chỉ định dạng, do `--fix` sinh ra)

**Interfaces:**
- Consumes: chưa có gì
- Produces: lệnh `npm run lint` fail khi có hex ngoài `src/theme/colors.ts` và ngoài `ALLOWLIST`. Các task sau xoá dần tên file khỏi `ALLOWLIST`.

- [ ] **Step 1: Dọn 19 lỗi Prettier có sẵn để lấy mốc sạch**

```bash
cd frontend
npm run lint -- --fix
npm run lint
```

Expected: không còn lỗi nào. Nếu còn lỗi không phải Prettier, dừng lại và báo — đó là lỗi thật, không thuộc task này.

- [ ] **Step 2: Viết script kiểm tra**

Tạo `frontend/scripts/check-colors.mjs`:

```js
// Chặn mã màu viết rải rác. Màu chỉ được khai báo ở src/theme/colors.ts;
// nơi khác đọc qua `colors` (TypeScript) hoặc biến --c-* (CSS).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = fileURLToPath(new URL('../src/', import.meta.url));
const SOURCE_OF_TRUTH = 'theme/colors.ts';

// Danh sách rút dần: mỗi task migrate xong một file thì xoá tên nó khỏi đây.
// Khi mảng rỗng, xoá luôn hằng này cùng nhánh kiểm tra bên dưới.
const ALLOWLIST = [
  'App.css',
  'App.tsx',
  'components/AppLayout.tsx',
  'components/chat/ChatInput.tsx',
  'components/chat/ChatMessage.tsx',
  'index.css',
  'pages/CreatePurchaseOrderPage.tsx',
  'pages/DashboardPage.tsx',
  'pages/LoginPage.css',
  'pages/POSPage.tsx',
  'pages/ProductsPage.tsx',
  'pages/ReportsPage.tsx',
  'styles/common.ts',
];

const HEX = /#[0-9a-fA-F]{3,8}\b/g;

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      yield* walk(full);
      continue;
    }
    yield full;
  }
}

const allowed = new Set([SOURCE_OF_TRUTH, ...ALLOWLIST]);
const offenders = [];

for (const file of walk(SRC)) {
  if (!/\.(ts|tsx|css)$/.test(file)) continue;
  const rel = relative(SRC, file).split(sep).join('/');
  if (allowed.has(rel)) continue;

  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, index) => {
      for (const match of line.matchAll(HEX)) {
        offenders.push(`  src/${rel}:${index + 1}  ${match[0]}`);
      }
    });
}

if (offenders.length > 0) {
  console.error(
    `Mã màu chỉ được khai báo ở src/${SOURCE_OF_TRUTH}.\n` +
      `TypeScript đọc qua \`colors\`, CSS đọc qua biến --c-*.\n`
  );
  console.error(offenders.join('\n'));
  console.error(`\n${offenders.length} chỗ vi phạm.`);
  process.exit(1);
}

console.log(
  `check-colors: sạch (${ALLOWLIST.length} file còn trong danh sách chờ migrate).`
);
```

- [ ] **Step 3: Chạy để xác nhận script bắt được vi phạm**

Tạm bỏ `'pages/ProductsPage.tsx'` ra khỏi `ALLOWLIST` rồi chạy:

```bash
node scripts/check-colors.mjs
```

Expected: FAIL, exit code 1, in ra đúng 4 dòng `src/pages/ProductsPage.tsx:250 #0d9488`, `:328 #94a3b8`, `:623 #ef4444`, `:630 #22c55e`.

Thêm lại `'pages/ProductsPage.tsx'` vào `ALLOWLIST`, chạy lại, expected: in `check-colors: sạch (13 file còn trong danh sách chờ migrate).`

- [ ] **Step 4: Nối script vào cổng lint sẵn có**

Trong `frontend/package.json`, đổi:

```json
"lint": "eslint src",
```

thành:

```json
"lint": "eslint src && node scripts/check-colors.mjs",
```

- [ ] **Step 5: Kiểm tra và commit**

```bash
npm run lint
npx tsc --noEmit
git add frontend/scripts/check-colors.mjs frontend/package.json frontend/src
git commit -m "Add a check that bans colour literals outside the palette" \
  -m "Problem:
- Colour values were written inline across thirteen files, so changing a
  shade meant hunting for it. An earlier attempt at a shared file,
  src/styles/common.ts, was imported by two modules and never for colour.

Solution:
- Add scripts/check-colors.mjs, which fails on any hex literal outside
  src/theme/colors.ts, and run it from npm run lint.
- Carry a shrinking allowlist so files can migrate one at a time.
- Apply the pending Prettier fixes so lint starts from green."
```

---

### Task 2: Nối bảng màu vào ứng dụng

**Files:**
- Verify: `frontend/src/theme/colors.ts` (đã tạo sẵn ở phiên trước)
- Modify: `frontend/src/index.tsx`

**Interfaces:**
- Consumes: `ALLOWLIST` từ Task 1
- Produces: `colors` (object các vai trò màu) và `injectColorVariables(root?: HTMLElement): void` từ `src/theme/colors.ts`. Sau task này, biến `--c-brand`, `--c-brand-soft`, `--c-text`, `--c-surface`, … có mặt trên `:root` lúc chạy. Quy tắc đặt tên: khoá camelCase → `--c-` + kebab-case (`brandSoftStrong` → `--c-brand-soft-strong`).

- [ ] **Step 1: Đọc lại bảng màu, xác nhận đủ vai trò**

Mở `src/theme/colors.ts`. Xác nhận có đủ các nhóm: thương hiệu, trạng thái hệ thống, màu ngữ nghĩa nghiệp vụ, chữ, bề mặt, gradient, đổ bóng. Không sửa gì ở bước này.

- [ ] **Step 2: Gọi hàm đổ biến trước khi render**

Trong `frontend/src/index.tsx`, thêm import và lời gọi:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { injectColorVariables } from './theme/colors';

// Phải chạy trước lần render đầu, để CSS có sẵn biến --c-* khi khung hình đầu tiên vẽ.
injectColorVariables();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
```

Phần còn lại của file giữ nguyên.

- [ ] **Step 3: Xác nhận biến có thật trên trang**

```bash
npm start
```

Mở `http://localhost:3000`, trong Console của trình duyệt chạy:

```js
getComputedStyle(document.documentElement).getPropertyValue('--c-brand')
```

Expected: `" #6366f1"` (có khoảng trắng đầu). Nếu ra chuỗi rỗng, `injectColorVariables()` chưa chạy.

- [ ] **Step 4: Kiểm tra và commit**

```bash
npx tsc --noEmit
npm run lint
git add frontend/src/theme/colors.ts frontend/src/index.tsx
git commit -m "Add a single source for every colour in the app" \
  -m "Problem:
- Colours lived wherever they were first needed, so the brand shade
  appeared eighteen times and the palette had no names for what each
  colour meant.

Solution:
- Add src/theme/colors.ts holding a private raw scale and a public map of
  roles, so callers pick a meaning rather than a shade.
- Mirror the roles into --c-* custom properties at startup so stylesheets
  read the same source as TypeScript."
```

---

### Task 3: Chuyển theme Ant Design

`App.tsx` đáng làm trước mọi trang, vì `ConfigProvider` phủ màu xuống toàn bộ component antd — xong task này là phần lớn giao diện đã đổi màu mà chưa cần đụng trang nào.

**Files:**
- Modify: `frontend/src/App.tsx:47-126`
- Modify: `frontend/scripts/check-colors.mjs` (xoá `'App.tsx'` khỏi `ALLOWLIST`)

**Interfaces:**
- Consumes: `colors` từ Task 2
- Produces: giao diện Ant Design lấy màu thương hiệu tím thay cho teal

- [ ] **Step 1: Thêm import**

Đầu `frontend/src/App.tsx`, sau các import hiện có:

```tsx
import { colors } from './theme/colors';
```

- [ ] **Step 2: Thay từng giá trị theo bảng này**

| Dòng | Thuộc tính | Từ | Thành |
|---|---|---|---|
| 50 | `colorPrimary` | `'#0d9488'` | `colors.brand` |
| 51 | `colorPrimaryHover` | `'#0f766e'` | `colors.brandHover` |
| 52 | `colorPrimaryActive` | `'#115e59'` | `colors.brandActive` |
| 55 | `colorSuccess` | `'#22c55e'` | `colors.success` |
| 56 | `colorWarning` | `'#f59e0b'` | `colors.warning` |
| 57 | `colorError` | `'#ef4444'` | `colors.danger` |
| 58 | `colorInfo` | `'#3b82f6'` | `colors.info` |
| 61 | `colorBgLayout` | `'#f0fdfa'` | `colors.bg` |
| 62 | `colorText` | `'#1f2937'` | `colors.text` |
| 63 | `colorTextSecondary` | `'#4b5563'` | `colors.textSecondary` |
| 65 | `colorTextDescription` | `'#4b5563'` | `colors.textSecondary` |
| 106 | `Table.headerBg` | `'#f0fdfa'` | `colors.brandSoft` |
| 107 | `Table.headerColor` | `'#0f766e'` | `colors.brandInk` |

Xoá các comment nêu tên màu cũ (`// Teal 600 - màu chủ đạo`, `// Green 500 - thành công`, …): tên vai trò đã nói đủ, để lại chỉ thành sai khi đổi màu.

Giữ nguyên comment nêu **lý do** (dòng 64 về tỉ lệ tương phản, dòng 74-75 về thang chữ, dòng 113-114 về cỡ số liệu).

- [ ] **Step 3: Đổi `Card.boxShadow` sang token**

Dòng 97, thay:

```tsx
boxShadow: '0 1px 3px rgba(0,0,0,0.1)', // Đổ bóng nhẹ
```

thành:

```tsx
boxShadow: colors.shadowCard,
```

- [ ] **Step 4: Gỡ `App.tsx` khỏi danh sách chờ**

Trong `frontend/scripts/check-colors.mjs`, xoá dòng `'App.tsx',` khỏi `ALLOWLIST`.

- [ ] **Step 5: Kiểm tra và commit**

```bash
npx tsc --noEmit
npm run lint
```

Expected: cả hai sạch; `check-colors` in `12 file còn trong danh sách chờ migrate`.

Chạy `npm start`, mở trang Sản phẩm, xác nhận: nút chính đã là tím, header bảng nền tím nhạt chữ tím đậm, chữ phụ vẫn đọc rõ.

```bash
git add frontend/src/App.tsx frontend/scripts/check-colors.mjs
git commit -m "Read the Ant Design theme from the palette"
```

---

### Task 4: Chuyển `index.css`, xoá `App.css` chết

**Files:**
- Modify: `frontend/src/index.css`
- Delete: `frontend/src/App.css`
- Modify: `frontend/scripts/check-colors.mjs`

**Interfaces:**
- Consumes: biến `--c-*` từ Task 2
- Produces: không còn hex trong CSS toàn cục

- [ ] **Step 1: Xác nhận `App.css` thật sự không ai dùng**

```bash
cd frontend
grep -rn "App.css" src/
```

Expected: không có kết quả nào. Nếu có, dừng lại — file không chết, phải migrate thay vì xoá.

- [ ] **Step 2: Xoá file chết**

```bash
git rm src/App.css
```

- [ ] **Step 3: Thay hex trong `index.css` bằng biến**

| Dòng | Từ | Thành |
|---|---|---|
| 16 | `accent-color: #0d9488;` | `accent-color: var(--c-brand);` |
| 17 | `caret-color: #0d9488;` | `caret-color: var(--c-brand);` |
| 21 | `background: #99f6e4;` | `background: var(--c-brand-soft-strong);` |
| 22 | `color: #134e4a;` | `color: var(--c-brand-ink);` |
| 27 | `scrollbar-color: #5eead4 transparent;` | `scrollbar-color: var(--c-brand-border) transparent;` |
| 31 | `outline: 2px solid #0d9488;` | `outline: 2px solid var(--c-brand);` |
| 56 | `border-bottom: 1px solid #99f6e4 !important;` | `border-bottom: 1px solid var(--c-brand-border) !important;` |
| 103 | `background: #f0fdfa;` | `background: var(--c-brand-soft);` |

- [ ] **Step 4: Gỡ khỏi danh sách chờ**

Trong `frontend/scripts/check-colors.mjs`, xoá hai dòng `'App.css',` và `'index.css',`.

- [ ] **Step 5: Kiểm tra và commit**

```bash
npm run lint
npm run build
```

Chạy `npm start`, xác nhận: bôi đen một đoạn chữ thấy nền tím nhạt, bấm Tab thấy viền tím quanh nút, thanh cuộn màu tím nhạt.

```bash
git add -A frontend/src frontend/scripts/check-colors.mjs
git commit -m "Read global stylesheet colours from CSS variables" \
  -m "- Point index.css at the --c-* variables the palette injects
- Delete the unused Create React App leftover src/App.css"
```

---

### Task 5: Chuyển `styles/common.ts`

**Files:**
- Modify: `frontend/src/styles/common.ts`
- Modify: `frontend/scripts/check-colors.mjs`

**Interfaces:**
- Consumes: `colors` từ Task 2
- Produces: `statusColors` đồng bộ với bảng màu chung

- [ ] **Step 1: Thêm import**

```ts
import type { CSSProperties } from 'react';

import { colors } from '../theme/colors';
```

- [ ] **Step 2: Thay theo bảng**

| Dòng | Ngữ cảnh | Từ | Thành |
|---|---|---|---|
| 58 | `contentCard.background` | `'#fff'` | `colors.surface` |
| 85 | `posContainer.background` | `'#f5f5f5'` | `colors.bg` |
| 89 | `posHeader.background` | `'#001529'` | `colors.brandInk` |
| 99 | `posTabBar.background` | `'#fff'` | `colors.surface` |
| 101 | `posTabBar.borderBottom` | `'1px solid #e8e8e8'` | `` `1px solid ${colors.border}` `` |
| 155 | `emptyStateIcon.color` | `'#d9d9d9'` | `colors.borderStrong` |

- [ ] **Step 3: Đổi `statusColors` sang vai trò**

Thay khối dòng 244-250:

```ts
// Status colors (for reference, use with Ant Design Tag)
export const statusColors = {
  success: '#52c41a',
  warning: '#faad14',
  error: '#f5222d',
  info: '#1890ff',
  default: '#d9d9d9',
} as const;
```

bằng:

```ts
export const statusColors = {
  success: colors.success,
  warning: colors.warning,
  error: colors.danger,
  info: colors.info,
  default: colors.borderStrong,
} as const;
```

- [ ] **Step 4: Gỡ khỏi danh sách chờ**

Xoá `'styles/common.ts',` khỏi `ALLOWLIST`.

- [ ] **Step 5: Kiểm tra và commit**

```bash
npx tsc --noEmit
npm run lint
git add frontend/src/styles/common.ts frontend/scripts/check-colors.mjs
git commit -m "Point the shared style helpers at the palette"
```

---

### Task 6: Chuyển `AppLayout.tsx`

**Files:**
- Modify: `frontend/src/components/AppLayout.tsx`
- Modify: `frontend/scripts/check-colors.mjs`

**Interfaces:**
- Consumes: `colors` từ Task 2
- Produces: khung vỏ ứng dụng đổi sang gradient thương hiệu mới

- [ ] **Step 1: Thêm import**

```tsx
import { colors } from '../theme/colors';
```

- [ ] **Step 2: Đổi gradient header**

Dòng 220, thay:

```tsx
background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%)',
```

thành:

```tsx
background: colors.sidebar,
```

Token `colors.sidebar` đặt tên theo chỗ nó sẽ dùng ở kế hoạch dựng shell sau này; ở đây header ngang tạm dùng chung gradient đó nên chỉ có một định nghĩa.

- [ ] **Step 3: Đổi 6 chỗ chữ trắng**

Các dòng 243, 251, 290, 302, 315, 328 dùng `'#fff'` hoặc `'rgba(255,255,255,...)'` cho chữ và viền đặt trên nền gradient. Thay:

| Ngữ cảnh | Từ | Thành |
|---|---|---|
| màu chữ trên gradient | `'#fff'` | `colors.onBrand` |
| chữ phụ (vai trò người dùng) | `'rgba(255,255,255,0.7)'` | `colors.onBrandMuted` |
| viền nút ghost | `'rgba(255,255,255,0.3)'` | `colors.onBrandBorder` |
| nền nút ghost | `'rgba(255,255,255,0.1)'` | `colors.onBrandActiveBg` |

- [ ] **Step 4: Gỡ khỏi danh sách chờ**

Xoá `'components/AppLayout.tsx',` khỏi `ALLOWLIST`.

- [ ] **Step 5: Kiểm tra và commit**

```bash
npx tsc --noEmit
npm run lint
```

Chạy `npm start`, xác nhận: thanh trên cùng đã là gradient tím, chữ trắng còn đọc rõ, nút "Thoát" và "Thay ca" vẫn thấy viền.

```bash
git add frontend/src/components/AppLayout.tsx frontend/scripts/check-colors.mjs
git commit -m "Read the app shell colours from the palette"
```

---

### Task 7: Chuyển hai trang báo cáo

Gộp `DashboardPage` và `ReportsPage` vào một task vì chúng dùng chung màu biểu đồ; tách ra sẽ phải quyết định cùng một vấn đề hai lần.

**Files:**
- Modify: `frontend/src/theme/colors.ts` (thêm token xếp hạng và nền nhạt)
- Modify: `frontend/src/pages/DashboardPage.tsx`
- Modify: `frontend/src/pages/ReportsPage.tsx`
- Modify: `frontend/scripts/check-colors.mjs`

**Interfaces:**
- Consumes: `colors` từ Task 2
- Produces: các token mới `colors.profitSoft`, `colors.rankGold`, `colors.rankSilver`, `colors.rankBronze` dùng lại được ở Task 8

- [ ] **Step 1: Thêm token còn thiếu vào bảng màu**

Trong `src/theme/colors.ts`, thêm vào `scale`:

```ts
  emerald200: '#bbf7d0',
  amber400: '#facc15',
  orange500: '#f97316',
```

và thêm vào `colors`, ngay sau `customer`:

```ts
  /** Nền vùng tô dưới đường lợi nhuận trên biểu đồ */
  profitSoft: scale.emerald200,

  /* ---------- Huy hiệu xếp hạng (bảng sản phẩm bán chạy) ---------- */
  rankGold: scale.amber400,
  rankSilver: scale.slate400,
  rankBronze: scale.orange500,
```

- [ ] **Step 2: Chuyển `DashboardPage.tsx`**

| Dòng | Ngữ cảnh | Từ | Thành |
|---|---|---|---|
| 28 | `statIconStyle.color` | `'#0d9488'` | `colors.brand` |
| 202 | chữ số âm | `'#cf1322'` | `colors.danger` |
| 212 | chữ mờ | `'#999'` | `colors.textMuted` |
| 266 | `<Bar fill>` | `'#0d9488'` | `colors.revenue` |
| 278 | chữ số âm | `'#cf1322'` | `colors.danger` |
| 300 | cảnh báo | `'#faad14'` | `colors.warning` |

Thêm import `import { colors } from '../theme/colors';`.

- [ ] **Step 3: Chuyển `ReportsPage.tsx`**

| Dòng | Ngữ cảnh | Từ | Thành |
|---|---|---|---|
| 89, 227 | chữ nhãn biểu đồ | `'#4b5563'`, `'#6b7280'` | `colors.textSecondary`, `colors.cost` |
| 216, 248, 276, 392 | doanh thu | `'#0d9488'` | `colors.revenue` |
| 238, 295, 312, 451 | lợi nhuận | `'#22c55e'` | `colors.profit` |
| 259 | giá vốn / cảnh báo | `'#f59e0b'` | `colors.lowStock` |
| 296 | nền vùng tô | `'#bbf7d0'` | `colors.profitSoft` |
| 312 | chênh lệch âm | `'#ef4444'` | `colors.overdue` |
| 391 | chữ mờ | `'#9ca3af'` | `colors.textMuted` |
| 410 | `rankColors` | `{ 1: '#facc15', 2: '#9ca3af', 3: '#f97316' }` | `{ 1: colors.rankGold, 2: colors.rankSilver, 3: colors.rankBronze }` |

Thêm import `import { colors } from '../theme/colors';`.

- [ ] **Step 4: Gỡ khỏi danh sách chờ**

Xoá `'pages/DashboardPage.tsx',` và `'pages/ReportsPage.tsx',` khỏi `ALLOWLIST`.

- [ ] **Step 5: Kiểm tra và commit**

```bash
npx tsc --noEmit
npm run lint
```

Chạy `npm start` với tài khoản admin, mở Tổng quan và Báo cáo, xác nhận: cột biểu đồ doanh thu màu tím, đường lợi nhuận xanh lá có vùng tô nhạt, ba huy hiệu xếp hạng vàng/xám/cam vẫn phân biệt được.

```bash
git add frontend/src/theme/colors.ts frontend/src/pages/DashboardPage.tsx frontend/src/pages/ReportsPage.tsx frontend/scripts/check-colors.mjs
git commit -m "Read report chart colours from the palette" \
  -m "- Name the ranking medals and the profit fill as roles in the palette
- Point both report pages at those roles instead of inline values"
```

---

### Task 8: Xoá hai khối `THEME` trùng lặp

Task rủi ro nhất trong kế hoạch: `POSPage` là màn bán hàng, hỏng là không bán được. Làm sau cùng trong nhóm trang, và kiểm tay kỹ trước khi commit.

**Files:**
- Modify: `frontend/src/theme/colors.ts` (thêm token nền trạng thái)
- Modify: `frontend/src/pages/POSPage.tsx:60-75` và các chỗ dùng `THEME`
- Modify: `frontend/src/pages/CreatePurchaseOrderPage.tsx:45-60` và các chỗ dùng `THEME`
- Modify: `frontend/scripts/check-colors.mjs`

**Interfaces:**
- Consumes: `colors`, `colors.profitSoft` từ Task 7
- Produces: không còn bảng màu cục bộ nào trong dự án

- [ ] **Step 1: Thêm token nền trạng thái**

Trong `scale`:

```ts
  emerald50: '#f0fdf4',
  rose50: '#fef2f2',
  rose200: '#fecaca',
  rose800: '#991b1b',
  red600: '#dc2626',
```

Trong `colors`, sau `profitSoft`:

```ts
  /** Nền ô thông báo thành công (tiền thừa trả khách) */
  successSoft: scale.emerald50,
  /** Nền, viền và chữ của ô cảnh báo lỗi */
  dangerSoft: scale.rose50,
  dangerBorder: scale.rose200,
  dangerInk: scale.rose800,
  dangerStrong: scale.red600,
```

- [ ] **Step 2: Lập bảng quy đổi dùng chung cho cả hai trang**

Hai khối `THEME` giống nhau từng ký tự, nên dùng chung một bảng:

| Khoá `THEME` | Giá trị cũ | Thay bằng |
|---|---|---|
| `primary` | `#0d9488` | `colors.brand` |
| `primaryLight` | `#14b8a6` | `colors.customer` |
| `primaryDark` | `#0f766e` | `colors.brandHover` |
| `success` | `#22c55e` | `colors.success` |
| `warning` | `#f59e0b` | `colors.warning` |
| `error` | `#ef4444` | `colors.danger` |
| `gray50` | `#f9fafb` | `colors.surfaceSunken` |
| `gray100` | `#f3f4f6` | `colors.surfaceSunken` |
| `gray200` | `#e5e7eb` | `colors.border` |
| `gray300` | `#d1d5db` | `colors.borderStrong` |
| `gray400` | `#9ca3af` | `colors.textMuted` |
| `gray500` | `#6b7280` | `colors.cost` |
| `gray600` | `#4b5563` | `colors.textSecondary` |
| `white` | `#ffffff` | `colors.surface` |

`primaryLight` quy về `colors.customer` (teal cũ) là cố ý: nó vốn là teal sáng, và teal trong bảng màu mới mang vai trò nhóm Khách hàng.

- [ ] **Step 3: Thay trong `POSPage.tsx`**

Xoá khối `const THEME = {...}` (dòng 60-75). Thêm `import { colors } from '../theme/colors';`. Đổi mọi tham chiếu `THEME.x` sang cột phải của bảng trên.

Ba chỗ hex nằm ngoài `THEME`, xử lý riêng:

| Dòng | Ngữ cảnh | Từ | Thành |
|---|---|---|---|
| 817 | nền vùng thanh toán | `'#f0fdfa'` | `colors.brandSoft` |
| 829 | nền ô tiền thừa | `'#f0fdf4'` | `colors.successSoft` |
| 830 | viền ô tiền thừa | `'#bbf7d0'` | `colors.profitSoft` |
| 839, 842 | chữ tiền thừa | `'#166534'`, `'#15803d'` | `colors.profit` |

- [ ] **Step 4: Thay trong `CreatePurchaseOrderPage.tsx`**

Xoá khối `const THEME = {...}` (dòng 45-60). Thêm import. Đổi tham chiếu theo cùng bảng ở Step 2.

Bốn chỗ hex ngoài `THEME`:

| Dòng | Ngữ cảnh | Từ | Thành |
|---|---|---|---|
| 548 | nền ô lỗi | `'#fef2f2'` | `colors.dangerSoft` |
| 549 | viền ô lỗi | `'#fecaca'` | `colors.dangerBorder` |
| 558 | chữ tiêu đề lỗi | `'#991b1b'` | `colors.dangerInk` |
| 561 | chữ nội dung lỗi | `'#dc2626'` | `colors.dangerStrong` |

- [ ] **Step 5: Kiểm tay màn bán hàng rồi commit**

```bash
npx tsc --noEmit
npm run lint
```

Xoá `'pages/POSPage.tsx',` và `'pages/CreatePurchaseOrderPage.tsx',` khỏi `ALLOWLIST`, chạy lại `npm run lint`.

Chạy `npm start`, mở `/pos` và làm hết một lượt bán thật:

- [ ] Tìm và thêm 3 sản phẩm vào giỏ
- [ ] Sửa số lượng bằng nút +/−
- [ ] Bấm nút tiền nhanh 50k, xác nhận ô tiền thừa hiện nền xanh nhạt, chữ xanh đậm đọc rõ
- [ ] Nhấn F1, xác nhận phím tắt còn chạy
- [ ] Hoàn tất đơn, xác nhận in được hoá đơn

Mở `/purchase-orders/create`, nhập một dòng thiếu thông tin để ô báo lỗi hiện ra, xác nhận nền hồng nhạt và chữ đỏ vẫn đọc rõ.

```bash
git add frontend/src/theme/colors.ts frontend/src/pages/POSPage.tsx frontend/src/pages/CreatePurchaseOrderPage.tsx frontend/scripts/check-colors.mjs
git commit -m "Delete the duplicated local THEME blocks" \
  -m "Problem:
- POSPage and CreatePurchaseOrderPage each carried a byte-identical
  fifteen-colour THEME constant, so the two screens could drift apart and
  neither followed the app palette.

Solution:
- Remove both constants and read the shared roles from the palette.
- Name the success and error surface shades as roles rather than leaving
  them inline."
```

---

### Task 9: Dọn nốt và tháo danh sách chờ

**Files:**
- Modify: `frontend/src/components/chat/ChatMessage.tsx`
- Modify: `frontend/src/components/chat/ChatInput.tsx`
- Modify: `frontend/src/pages/ProductsPage.tsx`
- Modify: `frontend/src/pages/LoginPage.css`
- Modify: `frontend/src/theme/colors.ts`
- Modify: `frontend/scripts/check-colors.mjs` (xoá hẳn `ALLOWLIST`)

**Interfaces:**
- Consumes: `colors` và biến `--c-*`
- Produces: `npm run lint` fail với **bất kỳ** hex nào ngoài `src/theme/colors.ts`, không còn ngoại lệ

- [ ] **Step 1: Chuyển ba file TypeScript còn lại**

`ChatMessage.tsx`:

| Dòng | Ngữ cảnh | Từ | Thành |
|---|---|---|---|
| 54, 72 | avatar / nền bong bóng người dùng | `'#0d9488'` | `colors.brand` |
| 72 | nền bong bóng trợ lý | `'#1677ff'` | `colors.info` |
| 76 | nền nhạt bong bóng | `'#e6f4ff'` | `colors.brandSoft` |
| 76 | nền nhạt bong bóng | `'#f5f5f5'` | `colors.surfaceSunken` |

`ChatInput.tsx` dòng 40: `'#f0f0f0'` → `colors.border`.

`ProductsPage.tsx`:

| Dòng | Từ | Thành |
|---|---|---|
| 250 | `'#0d9488'` | `colors.brand` |
| 328 | `'#94a3b8'` | `colors.textMuted` |
| 623 | `'#ef4444'` | `colors.danger` |
| 630 | `'#22c55e'` | `colors.success` |

Thêm import `colors` vào cả ba file.

- [ ] **Step 2: Thêm token cho trang đăng nhập**

`LoginPage.css` đang mang một bản sắc riêng hoàn toàn: gradient `#667eea → #764ba2` cùng ba màu trang trí `#ff6b6b`, `#ffe66d`, `#4ecdc4`. Gradient tím này thực ra đã gần với hướng Aurora tím, nên gộp về token chung.

Trong `scale`:

```ts
  coral400: '#ff6b6b',
  yellow300: '#ffe66d',
  aqua400: '#4ecdc4',
```

Trong `colors`:

```ts
  /* ---------- Trang đăng nhập ---------- */
  /** Nền toàn màn hình của trang đăng nhập */
  loginBackdrop: `linear-gradient(135deg, ${scale.indigo600} 0%, ${scale.purple600} 100%)`,
  /** Ba khối trang trí nổi phía sau khung đăng nhập */
  loginAccentWarm: scale.coral400,
  loginAccentBright: scale.yellow300,
  loginAccentCool: scale.aqua400,
```

- [ ] **Step 3: Chuyển `LoginPage.css` sang biến**

| Dòng | Từ | Thành |
|---|---|---|
| 6 | `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` | `var(--c-login-backdrop)` |
| 31 | `#ff6b6b` | `var(--c-login-accent-warm)` |
| 39 | `#4ecdc4` | `var(--c-login-accent-cool)` |
| 48 | `#ffe66d` | `var(--c-login-accent-bright)` |
| 98, 174, 195, 215, 239 | `#0d9488`, `#14b8a6` | `var(--c-brand)`, `var(--c-brand-hover)` |
| 116, 161 | `#1e293b` | `var(--c-text)` |
| 123 | `#64748b` | `var(--c-text-secondary)` |
| 157 | `#e2e8f0` | `var(--c-border)` |
| 169, 188, 203 | `#94a3b8` | `var(--c-text-muted)` |
| 180, 220 | `#ef4444` | `var(--c-danger)` |

- [ ] **Step 4: Tháo hẳn danh sách chờ**

Trong `frontend/scripts/check-colors.mjs`, xoá hằng `ALLOWLIST` và comment của nó, rồi đổi hai chỗ dùng:

```js
const allowed = new Set([SOURCE_OF_TRUTH]);
```

```js
console.log('check-colors: sạch, không có mã hex nào ngoài bảng màu.');
```

- [ ] **Step 5: Kiểm tra toàn bộ và commit**

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Expected: `check-colors: sạch, không có mã hex nào ngoài bảng màu.`

Kiểm tay: mở trang đăng nhập (đăng xuất trước), xác nhận nền gradient tím và ba khối trang trí còn hiện; mở hộp chat, gửi một câu, xác nhận bong bóng hai bên phân biệt được.

Kiểm tra lời hứa của cả kế hoạch: mở `src/theme/colors.ts`, đổi `brand: scale.indigo500` thành `brand: scale.teal500`, lưu, nhìn trình duyệt. Toàn bộ nút, viền focus, header bảng, avatar chat phải đổi sang teal cùng lúc. Đổi ngược lại rồi mới commit.

```bash
git add -A frontend/src frontend/scripts/check-colors.mjs
git commit -m "Finish the palette migration and drop the allowlist" \
  -m "- Move the chat, product and login colours onto shared roles
- Fold the login page's separate gradient into the palette
- Remove the allowlist so any new hex literal now fails lint"
```

---

## Self-Review

**Spec coverage.** Spec (mục 2, hướng C — Aurora tím) đòi ba thứ: bảng màu ngữ nghĩa nhiều màu, gradient, và giữ Ant Design. Bảng màu ngữ nghĩa: Task 2 dựng, Task 7 và 8 mở rộng. Gradient: `colors.sidebar` và `colors.brandGradient` có trong Task 2, dùng ở Task 6. Giữ Ant Design: Task 3 đi qua `ConfigProvider`, không thay component nào. **Phần chưa phủ:** dựng lại shell thành sidebar dọc và nền aurora — đây là **cố ý**, tách thành kế hoạch riêng theo Global Constraints, vì nó đổi bố cục chứ không đổi nguồn màu.

**Placeholder scan.** Không còn "TBD", "tương tự task N", hay bước nào chỉ mô tả mà không có mã. Mọi bảng quy đổi đều ghi số dòng thật lấy từ mã nguồn ngày 09/09/2026.

**Type consistency.** `colors` và `injectColorVariables` giữ nguyên tên qua cả 9 task. Token thêm ở Task 7 (`profitSoft`, `rankGold`, `rankSilver`, `rankBronze`) được Task 8 dùng lại đúng tên. `ALLOWLIST` và `SOURCE_OF_TRUTH` đặt ở Task 1, rút dần ở Task 3-8, xoá ở Task 9.

**Rủi ro đã biết.**
- Số dòng sẽ trôi sau mỗi task. Executor nên tìm theo **giá trị hex** chứ không nhảy thẳng tới số dòng.
- Regex `#[0-9a-fA-F]{3,8}\b` bắt nhầm selector CSS gồm toàn ký tự hex (ví dụ `#face`). Dự án hiện không có selector nào như vậy; nếu sau này có, thêm ngoại lệ trong script.
- Đổi `brand` từ teal sang tím làm mọi ảnh chụp màn hình cũ trong tài liệu lệch màu. Chưa có ảnh nào được chèn (README còn để trong comment), nên chưa phải xử lý.

## Việc phát sinh, không thuộc kế hoạch này

1. **`npm test` hỏng.** Script gọi `vitest` nhưng gói không được cài; `src/App.test.tsx` còn dùng `jest.mock`. Cần một việc riêng: cài `vitest`, thêm khối `test` vào `vite.config.ts` với `environment: 'jsdom'` và `setupFiles`, đổi `jest.*` thành `vi.*`.
2. **Dựng lại shell (bước 2 của lộ trình).** Sidebar dọc thay thanh ngang, nền aurora, bóng mềm, nút gradient. Làm sau khi kế hoạch này xong, để nó được viết trên nền đã có token.
3. **`src/styles/common.ts` phần lớn là mã chết.** Sau Task 5 nó đúng màu, nhưng vẫn còn ~200 dòng không ai import. Cân nhắc xoá phần không dùng.
