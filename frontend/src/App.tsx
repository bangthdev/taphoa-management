import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Agentation } from 'agentation';
import { ConfigProvider, Spin } from 'antd';
import viVN from 'antd/locale/vi_VN';
import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthProvider';
import { colors } from './theme/colors';
import { type, radius, fontFamily } from './theme/typography';

// 🚀 Lazy loading các pages để giảm bundle size ban đầu
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const CategoriesPage = React.lazy(() => import('./pages/CategoriesPage'));
const SuppliersPage = React.lazy(() => import('./pages/SuppliersPage'));
const ProductsPage = React.lazy(() => import('./pages/ProductsPage'));
const CustomersPage = React.lazy(() => import('./pages/CustomersPage'));
const CustomerDetailPage = React.lazy(() => import('./pages/CustomerDetailPage'));
const InventoryPage = React.lazy(() => import('./pages/InventoryPage'));
const ShiftsPage = React.lazy(() => import('./pages/ShiftsPage'));
const InvoicesPage = React.lazy(() => import('./pages/InvoicesPage'));
const InvoiceDetailPage = React.lazy(() => import('./pages/InvoiceDetailPage'));
const PurchaseOrdersPage = React.lazy(() => import('./pages/PurchaseOrdersPage'));
const CreatePurchaseOrderPage = React.lazy(() => import('./pages/CreatePurchaseOrderPage'));
const ReturnsPage = React.lazy(() => import('./pages/ReturnsPage'));
const WastePage = React.lazy(() => import('./pages/WastePage'));
const InventoryChecksPage = React.lazy(() => import('./pages/InventoryChecksPage'));
const DebtsPage = React.lazy(() => import('./pages/DebtsPage'));
const POSPage = React.lazy(() => import('./pages/POSPage'));
const AlertsPage = React.lazy(() => import('./pages/AlertsPage'));
const ReportsPage = React.lazy(() => import('./pages/ReportsPage'));

// ⚡ React Query Client - Cấu hình caching và refetching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data fresh trong 5 phút
      gcTime: 10 * 60 * 1000, // Cache giữ lại 10 phút
      refetchOnWindowFocus: false, // Không refetch khi focus lại (tắt để tránh gọi API liên tục)
      retry: 1, // Thử lại 1 lần nếu lỗi
    },
  },
});

const theme = {
  token: {
    // Màu chính - Thương hiệu
    colorPrimary: colors.brand,
    colorPrimaryHover: colors.brandHover,
    colorPrimaryActive: colors.brandActive,

    // Các màu phụ
    colorSuccess: colors.success,
    colorWarning: colors.warning,
    colorError: colors.danger,
    colorInfo: colors.info,

    // Màu nền và text
    colorBgLayout: colors.bg,
    colorText: colors.text,
    colorTextSecondary: colors.textSecondary,
    // Mặc định của antd cho màu này quá nhạt, không đạt tỉ lệ tương phản 4.5:1 trên nền trắng.
    colorTextDescription: colors.textSecondary,

    // Border và radius
    borderRadius: radius.md, // Bo góc nhẹ nhàng
    borderRadiusLG: radius.lg, // Bo góc lớn hơn cho card/modal

    // Kích thước
    controlHeight: 40, // Chiều cao input/button

    // Thang chữ đọc từ theme/typography.ts — sáu bậc cố định, không co giãn
    // theo viewport, để cỡ chữ ổn định giữa các màn hình tác nghiệp.
    fontSize: type.body, // Thân bài và bảng dữ liệu — ngưỡng chữ thân bài của web
    fontSizeSM: type.label, // Nhãn, metadata
    fontSizeLG: type.body, // Tiêu đề card, nội dung nhấn
    fontSizeHeading4: type.title, // Tiêu đề trang
    fontSizeHeading5: type.lead,

    // Font
    fontFamily,
  },
  components: {
    Button: {
      borderRadius: radius.md,
      controlHeight: 44, // Nút thao tác - đủ lớn để bấm bằng ngón tay trên tablet
      controlHeightSM: 34,
      controlHeightLG: 52,
      contentFontSize: type.body,
      contentFontSizeLG: type.lead,
    },
    Card: {
      borderRadius: radius.lg,
      boxShadow: colors.shadowCard,
      headerFontSize: type.lead, // Tiêu đề card tách khỏi cỡ chữ thân bài
    },
    Menu: {
      borderRadius: radius.md,
      // Sidebar dọc rộng 248px, không còn ràng buộc "8 mục phải vừa một
      // hàng ngang" từng ép cỡ chữ menu nhỏ hơn thân bài.
      fontSize: type.body,
    },
    Table: {
      borderRadius: radius.md,
      headerBg: colors.brandSoft,
      headerColor: colors.brandInk,
      fontSize: type.body,
      cellPaddingBlock: 10, // Chữ to hơn nên siết đệm dòng lại, giữ mật độ bảng
    },
    Statistic: {
      titleFontSize: type.label,
      contentFontSize: type.metric, // Con số là lý do tồn tại của thẻ
    },
    Input: {
      borderRadius: radius.md,
    },
    Modal: {
      borderRadius: radius.lg, // Modal bo góc nhiều hơn
    },
    Tag: {
      borderRadius: radius.sm,
    },
  },
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={viVN} theme={theme}>
        <AuthProvider>
          <BrowserRouter>
            {import.meta.env.DEV && <Agentation endpoint="http://localhost:4747" />}
            <Suspense
              fallback={
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                  }}
                >
                  <Spin size="large" />
                </div>
              }
            >
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                {/* Full-screen pages — không có sidebar navigation */}
                <Route
                  path="/pos"
                  element={
                    <ProtectedRoute>
                      <POSPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/purchase-orders/new"
                  element={
                    <ProtectedRoute>
                      <CreatePurchaseOrderPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/alerts" element={<AlertsPage />} />
                  <Route path="/invoices" element={<InvoicesPage />} />
                  <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
                  <Route path="/shifts" element={<ShiftsPage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/inventory" element={<InventoryPage />} />
                  <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
                  <Route path="/suppliers" element={<SuppliersPage />} />
                  <Route path="/customers" element={<CustomersPage />} />
                  <Route path="/customers/:id" element={<CustomerDetailPage />} />
                  <Route path="/debts" element={<DebtsPage />} />
                  <Route path="/returns" element={<ReturnsPage />} />
                  <Route path="/inventory-checks" element={<InventoryChecksPage />} />
                  <Route path="/waste" element={<WastePage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
