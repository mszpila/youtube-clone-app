import React, { useState, useEffect } from "react";
import "./MainPage.css";
import VideoCard from "./VideoCard";
import axios from "axios";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setSidebar } from "../actions/sidebar";
import CircularProgress from "@material-ui/core/CircularProgress";

function MainPage() {
	const [videos, setVideos] = useState(new Array(20).fill(""));
	const [data, setData] = useState({});
	const [isLoading, setIsLoading] = useState(true);
	const [isFetching, setIsFetching] = useState(false);
	const sidebarState = useSelector((state) => state.sidebarState);
	const dispatch = useDispatch();
	let active = true;

	useEffect(() => {
		dispatch(setSidebar(true));
		axios
			.get("/video/getVideos")
			.then((response) => {
				setVideos(response.data.videos);
				setData((state) => ({
					...state,
					total: response.data.total,
					offset: response.data.offset,
					limit: response.data.limit,
				}));
				setIsLoading(false);
			})
			.catch((err) => console.error(err.data));
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
		if (windowBottom >= docHeight && videos.length < data.total && active) {
			setIsFetching(true);
			active = false;
			axios
				.get("/video/getVideos", {
					params: { offset: data.offset + data.limit },
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
				.catch((err) => console.error(err.data));
		}
	};

	return (
		<div
			className={`mainPage ${
				sidebarState ? null : "mainPage__fullwidth"
			}`}
		>
			<div className="mainPage__videos">
				{videos.map((video) => (
					<Link
						key={video._id}
						to={isLoading ? "/" : `/video/${video._id}`}
						className="mainPage__link"
					>
						<VideoCard
							thumbnail={`/${video.urls?.thumbnail_url}`}
							preview={`/${video.urls?.preview_url}`}
							title={video.title}
							user={video.user?.username}
							views={`${video.views} views`}
							published={video.createdAt}
							duration={video.duration}
							avatar={video.user?.avatar}
							isLoading={isLoading}
						/>
					</Link>
				))}
			</div>
			{isFetching && videos.length < data.total ? (
				<div className="fetching__spinner">
					<CircularProgress color="#aaaaaa" size={24} />
				</div>
			) : null}
		</div>
	);
}

export default MainPage;
