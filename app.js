const express = require("express");
const bodyParser = require("body-parser");
const friendlyWords = require("friendly-words");
const ejs = require("ejs").renderFile;
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const crypto = require("crypto");
const { execSync } = require("child_process");
const models = require("./models");

// Setup Express
app.use(express.static(__dirname + "/public/"));
app.use("/public", express.static(__dirname + "public"));
app.use("/favicon.ico", express.static(__dirname + "public/favicon.ico"));
app.set("views", __dirname + "/views");
app.engine("html", ejs);
app.set("view engine", "html");
app.use(bodyParser.json());

// Routes
require("./routes")(app, models);

// Socket.IO
require("./io").setupSocketIO(io);

module.exports = {
  app: app,
  http: http,
  models: models
};
