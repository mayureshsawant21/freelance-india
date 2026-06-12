const jwt = require('jsonwebtoken');
const { Message, Connection } = require('../models');

module.exports = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(socket.userId);
    console.log(`User ${socket.userId} connected`);

    socket.on('join_chat', async (connectionId) => {
      const connection = await Connection.findByPk(connectionId);
      if (!connection || (connection.freelancer_id !== socket.userId && connection.employer_id !== socket.userId)) {
        socket.emit('error', 'Unauthorized');
        return;
      }
      socket.join(`chat_${connectionId}`);
      const messages = await Message.findAll({
        where: { connection_id: connectionId },
        order: [['createdAt', 'ASC']],
        limit: 50
      });
      socket.emit('chat_history', messages);
    });

    socket.on('send_message', async (data) => {
      const { connectionId, content, messageType = 'text', fileUrl = null } = data;
      const connection = await Connection.findByPk(connectionId);
      if (!connection || (connection.freelancer_id !== socket.userId && connection.employer_id !== socket.userId)) return;

      const msg = await Message.create({
        connection_id: connectionId,
        sender_id: socket.userId,
        message_type: messageType,
        content,
        file_url: fileUrl
      });

      io.to(`chat_${connectionId}`).emit('new_message', msg);
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });
};