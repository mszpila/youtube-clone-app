import React, { useEffect, useState } from "react";
import "./SearchPage.css";
import VideoRow from "./VideoRow";
import TuneRoundedIcon from "@material-ui/icons/TuneRounded";
import { useSelector, useDispatch } from "react-redux";
import { setSidebar } from "../actions/sidebar";
import { useLocation, useParams, Link } from "react-router-dom";
import axios from "axios";
import { Avatar, CircularProgress } from "@material-ui/core";

function SearchPage() {
	const sidebarState = useSelector((state) => state.sidebarState);
	const dispatch = useDispatch();
	const location = useLocation();
	const search = useParams().searchTerm;
	const [searchResults, setSearchResults] = useState(null);
	const [data, setData] = useState({});
	// const [isLoading, setIsLoading] = useState(true);
	const [isFetching, setIsFetching] = useState(false);
	let active = true;

	useEffect(() => {
		dispatch(setSidebar(true));
	}, []);

	useEffect(() => {
		axios
			.get("/search/partial", {
				params: { search },
				// withCredentials: true,
			})
			.then((response) => {
				setSearchResults(response.data.results);
				setData((state) => ({
					...state,
					total: response.data.total,
					offset: response.data.offset,
					limit: response.data.limit,
				}));
			})
			.catch((err) => console.error(err.data));
	}, [search]);

	useEffect(() => {
		window.addEventListener("scroll", handleScroll);
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, [data, searchResults]);

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
			windowBottom >= docHeight &&
			searchResults?.length < data.total &&
			active
		) {
			setIsFetching(true);
			active = false;
			axios
				.get("/search/partial", {
					params: { search, offset: data.offset + data.limit },
				})
				.then((response) => {
					setSearchResults((results) => [
						...results,
						...response.data.results,
					]);
					setData((data) => ({
						...data,
						offset: response.data.offset,
					}));
					active = true;
				})
				.catch((err) => console.error(err.data));
		}
	};

	return (
		<div
			className={`searchPage ${
				sidebarState ? null : "searchPage__fullwidth"
			}`}
		>
			<div className="searchPage__filter">
				<div className="searchPage__filter--clickable">
					<TuneRoundedIcon />
					<h2>FILTER</h2>
				</div>
				<hr />
			</div>
			<div className="searchPage__videos">
				{searchResults ? (
					searchResults.length ? (
						searchResults.map((video) => (
							<Link
								key={video._id}
								to={`/video/${video._id}`}
								className="mainPage__link"
							>
								<VideoRow
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
								/>
							</Link>
						))
					) : (
						<div className="videoChannel__removed">No results</div>
					)
				) : null}
			</div>
			{isFetching && searchResults?.length < data.total ? (
				<div className="fetching__spinner">
					<CircularProgress color="#aaaaaa" size={24} />
				</div>
			) : null}
		</div>
	);
}

export default SearchPage;
