import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

interface User {
  socket: WebSocket;
  room: string;
  userId: string;
}

const allSockets: User[] = [];
let userCount = 0;

wss.on('connection', (socket: WebSocket) => {
  userCount = userCount + 1;
  console.log('User connected #' + userCount);
  const userId = `user-${userCount}`;
  
  socket.on('message', (message: Buffer) => {
    try {
      const parsedMessage = JSON.parse(message.toString());
      
      if (parsedMessage.type === 'join') {
        const roomId = parsedMessage.payload.roomId;
        allSockets.push({ socket, room: roomId, userId });
      }

      if (parsedMessage.type === 'chat') {
        const roomId = allSockets.find(user => user.socket === socket)?.room;
        allSockets.forEach(user => {
          if (user.room === roomId) {
            user.socket.send(JSON.stringify({
              type: "chat",
              payload: {
                message: parsedMessage.payload.message,
                senderId: parsedMessage.payload.senderId
              }
            }));
          }
        });
      }
    } catch (error) {
      console.error('Invalid message:', error);
    }
  });
});
