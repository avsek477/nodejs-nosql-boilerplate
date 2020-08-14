const { body } = require('express-validator');
const moduleConfig = require('./config');
const commonHelper = require("../../common/common-helper-function");

const registerNewUserValidatorArray = [
    body('email', moduleConfig.message.validationErrMessage.emailValid).isEmail()
        .customSanitizer(value => {
            return value.trim().toLowerCase();
        })
        .custom(async(value, {req}) => {
            const emailCount = await req.db.collection("User").countDocuments({
                email: value,
                deleted: false
            });
            if (emailCount > 0) {
                return Promise.reject();
            }
        }).withMessage(moduleConfig.message.alreadyExistsEmail),
    body('first_name', moduleConfig.message.validationErrMessage.firstName).not().isEmpty().isString()
        .customSanitizer(value => {
            return commonHelper.capitalizeFirstLetterOfEachWord(value);
        }),
    body('first_name', moduleConfig.message.validationErrMessage.firstNameMaxLength).matches(/^[a-zA-Z. ]{1,50}$/, "i"),
    body('first_name', moduleConfig.message.validationErrMessage.firstNameCannotContainSpecialCharacters).not().matches(/[!@#$%^&*()?":{}|<>]/, "i"),
    body('last_name', moduleConfig.message.validationErrMessage.lastName).not().isEmpty()
        .customSanitizer(value => {
            return commonHelper.capitalizeFirstLetterOfEachWord(value);
        }),
    body('last_name', moduleConfig.message.validationErrMessage.lastNameMaxLength).matches(/^[a-zA-Z. ]{1,50}$/, "i"),
    body('last_name', moduleConfig.message.validationErrMessage.lastNameCannotContainSpecialCharacters).not().matches(/[!@#$%^&*()?":{}|<>]/, "i"),
    body('password', moduleConfig.message.validationErrMessage.invalidPassword).matches(moduleConfig.config.passwordRegex),
    body('country_code', moduleConfig.message.validationErrMessage.countryCode).optional({ checkFalsy: true }).matches(/^\+\d{1,4}$/),
    body('mobile_number', moduleConfig.message.validationErrMessage.mobileNumber).optional({ checkFalsy: true }).matches(/^\d{7,10}$/)
        .if((value, { req }) => req.body.mobile_number)
        .custom(async(value, { req }) => {
            const mobileNumberCount = await req.db.collection("User").countDocuments({
                mobile_number: value,
                deleted: false
            });
            if (mobileNumberCount > 0) {
                return Promise.reject();
            }
        }).withMessage(moduleConfig.message.alreadyExistsSignupMobileNumber),
    body('user_role', moduleConfig.message.validationErrMessage.user_role).not().isEmpty()
        .isString()
        .custom(async(value, { req }) => {
            const roleCount = await req.db.collection("Role").countDocuments({
                role_name: value
            });
            if (roleCount === 0) {
                return Promise.reject();
            }
        }).withMessage(moduleConfig.message.validationErrMessage.userRoleDoesntExists)
];

const updateUserValidatorArray = [
    body('first_name', moduleConfig.message.validationErrMessage.firstName).not().isEmpty()
        .customSanitizer(value => {
            return commonHelper.capitalizeFirstLetterOfEachWord(value);
        }),
    body('first_name', moduleConfig.message.validationErrMessage.firstNameMaxLength).matches(/^[a-zA-Z. ]{1,50}$/, "i"),
    body('first_name', moduleConfig.message.validationErrMessage.firstNameCannotContainSpecialCharacters).not().matches(/[!@#$%^&*()?":{}|<>]/, "i"),
    body('last_name', moduleConfig.message.validationErrMessage.lastName).not().isEmpty()
        .customSanitizer(value => {
            return commonHelper.capitalizeFirstLetterOfEachWord(value);
        }),
    body('last_name', moduleConfig.message.validationErrMessage.lastNameMaxLength).matches(/^[a-zA-Z. ]{1,50}$/, "i"),
    body('last_name', moduleConfig.message.validationErrMessage.lastNameCannotContainSpecialCharacters).trim().not().matches(/[!@#$%^&*()?":{}|<>]/, "i"),
    body('country_code', moduleConfig.message.validationErrMessage.countryCode).optional({ checkFalsy: true }).matches(/^\+\d{1,4}$/),
    body('mobile_number', moduleConfig.message.validationErrMessage.mobileNumber).optional({ checkFalsy: true }).matches(/^\d{7,10}$/),
    body('dob', moduleConfig.message.validationErrMessage.dobRequired).optional({ checkFalsy: true }).isISO8601(),
    body('gender', moduleConfig.message.validationErrMessage.gender).optional({ checkFalsy: true }).isIn(["M", "F", "O"]),
    body('user_role', moduleConfig.message.validationErrMessage.user_role).not().isEmpty()
        .isString()
        .custom(async(value, { req }) => {
            const roleCount = await req.db.collection("Role").countDocuments({
                role_name: value
            });
            if (roleCount === 0) {
                return Promise.reject();
            }
        }).withMessage(moduleConfig.message.validationErrMessage.userRoleDoesntExists)
];

const forgotPasswordValidatorArray = [
    body('email', moduleConfig.message.validationErrMessage.email).not().isEmpty(),
    body('email', moduleConfig.message.validationErrMessage.emailValid).isEmail()
];

const resendConfirmationValidatorArray = [
    body('email', moduleConfig.message.validationErrMessage.email).not().isEmpty(),
    body('email', moduleConfig.message.validationErrMessage.emailValid).isEmail()
];

const changePasswordValidatorArray = [
    body('password', moduleConfig.message.validationErrMessage.password).not().isEmpty().isString()
];

const changePasswordWhileAuthenticatedValdatorArray = [
    body('password', moduleConfig.message.validationErrMessage.password).not().isEmpty(),
    body('old_password', moduleConfig.message.validationErrMessage.passwordOld).not().isEmpty()
];

const securityQaValidatorArray = [
    body('security_question', moduleConfig.message.validationErrMessage.security_question).not().isEmpty(),
    body('security_answer', moduleConfig.message.validationErrMessage.security_answer).not().isEmpty()
];

const sendMobileValidationTokenArray = [
    body('country_code', moduleConfig.message.validationErrMessage.countryCode).not().isEmpty(),
    body('mobile_number', moduleConfig.message.validationErrMessage.mobileNumber).matches(/^\d{10}$/)
];

const smsTokenVerifyValidatorArray = [
    body('sms_token', moduleConfig.message.validationErrMessage.notValidSmsToken).isLength({ min: moduleConfig.config.mobile_token_length, max: moduleConfig.config.mobile_token_length })
]

module.exports = {
    forgotPasswordValidatorArray,
    changePasswordValidatorArray,
    registerNewUserValidatorArray,
    updateUserValidatorArray,
    changePasswordWhileAuthenticatedValdatorArray,
    securityQaValidatorArray,
    sendMobileValidationTokenArray,
    smsTokenVerifyValidatorArray,
    resendConfirmationValidatorArray
}