const { ValidateSignature } = require('../../utils');

module.exports = async (req,res,next) => {
    try {
        await ValidateSignature(req);
        return next();
      } catch (err) {
        return next(err);
      }
  }