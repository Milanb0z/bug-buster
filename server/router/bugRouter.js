const router = require("express").Router();
const auth = require("../middleware/auth");
const { Bug } = require("../models/bugModel");

// Fetch Bugs
router.get("/", async (req, res) => {
  try {
    const bugs = await Bug.find({});
    if (!bugs) {
      return res.status(404).send({ error: "Not Found" });
    }

    res.send({ data: bugs });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Something went wrong while getting bugs",
    });
  }
});

// Add Bug
router.post("/", auth, async (req, res) => {
  try {
    const { title, body } = req.body;

    console.log(req.user);
    const authorDetails = {
      _id: req.user.id,
      username: req.user.username,
    };

    const newBug = new Bug({ title, body, author: authorDetails });
    const savedBug = await newBug.save();

    res.send({ data: savedBug });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Something went wrong while getting bugs",
    });
  }
});

// Update Bug
router.patch("/:bugId", auth, async (req, res) => {
  try {
    const { title, body } = req.body;

    const bug = await Bug.findOneAndUpdate(
      {
        _id: req.params.bugId,
        // also check if current user is the author of this bug
        "author._id": { $eq: req.user.id },
      },
      { title, body },
      { new: true } // tells mongo to return the updated document
    );
    if (!bug)
      return res
        .status(404)
        .send({ error: `Can not update Bug#${req.params.bugId}` });

    res.send({ data: bug });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Something went wrong while getting bugs",
    });
  }
});

module.exports = router;
