const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());

// Optional: Health check route (avoids "Cannot GET /")
app.get('/', (req, res) => {
  res.send('✅ Socket.IO server is running');
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  socket.on('chat message', (msg) => {
    const messageWithTime = {
      ...msg,
      createdAt: new Date().toISOString(),
    };
    io.emit('chat message', messageWithTime);
  });

  socket.on('typing', ({ to, from, name }) => {
    socket.to(to).emit('typing', { from, name });
  });

  socket.on('stopTyping', ({ to, from }) => {
    socket.to(to).emit('stopTyping', { from });
  });

  socket.on('disconnect', () => {
    console.log('🛑 User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 4500;
server.listen(PORT, () => {
  console.log(`✅ Socket.IO server running at http://localhost:${PORT}`);
});
