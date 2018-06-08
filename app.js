/*
 * app.js
 * The application logic for Pear Code
 * Back end: Node.js, Express with EJS, Sequelize (PostgreSQL)
 * Testing: Jest
 */

const express = require('express')
const bodyParser = require('body-parser')
const ejs = require('ejs').renderFile
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

// Website Url
const url = "pear-code.com/"

// Database
const models = require('./models')

// Helper functions
const rndID = () => require('crypto').randomBytes(10).toString('hex')

// Express config
app.use(express.static(__dirname + '/public/'))
app.use('/img', express.static(__dirname + 'public/img'))
app.use('/js', express.static(__dirname + 'public/js'))
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/favicon.ico', express.static(__dirname + 'public/favicon.ico'))
app.set('views', __dirname + '/views')
app.engine('html', ejs)
app.set('view engine', 'html')
app.use(bodyParser.json())

// Home Page
app.get('/', (req, res) => res.render('main.html', { popup: "" }))

// Error Page
const errorPage = (res, error = "Unspecified error.") => res.render('main.html', { popup: error })

// Create room
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

// Join room
app.get('/room/:roomId', (req, res) => {
    // Room should always be in DB, if not then send to error page
    models.Room.findOne({ where: { roomid: req.params.roomId } })
        .then(room => {
            if (room) {
                res.render('room.html', {
                    title: 'Pear Code',
                    roomId: req.params.roomId,
                    roomLink: url + req.params.roomId,
                    html: String(room.html),
                    css: String(room.css),
                    js: String(room.js),
                    srcdoc: String(room.html) + "<style>" + String(room.css) + "</style>"
                        + "<script>" + String(room.js) + "</script>"
                })
            } else {
                errorPage(res, "No room by that ID.")
            }
        })
        .catch(error => console.log(error))
})

// Save room
app.post('/room/:roomId/save', (req, res) => {
    const json = req.body
    models.Room.update(
        {
            html: json.html,
            css: json.css,
            js: json.js
        },
        { where: { roomid: req.params.roomId } }
    )
        // Send timestamp
        .then(res.send(JSON.stringify(new Date().toISOString().replace('T', ' ').substr(0, 19))))
        .catch(error => console.log(error))
})

// Delete room
app.get('/room/:roomId/delete', (req, res) => {
    const roomId = req.params.roomId
    models.Room.destroy({
        where: { roomid: roomId },
        force: true
    })
        .then(res.redirect('/'))
        .catch(error => console.log(error))
})

// Fork room
app.get('/room/:roomId/fork', (req, res) => {
    const newRoomId = rndID()
    // Room should always be in DB, if not then send to error page
    models.Room.findOne({ where: { roomid: req.params.roomId } })
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
        socket.emit('_pong', { time: msg.time, roomCount: roomCount })
    })
})

// Listen
models.sequelize.sync().then(function () {
    http.listen(process.env.PORT || 3000, () =>
        console.log(`listening on ${process.env.PORT || 3000}`)
    )
})

module.exports = app