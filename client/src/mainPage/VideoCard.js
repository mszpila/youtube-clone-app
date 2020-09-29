import React, { useState } from "react";
import "./VideoCard.css";
import { Avatar } from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import localeData from "dayjs/plugin/localeData";
dayjs.extend(relativeTime);
dayjs.extend(localeData);
// dayjs().localeData();

function VideoCard({
	thumbnail,
	preview,
	title,
	user,
	views,
	published,
	duration,
	avatar,
	isLoading,
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
		<div className="videoCard">
			{!isLoading ? (
				<div className="videoCard__imgWrapper">
					<img
						className="videoCard__thumbnail"
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
			) : (
				<Skeleton className="videoCard__imgWrapper" />
			)}
			<div className="videoCard__info">
				<div className="videoCard__avatarWrapper">
					{avatar !== undefined ? (
						<Avatar
							className="videoCard__avatar"
							alt={user}
							src={avatar}
						/>
					) : (
						<Skeleton
							// variant="circle"
							height={"36px"}
							width={"36px"}
							style={{ borderRadius: "50%", marginRight: "12px" }}
						/>
					)}
				</div>
				<div className="videoCard__details">
					<h4>
						{title || (
							<Skeleton
								style={{
									height: "20px",
									marginBottom: "6px",
									marginRight: "12px",
								}}
							/>
						)}
					</h4>
					{user && views && published ? (
						<div className="videoCard__data">
							<p>{user}</p>
							<p>
								{views} • {dayjs().from(dayjs(published), true)}{" "}
								ago
							</p>
						</div>
					) : (
						<Skeleton
							style={{ height: "20px", marginRight: "96px" }}
						/>
					)}
				</div>
			</div>
		</div>
	);
}

export default VideoCard;
