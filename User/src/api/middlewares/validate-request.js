const { validationResult } = require('express-validator');
const { RequestValidationError } = require('../../utils/errors/app-errors');

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {

        const errorMessages = errors.array().map(error => error.msg);
        throw new RequestValidationError(errorMessages.join(", "));
        
    }
    next();
};

module.exports = validateRequest;