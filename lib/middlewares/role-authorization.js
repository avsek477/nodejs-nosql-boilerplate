((roleBasedAuthorizationMiddleware) => {
    'use strict';

    // const roleAccessManagementConfig = require('../configs/role-access-management.config');
    const messageConfig = require("../configs/message");
    const HTTPStatus = require('http-status');
    const commonHelper = require('../common/common-helper-function');
    // const iamRolesController = require('../modules/identity-access-management/identity-access-management-roles.controller');
    const roleConfig = require('../configs/role');

    const checkRouteExists = (_arrayVal, _checkVal) => {
        for (let i = 0; i < _arrayVal.length; i++) {
            if (_arrayVal[i].route_api === _checkVal) {
                return true;
            }
        }
        return false;
    };

    const checkIfMultipleRoles = (_role, http_method, api_route, req) => {
        if (_role instanceof Array) {
            let returnVal = false;
            for (let i = 0; i < _role.length; i++) {
                returnVal = checkRouteExists(roleAccessManagementConfig.route_access[http_method][_role[i]], api_route);
                // if (returnVal === true) {
                //     return true;
                // }
            }
            return returnVal;
        } else {
            return checkRouteExists(roleAccessManagementConfig.route_access[http_method][_role], api_route);
        }
    };

    // const checkParentRoleExists = (req) => {
    //     return (req.decoded.user && req.decoded.user.parent_user_role && req.decoded.user.parent_user_role.length > 0)
    // };

    // const getUserRole = (req) => {
    //     return checkParentRoleExists(req)
    //         ? req.decoded.user.parent_user_role :
    //         commonHelper.getLoggedInUserRole(req)
    // };

    const checkUserIdentityAccess = (api_route, http_method, userAccessRules) => {
        const accessRules = (userAccessRules && userAccessRules.length>0) ? userAccessRules.filter((item) => {
            return ((item.policy_rule === api_route || `${item.policy_rule}/` === api_route) && item.policy_rule_http_access === http_method);
        }) : [];
        return (accessRules && accessRules.length > 0);
    };

    const getPolicyRules = async (req, role_name, parent_id) => {
        const policyRuleData = await iamRolesController.getRoleDetailObj(req, {
            role_name: {
                $in: role_name
            }
        }, parent_id);

        return (policyRuleData && policyRuleData.length > 0
            && policyRuleData[0].user_specific_actions
            && policyRuleData[0].user_specific_actions.policies_detail)
            ? policyRuleData[0].user_specific_actions.policies_detail : [];
    };

    roleBasedAuthorizationMiddleware.authorize = async (req, res, next) => {
        if(commonHelper.getLoggedInUserRole(req) === "superadmin"){
            return next();
        }
        let api_route = `${req.baseUrl}${req.route.path}`;
        const http_method = req.method;
        if(api_route.indexOf("?=") > -1) {
            const arrRoute = api_route.split("?");
            api_route = arrRoute[0];
        }
        if (api_route.charAt(api_route.length - 1) === "/") {
            api_route = api_route.substring(0, api_route.length-1);
        }
        const allowedCount = await req.db.collection("Role").countDocuments({
            role_name: commonHelper.getLoggedInUserRole(req),
            "allowed_routes.path": api_route,
            "allowed_routes.methods": http_method
        });
        if (allowedCount === 0) {
            return commonHelper.sendResponseData(res, {
                status: HTTPStatus.NOT_FOUND,
                message: messageConfig.roleAuthorize.accessFailure
            });
        }
        return next();
        //For loading dashboard from superadmin
        // if (req.decoded.user.access && req.decoded.user.access.length === 1) {
        //     if (http_method === 'GET' && (checkRouteExists(roleAccessManagementConfig.route_access[http_method]['common'], api_route) || checkIfMultipleRoles(getUserRole(req), http_method, api_route, req))) {
        //         next();
        //         return null;
        //     }
        //     return commonHelper.sendResponseData(res, {
        //         status: HTTPStatus.UNAUTHORIZED,
        //         message: messageConfig.roleAuthorize.accessFailure
        //     });
        // } else {
        //     if ((commonHelper.getLoggedInUserRole(req) && commonHelper.getLoggedInUserRole(req)[0]===roleConfig.superadmin) || (checkRouteExists(roleAccessManagementConfig.route_access[http_method]['common'], api_route) || checkIfMultipleRoles(getUserRole(req), http_method, api_route, req))) {
        //         if (checkParentRoleExists(req)) {
        //             const roleObj = await getPolicyRules(req, req.decoded.user.user_role, req.decoded.user.parent_id);
        //             if (checkUserIdentityAccess(api_route, http_method, roleObj)) {
        //                 next();
        //                 return null;// return a non-undefined value to signal that we didn't forget to return promise
        //             }
        //         } else {
        //             next();
        //             return null;// return a non-undefined value to signal that we didn't forget to return promise
        //         }
        //     }
        //     return commonHelper.sendResponseData(res, {
        //         status: HTTPStatus.UNAUTHORIZED,
        //         message: messageConfig.roleAuthorize.accessFailure
        //     });
        // }

    };

})(module.exports);
