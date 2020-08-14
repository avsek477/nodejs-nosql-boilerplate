const { body, param, validationResult } = require('express-validator');
const Promise = require("bluebird");
const HTTPStatus = require("http-status");
const { ObjectId } = require("mongodb");
const commonHelper = require("../../common/common-helper-function");
const errorHelper = require("../../helpers/error");
const moduleConfig = require('./config');

const menuBarItemValidationRules = [
    body("title", moduleConfig.validationErrMessage.title).not().isEmpty()
        .custom(async(value, { req }) => {
            const titleCount = await req.db.collection("MenuItems").countDocuments({
                deleted: false,
                title: value
            });
            if (titleCount > 0) {
                return Promise.reject();
            }
        }).withMessage(moduleConfig.validationErrMessage.titleAlreadyExists),
    body("web_url", moduleConfig.validationErrMessage.webUrl).not().isEmpty()
        .custom(async(value, { req }) => {
            const urlCount = await req.db.collection("MenuItems").countDocuments({ deleted: false, web_url: value});
            if (urlCount > 0) {
                return Promise.reject();
            }
        }).withMessage(moduleConfig.validationErrMessage.webUrlAlreadyExists),
    body("mobile_url", moduleConfig.validationErrMessage.mobileUrl).not().isEmpty()
        .custom(async(value, { req }) => {
            const urlCount = await req.db.collection("MenuItems").countDocuments({ deleted: false, mobile_url: value});
            if (urlCount > 0) {
                return Promise.reject();
            }
        }).withMessage(moduleConfig.validationErrMessage.mobileUrlAlreadyExists),
    body("icon", moduleConfig.validationErrMessage.icon).not().isEmpty()
        .custom(async(value, { req }) => {
            const iconCount = await req.db.collection("MenuItems").countDocuments({deleted: false, icon: value});
            if (iconCount > 0) {
                return Promise.reject();
            }
        }).withMessage(moduleConfig.validationErrMessage.iconAlreadyExists),
    body("roles", moduleConfig.validationErrMessage.rolesArrayRequired).isArray()
        .custom( async (value, { req }) => {
            const existingRoles = await req.db.collection("Role").find({}, { projection: { _id: true } }).toArray();
            const roleArr = existingRoles.map(each => { return each._id.toString(); });
            for(role of value) {
                if(!roleArr.includes(role)) {
                    return Promise.reject();
                }
            }
        }).withMessage(moduleConfig.validationErrMessage.noSuchRole)
];

const getMenuItemByIdValidationRules = [
    param("menuId").customSanitizer(value => {
        return ObjectId(value);
    })
];

const updateMenuItemsValidationRules = [
    param("menuId").customSanitizer(value => {
        return ObjectId(value);
    }),
    body("title", moduleConfig.validationErrMessage.title).not().isEmpty(),
    body("web_url", moduleConfig.validationErrMessage.webUrl).not().isEmpty(),
    body("mobile_url", moduleConfig.validationErrMessage.mobileUrl).not().isEmpty(),
    body("icon", moduleConfig.validationErrMessage.icon).not().isEmpty(),
    body("roles", moduleConfig.validationErrMessage.rolesArrayRequired).isArray()
        .custom( async (value, { req }) => {
            const existingRoles = await req.db.collection("Role").find({}, { projection: { _id: true } }).toArray();
            const roleArr = existingRoles.map(each => { return each._id.toString(); });
            for(role of value) {
                if(!roleArr.includes(role)) {
                    return Promise.reject();
                }
            }
        }).withMessage(moduleConfig.validationErrMessage.noSuchRole)
];

const validate = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();            
        }
        return commonHelper.sendResponseData(res, {
            status: HTTPStatus.BAD_REQUEST,
            message: errorHelper.sendFormattedErrorData(errors.array())
        });
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    menuBarItemValidationRules,
    getMenuItemByIdValidationRules,
    updateMenuItemsValidationRules,
    validate
}