(() => {
    "use strict";

    const { ObjectId } = require("mongodb");
    const HTTPStatus = require("http-status");
    const hasher = require("../../../../auth/hasher");
    const smsHelper = require("../../../../helpers/sms");
    const commonHelper = require("../../../../common/common-helper-function");
    const moduleConfig = require("../../config");
    const smsConfig = require("../../../../configs/sms");
    
    module.exports = async (req, res, next) => {
        try {
            const userObj = await req.db.collection('User').findOne({
                _id: ObjectId(commonHelper.getLoggedInUserId(req))
            });
            if (userObj.mobile_number_validated) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.CONFLICT,
                    message: moduleConfig.message.mobileNumberValidated
                });
            }
            if(!userObj.country_code || !userObj.mobile_number) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.CONFLICT,
                    message: moduleConfig.message.mobileNumberNotRegistered
                });
            } 
            const randomToken = await hasher.generateRandomBytes(moduleConfig.config.mobile_token_length);
            const smsTokenObj = {
                '_id': ObjectId(),
                'sms_token': randomToken,
                'user_id': commonHelper.getLoggedInUserId(req),
                'mobile_number': `${userObj.country_code}${userObj.mobile_number}`,
                'expires': new Date(new Date().getTime() + (1000 * 60 * 60 * moduleConfig.config.token_expiry_date_in_mins)),
                'used': false,
                'expired': false,
                'added_on': new Date()
            };
            const dataRes = await req.db.collection('SMSTokens').insertOne(smsTokenObj);
            if (dataRes.result.n > 0) {
                const message = smsConfig.sms_message_verification;
                const message_sms = (message.indexOf("%verification_token%") > -1) ? message.replace("%verification_token%", randomToken) : message;

                const smsRes = await smsHelper.sendSMS(`${userObj.country_code}${userObj.mobile_number}`, message_sms);
                if (smsRes) {
                    await req.db.collection('User').updateOne({_id: ObjectId(commonHelper.getLoggedInUserId(req))}, {
                        $set: {
                            'sms_sent': true
                        }
                    });
                    return commonHelper.sendResponseData(res, {
                        status: HTTPStatus.OK,
                        message: moduleConfig.message.smsSent
                    });
                } else {
                    return commonHelper.sendResponseData(res, {
                        status: HTTPStatus.BAD_REQUEST,
                        message: moduleConfig.message.smsError
                    });
                }
            }
        } catch(err) {
            return next(err);
        }
    }
})()