const Joi = require('joi');

/**
 * Validate an Express request object against a Joi validation schema
 * @param {Object} req
 * @param {Object} schema
 * @param {Object} joiOpts
 * @param {Function} callback
 */
module.exports = function validateSchema(req, schema, joiOpts, callback) {
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

  Joi.validate(data, schema, joiOpts, (errors, result) => {
    const validatedData = {};

    if (result.body) {
      validatedData.body = result.body;
    }

    if (result.query) {
      validatedData.query = result.query;
    }

    if (result.params) {
      validatedData.params = result.params;
    }

    if (result.files) {
      validatedData.files = result.files;
    }

    if (errors) {
      return callback(errors.details.map((e) => e.message), result);
    }

    callback(null, result);
  });
};
