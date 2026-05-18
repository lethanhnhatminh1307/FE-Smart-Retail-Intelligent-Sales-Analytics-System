import styles from './styles.module.scss';
import classNames from 'classnames/bind';
import InfoProduct from './infoProduct';
import Pay from './pay';

import { useMemo, useContext, useState } from 'react';
import { Context } from '~/GlobalContext';

const cx = classNames.bind(styles);

function Cart() {
    const [states, dispatch] = useContext(Context);

    const [idProducts, setIdProducts] = useState([]);

    const newCart = (states?.cart || []).filter((item) => idProducts.includes(item?.idProduct?._id));

    const totalCost = useMemo(() => {
        return newCart?.reduce((cost, item) => {
            const price = item.price ? item.price * item.number : 0;
            return cost + price;
        }, 0);
    }, [newCart]);
        

    return (
        <div className={cx('wrapper', { wrap: true })}>
            <div className={cx('contain', { grid: true })}>
                <div className={cx('info-product')}>
                    <InfoProduct data={[states, dispatch]} setIdProducts={setIdProducts} />
                </div>
                <div className={cx('pay')}>
                    <Pay totalCost={totalCost} idProducts={idProducts} />
                </div>
            </div>
        </div>
    );
}

export default Cart;
