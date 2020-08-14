const authTokenController = (() => {
  'use strict';

  const HTTPStatus = require('http-status');
  const commonProvider = require('../../common/common-provider-function');
  const moduleConfig = require('./config');
  const utilityHelper = require('../../helpers/utilities');
  const ObjectId = require('mongodb').ObjectID;
  const commonHelper = require('../../common/common-helper-function');
  const redisHelper = require('../../helpers/redis');

  const projectionFields = {
    '_id': 1,
    'authorization_token': 1,
    'user_agent': 1,
    'browser': 1,
    'browser_version': 1,
    'country': 1,
    'city': 1,
    'ip_address': 1,
    'expires_on': 1,
    'user_id': 1,
    'added_on': 1
  };

  function AuthorizationTokenModule() {}

  const _p = AuthorizationTokenModule.prototype;

  AuthorizationTokenModule.CreateAuthorizationToken = (_authorizationToken, _userAgent, _browser, _browserVersion, _country, _city, _ipAddress, _expiresOn, _userId) => {
    return {
      '_id': ObjectId(),
      'authorization_token': _authorizationToken,
      'user_agent': _userAgent,
      'browser': _browser,
      'browser_version': _browserVersion,
      'country': _country,
      'city': _city,
      'ip_address': _ipAddress,
      'expires_on': _expiresOn,
      'user_id': _userId,
      'added_on': new Date(),
      'deleted': false
    };
  };

  _p.checkAuthorizationTokenStatus = async (req, _authorizationToken, _userId) => {
    const queryOpts = {
      authorization_token: _authorizationToken,
      user_id: ObjectId(_userId),
      expires_on: {
        "$gte": new Date()
      },
      deleted: false
    };
    return await req.db.collection('AuthorizationToken').findOne(queryOpts);
  };

  _p.getAuthorizationTokens = (req, next) => {
    const queryOpts = {
      user_id: commonHelper.getLoggedInUserId(req),
      expires_on: {
        "$gte": new Date()
      },
      deleted: false
    };

    const pagerOpts = utilityHelper.getPaginationOpts(req, next);
    const sortOpts = { added_on: -1 };
    return commonProvider.getPaginatedDataList(req.db.collection('AuthorizationToken'), queryOpts, pagerOpts, projectionFields, sortOpts);
  };

  _p.getAuthorizationTokenById = (req) => {
    const queryOpts = {
      _id: ObjectId(req.params.authorizationTokenId),
      deleted: false
    };

    return req.db.collection('AuthorizationToken').findOne(queryOpts, projectionFields);
  };

  _p.deleteAuthorizationToken = (async function(req, res, next) {
    try {
      const queryOpts = (req.params && req.params.authorizationTokenId) ? { _id: ObjectId(req.params.authorizationTokenId), user_id: commonHelper.getLoggedInUserId(req) } : { user_id: commonHelper.getLoggedInUserId(req) };

      const dataRes = await (req.params && req.params.authorizationTokenId)
          ?
          req.db.collection('AuthorizationToken').updateOne(queryOpts, {
          $set: {
              deleted: true,
              deleted_on: new Date(),
              deleted_by: commonHelper.getLoggedInUser(req)
          }
      }) :
          req.db.collection('AuthorizationToken').update(queryOpts, {
              $set: {
                  deleted: true,
                  deleted_on: new Date(),
                  deleted_by: commonHelper.getLoggedInUser(req)
              }
          },{
            multi: true
          })

      redisHelper.clearDataCache(req);
      commonHelper.sendResponseMessage(res, dataRes, null, (req.params && req.params.authorizationTokenId) ? moduleConfig.message.deleteMessage : moduleConfig.message.deleteAllMessage);
    } catch(err) {
      return next(err);
    }
  });

  _p.postAuthorizationTokenInfo = (req, authorization_token, user_agent, browser, browser_version, country, city, ip_address, expires_on, user_id, next) => {
    try {
      const authorizationTokenInfo = AuthorizationTokenModule.CreateAuthorizationToken(authorization_token, user_agent, browser, browser_version, country, city, ip_address, expires_on, user_id);
      redisHelper.clearDataCache(req);
      return req.db.collection('AuthorizationToken').insertOne(authorizationTokenInfo);
    } catch(err) {
      return next(err);
    }
  };

  _p.invalidateAuthToken = (req, user_id) => {
      var currentDate = new Date();
      currentDate.setHours(currentDate.getHours() + 6);
      return req.db.collection('AuthorizationToken').update({
          user_id: ObjectId(user_id),
          deleted: false
      }, {
          $set: {
            expires_on: currentDate
          }
      },{
          multi: true
      });
    // return req.db.collection('AuthorizationToken').update({
    //   user_id: ObjectId(user_id),
    //     deleted: false
    // }, {
    //   $set: {
    //     deleted: true,
    //       deleted_on: new Date(),
    //       deleted_by: commonHelper.getLoggedInUser(req)
    //   }
    // },{
    //     multi: true
    // });
  };

  return {
    checkAuthorizationTokenStatus : _p.checkAuthorizationTokenStatus,
    getAuthorizationTokens: _p.getAuthorizationTokens,
    getAuthorizationTokenById: _p.getAuthorizationTokenById,
    postAuthorizationTokenInfo: _p.postAuthorizationTokenInfo,
    deleteAuthorizationToken: _p.deleteAuthorizationToken,
    invalidateAuthToken: _p.invalidateAuthToken
  };

})();

module.exports = authTokenController;
