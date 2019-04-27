/*
 * room.js
 * The client code for PairCode
 * Front end: Bootstrap, HTML, CSS, ES6 JavaScript
 */

// The autosave Web Worker
let autosave

// This room's ID, unique
let roomId = "not_set"

// Object containing this page's data, will always be up-to-date
const page = {
    html: "",
    css: "",
    js: "",
    lastSaved: "",
    getPage: () => {
        return {
            html: page.html,
            css: page.css,
            js: page.js
        }
    }
}

// Socket.IO user ID
const user = {
    id: "not_set"
}
const setId = (id) => user.id = id

// Update iframe. Uses srcdoc-polyfill library
const cycleFrame = () => {
    const liveFrame = document.getElementById("live-frame")
    const newContent = `${page.html}<style>${page.css}</style><script>${page.js}</script>`
    srcDoc.set(liveFrame, newContent)
}

// Update user code
const setUserCode = (msg) => {
    $("#html textarea").val(msg.html)
    $("#css textarea").val(msg.css)
    $("#js textarea").val(msg.js)
}

// Checks whether the recieved content is the same as our page
const checkIfNew = (msg) => {
    let doCycle = false
    if (msg.html != page.html) {
        page.html = msg.html
        doCycle = true
    }
    if (msg.css != page.css) {
        page.css = msg.css
        doCycle = true
    }
    if (msg.js != page.js) {
        page.js = msg.js
        doCycle = true
    }
    if (doCycle) {
        setUserCode(msg)
        cycleFrame()
    }
}

// When document is ready, set up listeners, buttons, etc.
$(document).ready(() => {
    // Update the preview to the last save point
    const liveFrame = document.getElementById("live-frame")
    const oldContent = $("#data").attr("data-page")
    srcDoc.set(liveFrame, oldContent)

    // Store roomId
    roomId = $("#data").attr("data-roomid")

    // Create fork button
    $("#fork-btn").click(() => {
        window.location = `/room/${roomId}/fork`
    })

    // Create autosave Web Worker
    if (typeof(autosave) == "undefined") {
        autosave = new Worker("/js/autosave.js")
        autosave.onmessage = (event) => {
            $("#last-saved").text(`Autosaved @ ${event.data}`)
        }
        autosave.postMessage({
            roomId: roomId
        })
    }

    // Socket.IO
    const socket = io()
    socket.emit('join-room', {
        roomId: roomId
    })

    $(() => {
        socket.on('connect', () => {
            setId(socket.id)
        })
        socket.on("update", (msg) => {
            checkIfNew(msg)
        })
        socket.on("_pong", (msg) => {
            $("#ping").text(`${msg.roomCount} in room / ping: ${Date.now() - msg.time}ms`)
        })
    })

    // Listen to all three textareas
    $("textarea").bind("change keypress input textInput paste", () => {
        let html = $("#html textarea").val()
        let css = $("#css textarea").val()
        let js = $("#js textarea").val()

        // If nothing has changed, perform no actions
        if (html == page.html && css == page.css && js == page.js) {
            return
        }

        // Store this data
        page.html = html
        page.css = css
        page.js = js

        // Update iframe
        cycleFrame()

        // Share our data to the room
        socket.emit("update", {
            data: {
                id: user.id,
                html: html,
                css: css,
                js: js
            },
            roomId: roomId
        })

        // Send data to be saved
        autosave.postMessage({
            html: html,
            css: css,
            js: js
        })
    })

    // Delete button
    $("#delete-btn").click(() => window.location.replace(`/room/${roomId}/delete`))

    // Home button
    $("#home-btn").click(() => window.location.assign("/"))

    // Header link-back
    $("#header").click(() => window.location.assign("/"))

    // Pings the server every x milliseconds
    // Also returns room count
    ping = () => {
        socket.emit("_ping", {
            time: Date.now(),
            roomId: roomId,
            roomCount: null
        })
        setTimeout("ping()", 2000)
    }
    ping()
})