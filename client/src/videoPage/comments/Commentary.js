import React, { useState, useEffect } from "react";
import "./Commentary.css";
import { Avatar, CircularProgress } from "@material-ui/core";
import ThumbUpRoundedIcon from "@material-ui/icons/ThumbUpRounded";
import ThumbDownRoundedIcon from "@material-ui/icons/ThumbDownRounded";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ArrowDropUpIcon from "@material-ui/icons/ArrowDropUp";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import CommentInput from "./CommentInput";
import axios from "axios";
dayjs.extend(relativeTime);

function Commentary({
	video_id,
	comment_id,
	user,
	avatar,
	date,
	modify,
	content,
	likes,
	dislikes,
	reply,
	repliesNumber,
}) {
	const [addReply, setAddReply] = useState(false);
	const [showReplies, setShowReplies] = useState(false);
	const [repliesFetch, setRepliesFetch] = useState(null);
	const [commentReaction, setCommentReaction] = useState(null);
	const [likesAmount, setLikesAmount] = useState(likes);
	const [tempReplies, setTempReplies] = useState([]);
	const [repliesAmount, setRepliesAmount] = useState(repliesNumber);
	const [isFetching, setIsFetching] = useState(false);

	useEffect(() => {
		fetchCommentState();
		setTempReplies((tempReplies) => []);
	}, []);

	const fetchCommentState = () => {
		axios
			.get(`/api/user/reactionComment`, {
				params: { commentContext: comment_id },
			})
			.then((response) => {
				setCommentReaction(response.data);
			})
			.catch((err) => console.error(err.data));
	};

	// if not already done fetch the replies
	// (avaliable only when the comment has replies)
	const fetchReplies = () => {
		setIsFetching(true);
		setTempReplies([]);
		setShowReplies((showReplies) => !showReplies);
		if (!repliesFetch || repliesFetch.length !== repliesAmount) {
			axios
				.get(`/api/video/loadReply`, {
					params: { comment_id },
				})
				.then((response) => {
					setIsFetching(false);
					setRepliesFetch(response.data.reply);
				})
				.catch((err) => console.error(err));
		}
	};

	// for like state = true, for dislike state = false
	const handleCommentReaction = (state) => {
		// save temp state in the case of error to undo the styling
		let tempCommentReaction = commentReaction;
		let tempLikes = likesAmount;
		// let tempDislikes = dislikes;
		if (commentReaction === null || commentReaction === !state) {
			// if true ==> user wants to set like,
			// if false ==> user wants to set dislike

			// for better ux first set styling
			if (state === true && commentReaction === null) {
				updateCommentState(1);
				setCommentReaction(true);
			} else if (state === true && commentReaction === false) {
				updateCommentState(1);
				setCommentReaction(true);
			} else if (state === false && commentReaction === null) {
				setCommentReaction(false);
			} else if (state === false && commentReaction === true) {
				updateCommentState(-1);
				setCommentReaction(false);
			}
			axios
				.post(`/api/user/reactionComment`, {
					comment_id,
					state,
				})
				// instead of fetching the state again, just update
				// it locally, in the end server gets the data and
				// user can perform only predictable aciotn add or
				// substract the like, catch only the error to
				// correct the state of the reaction on the server
				.catch((err) => {
					console.error(err.data);
					setLikesAmount(tempLikes);
					setCommentReaction(tempCommentReaction);
				});
		} else if (commentReaction === state) {
			// if true ==> the user wants to turn it off
			// by clicking the same state
			if (state === true) {
				updateCommentState(-1);
				setCommentReaction(null);
			} else if (state === false) {
				setCommentReaction(null);
			}
			axios
				.post(`/api/user/reactionComment`, {
					comment_id,
					state,
				})
				.catch((err) => {
					console.error(err.data);
					setLikesAmount(tempLikes);
					setCommentReaction(tempCommentReaction);
				});
		}
	};

	const updateCommentState = (num) => {
		setLikesAmount((likesAmount) => likesAmount + num);
	};

	return (
		<div className="commentary__container">
			<div className="commentary__main">
				<Avatar
					className="commentary__avatar"
					src={avatar ? avatar : null}
					alt="avatar"
				/>
				<div className="commentary__details">
					<div className="commentary__info">
						<div className="commentary__user">{user}</div>
						<div className="commentary__date">
							{dayjs().from(dayjs(date), true)} ago
						</div>
					</div>
					<div className="commentary__content">{content}</div>
					<div className="commentary__actions">
						<div className="commentary__handsLikes">
							<div
								className={`commentary__likes ${
									commentReaction === true
										? "commentary__blue"
										: null
								}`}
								onClick={() => handleCommentReaction(true)}
							>
								<ThumbUpRoundedIcon />
								<p>{likesAmount !== 0 ? likesAmount : ""}</p>
							</div>
							<div
								className={`commentary__dislikes ${
									commentReaction === false
										? "commentary__blue"
										: null
								}`}
								onClick={() => handleCommentReaction(false)}
							>
								<ThumbDownRoundedIcon />
								{/* <p>{dislikes}</p> */}
							</div>
						</div>
						<div
							className="commentary__replyButton"
							onClick={
								(e) => setAddReply((addReply) => true) // true
							}
						>
							REPLY
						</div>
					</div>
					{addReply ? (
						<CommentInput
							replyState={addReply}
							setReplyState={setAddReply}
							video_id={video_id}
							comment_id={comment_id} // parent comment id
							type={"reply"}
							tempArray={tempReplies}
							setTempArray={setTempReplies}
							showReplies={showReplies}
							setShowReplies={setShowReplies}
							setRepliesAmount={setRepliesAmount}
						/>
					) : null}
					{/* below CommentInput there are going to be replies */}
				</div>
			</div>
			<div className="commentary__replySection">
				{repliesAmount !== 0 ? (
					showReplies ? (
						<div
							className="commentary__showMore"
							onClick={fetchReplies}
						>
							<ArrowDropUpIcon />
							{repliesAmount !== 1
								? "Hide replies"
								: "Hide reply"}
						</div>
					) : (
						<div
							className="commentary__showMore"
							onClick={fetchReplies}
						>
							<ArrowDropDownIcon />
							{repliesNumber !== 1
								? `Show ${repliesAmount} replies`
								: "Show reply"}
						</div>
					)
				) : null}
				{/* Comments.js fetch replies and show them below, do this only when setShowReplies is true */}
				<div
					className={`commentary__showReplies ${
						showReplies ? null : "commentary__hideReplies"
					}`}
				>
					{repliesFetch ? (
						repliesFetch.map((reply) => (
							<Commentary
								video_id={reply.videoId}
								comment_id={reply._id}
								user={reply.author.username}
								avatar={reply.author.avatar}
								date={reply.createdAt}
								modify={reply.updatedAt}
								content={reply.content}
								likes={reply.likes}
								dislikes={reply.dislikes}
								reply={reply.reply}
								repliesNumber={reply.repliesNumber}
							/>
						))
					) : isFetching ? (
						<div
							className="fetching__spinner"
							style={{
								justifyContent: "flex-start",
								marginLeft: "48px",
							}}
						>
							<CircularProgress color="#aaaaaa" size={24} />
						</div>
					) : null}

					{/* place for state reply, give it to the commentInput child */}
					{tempReplies.length
						? tempReplies.map((reply) => reply)
						: null}
				</div>
			</div>
		</div>
	);
}

export default Commentary;
