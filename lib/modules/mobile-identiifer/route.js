const MobileIdentifierRoutes = (() => {
    'use strict';

    const express = require('express');
    const MobileIdentifierRouter = express.Router();
    const mobileIdentifierController = require('./index');
    const { mobileIdentifierValidatorArray, validate } = require("./validation");

    MobileIdentifierRouter.route('/')
        .post(mobileIdentifierValidatorArray, validate, mobileIdentifierController.generateUniqueMobileIdentifierCode );

    return MobileIdentifierRouter;

})();

module.exports = MobileIdentifierRoutes;
