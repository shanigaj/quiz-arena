const sequelize = require('../config/database');
const Quiz = require('./Quiz');
const Question = require('./Question');
const Room = require('./Room');
const Participant = require('./Participant');
const Answer = require('./Answer');

// ── Associations ──────────────────────────────────────

// Quiz → Questions (one-to-many)
Quiz.hasMany(Question, { foreignKey: 'quiz_id', as: 'questions' });
Question.belongsTo(Quiz, { foreignKey: 'quiz_id', as: 'quiz' });

// Quiz → Rooms (one-to-many)
Quiz.hasMany(Room, { foreignKey: 'quiz_id', as: 'rooms' });
Room.belongsTo(Quiz, { foreignKey: 'quiz_id', as: 'quiz' });

// Room → Participants (one-to-many)
Room.hasMany(Participant, { foreignKey: 'room_id', as: 'participants' });
Participant.belongsTo(Room, { foreignKey: 'room_id', as: 'room' });

// Participant → Answers (one-to-many)
Participant.hasMany(Answer, { foreignKey: 'participant_id', as: 'answers' });
Answer.belongsTo(Participant, { foreignKey: 'participant_id', as: 'participant' });

// Question → Answers (one-to-many)
Question.hasMany(Answer, { foreignKey: 'question_id', as: 'answers' });
Answer.belongsTo(Question, { foreignKey: 'question_id', as: 'question' });

module.exports = {
  sequelize,
  Quiz,
  Question,
  Room,
  Participant,
  Answer,
};
