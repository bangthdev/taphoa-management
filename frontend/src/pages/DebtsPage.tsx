import { EyeOutlined } from '@ant-design/icons';
import { Table, Tag, Button } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { PageHeader, EmptyState } from '../components/common';
import { useDebts } from '../hooks';
import type { Customer } from '../types';
import { formatVND } from '../utils/format';

export default function DebtsPage() {
  const navigate = useNavigate();
  const { data: customers = [], isLoading } = useDebts();

  const columns = [
    { title: 'Tên', dataIndex: 'name' },
    // Số điện thoại là giá trị nguyên khối, ngắt dòng giữa chừng là đọc sai.
    // nowrap giữ nó liền mạch kể cả khi thang chữ đổi; width chỉ là chỗ chứa.
    {
      title: 'SĐT',
      dataIndex: 'phone',
      width: 170,
      onCell: () => ({ style: { whiteSpace: 'nowrap' as const } }),
    },
    {
      title: 'Tổng nợ',
      dataIndex: 'total_debt',
      render: (v: number) => <Tag color="red">{formatVND(v)}</Tag>,
      align: 'right' as const,
      width: 150,
    },
    {
      title: '',
      width: 100,
      render: (_: unknown, r: Customer) => (
        <Button icon={<EyeOutlined />} size="small" onClick={() => navigate(`/customers/${r.id}`)}>
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Công nợ khách hàng" />
      <Table
        dataSource={customers}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 20 }}
        size="middle"
        locale={{ emptyText: <EmptyState title="Không có khách hàng nợ" /> }}
      />
    </div>
  );
}
