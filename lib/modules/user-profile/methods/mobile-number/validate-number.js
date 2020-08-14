(() => {
    "use strict";

    const HTTPStatus = require("http-status");
    const { ObjectId } = require("mongodb");
    const commonHelper = require("../../../../common/common-helper-function");
    const moduleConfig = require("../../config");

    module.exports = async(req, res, next) => {
        try {
            const queryOpts = {
                sms_token: req.body.sms_token,
                expires: {
                    "$gte": new Date()
                },
                user_id: commonHelper.getLoggedInUserId(req),
                expired: false
            };

            const tokenInfo = await req.db.collection('SMSTokens').findOne(queryOpts);
            if (!tokenInfo) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.NOT_FOUND,
                    message: moduleConfig.message.notFoundSms
                });
            }
            const userQueryOpts = {
                _id: ObjectId(commonHelper.getLoggedInUserId(req)),
            };
            const updateOpts = {
                $set: {
                    mobile_number_validated: true
                }
            };
            const userRes = await req.db.collection(moduleConfig.config.database).updateOne(userQueryOpts, updateOpts);
            if (userRes.result.n > 0) {
                const dataRes = await req.db.collection('SMSTokens').updateOne({sms_token: req.body.sms_token}, {
                    $set: {
                        expired: true,
                        used: true,
                        verified: true
                    }
                });
                return commonHelper.sendResponseMessage(res, userRes, null, moduleConfig.message.mobileValidationSuccess);
            }
        } catch(err) {
            return next(err);
        }
    }
})()