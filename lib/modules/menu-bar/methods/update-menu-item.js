(() => {
    "use strict";

    const HTTPStatus = require("http-status");
    const commonHelper = require("../../../common/common-helper-function");
    const moduleConfig = require("../config");
    const utilityHelper = require("../../../helpers/utilities");

    module.exports = async (req, res, next) => {
        try {
            const existingMenuObj = await req.db.collection("MenuItems").findOne({_id: req.params.menuId});
            if (!existingMenuObj) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.NOT_FOUND,
                    message: moduleConfig.message.noSuchMenuItem
                })
            }
            if (existingMenuObj.title !== req.body.title) {
                const existCount = await req.db.collection("MenuItems").countDocuments({
                    title: req.body.title,
                    deleted: false
                });
                if (existCount > 0) {
                    return commonHelper.sendResponseData(res, {
                        status: HTTPStatus.BAD_REQUEST,
                        message: moduleConfig.validationErrMessage.titleAlreadyExists
                    })
                }
            }
            if (existingMenuObj.web_url !== req.body.web_url) {
                const existCount = await req.db.collection("MenuItems").countDocuments({
                    web_url: req.body.web_url,
                    deleted: false
                });
                if (existCount > 0) {
                    return commonHelper.sendResponseData(res, {
                        status: HTTPStatus.BAD_REQUEST,
                        message: moduleConfig.validationErrMessage.webUrlAlreadyExists
                    })
                }
            }
            if (existingMenuObj.mobile_url !== req.body.mobile_url) {
                const existCount = await req.db.collection("MenuItems").countDocuments({
                    mobile_url: req.body.mobile_url,
                    deleted: false
                });
                if (existCount > 0) {
                    return commonHelper.sendResponseData(res, {
                        status: HTTPStatus.BAD_REQUEST,
                        message: moduleConfig.validationErrMessage.mobileUrlAlreadyExists
                    })
                }
            }
            if (existingMenuObj.icon !== req.body.icon) {
                const existCount = await req.db.collection("MenuItems").countDocuments({
                    icon: req.body.icon,
                    deleted: false
                });
                if (existCount > 0) {
                    return commonHelper.sendResponseData(res, {
                        status: HTTPStatus.BAD_REQUEST,
                        message: moduleConfig.validationErrMessage.iconAlreadyExists
                    })
                }
            }
            const updateMenuObj = utilityHelper.sanitizeUserInput(req, next);
            updateMenuObj.updated_on = new Date();
            const dataRes = await req.db.collection("MenuItems").updateOne({_id: req.params.menuId}, {$set: updateMenuObj});
            commonHelper.sendJsonResponseMessage(res, dataRes, updateMenuObj, moduleConfig.message.menuItemUpdated);
        } catch (err) {
            return next(err);
        }
    }
})()