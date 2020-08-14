(() => {
    "use strict";

    const HTTPStatus = require("http-status");
    const moduleConfig = require("../config");
    const commonHelper = require("../../../common/common-helper-function");

    module.exports = async (req, res, next) => {
        try {
            const existingMenuItems = await req.db.collection("MenuItems").findOne({ _id: req.params.menuId, deleted: false });
            if (!existingMenuItems) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.NOT_FOUND,
                    message: moduleConfig.message.noSuchMenuItem
                })
            }
            const updateOpts = {
                $set: {
                  'deleted': true,
                  'deleted_on': new Date(),
                  'deleted_by':  commonHelper.getLoggedInUser(req)
                }
            };
            const dataRes = await req.db.collection('MenuItems').updateOne({ _id: req.params.menuId }, updateOpts);
            commonHelper.sendResponseMessage(res, dataRes, null, moduleConfig.message.menuItemDeleted);
        } catch (err) {
            return next(err);
        }
    }
})()