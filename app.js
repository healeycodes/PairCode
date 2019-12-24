// Express
const express = require("express");
const bodyParser = require("body-parser");
const friendlyWords = require("friendly-words");
const ejs = require("ejs").renderFile;
const app = express();
const http = require("http").createServer(app);
app.use(express.static(__dirname + "/public/"));
app.use("/public", express.static(__dirname + "public"));
app.use("/favicon.ico", express.static(__dirname + "public/favicon.ico"));
app.set("views", __dirname + "/views");
app.engine("html", ejs);
app.set("view engine", "html");
app.use(bodyParser.json());

// Controllers
const models = require("./models");
require("./controllers/rooms")(app, models);
require("./controllers/home")(app, models);
require("./controllers/socketio")(http);

module.exports = {
  app: app,
  http: http,
  models: models
};
