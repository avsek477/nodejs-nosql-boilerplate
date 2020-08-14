(() => {
  "use strict";

  module.exports = {
    message: {
      fieldRequired: "Email is required.",
      invalidMessage: "Email and password not matched.",
      loggedIn: "Logged in successfully.",
      accountNotConfirmed: "User email not confirmed. Please check your email and click on confirmation link to verify.",
      blockMessage: "You are currently blocked. Please check your email and click the link.",
      ipBlocked : "Your ip address has been blocked due to repeated entry of invalid login credentials.",
      authProgress : "Authentication already in progress.",
      captch_enable_message: "Captcha enabled.",
      suspensionMessage : "You are suspended currently. For further info, please contact the site administrator."
    },
    config: {
      block_user_login_attempt: 7,
      block_mins: 1,
      block_ip_login_attempt_fixed_time: 6,
      captcha_enable_login_attempt: 5//after
    }
  };

})();
