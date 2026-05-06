const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  quiz_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'quizzes',
      key: 'id',
    },
  },
  question_text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  options: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: 'Array of option strings, e.g. ["Option A", "Option B", "Option C", "Option D"]',
  },
  correct_option: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Zero-based index of the correct option',
  },
  order_num: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  time_limit: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10,
    comment: 'Time limit in seconds',
  },
}, {
  tableName: 'questions',
  timestamps: true,
  underscored: true,
});

module.exports = Question;
