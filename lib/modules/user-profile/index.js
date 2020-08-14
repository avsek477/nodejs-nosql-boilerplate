const userController = (() => {
        'use strict';

        const getAllUsers = require("./methods/user-data/get-all-users");
        const getUserByID = require("./methods/user-data/get-user-by-id");
        const registerUser = require("./methods/user-data/register-user");
        const updateUser = require("./methods/user-data/update-user");
        const deleteUserByID = require("./methods/user-data/delete-user-by-id");
        const updateProfilePicture = require("./methods/user-data/update-profile-picture");
        const changePassword = require("./methods/change-password/change-password-with-auth");
        const requestPasswordChange = require("./methods/change-password/request-password-change");
        const implementForgotPasswordAction = require("./methods/change-password/implement-forgot-password");
        const resendConfirmationEmailNoLogin = require("./methods/confirmation-email/resend");
        const checkReCaptchaEnable = require("./methods/check-captcha-enabled");
        const suspendUser = require("./methods/user-data/suspend-user");
        const blockUser = require("./methods/user-data/block-user");
        const unblockUser = require("./methods/user-data/unblock-user");
        const logOut = require("./methods/logout");
        const findUserInfoByEmail = require("./methods/user-data/get-user-info-by-email");
        const sendMobileValidationToken = require("./methods/mobile-number/send-validation-token");
        const validateMobileNumber = require("./methods/mobile-number/validate-number");

        return {
            getAllUsers,
            getUserByID,
            deleteUserByID,
            changePassword,
            registerUser,
            updateUser,
            updateProfilePicture,
            requestPasswordChange,
            implementForgotPasswordAction,
            resendConfirmationEmailNoLogin,
            checkReCaptchaEnable,
            suspendUser,
            blockUser,
            unblockUser,
            logOut,
            findUserInfoByEmail,
            validateMobileNumber,
            sendMobileValidationToken
        };
    }
)
();

module.exports = userController;
