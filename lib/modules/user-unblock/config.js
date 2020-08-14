(() => {
  "use strict";

  module.exports = {
    message: {
      saveMessage: "User unblocked successfully",
      notFound: "Token not found or it may have been already used",
      notFoundEmailTemplate: "Email Template not found",
      emailError: "OOPS!!! Error occurs while sending email...Please contact site administrator",
      expiredMessage: "User unblock token expired. We have sent you email to unblock your account. Please check your email.",
      alreadyExists: "User account already unblocked"
    },
    config: {
      token_expiry_date_in_hours: 48,
      unblock_api: "unblock/user/",
      token_length: 36
    }
  };

})();
