const loginController = (() => {
  'use strict';

  const HTTPStatus = require('http-status');
  const userAgent = require('useragent');
  const hasher = require('../../auth/hasher');
  const Promise = require('bluebird');
  const moduleConfig = require('./config');
  const tokenConfigs = require('../../configs/token');
  const ObjectId = require('mongodb').ObjectID;
  const commonHelper = require('../../common/common-helper-function');
  const utilityHelper = require('../../helpers/utilities');
  const jwtTokenGeneratorHelper = require('../../helpers/jwt-token-generator');
  const authTokenController = require('../auth-token');
  const userUnblockTokenController = require('../user-unblock');
  const ipBlockerController = require('../ip-blocker');
  const loggedInController = require('../login-logs');
  const userController =require('../user-profile');
  const multiFactorAuthController = require('../multi-factor-auth');
  const mobileIdentifierController = require('../mobile-identiifer');

  function LoginAuthModule () {}

  const _p = LoginAuthModule.prototype;

  _p.handleLoginOperation = async (req, user_id, userEmail, password, userObj, _email, done) => {
    //outputs the value in count
    //check to see if the user had previously continuously inputted the wrong combination of username and password more than specified times in config file
    //if true, then show the block message
    const login_attempt = await loggedInController.getFailedLoginAttemptCount(req, req.res, user_id);
    if (login_attempt <= moduleConfig.config.block_user_login_attempt) {
      const isMatch = await hasher.comparePassword(password, userObj.password);
      //check to see if the password matches and password cannot be empty string
      //if mismatch, post the record to the database
      let failed_login = true;
      if (isMatch) {
        // if user is found and password is right
        //log the user login details to the collection and after that if wrong  login Attempt is previously  more then zero, expired those records.
        failed_login = false;
        const valid_login = await _p.handleValidCredentials(req, userObj, user_id, login_attempt, failed_login, done);
        return Promise.resolve(valid_login);
      } else {
        // if password doesn't match then
        const invalid_login = await _p.handleWrongCredentialAction(req, user_id, login_attempt, userEmail, failed_login, userObj, _email, done)
        return Promise.resolve(invalid_login);
      }
    } else {
      const returnObj = {
        message: moduleConfig.message.blockMessage,
        blocked : true,
        status: HTTPStatus.FORBIDDEN
      };
      req.loginStatusMessage = returnObj;
      return Promise.resolve(returnObj);
    }
  };

  _p.handleValidCredentials = async (req, userObj, user_id, login_attempt, failed_login, done) => {
    try {
      const dataRes = await _p.handleUserLoginLog(req, user_id, login_attempt, failed_login, done);
      if (dataRes.result.n > 0) {
        if (login_attempt > 0) {
          loggedInController.updateLoggedInInfo(req, user_id);
        }
        if(!req.mobil_detection && utilityHelper.containsElementInArr(userObj.captcha_enable_ips, req.client_ip_address, done)) {
          const captchaRes = await req.db.collection('User').updateOne({_id: ObjectId(userObj._id)}, { $pull: { captcha_enable_ips: req.client_ip_address } });
          req.db.collection('CaptchaTracker').remove({ ip_address: req.client_ip_address });//, { justOne: true }
          userObj.captcha_enable = (captchaRes.result.n > 0) ? false : true;
          return Promise.resolve(await _p.handleLoginSuccessAction(req, userObj, done));
        } else {
          return Promise.resolve(await _p.handleLoginSuccessAction(req, userObj, done));
        }
      }
      return Promise.resolve(null);
    } catch(err) {
      return Promise.resolve(null);
    }
  };

  _p.handleLoginSuccessAction = async (req, userObj, next) => {
    try {
      let tokenExpiryDate;
      if(req.mobil_detection) {
        const _years = utilityHelper.removeCharFromString(tokenConfigs.mobileExpires, 'y');
        tokenExpiryDate = new Date(new Date().getTime() + (parseInt(_years) * 365 * 24 * 60 * 60 * 1000));
        await mobileIdentifierController.updateUserIdWithToken(req, userObj._id);
      } else {
        const _hours = utilityHelper.removeCharFromString(tokenConfigs.expires, 'h');
        tokenExpiryDate = new Date(new Date().getTime() + (parseInt(_hours) * 60 * 60 * 1000));
      }
      const user_agent = userAgent.lookup(req.headers['user-agent']);
      const geoLocationObj = await commonHelper.getGeoLocationInfo(req.client_ip_address.toString());

      if ((!userObj.multi_factor_auth_enable && !userObj.multi_factor_auth_enable_mobile) || (req.mobil_detection && !userObj.multi_factor_auth_enable_mobile)) {
        req.loginStatusMessage = await jwtTokenGeneratorHelper.generateJWTToken(req, userObj);
        const dataRes = await authTokenController.postAuthorizationTokenInfo(req, req.loginStatusMessage.token, user_agent, user_agent.family, user_agent.major, geoLocationObj ? geoLocationObj.country : '', geoLocationObj ? geoLocationObj.city : '', req.client_ip_address, tokenExpiryDate, req.loginStatusMessage.userInfo._id, next);
        return  (dataRes.result.n > 0) ? req.loginStatusMessage : null;
      }
      else if(req.mobil_detection && userObj.multi_factor_auth_enable_mobile) {
        const success = await multiFactorAuthController.sendMultiFactorMobileCode(req, userObj._id, userObj);
        if(success) {
          req.loginStatusMessage = {
            multi_factor_auth_enable_mobile: true,
            success: true,
            user_id: userObj._id
          };
        }else {
          return null;
        }
        return req.loginStatusMessage;
      }
      else {
        req.loginStatusMessage = {
          multi_factor_auth_enable: true,
          success: true,
          user_id: userObj._id
        };
        return req.loginStatusMessage;
      }
    }catch(err) {
      return null;
    }
  };

  _p.handleWrongCredentialAction = async (req, user_id, login_attempt, userEmail, failed_login, userObj, _email, done) => {
    try {
      const failedLoginAttempt = login_attempt + 1;
      const statusObj = {};
      //first log the failed login attempt to the collection
      const dataRes = await _p.handleUserLoginLog(req, user_id, login_attempt, failed_login, done);
      if (dataRes.result.n > 0) {
        //check to see if the failed login attempt is more than  max login attempt times,
        //if so, block the user and send the unblock token to the user's associated email address
        if (failedLoginAttempt > moduleConfig.config.block_user_login_attempt) {
          const userRes = await userController.blockUser(req, user_id);
          if(userRes.result.n > 0) {
            const emailRes = await userUnblockTokenController.sendEmailToUser(req, req.res, userObj, done);
            if(emailRes && Object.keys(emailRes).length > 0) {
              statusObj.status = HTTPStatus.FORBIDDEN;
              statusObj.message = moduleConfig.message.blockMessage;
            }
          }
        } else {
          if(!req.mobil_detection && (failedLoginAttempt === moduleConfig.config.captcha_enable_login_attempt ) && (failedLoginAttempt <= moduleConfig.config.block_ip_login_attempt_fixed_time)) {
            const captchaRes = await req.db.collection('User').updateOne(
              {_id: ObjectId(userObj._id)},
              { $push: { captcha_enable_ips: req.client_ip_address } } 
            );
            await req.db.collection('CaptchaTracker').insertOne({ip_address: req.client_ip_address, added_on: new Date()});

            if(captchaRes.result.n > 0) {
              statusObj.status = HTTPStatus.UNAUTHORIZED;
              statusObj.message = moduleConfig.message.captch_enable_message;
              statusObj.captcha_enable = true;
            }
          } else {
            if (failedLoginAttempt >= moduleConfig.config.block_ip_login_attempt_fixed_time) {
              const expiryDate = new Date();
              expiryDate.setMinutes(expiryDate.getMinutes() + moduleConfig.config.block_mins);
              const ipBlockerRes = await ipBlockerController.blockLoginIpAddress(req, req.client_ip_address, expiryDate, _email);
              statusObj.captcha_enable = true;
              if(ipBlockerRes.result.n > 0) {
                statusObj.message = moduleConfig.message.ipBlocked;
              }
            } else {
              if(!req.mobil_detection && (failedLoginAttempt > moduleConfig.config.captcha_enable_login_attempt)) {
                statusObj.captcha_enable = true;
              }
              statusObj.message = moduleConfig.message.invalidMessage;
            }
            statusObj.status = HTTPStatus.UNAUTHORIZED;
          }
        }
      }
      if(statusObj.status && statusObj.message) {
        const loginStatusMessage = {
          success: false,
          status: statusObj.status,
          message: statusObj.message,
          captcha_enable: statusObj.captcha_enable ? true : false
        };
        req.loginStatusMessage = loginStatusMessage;
        return loginStatusMessage;
      }
      return null;
    } catch(err) {
      return null;
    }
  };

  _p.handleUserLoginLog = async (req, user_id, login_attempt, failed_login, next) => {
    req.user_agent = userAgent.lookup(req.headers['user-agent']);
    req.user_agent.ip_address = req.client_ip_address;
    req.user_agent.loc = await commonHelper.getGeoLocationInfo(req.client_ip_address);//
    // req.user_agent.loc = await commonHelper.getGeoLocationInfo("192.168.200.214");//
    return loggedInController.postLoggedInData(req, req.res, user_id, login_attempt, failed_login, next);
  };

  _p.customErrorResponse = (req, res, { status, message }, done) => {
    const loginStatusMessage = {
      success: false,
      status: status,
      message: message
    };
    req.loginStatusMessage = loginStatusMessage;
    return done(null, loginStatusMessage);
  };

  _p.validateLoginCredentials = async (req, user, email, password, done) => {
    if (user.deleted || user.suspend) {
      return loginController.customErrorResponse(req, req.res, {
        status: HTTPStatus.UNAUTHORIZED,
        message: (user.suspend) ? moduleConfig.message.suspensionMessage : moduleConfig.message.invalidMessage
      }, done);
    }
    if (!user.confirmed){
      return loginController.customErrorResponse(req, req.res, {
        status: HTTPStatus.UNAUTHORIZED,
        message: moduleConfig.message.accountNotConfirmed
      }, done);
    }
    if (user.blocked) {
      return loginController.customErrorResponse(req, req.res, {
        status: HTTPStatus.UNAUTHORIZED,
        message: moduleConfig.message.blockMessage
      }, done);
    }
    let loginRes = await _p.handleLoginOperation(req, user._id, user.email, password, user, email, done);
    if(loginRes === null){
      loginRes = {
        success: false,
        status: HTTPStatus.UNAUTHORIZED,
        message: moduleConfig.message.invalidMessage
      };
    }
    return done(null, loginRes);
  };

  return {
    handleValidCredentials: _p.handleValidCredentials,
    handleWrongCredentialAction: _p.handleWrongCredentialAction,
    handleLoginOperation: _p.handleLoginOperation,
    customErrorResponse: _p.customErrorResponse,
    validateLoginCredentials: _p.validateLoginCredentials,
    handleLoginSuccessAction: _p.handleLoginSuccessAction
  };

})();

module.exports = loginController;
