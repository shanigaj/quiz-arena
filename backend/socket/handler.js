const { Quiz, Question, Room, Participant, Answer } = require('../models');

// In-memory timer tracking per room
const roomTimers = new Map();

/**
 * Generate a short, human-friendly room code
 */
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Get the current leaderboard for a room
 */
async function getLeaderboard(roomId) {
  const participants = await Participant.findAll({
    where: { room_id: roomId },
    order: [['score', 'DESC']],
    attributes: ['id', 'username', 'score', 'is_host', 'is_connected'],
  });
  return participants.map((p, index) => ({
    rank: index + 1,
    id: p.id,
    username: p.username,
    score: p.score,
    isHost: p.is_host,
    isConnected: p.is_connected,
  }));
}

/**
 * Send the next question or end the quiz
 */
async function sendNextQuestion(io, roomId) {
  const room = await Room.findByPk(roomId, {
    include: [{ model: Quiz, as: 'quiz', include: [{ model: Question, as: 'questions' }] }],
  });

  if (!room || !room.quiz) return;

  const questions = room.quiz.questions.sort((a, b) => a.order_num - b.order_num);
  const nextIndex = room.current_question_index + 1;

  if (nextIndex >= questions.length) {
    // Quiz is over
    room.status = 'completed';
    room.current_question_index = nextIndex;
    await room.save();

    const leaderboard = await getLeaderboard(roomId);
    io.to(room.room_code).emit('quiz:end', { leaderboard });
    return;
  }

  // Move to next question
  room.current_question_index = nextIndex;
  room.status = 'in_progress';
  await room.save();

  const question = questions[nextIndex];
  const questionData = {
    questionId: question.id,
    questionNumber: nextIndex + 1,
    totalQuestions: questions.length,
    questionText: question.question_text,
    options: question.options,
    timeLimit: question.time_limit,
  };

  io.to(room.room_code).emit('quiz:question', questionData);

  // Start synchronized countdown
  let timeLeft = question.time_limit;
  const questionStartTime = Date.now();

  // Clear any existing timer
  if (roomTimers.has(roomId)) {
    clearInterval(roomTimers.get(roomId));
  }

  const timerInterval = setInterval(async () => {
    timeLeft--;
    io.to(room.room_code).emit('quiz:timer', { timeLeft, totalTime: question.time_limit });

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      roomTimers.delete(roomId);

      // Reveal correct answer
      io.to(room.room_code).emit('quiz:answer-reveal', {
        questionId: question.id,
        correctOption: question.correct_option,
      });

      // Send updated leaderboard
      const leaderboard = await getLeaderboard(roomId);
      io.to(room.room_code).emit('quiz:leaderboard', { leaderboard });

      // Wait 3 seconds then send next question
      setTimeout(() => {
        sendNextQuestion(io, roomId);
      }, 3000);
    }
  }, 1000);

  roomTimers.set(roomId, timerInterval);
}

/**
 * Initialize all Socket.IO event handlers
 */
function initializeSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // ── CREATE ROOM ──────────────────────────────────
    socket.on('room:create', async ({ username, quizId }, callback) => {
      try {
        const quiz = await Quiz.findByPk(quizId);
        if (!quiz) {
          return callback({ success: false, error: 'Quiz not found' });
        }

        const roomCode = generateRoomCode();
        const room = await Room.create({
          room_code: roomCode,
          quiz_id: quizId,
          host_socket_id: socket.id,
          status: 'waiting',
        });

        const participant = await Participant.create({
          room_id: room.id,
          username,
          socket_id: socket.id,
          is_host: true,
        });

        socket.join(roomCode);
        socket.roomCode = roomCode;
        socket.participantId = participant.id;
        socket.roomId = room.id;

        const users = await getLeaderboard(room.id);
        callback({
          success: true,
          roomCode,
          roomId: room.id,
          participantId: participant.id,
          quizTitle: quiz.title,
          users,
        });

        console.log(`🏠 Room ${roomCode} created by ${username}`);
      } catch (err) {
        console.error('Error creating room:', err);
        callback({ success: false, error: 'Failed to create room' });
      }
    });

    // ── JOIN ROOM ────────────────────────────────────
    socket.on('room:join', async ({ username, roomCode }, callback) => {
      try {
        const room = await Room.findOne({ where: { room_code: roomCode.toUpperCase() } });
        if (!room) {
          return callback({ success: false, error: 'Room not found' });
        }
        if (room.status !== 'waiting') {
          return callback({ success: false, error: 'Quiz has already started' });
        }

        // Check for duplicate username in this room
        const existing = await Participant.findOne({
          where: { room_id: room.id, username, is_connected: true },
        });
        if (existing) {
          return callback({ success: false, error: 'Username already taken in this room' });
        }

        const quiz = await Quiz.findByPk(room.quiz_id);

        const participant = await Participant.create({
          room_id: room.id,
          username,
          socket_id: socket.id,
          is_host: false,
        });

        socket.join(roomCode);
        socket.roomCode = roomCode;
        socket.participantId = participant.id;
        socket.roomId = room.id;

        const users = await getLeaderboard(room.id);

        // Notify everyone in the room
        io.to(roomCode).emit('room:user-joined', {
          username,
          participantId: participant.id,
          users,
        });

        callback({
          success: true,
          roomCode: room.room_code,
          roomId: room.id,
          participantId: participant.id,
          quizTitle: quiz ? quiz.title : 'Quiz',
          users,
        });

        console.log(`👤 ${username} joined room ${roomCode}`);
      } catch (err) {
        console.error('Error joining room:', err);
        callback({ success: false, error: 'Failed to join room' });
      }
    });

    // ── START QUIZ ───────────────────────────────────
    socket.on('quiz:start', async ({ roomId }, callback) => {
      try {
        const room = await Room.findByPk(roomId);
        if (!room) {
          return callback({ success: false, error: 'Room not found' });
        }
        
        // Find if this participant is the host
        const participant = await Participant.findOne({ 
          where: { id: socket.participantId, room_id: roomId } 
        });
        
        if (!participant || !participant.is_host) {
          return callback({ success: false, error: 'Only the host can start the quiz' });
        }
        
        if (room.status !== 'waiting') {
          return callback({ success: false, error: 'Quiz has already started' });
        }

        io.to(room.room_code).emit('quiz:starting', { countdown: 3 });

        // 3-second countdown before first question
        setTimeout(() => {
          sendNextQuestion(io, roomId);
        }, 3000);

        callback({ success: true });
        console.log(`🚀 Quiz started in room ${room.room_code}`);
      } catch (err) {
        console.error('Error starting quiz:', err);
        callback({ success: false, error: 'Failed to start quiz' });
      }
    });

    // ── SUBMIT ANSWER ────────────────────────────────
    socket.on('quiz:answer', async ({ questionId, selectedOption, timeTakenMs }, callback) => {
      try {
        const participantId = socket.participantId;
        if (!participantId) {
          return callback({ success: false, error: 'Not in a room' });
        }

        // Check if already answered this question
        const existingAnswer = await Answer.findOne({
          where: { participant_id: participantId, question_id: questionId },
        });
        if (existingAnswer) {
          return callback({ success: false, error: 'Already answered this question' });
        }

        const question = await Question.findByPk(questionId);
        if (!question) {
          return callback({ success: false, error: 'Question not found' });
        }

        const participant = await Participant.findByPk(participantId);
        const room = await Room.findByPk(participant.room_id);

        const isCorrect = selectedOption === question.correct_option;

        // Score = base points + speed bonus
        let points = 0;
        if (isCorrect) {
          const timeLimit = question.time_limit * 1000; // convert to ms
          const speedBonus = Math.max(0, Math.floor(((timeLimit - timeTakenMs) / timeLimit) * 500));
          points = 500 + speedBonus; // 500 base + up to 500 speed bonus
        }

        await Answer.create({
          participant_id: participantId,
          question_id: questionId,
          selected_option: selectedOption,
          is_correct: isCorrect,
          time_taken_ms: timeTakenMs,
        });

        if (isCorrect) {
          await Participant.increment('score', { by: points, where: { id: participantId } });
        }

        callback({
          success: true,
          isCorrect,
          points,
          correctOption: question.correct_option,
        });

        // Check if everyone has answered
        const activeParticipants = await Participant.count({
          where: { room_id: room.id, is_connected: true }
        });
        
        const answersCount = await Answer.count({
          where: { question_id: questionId },
          include: [{
            model: Participant,
            as: 'participant',
            where: { room_id: room.id, is_connected: true }
          }]
        });

        // If everyone answered, end the question early
        if (answersCount >= activeParticipants) {
          // Clear the timer
          if (roomTimers.has(room.id)) {
            clearInterval(roomTimers.get(room.id));
            roomTimers.delete(room.id);
          }
          
          // Send 0 timer to clients to force UI update
          io.to(room.room_code).emit('quiz:timer', { timeLeft: 0, totalTime: question.time_limit });

          // Reveal correct answer to everyone
          io.to(room.room_code).emit('quiz:answer-reveal', {
            questionId: question.id,
            correctOption: question.correct_option,
          });

          // Send updated leaderboard
          const leaderboard = await getLeaderboard(room.id);
          io.to(room.room_code).emit('quiz:leaderboard', { leaderboard });

          // Wait 3 seconds then send next question
          setTimeout(() => {
            sendNextQuestion(io, room.id);
          }, 3000);
        }
      } catch (err) {
        console.error('Error submitting answer:', err);
        callback({ success: false, error: 'Failed to submit answer' });
      }
    });

    // ── DISCONNECT ───────────────────────────────────
    socket.on('disconnect', async () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
      try {
        if (socket.participantId) {
          const participant = await Participant.findByPk(socket.participantId);
          if (participant) {
            participant.is_connected = false;
            participant.socket_id = null;
            await participant.save();

            if (socket.roomCode && socket.roomId) {
              const users = await getLeaderboard(socket.roomId);
              io.to(socket.roomCode).emit('room:user-left', {
                username: participant.username,
                participantId: participant.id,
                users,
              });
            }
          }
        }
      } catch (err) {
        console.error('Error handling disconnect:', err);
      }
    });
  });
}

module.exports = { initializeSocketHandlers };
