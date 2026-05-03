import styles from './styles.module.scss';
import classNames from 'classnames/bind';
import avatar from '~/media/image/model/nguoi-mau-01.png';
import Slider from 'react-slick';
import { useRef, useEffect, useState } from 'react';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const cx = classNames.bind(styles);

function ContainFeedback() {
    const [width, setWidth] = useState();
    const wrapperRef = useRef();
    const settings = {
        // arrow:true,
        // dots: true,
        speed: 1000,
        // className: 'slider variable-width',
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
    };
    return (
        <div ref={wrapperRef} className={cx('wrapper-slider')}>
            {/* <div className={cx('contain-slider')}> */}
            <Slider {...settings}>
                <div className={cx('wrapper')}>
                    <div className={cx('contain')}>
                        <img className={cx('avatar')} src={avatar} alt={'avatar'} />
                        <div className={cx('feedback')}>
                            <p className={cx('description')}>
                                Tôi rất hài lòng với trải nghiệm mua sắm trên SmartShop. Sản phẩm chất lượng, giao hàng nhanh chóng và dịch vụ chăm sóc khách hàng tuyệt vời. Chắc chắn sẽ quay lại mua thêm!
                            </p>
                        </div>
                        <h4 className={cx('name-of-feedbacker')}>
                            Nguyễn Minh Anh
                            <span className={cx('application')}> / Khách hàng thân thiết</span>
                        </h4>
                    </div>
                </div>
                <div className={cx('wrapper')}>
                    <div className={cx('contain')}>
                        <img className={cx('avatar')} src={avatar} alt={'avatar'} />
                        <div className={cx('feedback')}>
                            <p className={cx('description')}>
                                SmartShop có đa dạng sản phẩm từ điện tử đến thời trang. Giá cả hợp lý, nhiều chương trình khuyến mãi hấp dẫn. Đặc biệt giao diện dễ sử dụng, tìm kiếm sản phẩm rất thuận tiện.
                            </p>
                        </div>
                        <h4 className={cx('name-of-feedbacker')}>
                            Trần Hoàng Long
                            <span className={cx('application')}> / Người dùng mới</span>
                        </h4>
                    </div>
                </div>
                <div className={cx('wrapper')}>
                    <div className={cx('contain')}>
                        <img className={cx('avatar')} src={avatar} alt={'avatar'} />
                        <div className={cx('feedback')}>
                            <p className={cx('description')}>
                                Mua sắm trên SmartShop là sự lựa chọn tuyệt vời. Sản phẩm chính hãng 100%, đóng gói cẩn thận. Tôi đã giới thiệu cho bạn bè và gia đình cùng trải nghiệm!
                            </p>
                        </div>
                        <h4 className={cx('name-of-feedbacker')}>
                            Lê Thị Hồng Nhung
                            <span className={cx('application')}> / Khách hàng VIP</span>
                        </h4>
                    </div>
                </div>
            </Slider>
            {/* </div > */}
        </div>
    );
}

export default ContainFeedback;
