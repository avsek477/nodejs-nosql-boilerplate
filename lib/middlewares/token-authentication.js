((tokenAuthenticationMiddleware) => {
    'use strict';
  
    const jwt = require('jsonwebtoken');
    const apiMessageConfig = require('../configs/message');
    const authTokenController = require('../modules/auth-token');
    const HTTPStatus = require('http-status');
    const commonHelper = require('../common/common-helper-function');
  
    const callbackFunc = (res, bitVal, message) => {
      const returnObj = {
        isToken: bitVal,
        success: false,
        message: message
      };
      if(returnObj.message === apiMessageConfig.authFail.tokenExpired) {
        returnObj.token_expired = true;
      }
      commonHelper.sendJsonResponse(res, returnObj, message.tokenInvalid, HTTPStatus.UNAUTHORIZED);
    };
  
    tokenAuthenticationMiddleware.authenticate = (req, res, next) => {
      // check header or url parameters or post parameters for token
      const token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers.authorization;
      // decode token
      if (token) {
        // verifies secret and checks exp
        jwt.verify(token, process.env.TOKEN_SECRET,
          {  algorithm:'HS512' },
          async (err, decoded) => {
          if (err) {
              callbackFunc(res, true, (err.name==="TokenExpiredError") ? apiMessageConfig.authFail.tokenExpired : apiMessageConfig.authFail.authFailMessage);
            } else {
              try {
                const authTokenInfo = await authTokenController.checkAuthorizationTokenStatus(req, token, decoded.user._id);
                if(authTokenInfo && Object.keys(authTokenInfo).length > 0 && !authTokenInfo.deleted) {
                  // if everything is good, save to request for use in other routes
                  req.decoded = decoded;
                  req.decoded.isAuthenticated = true;
                  next();
                  return null;// return a non-undefined value to signal that we didn't forget to return promise
                } else {
                  callbackFunc(res, true, apiMessageConfig.authFail.authFailMessage);
                }
              } catch (error) {
                callbackFunc(res, true, apiMessageConfig.authFail.authFailMessage);
              }
            }
          });
      } else {
        callbackFunc(res, false, apiMessageConfig.authFail.authFailMessage);
      }
    };
  
  })(module.exports);
  