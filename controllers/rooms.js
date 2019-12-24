module.exports = function(app, models) {
  const demos = require("../demos");
  const rndID = require("../friendlyRandom").get;
  const errorPage = (res, error = "Unspecified error.") =>
    res.render("main.html", {
      popup: error
    });

  // Create room
  app.get("/new-room", async (req, res) => {
    const newRoomId = rndID();
    await models.Room.create({
      roomid: newRoomId,
      html: "",
      css: "",
      js: ""
    });
    res.redirect("/room/" + newRoomId);
  });

  // Create demo room
  app.get("/demo/:demoId", async (req, res) => {
    const newRoomId = rndID();
    const demo = demos[req.params.demoId];
    await models.Room.create({
      roomid: newRoomId,
      html: demo.html,
      css: demo.css,
      js: demo.js
    });
    res.redirect("/room/" + newRoomId);
  });

  // Join room
  app.get("/room/:roomId", async (req, res) => {
    const room = await models.Room.findOne({
      where: {
        roomid: req.params.roomId
      }
    });
    if (room) {
      res.render("room.html", {
        title: "PairCode",
        roomId: req.params.roomId,
        roomRoute: `/room/${req.params.roomId}`,
        html: room.html,
        css: room.css,
        js: room.js,
        srcdoc: `${room.html}<style>${room.css}</style><script>${room.js}</script>`
      });
    } else {
      errorPage(res, "No room by that ID.");
    }
  });

  // Save room
  app.post("/room/:roomId/save", async (req, res) => {
    const json = req.body;
    await models.Room.update(
      {
        html: json.html,
        css: json.css,
        js: json.js
      },
      {
        where: {
          roomid: req.params.roomId
        }
      }
    );
    // Send timestamp
    res.send(`${new Date()}`.substr(0, 21));
  });

  // Delete room
  app.get("/room/:roomId/delete", async (req, res) => {
    await models.Room.destroy({
      where: {
        roomid: req.params.roomId
      },
      force: true
    });
    res.redirect("/");
  });

  // Fork room
  app.get("/room/:roomId/fork", async (req, res) => {
    const newRoomId = rndID();
    const room = await models.Room.findOne({
      where: {
        roomid: req.params.roomId
      }
    });
    if (room) {
      await models.Room.create({
        roomid: newRoomId,
        html: room.html,
        css: room.css,
        js: room.js
      });
      res.redirect("/room/" + newRoomId);
    } else {
      errorPage(res, "Trying to fork an unknown room.");
    }
  });
};
