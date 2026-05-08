const { faEnvelope, faCopyright } = require('@fortawesome/free-regular-svg-icons');
const { faLocationDot, faPhone } = require('@fortawesome/free-solid-svg-icons');
const { FontAwesomeIcon } = require('@fortawesome/react-fontawesome');

export const contactAt = [
    {
        title: 'Liên Chiểu, Đà Nẵng',
        icon: <FontAwesomeIcon icon={faLocationDot} />,
    },
    {
        title: '0355644732',
        icon: <FontAwesomeIcon icon={faPhone} />,
    },
    {
        title: 'shops@gmail.com',
        icon: <FontAwesomeIcon icon={faEnvelope} />,
    },
    {
        title: 'SmartShop',
        icon: <FontAwesomeIcon icon={faCopyright} />,
    },
];
