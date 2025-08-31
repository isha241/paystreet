import { body, validationResult, ValidationChain } from "express-validator";
import { Request, Response, NextFunction } from "express";

// Import the correct types from express-validator
import { ValidationError } from "express-validator";

// User registration validation
export const validateUserRegistration = (): ValidationChain[] => [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  body("fullName")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be between 2 and 100 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Full name can only contain letters and spaces"),
];

// User login validation
export const validateUserLogin = (): ValidationChain[] => [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Beneficiary validation
export const validateBeneficiary = (): ValidationChain[] => [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Beneficiary name must be between 2 and 100 characters"),
  body("bankAccountNumber")
    .trim()
    .isLength({ min: 8, max: 34 })
    .withMessage("Bank account number must be between 8 and 34 characters")
    .matches(/^[A-Z0-9]+$/)
    .withMessage(
      "Bank account number can only contain uppercase letters and numbers"
    ),
  body("country")
    .trim()
    .isLength({ min: 2, max: 3 })
    .withMessage("Country code must be 2-3 characters")
    .isUppercase()
    .withMessage("Country code must be uppercase"),
  body("currency")
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage("Currency code must be exactly 3 characters")
    .isUppercase()
    .withMessage("Currency code must be uppercase"),
];

// Transaction validation
export const validateTransaction = (): ValidationChain[] => [
  body("beneficiaryId").isUUID().withMessage("Invalid beneficiary ID format"),
  body("sourceAmount")
    .isFloat({ min: 0.01 })
    .withMessage("Source amount must be a positive number"),
  body("sourceCurrency")
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage("Source currency code must be exactly 3 characters")
    .isUppercase()
    .withMessage("Source currency code must be uppercase"),
  body("targetCurrency")
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage("Target currency code must be exactly 3 characters")
    .isUppercase()
    .withMessage("Target currency code must be uppercase"),
];

// FX conversion validation
export const validateFXConversion = (): ValidationChain[] => [
  body("from")
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage("Source currency code must be exactly 3 characters")
    .isUppercase()
    .withMessage("Source currency code must be uppercase"),
  body("to")
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage("Target currency code must be exactly 3 characters")
    .isUppercase()
    .withMessage("Target currency code must be uppercase"),
  body("amount")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be a positive number"),
];

// Generic validation handler
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => ({
      field: error.type,
      message: error.msg,
      value: "",
    }));

    res.status(400).json({
      error: "Validation failed",
      details: errorMessages,
    });
    return;
  }

  next();
};

// Currency code validation
export const isValidCurrencyCode = (code: string): boolean => {
  const validCurrencies = [
    "USD",
    "EUR",
    "GBP",
    "INR",
    "MXN",
    "CAD",
    "AUD",
    "JPY",
    "CHF",
    "CNY",
  ];
  return validCurrencies.includes(code.toUpperCase());
};

// Country code validation
export const isValidCountryCode = (code: string): boolean => {
  const validCountries = [
    "US",
    "CA",
    "MX",
    "GB",
    "DE",
    "FR",
    "IN",
    "AU",
    "JP",
    "CH",
    "CN",
  ];
  return validCountries.includes(code.toUpperCase());
};
