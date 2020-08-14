const userConfirmationTokenController = (() => {
  'use strict';

  const HTTPStatus = require('http-status');
  const axios = require("axios");
  const ObjectId = require('mongodb').ObjectID;
  const userAgent = require('useragent');
  const commonHelper = require('../../common/common-helper-function');
  const moduleConfig = require('./config');
  const appMessageConfig = require('../../configs/message');
  const emailTemplateConfigs = require('../../configs/email-template');
  const utilityHelper = require('../../helpers/utilities');
  const emailHelper = require('../../helpers/email-service');
  const hasher = require('../../auth/hasher');
  const emailTemplateController = require('../email-template');
  const appConfig = require('../../configs/application');
  const notificationController = require('../notifications');
  const jwtTokenGeneratorHelper = require('../../helpers/jwt-token-generator');
  const authTokenController = require('../auth-token');
  const tokenConfigs = require('../../configs/token');
  const emailTemplateContentConfigs = require('../../configs/email-template-content');
  // const pushNotificationController = require('../push-notification/push-notification.controller');

  const projectionFields = {
    '_id': 1,
    'user_id': 1,
    'token': 1,
    'added_on': 1,
    'expires': 1,
    'confirmed': 1,
    'used': 1,
    'resentEmail': 1
  };

  function UserConfirmModule () {}

  const _p = UserConfirmModule.prototype;

  _p.checkTokenExpiryStatus = async (req, next) => {
    try {
      if (req.params && req.params.token) {
        const queryOpts = {
          token: req.params.token,
          confirmed: false
        };
        //check to see if the token exists in the collection with specified query parameters
        const tokenInfo = await req.db.collection('UserRegistrationConfirmToken').findOne(queryOpts, projectionFields);
        if (tokenInfo && !tokenInfo.used) {
          //check to see if the unblock token is already expired or not.
          // Expiration time is certain hours from the creation of token

          const user_id = (tokenInfo.user_id) ? tokenInfo.user_id : '';
          //if the token expiry date is less or equal than current date, then token is expired
          //if token is not expired, then find the user associated with the token

          if (new Date(tokenInfo.expires) <= new Date()) {
            //user_id is needed here to send email later for obtaining user information
            return {
              expired: true,
              user_id: user_id,
              used: true
            };
          } else {
            const userObj = await req.db.collection('User').findOne({
              _id: ObjectId(user_id),
              deleted: false
            });
            //check to see if the user exists with the provided unblocked token
            //if exists do further processing
            if (userObj) {
              return {
                userDetail: userObj,
                resentEmail: tokenInfo.resentEmail,
                used: false
              };
            }
          }
        } else {
          return {
            used: true,
            user_id: (tokenInfo && tokenInfo.user_id) ? tokenInfo.user_id : ""
          };
        }
      }
      return null;
    } catch(err) {
      return next(err);
    }
  };

  _p.confirmUserRegistration = async (req, res, next) => {
    try {
      const tokenInfo = await _p.checkTokenExpiryStatus(req, next);
      //if we get token info object, then do further processing, else respond with unblock token not found message
      if(tokenInfo && tokenInfo.used) {
        if (tokenInfo.expired) {
          // if token is expired then, return the json object having expired vendor to true and then resend the unblock email
          //it the token is already expired, then resend the new unblock email to the user
         if(tokenInfo.user_id!=="") {
           const userObj = await req.db.collection('User').findOne({
             _id: ObjectId(tokenInfo.user_id),
             deleted: false
           });
           const emailRes = await _p.sendEmailToUser(req, res, userObj, next);
           return commonHelper.sendDataManipulationMessage(res, { used: true, resend_email: (emailRes && Object.keys(emailRes).length > 0) ? true : false }, moduleConfig.message.usedToken, HTTPStatus.GONE);
         }
        }
        return commonHelper.sendDataManipulationMessage(res, { used: true }, moduleConfig.message.usedToken, HTTPStatus.GONE);
      } else {
        if (tokenInfo && (tokenInfo.userDetail && tokenInfo.userDetail._id) || (tokenInfo && tokenInfo.user_id)) {
          const user_id = (tokenInfo.user_id) ? tokenInfo.user_id : tokenInfo.userDetail._id;
          const registerUserObj = await req.db.collection('User').findOne({
            _id: ObjectId(user_id),
            deleted: false
          }, { projection: { confirmed: true, user_role: true } });
          //if the token is not expired, then update the User block status
          if (!tokenInfo.expired) {
            const dataRes = await req.db.collection('User').updateOne({_id: ObjectId(user_id)}, {
              $set: {
                confirmed: true,
                email_validated: true
              }
            });
            if (dataRes.result.n > 0) {
              const confirmationRes = await _p.updateRegistrationConfirmationToken(req, user_id);
              if (confirmationRes.result.n > 0) {
                notificationController.saveNotificationInfo(req, moduleConfig.notifications.account_confirmation, user_id);
                return commonHelper.sendResponseData(res, {
                  status: HTTPStatus.OK,
                  message: registerUserObj && registerUserObj.user_role === "doctor" && !registerUserObj.confirmed ? moduleConfig.message.registrationCompleteMessage : moduleConfig.message.saveMessage
                });
              }
            }
            return commonHelper.sendResponseData(res, {
              status: HTTPStatus.NOT_MODIFIED,
              message: appMessageConfig.applicationMessage.dataNotModified
            });
          }
        } else {
          return commonHelper.sendResponseData(res, {
            status: HTTPStatus.GONE,
            message: moduleConfig.message.notFound
          });
        }
      }
    } catch(err) {
      return next(err);
    }

  };

  _p.sendAuthTokenOnResentEmailConfirmationSuccess = async (req, userObj, next) => {
    try {
      let tokenExpiryDate;
      if(req.mobil_detection) {
        const _years = utilityHelper.removeCharFromString(tokenConfigs.mobileExpires, 'y');
        tokenExpiryDate = new Date(new Date().getTime() + (parseInt(_years) * 365 * 24 * 60 * 60 * 1000));
      } else {
        const _hours = utilityHelper.removeCharFromString(tokenConfigs.expires, 'h');
        tokenExpiryDate = new Date(new Date().getTime() + (parseInt(_hours) * 60 * 60 * 1000));
      }
      const user_agent = userAgent.lookup(req.headers['user-agent']);
      const geoLocationObj = await commonHelper.getGeoLocationInfo(req.client_ip_address.toString());

      const token = jwtTokenGeneratorHelper.generateJWTToken(req, userObj);
      const dataRes = await authTokenController.postAuthorizationTokenInfo(req, token ? token.token : '', user_agent, user_agent.family, user_agent.major, geoLocationObj ? geoLocationObj.country : '', geoLocationObj ? geoLocationObj.city : '', req.client_ip_address, tokenExpiryDate, userObj._id, next);
      return (dataRes.result.n > 0) ? token : null;
    }catch(err) {
      return null;
    }
  };

  _p.postUserConfirmationTokenData = (req, token, user_id, resentEmail) => {
    const currentDate = new Date();

    const newUserConfirmationTokens = {
      _id: ObjectId(),
      user_id: user_id,
      token: token,
      expires: new Date(currentDate.getTime() + (1000 * 60 * 60 * moduleConfig.config.token_expiry_date_in_hours)),
      added_on: currentDate,
      confirmed: false,
      used:false,
      resentEmail: resentEmail
    };
    return req.db.collection('UserRegistrationConfirmToken').insertOne(newUserConfirmationTokens);
  };


  _p.sendEmailToUser = async (req, res, dataObj, resentEmail, custom_password, pwd, next) => {
    try {
      const user_id = dataObj._id;
      const userEmail = dataObj.email;

      const tokenBytes = await hasher.generateRandomBytes(moduleConfig.config.token_length);
      const dataRes = await _p.postUserConfirmationTokenData(req, tokenBytes, user_id, resentEmail);
      if(dataRes.result.n > 0) {
        req.params.templateId = emailTemplateConfigs.user_confirmation;
        if (ObjectId.isValid(ObjectId(req.params.templateId))) {
          const emailTemplateInfo = await emailTemplateController.getEmailTemplateDataByID(req);
          let url = `${req.protocol}://${appConfig.client_app_url}${moduleConfig.config.confirm_api}${tokenBytes}`;
          let messageBody = '';
          if (emailTemplateInfo && emailTemplateInfo.template_content) {
            messageBody = emailTemplateInfo.template_content;
            if (messageBody.indexOf("%message.full_name%") > -1) {
              messageBody = messageBody.replace("%message.full_name%", dataObj.first_name + ' ' + dataObj.last_name);
            }
            if (messageBody.indexOf("%message.url_link%") > -1) {
              messageBody = messageBody.replace(new RegExp("%message.url_link%", 'g'), url);
            }
            if (messageBody.indexOf("%message.url_link%") > -1) {
              messageBody = messageBody.replace(new RegExp("%message.url_link%", 'g'), url);
            }
            if (messageBody.indexOf("%message.password%") > -1) {
                messageBody = messageBody.replace("%message.password%", custom_password === false ? `<p>Your login password has been auto-generated. Please Keep the password secure and on first sign-in, It is highly recommended to update the password. Below is the password</p>
                <div style="display: block;text-align: center;"><p style="font-size: 18px;margin:6px;">Password:</p><div style=" margin:  0 auto;max-width: 180px;"><p style="border: 2px solid #333;padding: 6px 8px;font-size: 22px;margin: 0;background: #333;color: #fff;"><strong>${pwd}</strong></p></div></div>` : "");
            }

            let message_template = emailTemplateContentConfigs.system_emails;

            if (message_template.indexOf("%email_content%") > -1) {
              message_template = message_template.replace("%email_content%", messageBody);
            }
            const mailOptions = {
              fromEmail: emailTemplateInfo.email_from, // sender address
              toEmail: userEmail, // list of receivers
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
            return await emailHelper.sendEmail(req, mailOptions, next);
          }
        }
        return null;
      }
    } catch(err) {
      return next(err);
    }
  };

  _p.updateRegistrationConfirmationToken = (req, _userID) => {
    const queryOpts = {
      token: req.params.token
    };
    const updateOpts = {
      $set: {
        confirmed: true, used: true
      }
    };
    return req.db.collection('UserRegistrationConfirmToken').updateOne(queryOpts, updateOpts);
  };

  return {
    confirmUserRegistration: _p.confirmUserRegistration,
    sendEmailToUser: _p.sendEmailToUser
  };

})();

module.exports = userConfirmationTokenController;
