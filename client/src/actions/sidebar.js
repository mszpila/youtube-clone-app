import { SWITCH_SIDEBAR, SET_SIDEBAR } from "../constants/constants";

export const switchSidebar = () => ({ type: SWITCH_SIDEBAR });
export const setSidebar = (state) => ({ type: SET_SIDEBAR, payload: state });
