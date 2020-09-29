import React, { useState, useEffect } from "react";
import "./Header.css";
import logo from "../files/yt_logo_dark.svg";
import MenuRoundedIcon from "@material-ui/icons/MenuRounded";
import SearchRoundedIcon from "@material-ui/icons/SearchRounded";
import VideoCallRoundedIcon from "@material-ui/icons/VideoCallRounded";
import AppsRoundedIcon from "@material-ui/icons/AppsRounded";
import NotificationsRoundedIcon from "@material-ui/icons/NotificationsRounded";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import {
	Avatar,
	IconButton,
	Popper,
	ClickAwayListener,
} from "@material-ui/core/";
import { Link, useHistory, useLocation } from "react-router-dom";
import axios from "axios";
import "../sidebar/Sidebar.css";
import { useDispatch, useSelector } from "react-redux";
import { switchSidebar, setSidebar } from "../actions/sidebar";
import { setLoginState, saveUser, deleteUser } from "../actions/user";
import AccountBoxRoundedIcon from "@material-ui/icons/AccountBoxRounded";

function Header() {
	const [input, setInput] = useState("");
	const history = useHistory();
	const location = useLocation();
	const dispatch = useDispatch();
	const loginState = useSelector((state) => state.loginState);
	const userState = useSelector((state) => state.userState);
	const [fetchedUser, setFetchedUser] = useState(userState?.avatar);

	// material-ui popper setup
	const [anchorEl, setAnchorEl] = useState(null);
	const [btnId, setBtnId] = useState(null);
	const [placement, setPlacement] = useState();
	const [openPop, setOpenPop] = useState(false);

	// material-ui popover setup

	const handleClickAway = () => {
		setOpenPop(false);
	};

	const handleClick = (newPlacement) => (event) => {
		setAnchorEl(event.currentTarget);
		setOpenPop((prev) => placement !== newPlacement || !prev);
		setPlacement(newPlacement);
		setBtnId(event.currentTarget.id);
	};

	useEffect(() => {
		// setOpenPop(false);
		axios
			.get("/api/user/me/")
			.then((response) => {
				setFetchedUser(response.data.avatar);
				dispatch(setLoginState(true));
				dispatch(saveUser(response.data));
			})
			.catch((err) => {
				if (loginState) {
					history.push("/login");
				}
				dispatch(setLoginState(false));
			});
	}, [loginState, location.pathname]);

	const keyBoardController = (event) => {
		if (event.keyCode === 13) {
			history.push(`/search/${input}`);
		}
	};

	useEffect(() => {
		if (location.pathname.split("/")[1] !== "search") {
			setInput("");
		}
	}, [location]);

	const handleSidebar = () => {
		dispatch(switchSidebar());
	};

	const handleLogOut = () => {
		axios
			.post("/api/user/logout", null, { withCredentials: true })
			.then(() => {
				setOpenPop(false);
				dispatch(setLoginState(false));
				dispatch(deleteUser());
				history.go(0);
			})
			.catch((err) => {
				setOpenPop(false);
				dispatch(setLoginState(false));
				dispatch(deleteUser());
				console.error("log out error", err);
			});
	};

	return (
		<div className="header">
			<div className="header__left">
				<IconButton onClick={handleSidebar}>
					<MenuRoundedIcon className="header__feature" />
				</IconButton>
				<Link to="/" className="header__link">
					<img
						className="header__logo"
						// src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/YouTube_Logo_2017.svg/240px-YouTube_Logo_2017.svg.png"
						src={logo}
						alt=""
					/>
				</Link>
			</div>
			<div className="header__search">
				<input
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={(e) => keyBoardController(e)}
					className="header__input"
					type="text"
					placeholder="Search"
				/>
				<Link to={`/search/${input}`} className="header__link--search">
					<SearchRoundedIcon />
				</Link>
			</div>
			<div className="header__features">
				<IconButton>
					<Link
						to={loginState ? "/upload" : "#"}
						onClick={!loginState && handleClick("bottom")}
						className="header__link"
						id="upload"
					>
						<VideoCallRoundedIcon className="header__feature" />
					</Link>
				</IconButton>
				<IconButton>
					<AppsRoundedIcon className="header__feature" />
				</IconButton>
				<IconButton>
					<NotificationsRoundedIcon className="header__feature" />
				</IconButton>
				{loginState ? (
					<Avatar
						src=""
						className="header__feature header__feature--avatar"
						onClick={handleClick("bottom")}
						id="avatar"
					/>
				) : (
					<Link
						to="/login"
						className="sidebar__link"
						style={{ paddingRight: "12px" }}
					>
						<div className="sidebar__login">
							<Avatar className="sidebar__login--avatar" />
							<p className="sidebar__login--text">SIGN IN</p>
						</div>
					</Link>
				)}
			</div>

			<Popper
				open={openPop}
				anchorEl={anchorEl}
				placement={placement}
				style={{ zIndex: 1 }}
				// transition
			>
				<ClickAwayListener onClickAway={handleClickAway}>
					{btnId === "avatar" ? (
						<div className="header__popper">
							<div className="header__popperUser">
								<Avatar className="header__popperAvatar" />
								<div className="header__popperUserInfo">
									<div className="header__popperUsername">
										{userState?.username}
									</div>
									<div className="header__popperEmail">
										{userState?.email}
									</div>
								</div>
							</div>
							<div className="header__popperSection">
								<div
									className="header__popperLogOut"
									onClick={() => {
										setOpenPop(false);
										history.push("/channel");
									}}
								>
									<AccountBoxRoundedIcon />
									<p className="header__popperOptionTitle">
										Your channel
									</p>
								</div>
								<div
									className="header__popperLogOut"
									onClick={handleLogOut}
								>
									<ExitToAppIcon />
									<p className="header__popperOptionTitle">
										Log out
									</p>
								</div>
							</div>
						</div>
					) : (
						<div
							className="videoPage__popper"
							style={{ width: "300px" }}
						>
							<div className="videoPage__popperText">
								<div className="videoPage__popperTitle">
									Do you to upload video?
								</div>
								<div className="videoPage__popperInfo">
									Sign in to upload your video.
								</div>
							</div>
							<Link
								to="/login"
								className="videoPage__link"
								onClick={handleClickAway}
							>
								<p className="videoPage__signIn">SIGN IN</p>
							</Link>
						</div>
					)}
				</ClickAwayListener>
			</Popper>
		</div>
	);
}

export default Header;
