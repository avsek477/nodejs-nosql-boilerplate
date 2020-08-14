(() => {
    "use strict";

    const HTTPStatus = require("http-status");
    const commonHelper = require("../../../common/common-helper-function");

    module.exports = async (req, res, next) => {
        try {
            const captchaObj = await req.db.collection('CaptchaTracker').findOne({ip_address: req.client_ip_address});
            return commonHelper.sendJsonResponse(res, {
                captcha_enable: (captchaObj) ? true : false
            }, '', HTTPStatus.OK);
        } catch(err) {
            return next(err);
        }
    }
})()