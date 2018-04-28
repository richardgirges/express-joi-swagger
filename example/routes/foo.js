/* eslint new-cap: 0 */

const Joi = require('joi');
const joiSwagger = require('../joiSwagger');
const router = joiSwagger.wrapRouter(require('express').Router(), '/api');

router.get('/foo', {
  summary: 'GetFoo',
  description: 'Gets a list of foos',
  validate: {
    query: {
      limit: Joi
        .number()
        .min(20)
        .optional()
        .description('Total number of results, for pagination purposes.')
    }
  }
},
(req, res) => {
  res.send('BLAH');
});

router.get('/bar', {
  summary: 'GetBar',
  description: 'Gets a bar',
  validate: {
    query: {
      limit: Joi.number().min(20).optional().description('The pagination limit')
    }
  },
  responses: {
    200: {
      description: 'User Record',
      schema: {
        $ref: '#/definitions/User'
      }
    }
  }
},
(req, res) => {
  res.send('BLAH');
});

module.exports = router.expressRouter;

