import {
  PlusOutlined,
  MinusOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  SearchOutlined,
  ArrowLeftOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  CreditCardOutlined,
  UserOutlined,
  GiftOutlined,
} from '@ant-design/icons';
import {
  Row,
  Col,
  Card,
  Input,
  List,
  Button,
  InputNumber,
  Select,
  Typography,
  Tag,
  message,
  Modal,
  Space,
  Badge,
  Layout,
  Spin,
  Empty,
  Divider,
} from 'antd';
import type { InputRef } from 'antd';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { CASH_DENOMINATIONS } from '../constants';
import { useAuth } from '../contexts/useAuth';
import { useProducts, useCustomers, useCurrentShift, useCreateInvoice } from '../hooks';
import api from '../services/api';
import { colors } from '../theme/colors';
import { type, weight, radius } from '../theme/typography';
import type { ProductWithStock } from '../types';
import { formatVND, inputNumberFormatter, getErrorMessage } from '../utils/format';

interface CartItem {
  product: ProductWithStock;
  quantity: number;
  unit: string;
}

interface ActiveOrder {
  id: number;
  items: CartItem[];
  createdAt: string;
  discountAmount: number;
  cashGiven: number;
  selectedCustomer: number | null;
}

const tabStyle = (isActive: boolean): React.CSSProperties => ({
  height: 48,
  padding: '0 20px',
  // Bậc bo góc lớn nhất của thang (radius.lg = 16) không đạt được hình viên
  // thuốc trọn vẹn (24 = nửa chiều cao 48) — chấp nhận bo tròn nhẹ hơn thay vì
  // thêm bậc thứ bảy.
  borderRadius: radius.lg,
  fontSize: type.body,
  fontWeight: isActive ? weight.semibold : weight.regular,
  background: isActive ? colors.brand : colors.surface,
  color: isActive ? colors.onBrand : colors.textSecondary,
  border: `2px solid ${isActive ? colors.brand : colors.borderStrong}`,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  transition: 'all 0.15s',
});

/** antd Tag mặc định inline-block, icon và chữ nằm trên baseline — ép flex để
 * hai thứ luôn thẳng hàng, kể cả khi cỡ chữ bị override. */
const statusTagStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
};

export default function POSPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const MAX_STAFF_DISCOUNT_PCT = 20;
  const [search, setSearch] = useState('');
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [discountMode, setDiscountMode] = useState<'amount' | 'percent'>('amount');
  const [discountPercent, setDiscountPercent] = useState(0);
  const searchRef = useRef<InputRef>(null);
  const modalSearchRef = useRef<InputRef>(null);

  // ─── React Query: data fetching ──────────────────────────────────────────
  // Products: driven by productParams state; debounce updates it for modal search
  const [productParams, setProductParams] = useState<Record<string, unknown>>({ limit: 50 });
  const { data: products = [], isLoading: productsLoading } = useProducts(productParams);

  // Customers: one-time load
  const { data: customers = [] } = useCustomers({ limit: 100 });

  // Current shift
  const { data: currentShift = null } = useCurrentShift();

  // Create invoice mutation
  const createInvoiceMutation = useCreateInvoice();

  // ─── Multi-order state ───────────────────────────────────────────────────
  const initialOrderId = useRef(Date.now()).current;
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([
    {
      id: initialOrderId,
      items: [],
      createdAt: new Date().toISOString(),
      discountAmount: 0,
      cashGiven: 0,
      selectedCustomer: null,
    },
  ]);
  const [activeOrderId, setActiveOrderId] = useState<number>(initialOrderId);

  const activeOrder = activeOrders.find(o => o.id === activeOrderId) || activeOrders[0];
  const activeOrderIndex = activeOrders.findIndex(o => o.id === activeOrderId) + 1;

  // Payment values derived from active order
  const discountAmount = activeOrder.discountAmount;
  const cashGiven = activeOrder.cashGiven;
  const selectedCustomer = activeOrder.selectedCustomer;

  const updateActiveOrder = useCallback(
    (updates: Partial<ActiveOrder>) => {
      setActiveOrders(prev => prev.map(o => (o.id === activeOrderId ? { ...o, ...updates } : o)));
    },
    [activeOrderId]
  );

  const setDiscountAmount = (v: number) => updateActiveOrder({ discountAmount: v });
  const setCashGiven = (v: number) => updateActiveOrder({ cashGiven: v });
  const setSelectedCustomer = (v: number | null) => updateActiveOrder({ selectedCustomer: v });

  // ─── Modal search debounce → update productParams ────────────────────────
  useEffect(() => {
    if (productModalOpen) {
      const timer = setTimeout(() => {
        const params: Record<string, unknown> = { limit: 50 };
        if (modalSearch) params.search = modalSearch;
        setProductParams(params);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [modalSearch, productModalOpen]);

  // Reset discount mode + focus search input when switching order tab
  useEffect(() => {
    setDiscountMode('amount');
    setDiscountPercent(0);
    searchRef.current?.focus();
  }, [activeOrderId]);

  const updateActiveOrderItems = useCallback(
    (items: CartItem[]) => {
      updateActiveOrder({ items });
    },
    [updateActiveOrder]
  );

  const addToCart = (product: ProductWithStock) => {
    if (product.stock <= 0) {
      message.warning('Sản phẩm đã hết hàng');
      return;
    }
    const items = activeOrder.items;
    const existing = items.find(c => c.product.id === product.id);
    let nextItems: CartItem[];
    if (existing) {
      if (existing.quantity >= product.stock) {
        message.warning('Số lượng trong giỏ đã đạt tồn kho');
        return;
      }
      nextItems = items.map(c =>
        c.product.id === product.id ? { ...c, quantity: c.quantity + 1 } : c
      );
    } else {
      nextItems = [...items, { product, quantity: 1, unit: product.unit }];
    }
    updateActiveOrderItems(nextItems);
    message.success({ content: `Đã thêm ${product.name}`, duration: 1 });
  };

  // Main search: barcode scan → exact match → add immediately
  // Text search → open modal
  const handleMainSearch = async () => {
    if (!search.trim()) {
      setProductModalOpen(true);
      setModalSearch('');
      return;
    }
    // Quick one-off search by barcode/SKU — kept as direct api call
    try {
      const res = await api.get('/products', { params: { search: search.trim(), limit: 5 } });
      const results = res.data || [];
      if (results.length === 1) {
        addToCart(results[0]);
        setSearch('');
        searchRef.current?.focus();
        return;
      }
      setModalSearch(search);
      setProductModalOpen(true);
      setSearch('');
    } catch {
      setModalSearch(search);
      setProductModalOpen(true);
      setSearch('');
    }
  };

  const handleModalSearchEnter = () => {
    if (products.length === 1) {
      addToCart(products[0]);
      setProductModalOpen(false);
      setModalSearch('');
    }
  };

  const updateQty = (productId: number, qty: number) => {
    const items = activeOrder.items;
    if (qty <= 0) {
      updateActiveOrderItems(items.filter(c => c.product.id !== productId));
    } else {
      const item = items.find(c => c.product.id === productId);
      if (item && qty > item.product.stock) {
        message.warning('Số lượng vượt quá tồn kho');
        return;
      }
      updateActiveOrderItems(
        items.map(c => (c.product.id === productId ? { ...c, quantity: qty } : c))
      );
    }
  };

  const removeFromCart = (productId: number) => {
    updateActiveOrderItems(activeOrder.items.filter(c => c.product.id !== productId));
  };

  const subtotal = activeOrder.items.reduce((sum, c) => sum + c.product.sell_price * c.quantity, 0);
  const clampedDiscount = Math.min(discountAmount, subtotal);
  const finalTotal = subtotal - clampedDiscount;
  const effectiveCashGiven = cashGiven === 0 ? finalTotal : cashGiven;
  const changeAmount = effectiveCashGiven > finalTotal ? effectiveCashGiven - finalTotal : 0;

  // --- Multi-order tabs ---
  const MAX_ORDERS = 10;
  const createNewOrder = () => {
    if (activeOrders.length >= MAX_ORDERS) {
      message.warning(`Tối đa ${MAX_ORDERS} đơn hàng`);
      return;
    }
    const newId = Date.now();
    setActiveOrders(prev => [
      ...prev,
      {
        id: newId,
        items: [],
        createdAt: new Date().toISOString(),
        discountAmount: 0,
        cashGiven: 0,
        selectedCustomer: null,
      },
    ]);
    setActiveOrderId(newId);
  };

  const switchOrder = (id: number) => {
    setActiveOrderId(id);
  };

  const closeOrderTab = (id: number) => {
    const order = activeOrders.find(o => o.id === id);
    if (!order) return;
    if (order.items.length > 0) {
      message.warning('Giỏ hàng còn sản phẩm — thanh toán hoặc xóa hết trước khi đóng');
      return;
    }
    const remaining = activeOrders.filter(o => o.id !== id);
    if (remaining.length === 0) {
      const newId = Date.now();
      setActiveOrders([
        {
          id: newId,
          items: [],
          createdAt: new Date().toISOString(),
          discountAmount: 0,
          cashGiven: 0,
          selectedCustomer: null,
        },
      ]);
      setActiveOrderId(newId);
    } else {
      setActiveOrders(remaining);
      if (activeOrderId === id) {
        setActiveOrderId(remaining[remaining.length - 1].id);
      }
    }
  };

  // --- Checkout ---
  const checkoutLoadingRef = useRef(false);
  const handleCheckout = async () => {
    if (checkoutLoadingRef.current) return;
    if (!currentShift) {
      message.warning('Vui lòng mở ca trước khi bán hàng');
      return;
    }
    if (activeOrder.items.length === 0) {
      message.warning('Giỏ hàng trống');
      return;
    }
    if (effectiveCashGiven < finalTotal) {
      message.error('Tiền khách đưa chưa đủ');
      return;
    }

    checkoutLoadingRef.current = true;
    try {
      const payload = {
        customer_id: selectedCustomer || undefined,
        discount_amount: discountAmount,
        payment_method: 'cash',
        cash_amount: finalTotal,
        cash_given: effectiveCashGiven,
        items: activeOrder.items.map(c => ({
          product_id: c.product.id,
          quantity: c.quantity,
          unit: c.unit,
        })),
      };
      await createInvoiceMutation.mutateAsync(payload);
      message.success('Thanh toán thành công!');

      const remaining = activeOrders.filter(o => o.id !== activeOrderId);
      if (remaining.length === 0) {
        const newId = Date.now();
        setActiveOrders([
          {
            id: newId,
            items: [],
            createdAt: new Date().toISOString(),
            discountAmount: 0,
            cashGiven: 0,
            selectedCustomer: null,
          },
        ]);
        setActiveOrderId(newId);
      } else {
        setActiveOrders(remaining);
        setActiveOrderId(remaining[0].id);
      }
      // Products auto-refetch via useCreateInvoice's onSuccess invalidation
    } catch (err: unknown) {
      message.error(getErrorMessage(err, 'Lỗi thanh toán'));
    } finally {
      checkoutLoadingRef.current = false;
    }
  };

  // Ref to always access latest handleCheckout (avoids stale closure in keyboard listener)
  const checkoutRef = useRef(handleCheckout);
  useEffect(() => {
    checkoutRef.current = handleCheckout;
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        checkoutRef.current();
      } else if (e.key === 'Escape') {
        setProductModalOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const denominations = CASH_DENOMINATIONS;
  const checkoutLoading = createInvoiceMutation.isPending;

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden', background: colors.surfaceSunken }}>
      {/* Header */}
      <Layout.Header
        style={{
          background: colors.brandGradient,
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 56,
          boxShadow: colors.shadowHeader,
        }}
      >
        <Space size="middle">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/')}
            style={{ color: colors.onBrand, width: 44, height: 44, fontSize: type.lead }}
          />
          <Typography.Text strong style={{ color: colors.onBrand, fontSize: type.lead }}>
            Bán hàng
          </Typography.Text>
        </Space>
        <Space size="middle">
          {currentShift ? (
            <Tag
              icon={<ClockCircleOutlined />}
              style={{
                ...statusTagStyle,
                background: colors.successSoft,
                border: `1px solid ${colors.profitSoft}`,
                color: colors.successInk,
                fontSize: type.body,
              }}
            >
              Ca #{currentShift.id}
            </Tag>
          ) : (
            <Tag
              style={{
                ...statusTagStyle,
                background: colors.dangerSoft,
                border: `1px solid ${colors.dangerBorder}`,
                color: colors.dangerInk,
                fontSize: type.body,
              }}
            >
              Chưa mở ca
            </Tag>
          )}
          <Typography.Text style={{ color: colors.onBrand, fontSize: type.body }}>
            {user?.name}
          </Typography.Text>
        </Space>
      </Layout.Header>

      {/* Order Tabs */}
      <div
        style={{
          background: colors.surface,
          padding: '6px 16px',
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          overflowX: 'auto',
        }}
      >
        {activeOrders.map((order, index) => {
          const isActive = order.id === activeOrderId;
          return (
            <div key={order.id} style={tabStyle(isActive)} onClick={() => switchOrder(order.id)}>
              <span>Đơn #{index + 1}</span>
              {order.items.length > 0 && (
                <Badge
                  count={order.items.length}
                  style={{
                    backgroundColor: isActive ? colors.surface : colors.brand,
                    color: isActive ? colors.brand : colors.onBrand,
                  }}
                />
              )}
              {activeOrders.length > 1 && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: radius.lg,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e =>
                    (e.currentTarget.style.background = isActive
                      ? colors.onBrandTint
                      : colors.hoverTint)
                  }
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  onClick={e => {
                    e.stopPropagation();
                    closeOrderTab(order.id);
                  }}
                >
                  <CloseOutlined style={{ fontSize: type.label }} />
                </span>
              )}
            </div>
          );
        })}
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={createNewOrder}
          // Xem chú thích trên tabStyle: cùng đánh đổi bo góc viên thuốc → radius.lg.
          style={{ height: 48, borderRadius: radius.lg, fontSize: type.body, padding: '0 20px' }}
        >
          Thêm đơn
        </Button>
      </div>

      {/* Main Content: 2 columns */}
      <Layout.Content style={{ padding: 12, flex: 1, overflow: 'hidden' }}>
        <Row gutter={12} style={{ height: '100%' }}>
          {/* LEFT: Cart — 60% */}
          <Col xs={24} md={15} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Search / barcode input */}
            <Input
              ref={searchRef}
              prefix={<SearchOutlined style={{ color: colors.textMuted, fontSize: type.lead }} />}
              placeholder="Quét barcode hoặc gõ tên sản phẩm..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onPressEnter={handleMainSearch}
              allowClear
              size="large"
              autoFocus
              style={{ marginBottom: 12, borderRadius: radius.md, height: 52, fontSize: type.body }}
              suffix={
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={() => {
                    setModalSearch('');
                    setProductModalOpen(true);
                  }}
                  style={{ borderRadius: radius.md, height: 38 }}
                >
                  Tìm
                </Button>
              }
            />

            {/* Cart items */}
            <Card
              title={
                <Space>
                  <ShoppingCartOutlined style={{ color: colors.brand }} />
                  <span>Đơn #{activeOrderIndex}</span>
                  <Badge
                    count={activeOrder.items.length}
                    style={{ backgroundColor: colors.brand }}
                  />
                </Space>
              }
              style={{
                flex: 1,
                borderRadius: radius.md,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
              styles={{ body: { flex: 1, overflow: 'auto', padding: 0 } }}
            >
              {activeOrder.items.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Quét barcode hoặc bấm Tìm để thêm sản phẩm"
                  style={{ marginTop: 60 }}
                />
              ) : (
                <List
                  dataSource={activeOrder.items}
                  renderItem={(item, idx) => (
                    <div
                      style={{
                        padding: '14px 16px',
                        borderBottom: `1px solid ${colors.surfaceSunken}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                      }}
                    >
                      {/* STT */}
                      <Typography.Text
                        type="secondary"
                        style={{ width: 24, textAlign: 'center', fontSize: type.body }}
                      >
                        {idx + 1}
                      </Typography.Text>

                      {/* Name + unit price */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Typography.Text strong style={{ fontSize: type.body }} ellipsis>
                          {item.product.name}
                        </Typography.Text>
                        <Typography.Text
                          type="secondary"
                          style={{ fontSize: type.label, display: 'block' }}
                        >
                          {formatVND(item.product.sell_price)} / {item.product.unit}
                        </Typography.Text>
                      </div>

                      {/* Quantity controls */}
                      <Space size={6}>
                        <Button
                          icon={<MinusOutlined />}
                          onClick={() => updateQty(item.product.id, item.quantity - 1)}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: radius.md,
                            fontSize: type.body,
                          }}
                        />
                        <InputNumber
                          min={1}
                          value={item.quantity}
                          onChange={v => updateQty(item.product.id, v || 1)}
                          style={{ width: 56, height: 44 }}
                          controls={false}
                        />
                        <Button
                          icon={<PlusOutlined />}
                          onClick={() => updateQty(item.product.id, item.quantity + 1)}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: radius.md,
                            fontSize: type.body,
                          }}
                        />
                      </Space>

                      {/* Line total */}
                      <Typography.Text
                        strong
                        style={{
                          fontSize: type.body,
                          color: colors.brand,
                          minWidth: 100,
                          textAlign: 'right',
                        }}
                      >
                        {formatVND(item.product.sell_price * item.quantity)}
                      </Typography.Text>

                      {/* Delete */}
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeFromCart(item.product.id)}
                        style={{ width: 44, height: 44, fontSize: type.body }}
                      />
                    </div>
                  )}
                />
              )}
            </Card>
          </Col>

          {/* RIGHT: Payment — 40% */}
          <Col xs={24} md={9} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Card
              style={{
                flex: 1,
                borderRadius: radius.md,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
              styles={{
                body: {
                  flex: 1,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'auto',
                },
              }}
            >
              {/* Subtotal */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
                <Typography.Text style={{ fontSize: type.body }}>Tạm tính</Typography.Text>
                <Typography.Text strong style={{ fontSize: type.lead }}>
                  {formatVND(subtotal)}
                </Typography.Text>
              </div>

              {/* Discount */}
              <div style={{ marginBottom: 10 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 4,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <GiftOutlined style={{ color: colors.warning }} />
                    <Typography.Text style={{ fontSize: type.body }}>Giảm giá</Typography.Text>
                  </div>
                </div>
                <Space.Compact style={{ width: '100%' }}>
                  <InputNumber
                    min={0}
                    max={
                      discountMode === 'percent'
                        ? user?.role === 'admin'
                          ? 100
                          : MAX_STAFF_DISCOUNT_PCT
                        : user?.role === 'admin'
                          ? subtotal
                          : Math.round((subtotal * MAX_STAFF_DISCOUNT_PCT) / 100)
                    }
                    value={discountMode === 'percent' ? discountPercent : discountAmount}
                    onChange={v => {
                      const maxPct = user?.role === 'admin' ? 100 : MAX_STAFF_DISCOUNT_PCT;
                      if (discountMode === 'percent') {
                        const pct = Math.min(v || 0, maxPct);
                        setDiscountPercent(pct);
                        setDiscountAmount(Math.round((subtotal * pct) / 100));
                        if ((v || 0) > maxPct) message.warning(`Chỉ được giảm tối đa ${maxPct}%`);
                      } else {
                        const maxAmount = Math.round((subtotal * maxPct) / 100);
                        const amount = Math.min(
                          v || 0,
                          user?.role === 'admin' ? subtotal : maxAmount
                        );
                        setDiscountAmount(amount);
                        setDiscountPercent(
                          subtotal > 0 ? Math.round((amount / subtotal) * 100) : 0
                        );
                        if ((v || 0) > maxAmount && user?.role !== 'admin')
                          message.warning(
                            `Chỉ được giảm tối đa ${maxPct}% (${formatVND(maxAmount)})`
                          );
                      }
                    }}
                    formatter={v =>
                      discountMode === 'percent' ? `${v}%` : inputNumberFormatter(v) + 'đ'
                    }
                    parser={v => Number((v as string).replace(/[^\d]/g, ''))}
                    style={{ flex: 1 }}
                  />
                  <Button
                    onClick={() =>
                      setDiscountMode(discountMode === 'amount' ? 'percent' : 'amount')
                    }
                    style={{ width: 44, fontWeight: weight.semibold }}
                  >
                    ⇄
                  </Button>
                </Space.Compact>
              </div>

              {/* Customer */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <UserOutlined style={{ color: colors.brand }} />
                  <Typography.Text style={{ fontSize: type.body }}>Khách hàng</Typography.Text>
                </div>
                <Select
                  showSearch
                  allowClear
                  placeholder="Khách lẻ"
                  value={selectedCustomer}
                  onChange={setSelectedCustomer}
                  options={customers.map(c => ({
                    value: c.id,
                    label: `${c.name}${c.phone ? ` - ${c.phone}` : ''}`,
                  }))}
                  style={{ width: '100%' }}
                  filterOption={(input, option) =>
                    (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                />
              </div>

              <Divider style={{ margin: '6px 0 10px' }} />

              {/* Cash given */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <CreditCardOutlined style={{ color: colors.success }} />
                  <Typography.Text style={{ fontSize: type.body }}>Tiền khách đưa</Typography.Text>
                </div>
                <InputNumber
                  min={0}
                  value={cashGiven}
                  onChange={v => setCashGiven(v || 0)}
                  formatter={inputNumberFormatter}
                  parser={v => Number((v as string).replace(/\D/g, ''))}
                  placeholder={subtotal > 0 ? `Mặc định: ${formatVND(finalTotal)}` : 'Đủ tiền'}
                  addonAfter="đ"
                  style={{ width: '100%' }}
                  size="large"
                />
              </div>

              {/* Quick denominations */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 6,
                  marginBottom: 10,
                }}
              >
                {denominations.map(d => (
                  <Button
                    key={d}
                    onClick={() => setCashGiven(cashGiven === d ? 0 : d)}
                    style={{
                      height: 44,
                      borderRadius: radius.md,
                      fontSize: type.body,
                      // weight.bold (800) dành riêng cho type.metric/type.hero — 700
                      // ngang khoảng cách tới semibold(600) và bold(800), nên chọn
                      // semibold theo đúng giới hạn đó thay vì làm tròn theo số.
                      fontWeight: cashGiven === d ? weight.semibold : weight.medium,
                      borderColor: cashGiven === d ? colors.brand : undefined,
                      borderWidth: cashGiven === d ? 2 : 1,
                      color: cashGiven === d ? colors.brand : undefined,
                      background: cashGiven === d ? colors.brandSoft : undefined,
                    }}
                  >
                    {d / 1000}k
                  </Button>
                ))}
              </div>

              {/* Change */}
              {changeAmount > 0 && (
                <div
                  style={{
                    background: colors.successSoft,
                    border: `1px solid ${colors.profitSoft}`,
                    borderRadius: radius.md,
                    padding: '12px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}
                >
                  <Typography.Text style={{ color: colors.successInk, fontSize: type.body }}>
                    Tiền thừa:
                  </Typography.Text>
                  <Typography.Text
                    strong
                    style={{ color: colors.successStrong, fontSize: type.lead }}
                  >
                    {formatVND(changeAmount)}
                  </Typography.Text>
                </div>
              )}

              {/* Spacer */}
              <div style={{ flex: 1 }} />

              {/* Total + checkout button */}
              <div
                style={{
                  // brandActive chứ không phải brand: nhãn trắng trên brand chỉ đạt
                  // 3.70:1, trên brandActive đạt 7.90:1. Ô này là chỗ liếc một cái
                  // để biết thu bao nhiêu, không phải chỗ để đoán.
                  background: colors.brandActive,
                  borderRadius: radius.md,
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                {/* Nhãn kèm một con số lớn — cùng vai trò "nhãn KPI" type.label mô tả,
                    không phải một dòng thân bài — nên lấy label thay vì body dù 14 gần
                    body hơn theo số học. */}
                <Typography.Text style={{ color: colors.onBrand, fontSize: type.label }}>
                  THÀNH TIỀN
                </Typography.Text>
                <Typography.Title
                  level={3}
                  style={{
                    color: colors.onBrand,
                    margin: 0,
                    fontSize: type.hero,
                    fontWeight: weight.bold,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatVND(finalTotal)}
                </Typography.Title>
              </div>

              <Button
                type="primary"
                size="large"
                block
                icon={<CreditCardOutlined />}
                onClick={handleCheckout}
                disabled={activeOrder.items.length === 0 || effectiveCashGiven < finalTotal}
                loading={checkoutLoading}
                style={{
                  height: 56,
                  fontSize: type.body,
                  // weight.bold dành riêng cho type.metric/type.hero (xem chú thích ở
                  // nút mệnh giá) — 700 dùng semibold thay vì bold.
                  fontWeight: weight.semibold,
                  // 14 số học gần radius.lg hơn, nhưng đây vẫn là "Nút" — nhóm mà
                  // typography.ts xếp vào radius.md, nên chọn theo vai trò thay vì số.
                  borderRadius: radius.md,
                  background:
                    activeOrder.items.length > 0 && effectiveCashGiven >= finalTotal
                      ? colors.brand
                      : undefined,
                  border: 'none',
                }}
              >
                THANH TOÁN (F1)
              </Button>
            </Card>
          </Col>
        </Row>
      </Layout.Content>

      {/* Product selection modal */}
      <Modal
        title={
          <Space>
            <SearchOutlined style={{ color: colors.brand }} />
            <span>Chọn sản phẩm</span>
          </Space>
        }
        open={productModalOpen}
        onCancel={() => setProductModalOpen(false)}
        footer={null}
        width={800}
        styles={{ body: { padding: '20px', maxHeight: '65vh', overflow: 'auto' } }}
      >
        <Input
          ref={modalSearchRef}
          prefix={<SearchOutlined style={{ color: colors.textMuted }} />}
          placeholder="Tìm tên, SKU, barcode..."
          value={modalSearch}
          onChange={e => setModalSearch(e.target.value)}
          onPressEnter={handleModalSearchEnter}
          allowClear
          size="large"
          style={{ marginBottom: 16, borderRadius: radius.md }}
          autoFocus
        />

        {productsLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : products.length === 0 ? (
          <Empty description="Không tìm thấy sản phẩm" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <Row gutter={[12, 12]}>
            {products.map(p => (
              <Col xs={12} sm={8} md={6} key={p.id}>
                <Card
                  hoverable={p.stock > 0}
                  onClick={() => {
                    if (p.stock > 0) {
                      addToCart(p);
                      setProductModalOpen(false);
                      setModalSearch('');
                      searchRef.current?.focus();
                    }
                  }}
                  styles={{ body: { padding: 12 } }}
                  style={{
                    borderRadius: radius.md,
                    cursor: p.stock > 0 ? 'pointer' : 'not-allowed',
                    opacity: p.stock <= 0 ? 0.4 : 1,
                  }}
                >
                  <Typography.Text
                    strong
                    style={{ fontSize: type.label, display: 'block' }}
                    ellipsis
                  >
                    {p.name}
                  </Typography.Text>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: 8,
                      alignItems: 'center',
                    }}
                  >
                    <Typography.Text
                      style={{
                        fontSize: type.body,
                        fontWeight: weight.semibold,
                        color: colors.brand,
                      }}
                    >
                      {formatVND(p.sell_price)}
                    </Typography.Text>
                    <Tag
                      color={p.stock > 10 ? 'success' : p.stock > 0 ? 'warning' : 'error'}
                      style={{ fontSize: type.label }}
                    >
                      {p.stock}
                    </Tag>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Modal>
    </Layout>
  );
}
