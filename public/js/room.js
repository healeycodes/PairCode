let roomId = "not_set"

const page = {
    html: "",
    css: "",
    js: "",
    getPage: function(){
        return {
            html: this.html,
            css: this.css,
            js: this.js
        }
    }
}

const user = {
    id: "not_set"
}

// roomId#id Example: "/b886a9a534e9d70a0dcd#jGXix0kTpzaJx-mJAAAC";
const setId = (id) => user.id = id;

// Update iframe
const cycleFrame = () => $("#live-frame").attr("srcdoc", page.html + "<style>" + page.css + "</style>"
+ "<script>" + page.js + "</script>");

// Update user code
const setUserCode = (msg) => {
    $("#html textarea").val(msg.html);
    $("#css textarea").val(msg.css);
    $("#js textarea").val(msg.js);
}

// Checks whether the recieved content is the same as our page
const checkIfNew = (msg) => {
    let doCycle = false;
    if (msg.html != page.html) {
        page.html = msg.html;
        doCycle = true;
    }
    if (msg.css != page.css) {
        page.css = msg.css;
        doCycle = true;
    }
    if (msg.js != page.js) {
        page.js = msg.js;
        doCycle = true;
    }
    if (doCycle) {
        setUserCode(msg);
        cycleFrame();
    }
}

$(document).ready(function() {

    roomId = $("#menu").attr("roomid") // store roomId

    // Socket.IO
    const socket = io();
    socket.emit('join-room', {roomId: roomId}); // join room

    $(function () {
        socket.on('connect', () => {
            console.log('connected..');
            setId(socket.id);
        });

        socket.on("update", (msg) => {
            console.log(msg);
            checkIfNew(msg);
        });
    });

    // Listen to all three textareas
    $("textarea").bind("change keypress input textInput paste", () => {
        let html = $("#html textarea").val();
        let css = $("#css textarea").val();
        let js = $("#js textarea").val();

        // If nothing has changed, perform no actions
        if (html == page.html && css == page.css && js == page.js) {
            return;
        }

        // Store this data
        page.html = html;
        page.css = css;
        page.js = js;

        cycleFrame();

        // Share our data to the room
        socket.emit("update", {data: {id: user.id, html: html, css: css, js: js}, roomId: roomId});
      });

      // Create save button logic
      $("#save-btn").click(() => {
        $.ajax({
            type: "POST",
            url: "/room/" + roomId + "/save",
            // Send the latest copy of this user's code
            data: JSON.stringify( page.getPage() ),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(data) {$("#last-saved").text(" " + data)},
            failure: function(errMsg) {
                alert(errMsg);
            }
        });
      })

});

