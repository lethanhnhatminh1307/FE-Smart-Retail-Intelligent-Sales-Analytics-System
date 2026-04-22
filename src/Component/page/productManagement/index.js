import { useEffect, useState, useContext, useCallback } from 'react';
import { Table, Button, Input, Select, Modal, Tag, Space, Image } from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import ProductFormModal from './ProductFormModal';
import { product as fetchProducts, deleteProduct, uploadProduct, modify as modifyAPI } from '~/api-server/productServer';
import { Context } from '~/GlobalContext';
import { CHANGEPRODUCT } from '~/GlobalContext/key';
import { dotMoney } from '~/utils/dotMoney';
import { notify } from '~/utils/notification';
import './productManagement.css';

const { Option } = Select;

function ProductManagement() {
    const [{ category }, dispatch] = useContext(Context);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [filterType, setFilterType] = useState(null);

    // Fetch products
    const loadProducts = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchProducts(searchText, {
                ...(filterType ? { typeProduct: filterType } : {}),
            });
            if (data) {
                const list = Array.isArray(data) ? data : data.data || [];
                setProducts(list);
            }
        } catch (error) {
            console.log(error);
            notify('error', 'Không thể tải danh sách sản phẩm');
        } finally {
            setLoading(false);
        }
    }, [searchText, filterType]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    // Open modal for Create
    const handleAdd = () => {
        setEditingProduct(null);
        setModalOpen(true);
    };

    // Open modal for Edit
    const handleEdit = (record) => {
        setEditingProduct(record);
        setModalOpen(true);
    };

    // Delete product
    const handleDelete = (record) => {
        Modal.confirm({
            title: 'Xóa sản phẩm',
            content: `Bạn có chắc muốn xóa sản phẩm "${record.name}"?`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            async onOk() {
                try {
                    const data = await deleteProduct(
                        record._id,
                        record.number * 1,
                        record.billId,
                        record.itemId,
                    );
                    if (data) {
                        setProducts((prev) => prev.filter((item) => item._id !== data._id));
                        dispatch({ key: CHANGEPRODUCT, value: data });
                        notify('success', 'Xóa sản phẩm thành công');
                    }
                } catch (error) {
                    console.log(error);
                    notify('error', 'Xóa sản phẩm thất bại');
                }
            },
        });
    };

    // Handle form submit (Create or Edit)
    const handleFormSubmit = async (formData, config, isEditMode) => {
        try {
            setSubmitLoading(true);
            let data;
            if (isEditMode) {
                data = await modifyAPI(formData, config);
            } else {
                data = await uploadProduct(formData, config);
            }

            if (data?.success) {
                notify('success', data.message || (isEditMode ? 'Cập nhật thành công' : 'Thêm sản phẩm thành công'));
                setModalOpen(false);
                setEditingProduct(null);
                loadProducts(); // Refresh list
            } else {
                notify('error', 'Thất bại, hãy kiểm tra lại thông tin');
            }
        } catch (error) {
            console.log(error);
            notify('error', 'Thất bại, hãy kiểm tra lại thông tin');
        } finally {
            setSubmitLoading(false);
        }
    };

    // Find category name from slug
    const getCategoryName = (slug) => {
        const cat = category.find((c) => c.slug === slug);
        return cat ? cat.type : slug || '—';
    };

    // Table columns
    const columns = [
        {
            title: 'STT',
            key: 'index',
            width: 60,
            align: 'center',
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Ảnh',
            key: 'image',
            width: 80,
            align: 'center',
            render: (_, record) => {
                const img = record.image?.find((i) => !i?.includes('.mp4')) || record.image?.[0];
                return img ? (
                    <Image
                        src={img}
                        alt={record.name}
                        className="product-image-cell"
                        width={56}
                        height={56}
                        style={{ objectFit: 'cover', borderRadius: 6 }}
                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88P/BfwAJhAPkC1lbOAAAAABJRU5ErkJggg=="
                    />
                ) : (
                    <div style={{ width: 56, height: 56, background: '#f0f0f0', borderRadius: 6 }} />
                );
            },
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
            sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
            render: (text) => <span className="product-name-cell">{text}</span>,
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            width: 140,
            render: (type) => <Tag color="blue">{getCategoryName(type)}</Tag>,
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            width: 140,
            sorter: (a, b) => (a.price || 0) - (b.price || 0),
            render: (price) => (
                <span className="product-price-cell">{dotMoney(price)} VNĐ</span>
            ),
        },
        {
            title: 'Size',
            dataIndex: 'size',
            key: 'size',
            width: 150,
            render: (sizes) => (
                <span className="product-size-cell">
                    {(sizes || []).map((s, i) => (
                        <Tag key={i}>{s}</Tag>
                    ))}
                </span>
            ),
        },
        {
            title: 'Hành động',
            key: 'actions',
            width: 120,
            align: 'center',
            render: (_, record) => (
                <Space className="action-buttons">
                    <Button
                        type="primary"
                        ghost
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />
                    <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record)}
                    />
                </Space>
            ),
        },
    ];

    return (
        <div className="product-management">
            {/* Header */}
            <div className="product-management__header">
                <h1 className="product-management__title">Quản lý sản phẩm</h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    onClick={handleAdd}
                >
                    Thêm sản phẩm
                </Button>
            </div>

            {/* Toolbar: Search + Filter */}
            <div className="product-management__toolbar">
                <Input.Search
                    placeholder="Tìm kiếm sản phẩm..."
                    allowClear
                    enterButton={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onSearch={loadProducts}
                    style={{ maxWidth: 300 }}
                />
                <Select
                    placeholder="Lọc theo loại"
                    allowClear
                    value={filterType}
                    onChange={(value) => setFilterType(value || null)}
                    style={{ minWidth: 180 }}
                >
                    {category.map((item) => (
                        <Option key={item.slug} value={item.slug}>
                            {item.type}
                        </Option>
                    ))}
                </Select>
                <Button icon={<ReloadOutlined />} onClick={loadProducts}>
                    Làm mới
                </Button>
            </div>

            {/* Table */}
            <Table
                columns={columns}
                dataSource={products}
                rowKey={(record) => record._id}
                loading={loading}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50'],
                    showTotal: (total) => `Tổng ${total} sản phẩm`,
                }}
                scroll={{ x: 800 }}
            />

            {/* Modal Form for Create/Edit */}
            <ProductFormModal
                open={modalOpen}
                onCancel={() => {
                    setModalOpen(false);
                    setEditingProduct(null);
                }}
                onSubmit={handleFormSubmit}
                editingProduct={editingProduct}
                loading={submitLoading}
            />
        </div>
    );
}

export default ProductManagement;
