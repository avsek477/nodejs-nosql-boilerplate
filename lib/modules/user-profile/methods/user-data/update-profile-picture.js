(() => {
    "use strict";

    const { ObjectId } = require("mongodb");
    const HTTPStatus = require("http-status");
    const userAgent = require('useragent');
    const moduleConfig = require("../../config");
    const commonHelper = require("../../../../common/common-helper-function");
    const jwtTokenGeneratorHelper = require('../../../../helpers/jwt-token-generator');
    const tokenConfigs = require('../../../../configs/token');
    const authorizationTokenController = require("../../../auth-token");

    module.exports = async(req, res, next) => {
        try {
            const userDetails = await req.db.collection(moduleConfig.config.database).findOne({
                _id: ObjectId(commonHelper.getLoggedInUserId(req)),
                deleted: false
            });
            if (!userDetails) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.NOT_FOUND,
                    message: moduleConfig.message.notFound
                });
            }
            if (!userDetails.confirmed) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.CONFLICT,
                    message: moduleConfig.message.accountNotConfirmed
                });
            }
            if(req.file && req.file.fieldname === "profile") {
                const updateOpts = {
                    image_path: req.file.path,
                    image_name: req.file.originalname,
                    image_mimetype: req.file.mimetype
                }
                const dataRes = await req.db.collection('User').updateOne(
                    { _id: userDetails._id }, 
                    { $set: updateOpts }
                );
                commonHelper.sendJsonResponseMessage(res, dataRes, updateOpts, moduleConfig.message.profilePictureUploaded);
            } else {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.INTERNAL_SERVER_ERROR,
                    message: moduleConfig.message.saveMessageFailure
                });
            }
        } catch(err) {
            return next(err);
        }
    }
})()