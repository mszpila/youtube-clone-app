import React, { useEffect, useState } from "react";
import "./VideoPage.css";
import axios from "axios";
import { useHistory, Link, useParams } from "react-router-dom";
import Player from "./player/Player";
import ThumbUpRoundedIcon from "@material-ui/icons/ThumbUpRounded";
import ThumbDownRoundedIcon from "@material-ui/icons/ThumbDownRounded";
import { Avatar, Popper, ClickAwayListener } from "@material-ui/core";
import Comments from "./comments/Comments";
import VideoSide from "./videoSide/VideoSide";
import { useSelector, useDispatch } from "react-redux";
import { switchSidebar, setSidebar } from "../actions/sidebar";
import Fingerprint2 from "@fingerprintjs/fingerprintjs";
import Skeleton from "@material-ui/lab/Skeleton";

function VideoPage() {
	let { id } = useParams();

	const [video, setVideo] = useState(null);
	const [subscriptionReaction, setSubscriptionReaction] = useState(false);
	const [videoReaction, setVideoReaction] = useState(null);
	const [subsAmount, setSubsAmount] = useState(null);
	const [hash, setHash] = useState(null);

	const [open, setOpen] = useState(false);

	// material-ui popper setup
	const [anchorEl, setAnchorEl] = useState(null);
	const [btnId, setBtnId] = useState(null);
	const [placement, setPlacement] = useState();
	const [openPop, setOpenPop] = useState(false);

	const sidebarState = useSelector((state) => state.sidebarState);
	const loginState = useSelector((state) => state.loginState);
	const dispatch = useDispatch();
	// const history = useHistory();

	useEffect(() => {
		if (window.requestIdleCallback) {
			requestIdleCallback(function () {
				Fingerprint2.get(function (components) {
					let values = components.map(function (component) {
						return component.value;
					});
					let hash = Fingerprint2.x64hash128(values.join(""), 31);
					setHash(hash);
					axios
						.post("/video/addView", { id, hash })
						.catch((err) => console.error(err.data));
				});
			});
		} else {
			setTimeout(function () {
				Fingerprint2.get(function (components) {
					let values = components.map(function (component) {
						return component.value;
					});
					let hash = Fingerprint2.x64hash128(values.join(""), 31);
					setHash(hash);
					axios
						.post("/video/addView", { id, hash })
						.catch((err) => console.error(err.data));
				});
			}, 500);
		}
	}, [id]);

	useEffect(() => {
		dispatch(setSidebar(false));
		axios
			.get(`/video/getVideoById`, {
				params: { id },
				withCredentials: true,
			})
			.then((response) => {
				console.log('getvideobyid', response.data)
				setVideo(response.data.video);
				setSubsAmount(response.data.video.user.subscribers);
				fetchSubscriptionReaction(response.data.video.user._id);
				window.scrollTo(0, 0);
			})
			.catch((err) => console.error(err.data));
		fetchVideoReaction();
	}, [id]);

	const fetchVideoReaction = () => {
		axios
			.get(`/user/reactionVideo`, {
				params: { videoContext: id },
				withCredentials: true,
			})
			.then((response) => {
				setVideoReaction(response.data.state);
			})
			.catch((err) => console.error(err.data));
	};

	const fetchSubscriptionReaction = (user_id) => {
		axios
			.get(`/user/me/subscribe`, {
				params: { user_id },
				withCredentials: true,
			})
			.then((response) => {
				setSubscriptionReaction(response.data.follow);
			})
			.catch((err) => console.error(err.data));
	};

	const handleClickAway = () => {
		setOpenPop(false);
	};

	const handleClick = (newPlacement) => (event) => {
		setAnchorEl(event.currentTarget);
		setOpenPop((prev) => placement !== newPlacement || !prev);
		setPlacement(newPlacement);
		setBtnId(event.currentTarget.id);
	};

	// for like state = true, for dislike state = false
	const handleVideoReaction = (state) => {
		// save temp state in the case of error to undo the styling
		let tempVideo = video;
		let tempVideoReaction = videoReaction;
		if (videoReaction === null || videoReaction === !state) {
			// if true ==> user wants to set like,
			// if false ==> user wants to set dislike

			// for better ux first set styling
			if (state === true && videoReaction === null) {
				updateVideoState(1, 0);
				setVideoReaction(true);
			} else if (state === true && videoReaction === false) {
				updateVideoState(1, -1);
				setVideoReaction(true);
			} else if (state === false && videoReaction === null) {
				updateVideoState(0, 1);
				setVideoReaction(false);
			} else if (state === false && videoReaction === true) {
				updateVideoState(-1, 1);
				setVideoReaction(false);
			}
			axios
				.post(
					`/user/reactionVideo`,
					{
						video_id: id,
						state,
					},
					{
						withCredentials: true,
					}
				)
				.catch((err) => {
					console.error(err.data);
					// if (loginState) {
					// 	history.push("/login");
					// }
					setVideo(tempVideo);
					setVideoReaction(tempVideoReaction);
				});
		} else if (videoReaction === state) {
			// if true ==> the user wants to turn it off
			// by clicking the same state
			if (state === true) {
				updateVideoState(-1, 0);
				setVideoReaction(null);
			} else if (state === false) {
				updateVideoState(0, -1);
				setVideoReaction(null);
			}
			axios
				.post(
					`/user/reactionVideo`,
					{
						video_id: id,
						state,
					},
					{
						withCredentials: true,
					}
				)
				.catch((err) => {
					console.error(err.data);
					// if (loginState) {
					// 	history.push("/login");
					// }
					setVideo(tempVideo);
					setVideoReaction(tempVideoReaction);
				});
		}
	};

	const updateVideoState = (like, dislike) => {
		setVideo((video) => ({
			...video,
			likes: video.likes + like,
			dislikes: video.dislikes + dislike,
		}));
	};

	const updateSubsAmount = (num) => {
		setSubsAmount((subsAmount) => subsAmount + num);
	};

	const handleSubscribe = () => {
		let tempSubState = subscriptionReaction;
		let tempSubsAmount = subsAmount;
		setSubscriptionReaction(
			(subscriptionReaction) => !subscriptionReaction
		);
		if (subscriptionReaction) {
			updateSubsAmount(-1);
		} else {
			updateSubsAmount(1);
		}
		axios
			.post(
				`/user/me/subscribe`,
				{
					user_id: video.user._id, // id of the video publisher
				},
				{
					withCredentials: true,
				}
			)
			.catch((err) => {
				console.error(err.data);
				// if (loginState) {
				// 	history.push("/login");
				// }
				setSubsAmount(tempSubsAmount);
				setSubscriptionReaction(tempSubState);
			});
	};

	const toggleOpen = () => {
		setOpen((open) => !open);
	};

	const truncateString = (str, num) => {
		if (open || str.length < num) {
			return str;
		}
		return str.slice(0, num) + "...";
	};

	return (
		<div className="videoPage">
			{sidebarState ? (
				<div
					onClick={() => dispatch(switchSidebar())}
					className="videoPage__cover"
				></div>
			) : null}
			<div className="videoPage__main">
				<Player url={video && `/${video.urls?.video_url}`} />
				<div className="videoPage__videoDetails">
					<div className="videoPage__firstSection">
						<div className="videoPage__text">
							<div className="videoPage__title">
								<p>
									{video?.title || (
										<Skeleton
											style={{
												marginBottom: "6px",
												width: "50%",
											}}
										/>
									)}
								</p>
							</div>
						</div>
						{video ? (
							<div className="videoPage__reactions">
								<div className="videoPage__viewsPublished">
									<p>
										{`${video.views} views • ${new Date(
											video.createdAt
										)
											.toUTCString()
											.split(" ")
											.slice(1, 4)
											.join(" ")}`}
									</p>
								</div>
								<div
									className={`videoPage__handsLikes ${
										videoReaction !== null
											? "videoPage__blueBorder"
											: null
									} `}
								>
									<div
										className={`videoPage__likes ${
											videoReaction === true
												? "videoPage__blue"
												: null
										}`}
										id="like"
										onClick={
											loginState
												? () =>
														handleVideoReaction(
															true
														)
												: handleClick("bottom-start")
										}
									>
										<ThumbUpRoundedIcon />
										<p>{video.likes}</p>
									</div>
									<div
										className={`videoPage__dislikes ${
											videoReaction === false
												? "videoPage__blue"
												: null
										}`}
										id="dislike"
										onClick={
											loginState
												? () =>
														handleVideoReaction(
															false
														)
												: handleClick("bottom-start")
										}
									>
										<ThumbDownRoundedIcon />
										<p>{video.dislikes}</p>
									</div>
								</div>
							</div>
						) : (
							<Skeleton
								style={{ marginBottom: "6px", width: "30%" }}
							/>
						)}
						<hr />
					</div>
					<div className="videoPage__secondSection">
						<div className="videoPage__authorStatus">
							<div className="videoPage__authorDetails">
								{video ? (
									<Avatar
										src={video?.user.avatar}
										alt={video?.user.username}
										className="videoPage__avatar"
									/>
								) : (
									<Skeleton
										variant="circle"
										style={{
											marginRight: "6px",
											height: "36px",
											width: "36px",
										}}
									/>
								)}
								<div className="videoPage__authorText">
									<p className="videoPage__username">
										{video?.user.username || (
											<Skeleton
												style={{
													marginBottom: "6px",
													width: "200px",
												}}
											/>
										)}
									</p>
									<p className="videoPage__subs">
										{subsAmount ? (
											subsAmount !== 1 ? (
												`${subsAmount} subscriptions`
											) : (
												"1 subscription"
											)
										) : (
											<Skeleton
												style={{ width: "75%" }}
											/>
										)}
									</p>
								</div>
							</div>
							<button
								className={`videoPage__subscribe ${
									subscriptionReaction
										? "videoPage__subscribed"
										: null
								}`}
								id="subcribe"
								onClick={
									loginState
										? () => handleSubscribe()
										: handleClick("bottom-start")
								}
							>
								{`${
									subscriptionReaction
										? "SUBSCRIBED"
										: "SUBSCRIBE"
								}`}
							</button>
						</div>
						<div className="videoPage__description">
							<p>
								{video &&
									truncateString(video.description, 500)}
							</p>
							{video?.description.length > 500 ? (
								<p
									onClick={toggleOpen}
									className="videoPage__showButton"
								>
									{open ? "SHOW LESS" : "SHOW MORE"}
								</p>
							) : null}
						</div>
						<hr />
					</div>
					{video && (
						<Comments commentsNumber={video.commentsNumber} />
					)}
				</div>
			</div>
			<div className="videoPage__side">
				<VideoSide />
			</div>

			<Popper
				open={openPop}
				anchorEl={anchorEl}
				placement={placement}
				transition
			>
				<ClickAwayListener onClickAway={handleClickAway}>
					<div className="videoPage__popper">
						{btnId === "like" ? (
							<div className="videoPage__popperText">
								<div className="videoPage__popperTitle">
									Do you like this video?
								</div>
								<div className="videoPage__popperInfo">
									Sign in for your opinion to be taken into
									account.
								</div>
							</div>
						) : btnId === "dislike" ? (
							<div className="videoPage__popperText">
								<div className="videoPage__popperTitle">
									Do you dislike this video?
								</div>
								<div className="videoPage__popperInfo">
									Sign in for your opinion to be taken into
									account.
								</div>
							</div>
						) : (
							<div className="videoPage__popperText">
								<div className="videoPage__popperTitle">
									Do you want to subscribe this channel?
								</div>
								<div className="videoPage__popperInfo">
									Sign in to subscribe this channel.
								</div>
							</div>
						)}
						<Link to="/login" className="videoPage__link">
							<p className="videoPage__signIn">SIGN IN</p>
						</Link>
					</div>
				</ClickAwayListener>
			</Popper>
		</div>
	);
}

export default VideoPage;
