import React, { useState, useEffect } from "react";
import "./UploadPage.css";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setSidebar } from "../actions/sidebar";
import { useHistory } from "react-router-dom";
import UploadVideo from "./UploadVideo";
import UploadForm from "./UploadForm";
import { setLoginState, saveUser } from "../actions/user";

function UploadPage() {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [privacy, setPrivacy] = useState(true);
	const [category, setCategory] = useState("");
	const sidebarState = useSelector((state) => state.sidebarState);
	const [video, setVideo] = useState("");
	const [progress, setProgress] = useState(null);
	const dispatch = useDispatch();
	const history = useHistory();
	const loginState = useSelector((state) => state.loginState);

	// setter which step is now active
	const [activeStep, setActiveStep] = useState(0);

	// steps title
	const getSteps = () => {
		return ["Upload", "Complete"];
	};

	// return array of titles
	const steps = getSteps();

	useEffect(() => {
		axios.get("/api/user/me/").catch((err) => {
			console.error(err.data);
			if (loginState) {
				history.push("/login");
			} else {
				history.push("/");
			}
			dispatch(setLoginState(false));
		});
	}, [loginState]);

	useEffect(() => {
		dispatch(setSidebar(true));
	}, []);

	// steps content
	const getStepContent = (stepIndex) => {
		switch (stepIndex) {
			case 0:
				return <UploadVideo handleDrop={handleDrop} />;
			case 1:
				return (
					<UploadForm
						progress={progress}
						video={video}
						handleSubmit={handleSubmit}
						title={title}
						setTitle={setTitle}
						description={description}
						setDescription={setDescription}
						privacy={privacy}
						setPrivacy={setPrivacy}
					/>
				);
			default:
				return "Unknown stepIndex";
		}
	};

	const handleDrop = (files) => {
		axios
			.get("/api/user/me/")
			.then((response) => {
				console.log("/api/user/me 1", response);
				dispatch(setLoginState(true));
				dispatch(saveUser(response.data));
			})
			.catch((err) => {
				if (loginState) {
					history.push("/login");
				}
				dispatch(setLoginState(false));
			});
		setActiveStep((prevActiveStep) => prevActiveStep + 1);
		let formData = new FormData();
		const config = {
			header: { "content-type": "multipart/form-data" },
			onUploadProgress: function (progressEvent) {
				var percentCompleted = Math.round(
					(progressEvent.loaded * 100) / progressEvent.total
				);
				if (
					percentCompleted === 20 ||
					percentCompleted === 40 ||
					percentCompleted === 60 ||
					percentCompleted === 80 ||
					percentCompleted === 100
				) {
					axios
						.get("/api/user/me/")
						.then((response) => {
							dispatch(setLoginState(true));
							dispatch(saveUser(response.data));
						})
						.catch((err) => {
							console.error(err.data);
							if (loginState) {
								history.push("/login");
							}
							dispatch(setLoginState(false));
						});
				}
				setProgress(percentCompleted);
			},
		};
		formData.append("video", files[0]);
		console.log("formData append video");
		axios
			.post("/api/video/upload", formData, config)
			.then((response) => {
				console.log("response on upload", response.data);
				setVideo(response.data);
			})
			.catch((err) => console.error(err.data));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		axios
			.post("/api/video/save", {
				id: video._id,
				title,
				description,
				private: privacy,
				category,
			})
			.then(() => history.push(`/video/${video._id}`))
			.catch((err) => console.error(err.data));
	};

	return (
		<div className={`upload ${sidebarState ? null : "upload__fullwidth"}`}>
			{getStepContent(activeStep)}
		</div>
	);
}

export default UploadPage;
