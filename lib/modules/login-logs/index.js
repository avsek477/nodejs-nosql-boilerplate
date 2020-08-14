const loggedInController = (() => {
  'use strict';

  const utilityHelper = require('../../helpers/utilities');
  const ObjectId = require('mongodb').ObjectID;
  const moduleConfig = require('./config');
  const commonHelper = require('../../common/common-helper-function');
  const commonProvider = require('../../common/common-provider-function');

  function LoginHandlerModule(){}

  const _p = LoginHandlerModule.prototype;

  _p.getAllUserLoginLogs = (req, next) => {
    const queryOpts = {
      user_id: ObjectId(commonHelper.getLoggedInUserId(req))
    };
    const pagerOpts = utilityHelper.getPaginationOpts(req, next);
    const sortOpts = {
      added_on: -1
    };
    return commonProvider.getPaginatedDataList(req.db.collection('LoginLogs'), queryOpts, pagerOpts, {}, sortOpts);
  };

  _p.getUserLoginLogById = (req) => {
    const queryOpts = {
      _id: ObjectId(req.params.loginLogId),
      user_id: ObjectId(commonHelper.getLoggedInUserId(req))
    };
    return req.db.collection('LoginLogs').findOne(queryOpts);
  };

  _p.getFailedLoginAttemptCount = (req, res, user_id) => {
    const queryOpts = {
      user_id: ObjectId(user_id),
      expired: false,
      failed_login: true
    };
    return  req.db.collection('LoginLogs').countDocuments(queryOpts);
  };


  _p.postLoggedInData = (req, res, user_id, login_attempt, failed_login, next) => {
    const locationObj = {};
    const userAgentObj = {};

    if(req.user_agent){
      userAgentObj.ip_address = commonHelper.getTextValFromObjectField(req.user_agent.ip_address);
      userAgentObj.browser = commonHelper.getTextValFromObjectField(req.user_agent.family);
      userAgentObj.browser_version = commonHelper.getTextValFromObjectField(req.user_agent.major);
      userAgentObj.source = commonHelper.getTextValFromObjectField(req.user_agent.source);

      if(req.user_agent.loc){
        locationObj.country = commonHelper.getTextValFromObjectField(req.user_agent.loc.country);
        locationObj.postal = commonHelper.getTextValFromObjectField(req.user_agent.loc.postal);
        locationObj.city = commonHelper.getTextValFromObjectField(req.user_agent.loc.city);
        locationObj.coordinates = (req.user_agent.loc.location) ? req.user_agent.loc.location : {};
      }
    }

    const newLoginAttemptObj = {
      _id: ObjectId(),
      user_id: user_id,
      failed_login_attempt: (failed_login) ? (login_attempt + 1) : login_attempt,
      ip_address: userAgentObj.ip_address,
      browser: userAgentObj.browser,
      browser_version: userAgentObj.browser_version,
      operating_system: utilityHelper.getOperatingSystem(userAgentObj.source, next),
      user_agent_source: userAgentObj.source,
      device: req.client_device,
      country: locationObj.country ? locationObj.country : '',
      postal: locationObj.postal ? locationObj.postal : '',
      city: locationObj.city ? locationObj.city : '',
      coordinates: locationObj.coordinates ? locationObj.coordinates : '',
      added_on: new Date(),
      failed_login: failed_login,
      expired: false
    };
    return req.db.collection('LoginLogs').insertOne(newLoginAttemptObj);
  };

  _p.updateLoggedInInfo = (req, user_id) => {
    const queryOpts = {
      user_id: user_id,
      expired: false
    };
    const updateOpts = {
      $set: {
        expired: true,
        expired_on: new Date(),
        failed_login_attempt: 0
      }
    };
    return req.db.collection('LoginLogs').update(queryOpts, updateOpts, { multi:true });
  };

  _p.removeLoginAttemptLogs = async (req, res, next) => {
    const queryOpts = {
      _id: ObjectId(req.params.loginLogId)
    };
    const dataRes = await req.db.collection('LoginLogs').remove(queryOpts);
    commonHelper.sendResponseMessage(res, dataRes, null, moduleConfig.message.deleteAllMessage);
  };

  return{
    getAllUserLoginLogs: _p.getAllUserLoginLogs,
    getFailedLoginAttemptCount: _p.getFailedLoginAttemptCount,
    getUserLoginLogById: _p.getUserLoginLogById,
    postLoggedInData: _p.postLoggedInData,
    updateLoggedInInfo: _p.updateLoggedInInfo,
    removeLoginAttemptLogs: _p.removeLoginAttemptLogs
  };

})();

module.exports = loggedInController;
