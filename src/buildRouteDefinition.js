const path = require('path');
const HTTPStatus = require('http-status');
const j2s = require('joi-to-swagger');
const cloneDeep = require('lodash.clonedeep');
const EJSError = require('./EJSError');

/**
 * Build a swagger definition for the supplied route
 * @param {string} method
 * @param {string} routePath
 * @param {Object} routeOpts
 * @param {Object} swaggerDef
 */
module.exports = function buildRouteDefinition(method, routePath, routeOpts, swaggerDef) {
  const apiDef = Object.assign({}, routeOpts.swaggerDef || {});
  const paramDef = _buildParameters(routeOpts.validate);

  if (routeOpts.namespace) {
    routePath = path.join(routeOpts.namespace, routePath);

    // Eliminate REGEX in the route path
    // TODO: Make it so that this is a configurable option
    routePath = routePath.replace(/\([^)]*\)/g, '');
  }

  // We don't want trailing slashes in routes with namespaces.
  // Example: /v1/ should be /v1
  // Example 2: /v1/foo/ should be /v1/foo
  // Example 3: (no namespace): / should be /
  if (routePath !== '/' && routePath.endsWith('/')) {
    routePath = routePath.substr(0, routePath.length - 1);
  }

  // Top level swagger parameters. These can be set on the options level
  if (routeOpts.tags) {
    apiDef.tags = routeOpts.tags;
  }

  if (routeOpts.summary) {
    apiDef.summary = routeOpts.summary;
  }

  if (routeOpts.description) {
    apiDef.description = routeOpts.description;
  }

  if (routeOpts.produces) {
    apiDef.produces = routeOpts.produces;
  }

  if (routeOpts.consumes) {
    apiDef.consumes = routeOpts.consumes;
  }

  if (routeOpts.tags) {
    apiDef.tags = routeOpts.tags;
  }

  if (!swaggerDef.paths[routePath]) {
    swaggerDef.paths[routePath] = {};
  }

  if (routeOpts.responses) {
    apiDef.responses = _buildResponses(routeOpts.responses, method, routePath,
      swaggerDef.responseStructures);
  } else {
    apiDef.responses = {};
  }

  if (swaggerDef.defaultResponses) {
    apiDef.responses = Object.assign(
      {},
      _buildResponses(swaggerDef.defaultResponses, method, routePath,
        swaggerDef.responseStructures),
      apiDef.responses
    );
  }

  if (!Object.keys(apiDef.responses).length) {
    throw new EJSError('Missing "responses" object.', method, routePath);
  }

  if (swaggerDef.paths[routePath][method]) {
    throw new EJSError('This route path is defined twice.', method, routePath);
  }

  if (paramDef.length) {
    apiDef.parameters = paramDef;
  }

  swaggerDef.paths[routePath][method] = apiDef;
};

/**
 * Converts a JOI-based "parameters" object into a Swagger-compliant "parameters" definition
 * @param {Object} validationSchema
 * @return {Array<Object>}
 */
function _buildParameters(validationSchema) {
  const reqParams = {
    query: [],
    body: [],
    params: [],
    files: []
  };

  if (!validationSchema) {
    return [];
  }

  if (validationSchema.query) {
    const { properties } = j2s(validationSchema.query).swagger;

    for (const k in properties) {
      const property = properties[k];

      property.name = k;
      property.in = 'query';

      reqParams.query.push(property);
    }
  }

  return reqParams.query
    .concat(reqParams.body)
    .concat(reqParams.params)
    .concat(reqParams.files);
}

/**
 * Converts a "responses" object into a Swagger-compliant "responses" definition
 * @param {Object} responses
 * @param {string} method
 * @param {string} routePath
 * @param {?Object} responseStructures
 * @return {Object}
 */
function _buildResponses(responses, method, routePath, responseStructures = null) {
  const responsesDefinition = {};

  if (Array.isArray(responses)) {
    for (let i = 0; i < responses.length; i++) {
      if (typeof responses[i] === 'number' || !isNaN(responses[i])) {
        const httpCode = parseInt(responses[i]);
        responsesDefinition[httpCode] = {
          description: HTTPStatus[httpCode]
        };
      } else {
        throw new EJSError(`Invalid response property: ${responses[i]}`, method, routePath);
      }
    }
  } else {
    for (const k in responses) {
      if (isNaN(k) || !responses[k] || typeof responses[k] !== 'object') {
        throw new EJSError(`Invalid response property: ${k}`, method, routePath);
      }

      const httpCode = parseInt(k);

      if (responses === true) {
        responsesDefinition[httpCode] = {
          description: HTTPStatus[httpCode]
        };
      } else {
        if (responseStructures[httpCode]) {
          responsesDefinition[httpCode] = cloneDeep(responseStructures[httpCode]);
          responsesDefinition[httpCode].schema.properties.data = responses[httpCode];
        } else {
          responsesDefinition[httpCode] = responses[httpCode];
        }
      }
    }
  }

  return responsesDefinition;
}
