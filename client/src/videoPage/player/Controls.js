import React, { forwardRef, useState, useEffect } from "react";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
// import FastForwardIcon from "@material-ui/icons/FastForward";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import Slider from "@material-ui/core/Slider";
import Tooltip from "@material-ui/core/Tooltip";
import Grid from "@material-ui/core/Grid";
import VolumeUp from "@material-ui/icons/VolumeUp";
import VolumeDown from "@material-ui/icons/VolumeDown";
import VolumeMute from "@material-ui/icons/VolumeOff";
import FullScreen from "@material-ui/icons/Fullscreen";
import Popover from "@material-ui/core/Popover";
import SettingsRoundedIcon from "@material-ui/icons/SettingsRounded";
import { useParams } from "react-router-dom";
import "./Control.css";

function ValueLabelComponent(props) {
	const { children, open, value } = props;

	return (
		<Tooltip open={open} enterTouchDelay={0} placement="top" title={value}>
			{children}
		</Tooltip>
	);
}

const Controls = forwardRef(
	(
		{
			onSeek,
			onSeekMouseDown,
			onSeekMouseUp,
			onDuration,
			onRewind,
			onPlayPause,
			onFastForward,
			playing,
			played,
			elapsedTime,
			totalDuration,
			onMute,
			muted,
			onVolumeSeekDown,
			onChangeDispayFormat,
			playbackRate,
			onPlaybackRateChange,
			onToggleFullScreen,
			volume,
			onVolumeChange,
			onBookmark,
			onFullscreen,
		},
		ref
	) => {
		let { id } = useParams();
		const [anchorEl, setAnchorEl] = React.useState(null);
		const [fullscreened, setFullscreened] = useState(false);
		const handleClick = (event) => {
			setAnchorEl(event.currentTarget);
		};

		const handleClose = () => {
			setAnchorEl(null);
		};

		const open = Boolean(anchorEl);
		const popId = open ? "controls__popover" : undefined;

		const toggleFullscreen = () => {
			setFullscreened((fullscreened) => !fullscreened);
			if (fullscreened) onFullscreen.exit();
			else return onFullscreen.enter();
		};

		const element = document.body;

		const keyBoardController = (event) => {
			if (
				event.target === element ||
				event.target.classList.contains("videoSide__link")
			) {
				switch (event.keyCode) {
					case 32:
						event.preventDefault();
						onPlayPause();
						break;
					case 77:
						onMute();
						break;
					case 37:
						onRewind();
						break;
					case 39:
						onFastForward();
						break;
					// case 38:
					// 	event.preventDefault();
					// 	onVolumeChange(volume + 0.1);
					// 	break;
					// case 40:
					// 	event.preventDefault();
					// 	onVolumeChange(volume - 0.1);
					// 	break;
					case 70:
						toggleFullscreen();
						break;
					default:
						return event;
				}
			}
		};
		useEffect(() => {
			element.addEventListener("keydown", keyBoardController);

			return () => {
				element.removeEventListener("keydown", keyBoardController);
			};
		});

		return (
			<div ref={ref} className="controls__wrapper">
				<div className="controls__main">
					{/* div to able on screen pause play */}
					<div
						className="controls__displayControl"
						onClick={onPlayPause}
					></div>
					{/* time line */}
					<Slider
						id="timeline"
						min={0}
						max={100}
						// valueLabelDisplay={"on"}
						ValueLabelComponent={(props) => (
							<ValueLabelComponent
								{...props}
								value={elapsedTime}
							/>
						)}
						aria-label="custom thumb label"
						value={played * 100}
						onChange={onSeek}
						onMouseDown={onSeekMouseDown}
						onChangeCommitted={onSeekMouseUp}
						onDuration={onDuration}
					/>
					{/* controls */}
					<div className="controls__icons">
						{/* left side */}
						<div className="controls__basic">
							<div
								onClick={onPlayPause}
								className="controls__play"
							>
								{playing ? <PauseIcon /> : <PlayArrowIcon />}
							</div>
							<div className="controls__volume">
								<div
									onClick={onMute}
									className="controls__volumeBtn"
								>
									{muted ? (
										<VolumeMute />
									) : volume > 0.5 ? (
										<VolumeUp />
									) : (
										<VolumeDown />
									)}
								</div>
								<Slider
									id="volumeline"
									min={0}
									max={100}
									defaultValue={100}
									value={muted ? 0 : volume * 100}
									onChange={onVolumeChange}
									aria-labelledby="input-slider"
									onMouseDown={onSeekMouseDown}
									onChangeCommitted={onVolumeSeekDown}
								/>
							</div>
							<div
								className="controls__elapsedTime"
								variant="body1"
							>
								{elapsedTime} / {totalDuration}
							</div>
						</div>
						{/* right side */}
						<div className="controls__extra">
							<SettingsRoundedIcon
								className="controls__settings"
								onClick={handleClick}
							/>

							<Popover
								// style={{ marginBottom: 40 }}
								// container={ref.current}
								onKeyDown={(e) => e.preventDefault()}
								open={open}
								id={popId}
								onClose={handleClose}
								anchorEl={anchorEl}
								anchorOrigin={{
									vertical: "top",
									horizontal: "center",
								}}
								transformOrigin={{
									vertical: "bottom",
									horizontal: "center",
								}}
								// anchorOrigin={{
								// 	vertical: "top",
								// 	horizontal: "left",
								// }}
								// transformOrigin={{
								// 	vertical: "bottom",
								// 	horizontal: "left",
								// }}
							>
								<Grid container direction="column-reverse">
									{[0.5, 1, 1.5, 2].map((rate) => (
										<Button
											key={rate}
											onClick={() =>
												onPlaybackRateChange(rate)
											}
											variant="text"
										>
											<div
												color={
													rate === playbackRate
														? "secondary"
														: "inherit"
												}
											>
												{rate}X
											</div>
										</Button>
									))}
								</Grid>
							</Popover>
							<FullScreen
								onClick={toggleFullscreen}
								className="controls__fullscreen"
							/>
						</div>
					</div>
				</div>
			</div>
		);
	}
);

Controls.propTypes = {
	onSeek: PropTypes.func,
	onSeekMouseDown: PropTypes.func,
	onSeekMouseUp: PropTypes.func,
	onDuration: PropTypes.func,
	onRewind: PropTypes.func,
	onPlayPause: PropTypes.func,
	onFastForward: PropTypes.func,
	onVolumeSeekDown: PropTypes.func,
	onChangeDispayFormat: PropTypes.func,
	onPlaybackRateChange: PropTypes.func,
	onToggleFullScreen: PropTypes.func,
	onMute: PropTypes.func,
	playing: PropTypes.bool,
	played: PropTypes.number,
	elapsedTime: PropTypes.string,
	totalDuration: PropTypes.string,
	muted: PropTypes.bool,
	playbackRate: PropTypes.number,
};
export default Controls;
