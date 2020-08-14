'use strict';

const geoip = require('geoip-lite');
const ObjectId = require('mongodb').ObjectID;
const { validationResult } = require("express-validator");
const HTTPStatus = require('http-status');
const messageConfig = require('../configs/message');
const disposableDomainList = require('../static-data/disposable-email-domains.json');
const suspendedDomainList = require('../static-data/temporary-blocked-emails');
const errorHelper = require("../helpers/error");
const errHandleMessage = "Please enter valid values for the highlighted fields";

const capitalizeFirstLetter = (string) => {
    return string? string.charAt(0).toUpperCase() + string.slice(1) : "";
}

const capitalizeFirstLetterOfEachWord = (name) => {
    return name ? name.trim().split(" ").map(each => {
        return capitalizeFirstLetter(each);
    }).join(" ") : "";
}

const validateFormFields = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();            
        }
        const errorObj = {
            status: HTTPStatus.BAD_REQUEST,
            message: errorHelper.sendFormattedErrorData(errors.array())
        }
        if (errors.array().length > 0) {
            const fields = errors.array().filter(each => { 
                return each.location === "body";
            }).map(each => {
                return { 
                    param: each.param,
                    msg: each.msg
                }
            });
            if (fields && fields.length > 0) {
                errorObj.fields = fields;
                errorObj.message = errHandleMessage; 
            }
        }
        return sendResponseData(res, errorObj);
    } catch (err) {
        return next(err);
    }
}

const getGeoLocationInfo = (ipAddress) => {
    try {
        return geoip.lookup(ipAddress);
    } catch (err) {
        throw new Error(err);
    }
}

const sendResponseData = (res, {status, message, fields}) => {
    res.status(status);
    res.json({
        'status': status,
        'message': message,
        'fields': fields
    });
};

const sendJsonResponseMessage = (res, dataRes, returnObj, messageResponse) => {
    if (dataRes && dataRes.result && dataRes.result.n > 0) {
        res.status(HTTPStatus.OK);
        res.json({
            'status': HTTPStatus.OK,
            'data': returnObj,
            'message': messageResponse
        });
    } else {
        return sendResponseData(res, {
            status: HTTPStatus.NOT_MODIFIED,
            message: messageConfig.applicationMessage.dataNotModified
        });
    }
};

const sendResponseMessage = (res, dataRes, dataObj, messageResponse) => {
    if (dataRes && dataRes.result && dataRes.result.n > 0) {
        const returnObj = dataObj ? {
            status: HTTPStatus.OK,
            message: messageResponse,
            data: dataObj
        } : {
            status: HTTPStatus.OK,
            message: messageResponse
        };
        res.status(HTTPStatus.OK);
        return res.json(returnObj);
    } else {
        return sendResponseData(res, {
            status: HTTPStatus.NOT_MODIFIED,
            message: messageConfig.applicationMessage.dataNotModified
        });
    }
};

const sendJsonResponse = (res, data, message, status) => {
    res.status(status);
    const returnObj = data ? (status === HTTPStatus.NOT_FOUND ? {
        'status': status,
        'data': (data instanceof Array) ? [] : {},
        'message': message
    } : {
        'status': status,
        'data': data
    }) : {
        'status': status,
        'data': (data instanceof Array) ? [] : {},
    };
    res.json(returnObj);
};

const sendNormalResponse = (res, data, status) => {
    res.status(status);
    res.json({
        'status': status,
        'data': data,
    });
};

const sendDataManipulationMessage = (res, data, message, status) => {
    res.status(status);
    res.json({
        'status': status,
        'data': data,
        'message': message
    });
};

const getTextValFromObjectField = (_val) => {
    return (_val) ? _val : '';
};

const checkDisposableEmail = (email) => {
    const mailDomain = email.replace(/.*@/, "");
    return !!(disposableDomainList.indexOf(mailDomain) > -1);
};

const getDisposableEmails = () => {
    return disposableDomainList;
};

const getTemporarySuspendedEmails = () => {
    return suspendedDomainList;
};

const getLoggedInUser = (req) => {
    return (req.decoded && req.decoded.user && req.decoded.user.email) ? req.decoded.user.email : 'system';
};

const getLoggedInUserRole = (req) => {
    return (req.decoded && req.decoded.user && req.decoded.user.user_role) ? req.decoded.user.user_role : '';
};

const getLoggedInUserId = (req) => {
    return (req.decoded && req.decoded.user && req.decoded.user._id) ? req.decoded.user._id : '';
};

const collectFormFields = (req, sanitizedObj, specifiedFormFields, action) => {
    try {
        const specifiedFormFieldsArr = specifiedFormFields.split(' ');
        let dataObj = {};
        if (action === 'update') {
            dataObj = {
                updated_by: getLoggedInUser(req),
                updated_on: new Date()
            };
        } else {
            dataObj = {
                _id: ObjectId(),
                added_by: getLoggedInUser(req),
                added_on: new Date(),
                deleted: false
            };
        }
        for (let i = 0; i < specifiedFormFieldsArr.length; i++) {
            if (sanitizedObj[specifiedFormFieldsArr[i]] === 'true' || sanitizedObj[specifiedFormFieldsArr[i]] === 'false') {
                dataObj[specifiedFormFieldsArr[i]] = sanitizedObj[specifiedFormFieldsArr[i]] === 'true' ? true : false;
            } else {
                dataObj[specifiedFormFieldsArr[i]] = (sanitizedObj[specifiedFormFieldsArr[i]] !== null && sanitizedObj[specifiedFormFieldsArr[i]] !== undefined) ? sanitizedObj[specifiedFormFieldsArr[i]] : "";
            }
        }
        return dataObj;
    }
    catch (err) {
        console.log(err)
        // return next(err);
    }
};

module.exports = {
    capitalizeFirstLetter,
    capitalizeFirstLetterOfEachWord,
    validateFormFields,
    getGeoLocationInfo,
    sendJsonResponseMessage,
    sendResponseMessage,
    sendJsonResponse,
    sendResponseData,
    sendNormalResponse,
    sendDataManipulationMessage,
    getTextValFromObjectField,
    checkDisposableEmail,
    getDisposableEmails,
    getTemporarySuspendedEmails,
    getLoggedInUser,
    getLoggedInUserId,
    getLoggedInUserRole,
    collectFormFields
}