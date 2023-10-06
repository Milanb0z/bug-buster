const router = require("express").Router();
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const auth = require("../middleware/auth");
const { User } = require("../models/userModel");
const { Bug } = require("../models/bugModel");
const { Token } = require("../models/tokenModel");

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

    // Creating & Sending Token
    const verifToken = new Token({
      _userId: savedUser._id,
      token: uuidv4(),
    });

    const savedToken = await verifToken.save();
    if (!savedToken)
      return res.status(500).send({
        error: "Something wen't wrong while verifying email",
      });

    const verificationLink = `http://${req.headers.host}/api/user/verify-email?token=${savedToken.token}`;
    const msg = {
      to: savedUser.email,
      from: "bozic411@gmail.com",
      subject: "Bug Buster Email Verification",
      templateId: "d-9a6e5a9df8554e68a9d854a8d67e3a14",
      dynamic_template_data: {
        user: savedUser.name,
        verification_link: verificationLink,
      },
    };
    sgMail.send(msg);

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

    const token = jwt.sign(
      {
        id: foundUser._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res
      .cookie("x-auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      })
      .send(foundUser);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
});

// Update Bio
router.patch("/me/bio", auth, async (req, res) => {
  const { bio } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { bio },
      { new: true, runValidators: true }
    );

    res.send({ data: updatedUser });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
});

// Get Profile
router.get("/profile", auth, (req, res) => {
  try {
    res.send(req.user);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
});

//Profile Verification
router.get("/verify-email", async (req, res) => {
  try {
    const token = await Token.findOne({ token: req.query.token });
    if (!token)
      return res.notFound({ error: "Unable to find verification token" });

    // find user with matching token
    const user = await User.findOne({ _id: token._userId });
    if (!user)
      return res.status(404).send({
        error: "Unable to find matching user & token for verification",
      });
    if (user.isVerified)
      return res.status(400).send({ error: "User is already verified" });

    user.isVerified = true;

    const savedUser = await user.save();
    if (!savedUser) {
      return res.stauts(500).send({ error: "Error while verifying user" });
    }

    res.send({
      data: savedUser,
      message: "Email address successfully verified.",
    });
    //res.redirect('/');
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
});

//Get User Bugs
router.get("/:username/bugs", async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username }).select("-password");

    if (!user) {
      return res.status(404).send({
        error: `No User Found`,
      });
    }

    const bugs = await Bug.find({ "author.username": username });

    res.send({ data: { users, bugs } });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
});

//Get Users
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    if (!users) {
      return res.status(404).send({
        error: `No Users Found`,
      });
    }

    res.send({ data: users });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
});

//Get User By Username
router.get("/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      "-password"
    );
    if (!user) {
      return res.status(404).send({
        error: `User not found with the username ${req.params.username}`,
      });
    }

    res.send({ data: user });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
});

//Delete
router.delete("/", auth, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user._id);
    res.send({ data: deletedUser });
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
