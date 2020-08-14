(() => {
    "use strict";

    const HTTPStatus = require("http-status");
    const Promise = require("bluebird");
    const captchaHelper = require("../../../../helpers/recaptcha");
    const commonHelper = require("../../../../common/common-helper-function");
    const utilityHelper = require("../../../../helpers/utilities");
    const messageConfig = require("../../../../configs/message");
    const moduleConfig = require("../../config");
    const hasher = require("../../../../auth/hasher");
    const userConfirmationTokenController = require("../../../user-confirmation")
    
    const registerUserFields = 'first_name last_name email user_role mobile_number country_code';

    const constructUserObj = async (req, res, newUser, modelInfo, password) => {
        const saltPassword = await hasher.createSalt();
        const hashPassword = await hasher.computeHash(req, res, password, saltPassword);
        newUser.password = hashPassword;
        newUser.password_salt = saltPassword;
        newUser.email = modelInfo.email;
        newUser.multi_factor_auth_enable = false;
        newUser.multi_factor_auth_enable_mobile = false;
        newUser.security_question = modelInfo.security_question || '';
        newUser.security_answer = modelInfo.security_answer || '';
        newUser.user_role = modelInfo.user_role;
        newUser.suspend = false;
        newUser.deleted = false;
        newUser.blocked = false;
        newUser.confirmed = false;
        newUser.mobile_number_validated = false;
        newUser.email_validated = false;
        newUser.has_changed_password = false;
        newUser.has_changed_security_answer = false;
        return newUser;
    }

    const handleNewUserRegistration = async (req, res, modelInfo, next) => {
        try {
            if (req.body.email && commonHelper.checkDisposableEmail(req.body.email.trim())) {
                return Promise.resolve({
                    status: HTTPStatus.BAD_REQUEST,
                    message: moduleConfig.message.disposableEmail
                });
            }
            const pwd = req.body.password ? req.body.password : await hasher.generateRandomBytes(moduleConfig.config.pwd_length);
    
            let newUser = commonHelper.collectFormFields(req, modelInfo, registerUserFields);
            newUser = await constructUserObj(req, res, newUser, modelInfo, pwd);
            if(req.file && req.file.fieldname === "profile") {
                newUser.image_path = req.file.path;
                newUser.image_name = req.file.originalname;
                newUser.image_mimetype = req.file.mimetype;
            } else {
                newUser.image_path = "";
                newUser.image_name = "";
                newUser.image_mimetype = "";
            }
            const registerRes = await req.db.collection(moduleConfig.config.database).insertOne(newUser);
            if (registerRes.result.n > 0) {
                if (newUser.email) {
                    userConfirmationTokenController.sendEmailToUser(req, res, newUser, false, modelInfo.password ? true : false, pwd, next);
                }
                delete newUser.password;
                delete newUser.password_salt;
                return Promise.resolve({
                    status: HTTPStatus.OK,
                    message: moduleConfig.message.saveMessage,
                    data: newUser
                });
            } else {
                return Promise.resolve({
                    status: HTTPStatus.INTERNAL_SERVER_ERROR,
                    message: moduleConfig.message.saveMessageFailure,
                });
            }
        } catch(err) {
            return next(err);
        }
    }

    module.exports = async(req, res, next) => {
        try {
            const captchaRes = await captchaHelper.verifyHuman(req, next);
            if (captchaRes && captchaRes.success === false) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.UNAUTHORIZED,
                    message: messageConfig.captchaVerify.notHuman
                })
            } else {
                const modelInfo = utilityHelper.sanitizeUserInput(req, next);
                const dataRes = await handleNewUserRegistration(req, res, modelInfo, next);
                if (dataRes && dataRes.data) {
                    return commonHelper.sendJsonResponse(res, dataRes, dataRes.message, dataRes.status);
                } else {
                    return commonHelper.sendResponseData(res, {
                        status: dataRes.status,
                        message: dataRes.message
                    });
                }
            }
        } catch(err) {
            return next(err);
        }
    }
})()