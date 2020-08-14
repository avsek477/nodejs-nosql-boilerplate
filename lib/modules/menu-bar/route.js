const menuBarRoutes = (() => {
    "use strict";

    const express = require("express");
    const menuBarRouter = express.Router();
    const menuBarController = require("./index");
    const { menuBarItemValidationRules, getMenuItemByIdValidationRules, updateMenuItemsValidationRules, validate } = require("./validation");

    menuBarRouter.route("/")
        .post(menuBarItemValidationRules, validate, menuBarController.saveMenuBarItem)
        .get(menuBarController.getMenuItemsByRole);

    menuBarRouter.route("/:menuId")
        .get(getMenuItemByIdValidationRules, validate, menuBarController.getMenuItemById)
        .put(updateMenuItemsValidationRules, validate, menuBarController.updateMenuBarItem)
        .patch(getMenuItemByIdValidationRules, validate, menuBarController.deleteMenuBarItem);
        
    return menuBarRouter;
})();

module.exports = menuBarRoutes;