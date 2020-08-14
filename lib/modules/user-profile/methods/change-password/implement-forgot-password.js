(() => {
    "use strict";

    const HTTPStatus = require("http-status");
    const { ObjectId } = require("mongodb");
    const hasher = require("../../../../auth/hasher");
    const moduleConfig = require("../../config");
    const commonHelper = require("../../../../common/common-helper-function");
    const utilityHelper = require("../../../../helpers/utilities");
    const modifyPassword = require("../../common/modify-password");

    module.exports = async (req, res, next) => {
        try {
            if (!utilityHelper.checkPasswordStrength(req.body.password.trim())) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.UNAUTHORIZED,
                    message: moduleConfig.message.passwordNotStrong
                });
            }
            const queryOpts = {
                token: (req.params && req.params.token) ? req.params.token : '',
                used: false,
                expires: {
                    "$gte": new Date()
                }
            }
            const tokenObj = await req.db.collection('PasswordChangeVerifyToken').findOne(queryOpts);
            if (!tokenObj) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.UNAUTHORIZED,
                    message: moduleConfig.message.notAllowedToChangePassword
                });
            }
            const userObj = await req.db.collection('User').findOne({
                _id: ObjectId(tokenObj.user_id),
                deleted: false
            });
            if (userObj && userObj.password) {
                const isMatch = await hasher.comparePassword(req.body.password.trim(), userObj.password);
                if (isMatch) {
                    return commonHelper.sendResponseData(res, {
                        status: HTTPStatus.UNAUTHORIZED,
                        message: moduleConfig.message.passwordMatchOldPassword
                    });
                }
                if (req.body.password.trim().toLowerCase().indexOf(userObj.email) === -1) {
                    return modifyPassword(req, res, tokenObj.user_id, userObj.user_role, next);
                } else {
                    return commonHelper.sendResponseData(res, {
                        status: HTTPStatus.BAD_REQUEST,
                        message: moduleConfig.message.passwordEqUsername
                    });
                }
            } else {
                if (req.body.password.trim().toLowerCase().indexOf(userObj.email) === -1) {
                    return modifyPassword(req, res, tokenObj.user_id, next);
                } else {
                    return commonHelper.sendResponseData(res, {
                        status: HTTPStatus.BAD_REQUEST,
                        message: moduleConfig.message.passwordEqUsername
                    });
                }
            }
        } catch (err) {
            return next(err);
        }
    }
})()