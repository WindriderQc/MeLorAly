const { body, validationResult } = require('express-validator');

const childrenValidator = [
  body('children').isArray({ min: 1 }).withMessage('Au moins un enfant requis'),
  body('children.*.name').notEmpty().trim().withMessage('Nom requis'),
  body('children.*.birthDate').isDate().withMessage('Date de naissance invalide'),
  body('children.*.grade').optional().isString()
];

const adultsValidator = [
  body('adults').optional().isArray(),
  body('adults.*.email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('adults.*.role').isIn(['parent', 'grandparent']).withMessage('Rôle invalide')
];

const familySpaceValidator = [
  body('familyName').notEmpty().trim().isLength({ min: 2, max: 100 })
    .withMessage('Nom de famille requis (2-100 caractères)')
];

module.exports = {
  childrenValidator,
  adultsValidator,
  familySpaceValidator,
  validationResult
};
