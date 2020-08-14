const { body, param } = require('express-validator');
const { ObjectId } = require("mongodb");
const moduleConfig = require('./config');

const getRoleByIdValidationRules = [
    param("roleId").customSanitizer(value => {
        return ObjectId(value);
    })
];

const createRoleValidatorArray = [
    body('role_name', moduleConfig.message.validationErrMessage.roleName).not().isEmpty().isString(),
    body('role_name', moduleConfig.message.validationErrMessage.roleNameTooManyCharacters).isLength({min: 0, max: 100})
        .custom(async(value, {req}) => {
            const roleCount = await req.db.collection("Role").countDocuments({
                deleted: false,
                role_name: value
            });
            if (roleCount > 0) {
                return Promise.reject();
            }
        }).withMessage(moduleConfig.message.alreadyExists),
    body('role_description', moduleConfig.message.validationErrMessage.roleDescription).not().isEmpty().isString(),
    body('role_description', moduleConfig.message.validationErrMessage.roleDescriptionTooManyCharacters).isLength({min: 0, max: 1000}),
    body('allowed_routes', moduleConfig.message.validationErrMessage.allowedRoutesArr).isArray(),
    body('allowed_routes.*.module')
        .custom(async (value, {req}) => {
            const modules = [...new Set(req.route_list.map(el => el.path.split("/")[2]))]
            const availableModules = modules.map(el => {
                return el.split("-").map(each => {
                    return each.charAt(0).toUpperCase() + each.slice(1);
                }).join(" ");
            })
            if (!availableModules.includes(value)) {
                return Promise.reject();
            }
        }).withMessage(moduleConfig.message.validationErrMessage.moduleNotRecognized),
    body('allowed_routes.*.path')
        .custom(async (value, {req}) => {
            const availablePaths = req.route_list.map(el => {return el.path;});
            if (!availablePaths.includes(value)) {
                return Promise.reject();
            }
        }).withMessage(moduleConfig.message.validationErrMessage.routeNotRecognized),
    body('allowed_routes.*.methods', moduleConfig.message.validationErrMessage.methodNotAvailable).isIn(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])
];

const updateRoleValidatorArray = [
    param("roleId").customSanitizer(value => {
        return ObjectId(value);
    }),
    body('role_name', moduleConfig.message.validationErrMessage.roleName).not().isEmpty(),
    body('role_name', moduleConfig.message.validationErrMessage.roleNameTooManyCharacters).isLength({min: 0, max: 100}),
    body('role_description', moduleConfig.message.validationErrMessage.roleDescription).not().isEmpty(),
    body('role_description', moduleConfig.message.validationErrMessage.roleDescriptionTooManyCharacters).isLength({min: 0, max: 1000}),
    body('allowed_routes', moduleConfig.message.validationErrMessage.allowedRoutesArr).isArray(),
    body('allowed_routes.*.module').custom(async (value, {req}) => {
        const modules = [...new Set(req.route_list.map(el => el.path.split("/")[2]))]
        const availableModules = modules.map(el => {
            return el.split("-").map(each => {
                return each.charAt(0).toUpperCase() + each.slice(1);
            }).join(" ");
        })
        if (!availableModules.includes(value)) {
            return Promise.reject();
        }
    }).withMessage(moduleConfig.message.validationErrMessage.moduleNotRecognized),
    body('allowed_routes.*.path').custom(async (value, {req}) => {
        const availablePaths = req.route_list.map(el => {return el.path;});
        if (!availablePaths.includes(value)) {
            return Promise.reject();
        }
    }).withMessage(moduleConfig.message.validationErrMessage.routeNotRecognized),
    body('allowed_routes.*.methods', moduleConfig.message.validationErrMessage.methodNotAvailable).isIn(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])
];

module.exports = {
    getRoleByIdValidationRules,
    createRoleValidatorArray,
    updateRoleValidatorArray
}