(() => {
    "use strict";

    const HTTPStatus = require("http-status");
    const { ObjectId } = require("mongodb");
    const moduleConfig = require("../../config");
    const appConfig = require("../../../../configs/application");
    const commonHelper = require("../../../../common/common-helper-function");

    module.exports = async(req, res, next) => {
        try {
            const queryOpts = {
                _id: ObjectId(req.params.userId),
                deleted: false
            };
            const userInfo = await req.db.collection('User').findOne(queryOpts);
            if (!userInfo) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.NOT_FOUND,
                    message: moduleConfig.message.notFound
                });
            }
            if (userInfo.email === appConfig.user.defaultUserEmail) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.METHOD_NOT_ALLOWED,
                    message: moduleConfig.message.superAdminDeleteMessage
                });
            }
            const updateOpts = {
                $set: {
                    'deleted': true,
                    'deleted_on': new Date(),
                    'deleted_by': commonHelper.getLoggedInUser(req)
                }
            };
            const dataRes = await req.db.collection('User').updateOne(queryOpts, updateOpts);
            if (dataRes.result.n > 0) {
                const response = await req.db.collection('IPBlocker').deleteMany({email: userInfo.email});
                return commonHelper.sendResponseMessage(res, dataRes, {
                    _id: req.params.userId
                }, moduleConfig.message.deleteMessage);
            }
        } catch(err) {
            return next(err);
        }
    }
})()