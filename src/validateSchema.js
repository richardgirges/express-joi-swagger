const Joi = require('joi');

const validateObj = (schema, req) => {
  let validateObj = {};
  Object.keys(schema.describe().keys).map((key) => {
      validateObj[key] = req[key];
  });
  return validateObj;
}

/**
 * Validate an Express request object against a Joi validation schema
 * @param {Object} req
 * @param {Object} schema
 * @param {Object} joiOpts
 * @param {Function} callback
 */
module.exports = (req, schema, joiOpts) => {
  if (typeof schema === 'function'){
      schema = schema();
  }
  const {value, error} = schema.validate(validateObj(schema, req), joiOpts);
  const errors = error ? error.details.map((e) => e.message) : null;
  return {
    errors,
    value
  };
};