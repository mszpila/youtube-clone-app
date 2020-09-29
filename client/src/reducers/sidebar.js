import { SWITCH_SIDEBAR, SET_SIDEBAR } from "../constants/constants";

export const sidebarState = (state = true, action = {}) => {
	switch (action.type) {
		case SWITCH_SIDEBAR:
			return (state = !state);
		case SET_SIDEBAR:
			return (state = action.payload);
		default:
			return state;
	}
};
