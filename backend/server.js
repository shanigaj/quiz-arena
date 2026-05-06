require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { sequelize } = require('./models');
const apiRoutes = require('./routes/api');
const { initializeSocketHandlers } = require('./socket/handler');

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());

// ── REST API Routes ──────────────────────────────────
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// ── Socket.IO ────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

initializeSocketHandlers(io);

// ── Database Sync & Start ────────────────────────────
async function seedDatabase() {
  const quizzes = await Quiz.count();
  if (quizzes === 0) {
    console.log('🌱 Database is empty. Starting auto-seed...');
    // We can't easily require seed.js because it calls process.exit()
    // So we'll define a simple version here or refactor
    const sampleQuizzes = [
      {
        title: 'JavaScript Fundamentals',
        description: 'Test core JS concepts.',
        questions: [
          { question_text: 'typeof null?', options: ['"null"', '"undefined"', '"object"', '"boolean"'], correct_option: 2, order_num: 1, time_limit: 10 },
          { question_text: 'JSON string to object?', options: ['JSON.stringify()', 'JSON.parse()', 'JSON.convert()', 'JSON.toObject()'], correct_option: 1, order_num: 2, time_limit: 10 }
        ]
      },
      {
        title: 'General Knowledge',
        description: 'Basic fun facts.',
        questions: [
          { question_text: 'Gold symbol?', options: ['Go', 'Gd', 'Au', 'Ag'], correct_option: 2, order_num: 1, time_limit: 10 },
          { question_text: 'Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], correct_option: 1, order_num: 2, time_limit: 10 }
        ]
      }
    ];

    for (const quizData of sampleQuizzes) {
      const quiz = await Quiz.create({ title: quizData.title, description: quizData.description });
      for (const q of quizData.questions) {
        await Question.create({ quiz_id: quiz.id, ...q });
      }
    }
    console.log('✅ Auto-seeding complete!');
  }
}

async function start() {
  try {
    await sequelize.authenticate();
    console.log('🗄️  PostgreSQL connected');

    await sequelize.sync({ alter: true });
    console.log('📦 Models synced');

    // Run auto-seed if needed
    await seedDatabase();

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📡 Socket.IO ready`);
      console.log(`🌐 Accepting connections from ${CLIENT_URL}\n`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

const { Quiz, Question } = require('./models');
start();
