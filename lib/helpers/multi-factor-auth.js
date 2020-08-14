((twoFactorAuthenticatorHelper) => {
  'use strict';

  const speakeasy = require('speakeasy');
  const qrCode = require('qr-image');
  const Promise = require("bluebird");
  const ObjectId = require('mongodb').ObjectID;
  const commonHelper = require('../common/common-helper-function');

  twoFactorAuthenticatorHelper.generateMultiFactorAuthCode= (req) => {
    try {
      let otpPathURLlabel = req.hostname + ':' + req.decoded.user.email;
      otpPathURLlabel = encodeURIComponent(otpPathURLlabel.trim().toLowerCase());
      const issuer = encodeURIComponent(req.hostname.trim().toLowerCase());
      const secret = speakeasy.generateSecret({
        length: 30,
        name: otpPathURLlabel,
        symbols: false,
        otpauth_url: false
      });
      secret.otpauth_url = speakeasy.otpauthURL({
        secret: secret.base32,
        label: otpPathURLlabel,
        issuer: issuer,
        encoding: 'base32'
      });

      const qr_svg = qrCode.svgObject(secret.otpauth_url, {type: 'svg'});
      req.session.totpAuthConfig = secret;
      return Promise.resolve({
        qrcode: qr_svg,
        secret: secret.base32
      });
    } catch (err) {
      return Promise.reject(err);
    }
  };

  twoFactorAuthenticatorHelper.verifyMultiFactorAuthCode= (req, _tokenSecret) => {
    // Verify a given token

    const userToken = req.body.totp_token;
    try {
      const verified = speakeasy.totp.verify({
        secret: _tokenSecret,
        encoding: 'base32',
        token: userToken,
        window: 1
      });
      // Returns true if the token matches
      if (verified) {
        return Promise.resolve(true);
      } else {
        return Promise.resolve(false);
      }
    }
    catch (err) {
      return Promise.resolve(false);
    }
  };
  
  twoFactorAuthenticatorHelper.removeToken = async(req, user_id, token) => {
    try {
      let queryOpts = {};
      if (token){
        queryOpts['authorization_token'] = {
          $ne: token
        };
      }
      queryOpts['user_id'] = ObjectId(user_id);
      const resultObj = await req.db.collection('AuthorizationToken').updateMany(queryOpts, {
          $set: {
              deleted: true,
              deleted_on: new Date(),
              deleted_by: commonHelper.getLoggedInUser(req)
          }
      });
      if(resultObj.result.n > 0){
        return Promise.resolve(resultObj);
      } else {
        return Promise.resolve(false);
      }
    } catch (error) {
      return Promise.resolve(false);
      
    }
    
  }
})(module.exports);
