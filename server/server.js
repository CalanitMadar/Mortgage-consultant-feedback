// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const { createClient } = require('@supabase/supabase-js');

// const app = express();


// const allowedOrigins = [
//   'http://localhost:3000', // עבור הפיתוח המקומי
//   'https://feedback-server-gray.vercel.app'
// ];

// // הגדר את CORS עם הרשאות ספציפיות
// app.use(cors({
//   origin: allowedOrigins,
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   credentials: true 
// }));

// app.options('/api/feedback', cors()); // תאפשר בדיקות Preflight


// app.use(express.json());

// const supabaseUrl = process.env.SUPABASE_URL;
// const supabaseKey = process.env.SUPABASE_KEY;
// const supabase = createClient(supabaseUrl, supabaseKey);

// const PORT = process.env.PORT || 5000;
// app.post('/api/feedback', async (req, res) => {
//   const { rating, feedback } = req.body;
  

//   try {
//     const { data, error } = await supabase
//       .from('feedback')
//       .insert([{ rating, feedback }]);

//     if (error) {
//       return res.status(500).json({ error: error.message });
//     }

//     res.status(201).json({ data });
//   } catch (error) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'https://feedback-eight-weld.vercel.app' // הדומיין של הלקוח, לא של השרת
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true 
}));

app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.post('/api/feedback', async (req, res) => {
  console.log('Received feedback request:', req.body);
  const { rating, feedback } = req.body;

  try {
    if (!rating || !feedback) {
      console.log('Invalid input data');
      return res.status(400).json({ error: 'Invalid input data' });
    }

    const { data, error } = await supabase
      .from('feedback')
      .insert([{ rating, feedback }]);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('Feedback inserted successfully:', data);
    res.status(201).json({ data });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


app.get('/', (req, res) => {
  res.send('Welcome to the Feedback Server');
});


// בדיקת בריאות עבור Vercel
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// רק אם מריצים את השרת מקומית
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;