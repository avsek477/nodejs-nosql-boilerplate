(() => {
  'use strict';

  const HTTPStatus = require('http-status');
  const moduleConfig = require('./config');
  const utilityHelper = require('../../helpers/utilities');
  const commonHelper = require('../../common/common-helper-function');
  const redisHelper = require('../../helpers/redis');
  const commonProvider = require("../../common/common-provider-function");

  const documentFields = 'role_name role_description allowed_routes';

  let projectionFields = {
    '_id': true,
    'role_name': true,
    'role_description': true,
    'allowed_routes': true
  };

  const getRole = async (req, res, next) => {
    const pagerOpts = utilityHelper.getPaginationOpts(req, next);
    let queryOpts = {};
    if (req.query && Object.keys(req.query).length > 0) {
      projectionFields = {};
    }
    if (req.query && req.query.role_name) {
      projectionFields.role_name = req.query.role_name === "true";
    }
    if (req.query && req.query.role_description) {
      projectionFields.role_description = req.query.role_description === "true";
    }
    if (req.query && req.query.allowed_routes) {
      projectionFields.allowed_routes = req.query.allowed_routes === "true";
    }
    return await commonProvider.getPaginatedDataList(req.db.collection('Role'), queryOpts, pagerOpts, projectionFields, {});
    // return await req.db.collection('Role').find({ deleted: false }, { projection: projectionFields }).toArray();
  };

  const getRoleById = async (req, res, next) => {
    try {
      const roleDetail = await req.db.collection('Role').findOne({ _id: req.params.roleId, deleted: false });
      return commonHelper.sendJsonResponse(res, roleDetail, moduleConfig.message.notFound, HTTPStatus.OK);
    } catch (err) {
      return next(err);
    }
  };

  const postRole = async (req, res, next) => {
    try {
      if(req.query && req.query.clean_role_install && req.query.clean_role_install === "true") {
        req.db.collection('Role').deleteMany({}, async (err, numberRemoved) => {
          if (!err) {
            const newRole = moduleConfig.config.roles.map(el => {
              return {
                ...el,
                deleted: false,
                added_on: new Date(),
                added_by: "system"
              }
            });
            const dataRes = await req.db.collection('Role').insertMany(newRole);
            redisHelper.clearDataCache(req);
            commonHelper.sendResponseMessage(res, dataRes, null, moduleConfig.message.saveMessage);
          }
        });
      } else {
        const count = await req.db.collection('Role').countDocuments({ role_name:req.body.role_name, deleted: false });
        if(count > 0) {
          return commonHelper.sendResponseData(res, {
            status: HTTPStatus.BAD_REQUEST,
            message: moduleConfig.message.alreadyExists
          });
        }
        const modelInfo = utilityHelper.sanitizeUserInput(req, next);
        const newRole = commonHelper.collectFormFields(req, modelInfo, documentFields, undefined);
        const dataRes = await req.db.collection('Role').insertOne(newRole);
        redisHelper.clearDataCache(req);
        return commonHelper.sendJsonResponseMessage(res, dataRes, newRole, moduleConfig.message.saveMessage);
      }
    } catch (err) {
      return next(err);
    }
  };

  const updateRole = async (req, res, next) => {
    try {
      const existingRole = await req.db.collection("Role").findOne({ _id: req.params.roleId });
      if (!existingRole) {
        return commonHelper.sendResponseData(res, {
          status: HTTPStatus.NOT_FOUND,
          message: moduleConfig.message.notFound
        })
      }
      if (existingRole.role_name !== req.body.role_name) {
        const existCount = await req.db.collection("Role").countDocuments({
          role_name: req.body.role_name,
          deleted: false
        });
        if (existCount > 0) {
            return commonHelper.sendResponseData(res, {
                status: HTTPStatus.BAD_REQUEST,
                message: moduleConfig.message.alreadyExists
            })
        }
      }
      const updateRoleObj = utilityHelper.sanitizeUserInput(req, next);
      updateRoleObj.updated_on = new Date();
      const dataRes = await req.db.collection("Role").updateOne({_id: req.params.roleId}, {$set: updateRoleObj});
      redisHelper.clearDataCache(req);
      commonHelper.sendJsonResponseMessage(res, dataRes, updateRoleObj, moduleConfig.message.updateMessage);
    } catch(err) {
      return next(err);
    }
  };

  const deleteRole = async(req, res, next) => {
    try {
      const existingRole = await req.db.collection("Role").findOne({ _id: req.params.roleId });
      if (!existingRole) {
        return commonHelper.sendResponseData(res, {
          status: HTTPStatus.NOT_FOUND,
          message: moduleConfig.message.notFound
        })
      }
      const updateOpts = {
        $set: {
          'deleted': true,
          'deleted_on': new Date(),
          'deleted_by':  commonHelper.getLoggedInUser(req)
        }
      };
      const dataRes = await req.db.collection('Role').updateOne({ _id: req.params.roleId }, updateOpts);
      redisHelper.clearDataCache(req);
      commonHelper.sendResponseMessage(res, dataRes, null, moduleConfig.message.deleteMessage);
    } catch (err) {
      return next(err);
    }
  };

  module.exports = {
    getRole,
    getRoleById,
    postRole,
    updateRole,
    deleteRole
  };
})();