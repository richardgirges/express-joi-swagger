/**
 * ExpressJoiSwagger Error class. Extends from the base Error class.
 * This class is used to identify exclusive errors for this library.
 */
class EJSError extends Error {
  /**
   * Instantiate an ExpressJoiSwagger Error instance.
   * @param {string} message
   * @param {?string} method
   * @param {?string} routePath
   */
  constructor(message, method = null, routePath = null) {
    if (method && routePath) {
      message = `${method.toUpperCase()} ${routePath}: ` + message;
    }

    super(message);

    this.name = 'ExpressJoiSwaggerError';
  }
}

module.exports = EJSError;
