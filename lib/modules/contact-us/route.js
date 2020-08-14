const contactUsRoutes = (() => {
    "use strict";

    const express = require("express");
    const contactUsRouter = express.Router();
    const contactUsController = require("./index");
    const { contactUsValidatorArray, validate } = require("./validation");
    const tokenAuthMiddleware = require("../../middlewares/token-authentication");
    const roleAuthMiddleware = require("../../middlewares/role-authorization");

    contactUsRouter.route("/")
        .get(tokenAuthMiddleware.authenticate, roleAuthMiddleware.authorize, contactUsController.getAllContactUs)
        .post(contactUsValidatorArray, validate, contactUsController.saveContactUs);

    return contactUsRouter;
})();

module.exports = contactUsRoutes;