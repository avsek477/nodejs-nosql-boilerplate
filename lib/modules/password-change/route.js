const passwordChangeVerifyTokenRoutes = (() => {
  'use strict';

  const express = require('express');
  const passwordChangeVerifyTokenRouter = express.Router();
  const passwordChangeVerifyTokenController = require('./index');

  passwordChangeVerifyTokenRouter.route('/:token')
    .get(passwordChangeVerifyTokenController.verifyPasswordChangeToken);

  return passwordChangeVerifyTokenRouter;

})();

module.exports = passwordChangeVerifyTokenRoutes;
