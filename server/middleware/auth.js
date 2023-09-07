const { User } = require("../models/userModel");
const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  let token;
  token = req.cookies["x-auth-token"];
  console.log(token);
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      console.log(decoded);

      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
};

module.exports = auth;
