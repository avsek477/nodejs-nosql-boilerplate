/**
 * Created by manoj on 3/30/17.
 * SMS Api Reference https://www.clxcommunications.com/help/getting-started/using-rest-api/
 */
(() => {
  'use strict';

  module.exports = {
    twilio_account_sid: process.env.TWILIO_ACCOUNT_SID,
    twilio_auth_token: process.env.TWILIO_AUTH_TOKEN,
    twilio_phone_number: process.env.TWILIO_PHONE_NUMBER,
    sms_message_verification: 'Smart Lawyer verification code: %verification_token%. Use this to finish your account confirmation.',
    sms_message_multi_factor_auth: 'Smart Lawyer Multi-Factor authentication code: %verification_token%. Use this to finish your multi-factor authentication.', //\n - DOC Nepal.
    types: {
      verification: 'verification',
      multi_factor_auth: 'multi_factor_auth'
    }

  };

})();
