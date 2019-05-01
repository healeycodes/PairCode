[![Build Status](https://travis-ci.org/healeycodes/PairCode.svg?branch=master)](https://travis-ci.org/healeycodes/PairCode)

## PairCode ~ https://paircode.glitch.me

A CodePen clone (but _faster_). Mostly because I love __pair programming__. _Powered by socket.io and Node.js._

<br>

![alt text](https://raw.githubusercontent.com/healeycodes/paircode/master/public/img/preview.png "Image of a room on Deux Codes")

Any code you enter will be streamed with your private room, character by character. As a user's code area is changed, their preview iframe will follow, keeping everyone in sync. You can fork or delete rooms, and import any external scripts you need via `<script>` tags. Rooms are automatically saved every half-second.

<br>

### Tech Stack

Back end: Node.js, Express with EJS templates, socket.io, SQLite via Sequelize.

Front end: HTML5/CSS3, JQuery, Bootstrap.

Tested with: Jest, SuperTest.

<br>

### Build

`npm install --save`

<br>

### Tests

`npm test`

<br>

### Run

Set `SECRET` if you're using GitHub webhook for continuous deployment.

`node app.js`
