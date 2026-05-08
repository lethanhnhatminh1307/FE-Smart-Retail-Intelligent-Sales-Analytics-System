import { PayPalButtons } from '@paypal/react-paypal-js';
import { useEffect, useMemo, useState } from 'react';
import { banking, payment } from '~/api-server/payment';
import { CART } from '~/GlobalContext/key';
import NotifyContainer, { notify } from '~/utils/notification';

function PaypalButton({ products,dispatch, typePayment,setChoosedProducts,  typeOfPayment, codeDiscount, info, address, addressName }) {
    const [isAfter, setIsAfter] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [price, description] = useMemo(() => {
        return products.reduce(
            (first, item, index) => {
                return [first[0] + item.price * item.number, `${first[1]} ${item.idProduct.name} - ${item.color},`];
            },
            [0, ''],
        );
    }, [JSON.stringify(products)]);

    useEffect(() => {
        if (isAfter) {
            typePayment('after');
        }
        setIsAfter(true);
    }, [price]);

    async function convertVNDToUSD(vnd) {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/VND');
        const data = await res.json();

        const rate = data.rates.USD;
        return (vnd * rate).toFixed(2);
    }

    const create = async (data, actions) => {
        const priceUSD = await convertVNDToUSD(price);
        return actions.order.create({
            purchase_units: [
                {
                    amount: {
                        value: priceUSD,
                    },
                    description: description,
                },
            ],
        });
    };

    console.log(products,dispatch, typePayment,setChoosedProducts, typeOfPayment, codeDiscount, info, address, addressName );
    

    return (
        <>
            <NotifyContainer />

            <PayPalButtons
                style={{
                    color: 'silver',
                    shape: 'pill',
                    tagline: false,
                    width: 200,
                    height: 45,
                    layout: 'horizontal',
                }}
                createOrder={(data, actions) => {
                    return create(data, actions);
                }}
                onApprove={async (data, actions) => {
                    const newData = products.map((item) => {
                        return {
                            productId: item?.idProduct?._id,
                            variantId: item?.variantId?._id || item?.variantId,
                            number: item?.number,
                            _id: item?._id,
                        };
                    });
    
                    console.log(info);
                    
                    
                    const response = await payment(newData, typeOfPayment, codeDiscount, info, address, addressName);

                    // console.log(success);
                    

                    if (response) {
                        notify('success', 'Thanh toán thành công');
                        setChoosedProducts([]);
                        dispatch({ key: CART, value: response });
                    } else {
                        notify('warning', 'Đã xãy ra lỗi! Vui lòng kiểm tra lại');
                    }
                    // return actions.order.capture().then(async (details) => {

                    // });
                }}
                onError={(error) => {
                    // Xử lý lỗi trong quá trình thanh toán
                    notify('error', 'Thanh toán không thành công');
                    console.log(error);
                }}
            />
        </>
    );
}

export default PaypalButton;
