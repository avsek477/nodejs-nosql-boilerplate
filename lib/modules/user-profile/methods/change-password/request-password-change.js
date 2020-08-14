(() => {
    "use strict";

    const HTTPStatus = require("http-status");
    const moduleConfig = require("../../config");
    const commonHelper = require("../../../../common/common-helper-function");
    const passwordChangeVerifyController = require("../../../password-change");

    module.exports = async (req, res, next) => {
        try {
            if (commonHelper.checkDisposableEmail(req.body.email.trim().toLowerCase())) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.BAD_REQUEST,
                    message: moduleConfig.message.disposableEmail
                });
            }
            const queryOpts = {
                email: req.body.email.trim().toLowerCase(),
                deleted: false
            };
            const userObj = await req.db.collection('User').findOne(queryOpts);
            if (!userObj) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.UNAUTHORIZED,
                    message: moduleConfig.message.notRegisteredEmail
                });
            }
            if (!userObj.confirmed) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.UNAUTHORIZED,
                    message: moduleConfig.message.accountNotConfirmed
                });
            }
            if (userObj.blocked) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.UNAUTHORIZED,
                    message: moduleConfig.message.blockMessage
                });
            }
            const emailRes = await passwordChangeVerifyController.sendEmailToConfirmPasswordChangeAction(req, res, userObj, next);

            return commonHelper.sendResponseData(res, {
                status: (emailRes && Object.keys(emailRes).length > 0) ? HTTPStatus.OK : HTTPStatus.SERVICE_UNAVAILABLE,
                message: (emailRes && Object.keys(emailRes).length > 0) ? moduleConfig.message.passwordChangeConfirmationEmail : moduleConfig.message.emailError
            });
        } catch(err) {
            return next(err);
        }
    }
})()