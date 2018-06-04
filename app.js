const express = require('express')
const ejs = require('ejs').renderFile
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

// Listen on..
const port = 3000

// Helper functions
const rndID = () => require('crypto').randomBytes(10).toString('hex');

// Socket.IO config
// Load, etc.

// Express config
app.use(express.static(__dirname + '/public/'));
app.use('/img', express.static(__dirname + 'public/img'));
app.use('/js', express.static(__dirname + 'public/js'));
app.use('/css', express.static(__dirname + 'public/css'));
app.set('views', __dirname + '/public/views');
app.engine('html', ejs);
app.set('view engine', 'html');

// Home Page
app.get('/', (req, res) => {
    // res.render('index.html', {title: 'Pear Code'})
    res.send('Hello World!')
})

// Create room
app.get('/new-room', (req, res) => {
    const roomID = rndID()
    let nsp = io.of('/' + roomID);
    nsp.on('connection', (socket) => {console.log(socket.client.id + ' connected to #' + roomID)
        socket.on('update', (updateContent) => {
            console.log(updateContent)
            nsp.emit('update', updateContent)
        })
    })
    console.log('created room #' + roomID)
    res.redirect('/room/' + roomID)
})

// Join room
app.get('/room/:roomId', (req, res) => {
    if (true) { // If room exists req.params.roomId
        res.render('room.html', {title: 'Pear Code', roomId: req.params.roomId})
    }
})

// Debugging
io.on('connection', (socket) => {
    console.log(socket.client.id + ' connected ')
    socket.on('disconnect', () => {
        console.log(socket.client.id + ' disconnected ')
    })
})

http.listen(port, () => {
    console.log(`listening on ${port}`)
})