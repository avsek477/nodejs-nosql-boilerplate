(() => {
    "use strict";

    const { ObjectId } = require("mongodb");
    const hasher = require("../../../auth/hasher");
    const commonHelper = require("../../../common/common-helper-function");
    const moduleConfig = require("../config");
    const passwordChangeVerifyController = require('../../password-change');

    module.exports =  async (req, res, user_id, user_role, next) => {
        try {
            const password = req.body.password.toString();
            const salt = await hasher.createSalt();
            const hashPassword = await hasher.computeHash(req, res, password, salt);

            const updateOpts = {
                $set: {
                    'password': hashPassword,
                    'password_salt': salt,
                    'has_changed_password': true,
                    'updated_by': commonHelper.getLoggedInUser(req)
                }
            };

            const dataRes = await req.db.collection('User').updateOne({_id: ObjectId(user_id)}, updateOpts);
            if (req.params.token) {
                const dataToken = passwordChangeVerifyController.updatePasswordChangeVerifyToken(req, user_id);
            }
            if (req.query.log_out_from_all_other_devices === "true") {
                const token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers.authorization;
                req.db.collection('AuthorizationToken').updateMany({
                    user_id: ObjectId(user_id),
                    authorization_token: {
                        $ne: token
                    }
                }, {
                    $set: {
                        deleted: true,
                        deleted_on: new Date(),
                        deleted_by: commonHelper.getLoggedInUser(req)
                    }
                });
            }
            commonHelper.sendResponseMessage(res, dataRes, null, moduleConfig.message.passwordUpdateMessage);
        }
        catch (err) {
            return next(err);
        }
    }
})()