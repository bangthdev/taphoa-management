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
    // Mặc định của antd là rgba(0,0,0,.45), không đạt 4.5:1 trên nền trắng.
    colorTextDescription: colors.textSecondary,

    // Border và radius
    borderRadius: 10, // Bo góc nhẹ nhàng
    borderRadiusLG: 12, // Bo góc lớn hơn cho card/modal

    // Kích thước
    controlHeight: 40, // Chiều cao input/button

    // Thang chữ cố định, bước ~1.2. Giao diện tác nghiệp cần cỡ chữ ổn định
    // giữa các màn hình, nên không dùng cỡ co giãn theo viewport.
    fontSize: 16, // Thân bài và bảng dữ liệu — 16px là ngưỡng chữ thân bài của web
    fontSizeSM: 14, // Nhãn, metadata
    fontSizeLG: 16, // Tiêu đề card, nội dung nhấn
    fontSizeHeading4: 24, // Tiêu đề trang
    fontSizeHeading5: 18,

    // Font
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Button: {
      borderRadius: 8,
      controlHeight: 44, // Nút thao tác - đủ lớn để bấm bằng ngón tay trên tablet
      controlHeightSM: 34,
      controlHeightLG: 52,
      contentFontSize: 16,
      contentFontSizeLG: 18,
    },
    Card: {
      borderRadius: 12,
      boxShadow: colors.shadowCard,
      headerFontSize: 18, // Tiêu đề card tách khỏi cỡ chữ thân bài
    },
    Menu: {
      borderRadius: 8,
      fontSize: 15, // Điều hướng là vai trò phụ, giữ nhỏ hơn thân bài để 8 mục không tràn
    },
    Table: {
      borderRadius: 8,
      headerBg: colors.brandSoft,
      headerColor: colors.brandInk,
      fontSize: 16,
      cellPaddingBlock: 10, // Chữ to hơn nên siết đệm dòng lại, giữ mật độ bảng
    },
    Statistic: {
      titleFontSize: 14,
      contentFontSize: 28, // Con số là lý do tồn tại của thẻ. 28 là cỡ lớn nhất mà
      // hàng 5 thẻ ở trang Báo cáo còn chứa được trên một dòng.
    },
    Input: {
      borderRadius: 8,
    },
    Modal: {
      borderRadius: 16, // Modal bo góc nhiều hơn
    },
    Tag: {
      borderRadius: 6,
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
