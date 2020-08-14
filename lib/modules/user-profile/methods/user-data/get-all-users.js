(() => {
    "use strict";
    
    const HTTPStatus = require("http-status");
    const utilityHelper = require("../../../../helpers/utilities");
    const commonProvider = require("../../../../common/common-provider-function");
    const commonHelper = require("../../../../common/common-helper-function");
    const moduleConfig = require("../../config");

    const projectionFields = {
        '_id': true,
        'first_name': true,
        'middle_name': true,
        'last_name': true,
        'email': true,
        'age': true,
        'gender': true,
        'address': true,
        'mobile_number': true,
        'mobile_number_validated': true,
        'user_role': true,
        'image_name': true,
        'image_path': true,
        'image_mimetype': true,
        'multi_factor_auth_enable': true,
        'multi_factor_auth_enable_mobile': true,
        'has_changed_password': true,
        'has_changed_security_answer': true,
        'security_question': true,
        'suspend': true,
        'blocked': true,
        'confirmed': true,
        'added_on': true
    };

    module.exports = async(req, res, next) => {
        try {
            const pagerOpts = utilityHelper.getPaginationOpts(req, next);
            let queryOpts = {};

            if (req.query.name && req.query.name.split(' ').length > 1) {
                queryOpts = Object.assign({}, queryOpts, {
                    $and: [
                        {
                            first_name: {
                                $regex: new RegExp('.*' + req.query.name.split(' ')[0], "i")
                            }
                        },
                        {
                            last_name: {
                                $regex: new RegExp('.*' + req.query.name.split(' ')[1], "i")
                            }
                        }
                    ]
                });

            }
            else if (req.query.name) {
                queryOpts = {
                    $or: [
                        {
                            first_name: {
                                $regex: new RegExp('.*' + req.query.name, "i")
                            }
                        },
                        {
                            last_name: {
                                $regex: new RegExp('.*' + req.query.name, "i")
                            }
                        }
                    ]
                };
            }

            if (req.query.user_role) {
                queryOpts.user_role = req.query.user_role;
            }
            if (req.query.email) {
                queryOpts.email = {$regex: new RegExp('.*' + req.query.email.toLowerCase(), "i")}
            }
            if (req.query.added_on) {
                const date = new Date(req.query.added_on)
                const nextDate = new Date(req.query.added_on);
                nextDate.setDate(date.getDate() + 1);
                queryOpts = Object.assign({}, queryOpts, {$and: [{'added_on': {$gte: date}}, {'added_on': {$lte: nextDate}}]});
            }
            queryOpts.deleted = false;
            if (req.query.suspend) {
                queryOpts.suspend = (req.query.suspend === true || req.query.suspend === 'true') ? true : false;
            }
            if (req.query.confirmed) {
                queryOpts.confirmed = (req.query.confirmed === true || req.query.confirmed === 'true') ? true : false;
            }
            if (req.query.blocked) {
                queryOpts.blocked = (req.query.blocked === true || req.query.blocked === 'true') ? true : false;
            }
            const sortOpts = {added_on: -1};
            const userList = await commonProvider.getPaginatedDataList(req.db.collection('User'), queryOpts, pagerOpts, projectionFields, sortOpts);
            return commonHelper.sendJsonResponse(res, userList, moduleConfig.message.notFound, HTTPStatus.OK);
        } catch(err) {
            return next(err);
        }
    }
})()