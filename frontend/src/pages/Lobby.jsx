import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

const AVATAR_COLORS = ['#7c5cfc','#60a5fa','#f472b6','#34d399','#fbbf24','#a78bfa','#fb923c','#22d3ee'];
function getColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

export default function Lobby() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [users, setUsers] = useState([]);
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const userData = JSON.parse(sessionStorage.getItem('quiz_user') || '{}');

  useEffect(() => {
    if (!socket || !userData.participantId) return;

    socket.on('room:user-joined', (data) => setUsers(data.users));
    socket.on('room:user-left', (data) => setUsers(data.users));
    socket.on('quiz:starting', (data) => {
      setStarting(true);
      setCountdown(data.countdown);
    });
    socket.on('quiz:question', (data) => {
      navigate(`/quiz/${roomCode}`, { state: { initialQuestion: data } });
    });

    // Fetch initial users
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    fetch(`${apiUrl}/api/rooms/${roomCode}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setUsers(data.room.participants.map((p, i) => ({
            rank: i + 1, id: p.id, username: p.username,
            score: p.score, isHost: p.is_host, isConnected: p.is_connected,
          })));
        }
      })
      .catch(() => {});

    return () => {
      socket.off('room:user-joined');
      socket.off('room:user-left');
      socket.off('quiz:starting');
      socket.off('quiz:question');
    };
  }, [socket, roomCode, navigate, userData.participantId]);

  useEffect(() => {
    if (!starting || countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [starting, countdown]);

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startQuiz = () => {
    if (!socket) return;
    socket.emit('quiz:start', { roomId: userData.roomId }, (res) => {
      if (!res.success) alert(res.error);
    });
  };

  return (
    <div className="lobby-page container">
      {starting && (
        <div className="starting-overlay">
          <div className="starting-text">Quiz starting in</div>
          <div className="starting-number">{countdown > 0 ? countdown : '🚀'}</div>
        </div>
      )}

      <div className="lobby-header">
        <h1>Waiting Room</h1>
        <div className="lobby-quiz-title">{userData.quizTitle || 'Quiz'}</div>
        <div className="room-code-display" onClick={copyCode} title="Click to copy">
          {roomCode}
          <span className="copy-hint">{copied ? '✅ Copied!' : '📋 Click to copy'}</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Share this code with your friends to invite them
        </p>
      </div>

      <div className="lobby-content">
        <div className="glass-card users-panel">
          <h3>
            👥 Players <span className="user-count">({users.filter(u => u.isConnected !== false).length})</span>
          </h3>
          <div className="user-list">
            {users.map((user, i) => (
              <div key={user.id} className={`user-item ${user.isConnected === false ? 'disconnected' : ''}`} style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="user-avatar" style={{ background: getColor(user.username) }}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="user-name">{user.username}</span>
                {user.isHost && <span className="host-badge">👑 Host</span>}
                {user.isConnected === false && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Disconnected</span>}
              </div>
            ))}
            {users.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '1rem 0' }}>
                Waiting for players to join...
              </p>
            )}
          </div>
        </div>

        <div className="glass-card chat-panel">
          <h3>📋 Room Info</h3>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.8 }}>
            <p>🎯 <strong>Quiz:</strong> {userData.quizTitle}</p>
            <p>🆔 <strong>Room Code:</strong> {roomCode}</p>
            <p>👤 <strong>Your Name:</strong> {userData.username}</p>
            <p>🏠 <strong>Role:</strong> {userData.isHost ? 'Host' : 'Player'}</p>
            <p>⏱️ <strong>Timer:</strong> 10 seconds per question</p>
            <p>🏆 <strong>Scoring:</strong> 500 base + speed bonus</p>
          </div>
          {userData.isHost && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--accent-glow)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--accent-light)' }}>
              💡 As the host, you can start the quiz when all players have joined.
            </div>
          )}
        </div>
      </div>

      <div className="lobby-actions">
        {userData.isHost ? (
          <button className="btn btn-success" id="start-quiz-btn" onClick={startQuiz} disabled={users.length < 1} style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
            🚀 Start Quiz ({users.filter(u => u.isConnected !== false).length} player{users.filter(u => u.isConnected !== false).length !== 1 ? 's' : ''})
          </button>
        ) : (
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            <span style={{ animation: 'pulse 2s infinite' }}>⏳</span> Waiting for the host to start the quiz...
          </div>
        )}
      </div>
    </div>
  );
}
