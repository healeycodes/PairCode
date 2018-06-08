/*
 * autosave.js
 * A Web Worker to autosave the Room's data to the database
 */

// Save every X ms
const saveTime = 500

// This room's ID, unique
let roomId = "not_set";

// The last data we saved, used to reduce update calls
const lastSave = {
    html: "",
    css: "",
    js: ""
}

// Current page data
const currentData = {
    html: "",
    css: "",
    js: ""
}

// Communication from main thread
self.addEventListener("message", (e) => {
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
    // What we will reply to the main thread
    let response = "";
    // Store data to be saved in case currentData updates during the POST and there's a desync
    let dataToBeSaved = {
        html: currentData.html,
        css: currentData.css,
        js: currentData.js
    }
    // If we have new data to save
    if (lastSave.html != dataToBeSaved.html || lastSave.css != dataToBeSaved.css || lastSave.js != dataToBeSaved.js) {
        // Send data, store the data we saved, reply to the main thread
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("POST", "/room/" + roomId + "/save");
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(JSON.stringify(dataToBeSaved));
        xmlhttp.onreadystatechange = () => {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                lastSave.html = dataToBeSaved.html;
                lastSave.css = dataToBeSaved.css;
                lastSave.js = dataToBeSaved.js;
                // Reply to the main thread
                postMessage(JSON.parse(xmlhttp.responseText));
                // Check again later
                setTimeout("timedSave()", saveTime);
            }
        }
    } else {
        // Check again later for new data
        setTimeout("timedSave()", saveTime);
    }
}

// Start timedSave loop
timedSave();