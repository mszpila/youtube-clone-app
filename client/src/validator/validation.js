import validator from "validator";

/*
 * This class contains methods for validating fields using 'validator.js' library methods
 * The methods return error message if validation failed and false otherwise
 * You can use all supported validators and sanitizers of 'validator.js' libaray
 * See their docs here https://github.com/validatorjs/validator.js
 */

class ValidateFields {
	/*
	 * A method that takes in the email
	 * Validates it
	 * Returns the response either error or false if there is no error
	 */
	validateEmail(email) {
		if (validator.isEmpty(email)) {
			return "Email is required";
		} else if (!validator.isEmail(email)) {
			return "Invalid email";
		}
		return false;
	}

	validatePassword(password) {
		if (validator.isEmpty(password)) {
			return "Password is required";
		} else if (!validator.isLength(password, { min: 8 })) {
			return "Password should be minimum 8 characters";
		}
		return false;
	}

	confirmPassword(password, confirm) {
		if (validator.isEmpty(confirm)) {
			return "Confirmation is required";
		} else if (!validator.equals(password, confirm)) {
			return "Passwords are not the same";
		}
		return false;
	}

	validateUser(user) {
		if (validator.isEmpty(user)) {
			return "User is required";
		} else if (!validator.isLength(user, { min: 3 })) {
			return "Password should be minimum 3 characters";
		} else if (!validator.isAlphanumeric(user)) {
			return "Invalid user. Use only letters and numbers";
		}
		return false;
	}
}

const validateFields = new ValidateFields();
export default validateFields;
