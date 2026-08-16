import React, {
  useState,
  useRef,
  useEffect
} from 'react';

import axios from 'axios';
import ReactStars from 'react-rating-stars-component';
import {
  Loader2,
  Smile
} from 'lucide-react';

import './App.css';

// ======================================================
// EMOJIS
// ======================================================

const EMOJI_LIST = {
  סמיילים: [
    '😊',
    '😃',
    '😄',
    '😁',
    '😅',
    '😂',
    '🤣',
    '😉'
  ],

  לבבות: [
    '❤️',
    '💕',
    '💖',
    '💗',
    '💓',
    '💞',
    '💘',
    '💝'
  ],

  אגודלים: [
    '👍',
    '👎',
    '👌',
    '✌️',
    '🤝',
    '👏',
    '🙌',
    '✋'
  ],

  כללי: [
    '⭐',
    '✨',
    '🌟',
    '💫',
    '🔥',
    '💯',
    '💪',
    '🎉'
  ]
};

// ======================================================
// APP
// ======================================================

function App() {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const [message, setMessage] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const [isSubmitted, setIsSubmitted] = useState(false);

  const [showEmojiPicker, setShowEmojiPicker] =
    useState(false);

  // ----------------------------------------------------
  // Refs
  // ----------------------------------------------------

  const textareaRef = useRef(null);

  const emojiPickerRef = useRef(null);

  // ====================================================
  // מניעת שליחה כפולה
  // ====================================================

  const isSubmittingRef = useRef(false);

  // ====================================================
  // סגירת אימוג'ים בלחיצה מחוץ לאזור
  // ====================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        !event.target.closest('.emoji-button')
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };
  }, []);

  // ====================================================
  // דירוג
  // ====================================================

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  // ====================================================
  // הכנסת אימוג'י
  // ====================================================

  const insertEmoji = (emoji) => {
    if (!textareaRef.current) {
      return;
    }

    const start =
      textareaRef.current.selectionStart;

    const end =
      textareaRef.current.selectionEnd;

    const text = feedback;

    const before =
      text.substring(0, start);

    const after =
      text.substring(end);

    const newText =
      before + emoji + after;

    setFeedback(newText);

    setTimeout(() => {
      if (!textareaRef.current) {
        return;
      }

      textareaRef.current.focus();

      const newPosition =
        start + emoji.length;

      textareaRef.current.setSelectionRange(
        newPosition,
        newPosition
      );
    }, 0);
  };

  // ====================================================
  // פתיחה / סגירה של האימוג'ים
  // ====================================================

  const toggleEmojiPicker = (e) => {
    e.preventDefault();

    setShowEmojiPicker(
      (previous) => !previous
    );
  };

  // ====================================================
  // שליחת הטופס
  // ====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // --------------------------------------------------
    // הגנה חזקה נגד double submit
    //
    // אם הפונקציה כבר רצה - לא עושים כלום.
    // --------------------------------------------------

    if (isSubmittingRef.current) {
      console.log(
        'Duplicate submit blocked on client'
      );

      return;
    }

    // --------------------------------------------------
    // בדיקת שדות
    // --------------------------------------------------

    if (
      !name.trim() ||
      rating === 0 ||
      feedback.trim() === ''
    ) {
      setMessage(
        'אנא מלאי את כל השדות.'
      );

      return;
    }

    // --------------------------------------------------
    // נעילת שליחה
    // --------------------------------------------------

    isSubmittingRef.current = true;

    setIsLoading(true);

    setMessage('');

    // --------------------------------------------------
    // יצירת ID ייחודי לשליחה הזאת
    // --------------------------------------------------

    const submissionId =
      crypto.randomUUID();

    console.log(
      'Submitting feedback:',
      submissionId
    );

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/feedback`,
        {
          name: name.trim(),
          rating: Number(rating),
          feedback: feedback.trim(),

          submission_id: submissionId
        },
        {
          timeout: 15000
        }
      );

      console.log(
        'Feedback response:',
        response.data
      );

      // ------------------------------------------------
      // הצלחה
      // ------------------------------------------------

      setMessage(
        'תודה על חוות הדעת!'
      );

      setName('');
      setRating(0);
      setFeedback('');

      setIsSubmitted(true);

    } catch (error) {
      console.error(
        'Error inserting feedback:',
        error
      );

      if (
        error.code === 'ECONNABORTED'
      ) {
        setMessage(
          'השליחה ארכה זמן רב מדי. אנא נסי שוב.'
        );
      } else {
        setMessage(
          'שגיאה בשליחת חוות הדעת.'
        );
      }

    } finally {
      setIsLoading(false);

      // ------------------------------------------------
      // מאפשר שליחה חדשה רק לאחר שהשליחה הסתיימה
      // ------------------------------------------------

      isSubmittingRef.current = false;
    }
  };

  // ====================================================
  // מסך הצלחה
  // ====================================================

  if (isSubmitted) {
    return (
      <div className="App">
        <div className="form-container">

          <h2 className="message success">
            !תודה רבה
          </h2>

          <p>
            חוות הדעת שלך התקבלה בהצלחה
          </p>

        </div>
      </div>
    );
  }

  // ====================================================
  // FORM
  // ====================================================

  return (
    <div className="App">

      <div className="header">

        <img
          src="/logo.png"
          alt="Logo"
        />

        <h1>
          חוות דעת על יועץ המשכנתאות
        </h1>

        <h2>
          עמיחי מדר
        </h2>

      </div>

      <form
        onSubmit={handleSubmit}
        className="form-container"
      >

        {/* ============================================ */}
        {/* NAME */}
        {/* ============================================ */}

        <div className="form-group">

          <label>
            שם מלא:
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            placeholder="הכנס את שמך המלא"
            disabled={isLoading}
          />

        </div>

        {/* ============================================ */}
        {/* RATING */}
        {/* ============================================ */}

        <div className="form-group">

          <label>
            איך היית מדרג את חוויית הליווי שלך?
          </label>

          <div className="stars">

            <ReactStars
              count={5}
              onChange={handleRatingChange}
              size={40}
              activeColor="#d6b884"
              value={rating || 0}
              edit={!isLoading}
            />

          </div>

        </div>

        {/* ============================================ */}
        {/* FEEDBACK */}
        {/* ============================================ */}

        <div className="form-group">

          <label>
            ספר לנו על חוויית הליווי שלך:
          </label>

          <div className="textarea-wrapper">

            <textarea
              ref={textareaRef}
              value={feedback}
              onChange={(e) =>
                setFeedback(e.target.value)
              }
              rows="5"
              placeholder="שתף אותנו בחוויה שלך..."
              disabled={isLoading}
            />

            {/* ======================================== */}
            {/* EMOJI BUTTON */}
            {/* ======================================== */}

            <button
              type="button"
              className="emoji-button"
              onClick={toggleEmojiPicker}
              aria-label="בחירת אימוג'י"
              disabled={isLoading}
            >
              <Smile size={20} />
            </button>

            {/* ======================================== */}
            {/* EMOJI PICKER */}
            {/* ======================================== */}

            {showEmojiPicker && (
              <div
                className="emoji-picker"
                ref={emojiPickerRef}
              >

                {Object.entries(
                  EMOJI_LIST
                ).map(
                  ([category, emojis]) => (

                    <div
                      key={category}
                      className="emoji-category"
                    >

                      <div className="emoji-category-title">
                        {category}
                      </div>

                      <div className="emoji-grid">

                        {emojis.map(
                          (emoji) => (

                            <button
                              key={emoji}
                              type="button"
                              className="emoji-item"
                              onClick={() => {
                                insertEmoji(
                                  emoji
                                );

                                setShowEmojiPicker(
                                  false
                                );
                              }}
                            >
                              {emoji}
                            </button>

                          )
                        )}

                      </div>

                    </div>

                  )
                )}

              </div>
            )}

          </div>

        </div>

        {/* ============================================ */}
        {/* SUBMIT */}
        {/* ============================================ */}

        <button
          type="submit"
          disabled={isLoading}
          className="submit-button"
        >

          {isLoading ? (

            <div className="flex items-center gap-4">

              <Loader2
                className="animate-spin h-5 w-5"
              />

              <span>
                שולח את חוות הדעת...
              </span>

            </div>

          ) : (

            'שליחת חוות דעת'

          )}

        </button>

        {/* ============================================ */}
        {/* MESSAGE */}
        {/* ============================================ */}

        {message && (

          <div
            className={`message ${
              message.includes('שגיאה')
                ? 'error'
                : 'success'
            }`}
          >
            {message}
          </div>

        )}

      </form>

    </div>
  );
}

export default App;