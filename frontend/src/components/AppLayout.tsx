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
import React, { useMemo, useState, useLayoutEffect, useRef } from 'react';
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

const { Header, Content } = Layout;

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

  // "Bán hàng" KHÔNG nằm trong menu: nó là hành động chính và mở tab mới, chứ
  // không phải một trang để xem. Nó được dựng thành nút riêng trong header.
  return items;
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

  // Chip điều hướng: đo mục đang chọn rồi trượt một phần tử dùng chung tới đó.
  // Phải đo bằng getBoundingClientRect chứ không phải offsetLeft, vì mục nằm
  // trong nhiều lớp lồng nhau của antd và offsetParent không đoán trước được.
  const navRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  useLayoutEffect(() => {
    const host = navRef.current;
    if (!host) return;

    const measure = () => {
      // Khi thanh chật, antd đẩy bớt mục vào dropdown "..." — lúc đó mục đang
      // chọn không còn chỗ nào để đo, và chip phải tự ẩn thay vì đứng sai chỗ.
      const active = host.querySelector<HTMLElement>(
        '.ant-menu-item-selected, .ant-menu-submenu-selected'
      );
      if (!active || active.offsetParent === null) {
        setPill(null);
        return;
      }
      const a = active.getBoundingClientRect();
      const h = host.getBoundingClientRect();
      setPill({ left: a.left - h.left, top: a.top - h.top, width: a.width, height: a.height });
    };

    // Đo lại ở khung hình kế tiếp: antd tính lại phần tràn sau khi bố cục xong,
    // nên lần đo đầu tiên có thể rơi vào lúc mục còn chưa ở vị trí cuối cùng.
    const remeasure = () => {
      measure();
      requestAnimationFrame(measure);
    };

    remeasure();
    const observer = new ResizeObserver(remeasure);
    observer.observe(host);
    return () => observer.disconnect();
  }, [selectedKey, menuItems]);

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
    <Layout style={{ minHeight: '100vh', background: colors.bg }}>
      <Header
        style={{
          padding: `0 ${space.xl}px`,
          background: colors.brandGradient,
          display: 'flex',
          alignItems: 'center',
          gap: space.xl,
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: colors.shadowHeader,
        }}
      >
        {/* Logo — không co lại: là danh tính thương hiệu, không phải nội dung phụ */}
        <div style={{ display: 'flex', alignItems: 'center', gap: space.sm, flexShrink: 0 }}>
          <div
            style={{
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
          <Typography.Title
            level={4}
            style={{
              color: colors.onBrand,
              margin: 0,
              whiteSpace: 'nowrap',
              fontWeight: weight.semibold,
              letterSpacing: 0.5,
            }}
          >
            {APP_NAME}
          </Typography.Title>
        </div>

        {/* Menu ngang — mode="horizontal" tự gom mục tràn vào dropdown "…" khi
            hẹp, nên không cần state openKeys/getOpenKey như menu dọc cũ. */}
        <div ref={navRef} style={{ position: 'relative', flex: 1, minWidth: 0 }}>
          <span
            aria-hidden
            className="taphoa-nav-pill"
            style={{
              opacity: pill ? 1 : 0,
              transform: `translate(${pill?.left ?? 0}px, ${pill?.top ?? 0}px)`,
              width: pill?.width ?? 0,
              height: pill?.height ?? 0,
            }}
          />
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[selectedKey]}
            items={menuItems}
            onClick={({ key }) => {
              if (!key.startsWith('/')) return;
              navigate(key);
            }}
            style={{
              minWidth: 0,
              borderBottom: 'none',
              background: 'transparent',
            }}
          />
        </div>

        {/* Ca hiện tại + Thay ca — ít quan trọng nhất trong dải header nên là
            khối đầu tiên co lại (minWidth 0 + ellipsis) khi màn hẹp; icon và
            nút không co để vẫn bấm được. */}
        {currentShift && (
          <div style={{ display: 'flex', alignItems: 'center', gap: space.sm, minWidth: 0 }}>
            <ClockCircleOutlined
              style={{ color: colors.onBrandMuted, fontSize: type.label, flexShrink: 0 }}
            />
            <Typography.Text
              ellipsis
              style={{ color: colors.onBrand, fontSize: type.label, minWidth: 0 }}
            >
              Ca #{currentShift.id} &mdash; {currentShift.cashier_name}
            </Typography.Text>
            <Button
              size="small"
              icon={<SwapOutlined />}
              onClick={() => {
                closeForm.resetFields();
                setCloseModal(true);
              }}
              style={{
                borderColor: colors.onBrandBorder,
                color: colors.onBrand,
                background: colors.onBrandActiveBg,
                borderRadius: radius.sm,
                flexShrink: 0,
              }}
            >
              Thay ca
            </Button>
          </div>
        )}

        {/* Hành động chính, không phải điều hướng: mở POS ở tab mới nên nó rời
            khỏi khu quản trị. Không co lại — cùng ưu tiên với nút Thoát. */}
        <Button
          type="primary"
          icon={<ShoppingCartOutlined />}
          onClick={() => window.open('/pos', '_blank')}
          className="taphoa-primary-action"
          style={{ flexShrink: 0 }}
        >
          Bán hàng
        </Button>

        {/* User info + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: space.lg, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              minWidth: 0,
            }}
          >
            <Typography.Text
              ellipsis
              style={{ color: colors.onBrand, fontWeight: weight.medium, fontSize: type.label }}
            >
              {user?.name}
            </Typography.Text>
            {/* onBrandMuted đo trên chính brandGradient (4.55–5.01:1, đạt AA) —
                khác colors.sidebar trước đây, nơi đầu purple600 tụt còn 4.30:1. */}
            <Typography.Text style={{ color: colors.onBrandMuted, fontSize: type.label }}>
              {user?.role === 'admin' ? 'Quản lý' : 'Nhân viên'}
            </Typography.Text>
          </div>
          <Button
            type="primary"
            ghost
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ color: colors.onBrand, borderColor: colors.onBrandBorder, flexShrink: 0 }}
          >
            Thoát
          </Button>
        </div>
      </Header>

      {/* Trần chứ không phải bề rộng cố định: không còn sidebar chiếm chỗ,
          trần chỉ chặn bảng giãn vô hạn trên màn siêu rộng, nơi mắt phải quét
          quá xa giữa cột đầu và cột cuối của một dòng. */}
      <Content
        className="taphoa-content"
        // width 100% là bắt buộc, không thừa: margin ngang 'auto' trên một flex
        // item sẽ vô hiệu hoá align-items:stretch, khiến cột nội dung co lại
        // đúng bằng ruột nó khi bảng rỗng.
        style={{
          padding: space.xl,
          width: '100%',
          maxWidth: layout.contentMax,
          margin: '0 auto',
        }}
      >
        <Breadcrumbs />
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </Content>

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
