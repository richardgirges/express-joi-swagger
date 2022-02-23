const Joi = require('joi');

/**
 * Validate an Express request object against a Joi validation schema
 * @param {Object} req
 * @param {Object} schema
 * @param {Object} joiOpts
 * @param {Function} callback
 */
module.exports = function validateSchema(req, schema, joiOpts) {
  const data = {};

  if (schema.body) {
    data.body = req.body;
  }

  if (schema.query) {
    data.query = req.query;
  }

  if (schema.params) {
    data.params = req.params;
  }

  if (schema.files) {
    data.files = req.files;
  }

  const { value, error } = Joi.object(schema).validate(data, joiOpts);
  const validatedData = {};

  if (value.body) {
    validatedData.body = value.body;
  }

  if (value.query) {
    validatedData.query = value.query;
  }

  if (value.params) {
    validatedData.params = value.params;
  }

  if (value.files) {
    validatedData.files = value.files;
  }

  const errors = error ? error.details.map((e) => e.message) : null;

  return {
    errors,
    validatedData
  };
};
