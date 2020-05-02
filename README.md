
## PairCode

A CodePen clone (but _faster_). Mostly because I love __pair programming__.

[![Build Status](https://travis-ci.org/healeycodes/PairCode.svg?branch=master)](https://travis-ci.org/healeycodes/PairCode)

<br>

- Join a code room with your team and view changes as they happen.
- Fork rooms, or delete them if you don't like your creation.

<br>

![preview image](https://raw.githubusercontent.com/healeycodes/paircode/master/public/img/preview.png "Image of a room on Deux Codes")

<br>

### Tech Stack

Back end: Node.js, Express with EJS templates, socket.io, SQLite via Sequelize.

Front end: HTML5/CSS3, JavaScript(ES6+), Webpack w/ Babel.

Tested with: Jest.

<br>

### Setup

Webpack builds the client code.

`npm install`

`npm run-script build` 

<br>

### Tests

API tested by Jest.

`npm test`

<br>

### Run

Pages and socket.io run by Express.

Set the enviroment variable `PORT` to host on a different port. Default is `3000`.

`npm start`

### License

MIT.
