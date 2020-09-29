import React from "react";
import "./App.css";
import Header from "./header/Header";
import Sidebar from "./sidebar/Sidebar";
import MainPage from "./mainPage/MainPage";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import SearchPage from "./searchPage/SearchPage";
import RegistrationPage from "./userHandling/RegistrationPage";
import LoginPage from "./userHandling/LoginPage";
import UploadPage from "./uploadPage/UploadPage";
import VideoPage from "./videoPage/VideoPage";
import ChannelPage from "./channelPage/ChannelPage";
import EditPage from "./channelPage/EditPage";
import { useSelector } from "react-redux";

function App() {
	const loginState = useSelector((state) => state.loginState);
	return (
		<div className="app">
			<BrowserRouter>
				<Header />
				<Sidebar />
				<Switch>
					<Route path="/edit">
						<EditPage />
					</Route>
					<Route path="/channel">
						<ChannelPage />
					</Route>
					<Route path="/video/:id">
						<VideoPage />
					</Route>
					<Route path="/search/:searchTerm">
						<SearchPage />
					</Route>
					<Route path="/upload">
						<UploadPage />
					</Route>
					<Route path="/login">
						{!loginState ? <LoginPage /> : <Redirect to="/" />}
					</Route>
					<Route path="/registration">
						{!loginState ? (
							<RegistrationPage />
						) : (
							<Redirect to="/" />
						)}
					</Route>
					<Route path="/">
						<MainPage />
					</Route>
				</Switch>
			</BrowserRouter>
		</div>
	);
}

export default App;
