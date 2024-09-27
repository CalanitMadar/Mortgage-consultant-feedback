import React, { useState } from 'react';
import axios from 'axios';
import ReactStars from 'react-rating-stars-component';

function App() {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [message, setMessage] = useState('');

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0 || feedback.trim() === '') {
      setMessage('אנא מלאי את כל השדות.');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/feedback', {
        rating,
        feedback,
      });
      setMessage('תודה על חוות הדעת!');
      setRating(0);
      setFeedback('');
    } catch (error) {
      console.error('Error inserting feedback:', error);
      setMessage('שגיאה בשליחת חוות הדעת.');
    }
  };

  return (
    <div
      style={{
        maxWidth: '700px',
        margin: '0 auto',
        padding: '30px',
        direction: 'rtl',
        border: '1px solid #ddd',
        boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>
        חוות דעת על יועץ המשכנתאות עמיחי מדר
      </h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '16px' }}>
            איך היית מדרגת את חוויית הליווי שלך?
          </label>

          <ReactStars
            count={5}
            onChange={handleRatingChange}
            size={50}
            activeColor="#ffd700"
            value={rating || 0} // להוסיף את הערך ברירת המחדל
          />

        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '16px' }}>
            ספרי לנו על חוויית הליווי שלך:
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows="6"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '16px',
              resize: 'vertical',
              lineHeight: '1.5',
            }}
            placeholder="תוכלי לספר איך עמיחי מדר עזר לך בתהליך?"
          ></textarea>
        </div>
        <button
          type="submit"
          style={{
            display: 'block',
            width: '100%',
            padding: '12px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 'bold',
            transition: 'background-color 0.3s',
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = '#45a049')}
          onMouseOut={(e) => (e.target.style.backgroundColor = '#4CAF50')}
        >
          שלחי חוות דעת
        </button>
      </form>
      {message && (
        <p
          style={{
            marginTop: '20px',
            padding: '10px',
            color: message.includes('שגיאה') ? 'red' : 'green',
            backgroundColor: message.includes('שגיאה') ? '#ffe6e6' : '#e6ffe6',
            textAlign: 'center',
            fontWeight: 'bold',
            borderRadius: '6px',
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export default App;
