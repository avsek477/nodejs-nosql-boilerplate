const userUnBlockTokenRoutes = (() => {
  'use strict';

  const express = require('express');
  const userUnBlockTokenRouter = express.Router();
  const userUnBlockTokenController = require('./index');

  userUnBlockTokenRouter.route('/:token')
    .get( userUnBlockTokenController.unBlockUserAccount );

  return userUnBlockTokenRouter;

})();

module.exports = userUnBlockTokenRoutes;
