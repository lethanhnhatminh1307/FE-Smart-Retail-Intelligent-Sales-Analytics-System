import { useEffect, useState } from 'react';
import { Row, Col, Card, Skeleton, Table, Tag, Input } from 'antd';
import { ArrowUpOutlined, DollarOutlined, InboxOutlined, ShoppingCartOutlined, LineChartOutlined } from '@ant-design/icons';
import { get } from '~/utils/Api/request';
import classNames from 'classnames/bind';
import styles from './styles.module.scss';
import { notify } from '~/utils/notification';
import { product as fetchProducts } from '~/api-server/productServer';
import { dotMoney } from '~/utils/dotMoney';

const cx = classNames.bind(styles);

function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({
        totalInventoryValue: 0,
        totalPotentialRevenue: 0,
        potentialProfit: 0,
        actualRevenue: 0,
        actualProfit: 0,
        deliveredOrdersCount: 0,
        pendingOrdersCount: 0
    });
    const [products, setProducts] = useState([]);
    const [searchText, setSearchText] = useState('');

    const filteredProducts = products.filter(p => 
        p.name && p.name.toLowerCase().includes(searchText.toLowerCase())
    );

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await get('dashboard/summary');
                if (res && res.success) {
                    setSummary(res.data);
                }
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu dashboard:", error);
                notify('error', 'Không thể tải dữ liệu bảng điều khiển!');
            }
            try {
                const productData = await fetchProducts('');
                if (productData) {
                    setProducts(Array.isArray(productData) ? productData : productData.data || []);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    if (loading) {
        return (
            <div className={cx('dashboardWrapper')}>
                <Skeleton active paragraph={{ rows: 10 }} />
            </div>
        );
    }

    return (
        <div className={cx('dashboardWrapper')}>
            <div className={cx('innerContent')}>
            <div className={cx('header')}>
                <h1>Bảng Điều Khiển Kinh Doanh</h1>
                <p>Tổng quan về doanh thu, chi phí và tình hình lợi nhuận</p>
            </div>

            <h2 className={cx('sectionTitle')}>Tổng Quan Kho Hàng (Dự Kiến)</h2>
            <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} lg={8}>
                    <Card className={cx('statCard', 'inventory')}>
                        <div className={cx('title')}>Tổng Giá Trị Kho Hàng</div>
                        <div className={cx('value')}>
                            {formatCurrency(summary.totalInventoryValue)}
                        </div>
                        <div style={{ marginTop: 12, color: '#d4380d' }}>
                            <InboxOutlined style={{ marginRight: 8 }} />
                            Vốn đã đầu tư
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card className={cx('statCard', 'revenue')}>
                        <div className={cx('title')}>Tổng Doanh Thu Dự Kiến</div>
                        <div className={cx('value')}>
                            {formatCurrency(summary.totalPotentialRevenue)}
                        </div>
                        <div style={{ marginTop: 12, color: '#389e0d' }}>
                            <LineChartOutlined style={{ marginRight: 8 }} />
                            Khi bán hết tồn kho
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card className={cx('statCard', 'profit')}>
                        <div className={cx('title')}>Lợi Nhuận Ròng Dự Kiến</div>
                        <div className={cx('value')}>
                            {formatCurrency(summary.potentialProfit)}
                        </div>
                        <div style={{ marginTop: 12, color: '#096dd9' }}>
                            <DollarOutlined style={{ marginRight: 8 }} />
                            Chênh lệch Doanh thu - Giá nhập
                        </div>
                    </Card>
                </Col>
            </Row>

            <h2 className={cx('sectionTitle')}>Tình Hình Bán Hàng Thực Tế</h2>
            <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card className={cx('statCard', 'orders')}>
                        <div className={cx('title')}>Đơn Đã Giao Thành Công</div>
                        <div className={cx('value')}>
                            {summary.deliveredOrdersCount} <span style={{fontSize: 16}}>đơn</span>
                        </div>
                        <div style={{ marginTop: 12, color: '#531dab' }}>
                            <ShoppingCartOutlined style={{ marginRight: 8 }} />
                            Hoàn tất
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className={cx('statCard')}>
                        <div className={cx('title')}>Đơn Hàng Chờ Xử Lý</div>
                        <div className={cx('value')}>
                            {summary.pendingOrdersCount} <span style={{fontSize: 16}}>đơn</span>
                        </div>
                        <div style={{ marginTop: 12, color: '#8c8c8c' }}>
                            <ShoppingCartOutlined style={{ marginRight: 8 }} />
                            Chưa giao
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className={cx('statCard', 'revenue')}>
                        <div className={cx('title')}>Doanh Thu Thực Tế</div>
                        <div className={cx('value')}>
                            {formatCurrency(summary.actualRevenue)}
                        </div>
                        <div style={{ marginTop: 12, color: '#389e0d' }}>
                            <LineChartOutlined style={{ marginRight: 8 }} />
                            Từ đơn đã giao
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className={cx('statCard', 'profit')}>
                        <div className={cx('title')}>Lợi Nhuận Thực Tế</div>
                        <div className={cx('value')}>
                            {formatCurrency(summary.actualProfit)}
                        </div>
                        <div style={{ marginTop: 12, color: '#096dd9' }}>
                            <ArrowUpOutlined style={{ marginRight: 8 }} />
                            Từ đơn đã giao
                        </div>
                    </Card>
                </Col>
            </Row>

            <div style={{ marginTop: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '32px 0 16px 0' }}>
                    <h2 className={cx('sectionTitle')} style={{ margin: 0 }}>Chi Tiết Hàng Tồn Kho</h2>
                    <Input.Search 
                        placeholder="Tìm kiếm sản phẩm..." 
                        allowClear 
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                    />
                </div>
                <Card className={cx('chartCard')} style={{ width: '100%', margin: 0 }}>
                    <Table 
                    dataSource={filteredProducts} 
                    rowKey="_id"
                    pagination={{ pageSize: 5 }}
                    scroll={{ x: 800 }}
                    columns={[
                        {
                            title: 'Sản phẩm',
                            dataIndex: 'name',
                            key: 'name',
                            render: (text) => <b>{text}</b>
                        },
                        {
                            title: 'Màu & Size',
                            key: 'variants',
                            render: (_, record) => (
                                <>
                                    {(record.variants || []).map((v, i) => (
                                        <div key={i} style={{marginBottom: 4}}>
                                            <Tag color="blue">{v.color} - {v.size}</Tag>
                                        </div>
                                    ))}
                                </>
                            )
                        },
                        {
                            title: 'Tồn kho',
                            key: 'stock',
                            align: 'center',
                            render: (_, record) => (
                                <>
                                    {(record.variants || []).map((v, i) => (
                                        <div key={i} style={{marginBottom: 4}}>
                                            <Tag color={v.stock > 0 ? "cyan" : "red"}>{v.stock}</Tag>
                                        </div>
                                    ))}
                                </>
                            )
                        },
                        {
                            title: 'Giá nhập (Cost)',
                            key: 'cost',
                            align: 'right',
                            render: (_, record) => (
                                <>
                                    {(record.variants || []).map((v, i) => (
                                        <div key={i} style={{marginBottom: 4}}>
                                            {dotMoney(v.cost || 0)} đ
                                        </div>
                                    ))}
                                </>
                            )
                        },
                        {
                            title: 'Giá bán (Price)',
                            key: 'price',
                            align: 'right',
                            render: (_, record) => (
                                <>
                                    {(record.variants || []).map((v, i) => (
                                        <div key={i} style={{marginBottom: 4}}>
                                            {dotMoney(v.price || 0)} đ
                                        </div>
                                    ))}
                                </>
                            )
                        }
                    ]}
                />
            </Card>
            </div>
            </div>
        </div>
    );
}

export default Dashboard;
