((recaptchaHelper) => {
  'use strict';

  const HTTPStatus = require('http-status');
  const rp = require('request-promise');
  const captchaConfig = require('../configs/recaptcha');
  const appMessageConfig = require('../configs/message');

  const respondMessage = () => {
    return {
      success: false,
      status: HTTPStatus.FORBIDDEN,
      message: appMessageConfig.captchaVerify.notHuman
    };
  };

  recaptchaHelper.verifyHuman = (req, next) => {
    try {
      const options = {
        method: 'POST',
        uri: captchaConfig.siteUrl,
        qs: {
          secret: captchaConfig.secretKey,
          response: req.body["reCaptcha"],
          remoteip: req.client_ip_address
        },
        json: true // Automatically stringifies the body to JSON
      };
      return new Promise((resolve, reject) => {
        rp(options)
          .then((response) => {
            if (!response.success) {
              resolve(respondMessage());
            }
            else {
              return resolve(Promise.resolve(true));
            }
          })
          .catch((err) => {
            resolve(respondMessage());
          });
      });
    } catch (err) {
      return next(err);
    }
  };

})(module.exports);
