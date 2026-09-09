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
