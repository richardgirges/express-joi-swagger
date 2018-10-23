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
        produces: ['application/json'],
      },
      onValidateError: (errors, req, res, next) => {
        next(createError(400, errors));
      }
    });
  });

  it('should return an instance of express with expected methods', () => {
    let result = swagger.wrapRouter(app);

    const { all, use, get, post, put, delete: del, options, patch, listen,
      ...expressSwaggerDefaults } = result;
    const { all: _all, use: _use, get: _get, post: _post, put: _put, delete: _del,
      options: _options, patch: _patch, listen: _listen, ...expressDefaults } = express();
    expect(JSON.stringify(expressSwaggerDefaults)).toEqual(JSON.stringify(expressDefaults));
  });

  it('should inherit from event emitter', (done) => {
    // https://github.com/expressjs/express/tree/master/test
    app.on('foo', done);
    app.emit('foo');
  });

  it('should not inhibit ALL routes', () => {
    app.all('/', (req, res, next) => {
      res.send('hello world');
    });

    let result = swagger.wrapRouter(app);

    return request(result)
      .get('/')
      .expect(200);
  });

  it('should not inhibit USE routes', () => {
    app.use('*', (req, res, next) => {
      res.send('hello world');
    });

    let result = swagger.wrapRouter(app);

    return request(result)
      .get('/')
      .expect(200);
  });

  it('should not inhibit GET routes', () => {
    app.get('/', (req, res, next) => {
      res.send('hello world');
    });

    let result = swagger.wrapRouter(app);

    return request(result)
      .get('/')
      .expect(200);
  });

  it('should not inhibit POST routes', () => {
    app.post('/', (req, res, next) => {
      res.send('hello world');
    });

    let result = swagger.wrapRouter(app);

    return request(result)
      .post('/')
      .expect(200);
  });

  it('should not inhibit PUT routes', () => {
    app.put('/', (req, res, next) => {
      res.send('hello world');
    });

    let result = swagger.wrapRouter(app);

    return request(result)
      .put('/')
      .expect(200);
  });

  it('should not inhibit PATCH routes', () => {
    app.patch('/', (req, res, next) => {
      res.send('hello world');
    });

    let result = swagger.wrapRouter(app);

    return request(result)
      .patch('/')
      .expect(200);
  });

  it('should not inhibit DELETE routes', () => {
    app.delete('/', (req, res, next) => {
      res.send('hello world');
    });

    let result = swagger.wrapRouter(app);

    return request(result)
      .del('/')
      .expect(200);
  });

  it('should not inhibit OPTIONS routes', () => {
    app.options('/', (req, res, next) => {
      res.send('hello world');
    });

    let result = swagger.wrapRouter(app);

    return request(result)
      .options('/')
      .expect(200);
  });
});
