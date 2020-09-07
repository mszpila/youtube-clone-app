const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
	const token = req.cookies.login_auth;
	if (!token) return res.status(401).json({ message: "Auth Error" });

	try {
		const decoded = jwt.verify(token, "randomString", function (
			err,
			decoded
		) {
			if (err) {
				return res.status(401).json({ err });
			}
			return decoded;
		});
		req.user = decoded.user;
		next();
	} catch (e) {
		console.error(e);
		res.status(500).send({ message: "Invalid Token" });
	}
};
