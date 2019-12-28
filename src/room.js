const io = require('../lib/socket.io');
const srcDoc = require('../lib/srcdoc-polyfill.min.js');

const roomId = document.querySelector("#data").getAttribute("data-roomid");
let userId = ""; // Set when connecting to Socket.IO

const page = {
  html: null,
  css: null,
  js: null
};

const updateFrame = () => {
  const liveFrame = document.getElementById("live-frame");
  const newContent = `${page.html}<style>${page.css}</style><script>${page.js}</script>`;
  srcDoc.set(liveFrame, newContent);
};

const updateUserCode = () => {
  document.querySelector("#html textarea").value = page.html;
  document.querySelector("#css textarea").value = page.css;
  document.querySelector("#js textarea").value = page.js;
};

const socket = io();
socket.emit("join-room", {
  roomId: roomId
});
socket.on("connect", () => {
  userId = socket.id;
});
socket.on("update", msg => {
  page.html = msg.html;
  page.css = msg.css;
  page.js = msg.js;
  updateFrame();
  updateUserCode();
});
socket.on("_pong", msg => {
  document.querySelector("#ping").innerText = `${
    msg.roomCount
  } in room / ping: ${Date.now() - msg.time}ms`;
});

const saveCode = roomId => {
  fetch(`/room/${roomId}/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      html: page.html,
      css: page.css,
      js: page.js
    })
  })
    .then(res => res.text())
    .then(
      text =>
        (document.querySelector("#last-saved").innerText = `Autosaved @ ${text}`)
    );
};

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

  updateFrame();

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

  saveCode(roomId);
};

window.addEventListener("change", handleInput, false);
window.addEventListener("keypress", handleInput, false);
window.addEventListener("input", handleInput, false);
window.addEventListener("textInput", handleInput, false);
window.addEventListener("paste", handleInput, false);

const ping = () => {
  socket.emit("_ping", {
    time: Date.now(),
    roomId: roomId,
    roomCount: null
  });
  setTimeout(ping, 2000);
};
ping();

// Home button
document.querySelector("#home-btn").onclick = () => window.location.assign("/");

// Fork button
document.querySelector("#fork-btn").onclick = () =>
  window.location.assign(`/room/${roomId}/fork`);

// Delete button
document.querySelector("#delete-btn").onclick = () =>
  window.location.assign(`/room/${roomId}/delete`);

// Share link
const shareLink = document.querySelector(".share-link input");
shareLink.value = `${window.location.protocol}//${window.location.hostname}${shareLink.value}`;

handleInput();
