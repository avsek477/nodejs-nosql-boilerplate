const ipBlockerController = (() => {
  'use strict';

  const ObjectId = require('mongodb').ObjectID;

  function IPBlockerModule(){}

  const _p = IPBlockerModule.prototype;

  _p.checkBlockedExpiryStatus = async (req, ip_address, _email, next) => {
    try {
      const queryOpts = {
        ip_address: ip_address,
        email: _email.trim().toLowerCase(),
        blocked_upto: { $gte: new Date() }
      };
      const count = await req.db.collection('IPBlocker').countDocuments(queryOpts);
      return (count > 0) ? true : false;
    } catch(err) {
      return next(err);
    }
  };

  _p.blockLoginIpAddress = (req, ip_address, expiry_date, _email) => {
    const ipBlockerInfo = {
      _id: ObjectId(),
      ip_address: ip_address,
      email: _email,
      blocked_upto: new Date(expiry_date),
      added_on: new Date()
    };
    return req.db.collection('IPBlocker').insertOne(ipBlockerInfo);
  };

  return{
    checkBlockedExpiryStatus : _p.checkBlockedExpiryStatus,
    blockLoginIpAddress: _p.blockLoginIpAddress
  };

})();

module.exports = ipBlockerController;
