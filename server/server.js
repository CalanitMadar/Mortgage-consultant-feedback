require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// ======================================================
// CORS
// ======================================================

const allowedOrigins = [
  'http://localhost:3000',
  'https://feedback-eight-weld.vercel.app'
];

app.use(
  cors({
    origin: function (origin, callback) {
      // מאפשר בקשות ללא Origin, למשל בדיקות שרת
      if (!origin) {
        return callback(null, true);
      }

      if (!allowedOrigins.includes(origin)) {
        const msg =
          'The CORS policy for this site does not allow access from the specified Origin.';

        return callback(new Error(msg), false);
      }

      return callback(null, true);
    },

    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true
  })
);

// ======================================================
// JSON
// ======================================================

app.use(express.json());

// ======================================================
// SUPABASE
// ======================================================

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY environment variables');
}

const supabase = createClient(
  supabaseUrl,
  supabaseKey
);

// ======================================================
// POST /api/feedback
// ======================================================

app.post('/api/feedback', async (req, res) => {
  const requestId = crypto.randomUUID();

  console.log('==========================================');
  console.log('Feedback request received');
  console.log('Request ID:', requestId);
  console.log('Time:', new Date().toISOString());
  console.log('Body:', req.body);
  console.log('==========================================');

  const {
    name,
    rating,
    feedback,
    submission_id
  } = req.body;

  try {
    // --------------------------------------------------
    // בדיקת נתונים
    // --------------------------------------------------

    if (
      !name ||
      !name.trim() ||
      !rating ||
      !feedback ||
      !feedback.trim() ||
      !submission_id
    ) {
      console.log('Invalid input data');

      return res.status(400).json({
        error: 'Invalid input data'
      });
    }

    // --------------------------------------------------
    // בדיקה בסיסית שה-submission_id הוא UUID
    // --------------------------------------------------

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(submission_id)) {
      console.log('Invalid submission_id:', submission_id);

      return res.status(400).json({
        error: 'Invalid submission ID'
      });
    }

    // --------------------------------------------------
    // הכנסה ל-Supabase
    //
    // submission_id הוא UNIQUE.
    // לכן אותה שליחה בדיוק לא תיצור רשומה חדשה.
    // --------------------------------------------------

    const { data, error } = await supabase
      .from('feedback')
      .upsert(
        {
          submission_id: submission_id,
          name: name.trim(),
          rating: Number(rating),
          feedback: feedback.trim()
        },
        {
          onConflict: 'submission_id',
          ignoreDuplicates: true
        }
      )
      .select();

    // --------------------------------------------------
    // טיפול בשגיאת Supabase
    // --------------------------------------------------

    if (error) {
      console.error('Supabase error:', error);

      return res.status(500).json({
        error: 'Database error'
      });
    }

    // --------------------------------------------------
    // הצלחה
    // --------------------------------------------------

    console.log('Feedback processed successfully');
    console.log('Submission ID:', submission_id);
    console.log('Supabase data:', data);

    return res.status(201).json({
      success: true,
      submission_id: submission_id,
      data: data
    });

  } catch (error) {
    console.error('Unexpected server error:', error);

    return res.status(500).json({
      error: 'Server error'
    });
  }
});

// ======================================================
// ROOT
// ======================================================

app.get('/', (req, res) => {
  res.send('Welcome to the Feedback Server');
});

// ======================================================
// HEALTH CHECK
// ======================================================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK'
  });
});

// ======================================================
// LOCAL DEVELOPMENT
// ======================================================

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(
      `Server running on http://localhost:${PORT}`
    );
  });
}

// ======================================================
// VERCEL
// ======================================================

module.exports = app;