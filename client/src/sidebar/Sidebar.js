import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import HomeRoundedIcon from "@material-ui/icons/HomeRounded";
import SubscriptionsRoundedIcon from "@material-ui/icons/SubscriptionsRounded";
import WhatshotRoundedIcon from "@material-ui/icons/WhatshotRounded";
import VideoLibraryRoundedIcon from "@material-ui/icons/VideoLibraryRounded";
import HistoryRoundedIcon from "@material-ui/icons/HistoryRounded";
import YouTubeIcon from "@material-ui/icons/YouTube";
import WifiTetheringRoundedIcon from "@material-ui/icons/WifiTetheringRounded";
import SettingsRoundedIcon from "@material-ui/icons/SettingsRounded";
import FlagRoundedIcon from "@material-ui/icons/FlagRounded";
import HelpRoundedIcon from "@material-ui/icons/HelpRounded";
import AnnouncementRoundedIcon from "@material-ui/icons/AnnouncementRounded";
import SidebarOption from "./SidebarOption";
import { Link } from "react-router-dom";
import { Avatar } from "@material-ui/core";
import axios from "axios";
import SubscripitonOption from "./SubscriptionOption";
import { useSelector } from "react-redux";

function Sidebar() {
	const sidebarState = useSelector((state) => state.sidebarState);
	const userState = useSelector((state) => state.userState);
	const loginState = useSelector((state) => state.loginState);
	const [fetchedSubs, setFetchedSubs] = useState(userState?.subscriptions);

	useEffect(() => {
		if (!fetchedSubs) {
			axios
				.get("/api/user/me/subscriptions")
				.then((response) => {
					setFetchedSubs(response.data.subscriptions);
				})
				.catch((err) => {
					console.error(err.data);
				});
		}
	}, [loginState, userState]);

	return (
		<div className={`sidebar ${sidebarState ? null : "sidebar_minimaze"}`}>
			<div className="sidebar__section">
				<SidebarOption
					Icon={HomeRoundedIcon}
					selected={true}
					title="Home"
					to="/"
					fontSize="large"
				/>
				<SidebarOption
					Icon={WhatshotRoundedIcon}
					selected={false}
					title="Trending"
					to="/"
				/>
				<SidebarOption
					Icon={SubscriptionsRoundedIcon}
					selected={false}
					title="Subscriptions"
					to="/"
				/>
			</div>
			<hr />
			<div className="sidebar__section">
				<SidebarOption
					Icon={VideoLibraryRoundedIcon}
					selected={false}
					title="Library"
					to="/"
				/>
				<SidebarOption
					Icon={HistoryRoundedIcon}
					selected={false}
					title="History"
					to="/"
				/>
			</div>
			<hr />
			{loginState ? (
				<div className="sidebar__section sidebar__sub">
					<p>SUBSCRIPTIONS</p>
					{fetchedSubs?.map((sub) => (
						<SubscripitonOption
							to="/"
							title={sub.username}
							avatar={sub.avatar}
							selected={false}
						/>
					))}
				</div>
			) : (
				<div className="sidebar__section sidebar__info">
					<p>Sign in to like, comment &amp; subscribe.</p>
					<Link to="/login" className="sidebar__link">
						<div className="sidebar__login">
							<Avatar className="sidebar__login--avatar" />
							<p className="sidebar__login--text">SIGN IN</p>
						</div>
					</Link>
				</div>
			)}
			<hr />
			<div className="sidebar__section">
				<SidebarOption
					Icon={YouTubeIcon}
					selected={false}
					title="YouTube Premium"
					to="/"
				/>
				<SidebarOption
					Icon={WifiTetheringRoundedIcon}
					selected={false}
					title="On Air"
					to="/"
				/>
			</div>
			<hr />
			<div className="sidebar__section">
				<SidebarOption
					Icon={SettingsRoundedIcon}
					selected={false}
					title="Settings"
					to="/"
				/>
				<SidebarOption
					Icon={FlagRoundedIcon}
					selected={false}
					title="Report history"
					to="/"
				/>
				<SidebarOption
					Icon={HelpRoundedIcon}
					selected={false}
					title="Help"
					to="/"
				/>
				<SidebarOption
					Icon={AnnouncementRoundedIcon}
					selected={false}
					title="Submit review"
					to="/"
				/>
			</div>
		</div>
	);
}

export default Sidebar;
