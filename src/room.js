const page = {
  html: "",
  css: "",
  js: "",
  getPage: () => {
    return {
      html: page.html,
      css: page.css,
      js: page.js
    };
  }
};

// Set when Socket.IO connects
let userId = '';

// Update iframe
const cycleFrame = () => {
  const liveFrame = document.getElementById("live-frame");
  const newContent = `${page.html}<style>${page.css}</style><script>${page.js}</script>`;
  srcDoc.set(liveFrame, newContent);
};

// Update user code
const setUserCode = msg => {
  document.querySelector("#html textarea").value = msg.html;
  document.querySelector("#css textarea").value = msg.css;
  document.querySelector("#js textarea").value = msg.js;
};

const checkIfNew = msg => {
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
};

window.addEventListener("DOMContentLoaded", () => {
  // Update to the last save point
  const liveFrame = document.getElementById("live-frame");
  const oldContent = document.querySelector("#data").getAttribute("data-page");
  srcDoc.set(liveFrame, oldContent); // external lib

  const roomId = document.querySelector("#data").getAttribute("data-roomid");

  // Fork button
  document.querySelector("#fork-btn").onclick = () =>
    (window.location = `/room/${roomId}/fork`);

  const socket = io();
  socket.emit("join-room", {
    roomId: roomId
  });
  socket.on("connect", () => {
    userId = socket.id;
  });
  socket.on("update", msg => {
    checkIfNew(msg);
  });
  socket.on("_pong", msg => {
    document.querySelector("#ping").innerText = `${
      msg.roomCount
    } in room / ping: ${Date.now() - msg.time}ms`;
  });

  const handleInput = () => {
    const html = document.querySelector("#html textarea").value;
    const css = document.querySelector("#css textarea").value;
    const js = document.querySelector("#js textarea").value;

    if (html == page.html && css == page.css && js == page.js) {
      return;
    }

    page.html = html;
    page.css = css;
    page.js = js;

    cycleFrame();

    // Share our data to the room
    socket.emit("update", {
      data: {
        id: userId,
        html: html,
        css: css,
        js: js
      },
      roomId: roomId
    });

    // Save!
    fetch(`/room/${roomId}/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        html: html,
        css: css,
        js: js
      })
    })
      .then(res => res.text())
      .then(
        text =>
          (document.querySelector(
            "#last-saved"
          ).innerText = `Autosaved @ ${text}`)
      );
  };

  window.addEventListener("change", handleInput, false);
  window.addEventListener("keypress", handleInput, false);
  window.addEventListener("input", handleInput, false);
  window.addEventListener("textInput", handleInput, false);
  window.addEventListener("paste", handleInput, false);

  // Delete button
  document.querySelector("#delete-btn").onclick = () =>
    window.location.assign(`/room/${roomId}/delete`);

  // Home button
  document.querySelector("#home-btn").onclick = () =>
    window.location.assign("/");

  const ping = () => {
    socket.emit("_ping", {
      time: Date.now(),
      roomId: roomId,
      roomCount: null
    });
    setTimeout(ping, 2000);
  };
  ping();
});
