/* eslint-disable max-len */
const timeThat = require('timethat');

/**
 * @module wrapCallback
 */
/**
 * @class wrapCallback
 */

/**
 * Wrap a callback function to add timing and logging asyncronous calls
 * @method wrap
 * @param {Object}  [config]          Configuration for the logging and callback
 * @param {Object}  [config.context=null]  Context to run the callback function in (default: null)
 * @param {Object}  [config.logger=console]   Logging utility with a warn method (default: console)
 * @param {Number}  [config.maxTimeWarning=0]   Time in ms to determine if a call is too slow. Will not log if call is faster. Will always log if 0. (default: 0)
 * @param {Array|String}  [config.tag]    Value to show in [] before log message. (default: '')
 * @param {String}  [config.methodName]   Name of the method to display in the log (default: '')
 * @param {Function}  callback        Function to wrap
 * @returns {Function}   Wrapped Callback
 */
const wrapCallback = (config, callback) => {
  let cb = callback;
  let conf = config;

  if (!cb) {
    cb = conf;
    conf = {};
  }
  if (!cb || typeof cb !== 'function') {
    throw new Error('Callback not defined');
  }

  const start = new Date();
  const {
    context = null,
    logger = console,
    maxTimeWarning = 0,
    methodName,
  } = conf;
  const tag = Array.isArray(conf.tag) ? conf.tag.join(' ') : conf.tag;
  const useRelativeTime = conf.useRelativeTime === undefined ? true : conf.useRelativeTime;

  return (...args) => {
    const now = new Date();
    const isTooSlow = (now.getTime() - start.getTime() > maxTimeWarning);
    const message = [];

    if (tag) {
      message.push('[', tag, '] ');
    }

    message.push('Call ');

    if (methodName) {
      message.push('(', methodName, ') ');
    }

    message.push('took ');

    if (maxTimeWarning) {
      message.push('longer than ', maxTimeWarning / 1000, ' seconds - ');
    }

    if (useRelativeTime) {
      message.push(timeThat.calc(start, now));
    } else {
      message.push(`${(now.getTime() - start.getTime()) / 1000} seconds`);
    }

    if (!maxTimeWarning || (maxTimeWarning && isTooSlow)) {
      logger.warn(message.join(''));
    }

    cb.apply(context, args);
  };
};

module.exports = {
  wrap: wrapCallback,
};
