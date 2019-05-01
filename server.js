/*
 * server.js
 * Here we launch PairCode! App logic is inside app.js
 */
const { http, models } = require('./app');

models.sequelize.sync().then(function() {
    http.listen(process.env.PORT || 3000, () =>
        console.log(`listening on ${process.env.PORT || 3000}`)
    )
})
