const userUnblockTokenController = (() => {
  'use strict';

  const HTTPStatus = require('http-status');
  const axios = require("axios");
  const ObjectId = require('mongodb').ObjectID;
  const commonHelper = require('../../common/common-helper-function');
  const moduleConfig = require('./config');
  const appMessageConfig = require('../../configs/message');
  const emailTemplateConfigs = require('../../configs/email-template');
  const emailHelper = require('../../helpers/email-service');
  const hasher = require('../../auth/hasher');
  const emailTemplateController = require('../email-template');
  const loginController = require('../login-logs');
  const appConfig = require('../../configs/application');
  const Promise = require('bluebird');
  const join = Promise.join;
  const emailTemplateContentConfigs = require('../../configs/email-template-content');

  const projectionFields = {
    '_id': true,
    'user_id': true,
    'token': true,
    'added_on': true,
    'expires': true,
    'unblocked': true,
    'used': true
  };

  function UserUnblockModule () {}

  const _p = UserUnblockModule.prototype;

  _p.checkUnBlockTokenExpiryStatus = async (req, next) => {
    try {
      if (req.params && req.params.token) {
        const queryOpts = {
          token: req.params.token,
          unblocked: false,
          used: false
        };

        //check to see if the token exists in the collection with specified query parameters
        console.log(queryOpts)
        const tokenInfo = await req.db.collection('UserUnBlockTokens').findOne(queryOpts, projectionFields);
        if(tokenInfo) {
          //check to see if the unblock token is already expired or not.
          // Expiration time is certain hours from the creation of token

          const user_id = (tokenInfo.user_id) ? tokenInfo.user_id : '';
          const dataRes = await req.db.collection('UserUnBlockTokens').updateMany({ user_id: user_id, used: false }, { $set: { used: true } });

          if(dataRes.result.n > 0) {
            //if the token expiry date is less or equal than current date, then token is expired
            //if token is not expired, then find the user associated with the token
            if (new Date(tokenInfo.expires) <= new Date()) {
              //user_id is needed here to send email later for obtaining user information
              return {
                expired:true,
                user_id : user_id
              };
            } else {

              const userObj =  await req.db.collection('User').findOne({ _id: user_id, deleted: false });
              //check to see if the user exists with the provided unblocked token
              //if exists do further processing
              if (userObj && userObj.blocked) {
                return{
                  userDetail: userObj
                };
              }
            }
          }
        }
      }
      return null;
    } catch(err) {
      return next(err);
    }
  };

  _p.unBlockUserAccount = async (req, res, next) => {
    try {
      const tokenInfo = await _p.checkUnBlockTokenExpiryStatus(req, next);
      //if we get token info object, then do further processing, else respond with unblock token not found message
      if(tokenInfo && (tokenInfo.userDetail && tokenInfo.userDetail._id) || (tokenInfo && tokenInfo.user_id)){
          const user_id = (tokenInfo.user_id) ? tokenInfo.user_id : tokenInfo.userDetail._id;
          //if the token is not expired, then update the User block status
        if(!tokenInfo.expired){
          const dataRes = await join(req.db.collection('User').updateOne({ _id: ObjectId(user_id), deleted: false },
              { $set: { blocked: false }} ),
              req.db.collection('User').updateOne({ _id: ObjectId(user_id), deleted: false },
                  { $pull: { captcha_enable_ips: req.client_ip_address  }} ),
              req.db.collection('CaptchaTracker').deleteOne({ ip_address: req.client_ip_address }),//, { justOne: true }
              (resCaptcha) => {
                return resCaptcha;
              });
          if(dataRes.result.n > 0) {
            const unblockRes = await _p.updateUnBlockUserToken(req, user_id);
            if(unblockRes.result.n > 0) {
              loginController.updateLoggedInInfo(req,  user_id);
              return commonHelper.sendResponseData(res, {
                status: HTTPStatus.OK,
                message: moduleConfig.message.saveMessage
              });
            }
          }
          return commonHelper.sendResponseData(res, {
            status: HTTPStatus.NOT_MODIFIED,
            message: appMessageConfig.applicationMessage.dataNotModified
          });
        } else {
          // if token is expired then, return the json object having expired vendor to true and then resend the unblock email
          const userObj =  await req.db.collection('User').findOne({ _id:  ObjectId(tokenInfo.user_id), deleted: false });
          //it the token is already expired, then resend the new unblock email to the user
          const emailRes = await  _p.sendEmailToUser(req, res, userObj, next);

          return commonHelper.sendResponseData(res, {
            status: (emailRes && Object.keys(emailRes).length > 0) ? HTTPStatus.GONE : HTTPStatus.SERVICE_UNAVAILABLE,
            message: (emailRes && Object.keys(emailRes).length > 0) ? moduleConfig.message.expiredMessage : moduleConfig.message.emailError
          });
        }
      }else{
        return commonHelper.sendResponseData(res, {
          status: HTTPStatus.NOT_FOUND,
          message: moduleConfig.message.notFound
        });
      }
    } catch(err) {
      return next(err);
    }
  };

  _p.getUserUnBlockTokenStatus = (req, user_id) => {
    const queryOpts = {
      user_id: ObjectId(user_id)
    };
    return req.db.collection('UserUnBlockTokens').findOne(queryOpts, projectionFields);
  };

  _p.postUserUnblockTokenData = (req, token, user_id) => {
    const currentDate = new Date();

    const newUserUnBlockTokens = {
      _id: ObjectId(),
      user_id: user_id,
      token: token,
      expires: new Date(currentDate.getTime() + (1000 * 60 * 60 * moduleConfig.config.token_expiry_date_in_hours)),
      added_on: currentDate,
      unblocked: false,
      used:false
    };
    return req.db.collection('UserUnBlockTokens').insertOne(newUserUnBlockTokens);
  };

  _p.sendEmailToUser = async (req, res, dataObj, next) => {
    try {
      const user_id = dataObj._id;
      const userEmail = dataObj.email;
      const tokenBytes = await hasher.generateRandomBytes(moduleConfig.config.token_length);
      const dataRes = await _p.postUserUnblockTokenData(req, tokenBytes, user_id);
      if(dataRes.result.n > 0) {
        req.params.templateId = emailTemplateConfigs.user_unblock;
        if (ObjectId.isValid(ObjectId(req.params.templateId))) {
          const emailTemplateInfo = await emailTemplateController.getEmailTemplateDataByID(req);

          const url = `${req.protocol}://${appConfig.client_app_url}${moduleConfig.config.unblock_api}${tokenBytes}`;
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

  _p.updateUnBlockUserToken = (req, _userID) => {
    const queryOpts = {
      token: req.params.token
    };
    const updateOpts = {
      $set: {
        unblocked: true
      }
    };
    return req.db.collection('UserUnBlockTokens').updateOne(queryOpts, updateOpts);
  };

  return {
    checkUnBlockTokenExpiryStatus: _p.checkUnBlockTokenExpiryStatus,
    getUserUnBlockTokenStatus: _p.getUserUnBlockTokenStatus,
    sendEmailToUser: _p.sendEmailToUser,
    unBlockUserAccount: _p.unBlockUserAccount
  };

})();

module.exports = userUnblockTokenController;
