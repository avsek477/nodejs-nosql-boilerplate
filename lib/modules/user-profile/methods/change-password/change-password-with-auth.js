(() => {
    "use strict";

    const { ObjectId } = require("mongodb");
    const HTTPStatus = require("http-status");
    const appConfig = require("../../../../configs/application");
    const moduleConfig = require("../../config");
    const roleConfig = require("../../../../configs/role");
    const commonHelper = require("../../../../common/common-helper-function");
    const utilityHelper = require("../../../../helpers/utilities");
    const hasher = require("../../../../auth/hasher");
    const modifyPassword = require("../../common/modify-password");

    module.exports = async(req, res, next) => {
        try {
            if (req.body.password.trim() === req.body.old_password.trim()) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.BAD_REQUEST,
                    message: moduleConfig.message.passwordSame
                });
            }
            if (!utilityHelper.checkPasswordStrength(req.body.password.trim())) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.UNAUTHORIZED,
                    message: moduleConfig.message.passwordNotStrong
                });
            }
            const _userId = commonHelper.getLoggedInUserRole(req) === roleConfig.superadmin ? ObjectId(req.params.userId) : ObjectId(commonHelper.getLoggedInUserId(req));
            const queryOpts = {
                _id: ObjectId(_userId),
                deleted: false
            };
            const userInfo = await req.db.collection('User').findOne(queryOpts);
            if (!userInfo) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.NOT_FOUND,
                    message: moduleConfig.message.notFound
                });
            }
            const isMatch = await hasher.comparePassword(req.body.old_password, userInfo.password);
            if (!isMatch) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.UNAUTHORIZED,
                    message: moduleConfig.message.oldPasswordMismatch
                });
            }
            if (req.body.password.trim().toLowerCase().indexOf(userInfo.email) === -1) {
                if (userInfo.email === appConfig.user.defaultUserEmail && commonHelper.getLoggedInUser(req) !== appConfig.user.defaultUserEmail) {
                    return commonHelper.sendResponseData(res, {
                        status: HTTPStatus.FORBIDDEN,
                        message: moduleConfig.message.notAllowedToChangeSuperAdminPassword
                    });
                } else if (commonHelper.getLoggedInUser(req) !== userInfo.email && commonHelper.getLoggedInUser(req) !== appConfig.user.defaultUserEmail) {
                    return commonHelper.sendResponseData(res, {
                        status: HTTPStatus.FORBIDDEN,
                        message: moduleConfig.message.notAllowedToChangeOthersPassword
                    });
                } else {
                    modifyPassword(req, res, _userId, userInfo.user_role, next);
                }
            } else {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.BAD_REQUEST,
                    message: moduleConfig.message.passwordEqUsername
                });
            }
        } catch(err) {
            return next(err);
        }
    }
})()