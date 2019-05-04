/*
 * app.js
 * The application logic for PairCode
 * Back end: Node.js, Express with EJS, Sequelize (SQLite)
 * Testing: Jest
 */
const express = require('express')
const bodyParser = require('body-parser')
const friendlyWords = require('friendly-words');
const ejs = require('ejs').renderFile
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const demos = require('./demos')
const crypto = require('crypto')

// Express config
app.use(express.static(__dirname + '/public/'))
app.use('/public', express.static(__dirname + 'public'))
app.use('/favicon.ico', express.static(__dirname + 'public/favicon.ico'))
app.set('views', __dirname + '/views')
app.engine('html', ejs)
app.set('view engine', 'html')
app.use(bodyParser.json());

// Database
const models = require('./models')

// Website Url
const url = process.env.URL

// Friendly random id
const rndID = () => {
    const pick = arr => arr[Math.floor(Math.random() * arr.length)]
    return `${pick(friendlyWords.predicates)}-${pick(friendlyWords.objects)}-${pick(friendlyWords.objects)}`
}


// GET: Home Page
app.get('/', (req, res) => res.render('main.html', {
    popup: ""
}))

// Error Page
const errorPage = (res, error = "Unspecified error.") => res.render('main.html', {
    popup: error
})

// GET: Create room
app.get('/new-room', (req, res) => {
    const newRoomId = rndID()
    let newRoom = models.Room.create({
            roomid: newRoomId,
            html: "",
            css: "",
            js: ""
        })
        .then(() => res.redirect('/room/' + newRoomId))
        .catch(error => console.log(error))
})

// GET: Create demo room
app.get('/demo/:demoId', (req, res) => {
    const newRoomId = rndID()
    const demo = demos[req.params.demoId]
    let newRoom = models.Room.create({
            roomid: newRoomId,
            html: demo.html,
            css: demo.css,
            js: demo.js
        })
        .then(() => res.redirect('/room/' + newRoomId))
        .catch(error => console.log(error))
})

// GET: Join room
app.get('/room/:roomId', (req, res) => {
    // Room should always be in DB, else send to error page
    models.Room.findOne({
            where: {
                roomid: req.params.roomId
            }
        })
        .then(room => {
            if (room) {
                res.render('room.html', {
                    title: 'PairCode',
                    roomId: req.params.roomId,
                    roomLink: `${url}/room/${req.params.roomId}`,
                    html: String(room.html),
                    css: String(room.css),
                    js: String(room.js),
                    srcdoc: `${String(room.html)}<style>${String(room.css)}</style><script>${String(room.js)}</script>`
                })
            } else {
                errorPage(res, "No room by that ID.")
            }
        })
        .catch(error => console.log(error))
})

// POST: Save room
app.post('/room/:roomId/save', (req, res) => {
    const json = req.body
    models.Room.update({
            html: json.html,
            css: json.css,
            js: json.js
        }, {
            where: {
                roomid: req.params.roomId
            }
        })
        // Send timestamp
        .then(res.send(JSON.stringify(new Date().toISOString().replace('T', ' ').substr(0, 19))))
        .catch(error => console.log(error))
})

// GET: Delete room
app.get('/room/:roomId/delete', (req, res) => {
    const roomId = req.params.roomId
    models.Room.destroy({
            where: {
                roomid: roomId
            },
            force: true
        })
        .then(res.redirect('/'))
        .catch(error => console.log(error))
})

// GET: Fork room
app.get('/room/:roomId/fork', (req, res) => {
    const newRoomId = rndID()
    // Room should always be in DB, else send to error page
    models.Room.findOne({
            where: {
                roomid: req.params.roomId
            }
        })
        .then(room => {
            if (room) {
                let newRoom = models.Room.create({
                        roomid: newRoomId,
                        html: String(room.html),
                        css: String(room.css),
                        js: String(room.js)
                    })
                    .then(() => res.redirect('/room/' + newRoomId))
                    .catch(error => console.log(error))
            } else {
                errorPage(res, "Trying to fork an unknown room.")
            }
        })
        .catch(error => console.log(error))
})


// (SPECIAL) POST: Receive webhook from GitHub
app.post('/git', (req, res) => {
    const hmac = crypto.createHmac('sha1', process.env.SECRET)
    const sig  = 'sha1=' + hmac.update(JSON.stringify(req.body)).digest('hex')
    if (req.headers['x-github-event'] === 'push' ||
        crypto.timingSafeEqual(sig, req.headers['x-hub-signature'])) {
        const { execSync } = require('child_process');
        const commands = ['git fetch origin master',
                          'git reset --hard origin/master',
                          'git pull origin master --force',
                          'npm build',
                          'refresh'] // Fixes Glitch UI
        for (const cmd of commands) {
            console.log(execSync(cmd).toString())
        }
        console.log('> [GIT] Updated with origin/master')
    } else {
        console.log('> Webhook signature incorrect!')
    }
    return res.sendStatus(200);
});

// Socket.IO
io.on('connection', (socket) => {
    socket.on('join-room', (msg) => {
        if (msg.roomId) {
            socket.join(msg.roomId)
        }
    })
    socket.on('update', (msg) => {
        if (msg.roomId && msg.data) {
            socket.broadcast.to(msg.roomId).emit('update', msg.data)
        }
    })
    socket.on('_ping', (msg) => {
        let room
        if (msg.roomId) {
            room = io.sockets.adapter.rooms[msg.roomId]
        }
        let roomCount
        // Check for undefined room, e.g., if the pinger just left
        if (room) {
            roomCount = room.length
        } else {
            roomCount = 0
        }
        socket.emit('_pong', {
            time: msg.time,
            roomCount: roomCount
        })
    })
})

module.exports = {
    app: app,
    http: http,
    models: models
}