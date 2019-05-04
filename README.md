[![Build Status](https://travis-ci.org/healeycodes/PairCode.svg?branch=master)](https://travis-ci.org/healeycodes/PairCode)

## PairCode ~ https://paircode.glitch.me

A CodePen clone (but _faster_). Mostly because I love __pair programming__. _Powered by socket.io and Node.js._

Now with continuous deployment via GitHub webhook 🔨, and continuous integration with Travis CI ✅.

<br>

- Join a code room with your team and view changes as they happen.
- Fork rooms, or delete them if you don't like your creation.
- Rooms are automatically saved every half-second after editing.

![alt text](https://raw.githubusercontent.com/healeycodes/paircode/master/public/img/preview.png "Image of a room on Deux Codes")

<br>

### Tech Stack

Back end: Node.js, Express with EJS templates, socket.io, SQLite via Sequelize.

Front end: HTML5/CSS3, JQuery, Bootstrap, Webpack w/ Babel.

Tested with: Jest, SuperTest.

<br>

### Setup

`npm install`

`npm build`

Inside `.env` set `URL` to the location on the web,. e.g., `localhost:3000`

<br>

### Tests

`npm test`

<br>

### Run

`npm start`

<br>

##### If you're using a GitHub webhook for continuous deployment to Glitch:

Create remote branch inside the container using `git remote add origin {url}`.

Set up a GitHub webhook to hit `/git` with a secure signature of your secret.

Set `SECRET` to your secret inside `.env`
