import { useEffect, useState, useContext } from 'react';
import { Modal, Form, Select, InputNumber, Input, Upload, Space, Button, Image } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
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
    // INIT FORM (ADD + EDIT)
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
                                        url: item.sku, // URL hoặc base64 từ backend
                                    },
                                ]
                              : [],
                      }))
                    : [{ size: '', stock: undefined, price: undefined, sku: [] }],
            });
        } else {
            form.resetFields();
            form.setFieldsValue({
                variants: [{ size: '', stock: undefined, price: undefined, sku: [] }],
            });
        }
    }, [open, editingProduct, isEditMode, form]);

    // =========================
    // PREVIEW IMAGE
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
    // SUBMIT
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
                        // giữ ảnh cũ khi edit
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
    // UI
    // =========================
    return (
        <>
            <Modal
                title={isEditMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}
                open={open}
                onOk={handleOk}
                onCancel={onCancel}
                okText={isEditMode ? 'Cập nhật' : 'Thêm'}
                confirmLoading={loading}
                width={750}
                centered
            >
                <Form form={form} layout="vertical">
                    {/* NAME */}
                    <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    {/* TYPE */}
                    <Form.Item name="type" label="Loại" rules={[{ required: true }]}>
                        <Select>
                            {category.map((item) => (
                                <Option key={item.slug} value={item.slug}>
                                    {item.type}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {/* VARIANTS */}
                    <Form.Item label="Variants">
                        <Form.List name="variants">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Space key={key} align="start" style={{ display: 'flex', marginBottom: 8 }}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'size']}
                                                rules={[{ required: true }]}
                                            >
                                                <Input placeholder="Size" />
                                            </Form.Item>

                                            <Form.Item
                                                {...restField}
                                                name={[name, 'price']}
                                                rules={[{ required: true }]}
                                            >
                                                <InputNumber placeholder="Giá" />
                                            </Form.Item>

                                            <Form.Item
                                                {...restField}
                                                name={[name, 'stock']}
                                                rules={[{ required: true }]}
                                            >
                                                <InputNumber placeholder="Kho" />
                                            </Form.Item>

                                            {/* UPLOAD (SMALL + PREVIEW) */}
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'sku']}
                                                valuePropName="fileList"
                                                getValueFromEvent={(e) => e?.fileList}
                                            >
                                                <Upload
                                                    listType="picture-card"
                                                    beforeUpload={() => false}
                                                    maxCount={1}
                                                    onPreview={handlePreview}
                                                    className="small-upload"
                                                >
                                                    <Button size="small">Upload</Button>
                                                </Upload>
                                            </Form.Item>

                                            {fields.length > 1 && (
                                                <MinusCircleOutlined
                                                    onClick={() => remove(name)}
                                                    style={{ color: 'red' }}
                                                />
                                            )}
                                        </Space>
                                    ))}

                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        Thêm variant
                                    </Button>
                                </>
                            )}
                        </Form.List>
                    </Form.Item>

                    {/* DESCRIPTION */}
                    <Form.Item name="description" label="Mô tả">
                        <TextArea rows={3} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* PREVIEW MODAL */}
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
