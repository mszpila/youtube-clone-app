import React, { useState } from "react";
import "./VideoRow.css";
import { Avatar } from "@material-ui/core";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import localeData from "dayjs/plugin/localeData";
dayjs.extend(relativeTime);
dayjs.extend(localeData);

function VideoRow({
	thumbnail,
	preview,
	title,
	user,
	views,
	published,
	duration,
	avatar,
	description,
}) {
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
		<div className="videoRow">
			<div className="videoRow__imgWrapper">
				<img
					className="videoRow__thumbnail"
					src={hover ? preview : thumbnail}
					alt=""
					onMouseOver={() => handleHover(true)}
					onMouseLeave={() => handleHover(false)}
				/>
				<div
					className={`videoCard__time ${
						!showTime && "videoCard__hideTime"
					}`}
				>
					{format(duration)}
				</div>
			</div>
			<div className="videoRow__details">
				<h3 className="videoRow__title">{title}</h3>
				<p className="videoRow__headline">
					{views} • {dayjs().from(dayjs(published), true)} ago
				</p>
				<div className="videoRow__user">
					<Avatar
						className="videoRow__avatar"
						alt={user}
						src={avatar}
					/>
					<p className="videoRow__username">{user}</p>
				</div>
				<p className="videoRow__description">{description}</p>
			</div>
		</div>
	);
}

export default VideoRow;
