(() => {
    "use strict";
    
    const { ObjectId } = require("mongodb");
    const commonHelper = require("../../../common/common-helper-function");
    const moduleConfig = require("../config");

    module.exports = async (req, res, next) => {
        try {
            const token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers.authorization;
            const currentUserId = commonHelper.getLoggedInUserId(req);
            const dataRes = await req.db.collection('AuthorizationToken').updateOne({
                user_id: ObjectId(currentUserId),
                authorization_token: token
            }, {
                $set: {
                    deleted: true,
                    deleted_on: new Date(),
                    deleted_by: currentUserId
                }
            });
            return commonHelper.sendResponseMessage(res, dataRes, null, moduleConfig.message.userLogout);
        } catch(err) {
            return next(err);
        }
    }
})()