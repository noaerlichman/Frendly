import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: Server;

export const initializeSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId as string;
    
    if (userId) {
      // Join a room with the user's ID
      socket.join(userId);
    }

    // Handle sending messages
    socket.on('sendMessage', (message) => {
      // Emit the message to the receiver's room
      io.to(message.receiverId).emit('newMessage', message);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', userId);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
}; 