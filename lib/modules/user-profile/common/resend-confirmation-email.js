(() => {
    "use strict";

    const HTTPStatus = require("http-status");
    const Promise = require("bluebird");
    const moduleConfig = require("../config");
    const userConfirmationTokenController = require('../../user-confirmation');

    module.exports = async (req, res, next, userObj) => {
        try {
            if (userObj && userObj.confirmed) {
                return Promise.resolve({
                    status: HTTPStatus.CONFLICT,
                    message: moduleConfig.message.accountAlreadyConfirmed
                });
            } else {
                const emailRes = await userConfirmationTokenController.sendEmailToUser(req, res, userObj, true, next);
                return Promise.resolve({
                    status: (emailRes && Object.keys(emailRes).length > 0) ? HTTPStatus.OK : HTTPStatus.SERVICE_UNAVAILABLE,
                    message: (emailRes && Object.keys(emailRes).length > 0) ? moduleConfig.message.emailConfirmationLink : moduleConfig.message.emailError
                });
            }
        } catch (err) {
            return next(err);
        }
    }
})()