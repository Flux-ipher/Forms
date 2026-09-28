require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

const frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : '*';

app.set('trust proxy', 1); // Trust first proxy (e.g., Render)
app.use(helmet()); // Set secure HTTP headers

app.use(cors({
  origin: frontendUrl,
  optionsSuccessStatus: 200
}));
app.use(express.json());

// Apply rate limiting to all API routes to prevent DDoS / abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

app.use('/api/', apiLimiter);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabase;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn("Supabase URL or Key is missing. Database operations failed.");
}
// Health check route
app.get('/', (req, res) => {
  res.send('Forms API is running perfectly!');
});

// 1. POST /api/forms
// Create a new, blank form
app.post('/api/forms', async (req, res) => {
  try {
    if (!supabase) throw new Error("Supabase is not configured.");
    
    const { title = 'Untitled Form', description = null, schema = [] } = req.body || {};

    const { data, error } = await supabase
      .from('forms')
      .insert([
        { title, description, schema }
      ])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. PUT /api/forms/:id
// Auto-save the form builder state
app.put('/api/forms/:id', async (req, res) => {
  try {
    if (!supabase) throw new Error("Supabase is not configured.");
    
    const { id } = req.params;
    const { title, description, schema } = req.body;

    const { data, error } = await supabase
      .from('forms')
      .update({ title, description, schema, updated_at: new Date() })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. GET /api/forms/:id
// Fetch the form schema
app.get('/api/forms/:id', async (req, res) => {
  try {
    if (!supabase) throw new Error("Supabase is not configured.");
    
    const { id } = req.params;

    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Form not found' });
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. POST /api/submissions
// Submit a completed form
app.post('/api/submissions', async (req, res) => {
  try {
    if (!supabase) throw new Error("Supabase is not configured.");
    
    const { form_id, answers } = req.body;

    const { data, error } = await supabase
      .from('submissions')
      .insert([
        { form_id, answers }
      ])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. GET /api/analytics/:id
// Fetch all submissions for a specific form
app.get('/api/analytics/:id', async (req, res) => {
  try {
    if (!supabase) throw new Error("Supabase is not configured.");
    
    const { id } = req.params;

    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('*')
      .eq('id', id)
      .single();
      
    if (formError) throw formError;

    const { data: submissions, error: subError } = await supabase
      .from('submissions')
      .select('*')
      .eq('form_id', id);

    if (subError) throw subError;
    
    res.json({ form, submissions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. GET /api/forms
// Fetch all forms for the dashboard
app.get('/api/forms', async (req, res) => {
  try {
    if (!supabase) throw new Error("Supabase is not configured.");
    
    const { data, error } = await supabase
      .from('forms')
      .select('id, title, description, created_at, updated_at')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. DELETE /api/forms/:id
// Delete a form
app.delete('/api/forms/:id', async (req, res) => {
  try {
    if (!supabase) throw new Error("Supabase is not configured.");
    
    const { id } = req.params;

    const { data, error } = await supabase
      .from('forms')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
