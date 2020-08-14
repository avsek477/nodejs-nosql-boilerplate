const HTTPStatus = require("http-status");
const { ObjectId } = require("mongodb");
const { body, validationResult } = require('express-validator');
const commonHelper = require("../../common/common-helper-function");
const errorHelper = require("../../helpers/error");
const moduleConfig = require("./config");

const resendOtpCodeMobileLogin = [
    body("user_id", moduleConfig.message.validationErrMessage.userIdRequired).isMongoId()
    .customSanitizer(value => {
        return ObjectId(value);
    })
];

const validate = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();            
        }
        return commonHelper.sendResponseData(res, {
            status: HTTPStatus.BAD_REQUEST,
            message: errorHelper.sendFormattedErrorData(errors.array())
        });
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    resendOtpCodeMobileLogin,
    validate
}