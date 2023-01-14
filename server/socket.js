const Room = require("./room");

module.exports = io => {

  let rooms = {}

  // Listen for new connections
  io.on('connection', (socket) => {
    console.log('A new player has connected!', socket.handshake.query);
    const { name, room: room_name } = socket.handshake.query

    // get room or create
    if (!rooms[room_name]) {
      rooms[room_name] = new Room(room_name, { io })
    }
    const room = rooms[room_name]
    room.join(name)
    socket.join(room_name)

    socket.emit('init', room.players)

    // listen to player position change
    socket.on('player-position-changed', (x, y) => {
      room.updatePlayerPosition(name, { x, y })
    })

    // listen to player position change
    socket.on('player-score-increased', (name, amount) => {
      if (room.players[name]) {
        room.updatePlayerScore(name, room.players[name].score + amount)
      }
    })

    // Listen for a "disconnect" event
    socket.on('disconnect', () => {
      room.leave(name)
      console.log('A player has disconnected!', socket.handshake.query);
    });
  });

}