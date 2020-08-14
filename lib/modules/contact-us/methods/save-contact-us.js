(() => {
    "use strict";

    const Promise = require("bluebird");
    const utilityHelper = require("../../../helpers/utilities");
    const commonHelper = require("../../../common/common-helper-function"); 
    const moduleConfig = require("../config");
    const redisHelper = require("../../../helpers/redis");
    const emailTemplateContentConfigs = require('../../../configs/email-template-content');
    const emailHelper = require("../../../helpers/email-service");
    
    const documentFields = "name email message";

    const sendEmailToAdmin = async (req, next, contactUsObj) => {
        try {
            let messageBody = `<p>Dear all,</p><p>A person name ${contactUsObj.name} (${contactUsObj.email}) left the following message via contact us form in DOCNepal.</p><br></p><strong>${contactUsObj.message}</strong></p>`;
            let message_template = emailTemplateContentConfigs.system_emails;

            if (message_template.indexOf("%email_content%") > -1) {
                message_template = message_template.replace("%email_content%", messageBody);
            }
            const mailOptions = {
                fromEmail: contactUsObj.email, // sender address
                toEmail: process.env.CONTACT_US_TO_EMAIL, // list of receivers
                subject: "Contact Us Message", // Subject line
                textMessage: message_template, // plaintext body
                htmlTemplateMessage: message_template,
                cc: process.env.CC_MAIL
            };
            console.log("CC MAIL", process.env.CC_MAIL, typeof process.env.CC_MAIL)
            const emailRes = await emailHelper.sendEmail(req, mailOptions, next);
            return Promise.resolve(true);
        } catch(err) {
            console.log(err);
            return null;
            // return next(err);
        }
    }

    module.exports = async (req, res, next) => {
        try {
            const modelInfo = utilityHelper.sanitizeUserInput(req, next);
            const contactUsObj = commonHelper.collectFormFields(req, modelInfo, documentFields, undefined);
            const saveResp = await req.db.collection("ContactUs").insertOne(contactUsObj);
            sendEmailToAdmin(req, next, contactUsObj);
            redisHelper.clearDataCache(req);
            return commonHelper.sendJsonResponseMessage(res, saveResp, contactUsObj, moduleConfig.message.contactUsSaved);
        } catch (err) {
            return next(err);
        }
    }
})()