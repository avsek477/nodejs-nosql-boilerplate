(() => {
    "use strict";

    const HTTPStatus = require("http-status");
    const commonHelper = require("../../../common/common-helper-function"); 
    const moduleConfig = require("../config");
    const utilityHelper = require("../../../helpers/utilities");
    const redisHelper = require("../../../helpers/redis");
    const commonProvider = require("../../../common/common-provider-function");
    
    const projectionFields = {
        "_id" : true,
        "name" : true,
        "email": true,
        "message": true
    }

    module.exports = async (req, res, next) => {
        try {
            const pagerOpts = utilityHelper.getPaginationOpts(req, next);
            const queryOpts = {
                deleted: false
            };
            if (req.query && req.query.name) {
                queryOpts.name = {
                    $regex: new RegExp('.*' + req.query.name, "i")
                }
            }
            if (req.query && req.query.email) {
                queryOpts.email = {
                    $regex: new RegExp('.*' + req.query.email, "i")
                }
            }
            const sortOpts = {
                added_on: -1
            };
            const contactArr = await commonProvider.getPaginatedDataList(req.db.collection('ContactUs'), queryOpts, pagerOpts, projectionFields, sortOpts);
            redisHelper.setDataToCache(req, contactArr);
            return commonHelper.sendJsonResponse(res, contactArr, moduleConfig.message.notFound, HTTPStatus.OK);
        } catch (err) {
            return next(err);
        }
    }
})()