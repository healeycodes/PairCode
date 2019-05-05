/*
 * autosave.js
 * A Web Worker to autosave the Room's data to the database
 */

// Save every X ms
const saveTime = 500;

// This room's ID, unique
let roomId = 'not_set';

// The last data we saved, used to reduce update calls
const lastSave = {
    html: '',
    css: '',
    js: ''
}

// Current page data
const currentData = {
    html: '',
    css: '',
    js: ''
}

// Communication from main thread
self.addEventListener('message', (e) => {
    // Store roomId, sent during setup
    if (e.data.roomId) {
        roomId = e.data.roomId;
    } else {
        // Else, store the page data
        currentData.html = e.data.html;
        currentData.css = e.data.css;
        currentData.js = e.data.js;
    }
}, false);

// Time looped save function
const timedSave = () => {
    // Store data to be saved in case currentData updates during the POST and there's a desync
    const dataToBeSaved = {
        html: currentData.html,
        css: currentData.css,
        js: currentData.js
    }
    // If we have new data to save
    if (lastSave.html != dataToBeSaved.html || lastSave.css != dataToBeSaved.css || lastSave.js != dataToBeSaved.js) {
        // Send data, store the data we saved, reply to the main thread
        fetch(`/room/${roomId}/save`, {
            method: "POST", // *GET, POST, PUT, DELETE, etc.
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dataToBeSaved),
        })
        .then(res => res.text())
        .then(text => {
            postMessage(text);
            setTimeout(timedSave, saveTime);
        });
    } else {
        // Check again later for new data
        setTimeout(timedSave, saveTime);
    }
}

// Start timedSave loop
timedSave();
