(() => {
    "use strict";

    const { ObjectId } = require("mongodb");
    const commonHelper = require("../../../../common/common-helper-function");
    const moduleConfig = require("../../config");

    module.exports = async (req, res, next) => {
        try {
            const queryOpts = {
                _id: ObjectId(req.body.user_id),
                deleted: false
            };
            const updateOpts = {
                $set: {
                    blocked: false
                }
            };
            const dataRes = await req.db.collection(moduleConfig.config.database).updateOne(queryOpts, updateOpts);
            return commonHelper.sendResponseMessage(res, dataRes, req.body, moduleConfig.message.unblockStatusMessage);
        } catch(err) {
            return next(err);
        }
    }
})()