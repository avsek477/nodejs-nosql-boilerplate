const notificationRoutes = (() => {
  'use strict';

  const HTTPStatus = require('http-status');
  const express = require('express');
  const moduleConfig = require('./config');
  const notificationController = require('./index');
  const notificationRouter =  express.Router();
  const commonHelper = require('../../common/common-helper-function');
  const roleAuthMiddleware = require('../../middlewares/role-authorization');
  const redisHelper = require('../../helpers/redis');

  //method declaration to return notification list to the client if exists else return not found message
  const getAllNotifications = async (req, res, next) => {
    try {
      const notificationsLst = await notificationController.getAllNotifications(req, next);
      redisHelper.setDataToCache(req, notificationsLst);
      return commonHelper.sendJsonResponse(res, notificationsLst, moduleConfig.message.notFound, HTTPStatus.OK);
    } catch (err) {
      return next(err);
    }
  };

  const updateNotificationSeenStatus = async (req, res, next) => {
    try {
      const dataRes = await notificationController.updateNotificationSeenStatus(req);
      const returnObj = (dataRes.result && dataRes.result.n > 0) ? { new_notification: false } : { new_notification: true };
      commonHelper.sendJsonResponseMessage(res, dataRes, returnObj, moduleConfig.message.notificationSeen);
    }catch (err) {
      return next(err);
    }
  };

  const updateNotificationReadStatus = async (req, res, next) => {
    try {
      const dataRes = await notificationController.updateNotificationReadStatus(req);
      commonHelper.sendResponseMessage(res, dataRes, {
        _id: req.params.notificationId ? req.params.notificationId : ""
      }, moduleConfig.message.notificationRead);
    }catch (err) {
      return next(err);
    }
  };

  const hasNewNotifications = async (req, res, next) => {
    try {
      const count = await notificationController.hasNewNotifications(req);
      const returnObj = { new_counts: count };
      redisHelper.setDataToCache(req, returnObj);
      commonHelper.sendJsonResponse(res, returnObj, moduleConfig.message.unSeenNotification, HTTPStatus.OK);
    }catch (err) {
      return next(err);
    }
  };

  notificationRouter.route('/all')
    .get( roleAuthMiddleware.authorize, getAllNotifications );//redisHelper.getCachedObjectData,

  notificationRouter.route('/new')
    .get( roleAuthMiddleware.authorize, hasNewNotifications )// redisHelper.getCachedObjectData,
    .patch( roleAuthMiddleware.authorize, updateNotificationSeenStatus );

  notificationRouter.route('/status/update/:notificationId')
    .patch( roleAuthMiddleware.authorize, updateNotificationReadStatus );

  notificationRouter.route('/status/all/update')
    .patch( roleAuthMiddleware.authorize, notificationController.readAllNotifications )

  return notificationRouter;

})();

module.exports = notificationRoutes;
