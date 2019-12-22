const { http, models } = require("./app");

models.sequelize
  .sync()
  .then(
    http.listen(process.env.PORT || 3000, () =>
      console.log(`listening on ${process.env.PORT || 3000}`)
    )
  );
