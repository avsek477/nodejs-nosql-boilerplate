(() => {
  'use strict';

  const express = require('express');
  const app = express();

  module.exports = {
    user: {
      defaultUserFirstName: 'Doctor',
      defaultUserLastName: 'On Call',
      defaultPassword: 'Test@123',
      defaultUserEmail: 'avsek.stha07@gmail.com',
      defaultUserRole: 'superadmin'
    },
    login: {
      maxFailedLoginAttempt: 5,
      initialBlockLoginAttemptForCertainTime: 3,
      maxBlockedTime: 1440,//in minutes
    },
    passwordChangeToken: {
      expiry: '24'//in hours
    },
    userConfirmationToken: {
      expiry: '24'//in hours
    },
    userUnBlockToken: {
      expiry: '24'//in hours
    },
    maxFailedLoginAttempt: 10,
    client_app_url: process.env.CLIENT_APP_URL,
    support_default_email: "support@doc.com",
    noreply_email: "noreply@doc.com",
    email_title: "Doctor On Call"
  };

})();
