require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const got = require("got");
const net = require("net");
const cors = require("cors");

const Telnet = require("telnet-client");
const indexRouter = require("./routes/index");

const app = express();
app.use(cors());

app.use(express.json());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
/*

const connection = new Telnet();

// these parameters are just examples and most probably won't work for your use-case.
const params = {
  host: "127.0.0.1",
  port: 1337,
  shellPrompt: "/ # ", // or negotiationMandatory: false
  timeout: 1500,
  // removeEcho: 4
};

connection.on("ready", prompt => {
  connection.exec("AUTH test1@test.com password1", (err, response) => {
    console.log(response);
  });
});

connection.on("timeout", () => {
  console.log("socket timeout!");
  connection.end();
});

connection.on("close", () => {
  console.log("connection closed");
});

connection.connect(params);

console.log(buff);
const client = new net.Socket();
client.connect(1337, "127.0.0.1", () => {
  client.write("AUTH test1@test.com password1 \n");
});
client.on("data", dt => {
  console.log(dt.toString("utf8"));
});
*/
module.exports = app;
