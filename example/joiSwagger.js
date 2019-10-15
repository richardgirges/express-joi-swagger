const ExpressJoiSwagger = require('../src');

const joiSwagger = new ExpressJoiSwagger({
  swaggerDefinition: {
    info: {
      title: 'service-category',
      description: 'Blah',
      version: 'v1.0.2'
    },
    host: 'foo.bar.com',
    schemes: ['http', 'https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    defaultResponses: [200, 500]
  },
  onValidateError: (errors, req, res, next) => {
    res.status(400).send(errors);
  }
});

module.exports = joiSwagger;
