import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactStars from 'react-rating-stars-component';
import { Loader2, Smile } from 'lucide-react';
import './App.css';

const EMOJI_LIST = {
  "סמיילים": ["😊", "😃", "😄", "😁", "😅", "😂", "🤣", "😉"],
  "לבבות": ["❤️", "💕", "💖", "💗", "💓", "💞", "💘", "💝"],
  "אגודלים": ["👍", "👎", "👌", "✌️", "🤝", "👏", "🙌", "✋"],
  "כללי": ["⭐", "✨", "🌟", "💫", "🔥", "💯", "💪", "🎉"]
};

function App() {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // סגירת בורר האימוג'ים בלחיצה מחוץ לאזור
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target) &&
          !event.target.closest('.emoji-button')) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const insertEmoji = (emoji) => {
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = feedback;
    const before = text.substring(0, start);
    const after = text.substring(end);
    const newText = before + emoji + after;
    
    setFeedback(newText);
    
    // החזרת הפוקוס והצבת הסמן אחרי האימוג'י
    setTimeout(() => {
      textareaRef.current.focus();
      const newPosition = start + emoji.length;
      textareaRef.current.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const toggleEmojiPicker = (e) => {
    e.preventDefault(); // מניעת סגירה מיידית של החלון
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || rating === 0 || feedback.trim() === '') {
      setMessage('אנא מלאי את כל השדות.');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/feedback`, { name, rating, feedback });
      setMessage('תודה על חוות הדעת!');
      setName('');
      setRating(0);
      setFeedback('');
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error inserting feedback:', error);
      setMessage('שגיאה בשליחת חוות הדעת.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="App">
        <div className="form-container">
          <h2 className="message success">!תודה רבה</h2>
          <p>חוות הדעת שלך התקבלה בהצלחה</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="header">
        <img src="/logo.png" alt="Logo" />
        <h1>חוות דעת על יועץ המשכנתאות</h1>
        <h2>עמיחי מדר</h2>
      </div>

      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-group">
          <label>שם מלא:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="הכנס את שמך המלא"
          />
        </div>

        <div className="form-group">
          <label>איך היית מדרג את חוויית הליווי שלך?</label>
          <div className="stars">
            <ReactStars
              count={5}
              onChange={handleRatingChange}
              size={40}
              activeColor="#d6b884"
              value={rating || 0}
            />
          </div>
        </div>

        <div className="form-group">
          <label>ספר לנו על חוויית הליווי שלך:</label>
          <div className="textarea-wrapper">
            <textarea
              ref={textareaRef}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows="5"
              placeholder="שתף אותנו בחוויה שלך..."
            />
            <button
              type="button"
              className="emoji-button"
              onClick={toggleEmojiPicker}
              aria-label="בחירת אימוג'י"
            >
              <Smile size={20} />
            </button>
            
            {showEmojiPicker && (
              <div className="emoji-picker" ref={emojiPickerRef}>
                {Object.entries(EMOJI_LIST).map(([category, emojis]) => (
                  <div key={category} className="emoji-category">
                    <div className="emoji-category-title">{category}</div>
                    <div className="emoji-grid">
                      {emojis.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          className="emoji-item"
                          onClick={() => {
                            insertEmoji(emoji);
                            setShowEmojiPicker(false);
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="submit-button">
          {isLoading ? (
            <div className="flex items-center gap-4">
              <Loader2 className="animate-spin h-5 w-5" />
              <span>שולח את חוות הדעת...</span>
            </div>
          ) : (
            'שליחת חוות דעת'
          )}
        </button>

        {message && (
          <div className={`message ${message.includes('שגיאה') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}

export default App;