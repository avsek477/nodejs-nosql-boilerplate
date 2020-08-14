const loginRoutes = (() => {

    'use strict';

    const HTTPStatus = require('http-status');
    const passport = require('passport');
    const express = require('express');
    const loginRouter = express.Router();
    const moduleConfig = require('./config');
    const userMessageConfig = require('../user-profile/config');
    const ipBlockerController = require('../ip-blocker');
    const mobileIdentifierController = require('../mobile-identiifer');
    const commonHelper = require('../../common/common-helper-function');
    require('../../auth/passport-auth');

    const respondLoginMessage = async (req, res, next) => {
      let loginStatus = await req.loginStatusMessage;
      req.userInfo = loginStatus && loginStatus.userInfo;
      if (loginStatus) {
        if (loginStatus.success === true) {
          return commonHelper.sendDataManipulationMessage(res, loginStatus, moduleConfig.message.loggedIn, HTTPStatus.OK);
        } else {
          const returnObj = {
            success: false,
          };
          if (loginStatus.captcha_enable) {
            returnObj.captcha_enable = true;
          }
          return commonHelper.sendDataManipulationMessage(res, returnObj, loginStatus ? loginStatus.message : "", req.loginStatusMessage ? req.loginStatusMessage.status : HTTPStatus.UNAUTHORIZED);
        }
      } else {
        return commonHelper.sendResponseData(res, {
          status: HTTPStatus.UNAUTHORIZED,
          message: {
            message: moduleConfig.message.invalidMessage,
            success: false,
          },
        });
      }
  };

  const checkValidationError = (req, res, next) => {
    if (req.body && req.body.email) {
      if (req.body.password) {
        next();
      } else {
        return commonHelper.sendResponseData(res, {
          status: HTTPStatus.BAD_REQUEST,
          message: {
            message: userMessageConfig.message.validationErrMessage.password,
            success: false,
          },
        });
      }
    } else {
      return commonHelper.sendResponseData(res, {
        status: HTTPStatus.BAD_REQUEST,
        message: {
          message: userMessageConfig.message.validationErrMessage.email,
          success: false,
        },
      });
    }
  };

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

  const checkIpBlockStatus = async (req, res, next) => {
    try {
      const blocked = await ipBlockerController.checkBlockedExpiryStatus(
        req,
        req.client_ip_address,
        req.body.email,
        next,
      );
      if (blocked) {
        return commonHelper.sendResponseData(res, {
          status: HTTPStatus.FORBIDDEN,
          message: {
            message: moduleConfig.message.ipBlocked,
            success: false,
          },
        });
      } else {
        next();
      }
    } catch (err) {
      return next(err);
    }
  };

  loginRouter.route('/login/').post(
    // checkParallizeLoginStatus,
    checkValidationError,
    checkIpBlockStatus,
    detectMobileDevice,
    passport.authenticate('local-login', {
      session: false,
    }),
    respondLoginMessage,
  );

  return loginRouter;
})();

module.exports = loginRoutes;
