(() => {
    "use strict";

    const HTTPStatus = require("http-status");
    const { ObjectId } = require("mongodb");
    const moduleConfig = require("../../config");
    const roleConfig = require("../../../../configs/role");
    const commonHelper = require("../../../../common/common-helper-function");

    module.exports = async(req, res, next) => {
        try {
            const queryOpts = {
                _id: ObjectId(req.params.userId),
                deleted: false
            };
            const userObj = await req.db.collection('User').findOne(queryOpts);
            if (!userObj) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.NOT_FOUND,
                    message: moduleConfig.message.notFound
                });
            }
            if (!userObj.confirmed) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.CONFLICT,
                    message: moduleConfig.message.accountNotConfirmedAdminMessage
                });
            }
            if (userObj.user_role === roleConfig.superadmin) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.METHOD_NOT_ALLOWED,
                    message: moduleConfig.message.suspendMessageUnable
                });
            }
            const updateOpts = {
                $set: {
                    'suspend': !userObj.suspend,
                    'suspended_on': userObj.suspend ? undefined : new Date()
                }
            };
            const dataRes = await req.db.collection('User').updateOne(queryOpts, updateOpts);
            return commonHelper.sendResponseMessage(res, dataRes, { suspend: !userObj.suspend }, (userObj.suspend === false) ? moduleConfig.message.suspendMessage : moduleConfig.message.removeSuspension);
        } catch(err) {
            return next(err);
        }
    }
})()