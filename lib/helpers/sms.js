module.exports = (() => {
  'use strict';

  const rp = require('request-promise');
  const Promise = require("bluebird");
  const twilio = require('twilio');
  const smsConfig = require('../configs/sms');
  const twilioClient = new twilio(smsConfig.twilio_account_sid, smsConfig.twilio_auth_token);
  const {
    SPARROW_API_KEY,
    SPARROW_SENDER_ID
  } = require('../configs');

  const sendSMS = async (client_number, message_sms) => {
    try{
      if (client_number.substring(0, 4) === "+977") {
        const options = {
          method: 'POST',
          uri: 'http://api.sparrowsms.com/v2/sms/',
          body: {
            'token' : SPARROW_API_KEY,
            'from'  : SPARROW_SENDER_ID,
            'to'    : client_number.substring(4, 16), //phoneNumber.substring(4, 16),
            'text'  : message_sms
        },
          json: true // Automatically stringifies the body to JSON
        };
        const resp = await rp(options);
        return Promise.resolve(true);
      } else {
        return twilioClient.messages.create({
          body: message_sms,
          to: client_number,  // Text this number
          from: smsConfig.twilio_phone_number // From a valid Twilio number
        })
        .then((message) => {
          return Promise.resolve(true);
        })
        .catch((err) => {
          return Promise.resolve(null);
        });
      }
    } catch (err) {
      // throw new Error(err);
      return Promise.resolve(null);
    }
  }

  return {
    sendSMS: sendSMS
  }
})()