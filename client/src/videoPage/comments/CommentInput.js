import React, { useState } from "react";
import "./CommentInput.css";
import { Avatar, TextareaAutosize } from "@material-ui/core";
import axios from "axios";
import Commentary from "./Commentary";
import { useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setLoginState, saveUser } from "../../actions/user";

function CommentInput({
	video_id,
	comment_id,
	type,
	replyState,
	setReplyState,
	setTempArray,
	showReplies,
	setShowReplies,
	setRepliesAmount,
	setCommentsAmount,
}) {
	const [commentInput, setCommentInput] = useState("");
	const [focus, setFocus] = useState(replyState ? true : false);
	const loginState = useSelector((state) => state.loginState);
	const history = useHistory();
	const dispatch = useDispatch();

	const handleCommentPost = () => {
		// send commentInput as a post req based on the type (comment/reply)
		if (type === "comment") {
			axios
				.post(
					`/api/video/addComment`,
					{
						video_id,
						content: commentInput,
					},
					{
						withCredentials: true,
					}
				)
				.then((response) => {
					// create an object, fill it with the response data
					// and push it to the parent array
					// setTheArray(prevArray => [...prevArray,
					// newValue])
					const freshComment = (
						<Commentary
							video_id={response.data.videoId}
							comment_id={response.data._id}
							user={response.data.author.username}
							avatar={response.data.author.avatar}
							date={response.data.createdAt}
							modify={response.data.updatedAt}
							content={response.data.content}
							likes={response.data.likes}
							dislikes={response.data.dislikes}
							reply={response.data.reply}
							repliesNumber={response.data.repliesNumber}
						/>
					);
					setTempArray((tempArray) => [...tempArray, freshComment]);
					setCommentInput("");
					setFocus(false);
					setCommentsAmount((commentsAmount) => commentsAmount + 1);
				})
				.catch((err) => console.error(err.data));
		} else if (type === "reply") {
			axios
				.post(
					`/api/video/addReply`,
					{
						video_id,
						comment_id,
						content: commentInput,
					},
					{
						withCredentials: true,
					}
				)
				.then((response) => {
					const freshReply = (
						<Commentary
							video_id={response.data.videoId}
							comment_id={response.data._id}
							user={response.data.author.username}
							avatar={response.data.author.avatar}
							date={response.data.createdAt}
							modify={response.data.updatedAt}
							content={response.data.content}
							likes={response.data.likes}
							dislikes={response.data.dislikes}
							reply={response.data.reply}
							repliesNumber={response.data.repliesNumber}
						/>
					);
					setTempArray((tempArray) => [...tempArray, freshReply]);
					setReplyState(false);
					setShowReplies(true);
					setRepliesAmount((repliesAmount) => repliesAmount + 1);
				})
				.catch((err) => console.error(err.data));
		}
	};

	const handleFocus = () => {
		axios
			.get("/api/user/me/")
			.then((response) => {
				dispatch(setLoginState(true));
				dispatch(saveUser(response.data));
			})
			.catch((err) => {
				console.error(err.data);
				if (loginState) {
					dispatch(setLoginState(false));
					history.push("/login");
				}
			});
		if (!loginState) {
			return history.push("/login");
		}
		setFocus(true);
	};

	return (
		<div className="commentInput__userAction">
			<Avatar className="commentInput__avatar" />
			<div className="commentInput__main">
				<div className="commentInput__userComment">
					<TextareaAutosize
						className="commentInput_input"
						rowsMin={1}
						placeholder="Add public comment..."
						value={commentInput}
						onChange={(e) => setCommentInput(e.target.value)}
						onFocus={handleFocus}
					/>
				</div>
				<div
					className={`commentInput__userButtons ${
						focus ? "commentInput__display" : null
					}`}
				>
					<button
						type="text"
						className="commentInput__cancelButton"
						onClick={(e) => {
							if (replyState) {
								setReplyState(false);
							} else {
								setFocus(false);
								setCommentInput("");
							}
						}}
					>
						Cancel
					</button>
					<button
						disabled={commentInput ? false : true}
						onClick={handleCommentPost}
						type="text"
						className={`commentInput__commentButton ${
							commentInput ? null : "commentInput__buttonOff"
						}`}
					>
						{type === "comment" ? "Comment" : "Reply"}
					</button>
				</div>
			</div>
		</div>
	);
}

export default CommentInput;
