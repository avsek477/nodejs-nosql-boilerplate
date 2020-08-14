const MobileIdentifierController = (() => {
    'use strict';

    const { ObjectId } = require("mongodb");
    const moduleConfig = require('./config');
    const hasher = require('../../auth/hasher');
    const commonHelper = require('../../common/common-helper-function');
    const utilityHelper = require("../../helpers/utilities");

    const documentFields = "mobile_device device_identifier";

    function MobileIdentifierSettingModule(){}

    const _p = MobileIdentifierSettingModule.prototype;

    _p.checkMobileIdentifierToken = (req) => {
        return req.db.collection('MobileIdentifier').countDocuments({
            unique_identifier: req.query.unique_identifier,
            device_identifier: req.query.device_identifier
        });
    };

    _p.generateUniqueMobileIdentifierCode =  async (req, res, next) => {
        try {
            const modelInfo = utilityHelper.sanitizeUserInput(req, next);
            const randomToken = await hasher.generateRandomBytes(26);
            const saveObj = commonHelper.collectFormFields(req, modelInfo, documentFields, undefined);
            saveObj.unique_identifier = randomToken;
            // saveObj.user_id = ObjectId(commonHelper.getLoggedInUserId(req));
            const dataRes = await req.db.collection('MobileIdentifier').insertOne(saveObj);
            commonHelper.sendJsonResponseMessage(res, dataRes, saveObj, moduleConfig.message.saveMessage);
        } catch (err) {
            return next(err);
        }
    };

    _p.updateUserIdWithToken = async (req, userId) => {
        try {
            await req.db.collection("MobileIdentifier").updateOne(
                { unique_identifier: req.query.unique_identifier },
                { $set: { user_id: ObjectId(userId) } }
            )
            return null;
        } catch(err) {
            return next(err);
        }
    }

    return{
        checkMobileIdentifierToken : _p.checkMobileIdentifierToken,
        generateUniqueMobileIdentifierCode : _p.generateUniqueMobileIdentifierCode,
        updateUserIdWithToken: _p.updateUserIdWithToken
    };

})();

module.exports = MobileIdentifierController;
