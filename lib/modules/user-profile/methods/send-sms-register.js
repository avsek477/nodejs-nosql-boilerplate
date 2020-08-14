(() => {
    "use strict";

    const HTTPStatus = require("http-status");
    const Promise = require("bluebird");
    const hasher = require('../../../auth/hasher');
    const moduleConfig = require('../config');
    const smsConfig = require('../../../configs/sms');
    const smsHelper = require('../../../helpers/sms');

    module.exports = async (req, userDetails) => {
        try {
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
                    return Promise.resolve({
                        status: HTTPStatus.OK,
                        message: moduleConfig.message.sms_sent
                    });
                } else {
                    return Promise.resolve({
                        status: HTTPStatus.BAD_REQUEST,
                        message: moduleConfig.message.sms_error
                    });
                }
            }
        } catch (err) {
            return null;
        }
    }
})()