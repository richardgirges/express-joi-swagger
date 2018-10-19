const express = require('express');
const merge = require('lodash.merge');
const validateSchema = require('./validateSchema');
const buildRouteDefinition = require('./buildRouteDefinition');

const DEFAULT_JOI_OPTS = {
  abortEarly: false,
  allowUnknown: true
};

/**
 * ExpressJoiSwagger class is used to initialize the beginning stages of the
 * Swagger API spec, and returns a function that wraps around an Express router,
 * providing validation and auto Swagger documentation
 */
class ExpressJoiSwagger {
  /**
   * @param {Object} options.swaggerDefinition
   * @param {Object} options.onValidateError
   * @param {Object} options.joiOpts
   * @param {string} options.swaggerRoutePath
   */
  constructor({ swaggerDefinition, onValidateError, joiOpts, swaggerRoutePath }) {
    this.swaggerDefinition = Object.assign({}, swaggerDefinition, {
      swagger: '2.0',
      info: swaggerDefinition.info,
      paths: {}
    });

    this.onValidateError = onValidateError;

    this.joiOpts = joiOpts || {};

    this.swaggerRoutePath = swaggerRoutePath || '/swagger';
  }

  /**
   * Return overridden Express router
   * @param {Object} expressRouter
   * @param {Object} namespace
   * @param {?Array<string>} tags
   * @return {Object}
   */
  wrapRouter(expressRouter, namespace = null, tags = null) {
    return Object.assign(express(), expressRouter, {
      use: this._requestHandler.bind(this, { method: 'all', namespace, tags }, expressRouter),
      all: this._requestHandler.bind(this, { method: 'all', namespace, tags }, expressRouter),
      get: this._requestHandler.bind(this, { method: 'get', namespace, tags }, expressRouter),
      post: this._requestHandler.bind(this, { method: 'post', namespace, tags }, expressRouter),
      put: this._requestHandler.bind(this, { method: 'put', namespace, tags }, expressRouter),
      delete: this._requestHandler.bind(this, { method: 'delete', namespace, tags }, expressRouter),
      options: this._requestHandler.bind(this, { method: 'options', namespace, tags },
        expressRouter),
      patch: this._requestHandler.bind(this, { method: 'patch', namespace, tags }, expressRouter),
      listen: this._listen.bind(this, expressRouter)
    });
  }

  /**
   * Performs a deep merge to assign new properties to the existing swagger definition
   * @param {Object} assignedSwaggerDefinition
   */
  assignDefinition(assignedSwaggerDefinition) {
    this.swaggerDefinition = merge(this.swaggerDefinition, {
      definitions: assignedSwaggerDefinition
    });
  }

  /**
   * Wrapper method around express router handlers
   * This method will execute Joi validation against the route handler's validation schema,
   * Then build a swagger definition for the route
   * @param  {{ method: string, namespace: string }} properties
   * @param  {Object} expressRouter
   * @param  {Object} swaggerDefinition
   * @param  {...*}   args
   * @return {void}
   */
  _requestHandler({ method, namespace, tags }, expressRouter, ...args) {
    const routeOptsDefined = typeof args[1] === 'object';
    const routeOpts = routeOptsDefined ? args[1] : {}; // check for user-defined options
    const routerArgs = args.filter((a, i) => i === 0 || typeof a === 'function');
    const joiOpts = Object.assign({}, DEFAULT_JOI_OPTS, routeOpts.joiOpts || {}, this.joiOpts);
    const onValidateError = routeOpts.onValidateError || this.onValidateError;

    routeOpts.namespace = namespace;
    routeOpts.tags = tags;

    // Build a swagger definition for this path
    if ( routeOptsDefined ) {
      buildRouteDefinition(method, args[0], routeOpts, this.swaggerDefinition);
    }

    // If validation schema is present, add a middleware in the route chain to perform validation
    if (routeOpts.validate) {
      routerArgs.splice(1, 0, (req, res, next) => {
        // Execute validation
        validateSchema(req, routeOpts.validate, joiOpts, (errors, validatedData) => {
          // If errors are present, check if there is a user-defined request error handler
          if (errors) {
            if (onValidateError) {
              return onValidateError(errors, req, res, next);
            }

            // As a fallback, send a 400 with an array of errors
            return res.status(400).send(errors);
          }

          // Attach the validated request parameters to the request object
          req.validated = validatedData;

          next();
        });
      });
    }

    return expressRouter[method](...routerArgs);
  }

  /**
   * Initiate express app.listen() and build the master swagger definition
   * @param {Object} expressRouter
   * @param {...any} args
   */
  _listen(expressRouter, ...args) {
    this._buildSwaggerDefinition(expressRouter);

    expressRouter.listen(...args);
  }

  /**
   * Build the master swagger definition.
   * @param {Object} expressRouter
   */
  _buildSwaggerDefinition(expressRouter) {
    // Perform a deep clone
    const def = JSON.parse(JSON.stringify(this.swaggerDefinition));

    // Do some clean up
    delete def.defaultResponses;
    delete def.responseStructures;

    expressRouter.get(this.swaggerRoutePath, (req, res) => res.json(def));
  }
}

module.exports = ExpressJoiSwagger;
