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
  console.log('DEBUG pageController.renderContact: GET /contact', { success: req.query.success, error: req.query.error });
  res.render('contact', { 
    success: req.query.success,
    error: req.query.error,
    errors: null,
    formData: null
  });
};

exports.renderPortfolio = (req, res) => {
  res.render('portfolio');
};