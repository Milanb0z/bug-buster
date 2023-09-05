const express = require("express");
const cors = require("cors");

require("dotenv").config();

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors());

app.get("/", (req, res) => {
  res.send("Online");
});

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}/`)
);
