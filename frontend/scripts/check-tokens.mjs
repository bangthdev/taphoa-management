// Chặn giá trị thiết kế viết rải rác thay vì rút từ nguồn duy nhất:
// - Mã màu (hex, rgb/rgba, hsl/hsla) chỉ được khai báo ở src/theme/colors.ts.
// - Cỡ chữ, độ đậm, bo góc chỉ được khai báo ở src/theme/typography.ts —
//   trừ các file trong SIZING_ALLOWLIST, nơi việc chuyển sang token thuộc
//   các task di trú kế tiếp (Task 2-6), chưa phải task này.
// Nơi khác đọc qua object export (TypeScript) hoặc biến --c-*/--t-* (CSS).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = fileURLToPath(new URL('../src/', import.meta.url));
const SOURCES = ['theme/colors.ts', 'theme/typography.ts'];

const COLOR = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\s*\([^)]*\)/gi;
// KHÔNG chặn padding/margin/width/height: `width: 120` cho một cột bảng là quyết
// định bố cục theo ngữ cảnh, chặn chúng tạo nhiễu nhiều hơn giá trị.
const SIZING = /\b(fontSize|fontWeight|borderRadius)\s*:\s*[0-9]/g;

// Xác định bằng lệnh:
// grep -rlE '\b(fontSize|fontWeight|borderRadius)\s*:\s*[0-9]' --include='*.tsx' --include='*.ts' src | sed 's|^src/||' | sort
const SIZING_ALLOWLIST = new Set([
  'components/chat/ChatInput.tsx',
  'components/chat/ChatMessage.tsx',
  'components/common/EmptyState.tsx',
  'components/common/PageHeader.tsx',
  'pages/CreatePurchaseOrderPage.tsx',
  'pages/DashboardPage.tsx',
  'pages/LoginPage.tsx',
  'pages/ProductsPage.tsx',
  'pages/ReportsPage.tsx',
  'styles/common.ts',
]);

const RULES = [
  {
    label: 'màu',
    pattern: COLOR,
    // Màu chỉ được viết ở theme/colors.ts — không có ngoại lệ nào khác.
    allowed: new Set(['theme/colors.ts']),
    message: 'Mã màu chỉ được khai báo ở src/theme/colors.ts.\nTypeScript đọc qua `colors`, CSS đọc qua biến --c-*.',
  },
  {
    label: 'cỡ chữ/độ đậm/bo góc',
    pattern: SIZING,
    allowed: new Set(['theme/typography.ts', ...SIZING_ALLOWLIST]),
    message:
      'Cỡ chữ, độ đậm, bo góc chỉ được khai báo ở src/theme/typography.ts.\n' +
      'TypeScript đọc qua `type`/`weight`/`radius`, CSS đọc qua biến --t-*.',
  },
];

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

const files = [];
for (const file of walk(SRC)) {
  if (!/\.(ts|tsx|css)$/.test(file)) continue;
  files.push({ full: file, rel: relative(SRC, file).split(sep).join('/') });
}

let totalOffenders = 0;

for (const rule of RULES) {
  const offenders = [];

  for (const { full, rel } of files) {
    if (rule.allowed.has(rel)) continue;

    readFileSync(full, 'utf8')
      .split('\n')
      .forEach((line, index) => {
        for (const match of line.matchAll(rule.pattern)) {
          offenders.push(`  src/${rel}:${index + 1}  ${match[0]}`);
        }
      });
  }

  if (offenders.length > 0) {
    console.error(`${rule.message}\n`);
    console.error(offenders.join('\n'));
    console.error(`\n${offenders.length} chỗ vi phạm (${rule.label}).`);
    totalOffenders += offenders.length;
  }
}

if (totalOffenders > 0) {
  process.exit(1);
}

console.log(
  `check-tokens: sạch — không có mã màu ngoài src/${SOURCES[0]}, ` +
    `không có cỡ chữ/độ đậm/bo góc ngoài src/${SOURCES[1]} hoặc allowlist.`
);
