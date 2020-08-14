(() => {
    "use strict";
    
    const HTTPStatus = require("http-status");
    const { ObjectId } = require("mongodb");
    const roleConfig = require("../../../../configs/role");
    const commonHelper = require("../../../../common/common-helper-function");
    const moduleConfig = require("../../config");

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    module.exports = async(req, res, next) => {
        try {
            const queryOpts = {
                _id: commonHelper.getLoggedInUserRole(req) === roleConfig.superadmin ? ObjectId(req.params.userId) : ObjectId(commonHelper.getLoggedInUserId(req)),
                deleted: false
            };
            const userDetail = await req.db.collection("User").findOne(queryOpts);
            if (!userDetail) {
                return commonHelper.sendJsonResponse(res, userDetail, moduleConfig.message.notFound, HTTPStatus.OK);
            }
            const collection = capitalizeFirstLetter(userDetail.user_role);
            const userTypeDetail = await req.db.collection(collection).findOne({
                user_id: ObjectId(queryOpts._id)
            }, { projection: collection === "Doctor" ? moduleConfig.projectionFields.doctor: {} });
            if (userTypeDetail) {
                userDetail.userTypeDetail = userTypeDetail;
            }
            return commonHelper.sendJsonResponse(res, userDetail, moduleConfig.message.notFound, HTTPStatus.OK);
        } catch(err) {
            return next(err);
        }
    }
})()