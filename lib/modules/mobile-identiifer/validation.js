const HTTPStatus = require("http-status");
const { body, validationResult } = require('express-validator');
const moduleConfig = require('./config');
const commonHelper = require("../../common/common-helper-function");
const errorHelper = require("../../helpers/error");

const mobileIdentifierValidatorArray = [
    body('mobile_device', moduleConfig.validationErrMessage.mobileDeviceRequired).not().isEmpty(),
    body('device_identifier', moduleConfig.validationErrMessage.deviceIdentifierRequired).not().isEmpty()
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
    mobileIdentifierValidatorArray,
    validate
}