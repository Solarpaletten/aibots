class RealtimeTranslationService {
  constructor(io) {
    this.io = io;
    this.activeRooms = new Map();
    this.init();
  }

  init() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('join-translation-room', (data) => {
        this.handleJoinRoom(socket, data);
      });

      socket.on('voice-chunk', (data) => {
        this.handleVoiceChunk(socket, data);
      });

      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  handleJoinRoom(socket, { roomId, language, userId }) {
    socket.join(roomId);
    socket.userId = userId;
    socket.language = language;
    socket.roomId = roomId;

    if (!this.activeRooms.has(roomId)) {
      this.activeRooms.set(roomId, new Set());
    }
    this.activeRooms.get(roomId).add(socket.id);

    socket.emit('joined-room', { 
      roomId, 
      participants: this.activeRooms.get(roomId).size 
    });
  }

  handleVoiceChunk(socket, { audioData, fromLanguage, toLanguage }) {
    // Заглушка для обработки голосового chunk'а
    socket.to(socket.roomId).emit('translated-chunk', {
      translatedAudio: audioData,
      originalText: 'Sample text',
      translatedText: 'Пример текста',
      fromLanguage,
      toLanguage
    });
  }

  handleDisconnect(socket) {
    if (socket.roomId && this.activeRooms.has(socket.roomId)) {
      this.activeRooms.get(socket.roomId).delete(socket.id);
      if (this.activeRooms.get(socket.roomId).size === 0) {
        this.activeRooms.delete(socket.roomId);
      }
    }
  }
}

module.exports = { RealtimeTranslationService };
