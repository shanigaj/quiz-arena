const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Room = sequelize.define('Room', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  room_code: {
    type: DataTypes.STRING(8),
    allowNull: false,
    unique: true,
  },
  quiz_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'quizzes',
      key: 'id',
    },
  },
  host_socket_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('waiting', 'in_progress', 'completed'),
    allowNull: false,
    defaultValue: 'waiting',
  },
  current_question_index: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: -1,
    comment: '-1 means quiz has not started',
  },
}, {
  tableName: 'rooms',
  timestamps: true,
  underscored: true,
});

module.exports = Room;
