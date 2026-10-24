interface logger {
  warn: (...args: any[]) => void;
}

interface wrapCallbackConfig {
  context?: unknown;
  logger?: logger;
  maxTimeWarning?: number;
  useRelativeTime?: boolean;
  tag?: string[] | string;
  methodName?: string;
}

type callbackFn = (...args: any[]) => any;

const formatDuration = (milliseconds: number) => {
  const seconds = milliseconds / 1000;

  if (seconds < 1) {
    return `${Math.round(milliseconds)} milliseconds`;
  }

  if (seconds < 60) {
    return `${seconds.toFixed(2)} seconds`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return remainingSeconds ? `${minutes} minutes ${remainingSeconds} seconds` : `${minutes} minutes`;
};

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
const wrapCallback = (config: wrapCallbackConfig | callbackFn, callback?: callbackFn) => {
  let cb: callbackFn = typeof callback === "function" ? callback : (config as callbackFn);
  let conf: wrapCallbackConfig = typeof config !== "function" ? config : {};

  if (!cb || typeof cb !== "function") {
    throw new Error("Callback not defined");
  }

  const { context = null, logger = console, maxTimeWarning = 0, methodName } = conf;
  const tag = Array.isArray(conf.tag) ? conf.tag.join(" ") : conf.tag;
  const useRelativeTime = conf.useRelativeTime === undefined ? true : !!conf.useRelativeTime;

  return async (...args: any) => {
    const start = performance.now();
    const result = cb.apply(context, args);
    if (result instanceof Promise) {
      await result;
    }

    const elapsed = performance.now() - start;
    const isTooSlow = elapsed > maxTimeWarning;
    const message: string[] = [];

    if (tag) {
      message.push(`[${tag}] `);
    }

    message.push("Call ");

    if (methodName) {
      message.push(`(${methodName}) `);
    }

    message.push("took ");

    if (maxTimeWarning) {
      message.push(`longer than ${maxTimeWarning / 1000} seconds - `);
    }

    if (useRelativeTime) {
      message.push(formatDuration(elapsed));
    } else {
      message.push(`${elapsed / 1000} seconds`);
    }

    if (!maxTimeWarning || (maxTimeWarning && isTooSlow)) {
      logger.warn(message.join(""));
    }
  };
};

export const wrap = wrapCallback;
