(function (jwtTokenGeneratorHelper) {

    'use strict';

    var tokenConfigs = require('../configs/token'),
        utilityHelper = require('../helpers/utilities'),
        jwt = require('jsonwebtoken');

    const createUserInfo = function (userObj) {
        var userInfo = {};
        userInfo._id = userObj._id;
        userInfo.email = userObj.email;
        userInfo.first_name = userObj.first_name;
        userInfo.last_name = userObj.last_name;
        userInfo.country_code = userObj.country_code;
        userInfo.mobile_number = userObj.mobile_number;
        userInfo.age = userObj.age;
        userInfo.gender = userObj.gender;
        userInfo.address = userObj.address;
        userInfo.user_role = userObj.user_role;
        userInfo.image_name = userObj.image_name;
        userInfo.image_path = userObj.image_path;
        userInfo.added_on = userObj.added_on;
        userInfo.multi_factor_auth_enable = userObj.multi_factor_auth_enable;
        userInfo.multi_factor_auth_enable_mobile = userObj.multi_factor_auth_enable_mobile;
        userInfo.has_changed_password = userObj.has_changed_password;
        userInfo.has_changed_security_answer = userObj.has_changed_security_answer;
        userInfo.mobile_number_validated = userObj.mobile_number_validated;
        return userInfo;
    };

    jwtTokenGeneratorHelper.generateJWTToken = function (req, userObj) {
        var claims = {
            subject: userObj._id,
            issuer: utilityHelper.getApplicationDeploymentPortNumber(req) ,
            permissions: ['save', 'update', 'read', 'delete']
        };
        var userInfo = createUserInfo(userObj);
        var token = jwt.sign(
            {
                user: userInfo,
                claims: claims
            }, process.env.TOKEN_SECRET, {
                algorithm: tokenConfigs.hashAlgorithm,
                expiresIn: tokenConfigs.expires,// expires in given hours
                issuer: userInfo._id.toString()
            });
        // return the information including token as JSON
        return {
            success: true,
            token: token,
            userInfo: userInfo
        };
    };

})(module.exports);