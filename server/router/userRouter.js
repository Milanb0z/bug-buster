const router = require("express").Router();

router.get("/", (req, res) => {
  try {
    res.send("Router");
  } catch (error) {
    res.status(500).send({ error });
  }
});

module.exports = router;
