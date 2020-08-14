const { check, body } = require('express-validator');
const moduleConfig = require('./config');

const emailTemplateValidatorArray = [
    body('template_name', moduleConfig.message.validationErrMessage.template_name).not().isEmpty(),
    body('email_subject', moduleConfig.message.validationErrMessage.email_subject).not().isEmpty(),
    body('email_from', moduleConfig.message.validationErrMessage.email_from).optional().isEmail(),
    body('template_content', moduleConfig.message.validationErrMessage.template_content).not().isEmpty(),
    body('active', moduleConfig.message.validationErrMessage.active).isBoolean()
];

module.exports = {
    emailTemplateValidatorArray
}