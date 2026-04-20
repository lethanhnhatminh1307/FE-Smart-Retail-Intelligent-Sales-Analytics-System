import Header from '~/Component/header';
import Footer from '~/Component/footer';
import styles from './styles.module.scss';
import Begin from '~/begin';
import classNames from 'classnames/bind';
import { Outlet, useLocation } from 'react-router-dom';
import { useTransition } from 'react';


const cx = classNames.bind(styles);

function DefaultLayout({ children }) {
    const path = useLocation()
    
    const nothasLayout = !path.pathname.includes('/account')

    console.log(nothasLayout);
    
    
    return (
        <div className={cx('wrapper-contain')}>
            {nothasLayout && <div className={cx('begin')}>
                <Begin />
            </div>}
            <div className={cx('wrapper')}>
                <div className={cx('contain')}>
                    {/* {nothasLayout && <Header />} */}
                    <div className={cx('main')}>{children}</div>
                    {/* {nothasLayout && <Footer />} */}
                </div>
            </div>
        </div>
    );
}

export default DefaultLayout;
