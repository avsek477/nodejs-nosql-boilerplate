const loginAttemptLogRoutes = (() => {
  'use strict';

  const HTTPStatus = require('http-status');
  const express = require('express');
  const moduleConfig = require('./config');
  const loginAttemptLogController = require('./index');
  const loginAttemptLogRouter = express.Router();
  const commonHelper = require('../../common/common-helper-function');
  const roleAuthMiddleware = require('../../middlewares/role-authorization');

  //method declaration to return login attempt logs information object to the client if exists else return not found message
  const getAllLoginAttemptLogs = async (req, res, next) => {
    try {
      const loginLogsLst = await loginAttemptLogController.getAllUserLoginLogs(req, next);
      return commonHelper.sendJsonResponse(res, loginLogsLst, moduleConfig.message.notFound, HTTPStatus.OK);
    } catch (err) {
      return next(err);
    }
  };

  const getLoginAttemptLogInfoById = async (req, res, next) => {
    try {
      const loginAttemptLogInfo = await loginAttemptLogController.getUserLoginLogById(req);
      return commonHelper.sendJsonResponse(res, loginAttemptLogInfo, moduleConfig.message.notFound, HTTPStatus.OK);
    } catch (err) {
      return next(err);
    }
  };

  loginAttemptLogRouter.route('/')
    .get( roleAuthMiddleware.authorize, getAllLoginAttemptLogs );
    // .delete( roleAuthMiddleware.authorize, loginAttemptLogController.removeLoginAttemptLogs)

  loginAttemptLogRouter.route('/:loginLogId')
    .get( roleAuthMiddleware.authorize, getLoginAttemptLogInfoById )
      .delete( loginAttemptLogController.removeLoginAttemptLogs);

  return loginAttemptLogRouter;

})();

module.exports = loginAttemptLogRoutes;
