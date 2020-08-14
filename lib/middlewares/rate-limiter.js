((rateLimiterHelper) => {
    'use strict';
  
    const RateLimiter = require('limiter').RateLimiter;
    const messageConfig = require('../configs/message');
    const commonHelper = require('../common/common-helper-function');
    const HTTPStatus = require('http-status');
  
    rateLimiterHelper.init = (app) => {
  
      // Allow 150 requests per hour (the Twitter search limit). Also understands
      // 'second', 'minute', 'day', or a number of milliseconds
      const limiter = new RateLimiter(app.get('rate_limit'), 'minute', true);  // fire CB immediately
  
      rateLimiterHelper.rateLimitByIpAddress = (req, res, next) => {
        // Immediately send 429 header to client when rate limiting is in effect
         limiter.removeTokens(1, (err, remainingRequests) => {
           if (remainingRequests < 0) {
             return commonHelper.sendResponseData(res, {
               status: HTTPStatus.TOO_MANY_REQUESTS,
               message: messageConfig.rateLimiter.rate_limit
             });
           } else {
            next();
           }
         });
      };
    };
  
  })(module.exports);
  