const { body, validationResult } = require('express-validator');

// Validation rules for user registration
const validateSignup = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
];

// Validation rules for user login
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Validation rules for beneficiary creation
const validateBeneficiary = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Beneficiary name must be between 2 and 100 characters'),
  body('bankAccountNumber')
    .trim()
    .isLength({ min: 5, max: 50 })
    .withMessage('Bank account number must be between 5 and 50 characters'),
  body('country')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Country must be between 2 and 100 characters'),
  body('currency')
    .trim()
    .isLength({ min: 3, max: 3 })
    .isUppercase()
    .withMessage('Currency must be a 3-letter code (e.g., USD, EUR)')
];

// Validation rules for transaction creation
const validateTransaction = [
  body('beneficiaryId')
    .notEmpty()
    .withMessage('Beneficiary ID is required'),
  body('sourceAmount')
    .isFloat({ min: 0.01 })
    .withMessage('Source amount must be a positive number'),
  body('sourceCurrency')
    .trim()
    .isLength({ min: 3, max: 3 })
    .isUppercase()
    .withMessage('Source currency must be a 3-letter code')
];

// Validation rules for FX rate conversion
const validateFxConversion = [
  body('from')
    .trim()
    .isLength({ min: 3, max: 3 })
    .isUppercase()
    .withMessage('From currency must be a 3-letter code'),
  body('to')
    .trim()
    .isLength({ min: 3, max: 3 })
    .isUppercase()
    .withMessage('To currency must be a 3-letter code'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number')
];

// Helper function to check validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

module.exports = {
  validateSignup,
  validateLogin,
  validateBeneficiary,
  validateTransaction,
  validateFxConversion,
  handleValidationErrors
};
