(() => {
    "use strict";

    const HTTPStatus = require("http-status");
    const moduleConfig = require("../../config");
    const resendEmailToConfirm = require("../../common/resend-confirmation-email");
    const commonHelper = require("../../../../common/common-helper-function");

    module.exports = async (req, res, next) => {
        try {
            const userObj = await req.db.collection("User").findOne({
                email: req.body.email,
                deleted: false
            })
            if (!userObj) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.NOT_FOUND,
                    message: moduleConfig.message.validationErrMessage.userEmailDoesntExists
                });
            }
            const resp = await resendEmailToConfirm(req, res, next, userObj);
            return commonHelper.sendResponseData(res, resp);
        } catch(err) {
            return next(err);
        }
    }
})()