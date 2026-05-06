const express = require('express');
const { Quiz, Question, Room, Participant } = require('../models');
const router = express.Router();

// ── GET /api/quizzes ─────────────────────────────────
// List all available quizzes
router.get('/quizzes', async (req, res) => {
  try {
    const quizzes = await Quiz.findAll({
      include: [{
        model: Question,
        as: 'questions',
        attributes: ['id'],
      }],
      order: [['created_at', 'DESC']],
    });

    const result = quizzes.map((q) => ({
      id: q.id,
      title: q.title,
      description: q.description,
      questionCount: q.questions.length,
      createdAt: q.created_at,
    }));

    res.json({ success: true, quizzes: result });
  } catch (err) {
    console.error('Error fetching quizzes:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch quizzes' });
  }
});

// ── GET /api/quizzes/:id ─────────────────────────────
// Get quiz details with questions
router.get('/quizzes/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id, {
      include: [{
        model: Question,
        as: 'questions',
        attributes: ['id', 'question_text', 'options', 'order_num', 'time_limit'],
        order: [['order_num', 'ASC']],
      }],
    });

    if (!quiz) {
      return res.status(404).json({ success: false, error: 'Quiz not found' });
    }

    res.json({ success: true, quiz });
  } catch (err) {
    console.error('Error fetching quiz:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch quiz' });
  }
});

// ── GET /api/rooms/:code ─────────────────────────────
router.get('/rooms/:code', async (req, res) => {
  try {
    const room = await Room.findOne({
      where: { room_code: req.params.code.toUpperCase() },
      include: [
        { model: Quiz, as: 'quiz', attributes: ['id', 'title'] },
        {
          model: Participant,
          as: 'participants',
          attributes: ['id', 'username', 'score', 'is_host', 'is_connected'],
          order: [['score', 'DESC']],
        },
      ],
    });

    if (!room) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }

    res.json({
      success: true,
      room: {
        id: room.id,
        roomCode: room.room_code,
        status: room.status,
        quizTitle: room.quiz?.title,
        participants: room.participants,
      },
    });
  } catch (err) {
    console.error('Error fetching room:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch room' });
  }
});

module.exports = router;
