import styles from './styles.module.scss';
import classNames from 'classnames/bind';
import Card from '~/card';
import * as productServer from '~/api-server/productServer';
import { useEffect, useState } from 'react';
import { useLocation, useParams, useSearchParams, useNavigate } from 'react-router-dom';

import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

const cx = classNames.bind(styles);

const ITEMS_PER_PAGE = 8;

function Content() {
    const [data, setData] = useState([]);
    const location = useLocation();
    const params = useParams().slug;
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // sort
    const column = searchParams.get('column');
    const type = searchParams.get('type');
    const isSort = searchParams.get('_sort');
    const currentPage = parseInt(searchParams.get('page')) || 1;

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
    }, [location.state?.nameFind, params, column, type, isSort]);

    // Tính toán phân trang
    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedData = data.slice(startIndex, endIndex);

    const handlePageChange = (pageNumber) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', pageNumber);
        navigate(`?${params.toString()}`, { state: location.state });
        window.scrollTo({
            top: 0,
            behavior: 'smooth', // có thể bỏ nếu không thích animation
        });
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            handlePageChange(currentPage - 1);
            window.scrollTo({
                top: 0,
                behavior: 'smooth', // có thể bỏ nếu không thích animation
            });
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            handlePageChange(currentPage + 1);
            window.scrollTo({
                top: 0,
                behavior: 'smooth', // có thể bỏ nếu không thích animation
            });
        }
    };

    // Hàm tạo danh sách các trang để hiển thị (với "..." nếu quá nhiều)
    const getPaginationPages = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];
        let l;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                range.push(i);
            }
        }

        range.forEach((i) => {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        });

        return rangeWithDots;
    };

    const paginationPages = getPaginationPages();

    return (
        <div className={cx('content-wrapper')}>
            <div className={cx('wrapper')}>
                {paginatedData.map((item, index) => {
                    let image = item?.variants?.[0]?.sku || '';
                    const price = item?.price || 0;

                    return (
                        <div key={index} className={cx('contain-card')}>
                            <Card
                                href={`/san-pham/${item.slug}`}
                                src={image}
                                alt={item.name}
                                name={item.name}
                                cost={price}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className={cx('pagination')}>
                    <button
                        className={cx('pagination-btn', { disabled: currentPage === 1 })}
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                    >
                        Trước
                    </button>

                    <div className={cx('pagination-numbers')}>
                        {paginationPages.map((page, index) =>
                            page === '...' ? (
                                <span key={index} className={cx('pagination-dots')}>
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={page}
                                    className={cx('pagination-number', { active: page === currentPage })}
                                    onClick={() => handlePageChange(page)}
                                >
                                    {page}
                                </button>
                            ),
                        )}
                    </div>

                    <button
                        className={cx('pagination-btn', { disabled: currentPage === totalPages })}
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                    >
                        Tiếp
                    </button>
                </div>
            )}
        </div>
    );
}

export default Content;
