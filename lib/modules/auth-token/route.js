const authTokenRoutes = (() => {
  'use strict';

  const HTTPStatus = require('http-status');
  const express = require('express');
  const moduleConfig = require('./auth-token.config');
  const authTokenController = require('./auth-token-controller');
  const authTokenRouter =  express.Router();
  const commonHelper = require('../../common/common-helper-function');
  const roleAuthMiddleware = require('../../middlewares/role-authorization');
  const redisHelper = require('../../helpers/redis');

  const getAllAuthorizationTokens = async (req, res, next) => {
    try {
      const lstAuthorizationToken = await authTokenController.getAuthorizationTokens(req, next);
      redisHelper.setDataToCache(req, lstAuthorizationToken);
      return commonHelper.sendJsonResponse(res, lstAuthorizationToken, moduleConfig.message.notFound, HTTPStatus.OK);

    } catch (err) {
      return next(err);
    }
  };

  const getAuthorizationTokenInfoById = async (req, res, next) => {
    try {
      const authorizationTokenInfo = await authTokenController.getAuthorizationTokenById(req);
      return commonHelper.sendJsonResponse(res, authorizationTokenInfo, moduleConfig.message.notFound, HTTPStatus.OK);

    } catch (err) {
      return next(err);
    }
  };

  authTokenRouter.route('/')
    .get( roleAuthMiddleware.authorize, redisHelper.getCachedObjectData, getAllAuthorizationTokens )
    .delete( roleAuthMiddleware.authorize, authTokenController.deleteAuthorizationToken );


  authTokenRouter.route('/:authorizationTokenId')
    .get( roleAuthMiddleware.authorize, getAuthorizationTokenInfoById )
    .delete( roleAuthMiddleware.authorize, authTokenController.deleteAuthorizationToken );

  return authTokenRouter;

})();

module.exports = authTokenRoutes;
