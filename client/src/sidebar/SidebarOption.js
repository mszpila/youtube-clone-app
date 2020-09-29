import React from "react";
import "./SidebarOption.css";
import { Link } from "react-router-dom";

function SidebarOption({ Icon, selected, title, to }) {
	return (
		<Link to={to} className={`sidebarOption ${selected && "selected"}`}>
			<Icon className="sidebarOption__icon" />
			<h2 className="sidebarOption__title">{title}</h2>
		</Link>
	);
}

export default SidebarOption;
