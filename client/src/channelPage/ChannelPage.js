import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import axios from "axios";
import { Avatar, CircularProgress } from "@material-ui/core";
import "./ChannelPage.css";
import VideoChannel from "./VideoChannel";
import EditPage from "./EditPage";
import { setLoginState } from "../actions/user";

function ChannelPage() {
	const sidebarState = useSelector((state) => state.sidebarState);
	const dispatch = useDispatch();
	const [myVideos, setMyVideos] = useState(null);
	const [data, setData] = useState({});
	const [isFetching, setIsFetching] = useState(false);
	const history = useHistory();
	const loginState = useSelector((state) => state.loginState);
	const [video, setVideo] = useState(null);
	const [videoId, setVideoId] = useState(null);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [privacy, setPrivacy] = useState(null);
	const [url, setUrl] = useState(null);
	let active = true;

	// setter which step is now active
	const [activeStep, setActiveStep] = useState(0);

	// steps title
	const getSteps = () => {
		return ["Upload", "Complete"];
	};

	// return array of titles
	const steps = getSteps();

	// steps content
	const getStepContent = (stepIndex) => {
		switch (stepIndex) {
			case 0:
				return (
					<div className="channelPage__videos">
						{myVideos ? (
							myVideos.length ? (
								myVideos.map((video) => (
									<VideoChannel
										thumbnail={`/${video.urls.thumbnail_url}`}
										preview={`/${video.urls.preview_url}`}
										title={video.title}
										user={video.user.username}
										views={`${video.views} views`}
										published={video.createdAt}
										duration={video.duration}
										avatar={
											video.avatar ? (
												`${video.avatar}`
											) : (
												<Avatar />
											)
										}
										description={video.description}
										id={video._id}
										privacy={video.private}
										url={video.urls.video_url}
										handleRemove={handleRemove}
										setVideoId={setVideoId}
										setTitle={setTitle}
										setDescription={setDescription}
										setPrivacy={setPrivacy}
										setActiveStep={setActiveStep}
										setUrl={setUrl}
									/>
								))
							) : (
								<div>No videos</div>
							)
						) : null}
						{isFetching && myVideos?.length < data.total ? (
							<div className="fetching__spinner">
								<CircularProgress color="#aaaaaa" size={24} />
							</div>
						) : null}
					</div>
				);
			case 1:
				return (
					<EditPage
						videoId={videoId}
						url={url}
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

	useEffect(() => {
		axios.get("/user/me/").catch((err) => {
			if (loginState) {
				history.push("/login");
			} else {
				history.push("/");
			}
			dispatch(setLoginState(false));
		});
	}, [loginState]);

	const handleSubmit = (e) => {
		e.preventDefault();
		axios
			.post("/video/save", {
				id: videoId,
				title,
				description,
				private: privacy,
			})
			.then(() => history.push(`/video/${video._id}`))
			.catch((err) => console.error(err.data));
	};

	useEffect(() => {
		axios
			.get("/video/myVideos", { withCredentials: true })
			.then((response) => {
				setMyVideos(response.data.videos);
				setData((state) => ({
					...state,
					total: response.data.total,
					offset: parseInt(response.data.offset),
					limit: response.data.limit,
				}));
			})
			.catch((err) => console.error(err.data));
	}, []);

	const handleRemove = (id) => {
		axios.post("/video/remove", { id }, { withCredentials: true });
	};

	useEffect(() => {
		window.addEventListener("scroll", handleScroll);
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, [data, myVideos]);

	const handleScroll = () => {
		const windowHeight =
			"innerHeight" in window
				? window.innerHeight
				: document.documentElement.offsetHeight;
		const body = document.body;
		const html = document.documentElement;
		const docHeight = Math.max(
			body.scrollHeight,
			body.offsetHeight,
			html.clientHeight,
			html.scrollHeight,
			html.offsetHeight
		);
		const windowBottom = windowHeight + window.pageYOffset;
		if (
			windowBottom >= docHeight * 0.9 &&
			myVideos.length < data.total &&
			active
		) {
			setIsFetching(true);
			active = false;
			axios
				.get("/video/myVideos", {
					params: { offset: data.offset + data.limit },
					withCredentials: true,
				})
				.then((response) => {
					setMyVideos((videos) => [
						...videos,
						...response.data.videos,
					]);
					setData((data) => ({
						...data,
						offset: parseInt(response.data.offset),
					}));
					// setIsLoading(false);
					setIsFetching(false);
					active = true;
				})
				.catch((err) => console.error(err.data));
		}
	};

	return (
		<div
			className={`channelPage ${
				sidebarState ? null : "channelPage__fullwidth"
			}`}
		>
			{getStepContent(activeStep)}
		</div>
	);
}

export default ChannelPage;
