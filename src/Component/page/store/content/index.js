import styles from './styles.module.scss';
import classNames from 'classnames/bind';
import Card from '~/card';
import * as productServer from '~/api-server/productServer';
import { useEffect, useState } from 'react';
import { useLocation, useParams, useSearchParams, useNavigate } from 'react-router-dom';

import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

const cx = classNames.bind(styles);
function Content() {
    const [data, setData] = useState([]);
    const location = useLocation();
    const params = useParams().slug;
    const [searchParams] = useSearchParams();

    // navigate
    const navigate = useNavigate();

    // sort
    const column = searchParams.get('column');
    const type = searchParams.get('type');
    const isSort = searchParams.get('_sort');

    const handleClickBought = (item, e) => {
        navigate('/bought-at-store', { state: { product: item } });
    };

    useEffect(() => {
        (async function () {
            const data = params
                ? await productServer.getType(params, { column: column, type: type, _sort: isSort })
                : await productServer.product(location.state?.nameFind || '', {
                      column: column,
                      type: type,
                      _sort: isSort,
                  });
            if (data) setData(data);
        })();
    }, [location.state?.nameFind, params, column, type]);

    return (
        <div className={cx('wrapper')}>
            {data.map((item, index) => {
                let image = item.image.find((img) => !img?.includes('.mp4'));
                if (!image) {
                    image = item.image[0];
                }
                return (
                    <div key={index} className={cx('contain-card')}>    
                        <Card
                            href={`/san-pham/${item.slug}`}
                            src={image}
                            alt={item.name}
                            name={item.name}
                            cost={item.price}
                        />
                    </div>
                );
            })}
        </div>
    );
}

export default Content;
