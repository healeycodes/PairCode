const express = require('express')
const bodyParser = require('body-parser')
const ejs = require('ejs').renderFile
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

//
const port = 3000
const url = "http://lowlatencycoding.com/"

// Helper functions
const rndID = () => require('crypto').randomBytes(10).toString('hex')

// Express config
app.use(express.static(__dirname + '/public/'))
app.use('/img', express.static(__dirname + 'public/img'))
app.use('/js', express.static(__dirname + 'public/js'))
app.use('/css', express.static(__dirname + 'public/css'))
app.set('views', __dirname + '/public/views')
app.engine('html', ejs)
app.set('view engine', 'html')
app.use(bodyParser.json())

// Home Page
app.get('/', (req, res) => {
    // res.render('index.html', {title: 'Pear Code'})
    res.send('Hello World!')
})

// Create room
app.get('/new-room', (req, res) => {
    const roomID = rndID()
    res.redirect('/room/' + roomID)
})

// Join room
app.get('/room/:roomId', (req, res) => {
    res.render('room.html', {title: 'Pear Code', roomId: req.params.roomId, roomLink: url + req.params.roomId})
})

// Save room
app.post('/room/:roomId/save', (req, res) => {
    json = req.body
    console.log(json)
    res.send(JSON.stringify(new Date().toISOString().replace('T', ' ').substr(0, 19)))
})

// Socket.IO
io.on('connection', (socket) => {
    console.log(socket.client.id + ' connected ')
    socket.on('join-room', (msg) => {
        console.log(`${socket.id} joined ${msg.roomId}`)
        socket.join(msg.roomId);
    })
    socket.on('update', (msg) => {
        console.log(`${msg.data.html} ${msg.data.css} ${msg.data.js} `)
        // sending to all clients in 'game' room(channel) except sender
        socket.broadcast.to(msg.roomId).emit('update', msg.data);
    })
})


http.listen(port, () => {
    console.log(`listening on ${port}`)
})
