require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const PORT = process.env.PORT || 5000;
app.post('/api/feedback', async (req, res) => {
  const { rating, feedback } = req.body;
  

  try {
    const { data, error } = await supabase
      .from('feedback')
      .insert([{ rating, feedback }]);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ data });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
