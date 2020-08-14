(() => {
    "use strict";

    module.exports = {
        message: {
            noEmailUsedForRegistration: "Please update your email in your profile before we can send you a confirmation link.",
            emailNotValidatedYet: "Sorry!! The given email hasn't been validated yet.",
            registeredMobileNumberRequired: "Please enter the mobile number you registered with.",
            saveMessage: "User created and saved successfully. Please verify your account via the link sent in email.",
            saveMessageAdminUser: "User created and saved successfully.",
            saveMessageFailure: "OOPS! Something went wrong. Please try again later.",
            updateMessage: "User updated successfully",
            profilePictureUploaded: "Profile picture uploaded successfully.",
            deleteMessage: "User deleted successfully",
            suspendMessage: "User suspended successfully.",
            removeSuspension: "User suspension removed successfully.",
            suspendMessageUnable: "User with superadmin role cannot be suspended.",
            passwordUpdateMessage: "Password changed successfully",
            securityAnswerMessage: "Security answer changed successfully",
            notFound: "User not found",
            emailOrNumberRequired: "Either email or mobile number is required for registration",
            emailConfirmationLink: "Email confirmation link sent successfully",
            fieldRequired: "Email is required",
            alreadyExists: "User with same email or validated mobile number already exists",
            alreadyExistsEmail: "User with same email already exists",
            alreadyExistsSignupMobileNumber: "User with same mobile number already exists",
            alreadyExistsMobileNumber: "Mobile number is already validated by other user",
            alreadyExistsMrnNumber: "Doctor with same NMC number already exists",
            superAdminDeleteMessage: "Superadmin user cannot be deleted",
            unblockStatusMessage: "User unblocked successfully.",
            blockStatusMessage: "User blocked successfully.",
            emailUpdateMessage: "User email updated successfully.",
            passwordEqUsername: "Password must not contain the username.",
            passwordSame: "Please use different password. i.e Please enter valid old password and new password must be at least 6 characters long",//containing a combination of lowercase, uppercase, numbers and special characters,
            passwordChangeConfirmationEmail: "An email has been sent to your email address that contains the link to change your password. Please check your email.",
            weakPassword: "Password is very weak. Password should be at least 6 characters long",//Please try the combination of lowercase alphabets, uppercase alphabets, numbers, symbols and a minimum of 8 characters long password
            notRegisteredEmail: "You are not authorized to change the password. Please enter the valid email address you are registered with.",
            notAllowedToChangeSuperAdminPassword: "You are not allowed to change the password of superadmin",
            notAllowedToChangeOthersPassword: "You are not allowed to change the password of other user",
            notAllowedToChangePassword: "You are not allowed to change the password",
            passwordMatchOldPassword: "Please enter different password than the old one.",
            emailError: "OOPS!!! Some error occurred while sending email. Please contact site administrator.",
            invalidMessage: "Invalid credentials",
            accountNotConfirmed: "User email not confirmed. Please click on the link sent to you in the confirmation email to verify your account.",
            accountNotConfirmedAdminMessage: "User account isn't confirmed yet.",
            blockMessage: "You are currently blocked. Please check your email and click the link.",
            ipBlocked: "Your ip address has been blocked due to repeated entry of invalid login credentials",
            authProgress: "Authentication already in progress",
            suspensionMessage: "You are suspended currently. For further info, please contact the site administrator.",
            accountAlreadyConfirmed: "Account already confirmed",
            accountConfirmed: "Account confirmed. Please log in to continue.",
            registrationCompleteMessage: "Registration has been done. It's on verification process.Your account will be verified with in 24 hrs.",
            smsSent: 'Validity Token sent through the SMS successfully',
            smsError: "Error while sending SMS...Please check your mobile number.",
            notFoundSms: "OTP code expired or has already been used.",
            mobileNumberValidated: 'Mobile number already validated',
            emailValidated: "Email already validated",
            mobile_number_not_exists: "Mobile number doesn't appear to be associated to the user account",
            mobileValidationSuccess: "Mobile number validated successfully.",
            mobile_remove_success: "Mobile number removed successfully",
            userLogout: "User logged out of the system successfully",
            oldPasswordMismatch: "The old password you entered is invalid",
            passwordNotStrong: "Password must be at least 6 characters long ",//and must contain a combination of lowercase, uppercase, numbers and special characters
            captchEnable: "Captcha is enabled",
            bankAccountSavedSuccess: "Bank Account Saved",
            disposableEmail: "Disposable email are not allowed.",
            verify_mobile_number: "Please verify mobile number first to enable mobile two factor authentication",
            bankAccountDocumentDeleteSuccess: "Document deleted successfully",
            passwordNotSet: "Your user account has not been set password.",
            invalidEmailUpdateToken: "Email Update token is invalid. Either the time validity is expired or it might have been already used",
            invalidEmailVerificationToken: "Invalid verification token for the new email to be updated. It might have been already used or token is invalid.",
            userVerificationFailed: "Couldn't verify the previous email address specified by the user",
            emailUpdateSuccess: "Email updated successfully",
            notFoundTokenInfo: "Data not available",
            emailConfirmationTokenSent: "Email confirmation token sent successfully",
            emailUpdateVerificationTokenSent: "Verification link sent successfully",
            userInfoNotModified: "User info not modified",
            mobileNumberNotRegistered: "Please update your profile with a valid mobile number.",
            validationErrMessage: {
                userEmailDoesntExists: "Sorry!! Such email hasn't been registered yet.",
                covidExpertInfoRequired: "Please enter if you can provide covid consulation or not.",
                specializationRequired: "Please enter a valid specialization from the given options",
                dobRequired: "Please enter a valid date of birth.",
                firstName: "First name is required",
                firstNameMaxLength: 'First name cannot be more than 50 characters or cannot any number or special characters',
                firstNameCannotContainSpecialCharacters: 'Please enter a first name with no special characters',
                middleName: "Please enter a valid middle name",
                middleNameMaxLength: 'Middle name cannot be more than 50 characters or cannot any number or special characters',
                middleNameCannotContainSpecialCharacters: 'Please enter a middle name with no special characters',
                lastNameCannotContainSpecialCharacters: 'Please enter a last name with no special characters',
                lastName: "Last name is required",
                lastNameMaxLength: 'Last name cannot be more than 50 characters or cannot any number or special characters',
                associatedHospitalRequired: "Associated Hospital is required",
                qualificationRequired: "Qualification of doctor is required",
                otherInformation: "Please add some relavent information about yourself",
                regNumberRequired: "Please enter your medical council registration number",
                dobRequired: "Date of birth is required",
                dobGreater: "Date of birth cannot be greater than the current date",
                notValidAddressOne: 'Please enter a valid first address',
                notValidAddressTwo: 'Please enter a valid second address',
                notValidCity: 'Please enter a valid city',
                notValidCountry: 'Please enter a valid country',
                notValidState: 'Please enter a valid state/region',
                notValidPostalCode: 'Please enter a valid postal code',
                notValidSmsToken: 'Please enter a valid token',
                email: "Email is required.",
                emailValid: "Invalid Email.",
                numberOrEmailRequired: "Email or mobile number is required",
                user_role: "User role is required",
                userRoleDoesntExists: "Such user role doesn't exists.",
                gender: "Gender of the person is required",
                agree_terms_condition: "Please accept privacy Terms and Conditions",
                agree_terms_condition_valid: "Please enter valid boolean value",
                security_question: "security question is mandatory",
                security_answer: "security answer is mandatory",
                password: "Password is required",
                passwordOld: "Please enter old password",
                password_valid_length: "Password must be at least 6 characters long",
                invalidPassword: "Please enter password as specified in instructions",
                email: "Email is required.",
                mobileNumber: "Please enter valid mobile number.",
                noEmailMobileNumberRequired: "Mobile number is required if no email is provided",
                countryCode: "Please enter country code",
                account_holder_name: "Please enter account holder's name",
                bank_name: "Bank Name is Required",
                swift_code: "Swift Code is Required",
                bank_branch_address: "Bank Branch Address is Required",
                routing_number_valid: "Please enter valid routing number",
                bank_account_type: "Please Select Bank Account Type",
                bank_account_number: "Please enter bank account number",
                billing_address_country: "Please enter country name for billing address",
                billing_address_city: "Please enter city name for billing address",
                billing_address_zip_postal_code: "Please enter zip/postal name for billing address",
                billing_address_state_region_province: "Please enter state/region/province name for billing address",
                billing_address_address_line_1: "Please enter Address Line 1 for billing address",
                previous_email: "Previous email address is required",
                previous_email_invalid: "Previous email address is invalid",
                new_email: "New email address is required",
                new_email_invalid: "New email address is invalid",
                email_verification_code: "Email Verification code is required",
            },
        },
        config: {
            database: "User",
            documentFilePath: '/private-uploads/user-profiles/',
            uploadPrefix: 'user-profile',
            commonPasswordFilePath: '/lib/static-data/10k_most_common.txt',
            mobile_token_length: 6,
            token_length: 8,
            pwd_length: 10,
            sms_message: 'Your verification code is',
            sms_sender: '+14439988664',
            token_expiry_date_in_mins: 25,
            verification_link: "email-update/verification/",
            token_expiry_date_in_hours: "720",
            passwordRegex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,21})/, // /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
            specialization: [
                "Orthopedist",
                "Cardiologist",
                "Gastroenterologist",
                "Radiologist",
                "Dermatologist",
                "Anesthesiologist",
                "Otolaryngologist",
                "Urologist",
                "Oncologist",
                "Ophthalmologist",
                "Emergency Physician",
                "Surgeon",
                "Pulmonologist",
                "Gynecologists",
                "Nephrologist",
                "Psychiatrist",
                "Allergist/Immunologist",
                "Rheumatologist",
                "Neurologist",
                "Endocrinologist",
                "Pediatrician",
                "General Practitioner",
                "Pediatrics",
                "Dental Surgeon",
                "Internal Medicine(Physician)",
                "Medical Officer",
                "Obstetrics and Gynaecology",
                "Pathology",
                "Physiotherapy",
                "Nutrition & Dietetics"
            ]
        },
        notifications: {
            welcome_message: "Welcome to Doctors on Call.",
            changed_password: "Password changed successfully",
            changed_security_ans: "Security answer changed successfully",
            email_confirmation_prompt_message: "To enjoy the best experiences, Please confirm your email by clicking the link sent to you.",
            profile_info_message: "Your profile information has been updated.",
            email_update_message: "Your username and email is updated successfully. Please use new username to get access to the dashboard."
        },
        push_notification: {
            title: {
                welcome_message: "Welcome to the Doctors On Call.",
                email_update_message: "Username and Email update Notification",
                profile_information_updated: "Profile information updated"
            }
        },
        projectionFields: {
            "general": {
                '_id': true,
                'first_name': true,
                'middle_name': true,
                'last_name': true,
                'email': true,
                'age': true,
                'gender': true,
                'address': true,
                'mobile_number': true,
                'mobile_number_validated': true,
                'user_role': true,
                'image_name': true,
                'image_path': true,
                'image_mimetype': true,
                'multi_factor_auth_enable': true,
                'multi_factor_auth_enable_mobile': true,
                'has_changed_password': true,
                'has_changed_security_answer': true,
                'security_question': true,
                // 'suspend': true,
                'blocked': true,
                'confirmed': true,
                'added_on': true
            },
            "doctor": {
                'registration_number': true,
                'user_id': true,
                'age': true,
                'gender': true,
                'address': true,
                'qualification': true,
                'associated_hospital': true,
                'specialization': true,
                'other_information': true,
                'covid_expert': true,
                'verified': true,
                "citizenship_image_path" : true,
                "citizenship_image_name" : true,
                "citizenship_image_mimetype" : true,
                "mrn_certificate_image_path" : true,
                "mrn_certificate_image_name" : true,
                "mrn_certificate_image_mimetype" : true
            }
        }
    };

})();