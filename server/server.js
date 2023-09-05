const express = require("express");
const cors = require("cors");

require("dotenv").config();

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors());

//Router
app.use("/api/user", require("./router/userRouter"));

app.get("/", (req, res) => {
  res.send("Online");
});

app.listen(PORT, () => console.log(`SERVER_ONLINE_PORT_${PORT}/`));
