(() => {
  "use strict";

  module.exports = {
    message: {
      saveMessage: "User email validated successfully",
      registrationCompleteMessage: "Registration has been done. It's on verification process.Your account will be verified with in 24 hrs.",
      alreadyExists: "User email already validated",
      notFound: "User confirmation token not found",
      emailError: "OOPS!!! Error occurs while sending email...Please contact site administrator",
      expiredMessage: "User confirmation token already expired. We have sent you a new confirmation email.",
      usedToken :"Link is dead. Confirmation Token has already been used or it might be invalid token."
    },
    config: {
      token_expiry_date_in_hours: 72,
      confirm_api: "confirm/user/",
      token_length: 36
    },
    notifications: {
      account_confirmation: "Your email is now verified."
    },
    push_notification: {
      title: {
        confirmation: "Account verified."
      }
    }
  };

})();
