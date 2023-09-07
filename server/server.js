const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const sgMail = require("@sendgrid/mail");

require("dotenv").config();
require("./config/db");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

//Router
app.use("/api/user", require("./router/userRouter"));

app.get("/", (req, res) => {
  res.send("Online");
});

app.listen(PORT, () => console.log(`SERVER_ONLINE_PORT_${PORT}/`));
