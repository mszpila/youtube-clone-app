import React, { useEffect, useState } from "react";
import "./Comments.css";
import Commentary from "./Commentary";
import axios from "axios";
import { useParams } from "react-router-dom";
import { CircularProgress } from "@material-ui/core";
import SortIcon from "@material-ui/icons/Sort";
import CommentInput from "./CommentInput";

function Comments({ commentsNumber }) {
	let { id } = useParams();
	const [commentsFetch, setCommentsFetch] = useState(null);
	const [data, setData] = useState({});
	let active = true;

	// temporary comments to display immediately the comment that user
	// has added
	const [tempComments, setTempComments] = useState([]);

	// variable to correct amount of comments after the user has added
	// comment, init is based on the fetched amount of comments from the
	// video
	const [commentsAmount, setCommentsAmount] = useState(null);

	const [isFetching, setIsFetching] = useState(true);

	useEffect(() => {
		axios
			.get(`/video/getComments`, {
				params: { id },
			})
			.then((response) => {
				setCommentsFetch(response.data.comments);
				setData((state) => ({
					...state,
					total: response.data.total,
					offset: response.data.offset,
					limit: response.data.limit,
				}));
			})
			.catch((err) => console.error(err.data));
		setTempComments((tempComments) => []);
	}, [id]);

	useEffect(() => {
		setCommentsAmount(commentsNumber);
	}, [commentsNumber]);

	useEffect(() => {
		window.addEventListener("scroll", handleScroll);
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, [data, commentsFetch]);

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
			commentsFetch.length < data.total &&
			active
		) {
			setIsFetching(true);
			active = false;
			axios
				.get("/video/getComments", {
					params: { id, offset: data.offset + data.limit },
				})
				.then((response) => {
					setCommentsFetch((comments) => [
						...comments,
						...response.data.comments,
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
		<div className="comments__container">
			{/* number of comments and sort icon */}
			<div className="comments__info">
				<div className="comments__commentsNum">
					{commentsAmount !== 1
						? `${commentsAmount} comments`
						: "1 comment"}
				</div>
				<div className="comments__sortIcon">
					<SortIcon />
					<p>SORT BY</p>
				</div>
			</div>
			{/* add comment, props is a video id to post addComment req */}
			<CommentInput
				video_id={id}
				type={"comment"}
				tempArray={tempComments}
				setTempArray={setTempComments}
				setCommentsAmount={setCommentsAmount}
			/>
			{/* place for state comment array, give it to the commentInput child */}
			{tempComments.length
				? tempComments.map((comment) => comment)
				: null}
			{/* fetched comments */}
			{commentsFetch?.length
				? commentsFetch?.map((comment) => (
						<Commentary
							video_id={comment.videoId}
							comment_id={comment._id}
							user={comment.author.username}
							avatar={comment.author.avatar}
							date={comment.createdAt}
							modify={comment.updatedAt}
							content={comment.content}
							likes={comment.likes}
							dislikes={comment.dislikes}
							reply={comment.reply}
							repliesNumber={comment.repliesNumber}
						/>
				  ))
				: null}
			{isFetching && commentsFetch?.length < data.total ? (
				<div className="fetching__spinner">
					<CircularProgress color="#aaaaaa" size={24} />
				</div>
			) : null}
		</div>
	);
}

export default Comments;
