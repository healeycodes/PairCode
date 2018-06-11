### Deux Codes ~ [http://deuxcodes.com](http://deuxcodes.com)

<br>

A HTML/CSS/JS sandbox with real time pair coding. Powered by socket.io and Node.js.

![alt text](https://github.com/healeycodes/deux-codes/blob/master/public/img/js.png "Image of a room on Deux Codes")

Any code you enter will be streamed with your private room, character by character. As a user's code area is changed, their preivew iframe will follow, keeping everyone in sync. You can fork or delete rooms, and import any external scripts you need via `<script>` tags. Rooms are automatically saved every half-second.

<br>

### Tech Stack

Back end: Node.js, Express with EJS templates, socket.io, PostgreSQL via Sequelize.

Front end: HTML5/CSS3, JQuery, Bootstrap, srcdoc-polyfill.

Tested with: Jest, SuperTest.

<br>

### Build

1. `npm install`

<br>

### Tests

1. Edit `"test"` in `config/config.json` with your PostgreSQL server details.

2. Run `npm test`

<br>

### Run

1. Edit `"production"` in `config/config.json` with your PostgreSQL server details.

2. Run `node app.js`
