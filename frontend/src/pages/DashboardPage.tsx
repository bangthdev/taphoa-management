import {
  ShoppingCartOutlined,
  DollarOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  AlertOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { Alert, Card, Row, Col, Typography, Table, Tag, Statistic, Space, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

import { useAuth } from '../contexts/useAuth';
import {
  useTodayInvoices,
  useCurrentShift,
  useAlertSummary,
  useLowStockAlerts,
  useExpiryAlerts,
  useRevenueReport,
} from '../hooks';
import { colors } from '../theme/colors';
import type { Invoice } from '../types';
import { formatVND } from '../utils/format';

const statIconStyle = { fontSize: 18, color: colors.brand, marginRight: 6 };

const yAxisFormatter = (v: unknown) => {
  const n = typeof v === 'number' ? v : 0;
  return n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${n / 1000}K` : `${n}`;
};

/**
 * DashboardPage - Trang tổng quan
 *
 * 🚀 Đã optimize với:
 * - React.memo để tránh re-render không cần thiết
 * - useMemo cho các tính toán và table columns
 */
function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 🚀 React Query - Tự động caching, loading, error handling
  const { data: todayInvoices = [], isLoading: loadingInvoices } = useTodayInvoices();
  const { data: currentShift, isLoading: loadingShift } = useCurrentShift();
  const { data: alertSummary, isLoading: loadingSummary } = useAlertSummary();
  const { data: lowStock = [], isLoading: loadingLowStock } = useLowStockAlerts();
  const { data: expiring = [], isLoading: loadingExpiring } = useExpiryAlerts(7, 10);

  const isAdmin = user?.role === 'admin';
  const chartFrom = useMemo(() => dayjs().subtract(6, 'day').format('YYYY-MM-DD'), []);
  const chartTo = useMemo(() => dayjs().format('YYYY-MM-DD'), []);
  const { data: weekRevenue, isLoading: loadingWeek } = useRevenueReport(
    isAdmin ? chartFrom : '',
    isAdmin ? chartTo : ''
  );

  const weekChartData = useMemo(
    () =>
      (weekRevenue?.daily ?? []).map(d => ({
        date: dayjs(d.date).format('DD/MM'),
        'Doanh thu': d.revenue,
      })),
    [weekRevenue]
  );

  // 🎯 Memoize các tính toán - chỉ tính lại khi data thay đổi
  const completedInvoices = useMemo(
    () => todayInvoices.filter(i => i.status === 'completed'),
    [todayInvoices]
  );

  const todayRevenue = useMemo(
    () => completedInvoices.reduce((sum, i) => sum + i.final_total, 0),
    [completedInvoices]
  );

  const totalAlerts = useMemo(
    () =>
      alertSummary
        ? alertSummary.expired +
          alertSummary.expiring_7d +
          alertSummary.low_stock +
          alertSummary.out_of_stock
        : 0,
    [alertSummary]
  );

  // 🎯 Memoize table columns - tránh tạo mới mỗi render
  const expiryColumns = useMemo(
    () => [
      { title: 'Sản phẩm', dataIndex: ['product', 'name'], ellipsis: true },
      {
        title: 'Còn',
        dataIndex: 'days_left',
        width: 80,
        align: 'right' as const,
        render: (d: number) => (
          <Tag color={d <= 0 ? 'red' : d <= 3 ? 'orange' : 'gold'}>
            {d <= 0 ? 'Hết hạn' : `${d} ngày`}
          </Tag>
        ),
      },
    ],
    []
  );

  const lowStockColumns = useMemo(
    () => [
      { title: 'Sản phẩm', dataIndex: 'name', ellipsis: true },
      {
        title: 'Tồn kho',
        dataIndex: 'stock',
        width: 90,
        align: 'right' as const,
        render: (stock: number, record: { warning: string; unit: string }) => (
          <Tag color={record.warning === 'out' ? 'red' : 'orange'}>
            {stock} {record.unit}
          </Tag>
        ),
      },
    ],
    []
  );

  const recentInvoiceColumns = useMemo<ColumnsType<Invoice>>(
    () => [
      { title: '#', dataIndex: 'id', width: 40 },
      {
        title: 'Tổng',
        dataIndex: 'final_total',
        render: formatVND,
        align: 'right',
        width: 100,
      },
      {
        title: 'Giờ',
        dataIndex: 'created_at',
        width: 60,
        render: (v: string) =>
          new Date(v).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      },
    ],
    []
  );

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 24,
        }}
      >
        <Typography.Title level={4} style={{ margin: 0 }}>
          Xin chào, {user?.name}!
        </Typography.Title>
        <Button
          type="primary"
          size="large"
          icon={<ShoppingCartOutlined />}
          onClick={() => navigate('/pos')}
        >
          Bán hàng
        </Button>
      </div>

      {/* Thống kê nhanh */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card loading={loadingInvoices}>
            <Statistic
              title="Đơn hôm nay"
              value={completedInvoices.length}
              prefix={<ShoppingCartOutlined style={statIconStyle} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card loading={loadingInvoices}>
            <Statistic
              title="Doanh thu hôm nay"
              value={todayRevenue}
              prefix={<DollarOutlined style={statIconStyle} />}
              formatter={v => formatVND(v as number)}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card loading={loadingSummary} hoverable onClick={() => navigate('/alerts')}>
            <Statistic
              title="Cảnh báo"
              value={totalAlerts}
              prefix={<AlertOutlined style={statIconStyle} />}
              valueStyle={totalAlerts > 0 ? { color: colors.danger } : undefined}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card loading={loadingShift}>
            <Statistic
              title="Ca hiện tại"
              value={currentShift ? `#${currentShift.id}` : 'Chưa mở'}
              prefix={<ClockCircleOutlined style={statIconStyle} />}
              valueStyle={!currentShift ? { color: colors.textMuted } : undefined}
            />
          </Card>
        </Col>
      </Row>

      {/* Cảnh báo chi tiết */}
      {alertSummary && (alertSummary.expired > 0 || alertSummary.expiring_7d > 0) && (
        <Alert
          type={alertSummary.expired > 0 ? 'error' : 'warning'}
          showIcon
          style={{ marginBottom: 16 }}
          message={
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              {alertSummary.expired > 0
                ? `${alertSummary.expired} lô đã hết hạn — cần bỏ khỏi kho ngay`
                : `${alertSummary.expiring_7d} lô sẽ hết hạn trong 7 ngày`}
            </span>
          }
          description={
            alertSummary.expired > 0 && alertSummary.expiring_7d > 0
              ? `Thêm ${alertSummary.expiring_7d} lô nữa sẽ hết hạn trong 7 ngày.`
              : 'Bán ưu tiên các lô này trước khi phải huỷ.'
          }
          action={
            <Button
              type="primary"
              danger={alertSummary.expired > 0}
              onClick={() => navigate('/alerts')}
            >
              Xem lô hàng
            </Button>
          }
        />
      )}

      {/* Doanh thu 7 ngày gần nhất - chỉ admin, vì /reports/revenue là endpoint admin */}
      {isAdmin && (
        <Card
          title="Doanh thu 7 ngày gần nhất"
          loading={loadingWeek}
          style={{ marginBottom: 16 }}
          extra={
            <Typography.Link onClick={() => navigate('/reports')}>
              Báo cáo đầy đủ <ArrowRightOutlined />
            </Typography.Link>
          }
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weekChartData} margin={{ top: 16, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={yAxisFormatter} />
              <Tooltip formatter={(v: unknown) => formatVND(typeof v === 'number' ? v : 0)} />
              <Bar dataKey="Doanh thu" fill={colors.revenue} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      <Row gutter={16}>
        {/* Hàng sắp hết hạn */}
        <Col xs={24} md={8}>
          <Card
            title={
              <Space>
                <AlertOutlined style={{ color: colors.danger }} /> Sắp hết hạn
              </Space>
            }
            size="small"
          >
            <Table
              dataSource={expiring.slice(0, 8)}
              rowKey="id"
              size="small"
              pagination={false}
              loading={loadingExpiring}
              locale={{ emptyText: 'Không có hàng sắp hết hạn' }}
              columns={expiryColumns}
            />
          </Card>
        </Col>

        {/* Hàng sắp hết */}
        <Col xs={24} md={8}>
          <Card
            title={
              <Space>
                <WarningOutlined style={{ color: colors.warning }} /> Sắp hết hàng
              </Space>
            }
            size="small"
          >
            <Table
              dataSource={lowStock.slice(0, 8)}
              rowKey="id"
              size="small"
              pagination={false}
              loading={loadingLowStock}
              locale={{ emptyText: 'Không có hàng nào sắp hết' }}
              columns={lowStockColumns}
            />
          </Card>
        </Col>

        {/* Đơn hàng gần đây */}
        <Col xs={24} md={8}>
          <Card
            title={
              <Space>
                <ShoppingCartOutlined /> Đơn gần đây
              </Space>
            }
            size="small"
          >
            <Table
              dataSource={completedInvoices.slice(0, 8)}
              rowKey="id"
              size="small"
              pagination={false}
              loading={loadingInvoices}
              locale={{ emptyText: 'Chưa có đơn hôm nay' }}
              columns={recentInvoiceColumns}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default memo(DashboardPage);
