import { useEffect, useState, useContext } from 'react';
import { Modal, Form, Select, InputNumber, Input, Upload, Space, Button } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { Context } from '~/GlobalContext';
import { notify } from '~/utils/notification';

const { TextArea } = Input;
const { Option } = Select;

function ProductFormModal({ open, onCancel, onSubmit, editingProduct, loading }) {
    const [form] = Form.useForm();
    const [{ category }] = useContext(Context);
    const [fileList, setFileList] = useState([]);

    const isEditMode = !!editingProduct;

    // Pre-fill form when editing
    useEffect(() => {
        if (open) {
            if (isEditMode) {
                form.setFieldsValue({
                    name: editingProduct.name || '',
                    type: editingProduct.type || undefined,
                    price: editingProduct.price,
                    variants: editingProduct.variants?.length ? editingProduct.variants : [{ size: '', stock: 0 }],
                    description: editingProduct.description || '',
                });
                // Set existing images for preview
                const imgs = (editingProduct.image || []).map((url, index) => ({
                    uid: `existing-${index}`,
                    name: `image-${index}`,
                    status: 'done',
                    url: url,
                }));
                setFileList(imgs);
            } else {
                form.resetFields();
                form.setFieldsValue({ variants: [{ size: '', stock: 0 }] });
                setFileList([]);
            }
        }
    }, [open, editingProduct, isEditMode, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();

            const formData = new FormData();
            formData.append('price', values.price);
            formData.append('variants', JSON.stringify(values.variants || []));
            formData.append('type', values.type);
            formData.append('description', values.description || '');
            formData.append('id', localStorage?.id || null);

            // Separate new files and existing URLs
            const newFiles = [];
            const keepExisting = [];

            fileList.forEach((file) => {
                if (file.originFileObj) {
                    // New file uploaded by user
                    newFiles.push(file.originFileObj);
                } else if (file.url) {
                    // Existing image URL
                    keepExisting.push(file.url);
                }
            });

            newFiles.forEach((file) => {
                formData.append('image', file);
            });

            keepExisting.forEach((url) => {
                formData.append('fileUpdate', url);
            });

            formData.append('name', values.name);

            if (isEditMode) {
                formData.append('idProduct', editingProduct._id);
            }

            const config = {
                headers: { 'Content-Type': 'multipart/form-data' },
            };

            onSubmit(formData, config, isEditMode);
        } catch (error) {
            console.log('Validation failed:', error);
            notify('error', 'Vui lòng kiểm tra lại thông tin!');
        }
    };

    const handleUploadChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    const handlePreview = async (file) => {
        let src = file.url;
        if (!src) {
            src = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.readAsDataURL(file.originFileObj);
                reader.onload = () => resolve(reader.result);
            });
        }
        const imgWindow = window.open(src);
        imgWindow?.document.write(`<img src="${src}" style="max-width:100%"/>`);
    };

    return (
        <Modal
            title={isEditMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            okText={isEditMode ? 'Cập nhật' : 'Thêm'}
            cancelText="Hủy"
            confirmLoading={loading}
            width={640}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                style={{ marginTop: 16 }}
            >
                <Form.Item
                    name="name"
                    label="Tên sản phẩm"
                    rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
                >
                    <Input placeholder="Nhập tên sản phẩm" />
                </Form.Item>

                <Form.Item
                    name="type"
                    label="Loại sản phẩm"
                    rules={[{ required: true, message: 'Vui lòng chọn loại sản phẩm' }]}
                >
                    <Select placeholder="Chọn loại sản phẩm">
                        {category.map((item) => (
                            <Option key={item.slug} value={item.slug}>
                                {item.type}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="price"
                    label="Giá bán"
                    rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
                >
                    <InputNumber
                        min={1}
                        style={{ width: '100%' }}
                        placeholder="Nhập giá bán"
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => value.replace(/,/g, '')}
                        addonAfter="VNĐ"
                    />
                </Form.Item>

                <Form.Item label="Biến thể (Size & Số lượng)" required>
                    <Form.List name="variants">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'size']}
                                            rules={[{ required: true, message: 'Nhập size' }]}
                                        >
                                            <Input placeholder="Size (VD: M, 40)" />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'stock']}
                                            rules={[{ required: true, message: 'Nhập số lượng' }]}
                                        >
                                            <InputNumber placeholder="Số lượng" min={0} />
                                        </Form.Item>
                                        {fields.length > 1 ? (
                                            <MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red' }} />
                                        ) : null}
                                    </Space>
                                ))}
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        Thêm Size mới
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                </Form.Item>

                <Form.Item name="description" label="Mô tả sản phẩm">
                    <TextArea rows={3} placeholder="Mô tả sản phẩm..." />
                </Form.Item>

                <Form.Item label="Hình ảnh / Video">
                    <Upload
                        listType="picture-card"
                        fileList={fileList}
                        onChange={handleUploadChange}
                        onPreview={handlePreview}
                        beforeUpload={() => false}
                        accept=".jpg,.png,.mp4"
                        multiple
                    >
                        {fileList.length >= 10 ? null : (
                            <div>
                                <PlusOutlined />
                                <div style={{ marginTop: 8 }}>Thêm ảnh</div>
                            </div>
                        )}
                    </Upload>
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default ProductFormModal;
