(() => {
    "use strict";

    const commonHelper = require("../../../common/common-helper-function");
    const moduleConfig = require("../config");
    const utilityHelper = require("../../../helpers/utilities");

    module.exports = async (req, res, next) => {
        try {
            const menuObj = utilityHelper.sanitizeUserInput(req, next);
            menuObj.deleted = false;
            menuObj.added_on = new Date();
            const dataRes = await req.db.collection("MenuItems").insertOne(menuObj);
            commonHelper.sendJsonResponseMessage(res, dataRes, menuObj, moduleConfig.message.menuItemSaved);
        } catch (err) {
            return next(err);
        }
    }
})()