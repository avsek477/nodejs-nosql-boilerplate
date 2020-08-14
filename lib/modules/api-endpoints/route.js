const apiEndpointRoutes = (() => {
    "use strict";

    const express = require("express");
    const apiEndpointRouter = express.Router();
    const apiEndpointController = require("./index");
    const roleAuthorization = require("../../middlewares/role-authorization");

    apiEndpointRouter.route("/")
        .get(roleAuthorization.authorize, apiEndpointController.getGroupedEndpointsList);

    return apiEndpointRouter;
})();

module.exports = apiEndpointRoutes;