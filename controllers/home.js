module.exports = function(app, models) {
  // Home
  app.get("/", (req, res) =>
    res.render("main.html", {
      popup: ""
    })
  );
}
