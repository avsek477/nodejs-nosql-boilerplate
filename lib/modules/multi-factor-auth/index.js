const multiFactorAuthController = (() => {
  'use strict';

  const HTTPStatus = require('http-status');
  const axios = require("axios");
  const userAgent = require('useragent');
  const moduleConfig = require('./config');
  const tokenConfigs = require('../../configs/token');
  const ObjectId = require('mongodb').ObjectID;
  const commonHelper = require('../../common/common-helper-function');
  const roleConfig = require('../../configs/role');
  const utilityHelper = require('../../helpers/utilities');
  const jwtTokenGeneratorHelper = require('../../helpers/jwt-token-generator');
  const multiFactorAuthHelper = require('../../helpers/multi-factor-auth');
  const authTokenController = require('../auth-token');
  const hasher = require('../../auth/hasher');
  const smsHelper = require('../../helpers/sms');
  const userController = require('../user-profile');
  const smsConfig = require('../../configs/sms');
  const emailHelper = require('../../helpers/email-service');
  const emailTemplateController = require('../email-template');
  const emailTemplateConfigs = require('../../configs/email-template');
  const emailTemplateContentConfigs = require('../../configs/email-template-content');
  // const identityAccessManagementRoleController = require('../identity-access-management/identity-access-management-roles.controller');

  function MultiFactorAuthModule () {}

  const _p = MultiFactorAuthModule.prototype;

  _p.checkMobileTOTPSetupValidationErrors = async (req) => {
    req.checkBody('country_code', moduleConfig.message.validationErrMessage.country_code).notEmpty();
    req.checkBody('mobile_number', moduleConfig.message.validationErrMessage.mobile_number).notEmpty();
    const result = await req.getValidationResult();
    return result.array();
  };

  _p.createBackUpRecoveryCodes = async () => {
    let backupCodes = [];
    let recoveryCode = "";
    for(let i=0; i<moduleConfig.config.backup_recovery_code_nos; i++) {
      recoveryCode = await hasher.generateRandomBytes(moduleConfig.config.recovery_code_length);
      backupCodes.push(recoveryCode);
    }
    return backupCodes;
  };

  _p.verifyTwoFactorAuthentication = async (req, updateOpts, user_id) => {
    return req.db.collection('User').updateOne({ _id : ObjectId(user_id) }, {
      $set: updateOpts
    });
  };

  _p.disableTwoFactorAuthentication = (req, res, next) => {
    try {
      const updateOpts = {
        $set: {
          multi_factor_auth_enable: false,
          multi_factor_auth_secret: "",
          backup_recovery_codes: []
        }
      };
      _p.disableMultiFactorAuthHelperFunc(req, res, updateOpts, next);
    } catch(err) {
      return next(err);
    }
  };

  _p.disableTwoFactorAuthenticationForMobile = (req, res, next) => {
    try {
      const updateOpts = {
        $set: {
          multi_factor_auth_enable_mobile: false,
          multi_factor_auth_secret_mobile: ""
        }
      };
      _p.disableMultiFactorAuthHelperFunc(req, res, updateOpts, next);
    } catch(err) {
      return next(err);
    }
  };

  _p.disableMultiFactorAuthHelperFunc = async (req, res, updateOpts, next) => {
    const _userId = commonHelper.getLoggedInUserRole(req) === roleConfig.superadmin ? ObjectId(req.params.userId) : ObjectId(commonHelper.getLoggedInUserId(req));
    const dataRes = await req.db.collection('User').updateOne({ _id: _userId }, updateOpts);
    return commonHelper.sendResponseMessage(res, dataRes, null, moduleConfig.message.disabled);
  };

  _p.validateTOTPToken = async (req, res, next) => {
    try {
      if (req.body.totp_token) {
        const userInfo = await req.db.collection('User').findOne({ _id: ObjectId(req.params.userId), deleted: false });
        if (userInfo) {
          const verified = await multiFactorAuthHelper.verifyMultiFactorAuthCode(req, userInfo.multi_factor_auth_secret);
          if (verified) {
            const dataRes = await _p.postAuthTokenHelperFunc(req, res, userInfo, next);
          if(dataRes.result.n > 0) {
              return commonHelper.sendJsonResponse(res, req.loginStatusMessage, '', HTTPStatus.OK);
            }
          } else {
            if(userInfo && userInfo.backup_recovery_codes && userInfo.backup_recovery_codes.includes(req.body.totp_token)) {
              const dataRes = await _p.postAuthTokenHelperFunc(req, res, userInfo, next);
              if(dataRes.result.n > 0) {
                req.db.collection('User').updateOne(
                  { _id: ObjectId(req.params.userId), deleted: false }, {
                    $pull: { backup_recovery_codes: { $in: [req.body.totp_token] } }
                  });
                return commonHelper.sendJsonResponse(res, req.loginStatusMessage, '', HTTPStatus.OK);
              }
            }
          }
        }
      }
      return commonHelper.sendDataManipulationMessage(res, null, moduleConfig.message.notVerified, HTTPStatus.UNAUTHORIZED);
    } catch(err) {
      return next(err);
    }
  };

  _p.validateMobileTOTPToken = async (req, res, next) => {
    try {
      if (req.body.totp_token) {
        const userObj = await req.db.collection('User').findOne({ _id: ObjectId(req.params.userId), deleted: false });
        if(userObj.multi_factor_auth_secret_mobile === req.body.totp_token) {
          const dataRes = await _p.postAuthTokenHelperFunc(req, res, userObj, next);
          if(dataRes.result.n > 0) {
            return commonHelper.sendJsonResponse(res, req.loginStatusMessage, '', HTTPStatus.OK);
          }
        }
      }
      return commonHelper.sendResponseData(res, {
        status: HTTPStatus.UNAUTHORIZED,
        message: moduleConfig.message.notValidated
      });
    } catch(err) {
      return next(err);
    }
  };

  _p.postAuthTokenHelperFunc = async (req, res, userInfo, next) => {
    req.loginStatusMessage = await jwtTokenGeneratorHelper.generateJWTToken(req, userInfo);

    const user_agent = userAgent.lookup(req.headers['user-agent']);
    const ip_address = req.client_ip_address;
    const _hours = utilityHelper.removeCharFromString(tokenConfigs.expires, 'h');
    const tokenExpiryDate = new Date(new Date().getTime() + (parseInt(_hours) * 60 * 60 * 1000));

    const geoLocationObj = await commonHelper.getGeoLocationInfo(ip_address.toString());
    return authTokenController.postAuthorizationTokenInfo(req,
        req.loginStatusMessage ? req.loginStatusMessage.token : '',
        user_agent,
        user_agent.family,
        user_agent.major,
        geoLocationObj ? geoLocationObj.country : '',
        geoLocationObj ? geoLocationObj.city : '',
        ip_address,
        tokenExpiryDate,
        userInfo._id, next);
  };

  _p.verifyTOTPSecret = async (req, res, next) => {
    try {
      //send the token secret in base32 format
      const verified = await multiFactorAuthHelper.verifyMultiFactorAuthCode(req, req.query.secret);
      //if totp token is verified successfully , then get the totp token secret value from session and then enable the two factor authentication for the user
      if (verified) {
        const twoFactorAuthSecret = (req.query && req.query.secret) ? req.query.secret : '';

        const _userId = ObjectId(commonHelper.getLoggedInUserId(req));
        const recoveryCodes = await _p.createBackUpRecoveryCodes();
        const updateOpts = {
            multi_factor_auth_enable : true,
            multi_factor_auth_secret : twoFactorAuthSecret,
            backup_recovery_codes: recoveryCodes,
            generated_on: new Date()
        };

        const dataRes = await _p.verifyTwoFactorAuthentication(req, updateOpts, _userId);
        //if everything fine, then send the message to the user that two factor authentication mechanism is enabled for the user / token is verified successfully
        return commonHelper.sendResponseMessage(res, dataRes, updateOpts, moduleConfig.message.verifySuccess);
      } else {
        //if token not verified, then respond the user with token not verified message
        return commonHelper.sendResponseData(res, {
          status: HTTPStatus.UNAUTHORIZED,
          message: moduleConfig.message.notVerified
        });
      }
    } catch(err) {
      return next(err);
    }
  };

  _p.verifyMobileTOTPSecret = async (req, res, next) => {
    try {
      const twoFactorAuthSecret = (req.query && req.query.secret) ? req.query.secret : '';
      const userObj = await req.db.collection('User').findOne({_id: ObjectId(commonHelper.getLoggedInUserId(req)), deleted: false});
      if(userObj.multi_factor_auth_secret_mobile === twoFactorAuthSecret) {
        const userRes = await req.db.collection('User').updateOne( { _id: ObjectId(commonHelper.getLoggedInUserId(req)) }, {$set: {
          'multi_factor_auth_enable_mobile': true
        }});
        //if everything fine, then send the message to the user that two factor authentication mechanism is enabled for the user / token is verified successfully
        return commonHelper.sendResponseMessage(res, userRes, null, moduleConfig.message.verifySuccess);
      } else {
        //if token not verified, then respond the user with token not verified message
        return commonHelper.sendResponseData(res, {
          status: HTTPStatus.UNAUTHORIZED,
          message: moduleConfig.message.notVerified
        });
      }
    } catch(err) {
      return next(err);
    }
  };

  _p.sendMultiFactorMobileCode = async (req, user_id, userObj) => {
    const randomToken = await hasher.generateRandomBytes(moduleConfig.config.mobile_token_length);

    const dataRes = await req.db.collection('User').updateOne( { _id: ObjectId(user_id) }, {$set: {
      'multi_factor_auth_secret_mobile': randomToken
    }});
    if(dataRes && dataRes.result && dataRes.result.n > 0) {
      const message = smsConfig.sms_message_multi_factor_auth;
      const message_sms = (message.indexOf("%verification_token%") > -1) ? message.replace("%verification_token%", randomToken) : message;

      const smsRes = await smsHelper.sendSMS(`${userObj.country_code}${userObj.mobile_number}`, message_sms);
      return (smsRes) ? {
        success: true,
      } : {
        success: false
      };
    } else {
      return {
        success: false
      };
    }
  };

  _p.generateMobileMultiFactorAuthCode = async (req, res, next) => {
    try {
      const userObj = await req.db.collection('User').findOne({_id: ObjectId(commonHelper.getLoggedInUserId(req))});
      if (userObj && userObj.mobile_number === "") {
        return commonHelper.sendResponseData(res, {
          status: HTTPStatus.BAD_REQUEST,
          message: moduleConfig.message.mobileNumberNotAssociated
        });
      } else {
        if(userObj.multi_factor_auth_enable_mobile) {
          return commonHelper.sendResponseData(res, {
            status: HTTPStatus.BAD_REQUEST,
            message: moduleConfig.message.already_enabled
          });
        } else {
          const randomToken = await hasher.generateRandomBytes(moduleConfig.config.mobile_token_length);
          const userRes = await userController.saveMobileTwoFactorAuthSecret(req, res, randomToken, userObj);
          if(userRes.success) {
            const message = smsConfig.sms_message_multi_factor_auth;
            const message_sms = (message.indexOf("%verification_token%") > -1) ? message.replace("%verification_token%", randomToken) : message;

            const smsRes = await smsHelper.sendSMS(`${userObj.country_code}${userObj.mobile_number}`, message_sms); //${userObj.country_code}
            if (smsRes) {
              return commonHelper.sendResponseData(res, {
                status: HTTPStatus.OK,
                message: moduleConfig.message.sms_sent
              });
            } else {
              return commonHelper.sendResponseData(res, {
                status: HTTPStatus.BAD_REQUEST,
                message: moduleConfig.message.sms_error
              });
            }
          } else {
            return commonHelper.sendResponseData(res, {
              status: userRes.status,
              message: userRes.message
            });
          }
        }
      }
    } catch (err) {
      return next(err);
    }
  };

  _p.generateRecoveryCode = async (req, res, next) => {
    try {
      const recoveryCodes = await _p.createBackUpRecoveryCodes();
      const currentDate = new Date();
      const updateOpts = {
        $set: {
          backup_recovery_codes: recoveryCodes,
          generated_on: currentDate
        }
      };
      const recoveryRes = await  req.db.collection('User').updateOne({ _id : ObjectId(commonHelper.getLoggedInUserId(req)) }, updateOpts);
      return commonHelper.sendResponseMessage(res, recoveryRes, {
            backup_recovery_codes: recoveryCodes,
            generated_on: currentDate
          },
          moduleConfig.message.recoveryCodeCreateSuccess
      );
    } catch (err) {
      return next(err);
    }
  };

  _p.sendRecoveryCodeForMultiFactorAuth = async (req, res, next) => {
    try {
      const userInfo = await req.db.collection('User').findOne({ 
        _id: ObjectId(req.params.userId), 
        deleted: false, 
        "backup_recovery_codes.0": {$exists: true} 
      });
      if (!userInfo) {
        return commonHelper.sendResponseData(res, {
          status: HTTPStatus.NOT_FOUND,
          message: moduleConfig.message.brcNotFound
        })
      }
      req.params.templateId = emailTemplateConfigs.recovery_code_multi_factor_auth;
      if (ObjectId.isValid(ObjectId(req.params.templateId))) {
        const emailTemplateInfo = await emailTemplateController.getEmailTemplateDataByID(req);
        let messageBody = '';
        if (emailTemplateInfo && emailTemplateInfo.template_content) {
          messageBody = emailTemplateInfo.template_content;
          if (messageBody.indexOf("%message.full_name%") > -1) {
            messageBody = messageBody.replace("%message.full_name%", `${userInfo.first_name} ${userInfo.last_name}`);
          }
          const recoveryCodes = userInfo.backup_recovery_codes.map((item, index) => `<span>${item}</span>`);
          if (messageBody.indexOf("%message.recovery_code%") > -1) {
            messageBody = messageBody.replace("%message.recovery_code%", recoveryCodes.join(","));
          }
          let message_template = emailTemplateContentConfigs.system_emails;

          if (message_template.indexOf("%email_content%") > -1) {
            message_template = message_template.replace("%email_content%", messageBody);
          }
          const mailOptions = {
            fromEmail: emailTemplateInfo.email_from, // sender address
            toEmail: userInfo.email, // list of receivers
            subject: emailTemplateInfo.email_subject, // Subject line
            textMessage: message_template, // plaintext body
            htmlTemplateMessage: message_template,
            attachments: emailTemplateInfo.attachments
          };
          if (mailOptions.attachments && mailOptions.attachments.length > 0) {
            const emailAttachments = [];
            for (let [index, attachment] of mailOptions.attachments.entries()) {
              const image = await axios.get(attachment.document_path, {responseType: 'arraybuffer'});
              const returnedB64 = Buffer.from(image.data).toString('base64');
              emailAttachments.push({
                content: returnedB64,
                filename: attachment.document_name,
                type: attachment.document_mimetype
              })
            }
            mailOptions.attachments = emailAttachments;
          }
          const emailRes = await emailHelper.sendEmail(req, mailOptions, next);
          return commonHelper.sendResponseData(res, {
            status: (emailRes && Object.keys(emailRes).length > 0) ? HTTPStatus.OK : HTTPStatus.SERVICE_UNAVAILABLE,
            message: (emailRes && Object.keys(emailRes).length > 0) ? moduleConfig.message.recoveryCodeSentSuccess : moduleConfig.message.emailError
          });
        }
      }
      return null;
    } catch(err) {
      return next(err);
    }
  };

  _p.getRecoveryCodes = async (req) => {
    const recoveryCodesData = await req.db.collection('User').findOne({
      deleted: false,
      _id: ObjectId(commonHelper.getLoggedInUserId(req))
    }, {
      _id: 1,
      backup_recovery_codes: 1,
      generated_on: 1
    });
    return (recoveryCodesData && Object.keys(recoveryCodesData).length > 0) ? {
      recovery_codes: recoveryCodesData.backup_recovery_codes,
      generated_on: recoveryCodesData.generated_on
    } : {
      recovery_codes: [],
      generated_on: ''
    }
  };

  _p.resendOtpCodeMobileLogin = async (req, res, next) => {
    try {
      const userObj = await req.db.collection("User").findOne({
        _id: req.body.user_id
      });
      if (!userObj) {
        return commonHelper.sendResponseData(res, {
          status: HTTPStatus.NOT_FOUND,
          message: moduleConfig.message.userNotFound
        });
      }
      if (!userObj.multi_factor_auth_enable_mobile) {
        return commonHelper.sendResponseData(res, {
          status: HTTPStatus.BAD_REQUEST,
          message: moduleConfig.message.mobileMultiFactorNotEnabled
        });
      }
      const success = await _p.sendMultiFactorMobileCode(req, req.body.user_id, userObj);
      if(!success) {
        return commonHelper.sendResponseData(res, {
          status: HTTPStatus.INTERNAL_SERVER_ERROR,
          message: moduleConfig.message.smsError
        });
      }
      return commonHelper.sendResponseData(res, {
        status: HTTPStatus.OK,
        message: moduleConfig.message.sms_sent
      });
    } catch (err) {
      return next(err);
    }
  }

  return {
    verifyTwoFactorAuthentication : _p.verifyTwoFactorAuthentication,
    disableTwoFactorAuthentication : _p.disableTwoFactorAuthentication,
    disableTwoFactorAuthenticationForMobile: _p.disableTwoFactorAuthenticationForMobile,
    verifyTOTPSecret: _p.verifyTOTPSecret,
    verifyMobileTOTPSecret: _p.verifyMobileTOTPSecret,
    validateTOTPToken: _p.validateTOTPToken,
    validateMobileTOTPToken: _p.validateMobileTOTPToken,
    checkMobileTOTPSetupValidationErrors: _p.checkMobileTOTPSetupValidationErrors,
    sendMultiFactorMobileCode: _p.sendMultiFactorMobileCode,
    generateMobileMultiFactorAuthCode: _p.generateMobileMultiFactorAuthCode,
    generateRecoveryCode: _p.generateRecoveryCode,
    getRecoveryCodes: _p.getRecoveryCodes,
    sendRecoveryCodeForMultiFactorAuth: _p.sendRecoveryCodeForMultiFactorAuth,
    resendOtpCodeMobileLogin: _p.resendOtpCodeMobileLogin
  };

})();

module.exports = multiFactorAuthController;
