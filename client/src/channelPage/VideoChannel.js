import React, { useState } from "react";
import "./VideoChannel.css";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import localeData from "dayjs/plugin/localeData";
import { Link } from "react-router-dom";
dayjs.extend(relativeTime);
dayjs.extend(localeData);

function VideoChannel({
	thumbnail,
	preview,
	title,
	user,
	views,
	published,
	duration,
	avatar,
	description,
	id,
	privacy,
	url,
	handleRemove,
	setTitle,
	setDescription,
	setPrivacy,
	setActiveStep,
	setVideoId,
	setUrl,
}) {
	const [removed, setRemoved] = useState(false);

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

	const [showTime, setShowTime] = useState(true);
	const [hover, setHover] = useState(false);

	const handleHover = (state) => {
		setHover(state);
		setShowTime((state) => !state);
	};

	return (
		<div className="videoChannel">
			{removed ? (
				<div className="videoChannel__removed">
					Video has been removed
				</div>
			) : (
				<div className="videoChannel__container">
					<Link
						key={id}
						to={`/video/${id}`}
						className="videoChannel__link"
					>
						<div className="videoChannel__imgWrapper">
							<img
								className="videoChannel__thumbnail"
								src={hover ? preview : thumbnail}
								alt=""
								onMouseOver={() => handleHover(true)}
								onMouseLeave={() => handleHover(false)}
								style={{ width: "160px" }}
							/>
							<div
								className={`videoCard__time ${
									!showTime && "videoCard__hideTime"
								}`}
							>
								{format(duration)}
							</div>
						</div>
						<div className="videoChannel__details">
							<h3 className="videoChannel__title">{title}</h3>
							<p className="videoRow__headline">
								{views} • {dayjs().from(dayjs(published), true)}{" "}
								ago
							</p>
							<p className="videoRow__description">
								{description}
							</p>
						</div>
					</Link>
					<div className="videoChannel__buttons">
						<div className="videoChannel__edit">
							<div
								className="videoChannel__link"
								onClick={() => {
									setVideoId(id);
									setUrl(url);
									setTitle(title);
									setDescription(description);
									setPrivacy(privacy);
									setActiveStep(
										(prevActiveStep) => prevActiveStep + 1
									);
								}}
							>
								Edit
							</div>
						</div>
						<div
							className="videoChannel__remove"
							onClick={() => {
								handleRemove(id);
								setRemoved(true);
							}}
						>
							Remove
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default VideoChannel;
