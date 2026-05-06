import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

const AVATAR_COLORS = [
  '#7c5cfc', '#60a5fa', '#f472b6', '#34d399',
  '#fbbf24', '#a78bfa', '#fb923c', '#22d3ee',
];

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function Home() {
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const [modal, setModal] = useState(null); // 'create' | 'join'
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    fetch(`${apiUrl}/api/quizzes`)
      .then(r => r.json())
      .then(data => { if (data.success) setQuizzes(data.quizzes); })
      .catch(() => {});
  }, []);

  const handleCreate = () => {
    if (!username.trim()) return setError('Please enter your name');
    if (!selectedQuiz) return setError('Please select a quiz');
    if (!socket) return setError('Not connected to server');
    setLoading(true);
    setError('');

    socket.emit('room:create', { username: username.trim(), quizId: selectedQuiz }, (res) => {
      setLoading(false);
      if (res.success) {
        sessionStorage.setItem('quiz_user', JSON.stringify({
          username: username.trim(), participantId: res.participantId,
          roomId: res.roomId, isHost: true, quizTitle: res.quizTitle,
        }));
        navigate(`/lobby/${res.roomCode}`);
      } else {
        setError(res.error || 'Failed to create room');
      }
    });
  };

  const handleJoin = () => {
    if (!username.trim()) return setError('Please enter your name');
    if (!roomCode.trim()) return setError('Please enter a room code');
    if (!socket) return setError('Not connected to server');
    setLoading(true);
    setError('');

    socket.emit('room:join', { username: username.trim(), roomCode: roomCode.trim().toUpperCase() }, (res) => {
      setLoading(false);
      if (res.success) {
        sessionStorage.setItem('quiz_user', JSON.stringify({
          username: username.trim(), participantId: res.participantId,
          roomId: res.roomId, isHost: false, quizTitle: res.quizTitle,
        }));
        navigate(`/lobby/${res.roomCode}`);
      } else {
        setError(res.error || 'Failed to join room');
      }
    });
  };

  return (
    <div className="home-page container">
      <div className="animate-in">
        <h1 className="home-logo">⚡ QuizArena</h1>
        <p className="home-subtitle">
          Create a room, invite your friends, and battle it out in real-time quizzes with synchronized timers and leaderboards.
        </p>
      </div>

      <div className="home-cards animate-in" style={{ animationDelay: '0.15s' }}>
        <div className="glass-card home-card" id="create-room-btn" onClick={() => { setModal('create'); setError(''); }}>
          <div className="home-card-icon">🏟️</div>
          <h2>Create Room</h2>
          <p>Host a quiz and invite players to compete</p>
        </div>
        <div className="glass-card home-card" id="join-room-btn" onClick={() => { setModal('join'); setError(''); }}>
          <div className="home-card-icon">🚀</div>
          <h2>Join Room</h2>
          <p>Enter a room code to join a live quiz</p>
        </div>
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center', animationDelay: '0.3s' }} className="animate-in">
        <span className="badge badge-accent">
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: isConnected ? 'var(--success)' : 'var(--danger)', display: 'inline-block' }} />
          {isConnected ? 'Connected' : 'Connecting...'}
        </span>
      </div>

      {/* CREATE MODAL */}
      {modal === 'create' && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="modal">
            <h2>🏟️ Create a Room</h2>
            <p>Choose a quiz and set your display name</p>
            <div className="form-group">
              <label htmlFor="create-username">Your Name</label>
              <input id="create-username" className="input-field" placeholder="Enter your name..." value={username} onChange={e => setUsername(e.target.value)} autoFocus />
            </div>
            <label>Select Quiz</label>
            <div className="quiz-select">
              {quizzes.map(q => (
                <div key={q.id} className={`quiz-option ${selectedQuiz === q.id ? 'selected' : ''}`} onClick={() => setSelectedQuiz(q.id)}>
                  <h4>{q.title}</h4>
                  <span>{q.questionCount} questions</span>
                </div>
              ))}
              {quizzes.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No quizzes available. Run the seed script first.</p>}
            </div>
            {error && <div className="error-msg">{error}</div>}
            <div className="btn-row">
              <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" id="confirm-create" onClick={handleCreate} disabled={loading}>{loading ? 'Creating...' : 'Create Room'}</button>
            </div>
          </div>
        </div>
      )}

      {/* JOIN MODAL */}
      {modal === 'join' && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="modal">
            <h2>🚀 Join a Room</h2>
            <p>Enter the room code shared by the host</p>
            <div className="form-group">
              <label htmlFor="join-username">Your Name</label>
              <input id="join-username" className="input-field" placeholder="Enter your name..." value={username} onChange={e => setUsername(e.target.value)} autoFocus />
            </div>
            <div className="form-group">
              <label htmlFor="room-code-input">Room Code</label>
              <input id="room-code-input" className="input-field" placeholder="e.g. ABC123" value={roomCode} onChange={e => setRoomCode(e.target.value.toUpperCase())} style={{ letterSpacing: '3px', fontWeight: 600, textAlign: 'center', fontSize: '1.2rem' }} maxLength={6} />
            </div>
            {error && <div className="error-msg">{error}</div>}
            <div className="btn-row">
              <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" id="confirm-join" onClick={handleJoin} disabled={loading}>{loading ? 'Joining...' : 'Join Room'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
