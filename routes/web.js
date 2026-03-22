const express = require('express');
const router = express.Router();
const { 
  renderHome,
  renderServices,
  renderContact,
  renderPortfolio
} = require('../controllers/pageController');
const { submitContact } = require('../controllers/contactController');

// Page routes
router.get('/', renderHome);
router.get('/services', renderServices);
router.get('/contact', renderContact);
router.get('/portfolio', renderPortfolio);

// Form submission
router.post('/contact', submitContact);

module.exports = router;