import styles from './infoOfProduct.module.scss';
import classNames from 'classnames/bind';
import { Context } from '~/GlobalContext';
import { useContext, useState, forwardRef, useEffect } from 'react';
import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { dotMoney } from '~/utils/dotMoney';

const cx = classNames.bind(styles);

function InfoOfProduct({ typePayment, chooseProduct, type }, ref) {
    const location = useLocation();
    const { state } = location;
    const [{ cart }, dispatch] = useContext(Context);
    const [choosedProducts, setChoosedProducts] = chooseProduct;
    const [discount, setDiscount] = useState(0);
    // event functions
    const handleChangeChoose = (e) => {
        const element = e.target;
        const dataProduct = JSON.parse(element.getAttribute('item'));

        setChoosedProducts((props) => {
            const newData = [...props];
            let same = false;
            props.forEach((item, i) => {
                const itemJSON = JSON.stringify(item);
                if (itemJSON === element.getAttribute('item')) {
                    newData.splice(i, 1);
                    same = true;
                    return;
                }
            });
            if (!same) {
                newData.push(dataProduct);
            }
            return newData;
        });
    };
    const handleDiscount = (e) => {
        const value = e.target.value;
        // if (value === codeDiscount) {
        //     setDiscount(300);
        // }
    };
    //
    const cost = useMemo(() => {
        return choosedProducts.reduce((price, item) => price + item?.price * item.number, 0);
    }, [JSON.stringify(choosedProducts)]);

    const newCart = (cart || []).filter((item) => state?.includes(item?.idProduct?._id));

    useEffect(() => {
        setChoosedProducts(newCart);
    }, [setChoosedProducts]);

    console.log(choosedProducts);

    return (
        <div className={cx('wrapper')}>
            <div className={cx('contain-products')}>
                {newCart.length > 0 ? (
                    newCart.map((item, index) => {
                        const chooseJson = JSON.stringify(choosedProducts);
                        const itemJson = JSON.stringify(item);
                        const product = item?.idProduct || {};
                        return (
                            <div key={index} className={cx('products')}>
                                {/* <input
                                    item={itemJson}
                                    onChange={handleChangeChoose}
                                    type="checkbox"
                                    checked={chooseJson.includes(itemJson)}
                                /> */}
                                <Link
                                    to={`/san-pham/${product?.slug}`}
                                    style={{
                                        paddingLeft: '10px',
                                    }}
                                    className={cx('product')}
                                >
                                    <img src={item?.image} />
                                    <div className={cx('info-of-product')}>
                                        <h4>{product?.name}</h4>
                                        <h5>{`Size: ${item.size} - ${dotMoney(item?.price)} VNĐ × ${item.number} `}</h5>
                                        <h5>{``}</h5>
                                    </div>
                                </Link>
                            </div>
                        );
                    })
                ) : (
                    <span>
                        Không có sản phẩm nào trong giỏ hàng, bạn có thể đến <Link to="/cua-hang">Cửa hàng</Link> để
                        thêm một vài sản phẩm trước khi thanh toán
                    </span>
                )}
            </div>
            <span className={cx('line-border')}></span>
            <input
                onBlur={handleDiscount}
                ref={ref.refcodeDiscount}
                className={cx('discount')}
                placeholder="Mã giảm giá"
            />
            <table className={cx('cost-table')}>
                <tbody>
                    <tr>
                        <td colSpan={3}>Tổng chi phí: </td>
                        <td className={cx('t-r')}>{dotMoney(cost)} VNĐ</td>
                    </tr>
                    <tr>
                        <td colSpan={3}>Giảm: </td>
                        <td className={cx('t-r')}>{discount} VNĐ</td>
                    </tr>
                    <tr>
                        <td colSpan={3}>Tiền phải trả: </td>
                        <td className={cx('t-r')}>{dotMoney(cost - discount)} VNĐ</td>
                    </tr>
                    <tr>
                        <td colSpan={3}>Phương thức thanh toán: </td>
                        <td className={cx('t-r')}>
                            <select
                                onChange={(e) => {
                                    typePayment(e.target.value);
                                }}
                                // defaultValue={type}
                                value={type}
                            >
                                <option value="after">Khi nhận hàng</option>
                                <option value="banking">Ngân hàng</option>
                            </select>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default forwardRef(InfoOfProduct);
