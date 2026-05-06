import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Results() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const userData = JSON.parse(sessionStorage.getItem('quiz_user') || '{}');

  useEffect(() => {
    const stored = sessionStorage.getItem('quiz_results');
    if (stored) {
      setLeaderboard(JSON.parse(stored));
    } else {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      fetch(`${apiUrl}/api/rooms/${roomCode}`)
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            setLeaderboard(data.room.participants.sort((a, b) => b.score - a.score).map((p, i) => ({
              rank: i + 1, id: p.id, username: p.username, score: p.score,
            })));
          }
        })
        .catch(() => {});
    }
  }, [roomCode]);

  const podium = leaderboard.slice(0, 3);
  const myResult = leaderboard.find(u => u.id === userData.participantId);

  return (
    <div className="results-page container">
      <div className="results-header">
        <span className="trophy-icon">🏆</span>
        <h1>Quiz Complete!</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          {userData.quizTitle} — Room {roomCode}
        </p>
        {myResult && (
          <div style={{ marginTop: '1rem' }}>
            <span className="badge badge-accent" style={{ fontSize: '1rem', padding: '0.5rem 1.25rem' }}>
              Your Score: {myResult.score} pts — Rank #{myResult.rank}
            </span>
          </div>
        )}
      </div>

      {podium.length > 0 && (
        <div className="podium">
          {podium.map((user, i) => (
            <div key={user.id} className={`podium-place podium-${i + 1}`}>
              <div className="podium-medal">{MEDALS[i]}</div>
              <div className="podium-name">{user.username}</div>
              <div className="podium-score">{user.score} pts</div>
            </div>
          ))}
        </div>
      )}

      <div className="full-leaderboard glass-card">
        <h3>📊 Full Leaderboard</h3>
        {leaderboard.map((user) => (
          <div key={user.id} className="leaderboard-row" style={{ background: user.id === userData.participantId ? 'var(--accent-glow)' : 'transparent' }}>
            <span className={`leaderboard-rank ${user.rank === 1 ? 'gold' : user.rank === 2 ? 'silver' : user.rank === 3 ? 'bronze' : ''}`}>
              {user.rank <= 3 ? MEDALS[user.rank - 1] : user.rank}
            </span>
            <span className="leaderboard-name">
              {user.username} {user.id === userData.participantId ? '(You)' : ''}
            </span>
            <span className="leaderboard-score">{user.score}</span>
          </div>
        ))}
      </div>

      <div className="results-actions">
        <button className="btn btn-primary" onClick={() => { sessionStorage.clear(); navigate('/'); }} id="play-again-btn" style={{ padding: '1rem 3rem' }}>
          🎮 Play Again
        </button>
      </div>
    </div>
  );
}
