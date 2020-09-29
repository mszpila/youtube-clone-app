import React from "react";
import "./SidebarOption.css";
import { Link } from "react-router-dom";
import { Avatar } from "@material-ui/core";
import "./SubscriptionOption.css";

function SubscripitonOption({ avatar, selected, title, to }) {
	return (
		<Link
			to={to}
			className={`subscriptionOption ${selected && "selected"}`}
		>
			<Avatar src={avatar} className="subscriptionOption__avatar" />
			<h2 className="subscriptionOption__title">{title}</h2>
		</Link>
	);
}

export default SubscripitonOption;
