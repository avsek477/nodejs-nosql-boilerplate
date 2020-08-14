const passwordChangeVerifyTokenController  = (() => {
  'use strict';

  const HTTPStatus = require('http-status');
  const axios = require("axios");
  const ObjectId = require('mongodb').ObjectID;
  const commonHelper = require('../../common/common-helper-function');
  const moduleConfig = require('./config');
  const emailTemplateConfigs = require('../../configs/email-template');
  const emailHelper = require('../../helpers/email-service');
  const hasher = require('../../auth/hasher');
  const emailTemplateController = require('../email-template');
  const appConfig = require('../../configs/application');
  const emailTemplateContentConfigs = require('../../configs/email-template-content');

  const projectionFields = {
    '_id': true,
    'user_id': true,
    'token': true,
    'added_on': true,
    'expires': true,
    'expired': true,
    'used': true
  };

  function PasswordChangeModule(){}

  const _p = PasswordChangeModule.prototype;

  _p.checkTokenExpiryStatus = async (req, next) => {
    try {
      if (req.params && req.params.token) {
        const queryOpts = {
          token: req.params.token,
          expired: false
        };

        //check to see if the token exists in the collection with specified query parameters
        const tokenInfo = await req.db.collection('PasswordChangeVerifyToken').findOne(queryOpts, { projection: projectionFields });
        if(tokenInfo && !tokenInfo.used) {
          //check to see if the unblock token is already expired or not.
          // Expiration time is certain hours from the creation of token

          const user_id = (tokenInfo.user_id) ? tokenInfo.user_id : '';
          //if the token expiry date is less or equal than current date, then token is expired
          //if token is not expired, then find the user associated with the token

          return {
            expired: (new Date(tokenInfo.expires) <= new Date()) ? true : false,
            user_id: user_id,
            token: req.params.token,
            used: false
          };
        } else {
          return {
            used: true,
            user_id: (tokenInfo && tokenInfo.user_id) ? tokenInfo.user_id : ''
          };
        }
      }
      return null;
    } catch(err) {
      return next(err);
    }
  };

  _p.verifyPasswordChangeToken = async (req, res, next) => {
    try {
      const tokenInfo = await _p.checkTokenExpiryStatus(req, next);
      //if we get token info object, then do further processing, else respond with unblock token not found message
      if(tokenInfo && tokenInfo.used) {
        return commonHelper.sendDataManipulationMessage(res, { used: true }, moduleConfig.message.alreadyExpired, HTTPStatus.OK);
      } else {
        if(tokenInfo && tokenInfo.user_id){
          if(tokenInfo.expired) {
            return commonHelper.sendResponseData(res, {
              status: HTTPStatus.GONE,
              message: moduleConfig.message.alreadyExpired
            });
          } else {
            // const confirmRes = await _p.updatePasswordChangeVerifyToken(req, tokenInfo.user_id);
            // if(confirmRes.result.n > 0) {
            return commonHelper.sendJsonResponse(res, { user_id: tokenInfo.user_id, token: req.params.token }, moduleConfig.message.saveMessage, HTTPStatus.OK);
            // }
          }
        }else{
          return commonHelper.sendResponseData(res, {
            status: HTTPStatus.NOT_FOUND,
            message: moduleConfig.message.notFound
          });
        }
      }
    } catch(err) {
      return next(err);
    }
  };

  _p.postPasswordChangeVerifyTokenData = (req, token, user_id) => {
    const currentDate = new Date();

    const newPasswordChangeVerifyToken = {
      _id: ObjectId(),
      user_id: user_id,
      token: token,
      expires: new Date(currentDate.getTime() + (1000 * 60 * 60 * moduleConfig.config.token_expiry_date_in_hours)),
      added_on: currentDate,
      expired: false,
      used:false
    };
    return req.db.collection('PasswordChangeVerifyToken').insertOne(newPasswordChangeVerifyToken);
  };

  _p.sendEmailToConfirmPasswordChangeAction = async (req, res, dataObj, next) => {
    try {
      const user_id = dataObj._id;
      const userEmail = dataObj.email;

      const tokenBytes = await hasher.generateRandomBytes(moduleConfig.config.token_length);
      const dataRes = await _p.postPasswordChangeVerifyTokenData(req, tokenBytes, user_id);
      if(dataRes.result.n > 0) {
        req.params.templateId = emailTemplateConfigs.user_password_reset;
        if(ObjectId.isValid(ObjectId(req.params.templateId))) {
          const emailTemplateInfo = await emailTemplateController.getEmailTemplateDataByID(req);
          const url = `${req.protocol}://${appConfig.client_app_url}${moduleConfig.config.reset_api}${tokenBytes}`;
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
            return emailHelper.sendEmail(req, mailOptions, next);
          }
        }
        return null;
      }
    } catch(err) {
      return next(err);
    }
  };

  _p.updatePasswordChangeVerifyToken = (req, _userID) => {
    const queryOpts = {
      user_id: ObjectId(_userID),
      expired: false
    };
    const updateOpts = {
      $set: {
        expired: true,
        used: true
      }
    };
    return req.db.collection('PasswordChangeVerifyToken').updateOne(queryOpts, updateOpts);
  };

  _p.getPasswordChangeVerifyTokenDetailInfo = (req, _token) => {
    const queryOpts = {
      token: _token,
      expires: {
        "$gte": new Date()
      }
    };
    return req.db.collection('PasswordChangeVerifyToken').findOne(queryOpts, {projection: projectionFields});
  };

  return {
    verifyPasswordChangeToken: _p.verifyPasswordChangeToken,
    sendEmailToConfirmPasswordChangeAction: _p.sendEmailToConfirmPasswordChangeAction,
    updatePasswordChangeVerifyToken: _p.updatePasswordChangeVerifyToken,
    getPasswordChangeVerifyTokenDetailInfo : _p.getPasswordChangeVerifyTokenDetailInfo
  };

})();

module.exports = passwordChangeVerifyTokenController;
