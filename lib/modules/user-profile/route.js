const userRoutes = (() => {
    'use strict';

    const express = require('express');
    const userRouter = express.Router();
    const moduleConfig = require('./config');
    const userController = require('./index');
    const commonHelper = require('../../common/common-helper-function');
    const tokenAuthMiddleware = require('../../middlewares/token-authentication');
    const roleAuthMiddleware = require('../../middlewares/role-authorization');
    const fileUploadHelper = require('../../helpers/file-upload')(moduleConfig.config.uploadPrefix);
    const uploader = fileUploadHelper.imageUploader;
    const mobileIdentifierController = require('../mobile-identiifer');
    const { 
        forgotPasswordValidatorArray, 
        changePasswordValidatorArray, 
        registerNewUserValidatorArray,
        updateUserValidatorArray,
        changePasswordWhileAuthenticatedValdatorArray,
        securityQaValidatorArray,
        sendMobileValidationTokenArray,
        smsTokenVerifyValidatorArray,
        resendConfirmationValidatorArray
    } = require("./validation");

    const detectMobileDevice = async (req, res, next) => {
        try {
            if (req.query && req.query.device_identifier && req.query.unique_identifier) {
                const count = await mobileIdentifierController.checkMobileIdentifierToken(req);
                if (count > 0) {
                    req.mobil_detection = true;
                }
            }
            next();
        } catch (err) {
            return next(err);
        }
    };

    userRouter.route('/change-profile-picture')
        .patch(tokenAuthMiddleware.authenticate, uploader.single('profile'), userController.updateProfilePicture);

    userRouter.route('/data')
        .get(tokenAuthMiddleware.authenticate, roleAuthMiddleware.authorize, userController.getAllUsers)
        .post(uploader.single('profile'), registerNewUserValidatorArray, commonHelper.validateFormFields, userController.registerUser);

    userRouter.route('/data/:userId')
        .get(tokenAuthMiddleware.authenticate, userController.getUserByID)
        .patch(tokenAuthMiddleware.authenticate, roleAuthMiddleware.authorize, userController.deleteUserByID)
        .put(tokenAuthMiddleware.authenticate, updateUserValidatorArray, commonHelper.validateFormFields, userController.updateUser);

    userRouter.route('/security-settings/change-password/:userId')
        .put(tokenAuthMiddleware.authenticate, changePasswordWhileAuthenticatedValdatorArray, commonHelper.validateFormFields, userController.changePassword);

    // userRouter.route('/security-settings/modify-security-answer/:userId')
    //     .put(tokenAuthMiddleware.authenticate, roleAuthMiddleware.authorize, securityQaValidatorArray, userController.changeSecurityAnswer);

    userRouter.route('/security-settings/reset-password-link')
        .post(forgotPasswordValidatorArray, commonHelper.validateFormFields, userController.requestPasswordChange);

    userRouter.route('/change-password/confirm/:token')
        .post(changePasswordValidatorArray, commonHelper.validateFormFields, userController.implementForgotPasswordAction);

    userRouter.route('/resend-confirm-email-user')
        .post(resendConfirmationValidatorArray, commonHelper.validateFormFields, userController.resendConfirmationEmailNoLogin);

    userRouter.route('/suspend/:userId')
        .put(tokenAuthMiddleware.authenticate, roleAuthMiddleware.authorize, userController.suspendUser);

    userRouter.route('/sms/verification-token')
        .post(tokenAuthMiddleware.authenticate, userController.sendMobileValidationToken)

    userRouter.route('/validate/number')
        .post(tokenAuthMiddleware.authenticate, smsTokenVerifyValidatorArray, commonHelper.validateFormFields, userController.validateMobileNumber);

    userRouter.route('/check/captcha')
        .get(userController.checkReCaptchaEnable);

    userRouter.route('/logout')
        .delete(detectMobileDevice, tokenAuthMiddleware.authenticate, userController.logOut);

    userRouter.route('/block')
        .post(tokenAuthMiddleware.authenticate, roleAuthMiddleware.authorize, userController.blockUser);

    userRouter.route('/unblock')
        .post(tokenAuthMiddleware.authenticate, roleAuthMiddleware.authorize, userController.unblockUser);

    return userRouter;

})();

module.exports = userRoutes;
