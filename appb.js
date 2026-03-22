require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();

const Contact = require('./models/Contact');

// Update the POST /contact route
app.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const newContact = new Contact({ name, email, message });
    await newContact.save();
    res.redirect('/?success=true');
  } catch (error) {
    console.error('Error saving contact:', error);
    res.redirect('/contact?error=true');
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

  

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => res.render('home'));
app.get('/services', (req, res) => res.render('services'));
app.get('/contact', (req, res) => res.render('contact'));

// Add this with your other routes
app.get('/portfolio', (req, res) => res.render('portfolio'));


// Contact Form Submission
app.post('/contact', async (req, res) => {
  // Add your MongoDB contact form handling here
  res.redirect('/?success=true');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));