const setupSocketIO = io =>
  io.on("connection", socket => {
    socket.on("join-room", msg => {
      if (msg.roomId) {
        socket.join(msg.roomId);
      }
    });
    
    // Share user updates
    socket.on("update", msg => {
      if (msg.roomId && msg.data) {
        socket.broadcast.to(msg.roomId).emit("update", msg.data);
      }
    });
    
    // Report room latency
    socket.on("_ping", msg => {
      const room = msg.roomId
        ? io.sockets.adapter.rooms[msg.roomId]
        : undefined;
      const roomCount = room ? room.length : 0;
      socket.emit("_pong", {
        time: msg.time,
        roomCount: roomCount
      });
    });
  });

module.exports = {
  setupSocketIO
};
