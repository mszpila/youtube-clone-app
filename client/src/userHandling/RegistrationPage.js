import React, { useState, useEffect } from "react";
import "./RegistrationPage.css";
import { Link, useHistory } from "react-router-dom";
import validateFields from "../validator/validation";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setLoginState } from "../actions/user";
import { setSidebar } from "../actions/sidebar";

function RegistrationPage() {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmation, setConfirmation] = useState("");
	const [error, setError] = useState(null);
	const dispatch = useDispatch();
	const history = useHistory();

	useEffect(() => {
		dispatch(setSidebar(false));
	}, []);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (validateFields.validateUser(username))
			return setError("Invalid username");
		else if (validateFields.validateEmail(email))
			return setError("Invalid email");
		else if (validateFields.validatePassword(password))
			return setError("Invalid password");
		else if (validateFields.confirmPassword(password, confirmation))
			return setError("Passowrds must be the same");
		axios
			.post("/user/signup", {
				username,
				email,
				password,
			})
			.then(() => {
				dispatch(setLoginState(true));
				history.push("/");
			})
			.catch((err) => {
				setError(err.response.data.message);
				console.error(err.response.data);
			});
	};

	return (
		<div className="registration">
			<div className="registration__form">
				<img
					className="registration__logo"
					src="https://cdn.worldvectorlogo.com/logos/google-2015.svg"
					alt=""
				/>
				<p>Create your account</p>
				<form
					onSubmit={(e) => handleSubmit(e)}
					onChange={(e) => setError(null)}
				>
					<div className="registration__field">
						{/* User field */}
						<input
							type="text"
							name="user"
							value={username}
							placeholder="Username"
							onChange={(e) => setUsername(e.target.value)}
						/>
						<p className="registration__hints">
							You can use letters &amp; numbers
						</p>
					</div>
					{/* Email field */}
					<div className="registration__field">
						<input
							type="text"
							name="email"
							value={email}
							placeholder="Email"
							onChange={(e) => setEmail(e.target.value)}
						/>
						<div className="registration__invalid-feedback">
							{email.error}
						</div>
					</div>

					{/* Password field */}
					<div className="registration__passwords">
						<div className="registration__field first">
							<input
								type="password"
								name="password"
								value={password}
								placeholder="Password"
								onChange={(e) => setPassword(e.target.value)}
							/>
							<div className="registration__invalid-feedback">
								{password.error}
							</div>
						</div>

						{/* Confirmation field */}
						<div className="registration__field">
							<input
								type="password"
								name="confirmaiton"
								value={confirmation}
								placeholder="Confirm"
								onChange={(e) =>
									setConfirmation(e.target.value)
								}
							/>
							<div className="registration__invalid-feedback">
								{confirmation.error}
							</div>
						</div>
					</div>
					<p className="registration__hints">
						Use 8 or more characters with a mix of letters, numbers
						&amp; symbols
					</p>
					{error ? (
						<p className="registration__hints registration__error">
							{error}
						</p>
					) : (
						<p>&nbsp;</p>
					)}
					<div className="registration__buttons">
						<Link to="/login" className="registration__signin">
							<p>Sign in instead</p>
						</Link>
						<button
							type="text"
							className="registration__submit"
							onSubmit={(e) => handleSubmit(e)}
						>
							Register
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

export default RegistrationPage;
