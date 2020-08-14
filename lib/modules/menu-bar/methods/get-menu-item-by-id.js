(() => {
    "use strict";

    const HTTPStatus = require("http-status");
    const commonHelper = require("../../../common/common-helper-function");

    module.exports = async (req, res, next) => {
        try {
            const menuItems = await req.db.collection("MenuItems").findOne({ _id: req.params.menuId });
            return commonHelper.sendNormalResponse(res, menuItems, HTTPStatus.OK);
        } catch (err) {
            return next(err);
        }
    }
})()