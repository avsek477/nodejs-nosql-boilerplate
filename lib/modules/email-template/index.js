const emailTemplateController = (() => {
  'use strict';

  const HTTPStatus = require('http-status');
  const { validationResult } = require('express-validator');
  const moduleConfig = require('./config');
  const appConfig = require('../../configs/application');
  const utilityHelper = require('../../helpers/utilities');
  const errorHelper = require('../../helpers/error');
  const ObjectId = require('mongodb').ObjectID;
  const commonHelper = require('../../common/common-helper-function');
  const commonProvider = require('../../common/common-provider-function');
  const redisHelper = require('../../helpers/redis');

  const documentFields='template_name email_subject email_from template_content active';
  const projectionFields = {
    '_id': true,
    'template_name': true,
    'email_subject': true,
    'email_from': true,
    'template_content': true,
    'attachments': true,
    'active': true,
    'added_on': true
  };

  function EmailTemplateModule(){}

  const _p = EmailTemplateModule.prototype;

  _p.getEmailTemplate = async (req, next) => {
    req.query.perpage = 100;
    const pagerOpts = utilityHelper.getPaginationOpts(req, next);
    const queryOpts = {
      deleted: false
    };
    const sortOpts = {
      added_on: -1
    };
    return await commonProvider.getPaginatedDataList(req.db.collection('EmailTemplate'), queryOpts, pagerOpts, projectionFields, sortOpts);
  };

  _p.getEmailTemplateByTemplateName = async (req) => {
    const queryOpts = {
      template_name: req.body.template_name,
      deleted: false
    };
    return await req.db.collection('EmailTemplate').findOne(queryOpts, projectionFields);
  };

  _p.getEmailTemplateDataByID = async (req) => {
    const queryOpts = {
      _id: ObjectId(req.params.templateId),
      deleted: false
    };

    return await req.db.collection('EmailTemplate').findOne(queryOpts, { projection: projectionFields });
  };

  _p.deleteEmailTemplate = async (req, res, next) => {
    try {
      const updateOpts = {
        $set: {
          'deleted': true,
          'deleted_on': new Date(),
          'deleted_by':  commonHelper.getLoggedInUser(req)
        }
      };

      const dataRes = await req.db.collection('EmailTemplate').updateOne({_id: ObjectId(req.params.templateId)}, updateOpts);

      redisHelper.clearDataCache(req);
      commonHelper.sendResponseMessage(res, dataRes, null, moduleConfig.message.deleteMessage);
    } catch (err) {
      return next(err);
    }
  };

  _p.postEmailTemplate = async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (errors && errors.array().length > 0) {
        return commonHelper.sendResponseData(res, {
          status: HTTPStatus.BAD_REQUEST,
          message: errorHelper.sendFormattedErrorData(errors.array())
        });
      }
      const modelInfo = utilityHelper.sanitizeUserInput(req, next);
      const queryOpts = {
        template_name: { $regex: new RegExp('^'+ modelInfo.template_name + '$', "i") },//matches anything that exactly matches the email template name, case  insensitive
        deleted: false
      };

      const count = await req.db.collection('EmailTemplate').countDocuments(queryOpts);
      if(count > 0) {
        return commonHelper.sendResponseData(res, {
          status: HTTPStatus.CONFLICT,
          message: moduleConfig.message.alreadyExists
        });
      } else {
        // const contentInfo = {
        //   template_content: req.body.template_content
        // };
        // const modelHtmlInfo = utilityHelper.sanitizeUserHtmlBodyInput(contentInfo, next);

        const newEmailTemplate = commonHelper.collectFormFields(req, modelInfo, documentFields, undefined);
        newEmailTemplate.email_from = newEmailTemplate.email_from || appConfig.noreply_email;
        newEmailTemplate.template_content = req.body.template_content;
        const documents = utilityHelper.getMultipleDocuments(req, null, next);
        newEmailTemplate.attachments = documents;
        const dataRes = await req.db.collection('EmailTemplate').insertOne(newEmailTemplate);
        redisHelper.clearDataCache(req);
        commonHelper.sendResponseMessage(res, dataRes, null, moduleConfig.message.saveMessage);
      }
    } catch (err) {
      return next(err);
    }
  };

  _p.updateEmailTemplateData = async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (errors && errors.array().length > 0) {
        return commonHelper.sendResponseData(res, {
          status: HTTPStatus.BAD_REQUEST,
          message: errorHelper.sendFormattedErrorData(errors.array())
        });
      } 
      const modelInfo = utilityHelper.sanitizeUserInput(req, next);
      const emailTemplateInfo = await req.db.collection('EmailTemplate').findOne({ _id: ObjectId(req.params.templateId) }, { projection: projectionFields });
      if(!emailTemplateInfo) {
        return commonHelper.sendResponseData(res, {
          status: HTTPStatus.BAD_REQUEST,
          message: moduleConfig.message.notFound
        });
      }
      if(emailTemplateInfo.template_name.toLowerCase() !== modelInfo.template_name.toLowerCase()) {
        const queryOpts = {
          template_name: {$regex: new RegExp('^' + modelInfo.template_name + '$', "i")},//matches anything that exactly matches the email template name, case  insensitive
          deleted: false
        };
        const count = await req.db.collection('EmailTemplate').countDocuments(queryOpts);
        if(count > 0) {
          return commonHelper.sendResponseData(res, {
            status: HTTPStatus.CONFLICT,
            message: moduleConfig.message.alreadyExists
          });
        } 
      }
      const dataRes = await _p.updateFunc(req, res, modelInfo, emailTemplateInfo, next);
      redisHelper.clearDataCache(req);
      commonHelper.sendResponseMessage(res, dataRes, null, moduleConfig.message.updateMessage);
    } catch (err) {
      return next(err);
    }
  };

  _p.updateFunc = async (req, res, modelInfo, emailTemplateObj, next) => {
    // const contentInfo = {
    //   template_content: req.body.template_content
    // };
    // const modelHtmlInfo = utilityHelper.sanitizeUserHtmlBodyInput(contentInfo, next);

    const updateOpts = commonHelper.collectFormFields(req, modelInfo, documentFields, 'update');
    updateOpts.template_content = req.body.template_content;
    updateOpts.email_from = updateOpts.email_from || appConfig.noreply_email;
    const documents = utilityHelper.getMultipleDocuments(req, emailTemplateObj.attachments, next);
    updateOpts.attachments = documents;
    return await req.db.collection('EmailTemplate').updateOne({_id: ObjectId(req.params.templateId)}, {$set: updateOpts});
  };

  _p.deleteDocumentInfo = async(req, res, next) => {
    try {
      const fileName = (req.query && req.query.document_name) ? req.query.document_name : '';
      if (fileName !== '') {
        const updateOpts =  {
          $pull: {
            "attachments": {
              "document_name": fileName
            }
        }
        };
        const dataRes = await req.db.collection('EmailTemplate').updateOne({_id: ObjectId(req.params.templateId)}, updateOpts);
        redisHelper.clearDataCache(req);
        commonHelper.sendJsonResponseMessage(res, dataRes, {
          document_original_name: fileName
        }, moduleConfig.message.documentRemove);
      } else {
        return commonHelper.sendResponseData(res, {
          status: HTTPStatus.BAD_REQUEST,
          message: moduleConfig.message.fileSelect
        });
      }
    } catch (err) {
      return next(err);
    }
  };

  return{
    getEmailTemplate: _p.getEmailTemplate,
    getEmailTemplateByTemplateName: _p.getEmailTemplateByTemplateName,
    getEmailTemplateDataByID: _p.getEmailTemplateDataByID,
    deleteEmailTemplate: _p.deleteEmailTemplate,
    postEmailTemplate: _p.postEmailTemplate,
    updateEmailTemplateData: _p.updateEmailTemplateData,
    deleteDocumentInfo: _p.deleteDocumentInfo
  };

})();

module.exports = emailTemplateController;
