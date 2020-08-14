(() => {
    'use strict';

    module.exports = {
        siteKey: process.env.RECAPTCHA_SITE_KEY,
        secretKey: process.env.RECAPTCHA_SECRET_KEY,
        siteUrl: 'https://www.google.com/recaptcha/api/siteverify'
    };

})();




