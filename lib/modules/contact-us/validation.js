const HTTPStatus = require("http-status");
const { body, validationResult } = require('express-validator');
const moduleConfig = require('./config');
const commonHelper = require("../../common/common-helper-function");
const errorHelper = require("../../helpers/error");

const contactUsValidatorArray = [
    body('name', moduleConfig.validationErrMessage.nameRequired).not().isEmpty(),
    body('name', moduleConfig.validationErrMessage.nameCannotContainSpecialCharacters).not().matches(/[!@#$%^&*()?":{}|<>]/, "i"),
    body('email', moduleConfig.validationErrMessage.emailRequired).isEmail(),
    body('message', moduleConfig.validationErrMessage.messageRequired).not().isEmpty()
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
    contactUsValidatorArray,
    validate
}