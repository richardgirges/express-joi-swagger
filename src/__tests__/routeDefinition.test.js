/* eslint no-undef: 0 */

const ExpressJoiSwagger = require('../');
const express = require('express');
const request = require('supertest');

describe('Public Method: wrapRouter', () => {
  const createError = jest.fn();
  let swagger = null;
  let app = null;

  beforeEach(() => {
    app = express();
    swagger = new ExpressJoiSwagger({
      swaggerRoutePath: '/api/swagger',
      swaggerDefinition: {
        info: {
          title: 'Test API'
        },
        host: 'http://localhost',
        schemes: ['http'],
        consumes: ['application/json'],
        produces: ['application/json']
      },
      onValidateError: (errors, req, res, next) => {
        next(createError(400, errors));
      }
    });
  });

  it('should allow object instead of middleware for second argument', () => {
    let result = swagger.wrapRouter(app);

    result.get('/v1/test', {
      description: 'Example API request',
      responses: [200]
    }, (req, res, next) => {
      res.send('hello world');
    });

    return request(app)
      .get('/v1/test')
      .expect(200);
  });
});
