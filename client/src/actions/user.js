import {
	SAVE_USER,
	SWITCH_LOGIN_STATE,
	SET_LOGIN_STATE,
	DELETE_USER,
} from "../constants/constants";

export const saveUser = (user) => ({ type: SAVE_USER, payload: user });
export const deleteUser = () => ({ type: DELETE_USER, payload: null });
export const switchLoginState = () => ({ type: SWITCH_LOGIN_STATE });
export const setLoginState = (state) => ({
	type: SET_LOGIN_STATE,
	payload: state,
});
