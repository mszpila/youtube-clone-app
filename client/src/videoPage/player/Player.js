import React, { useState, useRef, useEffect } from "react";
import Container from "@material-ui/core/Container";
import ReactPlayer from "react-player";
import Controls from "./Controls";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import "./Player.css";
import { useParams } from "react-router-dom";

const format = (seconds) => {
	if (isNaN(seconds)) {
		return `00:00`;
	}
	const date = new Date(seconds * 1000);
	const hh = date.getUTCHours();
	const mm = date.getUTCMinutes();
	const ss = date.getUTCSeconds().toString().padStart(2, "0");
	if (hh) {
		return `${hh}:${mm.toString().padStart(2, "0")}:${ss}`;
	}
	return `${mm}:${ss}`;
};

let count = 0;

function Player({ url }) {
	const [timeDisplayFormat, setTimeDisplayFormat] = React.useState("normal");
	const [bookmarks, setBookmarks] = useState([]);
	const [state, setState] = useState({
		pip: false,
		playing: true,
		controls: false,
		light: false,

		muted: true,
		played: 0,
		duration: 0,
		playbackRate: 1.0,
		volume: 1,
		loop: false,
		seeking: false,
	});
	const { id } = useParams();

	const playerRef = useRef(null);
	const playerContainerRef = useRef(null);
	const controlsRef = useRef(null);
	const canvasRef = useRef(null);
	const {
		playing,
		controls,
		light,

		muted,
		loop,
		playbackRate,
		pip,
		played,
		seeking,
		volume,
	} = state;

	const handlePlayPause = () => {
		setState({ ...state, playing: !state.playing });
	};

	useEffect(() => {
		if (state.playing === false) {
			controlsRef.current.style.opacity = 1;
		}
	}, [state.playing]);

	useEffect(() => {
		setState({ ...state, playing: true });
	}, [id]);

	const handleRewind = () => {
		playerRef.current.seekTo(playerRef.current.getCurrentTime() - 5);
		controlsRef.current.style.opacity = 1;
	};

	const handleFastForward = () => {
		playerRef.current.seekTo(playerRef.current.getCurrentTime() + 5);
		controlsRef.current.style.opacity = 1;
	};

	const handleProgress = (changeState) => {
		if (count > 3) {
			controlsRef.current.style.opacity = 0;
			count = 0;
		}
		if (controlsRef.current.style.opacity > 0) {
			count += 1;
		}
		if (!state.seeking) {
			setState({ ...state, ...changeState });
		}
	};

	const handleSeekChange = (e, newValue) => {
		setState({ ...state, played: parseFloat(newValue / 100) });
	};

	const handleSeekMouseDown = (e) => {
		setState({ ...state, seeking: true });
	};

	const handleSeekMouseUp = (e, newValue) => {
		setState({ ...state, seeking: false });
		playerRef.current.seekTo(newValue / 100, "fraction");
	};

	const handleDuration = (duration) => {
		setState({ ...state, duration });
	};

	const handleVolumeSeekDown = (e, newValue) => {
		setState({
			...state,
			seeking: false,
			volume: parseFloat(newValue / 100),
		});
	};
	const handleVolumeChange = (e, newValue) => {
		setState({
			...state,
			volume: parseFloat(newValue / 100),
			muted: newValue === 0 ? true : false,
		});
	};

	const handleMouseMove = () => {
		controlsRef.current.style.opacity = 1;
		count = 0;
	};

	const hanldeMouseLeave = () => {
		if (state.playing === false) {
			controlsRef.current.style.opacity = 1;
		}
		count = 2;
	};

	const handleDisplayFormat = () => {
		setTimeDisplayFormat(
			timeDisplayFormat === "normal" ? "remaining" : "normal"
		);
	};

	const handlePlaybackRate = (rate) => {
		setState({ ...state, playbackRate: rate });
	};

	const handleMute = () => {
		setState({ ...state, muted: !state.muted });
	};

	const addBookmark = () => {
		const canvas = canvasRef.current;
		canvas.width = 160;
		canvas.height = 90;
		const ctx = canvas.getContext("2d");

		ctx.drawImage(
			playerRef.current.getInternalPlayer(),
			0,
			0,
			canvas.width,
			canvas.height
		);
		const dataUri = canvas.toDataURL();
		canvas.width = 0;
		canvas.height = 0;
		const bookmarksCopy = [...bookmarks];
		bookmarksCopy.push({
			time: playerRef.current.getCurrentTime(),
			display: format(playerRef.current.getCurrentTime()),
			image: dataUri,
		});
		setBookmarks(bookmarksCopy);
	};

	const currentTime =
		playerRef && playerRef.current
			? playerRef.current.getCurrentTime()
			: "00:00";

	const duration =
		playerRef && playerRef.current
			? playerRef.current.getDuration()
			: "00:00";
	const elapsedTime =
		timeDisplayFormat === "normal"
			? format(currentTime)
			: `-${format(duration - currentTime)}`;

	const totalDuration = format(duration);

	const handleStart = () => {
		controlsRef.current.style.opacity = 1;
		count = 1;
	};

	const handleFullscreen = useFullScreenHandle();

	return (
		<>
			<Container>
				<div
					onMouseMove={handleMouseMove}
					onMouseLeave={hanldeMouseLeave}
					ref={playerContainerRef}
					className="player__wrapper"
				>
					<FullScreen handle={handleFullscreen}>
						<ReactPlayer
							className="player__player"
							ref={playerRef}
							width="100%"
							height="100%"
							url={url}
							pip={pip}
							playing={playing}
							controls={false}
							light={light}
							loop={loop}
							playbackRate={playbackRate}
							volume={volume}
							muted={muted}
							onProgress={handleProgress}
							onEnded={handlePlayPause}
							onStart={handleStart}
							config={{
								file: {
									attributes: {
										crossorigin: "anonymous",
									},
								},
							}}
						/>

						<Controls
							ref={controlsRef}
							onSeek={handleSeekChange}
							onSeekMouseDown={handleSeekMouseDown}
							onSeekMouseUp={handleSeekMouseUp}
							onDuration={handleDuration}
							onRewind={handleRewind}
							onPlayPause={handlePlayPause}
							onFastForward={handleFastForward}
							playing={playing}
							played={played}
							elapsedTime={elapsedTime}
							totalDuration={totalDuration}
							onMute={handleMute}
							muted={muted}
							onVolumeChange={handleVolumeChange}
							onVolumeSeekDown={handleVolumeSeekDown}
							onChangeDispayFormat={handleDisplayFormat}
							playbackRate={playbackRate}
							onPlaybackRateChange={handlePlaybackRate}
							volume={volume}
							onBookmark={addBookmark}
							onFullscreen={handleFullscreen}
						/>
					</FullScreen>
				</div>
			</Container>
		</>
	);
}

export default Player;
