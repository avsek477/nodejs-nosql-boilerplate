(() => {
    "use strict";

    const HTTPStatus = require("http-status");
    const Promise = require("bluebird");
    const redisHelper = require("./redis");

    module.exports = async (req, mobile_number) => {
        try {
            const redisResendOtpId = `resend:${mobile_number}`;
            const resentOtpCount = await redisHelper.getHashKeyData(req, redisResendOtpId, "count");
            const existingCount = resentOtpCount ? +resentOtpCount : 0;
            if (existingCount < 3) {
                const twentyFourHoursLaterTime = new Date();
                twentyFourHoursLaterTime.setHours(twentyFourHoursLaterTime.getHours() + 24);
                redisHelper.setHashKeyData(req, redisResendOtpId, "count", existingCount+1);
                redisHelper.setHashKeyData(req, redisResendOtpId, "expires_on", twentyFourHoursLaterTime.toString());
                return Promise.resolve({
                    success: true
                })
            } else {
                const expiresOn = await redisHelper.getHashKeyData(req, redisResendOtpId, "expires_on");
                if (new Date() < new Date(expiresOn)) {
                    return Promise.resolve({
                        success: false,
                        status: HTTPStatus.CONFLICT,
                        message: "Your number has been blocked for sending sms many times. Please try again 24 hours later."
                    });
                }
                redisHelper.setHashKeyData(req, redisResendOtpId, "count", 0);
                return Promise.resolve({
                    success: true
                })
            }
        } catch (err) {
            return Promise.resolve({
                success: false,
                status: HTTPStatus.INTERNAL_SERVER_ERROR,
                message: err.message
            });
        }
    }
})()