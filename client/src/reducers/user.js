import {
	SAVE_USER,
	SWITCH_LOGIN_STATE,
	SET_LOGIN_STATE,
	DELETE_USER,
} from "../constants/constants";

export const userState = (state = null, action = {}) => {
	switch (action.type) {
		case SAVE_USER:
			return {
				...state,
				...action.payload,
			};
		case DELETE_USER:
			return (state = null);
		default:
			return state;
	}
};

export const loginState = (state = false, action = {}) => {
	switch (action.type) {
		case SWITCH_LOGIN_STATE:
			return (state = !state);
		case SET_LOGIN_STATE:
			return (state = action.payload);
		default:
			return state;
	}
};
