exports.renderHome = (req, res) => {
  res.render('home', { 
    success: req.query.success,
    error: req.query.error 
  });
};

exports.renderServices = (req, res) => {
  res.render('services');
};

exports.renderContact = (req, res) => {
  res.render('contact', { 
    error: null,  // Add this line
    errors: null,
    formData: null
  });
};

exports.renderPortfolio = (req, res) => {
  res.render('portfolio');
};