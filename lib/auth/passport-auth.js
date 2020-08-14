const passportAuth = (() => {
    "use strict";

    const HTTPStatus = require('http-status');
    const passport = require('passport');
    const captchaHelper = require('../helpers/recaptcha');
    const LocalStrategy = require('passport-local').Strategy;
    const moduleConfig = require('../modules/login-auth/config');
    const userController = require('../modules/user-profile/index');
    const loginController = require('../modules/login-auth/index');
    const appMessageConfig = require('../configs/message');
    const utilityHelper = require('../helpers/utilities');
    const commonHelper = require('../common/common-helper-function');

    // use local strategy
    passport.use('local-login', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        async (req, email, password, done) => {
            if (!email) {
                return done(null, {
                    status:HTTPStatus.NOT_FOUND,
                    message: moduleConfig.message.fieldRequired
                });
            }
            email = email.trim().toLowerCase();
            //check to see if the user with the provided username exists in the collection or not
            const user = await userController.findUserInfoByEmail(req, email);
            //if user exists, do further operations
            //if user do not exists, then send the login failure message
            if (!user) {
                return loginController.customErrorResponse(req, req.res, {
                    status: HTTPStatus.UNAUTHORIZED,
                    message: moduleConfig.message.invalidMessage
                }, done);
            }
            if (!user.password) {
                return commonHelper.sendNormalResponse(req.res, {
                    password_set: false,
                    user_id: user._id
                }, HTTPStatus.BAD_REQUEST);
            }
            if (utilityHelper.containsElementInArr(user.captcha_enable_ips, req.client_ip_address, done) && !req.mobil_detection) {
                const captchaRes = await captchaHelper.verifyHuman(req, done);
                if (captchaRes && captchaRes.success === false) {
                    return loginController.customErrorResponse(req, req.res, {
                        status: HTTPStatus.UNAUTHORIZED,
                        message: appMessageConfig.captchaVerify.notHuman
                    }, done);
                } else {
                    return loginController.validateLoginCredentials(req, user, email, password, done);
                }
            } else {
                return loginController.validateLoginCredentials(req, user, email, password, done);
            }
        }
    ));

})();

module.exports = passportAuth;
