let roomId;

const lastSave = {
    html: "",
    css: "",
    js: ""
}

const currentData = {
    html: "",
    css: "",
    js: ""
}

self.addEventListener("message", function (e) {
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

function timedSave() {
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
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                lastSave.html = dataToBeSaved.html;
                lastSave.css = dataToBeSaved.css;
                lastSave.js = dataToBeSaved.js;
                // Reply to the main thread
                postMessage(JSON.parse(xmlhttp.responseText));
                // Check again later
                setTimeout("timedSave()", 500);
            }
        }
    } else {
        // Check again later
        setTimeout("timedSave()", 500);
    }
}

// Start timedSave loop
timedSave();