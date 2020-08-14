(() => {
    "use strict";

    const HTTPStatus = require("http-status");
    const { ObjectId } = require("mongodb");
    const userAgent = require('useragent');
    const utilityHelper = require("../../../../helpers/utilities");
    const roleConfig = require("../../../../configs/role");
    const commonHelper = require("../../../../common/common-helper-function");
    const jwtTokenGeneratorHelper = require('../../../../helpers/jwt-token-generator');
    const moduleConfig = require("../../config");
    const tokenConfigs = require('../../../../configs/token');
    const authorizationTokenController = require("../../../auth-token");

    let updateDocFields = 'first_name last_name dob gender';

    const updateUserMiddlewareFunc = async (req, res, modelInfo, userObj, next, iam_user) => {
        try{
            if (!userObj.mobile_number_validated) {
                updateDocFields = updateDocFields + " country_code mobile_number";
            }
            const updateOpts = commonHelper.collectFormFields(req, modelInfo, updateDocFields, 'update');
            if (iam_user) {
                updateOpts.user_role = modelInfo.user_role;
            }
            const dataRes = await req.db.collection('User').updateOne(
                { _id: userObj._id }, 
                { $set: updateOpts }
            );
            updateOpts._id = userObj._id;
            if (dataRes.result.n > 0) {
                const authTokenInfo = jwtTokenGeneratorHelper.generateJWTToken(req, {
                    ...userObj,
                    ...updateOpts
                });
                const user_agent = userAgent.lookup(req.headers['user-agent']);
                const ip_address = req.client_ip_address;
                const _hours = utilityHelper.removeCharFromString(tokenConfigs.expires, 'h');
                const tokenExpiryDate = new Date(new Date().getTime() + (parseInt(_hours) * 60 * 60 * 1000));
                const geoLocationObj = await commonHelper.getGeoLocationInfo(req.client_ip_address.toString());

                const dataRes = await authorizationTokenController.postAuthorizationTokenInfo(req,
                    authTokenInfo.token,
                    user_agent,
                    user_agent.family,
                    user_agent.major,
                    geoLocationObj ? geoLocationObj.country : '',
                    geoLocationObj ? geoLocationObj.city : '',
                    ip_address,
                    tokenExpiryDate,
                    userObj._id, next
                );
            }
            commonHelper.sendJsonResponseMessage(res, dataRes, updateOpts, moduleConfig.message.updateMessage);
        } catch (err) {
            return next(err);
        }
    };

    module.exports = async (req, res, next) => {
        try {
            let iam_user = false;
            const modelInfo = utilityHelper.sanitizeUserInput(req, next);
            const userObj = await req.db.collection('User').findOne(
                { 
                    _id: commonHelper.getLoggedInUserRole(req) === roleConfig.superadmin ? ObjectId(req.params.userId) : ObjectId(commonHelper.getLoggedInUserId(req)),
                    deleted: false
                },
                { projection: moduleConfig.projectionFields.general }
            );
            if (!userObj) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.NOT_FOUND,
                    message: moduleConfig.message.notFound
                });
            }
            if (commonHelper.getLoggedInUserRole(req) !== roleConfig.superadmin && !userObj.confirmed) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.CONFLICT,
                    message: moduleConfig.message.accountNotConfirmed
                });
            }
            if (modelInfo.mobile_number && userObj.mobile_number !== modelInfo.mobile_number) {
                let queryOpts = {
                    mobile_number: modelInfo.mobile_number,
                    deleted: false
                };
                const count = await req.db.collection('User').countDocuments(queryOpts);
                if (count > 0) {
                    return commonHelper.sendResponseData(res, {
                        status: HTTPStatus.CONFLICT,
                        message: moduleConfig.message.alreadyExistsSignupMobileNumber
                    });
                } 
            } 
            updateUserMiddlewareFunc(req, res, modelInfo, userObj, next, iam_user);
        } catch(err) {
            return next(err);
        }
    }
})()