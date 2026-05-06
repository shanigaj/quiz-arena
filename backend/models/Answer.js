const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Answer = sequelize.define('Answer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  participant_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'participants',
      key: 'id',
    },
  },
  question_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'questions',
      key: 'id',
    },
  },
  selected_option: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'null means the user did not answer in time',
  },
  is_correct: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  time_taken_ms: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'How long the user took to answer in milliseconds',
  },
}, {
  tableName: 'answers',
  timestamps: true,
  underscored: true,
});

module.exports = Answer;
