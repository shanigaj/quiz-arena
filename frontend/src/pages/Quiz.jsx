import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

const LABELS = ['A', 'B', 'C', 'D'];
const CIRCUMFERENCE = 2 * Math.PI * 24;

export default function Quiz() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [question, setQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [totalTime, setTotalTime] = useState(10);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerResult, setAnswerResult] = useState(null);
  const [correctOption, setCorrectOption] = useState(null);
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const questionStartRef = useRef(Date.now());
  const userData = JSON.parse(sessionStorage.getItem('quiz_user') || '{}');

  useEffect(() => {
    if (!socket) return;

    socket.on('quiz:question', (data) => {
      setQuestion(data);
      setTimeLeft(data.timeLimit);
      setTotalTime(data.timeLimit);
      setSelectedOption(null);
      setAnswerResult(null);
      setCorrectOption(null);
      setShowLeaderboard(false);
      questionStartRef.current = Date.now();
    });

    socket.on('quiz:timer', (data) => {
      setTimeLeft(data.timeLeft);
    });

    socket.on('quiz:answer-reveal', (data) => {
      setCorrectOption(data.correctOption);
    });

    socket.on('quiz:leaderboard', (data) => {
      setLeaderboard(data.leaderboard);
      setShowLeaderboard(true);
      const me = data.leaderboard.find(u => u.id === userData.participantId);
      if (me) setScore(me.score);
    });

    socket.on('quiz:end', (data) => {
      sessionStorage.setItem('quiz_results', JSON.stringify(data.leaderboard));
      navigate(`/results/${roomCode}`);
    });

    return () => {
      socket.off('quiz:question');
      socket.off('quiz:timer');
      socket.off('quiz:answer-reveal');
      socket.off('quiz:leaderboard');
      socket.off('quiz:end');
    };
  }, [socket, roomCode, navigate, userData.participantId]);

  const submitAnswer = (optionIndex) => {
    if (selectedOption !== null || !socket || !question) return;
    const timeTaken = Date.now() - questionStartRef.current;
    setSelectedOption(optionIndex);

    socket.emit('quiz:answer', {
      questionId: question.questionId,
      selectedOption: optionIndex,
      timeTakenMs: timeTaken,
    }, (res) => {
      if (res.success) {
        setAnswerResult({ isCorrect: res.isCorrect, points: res.points });
        setCorrectOption(res.correctOption); // Instantly reveal the right answer locally
      }
    });
  };

  const getOptionClass = (index) => {
    let cls = 'option-btn';
    if (correctOption !== null) {
      if (index === correctOption) cls += ' correct';
      else if (index === selectedOption && index !== correctOption) cls += ' wrong';
    } else if (index === selectedOption) {
      cls += ' selected';
    }
    return cls;
  };

  const timerClass = timeLeft <= 3 ? 'danger' : timeLeft <= 5 ? 'warning' : '';
  const dashOffset = CIRCUMFERENCE - (timeLeft / totalTime) * CIRCUMFERENCE;

  if (!question) {
    return (
      <div className="quiz-page" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="animate-scale" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p style={{ color: 'var(--text-secondary)' }}>Waiting for the next question...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-page">
      <div className="quiz-topbar">
        <div className="quiz-progress">
          <span className="progress-text">Q{question.questionNumber}/{question.totalQuestions}</span>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(question.questionNumber / question.totalQuestions) * 100}%` }} />
          </div>
        </div>

        <div className="timer-display">
          <div className="timer-circle">
            <svg width="56" height="56" viewBox="0 0 56 56">
              <circle className="timer-bg" cx="28" cy="28" r="24" />
              <circle className={`timer-progress ${timerClass}`} cx="28" cy="28" r="24"
                strokeDasharray={CIRCUMFERENCE} strokeDashoffset={dashOffset} />
            </svg>
            <div className={`timer-number ${timerClass}`}>{timeLeft}</div>
          </div>
        </div>

        <div className="quiz-score">🏆 {score}</div>
      </div>

      <div className="quiz-main">
        <div className="question-container">
          <h2 className="question-text">{question.questionText}</h2>
          <div className="options-grid">
            {question.options.map((opt, i) => (
              <button key={i} className={getOptionClass(i)}
                onClick={() => submitAnswer(i)}
                disabled={selectedOption !== null}
                id={`option-${i}`}>
                <span className="option-label">{LABELS[i]}</span>
                <span>{opt}</span>
              </button>
            ))}
          </div>

          {answerResult && (
            <div className={`answer-feedback ${answerResult.isCorrect ? 'correct' : 'wrong'}`}>
              {answerResult.isCorrect
                ? <><div className="points">+{answerResult.points}</div><div>Correct! 🎉</div></>
                : <><div className="points">+0</div><div>Wrong answer 😔</div></>
              }
            </div>
          )}

          {showLeaderboard && (
            <div className="glass-card animate-in" style={{ marginTop: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.75rem', fontSize: '1rem' }}>📊 Live Standings</h3>
              {leaderboard.slice(0, 5).map((u) => (
                <div key={u.id} className="leaderboard-row" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className={`leaderboard-rank ${u.rank === 1 ? 'gold' : u.rank === 2 ? 'silver' : u.rank === 3 ? 'bronze' : ''}`}>
                    {u.rank}
                  </span>
                  <span className="leaderboard-name" style={{ fontWeight: u.id === userData.participantId ? 700 : 500 }}>
                    {u.username} {u.id === userData.participantId ? '(You)' : ''}
                  </span>
                  <span className="leaderboard-score">{u.score}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
