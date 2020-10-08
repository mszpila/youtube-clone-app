const User = require("./user_model");
const Video = require("../video/video_model");
const Commentary = require("../comment/comment_model");
const UserService = require("./user_service");

module.exports = UserService(User, Video, Commentary);
