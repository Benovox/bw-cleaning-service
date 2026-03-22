const Contact = require('../models/Contact');

exports.submitContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    
    // Server-side validation
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.render('contact', {
        error: 'Name, email and message are required',
        errors: null,
        formData: req.body
      });
    }

    // Basic email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.render('contact', {
        error: 'Please enter a valid email address',
        errors: null,
        formData: req.body
      });
    }

    const newContact = new Contact({ 
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || null, // Store null if phone is empty
      message: message.trim(),
      date: new Date() // Explicit timestamp
    });

    await newContact.save();
    
    // Successful submission
    res.redirect('/?success=true');
    
  } catch (error) {
    console.error('Contact submission error:', error);
    
    // Differentiate between validation and server errors
    const errorMessage = error.name === 'ValidationError' 
      ? 'Invalid data provided'
      : 'Failed to save your message. Please try again.';
    
    res.render('contact', {
      error: errorMessage,
      errors: error.errors || null,
      formData: req.body
    });
  }
};

exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find()
      .sort({ date: -1 })
      .lean(); // Convert to plain JS objects
    
    res.render('admin/contacts', { 
      contacts,
      error: req.query.error 
    });
    
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.redirect('/?error=fetch_contacts');
  }
};