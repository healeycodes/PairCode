const express = require('express')
const bodyParser = require('body-parser')
const ejs = require('ejs').renderFile
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

// Url
const url = "http://pear-code.com/"

// Database
const models = require('./models')

// Helper functions
const rndID = () => require('crypto').randomBytes(10).toString('hex')

// Express config
app.use(express.static(__dirname + '/public/'))
app.use('/img', express.static(__dirname + 'public/img'))
app.use('/js', express.static(__dirname + 'public/js'))
app.use('/css', express.static(__dirname + 'public/css'))
app.set('views', __dirname + '/views')
app.engine('html', ejs)
app.set('view engine', 'html')
app.use(bodyParser.json())

// Home Page
app.get('/', (req, res) => {
    res.send('Hello World!')
})

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
    models.Room.findOne({ where: { roomid: req.params.roomId } }).then(room => {
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
            // Send to error page
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

// Fork room
app.get('/room/:roomId/fork', (req, res) => {
    const newRoomId = rndID()
    // Room should always be in DB, if not then send to error page
    models.Room.findOne({ where: { roomid: req.params.roomId } }).then(room => {
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
            // Send to error page
        }
    })
        .catch(error => console.log(error))
})

// Socket.IO
io.on('connection', (socket) => {
    // console.log(socket.client.id + ' connected ')
    socket.on('join-room', (msg) => {
        // console.log(`${socket.id} joined ${msg.roomId}`)
        socket.join(msg.roomId);
    })
    socket.on('update', (msg) => {
        // console.log(`${msg.data.html} ${msg.data.css} ${msg.data.js} `)
        // send to all clients in 'game' room(channel) except sender
        socket.broadcast.to(msg.roomId).emit('update', msg.data);
    })
    socket.on('_ping', (msg) => {
        const roomCount = io.sockets.adapter.rooms[msg.roomId].length;
        socket.emit('_pong', {time: msg.time, roomCount: roomCount})
    })
})

// Listen
models.sequelize.sync().then(function () {
    http.listen(process.env.PORT || 3000, () => {
        console.log(`listening on ${process.env.PORT || 3000}`)
    })
});
