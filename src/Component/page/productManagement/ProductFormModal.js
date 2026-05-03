import { useEffect, useState, useContext } from 'react';
import { Modal, Form, Select, InputNumber, Input, Upload, Button, Image, Row, Col, Divider, Card } from 'antd';
import { PlusOutlined, MinusCircleOutlined, UploadOutlined } from '@ant-design/icons';
import { Context } from '~/GlobalContext';
import { notify } from '~/utils/notification';
import { convertImageToBase64 } from '~/utils/converImageToBase64';

const { TextArea } = Input;
const { Option } = Select;

function ProductFormModal({ open, onCancel, onSubmit, editingProduct, loading }) {
    const [form] = Form.useForm();
    const [{ category }] = useContext(Context);

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');

    const isEditMode = !!editingProduct;

    // =========================
    // KHỞI TẠO FORM (THÊM + SỬA)
    // =========================
    useEffect(() => {
        if (!open) return;

        if (isEditMode) {
            form.setFieldsValue({
                name: editingProduct.name || '',
                type: editingProduct.type || undefined,
                description: editingProduct.description || '',
                variants: editingProduct.variants?.length
                    ? editingProduct.variants.map((item, index) => ({
                        ...item,
                        sku: item.sku
                            ? [
                                {
                                    uid: `old-${index}`,
                                    name: 'image.png',
                                    status: 'done',
                                    url: item.sku,
                                },
                            ]
                            : [],
                    }))
                    : [{ color: '', size: '', stock: undefined, price: undefined, sku: [] }],
            });
        } else {
            form.resetFields();
            form.setFieldsValue({
                variants: [{ color: '', size: '', stock: undefined, price: undefined, sku: [] }],
            });
        }
    }, [open, editingProduct, isEditMode, form]);

    // =========================
    // XEM TRƯỚC ẢNH
    // =========================
    const handlePreview = async (file) => {
        let src = file.url;

        if (!src) {
            src = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.readAsDataURL(file.originFileObj);
                reader.onload = () => resolve(reader.result);
            });
        }

        setPreviewImage(src);
        setPreviewOpen(true);
    };

    // =========================
    // GỬI FORM
    // =========================
    const handleOk = async () => {
        try {
            const values = await form.validateFields();

            const variants = await Promise.all(
                values.variants.map(async (item) => {
                    let base64 = '';

                    if (item.sku?.length > 0 && item.sku[0]?.originFileObj) {
                        base64 = await convertImageToBase64(item.sku[0].originFileObj);
                    } else if (item.sku?.length > 0 && item.sku[0]?.url) {
                        base64 = item.sku[0].url;
                    }

                    return {
                        ...item,
                        sku: base64,
                    };
                }),
            );

            const formData = new FormData();
            formData.append('variants', JSON.stringify(variants));
            formData.append('type', values.type);
            formData.append('description', values.description || '');
            formData.append('name', values.name);
            formData.append('id', localStorage?.id || null);

            if (isEditMode) {
                formData.append('idProduct', editingProduct._id);
            }

            onSubmit(
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                },
                isEditMode,
            );
        } catch (err) {
            console.log(err);
            notify('error', 'Vui lòng kiểm tra lại thông tin!');
        }
    };

    // =========================
    // GIAO DIỆN
    // =========================
    return (
        <>
            <Modal
                title={isEditMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}
                open={open}
                onOk={handleOk}
                onCancel={onCancel}
                okText={isEditMode ? 'Cập nhật' : 'Thêm'}
                cancelText="Hủy"
                confirmLoading={loading}
                width={800}
                centered
                styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
            >
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={16}>
                            <Form.Item
                                name="name"
                                label="Tên sản phẩm"
                                rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
                            >
                                <Input placeholder="Nhập tên sản phẩm" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="type"
                                label="Loại sản phẩm"
                                rules={[{ required: true, message: 'Vui lòng chọn loại sản phẩm' }]}
                            >
                                <Select placeholder="Chọn loại">
                                    {category.map((item) => (
                                        <Option key={item.slug} value={item.slug}>
                                            {item.type}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* PHÂN LOẠI SẢN PHẨM */}
                    <Divider orientation="left" style={{ fontSize: 14, fontWeight: 600 }}>
                        Phân loại sản phẩm
                    </Divider>
                    <Form.List name="variants">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }, index) => (
                                    <Card
                                        key={key}
                                        size="small"
                                        style={{
                                            marginBottom: 12,
                                            borderRadius: 8,
                                            border: '1px solid #f0f0f0',
                                            background: '#fafafa',
                                        }}
                                        title={
                                            <span style={{ fontSize: 13, color: '#666' }}>
                                                Phân loại #{index + 1}
                                            </span>
                                        }
                                        extra={
                                            fields.length > 1 && (
                                                <MinusCircleOutlined
                                                    onClick={() => remove(name)}
                                                    style={{ color: '#ff4d4f', fontSize: 16, cursor: 'pointer' }}
                                                    title="Xóa phân loại này"
                                                />
                                            )
                                        }
                                    >
                                        <Row gutter={12}>
                                            <Col span={6}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'color']}
                                                    label="Màu sắc"
                                                    rules={[{ required: true, message: 'Nhập màu' }]}
                                                    style={{ marginBottom: 8 }}
                                                >
                                                    <Input placeholder="VD: Đen, Trắng..." />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'size']}
                                                    label="Kích thước"
                                                    rules={[{ required: true, message: 'Nhập kích thước' }]}
                                                    style={{ marginBottom: 8 }}
                                                >
                                                    <Input placeholder="VD: S, M, L..." />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'price']}
                                                    label="Giá bán (VNĐ)"
                                                    rules={[{ required: true, message: 'Nhập giá bán' }]}
                                                    style={{ marginBottom: 8 }}
                                                >
                                                    <InputNumber
                                                        placeholder="VD: 150000"
                                                        style={{ width: '100%' }}
                                                        min={0}
                                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                        parser={(value) => value.replace(/,/g, '')}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'stock']}
                                                    label="Tồn kho"
                                                    rules={[{ required: true, message: 'Nhập số lượng' }]}
                                                    style={{ marginBottom: 8 }}
                                                >
                                                    <InputNumber
                                                        placeholder="VD: 10"
                                                        style={{ width: '100%' }}
                                                        min={0}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col span={24}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'sku']}
                                                    label="Ảnh sản phẩm"
                                                    valuePropName="fileList"
                                                    getValueFromEvent={(e) => e?.fileList}
                                                    style={{ marginBottom: 0 }}
                                                >
                                                    <Upload
                                                        listType="picture-card"
                                                        beforeUpload={() => false}
                                                        maxCount={1}
                                                        onPreview={handlePreview}
                                                        className="small-upload"
                                                    >
                                                        <div>
                                                            <UploadOutlined />
                                                            <div style={{ marginTop: 4, fontSize: 12 }}>Tải ảnh</div>
                                                        </div>
                                                    </Upload>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Card>
                                ))}

                                <Button
                                    type="dashed"
                                    onClick={() => add({ color: '', size: '', stock: undefined, price: undefined, sku: [] })}
                                    block
                                    icon={<PlusOutlined />}
                                    style={{ height: 40 }}
                                >
                                    Thêm phân loại
                                </Button>
                            </>
                        )}
                    </Form.List>

                    {/* MÔ TẢ */}
                    <Form.Item name="description" label="Mô tả sản phẩm" style={{ marginTop: 16 }}>
                        <TextArea rows={3} placeholder="Nhập mô tả sản phẩm..." />
                    </Form.Item>
                </Form>
            </Modal>

            {/* XEM TRƯỚC ẢNH */}
            <Image
                style={{ display: 'none' }}
                preview={{
                    visible: previewOpen,
                    onVisibleChange: (v) => setPreviewOpen(v),
                    src: previewImage,
                }}
            />
        </>
    );
}

export default ProductFormModal;

