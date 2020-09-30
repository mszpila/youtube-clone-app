import React, { useEffect, Fragment } from "react";
import {
	CircularProgress,
	Box,
	TextareaAutosize,
	makeStyles,
} from "@material-ui/core";
import PropTypes from "prop-types";
import "./UploadForm.css";
import Player from "../videoPage/player/Player";
import "./radio.css";
import RadioButtonUncheckedRoundedIcon from "@material-ui/icons/RadioButtonUncheckedRounded";
import RadioButtonCheckedRoundedIcon from "@material-ui/icons/RadioButtonCheckedRounded";

function CircularProgressWithLabel(props) {
	const classes = useStylesFacebook();
	return (
		<div className={classes.root}>
			<Box position="relative" display="inline-flex">
				<CircularProgress
					style={{ color: "#065fd4" }}
					thickness={3}
					size={144}
					variant="static"
					{...props}
				/>
				<Box
					top={0}
					left={0}
					bottom={0}
					right={0}
					position="absolute"
					display="flex"
					alignItems="center"
					justifyContent="center"
				>
					<div
						variant="caption"
						component="div"
						color="textSecondary"
					>{`${Math.round(props.value)}%`}</div>
				</Box>
			</Box>
		</div>
	);
}

CircularProgressWithLabel.propTypes = {
	/**
	 * The value of the progress indicator for the determinate and static variants.
	 * Value between 0 and 100.
	 */
	value: PropTypes.number.isRequired,
};

// Second spinner
// Inspired by the former Facebook spinners.
const useStylesFacebook = makeStyles((theme) => ({
	root: {
		position: "relative",
	},
	bottom: {
		// color: theme.palette.grey[theme.palette.type === "dark" ? 200 : 700],
		color: "#1f1f1f",
	},
	top: {
		color: "#065fd4",
		animationDuration: "650ms",
		position: "absolute",
		left: 0,
	},
	circle: {
		strokeLinecap: "round",
	},
}));

function FacebookCircularProgress(props) {
	const classes = useStylesFacebook();

	return (
		<div className={classes.root}>
			<CircularProgress
				variant="determinate"
				className={classes.bottom}
				size={144}
				thickness={3}
				{...props}
				value={100}
			/>
			<CircularProgress
				variant="indeterminate"
				disableShrink
				className={classes.top}
				classes={{
					circle: classes.circle,
				}}
				size={144}
				thickness={3}
				{...props}
			/>
		</div>
	);
}

function UploadForm({
	progress,
	video,
	handleSubmit,
	title,
	setTitle,
	description,
	setDescription,
	privacy,
	setPrivacy,
}) {
	return (
		<Fragment>
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
						Publish
					</button>
				</form>
				{/* </div> */}
				{/* if progress is 100 and there is not video yet change it to circular */}
				<div className="uploadForm__video">
					{video ? (
						<Player url={`${video.urls?.video_url}`} />
					) : progress === 100 ? (
						<FacebookCircularProgress />
					) : (
						<CircularProgressWithLabel value={progress} />
					)}
				</div>
			</div>
		</Fragment>
	);
}

export default UploadForm;
