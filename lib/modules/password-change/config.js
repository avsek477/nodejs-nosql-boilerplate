(() => {
  "use strict";

  module.exports = {
    message: {
      notFound : "Password change verify token not found",
      alreadyExpired : "Password change verify token already expired",
      expired : "Password change verify token expired.",
    },
    config: {
      token_expiry_date_in_hours: 72,
      reset_api: "password-reset/user/",
      token_length: 36
    }
  };

})();
