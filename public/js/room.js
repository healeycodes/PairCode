const page = {
    html: "",
    css: "",
    js: ""
}

const user = {
    id: "not_set"
}

// roomId#id Example: "/b886a9a534e9d70a0dcd#jGXix0kTpzaJx-mJAAAC";
const setId = (id) => user.id = id.split("#")[1];

// Update iframe
const cycleFrame = () => $("#live-frame").attr("srcdoc", page.html + "<style>" + page.css + "</style>"
+ "<script>" + page.js + "</script>");

// Update user code
const setUserCode = (updateContent) => {
    $("#html textarea").val(updateContent.html);
    $("#css textarea").val(updateContent.css);
    $("#js textarea").val(updateContent.js);
}

// Checks whether the recieved content is the same as our page
const checkIfNew = (updateContent) => {
    let doCycle = false;
    if (updateContent.html != page.html) {
        page.html = updateContent.html;
        doCycle = true;
    }
    if (updateContent.css != page.css) {
        page.css = updateContent.css;
        doCycle = true;
    }
    if (updateContent.js != page.js) {
        page.js = updateContent.js;
        doCycle = true;
    }
    if (doCycle) {
        setUserCode(updateContent);
        cycleFrame();
    }
}

$(document).ready(function() {

    // Socket.IO
    const socket = io("localhost:3000/" + $("#menu").attr("roomid"));

    $(function () {
        // Store user ID
        socket.on('connect', () => {
            console.log('connected..');
            setId(socket.id);
        });

        socket.on("update", (updateContent) => {
            console.log(updateContent);
            if (user.id == "not_set") {
                setId(socket.id);
            }
            // If this update did not originate from ourselves
            if (updateContent.id != user.id) {
                checkIfNew(updateContent);
            }
        });
    });

    // Listen to all three textareas
    $("textarea").bind("change keyup input paste", () => {
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
        socket.emit("update", {id: user.id, html: html, css: css, js: js}, );
      });

});

