import {
  ShoppingCartOutlined,
  AppstoreOutlined,
  InboxOutlined,
  ShopOutlined,
  TeamOutlined,
  FileTextOutlined,
  SwapOutlined,
  DeleteOutlined,
  AuditOutlined,
  DollarOutlined,
  LogoutOutlined,
  DashboardOutlined,
  ClockCircleOutlined,
  AlertOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import {
  Layout,
  Menu,
  Button,
  Typography,
  Modal,
  Form,
  InputNumber,
  Input,
  message,
  Descriptions,
  Tag,
  Divider,
} from 'antd';
import type { MenuProps } from 'antd';
import React, { useMemo, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

import { APP_NAME } from '../constants';
import { useAuth } from '../contexts/useAuth';
import { useCurrentShift, useOpenShift, useCloseShift } from '../hooks';
import { colors } from '../theme/colors';
import { type, weight, radius, space, layout } from '../theme/typography';
import type { Shift } from '../types';
import { formatVND, inputNumberFormatter, getErrorMessage } from '../utils/format';

import ChatWidget from './chat/ChatWidget';
import { Breadcrumbs } from './common';
import ErrorBoundary from './ErrorBoundary';

const { Header, Content, Sider } = Layout;

function getMenuItems(role?: string): MenuProps['items'] {
  const items: MenuProps['items'] = [
    { key: '/', icon: <DashboardOutlined />, label: 'Tổng quan' },
    { key: '/alerts', icon: <AlertOutlined />, label: 'Cảnh báo' },
    {
      key: 'sales',
      label: 'Đơn hàng',
      icon: <FileTextOutlined />,
      children: [
        { key: '/invoices', icon: <FileTextOutlined />, label: 'Lịch sử đơn' },
        { key: '/shifts', icon: <ClockCircleOutlined />, label: 'Ca bán hàng' },
        { key: '/returns', icon: <SwapOutlined />, label: 'Trả hàng' },
      ],
    },
    {
      key: 'products',
      label: 'Hàng hóa',
      icon: <AppstoreOutlined />,
      children: [
        { key: '/products', icon: <AppstoreOutlined />, label: 'Sản phẩm' },
        { key: '/categories', icon: <AppstoreOutlined />, label: 'Nhóm hàng' },
      ],
    },
    {
      key: 'inventory',
      label: 'Kho',
      icon: <InboxOutlined />,
      children: [
        { key: '/inventory', icon: <InboxOutlined />, label: 'Tồn kho' },
        { key: '/purchase-orders', icon: <ShopOutlined />, label: 'Nhập hàng' },
        { key: '/suppliers', icon: <ShopOutlined />, label: 'Nhà cung cấp' },
        { key: '/inventory-checks', icon: <AuditOutlined />, label: 'Kiểm kê' },
        { key: '/waste', icon: <DeleteOutlined />, label: 'Xuất hủy' },
      ],
    },
    {
      key: 'customers',
      label: 'Khách hàng',
      icon: <TeamOutlined />,
      children: [
        { key: '/customers', icon: <TeamOutlined />, label: 'Danh sách' },
        { key: '/debts', icon: <DollarOutlined />, label: 'Công nợ' },
      ],
    },
  ];

  if (role === 'admin') {
    items.push({ key: '/reports', icon: <BarChartOutlined />, label: 'Báo cáo' });
  }

  items.push({ type: 'divider' as const });
  items.push({ key: '/pos', icon: <ShoppingCartOutlined />, label: 'Bán hàng' });

  return items;
}

// Tìm parent key cho submenu mở sẵn
function getOpenKey(pathname: string, items: MenuProps['items']): string[] {
  for (const item of items || []) {
    if (item && 'children' in item && item.children) {
      for (const child of item.children) {
        if (child && 'key' in child && child.key === pathname) {
          return [item.key as string];
        }
      }
    }
  }
  return [];
}

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Shift management
  const { data: currentShift, isLoading: shiftLoading } = useCurrentShift();
  const openShiftMutation = useOpenShift();
  const closeShiftMutation = useCloseShift();

  // Match /customers/:id → /customers, /invoices/:id → /invoices
  const selectedKey = location.pathname.replace(/\/\d+$/, '') || '/';
  const menuItems = useMemo(() => getMenuItems(user?.role), [user?.role]);

  const [collapsed, setCollapsed] = useState(false);
  // Seed từ getOpenKey như defaultOpenKeys cũ — mode="inline" cần state có
  // kiểm soát, không thì submenu tự xổ về (defaultOpenKeys chỉ set 1 lần).
  const [openKeys, setOpenKeys] = useState<string[]>(() => getOpenKey(selectedKey, menuItems));
  const [closeModal, setCloseModal] = useState(false);
  const [openForm] = Form.useForm();
  const [closeForm] = Form.useForm();

  // Bắt buộc mở ca nếu chưa có ca đang mở (chỉ staff, admin không cần)
  const mustOpenShift = !shiftLoading && currentShift === null && user?.role !== 'admin';

  const handleOpenShift = async () => {
    const values = await openForm.validateFields();
    try {
      await openShiftMutation.mutateAsync(values);
      message.success('Đã mở ca');
      openForm.resetFields();
    } catch (err: unknown) {
      message.error(getErrorMessage(err));
    }
  };

  const handleChangeShift = async () => {
    if (!currentShift) return;
    const values = await closeForm.validateFields();
    try {
      // 1. Đóng ca cũ
      const res = await closeShiftMutation.mutateAsync({
        id: currentShift.id,
        data: { closing_cash: values.closing_cash, note: values.note },
      });
      const closedShift = res.data as Shift;

      // 2. Mở ca mới
      await openShiftMutation.mutateAsync({
        cashier_name: values.new_cashier_name,
        opening_cash: values.new_opening_cash || 0,
      });

      setCloseModal(false);
      closeForm.resetFields();

      // Hiện kết quả đóng ca
      Modal.info({
        title: 'Kết quả đóng ca',
        width: 500,
        content: (
          <Descriptions bordered size="small" column={1} style={{ marginTop: 16 }}>
            <Descriptions.Item label="Nhân viên">{closedShift.cashier_name}</Descriptions.Item>
            <Descriptions.Item label="Tiền đầu ca">
              {formatVND(closedShift.opening_cash)}
            </Descriptions.Item>
            <Descriptions.Item label="Doanh thu">
              {formatVND(closedShift.total_sales)}
            </Descriptions.Item>
            <Descriptions.Item label="Số đơn">{closedShift.total_invoices}</Descriptions.Item>
            <Descriptions.Item label="Tiền mặt lý thuyết">
              {formatVND(closedShift.expected_cash)}
            </Descriptions.Item>
            <Descriptions.Item label="Tiền mặt thực tế">
              {formatVND(closedShift.closing_cash)}
            </Descriptions.Item>
            <Descriptions.Item label="Chênh lệch">
              <Tag color={closedShift.difference === 0 ? 'green' : 'red'}>
                {formatVND(closedShift.difference)}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        ),
      });
      message.success('Đã thay ca');
    } catch (err: unknown) {
      message.error(getErrorMessage(err));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={248}
        // Pin cứng 80 thay vì để antd tự suy: mặc định collapsedWidth =
        // controlHeightLG * 2, mà controlHeightLG lại kéo theo controlHeight
        // toàn cục (40) → ra 100, một con số không ai chọn cho rail thu gọn.
        collapsedWidth={80}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          background: colors.sidebar,
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'auto',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: space.sm,
            padding: space.lg,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          <div
            style={{
              flexShrink: 0,
              width: 36,
              height: 36,
              background: colors.onBrandTint,
              borderRadius: radius.md,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: type.lead,
              fontWeight: weight.bold,
              color: colors.onBrand,
            }}
          >
            F
          </div>
          {!collapsed && (
            <Typography.Title
              level={4}
              style={{
                color: colors.onBrand,
                margin: 0,
                fontWeight: weight.semibold,
                letterSpacing: 0.5,
              }}
            >
              {APP_NAME}
            </Typography.Title>
          )}
        </div>

        {/* Menu dọc */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          openKeys={openKeys}
          onOpenChange={setOpenKeys}
          items={menuItems}
          onClick={({ key }) => {
            if (!key.startsWith('/')) return;
            if (key === '/pos') {
              window.open(key, '_blank');
              return;
            }
            navigate(key);
          }}
          // minHeight: 0 bắt buộc để flex item này co lại và tự cuộn thay vì
          // đẩy khối người dùng phía dưới ra khỏi màn hình.
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            background: 'transparent',
            borderInlineEnd: 'none',
          }}
        />

        {/* User info + logout */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            gap: space.sm,
            padding: space.lg,
            borderTop: `1px solid ${colors.onBrandBorder}`,
          }}
        >
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <Typography.Text
                ellipsis
                style={{ color: colors.onBrand, fontWeight: weight.medium, fontSize: type.label }}
              >
                {user?.name}
              </Typography.Text>
              {/* onBrandMuted chỉ được đo trên brandGradient (4.55–5.01:1), chưa
                  từng đo trên colors.sidebar — ở đầu purple600 nó tụt còn
                  4.30:1, hụt AA. Dùng onBrand đặc, phân biệt với tên bằng
                  weight thay vì độ mờ. */}
              <Typography.Text
                style={{ color: colors.onBrand, fontWeight: weight.regular, fontSize: type.label }}
              >
                {user?.role === 'admin' ? 'Quản lý' : 'Nhân viên'}
              </Typography.Text>
            </div>
          )}
          <Button
            type="primary"
            ghost
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ color: colors.onBrand, borderColor: colors.onBrandBorder }}
          >
            {!collapsed && 'Thoát'}
          </Button>
        </div>
      </Sider>

      <Layout style={{ background: colors.bg }}>
        <Header
          style={{
            height: 56,
            background: colors.surface,
            padding: `0 ${space.xl}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            boxShadow: colors.shadowHeader,
          }}
        >
          <Breadcrumbs />

          {/* Ca hiện tại + Thay ca — gắn với phiên làm việc, không phải điều hướng nên ở lại header */}
          {currentShift && (
            <div
              style={{ display: 'flex', alignItems: 'center', gap: space.sm, whiteSpace: 'nowrap' }}
            >
              <ClockCircleOutlined style={{ color: colors.textSecondary, fontSize: type.label }} />
              <Typography.Text style={{ color: colors.textSecondary, fontSize: type.label }}>
                Ca #{currentShift.id} &mdash; {currentShift.cashier_name}
              </Typography.Text>
              <Button
                size="small"
                icon={<SwapOutlined />}
                onClick={() => {
                  closeForm.resetFields();
                  setCloseModal(true);
                }}
              >
                Thay ca
              </Button>
            </div>
          )}
        </Header>

        {/* Trần chứ không phải bề rộng cố định: Sider đã lấy 248px cố định, nên
            trần cũ 1440 (đặt hồi nav còn nằm ngang và không ăn bề rộng nào) bỏ
            phí 30% màn hình đích và ép chữ xuống dòng. */}
        <Content
          className="taphoa-content"
          style={{ padding: space.xl, maxWidth: layout.contentMax, margin: '0 auto' }}
        >
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </Content>
      </Layout>

      {/* Modal bắt buộc mở ca */}
      <Modal
        title="Mở ca bán hàng"
        open={mustOpenShift}
        closable={false}
        maskClosable={false}
        onOk={handleOpenShift}
        confirmLoading={openShiftMutation.isPending}
        okText="Mở ca"
        cancelButtonProps={{ style: { display: 'none' } }}
      >
        <Form form={openForm} layout="vertical">
          <Form.Item
            name="cashier_name"
            label="Tên nhân viên"
            rules={[{ required: true, message: 'Nhập tên nhân viên' }]}
          >
            <Input placeholder="VD: Lan, Hoa, Minh..." />
          </Form.Item>
          <Form.Item name="opening_cash" label="Tiền đầu ca (VNĐ)" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} formatter={inputNumberFormatter} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal thay ca (đóng ca cũ + mở ca mới) */}
      <Modal
        title="Thay ca"
        open={closeModal}
        onOk={handleChangeShift}
        onCancel={() => setCloseModal(false)}
        confirmLoading={closeShiftMutation.isPending || openShiftMutation.isPending}
        okText="Thay ca"
        cancelText="Hủy"
        width={480}
      >
        <Form form={closeForm} layout="vertical">
          <Typography.Text strong>Đóng ca hiện tại — {currentShift?.cashier_name}</Typography.Text>
          <Form.Item
            name="closing_cash"
            label="Tiền mặt thực tế cuối ca (VNĐ)"
            rules={[{ required: true, message: 'Nhập số tiền' }]}
            style={{ marginTop: 12 }}
          >
            <InputNumber min={0} style={{ width: '100%' }} formatter={inputNumberFormatter} />
          </Form.Item>
          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={2} />
          </Form.Item>

          <Divider />

          <Typography.Text strong>Mở ca mới</Typography.Text>
          <Form.Item
            name="new_cashier_name"
            label="Tên nhân viên mới"
            rules={[{ required: true, message: 'Nhập tên nhân viên' }]}
            style={{ marginTop: 12 }}
          >
            <Input placeholder="VD: Lan, Hoa, Minh..." />
          </Form.Item>
          <Form.Item name="new_opening_cash" label="Tiền đầu ca (VNĐ)" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} formatter={inputNumberFormatter} />
          </Form.Item>
        </Form>
      </Modal>

      <ChatWidget />
    </Layout>
  );
}
