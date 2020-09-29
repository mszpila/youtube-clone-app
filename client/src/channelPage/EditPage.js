import React, { useEffect } from "react";
import { TextareaAutosize, Popover } from "@material-ui/core";
import "./EditPage.css";
import Player from "../videoPage/player/Player";
import "../uploadPage/radio.css";
import axios from "axios";
import { useHistory, withRouter } from "react-router-dom";
import RadioButtonUncheckedRoundedIcon from "@material-ui/icons/RadioButtonUncheckedRounded";
import RadioButtonCheckedRoundedIcon from "@material-ui/icons/RadioButtonCheckedRounded";
import { useSelector, useDispatch } from "react-redux";
import { setSidebar } from "../actions/sidebar";

function EditPage({
	videoId,
	title,
	setTitle,
	description,
	setDescription,
	privacy,
	setPrivacy,
	url,
}) {
	const history = useHistory();
	const sidebarState = useSelector((state) => state.sidebarState);
	const dispatch = useDispatch();

	const handleSubmit = (e) => {
		e.preventDefault();
		axios
			.post("/api/video/save", {
				id: videoId,
				title,
				description,
				private: privacy,
			})
			.then(() => history.push(`/video/${videoId}`))
			.catch((err) => console.error(err.data));
	};

	useEffect(() => {
		dispatch(setSidebar(false));
	}, []);

	return (
		<div className={`${sidebarState ? "editPage" : "editPage__fullwidth"}`}>
			<div className="uploadForm__title">Details</div>
			<div className="uploadForm">
				<form onSubmit={handleSubmit} className="uploadForm__form">
					<div className="upload__field">
						<input
							type="text"
							name="title"
							value={title}
							placeholder="Title"
							onChange={(e) => setTitle(e.target.value)}
						/>
					</div>
					<div className="upload__field">
						<TextareaAutosize
							className="upload_description"
							name="description"
							value={description}
							rowsMin={8}
							placeholder="Descripiton"
							onChange={(e) => setDescription(e.target.value)}
						/>
					</div>
					<div className="uploadForm__privacyRadio">
						<div
							className="uploadForm__radioOption"
							onClick={() => setPrivacy(true)}
						>
							{privacy ? (
								<RadioButtonCheckedRoundedIcon />
							) : (
								<RadioButtonUncheckedRoundedIcon />
							)}
							<div className="uploadForm__info">
								<div className="uploadForm__radioLabel">
									Private
								</div>
								<div className="uploadForm__radioSubtitle">
									Only you and people with the link can watch
									this video
								</div>
							</div>
						</div>
						<div
							className="uploadForm__radioOption"
							onClick={() => setPrivacy(false)}
						>
							{!privacy ? (
								<RadioButtonCheckedRoundedIcon />
							) : (
								<RadioButtonUncheckedRoundedIcon />
							)}
							<div className="uploadForm__info">
								<div className="uploadForm__radioLabel">
									Public
								</div>
								<div className="uploadForm__radioSubtitle">
									Everyone can watch your video
								</div>
							</div>
						</div>
					</div>
					<button
						type="text"
						className="uploadPage__publishBtn"
						onClick={handleSubmit}
					>
						Save
					</button>
				</form>
				<div className="uploadForm__video">
					<Player url={`/${url}`} />
				</div>
			</div>
			<Popover
				anchorReference="anchorPosition"
				anchorPosition={{ top: 50, left: 50 }}
				anchorOrigin={{
					vertical: "center",
					horizontal: "center",
				}}
				transformOrigin={{
					vertical: "center",
					horizontal: "center",
				}}
			>
				The content of the Popover.
			</Popover>
		</div>
	);
}

export default withRouter(EditPage);
