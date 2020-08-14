const roleRouter = (() => {
  'use strict';

  const HTTPStatus = require('http-status');
  const express = require('express');
  const moduleConfig = require('./config');
  const roleController = require('./index');
  const roleRouter = express.Router();
  const commonHelper = require('../../common/common-helper-function');
  const roleAuthMiddleware = require('../../middlewares/role-authorization');
  const { getRoleByIdValidationRules, createRoleValidatorArray, updateRoleValidatorArray } = require('./validation');

  //method declaration to return role data object to the client if exists else return not found message
  const getRoles = async (req, res, next) => {
    try {
      const roleData = await roleController.getRole(req);
      // redisHelper.setDataToCache(req, roleData);
      return commonHelper.sendJsonResponse(res, roleData, moduleConfig.message.notFound, HTTPStatus.OK);
    } catch (err) {
      return next(err);
    }
  };

  roleRouter.route('/')
    .get(roleAuthMiddleware.authorize, getRoles)
    .post(roleAuthMiddleware.authorize, createRoleValidatorArray, commonHelper.validateFormFields, roleController.postRole);

  roleRouter.route('/:roleId')
    .get(roleAuthMiddleware.authorize, getRoleByIdValidationRules, commonHelper.validateFormFields, roleController.getRoleById)
    .put(roleAuthMiddleware.authorize, updateRoleValidatorArray, commonHelper.validateFormFields, roleController.updateRole)
    .patch(roleAuthMiddleware.authorize, getRoleByIdValidationRules, commonHelper.validateFormFields, roleController.deleteRole);

  return roleRouter;
})();

module.exports = roleRouter;
