(() => {
  "use strict";

  const roleConfig = require('../../configs/role');

  module.exports = {
    message: {
      saveMessage: "Role saved successfully",
      updateMessage: "Role updated successfully",
      deleteMessage: "Role deleted successfully",
      notFound: "Role not found",
      alreadyExists: "Role already exists",
      validationErrMessage:{
        roleName : "Role is required",
        roleDescription: "Role description is required",
        roleNameTooManyCharacters: "Role name cannot be more than 100 characters",
        roleDescriptionTooManyCharacters: "Role description cannot be more than 1000 characters",
        allowedRoutesArr: "Allowed routes must be an array",
        pathString: "Allowed route must be a url string",
        methodNotAvailable: "Not a recognized route method",
        moduleString: "Module must be a string",
        moduleNotRecognized: "No such module found",
        routeNotRecognized: "No such api route available"
      }
    },
    config: {
      roles:[
        {
          role_name: roleConfig.superadmin,
          role_description: 'Super Admin'
        },
        {
          role_name: roleConfig.lawyer,
          role_description: 'Lawyer'
        },
        {
          role_name: roleConfig.customer,
          role_description: 'Customer'
        }
      ]
    }
  };

})();
