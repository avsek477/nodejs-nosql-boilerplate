const multiFactorAuthRoutes = (() => {
  'use strict';

  const HTTPStatus = require('http-status');
  const express = require('express');
  const multiFactorAuthRouter = express.Router();
  const moduleConfig = require('./config');
  const multiFactorAuthHelper = require('../../helpers/multi-factor-auth');
  const multiFactorAuthController = require('./index');
  const commonHelper = require('../../common/common-helper-function');
  const tokenAuthMiddleware = require('../../middlewares/token-authentication');
  const roleAuthMiddleware = require('../../middlewares/role-authorization');
  const { resendOtpCodeMobileLogin, validate } = require("./validation");
  //method declaration to setup time based one time password authentication mechanism / two-factor or multifactor authentication mechanism,
  // if successfull, then returns time based one time password object i.e value for QR code, else return not found message

  const getTOTPSecret = async (req, res, next) => {
    try {
      const totpObj = await multiFactorAuthHelper.generateMultiFactorAuthCode(req);
      return commonHelper.sendJsonResponse(res, totpObj, moduleConfig.message.notFound, HTTPStatus.OK);
    } catch (err) {
      return next(err);
    }
  };

  const getRecoveryCodes = async (req, res, next) => {
    try {
      const recoveryCodes = await multiFactorAuthController.getRecoveryCodes(req);
      return commonHelper.sendNormalResponse(res, recoveryCodes, HTTPStatus.OK);
    } catch (err) {
      return next(err);
    }
  };

  multiFactorAuthRouter.route('/totp-setup')
    .get( tokenAuthMiddleware.authenticate, getTOTPSecret); //roleAuthMiddleware.authorize,

  multiFactorAuthRouter.route('/recovery-code/get')
    .get( tokenAuthMiddleware.authenticate, getRecoveryCodes ); //roleAuthMiddleware.authorize,

  multiFactorAuthRouter.route('/mobile/totp-setup')
    .get( tokenAuthMiddleware.authenticate, multiFactorAuthController.generateMobileMultiFactorAuthCode); //roleAuthMiddleware.authorize,

  multiFactorAuthRouter.route('/totp-disable/:userId')
    .put( tokenAuthMiddleware.authenticate, multiFactorAuthController.disableTwoFactorAuthentication); //roleAuthMiddleware.authorize,
    
  multiFactorAuthRouter.route('/mobile/totp-disable/:userId')
    .put( tokenAuthMiddleware.authenticate, multiFactorAuthController.disableTwoFactorAuthenticationForMobile);
    
  multiFactorAuthRouter.route('/totp-verify')
    .post( tokenAuthMiddleware.authenticate, multiFactorAuthController.verifyTOTPSecret); //roleAuthMiddleware.authorize,

  multiFactorAuthRouter.route('/mobile/totp-verify')
    .post( tokenAuthMiddleware.authenticate, multiFactorAuthController.verifyMobileTOTPSecret); //roleAuthMiddleware.authorize,

  multiFactorAuthRouter.route('/totp-validate/:userId')
    .post( multiFactorAuthController.validateTOTPToken );

  multiFactorAuthRouter.route('/mobile/totp-validate/:userId')
    .post( multiFactorAuthController.validateMobileTOTPToken );

  multiFactorAuthRouter.route('/generate/recovery-code/:userId')
    .put( tokenAuthMiddleware.authenticate, multiFactorAuthController.generateRecoveryCode );

  multiFactorAuthRouter.route('/recovery-code/send/:userId')
    .get( multiFactorAuthController.sendRecoveryCodeForMultiFactorAuth );

  multiFactorAuthRouter.route('/mobile/resend-otp')
    .post(resendOtpCodeMobileLogin, validate, multiFactorAuthController.resendOtpCodeMobileLogin)

  return multiFactorAuthRouter;

})();

module.exports = multiFactorAuthRoutes;
