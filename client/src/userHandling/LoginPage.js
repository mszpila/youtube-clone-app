import React, { useState, useEffect } from "react";
import "./RegistrationPage.css";
import { Link, useHistory } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setLoginState } from "../actions/user";
import { setSidebar } from "../actions/sidebar";

function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState(null);
	const history = useHistory();
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(setSidebar(false));
	}, []);

	const handleSubmit = (e) => {
		e.preventDefault();
		axios
			.post("/user/login", { email, password }, { withCredentials: true })
			.then(() => {
				dispatch(setLoginState(true));
				history.goBack();
			})
			.catch((err) => {
				setError("Invalid cridentials");
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
				<p>Sign in</p>
				<form
					onSubmit={(e) => handleSubmit(e)}
					onChange={(e) => setError(null)}
				>
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

					{error ? (
						<p className="registration__hints registration__error">
							{error}
						</p>
					) : (
						<p>&nbsp;</p>
					)}
					<div className="registration__buttons">
						<Link
							to="/registration"
							className="registration__signin"
						>
							<p>Create account</p>
						</Link>
						<button
							type="submit"
							className="registration__submit"
							onSubmit={(e) => handleSubmit(e)}
						>
							Log in
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

export default LoginPage;
