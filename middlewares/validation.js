const { check, validationResult } = require('express-validator');

exports.contactValidation = [
  check('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  
  check('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
    
  check('phone')
    .optional()
    .matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)
    .withMessage('Invalid phone number'),
    
  check('message')
    .notEmpty().withMessage('Message is required')
    .customSanitizer(value => {
      const textOnly = value.replace(/<[^>]*>/g, '');
      return textOnly;
    })
    .isLength({ min: 10 }).withMessage('Message must be at least 10 characters (excluding formatting)')
];

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('contact', {
      errors: errors.array(),
      error: null,
      formData: req.body
    });
  }
  next();
};