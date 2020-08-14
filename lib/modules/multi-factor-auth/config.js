(() => {
  "use strict";

  module.exports = {
    message: {
      brcNotFound: "No backup recovery codes found.",
      notVerified : "TOTP Token not verified.",
      notFound : "TOTP token not found.",
      userNotFound: "User not found.",
      notValidated: "Multi-Factor authentication failed. Please enter correct code.",
      verifySuccess : "Multi-Factor authentication for user verified successfully.",
      disabled : "Multi-Factor authentication disabled for the account successfully.",
      already_enabled: "Multi-Factor authentication already enabled.",
      mobileNumberNotAssociated: "Mobile number doesn't appear to be associated to the user account.",
      sms_sent:'Multi-Factor authentication code sent to your mobile number.',
      emailError: "Oops! Error occurs while sending email...Please contact site administrator.",
      smsError: "Oops! Something went wrong while sending sms. Please try again later.",
      recoveryCodeSentSuccess: "Recovery code sent successfully. Please check your email. Please note that recovery code will be valid only for 30 mins.",
      referCodeNotValid: "Refer code not valid.",
      recoveryCodeCreateSuccess: "New recovery code for multi-factor authentication created successfully.",
      mobileMultiFactorNotEnabled: "Two factor authentication not enabled yet.",
      validationErrMessage:{
        mobile_number: "Please enter valid mobile number.",
        country_code: "Please enter country code.",
        userIdRequired: "Please enter a valid user id."
      }
    },
    config: {
      mobile_token_length: 6,
      recovery_code_length: 6,
      recovery_code_time_validity: 30, //mins
      backup_recovery_code_nos: 5
    }
  };

})();

