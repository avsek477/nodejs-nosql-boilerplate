(() => {
    "use strict";

    const HTTPStatus = require("http-status");
    const hasher = require('../../../auth/hasher');
    const moduleConfig = require('../config');
    const smsConfig = require('../../../configs/sms');
    const smsHelper = require('../../../helpers/sms');
    const blockResendOtpHelper = require("../../../helpers/block-resend-otp");

    module.exports = async (req, res, next) => {
        try {
            const userDetails = await req.db.collection("User").findOne({
                country_code: req.body.country_code,
                mobile_number: req.body.mobile_number,
                deleted: false
            })
            if (!userDetails) {
                return res.status(HTTPStatus.NOT_FOUND).json({
                    status: HTTPStatus.NOT_FOUND,
                    message: moduleConfig.message.registeredMobileNumberRequired
                });
            }
            if (userDetails.mobile_number_validated) {
                return res.status(HTTPStatus.CONFLICT).json({
                    status: HTTPStatus.CONFLICT,
                    message: moduleConfig.message.mobile_number_validated
                });
            }
            const blockResp = await blockResendOtpHelper(req, userDetails.mobile_number);
            if (blockResp && !blockResp.success) {
                return res.status(blockResp.status).json({
                    status: blockResp.status,
                    message: blockResp.message
                });
            }
            const randomToken = await hasher.generateRandomBytes(moduleConfig.config.mobile_token_length);
            const smsTokenObj = {
                'sms_token': randomToken,
                'mobile_number': userDetails.mobile_number,
                'user_id': userDetails._id.toString(),
                'expires': new Date(new Date().getTime() + (1000 * 60 * 60 * moduleConfig.config.token_expiry_date_in_mins)),
                'used': false,
                'expired': false,
                'added_on': new Date()
            };
            const dataRes = await req.db.collection('SMSTokens').insertOne(smsTokenObj);
            if (dataRes.result.n > 0) {
                const message = smsConfig.sms_message_verification;
                const message_sms = (message.indexOf("%verification_token%") > -1) ? message.replace("%verification_token%", randomToken) : message;
    
                const smsRes = await smsHelper.sendSMS(`${userDetails.country_code}${userDetails.mobile_number}`, message_sms);
                if (smsRes) {
                    await req.db.collection('User').updateOne({_id: userDetails._id}, {
                        $set: {
                            'sms_sent': true
                        }
                    });
                    return res.status(HTTPStatus.OK).json({
                        status: HTTPStatus.OK,
                        message: moduleConfig.message.sms_sent
                    });
                } else {
                    return res.status(HTTPStatus.BAD_REQUEST).json({
                        status: HTTPStatus.BAD_REQUEST,
                        message: moduleConfig.message.sms_error
                    });
                }
            }
        } catch (err) {
            return next(err);
        }
    }
})()