(() => {
    "use strict";

    module.exports = {
        rateLimiter: {
            rate_limit: 'Too Many Requests - your IP is being rate limited'
        },
        roleAuthorize: {
            accessFailure: "You are not authorized to perform this action",
            apiAccessDenied: "You are not authorized to access this api route."
        },
        applicationMessage: {
            alreadyExists: "Database with same name already exists",
            serverError: "OOPS!!! Internal Server Error.",
            dataNotModified: "Data not modified",
            noContent: "File content cannot be retrieved",
            dbRestoreFail: "Database not restored. It may be because of invalid backup file format or wrong backup configuration. Please check the configuration in database.config.js inside of lib/configs folder",
            dbRestoreError: "Error Occurs while restroing MongoDB backup file. Please Try again to restore the DB backup file",
            userNotConfirmed: "Action not allowed. Please confirm your email",
            bothEmailSame: "Both email address cannot be same",
            userNotAllowed: "Sorry !! You are not registered, please confirm and try again"
        },
        authFail: {
            authFailMessage: "Authentication failed",
            tokenExpired: "Token Expired",
            tokenInvalid: "Token invalid"
        },
        captchaVerify: {
            notHuman: 'Bot detected. Access Denied. Please check I\'m not a Robot checkbox.'
        },
        commonModule: {
            countryNotFound: "Country Info not found",
            statesNotFound: "States Info not found"
        },
        defaultApp: {
            alreadyExists: "Default user already exists",
            successMessage: "Default user created successfully",
            failureMessage: "Default user creation failed"
        },
        errorMessage: {
            internalServerError: "Internal Server Error"
        },
        fileDelete: {
            fileDelete: 'File deleted successfully',
            fieldRequiredFile: 'No file specified'
        },
        uploadFile: {
            document: 'Only Document files of type (pdf|json|doc|docx|zip|p12) are allowed',
            image: 'Only Image files of type (jpg|jpeg|png|gif) are allowed',
        },
        fileDownload: {
            accessNotAvailable: "File Access denied"
        },
        emailInvalid: {
            message: "Invalid email. Could not resolve the MX record of the email domain.",
            formatMessage: "Please use only letters (a-z), numbers, and periods in the email.",
            suspendedEmailDomain: "This email domain has been temporarily suspended."
        }
    };

})();
