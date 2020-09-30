import React, { useState, useEffect } from "react";
import "./VideoSide.css";
import VideoSmallRow from "./VideoSmallRow";
import axios from "axios";
import { Link } from "react-router-dom";
import { CircularProgress } from "@material-ui/core";

function VideoSide() {
	const [videos, setVideos] = useState(new Array(20).fill(""));
	const [isLoading, setIsLoading] = useState(true);
	const [isFetching, setIsFetching] = useState(false);
	const [data, setData] = useState({});
	let active = true;

	useEffect(() => {
		axios.get("/api/video/getVideos").then((response) => {
			setVideos(response.data.videos);
			setData((state) => ({
				...state,
				total: response.data.total,
				offset: response.data.offset,
				limit: response.data.limit,
			}));
			setIsLoading(false);
		});
	}, []);

	useEffect(() => {
		window.addEventListener("scroll", handleScroll);
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, [data, videos]);

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
			videos.length < data.total &&
			active
		) {
			setIsFetching(true);
			active = false;
			axios
				.get("/api/video/getVideos", {
					params: { offset: data.offset + data.limit, limit: 10 },
				})
				.then((response) => {
					setVideos((videos) => [...videos, ...response.data.videos]);
					setData((data) => ({
						...data,
						offset: response.data.offset,
					}));
					setIsLoading(false);
					active = true;
				})
				.catch((err) => console.error("main page error", err.data));
		}
	};

	return (
		<div className="videoSide">
			{videos?.map((video) => (
				<Link
					to={isLoading ? "#" : `/video/${video._id}`}
					className="videoSide__link"
				>
					<VideoSmallRow
						thumbnail={`${video.urls?.thumbnail_url}`}
						preview={`${video.urls?.preview_url}`}
						title={video.title}
						user={video.user?.username}
						views={`${video.views} views`}
						published={video.createdAt}
						duration={video.duration}
						isLoading={isLoading}
					/>
				</Link>
			))}
			{isFetching && videos.length < data.total ? (
				<div className="fetching__spinner">
					<CircularProgress color="#aaaaaa" size={24} />
				</div>
			) : null}
		</div>
	);
}

export default VideoSide;
