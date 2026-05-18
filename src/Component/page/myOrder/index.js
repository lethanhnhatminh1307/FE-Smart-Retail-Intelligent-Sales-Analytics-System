import React, { useEffect, useState } from 'react';
import { Table, Tag, Card, Button, Popconfirm } from 'antd';
import { myOrder, updateOrderStatus } from '~/api-server/showOrder';
import { dotMoney } from '~/utils/dotMoney';
import classNames from 'classnames/bind';
import styles from './myOrder.module.scss';
import { CloseOutlined } from '@ant-design/icons';
import { notify } from '~/utils/notification';

const cx = classNames.bind(styles);

function MyOrder() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await myOrder();
            if (data) {
                setOrders(data);
            }
        } catch (error) {
            console.error('Lỗi tải đơn hàng:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleMarkDelivered = async (id, nextStatus) => {
        try {
            const res = await updateOrderStatus(id, nextStatus);

            if (res && res?.success) {
                notify('success', 'Cập nhật thành công');
                fetchOrders();
            } else {
                notify('error', 'Cập nhật thất bại');
            }
        } catch (error) {
            console.error(error);
            notify('error', 'Đã có lỗi xảy ra');
        }
    };

    const columns = [
        {
            title: 'Sản phẩm',
            key: 'products',
            render: (_, record) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(record.infoOfOder || []).map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <img
                                src={item.image}
                                alt={item.name}
                                style={{
                                    width: 60,
                                    height: 60,
                                    objectFit: 'cover',
                                    borderRadius: 6,
                                    border: '1px solid #eee',
                                }}
                            />
                            <div>
                                <div style={{ fontWeight: 500, color: '#1a1a2e' }}>{item.name || 'Sản phẩm'}</div>
                                <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                                    {item.color} - {item.size}
                                </div>
                                <div style={{ fontSize: 13, color: '#cf1322', fontWeight: 600 }}>
                                    {item.number} x {dotMoney(item.price)} đ
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ),
        },
        {
            title: 'Tổng thanh toán',
            key: 'total',
            width: 180,
            align: 'right',
            render: (_, record) => {
                const total = (record.infoOfOder || []).reduce((acc, item) => acc + item.number * item.price, 0);
                return <b style={{ color: '#cf1322', fontSize: 16 }}>{dotMoney(total)} đ</b>;
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 150,
            align: 'center',
            render: (status) => {
                let color = 'default';
                let text = status;
                if (status === 'pending' || !status) {
                    color = 'warning';
                    text = 'Chờ xử lý';
                } else if (status === 'delivering') {
                    color = 'processing';
                    text = 'Đang giao';
                } else if (status === 'delivered') {
                    color = 'success';
                    text = 'Đã giao';
                } else if (status === 'cancelled') {
                    color = 'error';
                    text = 'Đã hủy';
                } else if (status === 'return') {
                    color = 'warning';
                    text = 'Đang hoàn hàng';
                } else if (status === 'returned') {
                    color = 'default';
                    text = 'Đã hoàn hàng';
                }
                return (
                    <Tag color={color} style={{ padding: '4px 12px', fontSize: 14 }}>
                        {text}
                    </Tag>
                );
            },
        },
        {
            title: 'Thông tin nhận hàng',
            key: 'shipping',
            width: 250,
            render: (_, record) => (
                <div style={{ fontSize: 13, color: '#595959' }}>
                    <div style={{ marginBottom: 4 }}>
                        <b>{record.toName}</b> - {record.toPhoneNumber}
                    </div>
                    <div>
                        {record.toSpecificAddress}, {record.toVillage}, {record.toDistrict}, {record.toProvince}
                    </div>
                    {record.typeOfPayment && (
                        <div style={{ marginTop: 4 }}>
                            <Tag color="purple">
                                {record.typeOfPayment === 'banking' ? 'Chuyển khoản' : 'Thanh toán khi nhận hàng'}
                            </Tag>
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Hành động',
            key: 'actions',
            width: 80,
            align: 'center',
            render: (_, record) => {
                console.log(record);

                return (
                    record.status === 'delivered' && (
                        <Popconfirm
                            title="Bạn có chắc chắn muốn hủy?"
                            onConfirm={() => handleMarkDelivered(record._id, 'return')}
                            okText="Đồng ý"
                            cancelText="Hủy"
                        >
                            <Button type="primary" style={{ background: '#cf1322', borderColor: 'cf1322' }}>
                                Hoàn hàng
                            </Button>
                        </Popconfirm>
                    )
                );
            },
        },
    ];

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px', minHeight: '80vh' }}>
            <h1 style={{ fontSize: 24, fontWeight: 600, color: '#1a1a2e', marginBottom: 24 }}>Đơn hàng của tôi</h1>
            <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: 12 }}>
                <Table
                    columns={columns}
                    dataSource={orders}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 800 }}
                />
            </Card>
        </div>
    );
}

export default MyOrder;
