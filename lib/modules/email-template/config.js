(() => {
  "use strict";

  module.exports = {
    message: {
      saveMessage: "Email template saved successfully",
      updateMessage: "Email template updated successfully",
      deleteMessage: "Email template deleted successfully",
      notFound: "Email template not found",
      fieldRequired: "Email template title is required",
      alreadyExists: "Email template with same title already exists",
      documentRemove: 'Document removed successfully',
      fileSelect: 'Please provide file name as query string value or the file doesn\'t exist on the system',
      validationErrMessage:{
        template_name : "Email template title is required",
        email_from: "Sender email is required",
        email_subject : "Subject of email is required",
        template_content : "Content for Email template is required",
        active: "Active status is required"
      }
    },
    config: {
      documentFilePath: '/private-uploads/email-templates/',
      uploadPrefix: 'email-template'
    }
  };

})();
