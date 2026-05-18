import { useEffect, useState } from 'react';
import { Table, Tag, Button, Popconfirm } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { getAllOrders, updateOrderStatus } from '~/api-server/showOrder';
import { notify } from '~/utils/notification';
import classNames from 'classnames/bind';
import styles from './styles.module.scss';
import { dotMoney } from '~/utils/dotMoney';

const cx = classNames.bind(styles);

function OrderManagement() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await getAllOrders();
            if (res && res.success) {
                setOrders(res.data);
            }
        } catch (error) {
            console.error(error);
            notify('error', 'Lỗi khi tải danh sách đơn hàng');
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

    const getTitle = (status) => {
        switch (status) {
            case 'delivering':
                return 'Giao hàng';
            case 'delivered':
                return 'Đã giao';
            case 'returned':
                return 'Hoàn hàng';
            default:
                return 'Đã hoàn hàng';
        }
    };

    const columns = [
        {
            title: 'Khách hàng',
            key: 'customer',
            render: (_, record) => (
                <div>
                    <b>{record.toName}</b>
                    <br />
                    <span>{record.toPhoneNumber}</span>
                </div>
            ),
        },
        {
            title: 'Địa chỉ giao',
            key: 'address',
            width: 250,
            render: (_, record) => (
                <span>
                    {record.toSpecificAddress}, {record.toVillage}, {record.toDistrict}, {record.toProvince}
                </span>
            ),
        },
        {
            title: 'Sản phẩm',
            key: 'products',
            render: (_, record) => (
                <ul style={{ paddingLeft: 16, margin: 0 }}>
                    {(record.infoOfOder || []).map((item, i) => (
                        <li key={i}>
                            {item.name} ({item.color} - {item.size}) x <b>{item.number}</b>
                        </li>
                    ))}
                </ul>
            ),
        },
        {
            title: 'Tổng tiền',
            key: 'total',
            render: (_, record) => {
                const total = (record.infoOfOder || []).reduce((acc, item) => acc + item.number * item.price, 0);
                return <b style={{ color: '#cf1322' }}>{dotMoney(total)} đ</b>;
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'default';
                let text = status;
                if (status === 'pending') {
                    color = 'warning';
                    text = 'Chờ xử lý';
                }
                if (status === 'delivering') {
                    color = 'processing';
                    text = 'Đang giao';
                }
                if (status === 'delivered') {
                    color = 'success';
                    text = 'Đã giao';
                }
                if (status === 'cancelled') {
                    color = 'error';
                    text = 'Đã hủy';
                }
                if (status === 'return') {
                    color = 'warning';
                    text = 'Đang hoàn hàng';
                }
                if (status === 'returned') {
                    color = 'default';
                    text = 'Đã hoàn hàng';
                }
                return <Tag color={color}>{text}</Tag>;
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => {
                if ((record.status !== 'delivered' && record.status !== 'cancelled' && record.status !== 'returned') || !record.status) {
                    let nextStatus;
                    switch (record.status) {
                        case 'pending':
                            nextStatus = 'delivering';
                            break;
                        case 'delivering':
                            nextStatus = 'delivered';
                            break;
                        case 'return':
                            nextStatus = 'returned';
                            break;
                        default:
                            nextStatus = 'delivered';
                    }
                    return (
                        <div
                            style={{
                                display: 'flex',
                                gap: '5px',
                            }}
                        >
                            {record.status === 'pending' && (
                                <Popconfirm
                                    title="Bạn có chắc chắn muốn hủy?"
                                    onConfirm={() => handleMarkDelivered(record._id, 'cancelled')}
                                    okText="Đồng ý"
                                    cancelText="Hủy"
                                >
                                    <Button
                                        type="primary"
                                        style={{ background: '#cf1322', borderColor: 'cf1322' }}
                                        icon={<CloseOutlined />}
                                    >
                                        Hủy
                                    </Button>
                                </Popconfirm>
                            )}
                            <Popconfirm
                                title="Xác nhận hành động?"
                                onConfirm={() => handleMarkDelivered(record._id, nextStatus)}
                                okText="Đồng ý"
                                cancelText="Hủy"
                            >
                                <Button
                                    type="primary"
                                    // style={{ background: '#F6FFED', borderColor: '#F6FFED' }}
                                    icon={<CheckOutlined />}
                                >
                                    {getTitle(nextStatus)}
                                </Button>
                            </Popconfirm>
                        </div>
                    );
                }
                return null;
            },
        },
    ];

    return (
        <div className={cx('wrapper')}>
            <h1 className={cx('title')}>Quản Lý Đơn Hàng</h1>
            <div className={cx('tableContainer')}>
                <Table
                    columns={columns}
                    dataSource={orders}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </div>
        </div>
    );
}

export default OrderManagement;
