const router = require("express").Router();
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");
const auth = require("../middleware/auth");

//Create User
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const foundUser = await User.findOne({ email });
    if (foundUser) {
      return res.status(402).send({ error: "Username / Email Already Exists" });
    }

    const newUser = new User({ username, email, password });

    const savedUser = await newUser.save();

    const token = jwt.sign(
      {
        id: savedUser._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.send({ token });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
});

//Login User
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const foundUser = await User.findOne({ email });
    if (!foundUser) {
      return res.status(404).send({ error: "User not Found" });
    }

    const isPassValid = await foundUser.isValidPassword(password);
    if (!isPassValid) {
      return res.status(401).send({ error: "Password is incorrect" });
    }

    res.send(foundUser);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
});

// Logout
router.get("/logout", auth, (req, res) => {
  return res
    .clearCookie("x-auth-token")
    .send({ message: "Successfully logged out 😏 🍀" });
});

module.exports = router;
