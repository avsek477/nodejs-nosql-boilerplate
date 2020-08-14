const appConfig = require('../configs/application');
const sendgrid = require('@sendgrid/mail');
const {
  SENDGRID_API_KEY
} = require('../configs');
sendgrid.setApiKey(SENDGRID_API_KEY);

const sendEmail = async (req, {fromEmail, toEmail, subject, textMessage, htmlTemplateMessage, attachments, cc}, next) => {
  return new Promise(async (resolve, reject) => {
    try {
      const mailOpts = {
        from: `${appConfig.email_title} <${fromEmail}>`, // sender address
        to: toEmail, // list of receivers
        subject: subject, // Subject line
        text: textMessage, // plaintext body
        html: htmlTemplateMessage, // html body
        attachments: attachments
      };
      if(cc!==null && cc!==undefined) {
        mailOpts.cc = cc;
      }
      const emailRes = await sendgrid.send(mailOpts);
      resolve(emailRes);
    } catch(err) {
      // reject(err);
      resolve(null);
    }
  });
}

module.exports = {
  sendEmail
}