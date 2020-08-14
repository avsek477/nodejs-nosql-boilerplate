((twoFactorAuthenticator) => {
  'use strict';

  const HTTPStatus = require('http-status');
  const userAgent = require('useragent');
  const moduleConfig = require('../modules/multi-factor-auth/multi-factor-auth.config');
  const twoFactorAuthHelper = require('../helpers/multi-factor-auth.helper');
  const userController = require('../modules/user-profile/user-profile.controller');
  const utilityHelper = require('../helpers/utilities.helper');
  const authorizationTokenController = require('../modules/auth-token/auth-token-controller');
  const tokenConfigs = require('../configs/token.config');
  const jwtTokenGeneratorHelper = require('../helpers/jwt-token-generator.helper');
  const commonHelper = require('../../common/common-helper-function');

  twoFactorAuthenticator.validateTOTPToken = async (req, res, next) => {
    try {
      if (req.body.totp_token && req.params) {
        const userInfo = await userController.getUserByID(req, next);
        if (userInfo) {
          const verified = await twoFactorAuthHelper.verifyMultiFactorAuthCode(req, userInfo.multi_factor_auth_secret);
          if (verified) {
            req.loginStatusMessage = jwtTokenGeneratorHelper.generateJWTToken(req, userInfo);
            const user_agent = userAgent.lookup(req.headers['user-agent']);
            const ip_address = req.client_ip_address;
            const _hours = utilityHelper.removeCharFromString(tokenConfigs.expires, 'h');
            const tokenExpiryDate = new Date(new Date().getTime() + (parseInt(_hours) * 60 * 60 * 1000));
            const geoLocationObj = await commonHelper.getGeoLocationInfo(req.client_ip_address.toString());

            const dataRes = await authorizationTokenController.postAuthorizationTokenInfo(req,
              req.loginStatusMessage ? req.loginStatusMessage.token : '',
              user_agent,
              user_agent.family,
              user_agent.major,
              geoLocationObj ? geoLocationObj.country : '',
              geoLocationObj ? geoLocationObj.city : '',
              ip_address,
              tokenExpiryDate,
              userInfo._id, next);
            commonHelper.sendJsonResponseMessage(res, dataRes, req.loginStatusMessage, "");
          }
        }
      }
      return commonHelper.sendResponseData(res, {
        status: HTTPStatus.UNAUTHORIZED,
        message: moduleConfig.message.notVerified
      });
    } catch (err) {
      return next(err);
    }
  };

})(module.exports);