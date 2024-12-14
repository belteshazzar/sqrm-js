var sqrm = (function () {
  'use strict';

  /**
   * Throw a given error.
   *
   * @param {Error|null|undefined} [error]
   *   Maybe error.
   * @returns {asserts error is null|undefined}
   */
  function bail(error) {
    if (error) {
      throw error
    }
  }

  function getDefaultExportFromCjs (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  var extend$1;
  var hasRequiredExtend;

  function requireExtend () {
  	if (hasRequiredExtend) return extend$1;
  	hasRequiredExtend = 1;

  	var hasOwn = Object.prototype.hasOwnProperty;
  	var toStr = Object.prototype.toString;
  	var defineProperty = Object.defineProperty;
  	var gOPD = Object.getOwnPropertyDescriptor;

  	var isArray = function isArray(arr) {
  		if (typeof Array.isArray === 'function') {
  			return Array.isArray(arr);
  		}

  		return toStr.call(arr) === '[object Array]';
  	};

  	var isPlainObject = function isPlainObject(obj) {
  		if (!obj || toStr.call(obj) !== '[object Object]') {
  			return false;
  		}

  		var hasOwnConstructor = hasOwn.call(obj, 'constructor');
  		var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
  		// Not own constructor property must be Object
  		if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
  			return false;
  		}

  		// Own properties are enumerated firstly, so to speed up,
  		// if last one is own, then all properties are own.
  		var key;
  		for (key in obj) { /**/ }

  		return typeof key === 'undefined' || hasOwn.call(obj, key);
  	};

  	// If name is '__proto__', and Object.defineProperty is available, define __proto__ as an own property on target
  	var setProperty = function setProperty(target, options) {
  		if (defineProperty && options.name === '__proto__') {
  			defineProperty(target, options.name, {
  				enumerable: true,
  				configurable: true,
  				value: options.newValue,
  				writable: true
  			});
  		} else {
  			target[options.name] = options.newValue;
  		}
  	};

  	// Return undefined instead of __proto__ if '__proto__' is not an own property
  	var getProperty = function getProperty(obj, name) {
  		if (name === '__proto__') {
  			if (!hasOwn.call(obj, name)) {
  				return void 0;
  			} else if (gOPD) {
  				// In early versions of node, obj['__proto__'] is buggy when obj has
  				// __proto__ as an own property. Object.getOwnPropertyDescriptor() works.
  				return gOPD(obj, name).value;
  			}
  		}

  		return obj[name];
  	};

  	extend$1 = function extend() {
  		var options, name, src, copy, copyIsArray, clone;
  		var target = arguments[0];
  		var i = 1;
  		var length = arguments.length;
  		var deep = false;

  		// Handle a deep copy situation
  		if (typeof target === 'boolean') {
  			deep = target;
  			target = arguments[1] || {};
  			// skip the boolean and the target
  			i = 2;
  		}
  		if (target == null || (typeof target !== 'object' && typeof target !== 'function')) {
  			target = {};
  		}

  		for (; i < length; ++i) {
  			options = arguments[i];
  			// Only deal with non-null/undefined values
  			if (options != null) {
  				// Extend the base object
  				for (name in options) {
  					src = getProperty(target, name);
  					copy = getProperty(options, name);

  					// Prevent never-ending loop
  					if (target !== copy) {
  						// Recurse if we're merging plain objects or arrays
  						if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
  							if (copyIsArray) {
  								copyIsArray = false;
  								clone = src && isArray(src) ? src : [];
  							} else {
  								clone = src && isPlainObject(src) ? src : {};
  							}

  							// Never move original objects, clone them
  							setProperty(target, { name: name, newValue: extend(deep, clone, copy) });

  						// Don't bring in undefined values
  						} else if (typeof copy !== 'undefined') {
  							setProperty(target, { name: name, newValue: copy });
  						}
  					}
  				}
  			}
  		}

  		// Return the modified object
  		return target;
  	};
  	return extend$1;
  }

  var extendExports = requireExtend();
  var extend = /*@__PURE__*/getDefaultExportFromCjs(extendExports);

  function isPlainObject(value) {
  	if (typeof value !== 'object' || value === null) {
  		return false;
  	}

  	const prototype = Object.getPrototypeOf(value);
  	return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
  }

  // To do: remove `void`s
  // To do: remove `null` from output of our APIs, allow it as user APIs.

  /**
   * @typedef {(error?: Error | null | undefined, ...output: Array<any>) => void} Callback
   *   Callback.
   *
   * @typedef {(...input: Array<any>) => any} Middleware
   *   Ware.
   *
   * @typedef Pipeline
   *   Pipeline.
   * @property {Run} run
   *   Run the pipeline.
   * @property {Use} use
   *   Add middleware.
   *
   * @typedef {(...input: Array<any>) => void} Run
   *   Call all middleware.
   *
   *   Calls `done` on completion with either an error or the output of the
   *   last middleware.
   *
   *   > 👉 **Note**: as the length of input defines whether async functions get a
   *   > `next` function,
   *   > it’s recommended to keep `input` at one value normally.

   *
   * @typedef {(fn: Middleware) => Pipeline} Use
   *   Add middleware.
   */

  /**
   * Create new middleware.
   *
   * @returns {Pipeline}
   *   Pipeline.
   */
  function trough() {
    /** @type {Array<Middleware>} */
    const fns = [];
    /** @type {Pipeline} */
    const pipeline = {run, use};

    return pipeline

    /** @type {Run} */
    function run(...values) {
      let middlewareIndex = -1;
      /** @type {Callback} */
      const callback = values.pop();

      if (typeof callback !== 'function') {
        throw new TypeError('Expected function as last argument, not ' + callback)
      }

      next(null, ...values);

      /**
       * Run the next `fn`, or we’re done.
       *
       * @param {Error | null | undefined} error
       * @param {Array<any>} output
       */
      function next(error, ...output) {
        const fn = fns[++middlewareIndex];
        let index = -1;

        if (error) {
          callback(error);
          return
        }

        // Copy non-nullish input into values.
        while (++index < values.length) {
          if (output[index] === null || output[index] === undefined) {
            output[index] = values[index];
          }
        }

        // Save the newly created `output` for the next call.
        values = output;

        // Next or done.
        if (fn) {
          wrap(fn, next)(...output);
        } else {
          callback(null, ...output);
        }
      }
    }

    /** @type {Use} */
    function use(middelware) {
      if (typeof middelware !== 'function') {
        throw new TypeError(
          'Expected `middelware` to be a function, not ' + middelware
        )
      }

      fns.push(middelware);
      return pipeline
    }
  }

  /**
   * Wrap `middleware` into a uniform interface.
   *
   * You can pass all input to the resulting function.
   * `callback` is then called with the output of `middleware`.
   *
   * If `middleware` accepts more arguments than the later given in input,
   * an extra `done` function is passed to it after that input,
   * which must be called by `middleware`.
   *
   * The first value in `input` is the main input value.
   * All other input values are the rest input values.
   * The values given to `callback` are the input values,
   * merged with every non-nullish output value.
   *
   * * if `middleware` throws an error,
   *   returns a promise that is rejected,
   *   or calls the given `done` function with an error,
   *   `callback` is called with that error
   * * if `middleware` returns a value or returns a promise that is resolved,
   *   that value is the main output value
   * * if `middleware` calls `done`,
   *   all non-nullish values except for the first one (the error) overwrite the
   *   output values
   *
   * @param {Middleware} middleware
   *   Function to wrap.
   * @param {Callback} callback
   *   Callback called with the output of `middleware`.
   * @returns {Run}
   *   Wrapped middleware.
   */
  function wrap(middleware, callback) {
    /** @type {boolean} */
    let called;

    return wrapped

    /**
     * Call `middleware`.
     * @this {any}
     * @param {Array<any>} parameters
     * @returns {void}
     */
    function wrapped(...parameters) {
      const fnExpectsCallback = middleware.length > parameters.length;
      /** @type {any} */
      let result;

      if (fnExpectsCallback) {
        parameters.push(done);
      }

      try {
        result = middleware.apply(this, parameters);
      } catch (error) {
        const exception = /** @type {Error} */ (error);

        // Well, this is quite the pickle.
        // `middleware` received a callback and called it synchronously, but that
        // threw an error.
        // The only thing left to do is to throw the thing instead.
        if (fnExpectsCallback && called) {
          throw exception
        }

        return done(exception)
      }

      if (!fnExpectsCallback) {
        if (result && result.then && typeof result.then === 'function') {
          result.then(then, done);
        } else if (result instanceof Error) {
          done(result);
        } else {
          then(result);
        }
      }
    }

    /**
     * Call `callback`, only once.
     *
     * @type {Callback}
     */
    function done(error, ...output) {
      if (!called) {
        called = true;
        callback(error, ...output);
      }
    }

    /**
     * Call `done` with one value.
     *
     * @param {any} [value]
     */
    function then(value) {
      done(null, value);
    }
  }

  /**
   * @typedef {import('unist').Node} Node
   * @typedef {import('unist').Point} Point
   * @typedef {import('unist').Position} Position
   */

  /**
   * @typedef NodeLike
   * @property {string} type
   * @property {PositionLike | null | undefined} [position]
   *
   * @typedef PointLike
   * @property {number | null | undefined} [line]
   * @property {number | null | undefined} [column]
   * @property {number | null | undefined} [offset]
   *
   * @typedef PositionLike
   * @property {PointLike | null | undefined} [start]
   * @property {PointLike | null | undefined} [end]
   */

  /**
   * Serialize the positional info of a point, position (start and end points),
   * or node.
   *
   * @param {Node | NodeLike | Point | PointLike | Position | PositionLike | null | undefined} [value]
   *   Node, position, or point.
   * @returns {string}
   *   Pretty printed positional info of a node (`string`).
   *
   *   In the format of a range `ls:cs-le:ce` (when given `node` or `position`)
   *   or a point `l:c` (when given `point`), where `l` stands for line, `c` for
   *   column, `s` for `start`, and `e` for end.
   *   An empty string (`''`) is returned if the given value is neither `node`,
   *   `position`, nor `point`.
   */
  function stringifyPosition(value) {
    // Nothing.
    if (!value || typeof value !== 'object') {
      return ''
    }

    // Node.
    if ('position' in value || 'type' in value) {
      return position(value.position)
    }

    // Position.
    if ('start' in value || 'end' in value) {
      return position(value)
    }

    // Point.
    if ('line' in value || 'column' in value) {
      return point(value)
    }

    // ?
    return ''
  }

  /**
   * @param {Point | PointLike | null | undefined} point
   * @returns {string}
   */
  function point(point) {
    return index(point && point.line) + ':' + index(point && point.column)
  }

  /**
   * @param {Position | PositionLike | null | undefined} pos
   * @returns {string}
   */
  function position(pos) {
    return point(pos && pos.start) + '-' + point(pos && pos.end)
  }

  /**
   * @param {number | null | undefined} value
   * @returns {number}
   */
  function index(value) {
    return value && typeof value === 'number' ? value : 1
  }

  /**
   * @typedef {import('unist').Node} Node
   * @typedef {import('unist').Point} Point
   * @typedef {import('unist').Position} Position
   */


  /**
   * Message.
   */
  class VFileMessage extends Error {
    /**
     * Create a message for `reason`.
     *
     * > 🪦 **Note**: also has obsolete signatures.
     *
     * @overload
     * @param {string} reason
     * @param {Options | null | undefined} [options]
     * @returns
     *
     * @overload
     * @param {string} reason
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns
     *
     * @overload
     * @param {string} reason
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns
     *
     * @overload
     * @param {string} reason
     * @param {string | null | undefined} [origin]
     * @returns
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {string | null | undefined} [origin]
     * @returns
     *
     * @param {Error | VFileMessage | string} causeOrReason
     *   Reason for message, should use markdown.
     * @param {Node | NodeLike | Options | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
     *   Configuration (optional).
     * @param {string | null | undefined} [origin]
     *   Place in code where the message originates (example:
     *   `'my-package:my-rule'` or `'my-rule'`).
     * @returns
     *   Instance of `VFileMessage`.
     */
    // eslint-disable-next-line complexity
    constructor(causeOrReason, optionsOrParentOrPlace, origin) {
      super();

      if (typeof optionsOrParentOrPlace === 'string') {
        origin = optionsOrParentOrPlace;
        optionsOrParentOrPlace = undefined;
      }

      /** @type {string} */
      let reason = '';
      /** @type {Options} */
      let options = {};
      let legacyCause = false;

      if (optionsOrParentOrPlace) {
        // Point.
        if (
          'line' in optionsOrParentOrPlace &&
          'column' in optionsOrParentOrPlace
        ) {
          options = {place: optionsOrParentOrPlace};
        }
        // Position.
        else if (
          'start' in optionsOrParentOrPlace &&
          'end' in optionsOrParentOrPlace
        ) {
          options = {place: optionsOrParentOrPlace};
        }
        // Node.
        else if ('type' in optionsOrParentOrPlace) {
          options = {
            ancestors: [optionsOrParentOrPlace],
            place: optionsOrParentOrPlace.position
          };
        }
        // Options.
        else {
          options = {...optionsOrParentOrPlace};
        }
      }

      if (typeof causeOrReason === 'string') {
        reason = causeOrReason;
      }
      // Error.
      else if (!options.cause && causeOrReason) {
        legacyCause = true;
        reason = causeOrReason.message;
        options.cause = causeOrReason;
      }

      if (!options.ruleId && !options.source && typeof origin === 'string') {
        const index = origin.indexOf(':');

        if (index === -1) {
          options.ruleId = origin;
        } else {
          options.source = origin.slice(0, index);
          options.ruleId = origin.slice(index + 1);
        }
      }

      if (!options.place && options.ancestors && options.ancestors) {
        const parent = options.ancestors[options.ancestors.length - 1];

        if (parent) {
          options.place = parent.position;
        }
      }

      const start =
        options.place && 'start' in options.place
          ? options.place.start
          : options.place;

      /* eslint-disable no-unused-expressions */
      /**
       * Stack of ancestor nodes surrounding the message.
       *
       * @type {Array<Node> | undefined}
       */
      this.ancestors = options.ancestors || undefined;

      /**
       * Original error cause of the message.
       *
       * @type {Error | undefined}
       */
      this.cause = options.cause || undefined;

      /**
       * Starting column of message.
       *
       * @type {number | undefined}
       */
      this.column = start ? start.column : undefined;

      /**
       * State of problem.
       *
       * * `true` — error, file not usable
       * * `false` — warning, change may be needed
       * * `undefined` — change likely not needed
       *
       * @type {boolean | null | undefined}
       */
      this.fatal = undefined;

      /**
       * Path of a file (used throughout the `VFile` ecosystem).
       *
       * @type {string | undefined}
       */
      this.file;

      // Field from `Error`.
      /**
       * Reason for message.
       *
       * @type {string}
       */
      this.message = reason;

      /**
       * Starting line of error.
       *
       * @type {number | undefined}
       */
      this.line = start ? start.line : undefined;

      // Field from `Error`.
      /**
       * Serialized positional info of message.
       *
       * On normal errors, this would be something like `ParseError`, buit in
       * `VFile` messages we use this space to show where an error happened.
       */
      this.name = stringifyPosition(options.place) || '1:1';

      /**
       * Place of message.
       *
       * @type {Point | Position | undefined}
       */
      this.place = options.place || undefined;

      /**
       * Reason for message, should use markdown.
       *
       * @type {string}
       */
      this.reason = this.message;

      /**
       * Category of message (example: `'my-rule'`).
       *
       * @type {string | undefined}
       */
      this.ruleId = options.ruleId || undefined;

      /**
       * Namespace of message (example: `'my-package'`).
       *
       * @type {string | undefined}
       */
      this.source = options.source || undefined;

      // Field from `Error`.
      /**
       * Stack of message.
       *
       * This is used by normal errors to show where something happened in
       * programming code, irrelevant for `VFile` messages,
       *
       * @type {string}
       */
      this.stack =
        legacyCause && options.cause && typeof options.cause.stack === 'string'
          ? options.cause.stack
          : '';

      // The following fields are “well known”.
      // Not standard.
      // Feel free to add other non-standard fields to your messages.

      /**
       * Specify the source value that’s being reported, which is deemed
       * incorrect.
       *
       * @type {string | undefined}
       */
      this.actual;

      /**
       * Suggest acceptable values that can be used instead of `actual`.
       *
       * @type {Array<string> | undefined}
       */
      this.expected;

      /**
       * Long form description of the message (you should use markdown).
       *
       * @type {string | undefined}
       */
      this.note;

      /**
       * Link to docs for the message.
       *
       * > 👉 **Note**: this must be an absolute URL that can be passed as `x`
       * > to `new URL(x)`.
       *
       * @type {string | undefined}
       */
      this.url;
      /* eslint-enable no-unused-expressions */
    }
  }

  VFileMessage.prototype.file = '';
  VFileMessage.prototype.name = '';
  VFileMessage.prototype.reason = '';
  VFileMessage.prototype.message = '';
  VFileMessage.prototype.stack = '';
  VFileMessage.prototype.column = undefined;
  VFileMessage.prototype.line = undefined;
  VFileMessage.prototype.ancestors = undefined;
  VFileMessage.prototype.cause = undefined;
  VFileMessage.prototype.fatal = undefined;
  VFileMessage.prototype.place = undefined;
  VFileMessage.prototype.ruleId = undefined;
  VFileMessage.prototype.source = undefined;

  // A derivative work based on:
  // <https://github.com/browserify/path-browserify>.
  // Which is licensed:
  //
  // MIT License
  //
  // Copyright (c) 2013 James Halliday
  //
  // Permission is hereby granted, free of charge, to any person obtaining a copy of
  // this software and associated documentation files (the "Software"), to deal in
  // the Software without restriction, including without limitation the rights to
  // use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
  // the Software, and to permit persons to whom the Software is furnished to do so,
  // subject to the following conditions:
  //
  // The above copyright notice and this permission notice shall be included in all
  // copies or substantial portions of the Software.
  //
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  // IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
  // FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
  // COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
  // IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  // CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
  // A derivative work based on:
  //
  // Parts of that are extracted from Node’s internal `path` module:
  // <https://github.com/nodejs/node/blob/master/lib/path.js>.
  // Which is licensed:
  //
  // Copyright Joyent, Inc. and other Node contributors.
  //
  // Permission is hereby granted, free of charge, to any person obtaining a
  // copy of this software and associated documentation files (the
  // "Software"), to deal in the Software without restriction, including
  // without limitation the rights to use, copy, modify, merge, publish,
  // distribute, sublicense, and/or sell copies of the Software, and to permit
  // persons to whom the Software is furnished to do so, subject to the
  // following conditions:
  //
  // The above copyright notice and this permission notice shall be included
  // in all copies or substantial portions of the Software.
  //
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
  // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
  // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
  // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
  // USE OR OTHER DEALINGS IN THE SOFTWARE.

  const minpath = {basename, dirname, extname, join, sep: '/'};

  /* eslint-disable max-depth, complexity */

  /**
   * Get the basename from a path.
   *
   * @param {string} path
   *   File path.
   * @param {string | null | undefined} [extname]
   *   Extension to strip.
   * @returns {string}
   *   Stem or basename.
   */
  function basename(path, extname) {
    if (extname !== undefined && typeof extname !== 'string') {
      throw new TypeError('"ext" argument must be a string')
    }

    assertPath$1(path);
    let start = 0;
    let end = -1;
    let index = path.length;
    /** @type {boolean | undefined} */
    let seenNonSlash;

    if (
      extname === undefined ||
      extname.length === 0 ||
      extname.length > path.length
    ) {
      while (index--) {
        if (path.codePointAt(index) === 47 /* `/` */) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now.
          if (seenNonSlash) {
            start = index + 1;
            break
          }
        } else if (end < 0) {
          // We saw the first non-path separator, mark this as the end of our
          // path component.
          seenNonSlash = true;
          end = index + 1;
        }
      }

      return end < 0 ? '' : path.slice(start, end)
    }

    if (extname === path) {
      return ''
    }

    let firstNonSlashEnd = -1;
    let extnameIndex = extname.length - 1;

    while (index--) {
      if (path.codePointAt(index) === 47 /* `/` */) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now.
        if (seenNonSlash) {
          start = index + 1;
          break
        }
      } else {
        if (firstNonSlashEnd < 0) {
          // We saw the first non-path separator, remember this index in case
          // we need it if the extension ends up not matching.
          seenNonSlash = true;
          firstNonSlashEnd = index + 1;
        }

        if (extnameIndex > -1) {
          // Try to match the explicit extension.
          if (path.codePointAt(index) === extname.codePointAt(extnameIndex--)) {
            if (extnameIndex < 0) {
              // We matched the extension, so mark this as the end of our path
              // component
              end = index;
            }
          } else {
            // Extension does not match, so our result is the entire path
            // component
            extnameIndex = -1;
            end = firstNonSlashEnd;
          }
        }
      }
    }

    if (start === end) {
      end = firstNonSlashEnd;
    } else if (end < 0) {
      end = path.length;
    }

    return path.slice(start, end)
  }

  /**
   * Get the dirname from a path.
   *
   * @param {string} path
   *   File path.
   * @returns {string}
   *   File path.
   */
  function dirname(path) {
    assertPath$1(path);

    if (path.length === 0) {
      return '.'
    }

    let end = -1;
    let index = path.length;
    /** @type {boolean | undefined} */
    let unmatchedSlash;

    // Prefix `--` is important to not run on `0`.
    while (--index) {
      if (path.codePointAt(index) === 47 /* `/` */) {
        if (unmatchedSlash) {
          end = index;
          break
        }
      } else if (!unmatchedSlash) {
        // We saw the first non-path separator
        unmatchedSlash = true;
      }
    }

    return end < 0
      ? path.codePointAt(0) === 47 /* `/` */
        ? '/'
        : '.'
      : end === 1 && path.codePointAt(0) === 47 /* `/` */
        ? '//'
        : path.slice(0, end)
  }

  /**
   * Get an extname from a path.
   *
   * @param {string} path
   *   File path.
   * @returns {string}
   *   Extname.
   */
  function extname(path) {
    assertPath$1(path);

    let index = path.length;

    let end = -1;
    let startPart = 0;
    let startDot = -1;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find.
    let preDotState = 0;
    /** @type {boolean | undefined} */
    let unmatchedSlash;

    while (index--) {
      const code = path.codePointAt(index);

      if (code === 47 /* `/` */) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now.
        if (unmatchedSlash) {
          startPart = index + 1;
          break
        }

        continue
      }

      if (end < 0) {
        // We saw the first non-path separator, mark this as the end of our
        // extension.
        unmatchedSlash = true;
        end = index + 1;
      }

      if (code === 46 /* `.` */) {
        // If this is our first dot, mark it as the start of our extension.
        if (startDot < 0) {
          startDot = index;
        } else if (preDotState !== 1) {
          preDotState = 1;
        }
      } else if (startDot > -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension.
        preDotState = -1;
      }
    }

    if (
      startDot < 0 ||
      end < 0 ||
      // We saw a non-dot character immediately before the dot.
      preDotState === 0 ||
      // The (right-most) trimmed path component is exactly `..`.
      (preDotState === 1 && startDot === end - 1 && startDot === startPart + 1)
    ) {
      return ''
    }

    return path.slice(startDot, end)
  }

  /**
   * Join segments from a path.
   *
   * @param {Array<string>} segments
   *   Path segments.
   * @returns {string}
   *   File path.
   */
  function join(...segments) {
    let index = -1;
    /** @type {string | undefined} */
    let joined;

    while (++index < segments.length) {
      assertPath$1(segments[index]);

      if (segments[index]) {
        joined =
          joined === undefined ? segments[index] : joined + '/' + segments[index];
      }
    }

    return joined === undefined ? '.' : normalize$1(joined)
  }

  /**
   * Normalize a basic file path.
   *
   * @param {string} path
   *   File path.
   * @returns {string}
   *   File path.
   */
  // Note: `normalize` is not exposed as `path.normalize`, so some code is
  // manually removed from it.
  function normalize$1(path) {
    assertPath$1(path);

    const absolute = path.codePointAt(0) === 47; /* `/` */

    // Normalize the path according to POSIX rules.
    let value = normalizeString(path, !absolute);

    if (value.length === 0 && !absolute) {
      value = '.';
    }

    if (value.length > 0 && path.codePointAt(path.length - 1) === 47 /* / */) {
      value += '/';
    }

    return absolute ? '/' + value : value
  }

  /**
   * Resolve `.` and `..` elements in a path with directory names.
   *
   * @param {string} path
   *   File path.
   * @param {boolean} allowAboveRoot
   *   Whether `..` can move above root.
   * @returns {string}
   *   File path.
   */
  function normalizeString(path, allowAboveRoot) {
    let result = '';
    let lastSegmentLength = 0;
    let lastSlash = -1;
    let dots = 0;
    let index = -1;
    /** @type {number | undefined} */
    let code;
    /** @type {number} */
    let lastSlashIndex;

    while (++index <= path.length) {
      if (index < path.length) {
        code = path.codePointAt(index);
      } else if (code === 47 /* `/` */) {
        break
      } else {
        code = 47; /* `/` */
      }

      if (code === 47 /* `/` */) {
        if (lastSlash === index - 1 || dots === 1) ; else if (lastSlash !== index - 1 && dots === 2) {
          if (
            result.length < 2 ||
            lastSegmentLength !== 2 ||
            result.codePointAt(result.length - 1) !== 46 /* `.` */ ||
            result.codePointAt(result.length - 2) !== 46 /* `.` */
          ) {
            if (result.length > 2) {
              lastSlashIndex = result.lastIndexOf('/');

              if (lastSlashIndex !== result.length - 1) {
                if (lastSlashIndex < 0) {
                  result = '';
                  lastSegmentLength = 0;
                } else {
                  result = result.slice(0, lastSlashIndex);
                  lastSegmentLength = result.length - 1 - result.lastIndexOf('/');
                }

                lastSlash = index;
                dots = 0;
                continue
              }
            } else if (result.length > 0) {
              result = '';
              lastSegmentLength = 0;
              lastSlash = index;
              dots = 0;
              continue
            }
          }

          if (allowAboveRoot) {
            result = result.length > 0 ? result + '/..' : '..';
            lastSegmentLength = 2;
          }
        } else {
          if (result.length > 0) {
            result += '/' + path.slice(lastSlash + 1, index);
          } else {
            result = path.slice(lastSlash + 1, index);
          }

          lastSegmentLength = index - lastSlash - 1;
        }

        lastSlash = index;
        dots = 0;
      } else if (code === 46 /* `.` */ && dots > -1) {
        dots++;
      } else {
        dots = -1;
      }
    }

    return result
  }

  /**
   * Make sure `path` is a string.
   *
   * @param {string} path
   *   File path.
   * @returns {asserts path is string}
   *   Nothing.
   */
  function assertPath$1(path) {
    if (typeof path !== 'string') {
      throw new TypeError(
        'Path must be a string. Received ' + JSON.stringify(path)
      )
    }
  }

  /* eslint-enable max-depth, complexity */

  // Somewhat based on:
  // <https://github.com/defunctzombie/node-process/blob/master/browser.js>.
  // But I don’t think one tiny line of code can be copyrighted. 😅
  const minproc = {cwd};

  function cwd() {
    return '/'
  }

  /**
   * Checks if a value has the shape of a WHATWG URL object.
   *
   * Using a symbol or instanceof would not be able to recognize URL objects
   * coming from other implementations (e.g. in Electron), so instead we are
   * checking some well known properties for a lack of a better test.
   *
   * We use `href` and `protocol` as they are the only properties that are
   * easy to retrieve and calculate due to the lazy nature of the getters.
   *
   * We check for auth attribute to distinguish legacy url instance with
   * WHATWG URL instance.
   *
   * @param {unknown} fileUrlOrPath
   *   File path or URL.
   * @returns {fileUrlOrPath is URL}
   *   Whether it’s a URL.
   */
  // From: <https://github.com/nodejs/node/blob/6a3403c/lib/internal/url.js#L720>
  function isUrl(fileUrlOrPath) {
    return Boolean(
      fileUrlOrPath !== null &&
        typeof fileUrlOrPath === 'object' &&
        'href' in fileUrlOrPath &&
        fileUrlOrPath.href &&
        'protocol' in fileUrlOrPath &&
        fileUrlOrPath.protocol &&
        // @ts-expect-error: indexing is fine.
        fileUrlOrPath.auth === undefined
    )
  }

  // See: <https://github.com/nodejs/node/blob/6a3403c/lib/internal/url.js>

  /**
   * @param {URL | string} path
   *   File URL.
   * @returns {string}
   *   File URL.
   */
  function urlToPath(path) {
    if (typeof path === 'string') {
      path = new URL(path);
    } else if (!isUrl(path)) {
      /** @type {NodeJS.ErrnoException} */
      const error = new TypeError(
        'The "path" argument must be of type string or an instance of URL. Received `' +
          path +
          '`'
      );
      error.code = 'ERR_INVALID_ARG_TYPE';
      throw error
    }

    if (path.protocol !== 'file:') {
      /** @type {NodeJS.ErrnoException} */
      const error = new TypeError('The URL must be of scheme file');
      error.code = 'ERR_INVALID_URL_SCHEME';
      throw error
    }

    return getPathFromURLPosix(path)
  }

  /**
   * Get a path from a POSIX URL.
   *
   * @param {URL} url
   *   URL.
   * @returns {string}
   *   File path.
   */
  function getPathFromURLPosix(url) {
    if (url.hostname !== '') {
      /** @type {NodeJS.ErrnoException} */
      const error = new TypeError(
        'File URL host must be "localhost" or empty on darwin'
      );
      error.code = 'ERR_INVALID_FILE_URL_HOST';
      throw error
    }

    const pathname = url.pathname;
    let index = -1;

    while (++index < pathname.length) {
      if (
        pathname.codePointAt(index) === 37 /* `%` */ &&
        pathname.codePointAt(index + 1) === 50 /* `2` */
      ) {
        const third = pathname.codePointAt(index + 2);
        if (third === 70 /* `F` */ || third === 102 /* `f` */) {
          /** @type {NodeJS.ErrnoException} */
          const error = new TypeError(
            'File URL path must not include encoded / characters'
          );
          error.code = 'ERR_INVALID_FILE_URL_PATH';
          throw error
        }
      }
    }

    return decodeURIComponent(pathname)
  }

  /**
   * @import {Node, Point, Position} from 'unist'
   * @import {Options as MessageOptions} from 'vfile-message'
   * @import {Compatible, Data, Map, Options, Value} from 'vfile'
   */


  /**
   * Order of setting (least specific to most), we need this because otherwise
   * `{stem: 'a', path: '~/b.js'}` would throw, as a path is needed before a
   * stem can be set.
   */
  const order = /** @type {const} */ ([
    'history',
    'path',
    'basename',
    'stem',
    'extname',
    'dirname'
  ]);

  class VFile {
    /**
     * Create a new virtual file.
     *
     * `options` is treated as:
     *
     * *   `string` or `Uint8Array` — `{value: options}`
     * *   `URL` — `{path: options}`
     * *   `VFile` — shallow copies its data over to the new file
     * *   `object` — all fields are shallow copied over to the new file
     *
     * Path related fields are set in the following order (least specific to
     * most specific): `history`, `path`, `basename`, `stem`, `extname`,
     * `dirname`.
     *
     * You cannot set `dirname` or `extname` without setting either `history`,
     * `path`, `basename`, or `stem` too.
     *
     * @param {Compatible | null | undefined} [value]
     *   File value.
     * @returns
     *   New instance.
     */
    constructor(value) {
      /** @type {Options | VFile} */
      let options;

      if (!value) {
        options = {};
      } else if (isUrl(value)) {
        options = {path: value};
      } else if (typeof value === 'string' || isUint8Array$1(value)) {
        options = {value};
      } else {
        options = value;
      }

      /* eslint-disable no-unused-expressions */

      /**
       * Base of `path` (default: `process.cwd()` or `'/'` in browsers).
       *
       * @type {string}
       */
      // Prevent calling `cwd` (which could be expensive) if it’s not needed;
      // the empty string will be overridden in the next block.
      this.cwd = 'cwd' in options ? '' : minproc.cwd();

      /**
       * Place to store custom info (default: `{}`).
       *
       * It’s OK to store custom data directly on the file but moving it to
       * `data` is recommended.
       *
       * @type {Data}
       */
      this.data = {};

      /**
       * List of file paths the file moved between.
       *
       * The first is the original path and the last is the current path.
       *
       * @type {Array<string>}
       */
      this.history = [];

      /**
       * List of messages associated with the file.
       *
       * @type {Array<VFileMessage>}
       */
      this.messages = [];

      /**
       * Raw value.
       *
       * @type {Value}
       */
      this.value;

      // The below are non-standard, they are “well-known”.
      // As in, used in several tools.
      /**
       * Source map.
       *
       * This type is equivalent to the `RawSourceMap` type from the `source-map`
       * module.
       *
       * @type {Map | null | undefined}
       */
      this.map;

      /**
       * Custom, non-string, compiled, representation.
       *
       * This is used by unified to store non-string results.
       * One example is when turning markdown into React nodes.
       *
       * @type {unknown}
       */
      this.result;

      /**
       * Whether a file was saved to disk.
       *
       * This is used by vfile reporters.
       *
       * @type {boolean}
       */
      this.stored;
      /* eslint-enable no-unused-expressions */

      // Set path related properties in the correct order.
      let index = -1;

      while (++index < order.length) {
        const field = order[index];

        // Note: we specifically use `in` instead of `hasOwnProperty` to accept
        // `vfile`s too.
        if (
          field in options &&
          options[field] !== undefined &&
          options[field] !== null
        ) {
          // @ts-expect-error: TS doesn’t understand basic reality.
          this[field] = field === 'history' ? [...options[field]] : options[field];
        }
      }

      /** @type {string} */
      let field;

      // Set non-path related properties.
      for (field in options) {
        // @ts-expect-error: fine to set other things.
        if (!order.includes(field)) {
          // @ts-expect-error: fine to set other things.
          this[field] = options[field];
        }
      }
    }

    /**
     * Get the basename (including extname) (example: `'index.min.js'`).
     *
     * @returns {string | undefined}
     *   Basename.
     */
    get basename() {
      return typeof this.path === 'string'
        ? minpath.basename(this.path)
        : undefined
    }

    /**
     * Set basename (including extname) (`'index.min.js'`).
     *
     * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
     * on windows).
     * Cannot be nullified (use `file.path = file.dirname` instead).
     *
     * @param {string} basename
     *   Basename.
     * @returns {undefined}
     *   Nothing.
     */
    set basename(basename) {
      assertNonEmpty(basename, 'basename');
      assertPart(basename, 'basename');
      this.path = minpath.join(this.dirname || '', basename);
    }

    /**
     * Get the parent path (example: `'~'`).
     *
     * @returns {string | undefined}
     *   Dirname.
     */
    get dirname() {
      return typeof this.path === 'string'
        ? minpath.dirname(this.path)
        : undefined
    }

    /**
     * Set the parent path (example: `'~'`).
     *
     * Cannot be set if there’s no `path` yet.
     *
     * @param {string | undefined} dirname
     *   Dirname.
     * @returns {undefined}
     *   Nothing.
     */
    set dirname(dirname) {
      assertPath(this.basename, 'dirname');
      this.path = minpath.join(dirname || '', this.basename);
    }

    /**
     * Get the extname (including dot) (example: `'.js'`).
     *
     * @returns {string | undefined}
     *   Extname.
     */
    get extname() {
      return typeof this.path === 'string'
        ? minpath.extname(this.path)
        : undefined
    }

    /**
     * Set the extname (including dot) (example: `'.js'`).
     *
     * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
     * on windows).
     * Cannot be set if there’s no `path` yet.
     *
     * @param {string | undefined} extname
     *   Extname.
     * @returns {undefined}
     *   Nothing.
     */
    set extname(extname) {
      assertPart(extname, 'extname');
      assertPath(this.dirname, 'extname');

      if (extname) {
        if (extname.codePointAt(0) !== 46 /* `.` */) {
          throw new Error('`extname` must start with `.`')
        }

        if (extname.includes('.', 1)) {
          throw new Error('`extname` cannot contain multiple dots')
        }
      }

      this.path = minpath.join(this.dirname, this.stem + (extname || ''));
    }

    /**
     * Get the full path (example: `'~/index.min.js'`).
     *
     * @returns {string}
     *   Path.
     */
    get path() {
      return this.history[this.history.length - 1]
    }

    /**
     * Set the full path (example: `'~/index.min.js'`).
     *
     * Cannot be nullified.
     * You can set a file URL (a `URL` object with a `file:` protocol) which will
     * be turned into a path with `url.fileURLToPath`.
     *
     * @param {URL | string} path
     *   Path.
     * @returns {undefined}
     *   Nothing.
     */
    set path(path) {
      if (isUrl(path)) {
        path = urlToPath(path);
      }

      assertNonEmpty(path, 'path');

      if (this.path !== path) {
        this.history.push(path);
      }
    }

    /**
     * Get the stem (basename w/o extname) (example: `'index.min'`).
     *
     * @returns {string | undefined}
     *   Stem.
     */
    get stem() {
      return typeof this.path === 'string'
        ? minpath.basename(this.path, this.extname)
        : undefined
    }

    /**
     * Set the stem (basename w/o extname) (example: `'index.min'`).
     *
     * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
     * on windows).
     * Cannot be nullified (use `file.path = file.dirname` instead).
     *
     * @param {string} stem
     *   Stem.
     * @returns {undefined}
     *   Nothing.
     */
    set stem(stem) {
      assertNonEmpty(stem, 'stem');
      assertPart(stem, 'stem');
      this.path = minpath.join(this.dirname || '', stem + (this.extname || ''));
    }

    // Normal prototypal methods.
    /**
     * Create a fatal message for `reason` associated with the file.
     *
     * The `fatal` field of the message is set to `true` (error; file not usable)
     * and the `file` field is set to the current file path.
     * The message is added to the `messages` field on `file`.
     *
     * > 🪦 **Note**: also has obsolete signatures.
     *
     * @overload
     * @param {string} reason
     * @param {MessageOptions | null | undefined} [options]
     * @returns {never}
     *
     * @overload
     * @param {string} reason
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {string} reason
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {string} reason
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @param {Error | VFileMessage | string} causeOrReason
     *   Reason for message, should use markdown.
     * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
     *   Configuration (optional).
     * @param {string | null | undefined} [origin]
     *   Place in code where the message originates (example:
     *   `'my-package:my-rule'` or `'my-rule'`).
     * @returns {never}
     *   Never.
     * @throws {VFileMessage}
     *   Message.
     */
    fail(causeOrReason, optionsOrParentOrPlace, origin) {
      // @ts-expect-error: the overloads are fine.
      const message = this.message(causeOrReason, optionsOrParentOrPlace, origin);

      message.fatal = true;

      throw message
    }

    /**
     * Create an info message for `reason` associated with the file.
     *
     * The `fatal` field of the message is set to `undefined` (info; change
     * likely not needed) and the `file` field is set to the current file path.
     * The message is added to the `messages` field on `file`.
     *
     * > 🪦 **Note**: also has obsolete signatures.
     *
     * @overload
     * @param {string} reason
     * @param {MessageOptions | null | undefined} [options]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @param {Error | VFileMessage | string} causeOrReason
     *   Reason for message, should use markdown.
     * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
     *   Configuration (optional).
     * @param {string | null | undefined} [origin]
     *   Place in code where the message originates (example:
     *   `'my-package:my-rule'` or `'my-rule'`).
     * @returns {VFileMessage}
     *   Message.
     */
    info(causeOrReason, optionsOrParentOrPlace, origin) {
      // @ts-expect-error: the overloads are fine.
      const message = this.message(causeOrReason, optionsOrParentOrPlace, origin);

      message.fatal = undefined;

      return message
    }

    /**
     * Create a message for `reason` associated with the file.
     *
     * The `fatal` field of the message is set to `false` (warning; change may be
     * needed) and the `file` field is set to the current file path.
     * The message is added to the `messages` field on `file`.
     *
     * > 🪦 **Note**: also has obsolete signatures.
     *
     * @overload
     * @param {string} reason
     * @param {MessageOptions | null | undefined} [options]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @param {Error | VFileMessage | string} causeOrReason
     *   Reason for message, should use markdown.
     * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
     *   Configuration (optional).
     * @param {string | null | undefined} [origin]
     *   Place in code where the message originates (example:
     *   `'my-package:my-rule'` or `'my-rule'`).
     * @returns {VFileMessage}
     *   Message.
     */
    message(causeOrReason, optionsOrParentOrPlace, origin) {
      const message = new VFileMessage(
        // @ts-expect-error: the overloads are fine.
        causeOrReason,
        optionsOrParentOrPlace,
        origin
      );

      if (this.path) {
        message.name = this.path + ':' + message.name;
        message.file = this.path;
      }

      message.fatal = false;

      this.messages.push(message);

      return message
    }

    /**
     * Serialize the file.
     *
     * > **Note**: which encodings are supported depends on the engine.
     * > For info on Node.js, see:
     * > <https://nodejs.org/api/util.html#whatwg-supported-encodings>.
     *
     * @param {string | null | undefined} [encoding='utf8']
     *   Character encoding to understand `value` as when it’s a `Uint8Array`
     *   (default: `'utf-8'`).
     * @returns {string}
     *   Serialized file.
     */
    toString(encoding) {
      if (this.value === undefined) {
        return ''
      }

      if (typeof this.value === 'string') {
        return this.value
      }

      const decoder = new TextDecoder(encoding || undefined);
      return decoder.decode(this.value)
    }
  }

  /**
   * Assert that `part` is not a path (as in, does not contain `path.sep`).
   *
   * @param {string | null | undefined} part
   *   File path part.
   * @param {string} name
   *   Part name.
   * @returns {undefined}
   *   Nothing.
   */
  function assertPart(part, name) {
    if (part && part.includes(minpath.sep)) {
      throw new Error(
        '`' + name + '` cannot be a path: did not expect `' + minpath.sep + '`'
      )
    }
  }

  /**
   * Assert that `part` is not empty.
   *
   * @param {string | undefined} part
   *   Thing.
   * @param {string} name
   *   Part name.
   * @returns {asserts part is string}
   *   Nothing.
   */
  function assertNonEmpty(part, name) {
    if (!part) {
      throw new Error('`' + name + '` cannot be empty')
    }
  }

  /**
   * Assert `path` exists.
   *
   * @param {string | undefined} path
   *   Path.
   * @param {string} name
   *   Dependency name.
   * @returns {asserts path is string}
   *   Nothing.
   */
  function assertPath(path, name) {
    if (!path) {
      throw new Error('Setting `' + name + '` requires `path` to be set too')
    }
  }

  /**
   * Assert `value` is an `Uint8Array`.
   *
   * @param {unknown} value
   *   thing.
   * @returns {value is Uint8Array}
   *   Whether `value` is an `Uint8Array`.
   */
  function isUint8Array$1(value) {
    return Boolean(
      value &&
        typeof value === 'object' &&
        'byteLength' in value &&
        'byteOffset' in value
    )
  }

  const CallableInstance =
    /**
     * @type {new <Parameters extends Array<unknown>, Result>(property: string | symbol) => (...parameters: Parameters) => Result}
     */
    (
      /** @type {unknown} */
      (
        /**
         * @this {Function}
         * @param {string | symbol} property
         * @returns {(...parameters: Array<unknown>) => unknown}
         */
        function (property) {
          const self = this;
          const constr = self.constructor;
          const proto = /** @type {Record<string | symbol, Function>} */ (
            // Prototypes do exist.
            // type-coverage:ignore-next-line
            constr.prototype
          );
          const value = proto[property];
          /** @type {(...parameters: Array<unknown>) => unknown} */
          const apply = function () {
            return value.apply(apply, arguments)
          };

          Object.setPrototypeOf(apply, proto);

          // Not needed for us in `unified`: we only call this on the `copy`
          // function,
          // and we don't need to add its fields (`length`, `name`)
          // over.
          // See also: GH-246.
          // const names = Object.getOwnPropertyNames(value)
          //
          // for (const p of names) {
          //   const descriptor = Object.getOwnPropertyDescriptor(value, p)
          //   if (descriptor) Object.defineProperty(apply, p, descriptor)
          // }

          return apply
        }
      )
    );

  /**
   * @typedef {import('trough').Pipeline} Pipeline
   *
   * @typedef {import('unist').Node} Node
   *
   * @typedef {import('vfile').Compatible} Compatible
   * @typedef {import('vfile').Value} Value
   *
   * @typedef {import('../index.js').CompileResultMap} CompileResultMap
   * @typedef {import('../index.js').Data} Data
   * @typedef {import('../index.js').Settings} Settings
   */


  // To do: next major: drop `Compiler`, `Parser`: prefer lowercase.

  // To do: we could start yielding `never` in TS when a parser is missing and
  // `parse` is called.
  // Currently, we allow directly setting `processor.parser`, which is untyped.

  const own$6 = {}.hasOwnProperty;

  /**
   * @template {Node | undefined} [ParseTree=undefined]
   *   Output of `parse` (optional).
   * @template {Node | undefined} [HeadTree=undefined]
   *   Input for `run` (optional).
   * @template {Node | undefined} [TailTree=undefined]
   *   Output for `run` (optional).
   * @template {Node | undefined} [CompileTree=undefined]
   *   Input of `stringify` (optional).
   * @template {CompileResults | undefined} [CompileResult=undefined]
   *   Output of `stringify` (optional).
   * @extends {CallableInstance<[], Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>>}
   */
  class Processor extends CallableInstance {
    /**
     * Create a processor.
     */
    constructor() {
      // If `Processor()` is called (w/o new), `copy` is called instead.
      super('copy');

      /**
       * Compiler to use (deprecated).
       *
       * @deprecated
       *   Use `compiler` instead.
       * @type {(
       *   Compiler<
       *     CompileTree extends undefined ? Node : CompileTree,
       *     CompileResult extends undefined ? CompileResults : CompileResult
       *   > |
       *   undefined
       * )}
       */
      this.Compiler = undefined;

      /**
       * Parser to use (deprecated).
       *
       * @deprecated
       *   Use `parser` instead.
       * @type {(
       *   Parser<ParseTree extends undefined ? Node : ParseTree> |
       *   undefined
       * )}
       */
      this.Parser = undefined;

      // Note: the following fields are considered private.
      // However, they are needed for tests, and TSC generates an untyped
      // `private freezeIndex` field for, which trips `type-coverage` up.
      // Instead, we use `@deprecated` to visualize that they shouldn’t be used.
      /**
       * Internal list of configured plugins.
       *
       * @deprecated
       *   This is a private internal property and should not be used.
       * @type {Array<PluginTuple<Array<unknown>>>}
       */
      this.attachers = [];

      /**
       * Compiler to use.
       *
       * @type {(
       *   Compiler<
       *     CompileTree extends undefined ? Node : CompileTree,
       *     CompileResult extends undefined ? CompileResults : CompileResult
       *   > |
       *   undefined
       * )}
       */
      this.compiler = undefined;

      /**
       * Internal state to track where we are while freezing.
       *
       * @deprecated
       *   This is a private internal property and should not be used.
       * @type {number}
       */
      this.freezeIndex = -1;

      /**
       * Internal state to track whether we’re frozen.
       *
       * @deprecated
       *   This is a private internal property and should not be used.
       * @type {boolean | undefined}
       */
      this.frozen = undefined;

      /**
       * Internal state.
       *
       * @deprecated
       *   This is a private internal property and should not be used.
       * @type {Data}
       */
      this.namespace = {};

      /**
       * Parser to use.
       *
       * @type {(
       *   Parser<ParseTree extends undefined ? Node : ParseTree> |
       *   undefined
       * )}
       */
      this.parser = undefined;

      /**
       * Internal list of configured transformers.
       *
       * @deprecated
       *   This is a private internal property and should not be used.
       * @type {Pipeline}
       */
      this.transformers = trough();
    }

    /**
     * Copy a processor.
     *
     * @deprecated
     *   This is a private internal method and should not be used.
     * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
     *   New *unfrozen* processor ({@linkcode Processor}) that is
     *   configured to work the same as its ancestor.
     *   When the descendant processor is configured in the future it does not
     *   affect the ancestral processor.
     */
    copy() {
      // Cast as the type parameters will be the same after attaching.
      const destination =
        /** @type {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>} */ (
          new Processor()
        );
      let index = -1;

      while (++index < this.attachers.length) {
        const attacher = this.attachers[index];
        destination.use(...attacher);
      }

      destination.data(extend(true, {}, this.namespace));

      return destination
    }

    /**
     * Configure the processor with info available to all plugins.
     * Information is stored in an object.
     *
     * Typically, options can be given to a specific plugin, but sometimes it
     * makes sense to have information shared with several plugins.
     * For example, a list of HTML elements that are self-closing, which is
     * needed during all phases.
     *
     * > **Note**: setting information cannot occur on *frozen* processors.
     * > Call the processor first to create a new unfrozen processor.
     *
     * > **Note**: to register custom data in TypeScript, augment the
     * > {@linkcode Data} interface.
     *
     * @example
     *   This example show how to get and set info:
     *
     *   ```js
     *   import {unified} from 'unified'
     *
     *   const processor = unified().data('alpha', 'bravo')
     *
     *   processor.data('alpha') // => 'bravo'
     *
     *   processor.data() // => {alpha: 'bravo'}
     *
     *   processor.data({charlie: 'delta'})
     *
     *   processor.data() // => {charlie: 'delta'}
     *   ```
     *
     * @template {keyof Data} Key
     *
     * @overload
     * @returns {Data}
     *
     * @overload
     * @param {Data} dataset
     * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
     *
     * @overload
     * @param {Key} key
     * @returns {Data[Key]}
     *
     * @overload
     * @param {Key} key
     * @param {Data[Key]} value
     * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
     *
     * @param {Data | Key} [key]
     *   Key to get or set, or entire dataset to set, or nothing to get the
     *   entire dataset (optional).
     * @param {Data[Key]} [value]
     *   Value to set (optional).
     * @returns {unknown}
     *   The current processor when setting, the value at `key` when getting, or
     *   the entire dataset when getting without key.
     */
    data(key, value) {
      if (typeof key === 'string') {
        // Set `key`.
        if (arguments.length === 2) {
          assertUnfrozen('data', this.frozen);
          this.namespace[key] = value;
          return this
        }

        // Get `key`.
        return (own$6.call(this.namespace, key) && this.namespace[key]) || undefined
      }

      // Set space.
      if (key) {
        assertUnfrozen('data', this.frozen);
        this.namespace = key;
        return this
      }

      // Get space.
      return this.namespace
    }

    /**
     * Freeze a processor.
     *
     * Frozen processors are meant to be extended and not to be configured
     * directly.
     *
     * When a processor is frozen it cannot be unfrozen.
     * New processors working the same way can be created by calling the
     * processor.
     *
     * It’s possible to freeze processors explicitly by calling `.freeze()`.
     * Processors freeze automatically when `.parse()`, `.run()`, `.runSync()`,
     * `.stringify()`, `.process()`, or `.processSync()` are called.
     *
     * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
     *   The current processor.
     */
    freeze() {
      if (this.frozen) {
        return this
      }

      // Cast so that we can type plugins easier.
      // Plugins are supposed to be usable on different processors, not just on
      // this exact processor.
      const self = /** @type {Processor} */ (/** @type {unknown} */ (this));

      while (++this.freezeIndex < this.attachers.length) {
        const [attacher, ...options] = this.attachers[this.freezeIndex];

        if (options[0] === false) {
          continue
        }

        if (options[0] === true) {
          options[0] = undefined;
        }

        const transformer = attacher.call(self, ...options);

        if (typeof transformer === 'function') {
          this.transformers.use(transformer);
        }
      }

      this.frozen = true;
      this.freezeIndex = Number.POSITIVE_INFINITY;

      return this
    }

    /**
     * Parse text to a syntax tree.
     *
     * > **Note**: `parse` freezes the processor if not already *frozen*.
     *
     * > **Note**: `parse` performs the parse phase, not the run phase or other
     * > phases.
     *
     * @param {Compatible | undefined} [file]
     *   file to parse (optional); typically `string` or `VFile`; any value
     *   accepted as `x` in `new VFile(x)`.
     * @returns {ParseTree extends undefined ? Node : ParseTree}
     *   Syntax tree representing `file`.
     */
    parse(file) {
      this.freeze();
      const realFile = vfile(file);
      const parser = this.parser || this.Parser;
      assertParser('parse', parser);
      return parser(String(realFile), realFile)
    }

    /**
     * Process the given file as configured on the processor.
     *
     * > **Note**: `process` freezes the processor if not already *frozen*.
     *
     * > **Note**: `process` performs the parse, run, and stringify phases.
     *
     * @overload
     * @param {Compatible | undefined} file
     * @param {ProcessCallback<VFileWithOutput<CompileResult>>} done
     * @returns {undefined}
     *
     * @overload
     * @param {Compatible | undefined} [file]
     * @returns {Promise<VFileWithOutput<CompileResult>>}
     *
     * @param {Compatible | undefined} [file]
     *   File (optional); typically `string` or `VFile`]; any value accepted as
     *   `x` in `new VFile(x)`.
     * @param {ProcessCallback<VFileWithOutput<CompileResult>> | undefined} [done]
     *   Callback (optional).
     * @returns {Promise<VFile> | undefined}
     *   Nothing if `done` is given.
     *   Otherwise a promise, rejected with a fatal error or resolved with the
     *   processed file.
     *
     *   The parsed, transformed, and compiled value is available at
     *   `file.value` (see note).
     *
     *   > **Note**: unified typically compiles by serializing: most
     *   > compilers return `string` (or `Uint8Array`).
     *   > Some compilers, such as the one configured with
     *   > [`rehype-react`][rehype-react], return other values (in this case, a
     *   > React tree).
     *   > If you’re using a compiler that doesn’t serialize, expect different
     *   > result values.
     *   >
     *   > To register custom results in TypeScript, add them to
     *   > {@linkcode CompileResultMap}.
     *
     *   [rehype-react]: https://github.com/rehypejs/rehype-react
     */
    process(file, done) {
      const self = this;

      this.freeze();
      assertParser('process', this.parser || this.Parser);
      assertCompiler('process', this.compiler || this.Compiler);

      return done ? executor(undefined, done) : new Promise(executor)

      // Note: `void`s needed for TS.
      /**
       * @param {((file: VFileWithOutput<CompileResult>) => undefined | void) | undefined} resolve
       * @param {(error: Error | undefined) => undefined | void} reject
       * @returns {undefined}
       */
      function executor(resolve, reject) {
        const realFile = vfile(file);
        // Assume `ParseTree` (the result of the parser) matches `HeadTree` (the
        // input of the first transform).
        const parseTree =
          /** @type {HeadTree extends undefined ? Node : HeadTree} */ (
            /** @type {unknown} */ (self.parse(realFile))
          );

        self.run(parseTree, realFile, function (error, tree, file) {
          if (error || !tree || !file) {
            return realDone(error)
          }

          // Assume `TailTree` (the output of the last transform) matches
          // `CompileTree` (the input of the compiler).
          const compileTree =
            /** @type {CompileTree extends undefined ? Node : CompileTree} */ (
              /** @type {unknown} */ (tree)
            );

          const compileResult = self.stringify(compileTree, file);

          if (looksLikeAValue(compileResult)) {
            file.value = compileResult;
          } else {
            file.result = compileResult;
          }

          realDone(error, /** @type {VFileWithOutput<CompileResult>} */ (file));
        });

        /**
         * @param {Error | undefined} error
         * @param {VFileWithOutput<CompileResult> | undefined} [file]
         * @returns {undefined}
         */
        function realDone(error, file) {
          if (error || !file) {
            reject(error);
          } else if (resolve) {
            resolve(file);
          } else {
            done(undefined, file);
          }
        }
      }
    }

    /**
     * Process the given file as configured on the processor.
     *
     * An error is thrown if asynchronous transforms are configured.
     *
     * > **Note**: `processSync` freezes the processor if not already *frozen*.
     *
     * > **Note**: `processSync` performs the parse, run, and stringify phases.
     *
     * @param {Compatible | undefined} [file]
     *   File (optional); typically `string` or `VFile`; any value accepted as
     *   `x` in `new VFile(x)`.
     * @returns {VFileWithOutput<CompileResult>}
     *   The processed file.
     *
     *   The parsed, transformed, and compiled value is available at
     *   `file.value` (see note).
     *
     *   > **Note**: unified typically compiles by serializing: most
     *   > compilers return `string` (or `Uint8Array`).
     *   > Some compilers, such as the one configured with
     *   > [`rehype-react`][rehype-react], return other values (in this case, a
     *   > React tree).
     *   > If you’re using a compiler that doesn’t serialize, expect different
     *   > result values.
     *   >
     *   > To register custom results in TypeScript, add them to
     *   > {@linkcode CompileResultMap}.
     *
     *   [rehype-react]: https://github.com/rehypejs/rehype-react
     */
    processSync(file) {
      /** @type {boolean} */
      let complete = false;
      /** @type {VFileWithOutput<CompileResult> | undefined} */
      let result;

      this.freeze();
      assertParser('processSync', this.parser || this.Parser);
      assertCompiler('processSync', this.compiler || this.Compiler);

      this.process(file, realDone);
      assertDone('processSync', 'process', complete);

      return result

      /**
       * @type {ProcessCallback<VFileWithOutput<CompileResult>>}
       */
      function realDone(error, file) {
        complete = true;
        bail(error);
        result = file;
      }
    }

    /**
     * Run *transformers* on a syntax tree.
     *
     * > **Note**: `run` freezes the processor if not already *frozen*.
     *
     * > **Note**: `run` performs the run phase, not other phases.
     *
     * @overload
     * @param {HeadTree extends undefined ? Node : HeadTree} tree
     * @param {RunCallback<TailTree extends undefined ? Node : TailTree>} done
     * @returns {undefined}
     *
     * @overload
     * @param {HeadTree extends undefined ? Node : HeadTree} tree
     * @param {Compatible | undefined} file
     * @param {RunCallback<TailTree extends undefined ? Node : TailTree>} done
     * @returns {undefined}
     *
     * @overload
     * @param {HeadTree extends undefined ? Node : HeadTree} tree
     * @param {Compatible | undefined} [file]
     * @returns {Promise<TailTree extends undefined ? Node : TailTree>}
     *
     * @param {HeadTree extends undefined ? Node : HeadTree} tree
     *   Tree to transform and inspect.
     * @param {(
     *   RunCallback<TailTree extends undefined ? Node : TailTree> |
     *   Compatible
     * )} [file]
     *   File associated with `node` (optional); any value accepted as `x` in
     *   `new VFile(x)`.
     * @param {RunCallback<TailTree extends undefined ? Node : TailTree>} [done]
     *   Callback (optional).
     * @returns {Promise<TailTree extends undefined ? Node : TailTree> | undefined}
     *   Nothing if `done` is given.
     *   Otherwise, a promise rejected with a fatal error or resolved with the
     *   transformed tree.
     */
    run(tree, file, done) {
      assertNode(tree);
      this.freeze();

      const transformers = this.transformers;

      if (!done && typeof file === 'function') {
        done = file;
        file = undefined;
      }

      return done ? executor(undefined, done) : new Promise(executor)

      // Note: `void`s needed for TS.
      /**
       * @param {(
       *   ((tree: TailTree extends undefined ? Node : TailTree) => undefined | void) |
       *   undefined
       * )} resolve
       * @param {(error: Error) => undefined | void} reject
       * @returns {undefined}
       */
      function executor(resolve, reject) {
        const realFile = vfile(file);
        transformers.run(tree, realFile, realDone);

        /**
         * @param {Error | undefined} error
         * @param {Node} outputTree
         * @param {VFile} file
         * @returns {undefined}
         */
        function realDone(error, outputTree, file) {
          const resultingTree =
            /** @type {TailTree extends undefined ? Node : TailTree} */ (
              outputTree || tree
            );

          if (error) {
            reject(error);
          } else if (resolve) {
            resolve(resultingTree);
          } else {
            done(undefined, resultingTree, file);
          }
        }
      }
    }

    /**
     * Run *transformers* on a syntax tree.
     *
     * An error is thrown if asynchronous transforms are configured.
     *
     * > **Note**: `runSync` freezes the processor if not already *frozen*.
     *
     * > **Note**: `runSync` performs the run phase, not other phases.
     *
     * @param {HeadTree extends undefined ? Node : HeadTree} tree
     *   Tree to transform and inspect.
     * @param {Compatible | undefined} [file]
     *   File associated with `node` (optional); any value accepted as `x` in
     *   `new VFile(x)`.
     * @returns {TailTree extends undefined ? Node : TailTree}
     *   Transformed tree.
     */
    runSync(tree, file) {
      /** @type {boolean} */
      let complete = false;
      /** @type {(TailTree extends undefined ? Node : TailTree) | undefined} */
      let result;

      this.run(tree, file, realDone);

      assertDone('runSync', 'run', complete);
      return result

      /**
       * @type {RunCallback<TailTree extends undefined ? Node : TailTree>}
       */
      function realDone(error, tree) {
        bail(error);
        result = tree;
        complete = true;
      }
    }

    /**
     * Compile a syntax tree.
     *
     * > **Note**: `stringify` freezes the processor if not already *frozen*.
     *
     * > **Note**: `stringify` performs the stringify phase, not the run phase
     * > or other phases.
     *
     * @param {CompileTree extends undefined ? Node : CompileTree} tree
     *   Tree to compile.
     * @param {Compatible | undefined} [file]
     *   File associated with `node` (optional); any value accepted as `x` in
     *   `new VFile(x)`.
     * @returns {CompileResult extends undefined ? Value : CompileResult}
     *   Textual representation of the tree (see note).
     *
     *   > **Note**: unified typically compiles by serializing: most compilers
     *   > return `string` (or `Uint8Array`).
     *   > Some compilers, such as the one configured with
     *   > [`rehype-react`][rehype-react], return other values (in this case, a
     *   > React tree).
     *   > If you’re using a compiler that doesn’t serialize, expect different
     *   > result values.
     *   >
     *   > To register custom results in TypeScript, add them to
     *   > {@linkcode CompileResultMap}.
     *
     *   [rehype-react]: https://github.com/rehypejs/rehype-react
     */
    stringify(tree, file) {
      this.freeze();
      const realFile = vfile(file);
      const compiler = this.compiler || this.Compiler;
      assertCompiler('stringify', compiler);
      assertNode(tree);

      return compiler(tree, realFile)
    }

    /**
     * Configure the processor to use a plugin, a list of usable values, or a
     * preset.
     *
     * If the processor is already using a plugin, the previous plugin
     * configuration is changed based on the options that are passed in.
     * In other words, the plugin is not added a second time.
     *
     * > **Note**: `use` cannot be called on *frozen* processors.
     * > Call the processor first to create a new unfrozen processor.
     *
     * @example
     *   There are many ways to pass plugins to `.use()`.
     *   This example gives an overview:
     *
     *   ```js
     *   import {unified} from 'unified'
     *
     *   unified()
     *     // Plugin with options:
     *     .use(pluginA, {x: true, y: true})
     *     // Passing the same plugin again merges configuration (to `{x: true, y: false, z: true}`):
     *     .use(pluginA, {y: false, z: true})
     *     // Plugins:
     *     .use([pluginB, pluginC])
     *     // Two plugins, the second with options:
     *     .use([pluginD, [pluginE, {}]])
     *     // Preset with plugins and settings:
     *     .use({plugins: [pluginF, [pluginG, {}]], settings: {position: false}})
     *     // Settings only:
     *     .use({settings: {position: false}})
     *   ```
     *
     * @template {Array<unknown>} [Parameters=[]]
     * @template {Node | string | undefined} [Input=undefined]
     * @template [Output=Input]
     *
     * @overload
     * @param {Preset | null | undefined} [preset]
     * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
     *
     * @overload
     * @param {PluggableList} list
     * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
     *
     * @overload
     * @param {Plugin<Parameters, Input, Output>} plugin
     * @param {...(Parameters | [boolean])} parameters
     * @returns {UsePlugin<ParseTree, HeadTree, TailTree, CompileTree, CompileResult, Input, Output>}
     *
     * @param {PluggableList | Plugin | Preset | null | undefined} value
     *   Usable value.
     * @param {...unknown} parameters
     *   Parameters, when a plugin is given as a usable value.
     * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
     *   Current processor.
     */
    use(value, ...parameters) {
      const attachers = this.attachers;
      const namespace = this.namespace;

      assertUnfrozen('use', this.frozen);

      if (value === null || value === undefined) ; else if (typeof value === 'function') {
        addPlugin(value, parameters);
      } else if (typeof value === 'object') {
        if (Array.isArray(value)) {
          addList(value);
        } else {
          addPreset(value);
        }
      } else {
        throw new TypeError('Expected usable value, not `' + value + '`')
      }

      return this

      /**
       * @param {Pluggable} value
       * @returns {undefined}
       */
      function add(value) {
        if (typeof value === 'function') {
          addPlugin(value, []);
        } else if (typeof value === 'object') {
          if (Array.isArray(value)) {
            const [plugin, ...parameters] =
              /** @type {PluginTuple<Array<unknown>>} */ (value);
            addPlugin(plugin, parameters);
          } else {
            addPreset(value);
          }
        } else {
          throw new TypeError('Expected usable value, not `' + value + '`')
        }
      }

      /**
       * @param {Preset} result
       * @returns {undefined}
       */
      function addPreset(result) {
        if (!('plugins' in result) && !('settings' in result)) {
          throw new Error(
            'Expected usable value but received an empty preset, which is probably a mistake: presets typically come with `plugins` and sometimes with `settings`, but this has neither'
          )
        }

        addList(result.plugins);

        if (result.settings) {
          namespace.settings = extend(true, namespace.settings, result.settings);
        }
      }

      /**
       * @param {PluggableList | null | undefined} plugins
       * @returns {undefined}
       */
      function addList(plugins) {
        let index = -1;

        if (plugins === null || plugins === undefined) ; else if (Array.isArray(plugins)) {
          while (++index < plugins.length) {
            const thing = plugins[index];
            add(thing);
          }
        } else {
          throw new TypeError('Expected a list of plugins, not `' + plugins + '`')
        }
      }

      /**
       * @param {Plugin} plugin
       * @param {Array<unknown>} parameters
       * @returns {undefined}
       */
      function addPlugin(plugin, parameters) {
        let index = -1;
        let entryIndex = -1;

        while (++index < attachers.length) {
          if (attachers[index][0] === plugin) {
            entryIndex = index;
            break
          }
        }

        if (entryIndex === -1) {
          attachers.push([plugin, ...parameters]);
        }
        // Only set if there was at least a `primary` value, otherwise we’d change
        // `arguments.length`.
        else if (parameters.length > 0) {
          let [primary, ...rest] = parameters;
          const currentPrimary = attachers[entryIndex][1];
          if (isPlainObject(currentPrimary) && isPlainObject(primary)) {
            primary = extend(true, currentPrimary, primary);
          }

          attachers[entryIndex] = [plugin, primary, ...rest];
        }
      }
    }
  }

  // Note: this returns a *callable* instance.
  // That’s why it’s documented as a function.
  /**
   * Create a new processor.
   *
   * @example
   *   This example shows how a new processor can be created (from `remark`) and linked
   *   to **stdin**(4) and **stdout**(4).
   *
   *   ```js
   *   import process from 'node:process'
   *   import concatStream from 'concat-stream'
   *   import {remark} from 'remark'
   *
   *   process.stdin.pipe(
   *     concatStream(function (buf) {
   *       process.stdout.write(String(remark().processSync(buf)))
   *     })
   *   )
   *   ```
   *
   * @returns
   *   New *unfrozen* processor (`processor`).
   *
   *   This processor is configured to work the same as its ancestor.
   *   When the descendant processor is configured in the future it does not
   *   affect the ancestral processor.
   */
  const unified = new Processor().freeze();

  /**
   * Assert a parser is available.
   *
   * @param {string} name
   * @param {unknown} value
   * @returns {asserts value is Parser}
   */
  function assertParser(name, value) {
    if (typeof value !== 'function') {
      throw new TypeError('Cannot `' + name + '` without `parser`')
    }
  }

  /**
   * Assert a compiler is available.
   *
   * @param {string} name
   * @param {unknown} value
   * @returns {asserts value is Compiler}
   */
  function assertCompiler(name, value) {
    if (typeof value !== 'function') {
      throw new TypeError('Cannot `' + name + '` without `compiler`')
    }
  }

  /**
   * Assert the processor is not frozen.
   *
   * @param {string} name
   * @param {unknown} frozen
   * @returns {asserts frozen is false}
   */
  function assertUnfrozen(name, frozen) {
    if (frozen) {
      throw new Error(
        'Cannot call `' +
          name +
          '` on a frozen processor.\nCreate a new processor first, by calling it: use `processor()` instead of `processor`.'
      )
    }
  }

  /**
   * Assert `node` is a unist node.
   *
   * @param {unknown} node
   * @returns {asserts node is Node}
   */
  function assertNode(node) {
    // `isPlainObj` unfortunately uses `any` instead of `unknown`.
    // type-coverage:ignore-next-line
    if (!isPlainObject(node) || typeof node.type !== 'string') {
      throw new TypeError('Expected node, got `' + node + '`')
      // Fine.
    }
  }

  /**
   * Assert that `complete` is `true`.
   *
   * @param {string} name
   * @param {string} asyncName
   * @param {unknown} complete
   * @returns {asserts complete is true}
   */
  function assertDone(name, asyncName, complete) {
    if (!complete) {
      throw new Error(
        '`' + name + '` finished async. Use `' + asyncName + '` instead'
      )
    }
  }

  /**
   * @param {Compatible | undefined} [value]
   * @returns {VFile}
   */
  function vfile(value) {
    return looksLikeAVFile(value) ? value : new VFile(value)
  }

  /**
   * @param {Compatible | undefined} [value]
   * @returns {value is VFile}
   */
  function looksLikeAVFile(value) {
    return Boolean(
      value &&
        typeof value === 'object' &&
        'message' in value &&
        'messages' in value
    )
  }

  /**
   * @param {unknown} [value]
   * @returns {value is Value}
   */
  function looksLikeAValue(value) {
    return typeof value === 'string' || isUint8Array(value)
  }

  /**
   * Assert `value` is an `Uint8Array`.
   *
   * @param {unknown} value
   *   thing.
   * @returns {value is Uint8Array}
   *   Whether `value` is an `Uint8Array`.
   */
  function isUint8Array(value) {
    return Boolean(
      value &&
        typeof value === 'object' &&
        'byteLength' in value &&
        'byteOffset' in value
    )
  }

  function parseIndentedLines(options = { indentation: 2 }) {
      const self = this;
      self.parser = parser;
      self.options = { ...options };
      self.options.indentation = options.indentation || 2;
    
      function parser(doc,vfile) {

          const root = {
              type: 'ilines',
              children: [],
              // position: {
              //     start: { line: 1, column: 1, offset: 0 },
              //     end: { line: -1, column: -1, offset: doc.length }
              // }
          };

          const l = doc.length;
          let i = 0;
          let j = 0;
      
          let atLineStart = true;
          let indent = 0;
      
          function addLine(split) {
              const ilineIndent = Math.floor(indent/self.options.indentation);
              root.children.push({
                  type: 'iline',
                  indent: ilineIndent,
                  value: doc.substring(i+ilineIndent*self.options.indentation,j),
                  // position: {
                  //     start: { line: n, column: indent+1, offset: i+indent },
                  //     end: { line: n, column: j-i+1, offset: j }    
                  // },
                  // children: [{
                  //     type: 'text',
                  //     position: {
                  //     }
                  // }]
              });
              atLineStart = true;
              indent = 0;
              i = j + split;
              j = i;
          }
      
          while (j<l) {
      
              const s = doc[j];
              if (atLineStart) {
                  if (s==' ') {
                      ++indent;
                  } else {
                      atLineStart = false;
                  }
              }
              if (s=='\r') {
                  if (j+1<l && doc[j+1]=='\n') {
                      addLine(2);
                  } else {
                      j++;
                  }
              } else if (s=='\n') {
                  addLine(1);
              } else {
                  ++j;
              }
          }
          addLine(0);

          // root.position.end.line = n-1
          // root.position.end.column = j-i+1

          return root;
      }
  }

  /**
   * With this simple and little module you can convert the smiles in your text to emoji.
   *
   * @module
   */
  /**
   * A map of text to their emoji representation.
   */
  const emojiMap$1 = {
      'o/': '👋',
      '</3': '💔',
      '<3': '💗',
      '8-D': '😁',
      '8D': '😁',
      ':-D': '😁',
      ':-3': '😁',
      ':3': '😁',
      ':D': '😁',
      'B^D': '😁',
      'X-D': '😁',
      XD: '😁',
      'x-D': '😁',
      xD: '😁',
      ":')": '😂',
      ":'-)": '😂',
      ':-))': '😃',
      '8)': '😄',
      ':)': '😊',
      ':-)': '😄',
      ':]': '😄',
      ':^)': '😄',
      ':c)': '😄',
      ':o)': '😄',
      ':}': '😄',
      ':っ)': '😄',
      '0:)': '😇',
      '0:-)': '😇',
      '0:-3': '😇',
      '0:3': '😇',
      '0;^)': '😇',
      'O:-)': '😇',
      '3:)': '😈',
      '3:-)': '😈',
      '}:)': '😈',
      '}:-)': '😈',
      '*)': '😉',
      '*-)': '😉',
      ':-,': '😉',
      ';)': '😉',
      ';-)': '😉',
      ';-]': '😉',
      ';D': '😉',
      ';]': '😉',
      ';^)': '😉',
      ':-|': '😐',
      ':|': '😐',
      ':(': '😞',
      ':-(': '😒',
      ':-<': '😒',
      ':-[': '😒',
      ':-c': '😒',
      ':<': '😒',
      ':[': '😒',
      ':c': '😒',
      ':{': '😒',
      ':っC': '😒',
      '%)': '😖',
      '%-)': '😖',
      ':-P': '😜',
      ':-b': '😜',
      ':-p': '😜',
      ':-Þ': '😜',
      ':-þ': '😜',
      ':P': '😜',
      ':b': '😜',
      ':p': '😜',
      ':Þ': '😜',
      ':þ': '😜',
      ';(': '😜',
      'X-P': '😜',
      XP: '😜',
      'd:': '😜',
      'x-p': '😜',
      xp: '😜',
      ':-||': '😠',
      ':@': '😠',
      ':-.': '😡',
      ':-/': '😡',
      ':/': '😐',
      ':L': '😡',
      ':S': '😡',
      ':\\': '😡',
      ":'(": '😢',
      ":'-(": '😢',
      '^5': '😤',
      '^<_<': '😤',
      'o/\\o': '😤',
      '|-O': '😫',
      '|;-)': '😫',
      ':###..': '😰',
      ':#': '😅',
      ':-###..': '😰',
      "D-':": '😱',
      D8: '😱',
      'D:': '😱',
      'D:<': '😱',
      'D;': '😱',
      DX: '😱',
      'v.v': '😱',
      '8-0': '😲',
      ':-O': '😲',
      ':-o': '😲',
      ':O': '😲',
      ':o': '😲',
      'O-O': '😲',
      O_O: '😲',
      O_o: '😲',
      'o-o': '😲',
      o_O: '😲',
      o_o: '😲',
      ':$': '😳',
      '#-)': '😵',
      ':&': '😶',
      ':-#': '😶',
      ':-&': '😶',
      ':-X': '😶',
      ':X': '😶',
      ':-J': '😼',
      ':*': '😘',
      ':^*': '😽',
      ಠ_ಠ: '🙅',
      '*\\0/*': '🙆',
      '\\o/': '🙆',
      ':>': '😄',
      '>.<': '😡',
      '>:(': '😠',
      '>:)': '😈',
      '>:-)': '😈',
      '>:/': '😡',
      '>:O': '😲',
      '>:P': '😜',
      '>:[': '😒',
      '>:\\': '😡',
      '>;)': '😈',
      '>_>^': '😤',
      '^^': '😊',
      ':sweat:': '😅',
      ':smile:': '😄',
      ':laughing:': '😆',
      ':blush:': '😊',
      ':smiley:': '😃',
      ':relaxed:': '☺️',
      ':smirk:': '😏',
      ':heart_eyes:': '😍',
      ':kissing_heart:': '😘',
      ':kissing_closed_eyes:': '😚',
      ':flushed:': '😳',
      ':relieved:': '😌',
      ':satisfied:': '😆',
      ':grin:': '😁',
      ':wink:': '😉',
      ':stuck_out_tongue_winking_eye:': '😜',
      ':stuck_out_tongue_closed_eyes:': '😝',
      ':grinning:': '😀',
      ':kissing:': '😗',
      ':kissing_smiling_eyes:': '😙',
      ':stuck_out_tongue:': '😛',
      ':sleeping:': '😴',
      ':worried:': '😟',
      ':frowning:': '😦',
      ':anguished:': '😧',
      ':open_mouth:': '😮',
      ':grimacing:': '😬',
      ':confused:': '😕',
      ':hushed:': '😯',
      ':expressionless:': '😑',
      ':unamused:': '😒',
      ':sweat_smile:': '😅',
      ':disappointed_relieved:': '😥',
      ':weary:': '😩',
      ':pensive:': '😔',
      ':disappointed:': '😞',
      ':confounded:': '😖',
      ':fearful:': '😨',
      ':cold_sweat:': '😰',
      ':persevere:': '😣',
      ':cry:': '😢',
      ':sob:': '😭',
      ':joy:': '😂',
      ':astonished:': '😲',
      ':scream:': '😱',
      ':tired_face:': '😫',
      ':angry:': '😠',
      ':rage:': '😡',
      ':triumph:': '😤',
      ':sleepy:': '😪',
      ':yum:': '😋',
      ':mask:': '😷',
      ':sunglasses:': '😎',
      ':dizzy_face:': '😵',
      ':imp:': '👿',
      ':smiling_imp:': '😈',
      ':neutral_face:': '😐',
      ':no_mouth:': '😶',
      ':innocent:': '😇',
      ':alien:': '👽',
      ':yellow_heart:': '💛',
      ':blue_heart:': '💙',
      ':purple_heart:': '💜',
      ':heart:': '❤️',
      ':green_heart:': '💚',
      ':broken_heart:': '💔',
      ':heartbeat:': '💓',
      ':heartpulse:': '💗',
      ':two_hearts:': '💕',
      ':revolving_hearts:': '💞',
      ':cupid:': '💘',
      ':sparkling_heart:': '💖',
      ':sparkles:': '✨',
      ':star:': '⭐',
      ':star2:': '🌟',
      ':dizzy:': '💫',
      ':boom:': '💥',
      ':collision:': '💥',
      ':anger:': '💢',
      ':exclamation:': '❗',
      ':question:': '❓',
      ':grey_exclamation:': '❕',
      ':grey_question:': '❔',
      ':zzz:': '💤',
      ':dash:': '💨',
      ':sweat_drops:': '💦',
      ':notes:': '🎶',
      ':musical_note:': '🎵',
      ':fire:': '🔥',
      ':hankey:': '💩',
      ':poop:': '💩',
      ':shit:': '💩',
      ':+1:': '👍',
      ':thumbsup:': '👍',
      ':-1:': '👎',
      ':thumbsdown:': '👎',
      ':ok_hand:': '👌',
      ':punch:': '👊',
      ':facepunch:': '👊',
      ':fist:': '✊',
      ':v:': '✌️',
      ':wave:': '👋',
      ':hand:': '✋',
      ':raised_hand:': '✋',
      ':open_hands:': '👐',
      ':point_up:': '☝️',
      ':point_down:': '👇',
      ':point_left:': '👈',
      ':point_right:': '👉',
      ':raised_hands:': '🙌',
      ':pray:': '🙏',
      ':point_up_2:': '👆',
      ':clap:': '👏',
      ':muscle:': '💪',
      ':metal:': '🤘',
      ':fu:': '🖕',
      ':walking:': '🚶',
      ':runner:': '🏃',
      ':running:': '🏃',
      ':couple:': '👫',
      ':family:': '👪',
      ':two_men_holding_hands:': '👬',
      ':two_women_holding_hands:': '👭',
      ':dancer:': '💃',
      ':dancers:': '👯',
      ':no_good:': '🙅',
      ':information_desk_person:': '💁',
      ':raising_hand:': '🙋',
      ':bride_with_veil:': '👰',
      ':bow:': '🙇',
      ':couplekiss:': '💏',
      ':couple_with_heart:': '💑',
      ':massage:': '💆',
      ':haircut:': '💇',
      ':nail_care:': '💅',
      ':boy:': '👦',
      ':girl:': '👧',
      ':woman:': '👩',
      ':man:': '👨',
      ':baby:': '👶',
      ':older_woman:': '👵',
      ':older_man:': '👴',
      ':man_with_gua_pi_mao:': '👲',
      ':construction_worker:': '👷',
      ':cop:': '👮',
      ':angel:': '👼',
      ':princess:': '👸',
      ':smiley_cat:': '😺',
      ':smile_cat:': '😸',
      ':heart_eyes_cat:': '😻',
      ':kissing_cat:': '😽',
      ':smirk_cat:': '😼',
      ':scream_cat:': '🙀',
      ':crying_cat_face:': '😿',
      ':joy_cat:': '😹',
      ':pouting_cat:': '😾',
      ':japanese_ogre:': '👹',
      ':japanese_goblin:': '👺',
      ':see_no_evil:': '🙈',
      ':hear_no_evil:': '🙉',
      ':speak_no_evil:': '🙊',
      ':skull:': '💀',
      ':feet:': '🐾',
      ':lips:': '👄',
      ':kiss:': '💋',
      ':droplet:': '💧',
      ':ear:': '👂',
      ':eyes:': '👀',
      ':nose:': '👃',
      ':tongue:': '👅',
      ':love_letter:': '💌',
      ':bust_in_silhouette:': '👤',
      ':busts_in_silhouette:': '👥',
      ':speech_balloon:': '💬',
      ':thought_balloon:': '💭',
      ':sunny:': '☀️',
      ':umbrella:': '☔',
      ':cloud:': '☁️',
      ':snowflake:': '❄️',
      ':snowman:': '⛄',
      ':zap:': '⚡',
      ':cyclone:': '🌀',
      ':foggy:': '🌁',
      ':ocean:': '🌊',
      ':cat:': '🐱',
      ':dog:': '🐶',
      ':mouse:': '🐭',
      ':hamster:': '🐹',
      ':rabbit:': '🐰',
      ':wolf:': '🐺',
      ':frog:': '🐸',
      ':tiger:': '🐯',
      ':koala:': '🐨',
      ':bear:': '🐻',
      ':pig:': '🐷',
      ':pig_nose:': '🐽',
      ':cow:': '🐮',
      ':boar:': '🐗',
      ':monkey_face:': '🐵',
      ':monkey:': '🐒',
      ':horse:': '🐴',
      ':racehorse:': '🐎',
      ':camel:': '🐫',
      ':sheep:': '🐑',
      ':elephant:': '🐘',
      ':panda_face:': '🐼',
      ':snake:': '🐍',
      ':bird:': '🐦',
      ':baby_chick:': '🐤',
      ':hatched_chick:': '🐥',
      ':hatching_chick:': '🐣',
      ':chicken:': '🐔',
      ':penguin:': '🐧',
      ':turtle:': '🐢',
      ':bug:': '🐛',
      ':honeybee:': '🐝',
      ':ant:': '🐜',
      ':beetle:': '🐞',
      ':snail:': '🐌',
      ':octopus:': '🐙',
      ':tropical_fish:': '🐠',
      ':fish:': '🐟',
      ':whale:': '🐳',
      ':whale2:': '🐋',
      ':dolphin:': '🐬',
      ':cow2:': '🐄',
      ':ram:': '🐏',
      ':rat:': '🐀',
      ':water_buffalo:': '🐃',
      ':tiger2:': '🐅',
      ':rabbit2:': '🐇',
      ':dragon:': '🐉',
      ':goat:': '🐐',
      ':rooster:': '🐓',
      ':dog2:': '🐕',
      ':pig2:': '🐖',
      ':mouse2:': '🐁',
      ':ox:': '🐂',
      ':dragon_face:': '🐲',
      ':blowfish:': '🐡',
      ':crocodile:': '🐊',
      ':dromedary_camel:': '🐪',
      ':leopard:': '🐆',
      ':cat2:': '🐈',
      ':poodle:': '🐩',
      ':paw_prints:': '🐾',
      ':bouquet:': '💐',
      ':cherry_blossom:': '🌸',
      ':tulip:': '🌷',
      ':four_leaf_clover:': '🍀',
      ':rose:': '🌹',
      ':sunflower:': '🌻',
      ':hibiscus:': '🌺',
      ':maple_leaf:': '🍁',
      ':leaves:': '🍃',
      ':fallen_leaf:': '🍂',
      ':herb:': '🌿',
      ':mushroom:': '🍄',
      ':cactus:': '🌵',
      ':palm_tree:': '🌴',
      ':evergreen_tree:': '🌲',
      ':deciduous_tree:': '🌳',
      ':chestnut:': '🌰',
      ':seedling:': '🌱',
      ':blossom:': '🌼',
      ':ear_of_rice:': '🌾',
      ':shell:': '🐚',
      ':globe_with_meridians:': '🌐',
      ':sun_with_face:': '🌞',
      ':full_moon_with_face:': '🌝',
      ':new_moon_with_face:': '🌚',
      ':new_moon:': '🌑',
      ':waxing_crescent_moon:': '🌒',
      ':first_quarter_moon:': '🌓',
      ':waxing_gibbous_moon:': '🌔',
      ':full_moon:': '🌕',
      ':waning_gibbous_moon:': '🌖',
      ':last_quarter_moon:': '🌗',
      ':waning_crescent_moon:': '🌘',
      ':last_quarter_moon_with_face:': '🌜',
      ':first_quarter_moon_with_face:': '🌛',
      ':moon:': '🌔',
      ':earth_africa:': '🌍',
      ':earth_americas:': '🌎',
      ':earth_asia:': '🌏',
      ':volcano:': '🌋',
      ':milky_way:': '🌌',
      ':partly_sunny:': '⛅',
      ':bamboo:': '🎍',
      ':gift_heart:': '💝',
      ':dolls:': '🎎',
      ':school_satchel:': '🎒',
      ':mortar_board:': '🎓',
      ':flags:': '🎏',
      ':fireworks:': '🎆',
      ':sparkler:': '🎇',
      ':wind_chime:': '🎐',
      ':rice_scene:': '🎑',
      ':jack_o_lantern:': '🎃',
      ':ghost:': '👻',
      ':santa:': '🎅',
      ':christmas_tree:': '🎄',
      ':gift:': '🎁',
      ':bell:': '🔔',
      ':no_bell:': '🔕',
      ':tanabata_tree:': '🎋',
      ':tada:': '🎉',
      ':confetti_ball:': '🎊',
      ':balloon:': '🎈',
      ':crystal_ball:': '🔮',
      ':cd:': '💿',
      ':dvd:': '📀',
      ':floppy_disk:': '💾',
      ':camera:': '📷',
      ':video_camera:': '📹',
      ':movie_camera:': '🎥',
      ':computer:': '💻',
      ':tv:': '📺',
      ':iphone:': '📱',
      ':phone:': '☎️',
      ':telephone:': '☎️',
      ':telephone_receiver:': '📞',
      ':pager:': '📟',
      ':fax:': '📠',
      ':minidisc:': '💽',
      ':vhs:': '📼',
      ':sound:': '🔉',
      ':speaker:': '🔈',
      ':mute:': '🔇',
      ':loudspeaker:': '📢',
      ':mega:': '📣',
      ':hourglass:': '⌛',
      ':hourglass_flowing_sand:': '⏳',
      ':alarm_clock:': '⏰',
      ':watch:': '⌚',
      ':radio:': '📻',
      ':satellite:': '📡',
      ':loop:': '➿',
      ':mag:': '🔍',
      ':mag_right:': '🔎',
      ':unlock:': '🔓',
      ':lock:': '🔒',
      ':lock_with_ink_pen:': '🔏',
      ':closed_lock_with_key:': '🔐',
      ':key:': '🔑',
      ':bulb:': '💡',
      ':flashlight:': '🔦',
      ':high_brightness:': '🔆',
      ':low_brightness:': '🔅',
      ':electric_plug:': '🔌',
      ':battery:': '🔋',
      ':calling:': '📲',
      ':email:': '✉️',
      ':mailbox:': '📫',
      ':postbox:': '📮',
      ':bath:': '🛀',
      ':bathtub:': '🛁',
      ':shower:': '🚿',
      ':toilet:': '🚽',
      ':wrench:': '🔧',
      ':nut_and_bolt:': '🔩',
      ':hammer:': '🔨',
      ':seat:': '💺',
      ':moneybag:': '💰',
      ':yen:': '💴',
      ':dollar:': '💵',
      ':pound:': '💷',
      ':euro:': '💶',
      ':credit_card:': '💳',
      ':money_with_wings:': '💸',
      ':e-mail:': '📧',
      ':inbox_tray:': '📥',
      ':outbox_tray:': '📤',
      ':envelope:': '✉️',
      ':incoming_envelope:': '📨',
      ':postal_horn:': '📯',
      ':mailbox_closed:': '📪',
      ':mailbox_with_mail:': '📬',
      ':mailbox_with_no_mail:': '📭',
      ':package:': '📦',
      ':door:': '🚪',
      ':smoking:': '🚬',
      ':bomb:': '💣',
      ':gun:': '🔫',
      ':hocho:': '🔪',
      ':pill:': '💊',
      ':syringe:': '💉',
      ':page_facing_up:': '📄',
      ':page_with_curl:': '📃',
      ':bookmark_tabs:': '📑',
      ':bar_chart:': '📊',
      ':chart_with_upwards_trend:': '📈',
      ':chart_with_downwards_trend:': '📉',
      ':scroll:': '📜',
      ':clipboard:': '📋',
      ':calendar:': '📆',
      ':date:': '📅',
      ':card_index:': '📇',
      ':file_folder:': '📁',
      ':open_file_folder:': '📂',
      ':scissors:': '✂️',
      ':pushpin:': '📌',
      ':paperclip:': '📎',
      ':black_nib:': '✒️',
      ':pencil2:': '✏️',
      ':straight_ruler:': '📏',
      ':triangular_ruler:': '📐',
      ':closed_book:': '📕',
      ':green_book:': '📗',
      ':blue_book:': '📘',
      ':orange_book:': '📙',
      ':notebook:': '📓',
      ':notebook_with_decorative_cover:': '📔',
      ':ledger:': '📒',
      ':books:': '📚',
      ':bookmark:': '🔖',
      ':name_badge:': '📛',
      ':microscope:': '🔬',
      ':telescope:': '🔭',
      ':newspaper:': '📰',
      ':football:': '🏈',
      ':basketball:': '🏀',
      ':soccer:': '⚽',
      ':baseball:': '⚾',
      ':tennis:': '🎾',
      ':8ball:': '🎱',
      ':rugby_football:': '🏉',
      ':bowling:': '🎳',
      ':golf:': '⛳',
      ':mountain_bicyclist:': '🚵',
      ':bicyclist:': '🚴',
      ':horse_racing:': '🏇',
      ':snowboarder:': '🏂',
      ':swimmer:': '🏊',
      ':surfer:': '🏄',
      ':ski:': '🎿',
      ':spades:': '♠️',
      ':hearts:': '♥️',
      ':clubs:': '♣️',
      ':diamonds:': '♦️',
      ':gem:': '💎',
      ':ring:': '💍',
      ':trophy:': '🏆',
      ':musical_score:': '🎼',
      ':musical_keyboard:': '🎹',
      ':violin:': '🎻',
      ':space_invader:': '👾',
      ':video_game:': '🎮',
      ':black_joker:': '🃏',
      ':flower_playing_cards:': '🎴',
      ':game_die:': '🎲',
      ':dart:': '🎯',
      ':mahjong:': '🀄',
      ':clapper:': '🎬',
      ':memo:': '📝',
      ':pencil:': '📝',
      ':book:': '📖',
      ':art:': '🎨',
      ':microphone:': '🎤',
      ':headphones:': '🎧',
      ':trumpet:': '🎺',
      ':saxophone:': '🎷',
      ':guitar:': '🎸',
      ':shoe:': '👞',
      ':sandal:': '👡',
      ':high_heel:': '👠',
      ':lipstick:': '💄',
      ':boot:': '👢',
      ':shirt:': '👕',
      ':tshirt:': '👕',
      ':necktie:': '👔',
      ':womans_clothes:': '👚',
      ':dress:': '👗',
      ':running_shirt_with_sash:': '🎽',
      ':jeans:': '👖',
      ':kimono:': '👘',
      ':bikini:': '👙',
      ':ribbon:': '🎀',
      ':tophat:': '🎩',
      ':crown:': '👑',
      ':womans_hat:': '👒',
      ':mans_shoe:': '👞',
      ':closed_umbrella:': '🌂',
      ':briefcase:': '💼',
      ':handbag:': '👜',
      ':pouch:': '👝',
      ':purse:': '👛',
      ':eyeglasses:': '👓',
      ':fishing_pole_and_fish:': '🎣',
      ':coffee:': '☕',
      ':tea:': '🍵',
      ':sake:': '🍶',
      ':baby_bottle:': '🍼',
      ':beer:': '🍺',
      ':beers:': '🍻',
      ':cocktail:': '🍸',
      ':tropical_drink:': '🍹',
      ':wine_glass:': '🍷',
      ':fork_and_knife:': '🍴',
      ':pizza:': '🍕',
      ':hamburger:': '🍔',
      ':fries:': '🍟',
      ':poultry_leg:': '🍗',
      ':meat_on_bone:': '🍖',
      ':spaghetti:': '🍝',
      ':curry:': '🍛',
      ':fried_shrimp:': '🍤',
      ':bento:': '🍱',
      ':sushi:': '🍣',
      ':fish_cake:': '🍥',
      ':rice_ball:': '🍙',
      ':rice_cracker:': '🍘',
      ':rice:': '🍚',
      ':ramen:': '🍜',
      ':stew:': '🍲',
      ':oden:': '🍢',
      ':dango:': '🍡',
      ':egg:': '🥚',
      ':bread:': '🍞',
      ':doughnut:': '🍩',
      ':custard:': '🍮',
      ':icecream:': '🍦',
      ':ice_cream:': '🍨',
      ':shaved_ice:': '🍧',
      ':birthday:': '🎂',
      ':cake:': '🍰',
      ':cookie:': '🍪',
      ':chocolate_bar:': '🍫',
      ':candy:': '🍬',
      ':lollipop:': '🍭',
      ':honey_pot:': '🍯',
      ':apple:': '🍎',
      ':green_apple:': '🍏',
      ':tangerine:': '🍊',
      ':lemon:': '🍋',
      ':cherries:': '🍒',
      ':grapes:': '🍇',
      ':watermelon:': '🍉',
      ':strawberry:': '🍓',
      ':peach:': '🍑',
      ':melon:': '🍈',
      ':banana:': '🍌',
      ':pear:': '🍐',
      ':pineapple:': '🍍',
      ':sweet_potato:': '🍠',
      ':eggplant:': '🍆',
      ':tomato:': '🍅',
      ':corn:': '🌽',
      ':house:': '🏠',
      ':house_with_garden:': '🏡',
      ':school:': '🏫',
      ':office:': '🏢',
      ':post_office:': '🏣',
      ':hospital:': '🏥',
      ':bank:': '🏦',
      ':convenience_store:': '🏪',
      ':love_hotel:': '🏩',
      ':hotel:': '🏨',
      ':wedding:': '💒',
      ':church:': '⛪',
      ':department_store:': '🏬',
      ':european_post_office:': '🏤',
      ':city_sunrise:': '🌇',
      ':city_sunset:': '🌆',
      ':japanese_castle:': '🏯',
      ':european_castle:': '🏰',
      ':tent:': '⛺',
      ':factory:': '🏭',
      ':tokyo_tower:': '🗼',
      ':japan:': '🗾',
      ':mount_fuji:': '🗻',
      ':sunrise_over_mountains:': '🌄',
      ':sunrise:': '🌅',
      ':stars:': '🌠',
      ':statue_of_liberty:': '🗽',
      ':bridge_at_night:': '🌉',
      ':carousel_horse:': '🎠',
      ':rainbow:': '🌈',
      ':ferris_wheel:': '🎡',
      ':fountain:': '⛲',
      ':roller_coaster:': '🎢',
      ':ship:': '🚢',
      ':speedboat:': '🚤',
      ':boat:': '⛵',
      ':sailboat:': '⛵',
      ':rowboat:': '🚣',
      ':anchor:': '⚓',
      ':rocket:': '🚀',
      ':airplane:': '✈️',
      ':helicopter:': '🚁',
      ':steam_locomotive:': '🚂',
      ':tram:': '🚊',
      ':mountain_railway:': '🚞',
      ':bike:': '🚲',
      ':aerial_tramway:': '🚡',
      ':suspension_railway:': '🚟',
      ':mountain_cableway:': '🚠',
      ':tractor:': '🚜',
      ':blue_car:': '🚙',
      ':oncoming_automobile:': '🚘',
      ':car:': '🚗',
      ':red_car:': '🚗',
      ':taxi:': '🚕',
      ':oncoming_taxi:': '🚖',
      ':articulated_lorry:': '🚛',
      ':bus:': '🚌',
      ':oncoming_bus:': '🚍',
      ':rotating_light:': '🚨',
      ':police_car:': '🚓',
      ':oncoming_police_car:': '🚔',
      ':fire_engine:': '🚒',
      ':ambulance:': '🚑',
      ':minibus:': '🚐',
      ':truck:': '🚚',
      ':train:': '🚋',
      ':station:': '🚉',
      ':train2:': '🚆',
      ':bullettrain_front:': '🚅',
      ':bullettrain_side:': '🚄',
      ':light_rail:': '🚈',
      ':monorail:': '🚝',
      ':railway_car:': '🚃',
      ':trolleybus:': '🚎',
      ':ticket:': '🎫',
      ':fuelpump:': '⛽',
      ':vertical_traffic_light:': '🚦',
      ':traffic_light:': '🚥',
      ':warning:': '⚠️',
      ':construction:': '🚧',
      ':beginner:': '🔰',
      ':atm:': '🏧',
      ':slot_machine:': '🎰',
      ':busstop:': '🚏',
      ':barber:': '💈',
      ':hotsprings:': '♨️',
      ':checkered_flag:': '🏁',
      ':crossed_flags:': '🎌',
      ':izakaya_lantern:': '🏮',
      ':moyai:': '🗿',
      ':circus_tent:': '🎪',
      ':performing_arts:': '🎭',
      ':round_pushpin:': '📍',
      ':triangular_flag_on_post:': '🚩',
      ':jp:': '🇯🇵',
      ':kr:': '🇰🇷',
      ':cn:': '🇨🇳',
      ':us:': '🇺🇸',
      ':fr:': '🇫🇷',
      ':es:': '🇪🇸',
      ':it:': '🇮🇹',
      ':ru:': '🇷🇺',
      ':gb:': '🇬🇧',
      ':uk:': '🇬🇧',
      ':de:': '🇩🇪',
      ':one:': '1️⃣',
      ':two:': '2️⃣',
      ':three:': '3️⃣',
      ':four:': '4️⃣',
      ':five:': '5️⃣',
      ':six:': '6️⃣',
      ':seven:': '7️⃣',
      ':eight:': '8️⃣',
      ':nine:': '9️⃣',
      ':keycap_ten:': '🔟',
      ':1234:': '🔢',
      ':zero:': '0️⃣',
      ':hash:': '#️⃣',
      ':symbols:': '🔣',
      ':arrow_backward:': '◀️',
      ':arrow_down:': '⬇️',
      ':arrow_forward:': '▶️',
      ':arrow_left:': '⬅️',
      ':capital_abcd:': '🔠',
      ':abcd:': '🔡',
      ':abc:': '🔤',
      ':arrow_lower_left:': '↙️',
      ':arrow_lower_right:': '↘️',
      ':arrow_right:': '➡️',
      ':arrow_up:': '⬆️',
      ':arrow_upper_left:': '↖️',
      ':arrow_upper_right:': '↗️',
      ':arrow_double_down:': '⏬',
      ':arrow_double_up:': '⏫',
      ':arrow_down_small:': '🔽',
      ':arrow_heading_down:': '⤵️',
      ':arrow_heading_up:': '⤴️',
      ':leftwards_arrow_with_hook:': '↩️',
      ':arrow_right_hook:': '↪️',
      ':left_right_arrow:': '↔️',
      ':arrow_up_down:': '↕️',
      ':arrow_up_small:': '🔼',
      ':arrows_clockwise:': '🔃',
      ':arrows_counterclockwise:': '🔄',
      ':rewind:': '⏪',
      ':fast_forward:': '⏩',
      ':information_source:': 'ℹ️',
      ':ok:': '🆗',
      ':twisted_rightwards_arrows:': '🔀',
      ':repeat:': '🔁',
      ':repeat_one:': '🔂',
      ':new:': '🆕',
      ':top:': '🔝',
      ':up:': '🆙',
      ':cool:': '🆒',
      ':free:': '🆓',
      ':ng:': '🆖',
      ':cinema:': '🎦',
      ':koko:': '🈁',
      ':signal_strength:': '📶',
      ':u5272:': '🈹',
      ':u5408:': '🈴',
      ':u55b6:': '🈺',
      ':u6307:': '🈯',
      ':u6708:': '🈷️',
      ':u6709:': '🈶',
      ':u6e80:': '🈵',
      ':u7121:': '🈚',
      ':u7533:': '🈸',
      ':u7a7a:': '🈳',
      ':u7981:': '🈲',
      ':sa:': '🈂️',
      ':restroom:': '🚻',
      ':mens:': '🚹',
      ':womens:': '🚺',
      ':baby_symbol:': '🚼',
      ':no_smoking:': '🚭',
      ':parking:': '🅿️',
      ':wheelchair:': '♿',
      ':metro:': '🚇',
      ':baggage_claim:': '🛄',
      ':accept:': '🉑',
      ':wc:': '🚾',
      ':potable_water:': '🚰',
      ':put_litter_in_its_place:': '🚮',
      ':secret:': '㊙️',
      ':congratulations:': '㊗️',
      ':m:': 'Ⓜ️',
      ':passport_control:': '🛂',
      ':left_luggage:': '🛅',
      ':customs:': '🛃',
      ':ideograph_advantage:': '🉐',
      ':cl:': '🆑',
      ':sos:': '🆘',
      ':id:': '🆔',
      ':no_entry_sign:': '🚫',
      ':underage:': '🔞',
      ':no_mobile_phones:': '📵',
      ':do_not_litter:': '🚯',
      ':non-potable_water:': '🚱',
      ':no_bicycles:': '🚳',
      ':no_pedestrians:': '🚷',
      ':children_crossing:': '🚸',
      ':no_entry:': '⛔',
      ':eight_spoked_asterisk:': '✳️',
      ':sparkle:': '❇️',
      ':eight_pointed_black_star:': '✴️',
      ':heart_decoration:': '💟',
      ':vs:': '🆚',
      ':vibration_mode:': '📳',
      ':mobile_phone_off:': '📴',
      ':chart:': '💹',
      ':currency_exchange:': '💱',
      ':aries:': '♈',
      ':taurus:': '♉',
      ':gemini:': '♊',
      ':cancer:': '♋',
      ':leo:': '♌',
      ':virgo:': '♍',
      ':libra:': '♎',
      ':scorpius:': '♏',
      ':sagittarius:': '♐',
      ':capricorn:': '♑',
      ':aquarius:': '♒',
      ':pisces:': '♓',
      ':ophiuchus:': '⛎',
      ':six_pointed_star:': '🔯',
      ':negative_squared_cross_mark:': '❎',
      ':a:': '🅰️',
      ':b:': '🅱️',
      ':ab:': '🆎',
      ':o2:': '🅾️',
      ':diamond_shape_with_a_dot_inside:': '💠',
      ':recycle:': '♻️',
      ':end:': '🔚',
      ':back:': '🔙',
      ':on:': '🔛',
      ':soon:': '🔜',
      ':clock1:': '🕐',
      ':clock130:': '🕜',
      ':clock10:': '🕙',
      ':clock1030:': '🕥',
      ':clock11:': '🕚',
      ':clock1130:': '🕦',
      ':clock12:': '🕛',
      ':clock1230:': '🕧',
      ':clock2:': '🕑',
      ':clock230:': '🕝',
      ':clock3:': '🕒',
      ':clock330:': '🕞',
      ':clock4:': '🕓',
      ':clock430:': '🕟',
      ':clock5:': '🕔',
      ':clock530:': '🕠',
      ':clock6:': '🕕',
      ':clock630:': '🕡',
      ':clock7:': '🕖',
      ':clock730:': '🕢',
      ':clock8:': '🕗',
      ':clock830:': '🕣',
      ':clock9:': '🕘',
      ':clock930:': '🕤',
      ':heavy_dollar_sign:': '💲',
      ':copyright:': '©️',
      ':registered:': '®️',
      ':tm:': '™️',
      ':x:': '❌',
      ':heavy_exclamation_mark:': '❗',
      ':bangbang:': '‼️',
      ':interrobang:': '⁉️',
      ':o:': '⭕',
      ':heavy_multiplication_x:': '✖️',
      ':heavy_plus_sign:': '➕',
      ':heavy_minus_sign:': '➖',
      ':heavy_division_sign:': '➗',
      ':white_flower:': '💮',
      ':100:': '💯',
      ':heavy_check_mark:': '✔️',
      ':ballot_box_with_check:': '☑️',
      ':radio_button:': '🔘',
      ':link:': '🔗',
      ':curly_loop:': '➰',
      ':wavy_dash:': '〰️',
      ':part_alternation_mark:': '〽️',
  };
  /**
   * A map of unicode characters to their string representation.
   */
  const mapStringToUnicode = {
      ':100:': '1f4af',
      ':1234:': '1f522',
      ':interrobang:': '2049',
      ':tm:': '2122',
      ':information_source:': '2139',
      ':left_right_arrow:': '2194',
      ':arrow_up_down:': '2195',
      ':arrow_upper_left:': '2196',
      ':arrow_upper_right:': '2197',
      ':arrow_lower_right:': '2198',
      ':arrow_lower_left:': '2199',
      ':keyboard:': '2328',
      ':sunny:': '2600',
      ':cloud:': '2601',
      ':umbrella:': '2602',
      ':snowman:': '2603',
      ':comet:': '2604',
      ':ballot_box_with_check:': '2611',
      ':umbrella_with_rain_drops:': '2614',
      ':coffee:': '2615',
      ':shamrock:': '2618',
      ':skull_and_crossbones:': '2620',
      ':radioactive_sign:': '2622',
      ':biohazard_sign:': '2623',
      ':orthodox_cross:': '2626',
      ':wheel_of_dharma:': '2638',
      ':white_frowning_face:': '2639',
      ':aries:': '2648',
      ':taurus:': '2649',
      ':sagittarius:': '2650',
      ':capricorn:': '2651',
      ':aquarius:': '2652',
      ':pisces:': '2653',
      ':spades:': '2660',
      ':clubs:': '2663',
      ':hearts:': '2665',
      ':diamonds:': '2666',
      ':hotsprings:': '2668',
      ':hammer_and_pick:': '2692',
      ':anchor:': '2693',
      ':crossed_swords:': '2694',
      ':scales:': '2696',
      ':alembic:': '2697',
      ':gear:': '2699',
      ':scissors:': '2702',
      ':white_check_mark:': '2705',
      ':airplane:': '2708',
      ':email:': '2709',
      ':envelope:': '2709',
      ':black_nib:': '2712',
      ':heavy_check_mark:': '2714',
      ':heavy_multiplication_x:': '2716',
      ':star_of_david:': '2721',
      ':sparkles:': '2728',
      ':eight_spoked_asterisk:': '2733',
      ':eight_pointed_black_star:': '2734',
      ':snowflake:': '2744',
      ':sparkle:': '2747',
      ':question:': '2753',
      ':grey_question:': '2754',
      ':grey_exclamation:': '2755',
      ':exclamation:': '2757',
      ':heavy_exclamation_mark:': '2757',
      ':heavy_heart_exclamation_mark_ornament:': '2763',
      ':heart:': '2764',
      ':heavy_plus_sign:': '2795',
      ':heavy_minus_sign:': '2796',
      ':heavy_division_sign:': '2797',
      ':arrow_heading_up:': '2934',
      ':arrow_heading_down:': '2935',
      ':wavy_dash:': '3030',
      ':congratulations:': '3297',
      ':secret:': '3299',
      ':copyright:': '00a9',
      ':registered:': '00ae',
      ':bangbang:': '203c',
      ':leftwards_arrow_with_hook:': '21a9',
      ':arrow_right_hook:': '21aa',
      ':watch:': '231a',
      ':hourglass:': '231b',
      ':eject:': '23cf',
      ':fast_forward:': '23e9',
      ':rewind:': '23ea',
      ':arrow_double_up:': '23eb',
      ':arrow_double_down:': '23ec',
      ':black_right_pointing_double_triangle_with_vertical_bar:': '23ed',
      ':black_left_pointing_double_triangle_with_vertical_bar:': '23ee',
      ':black_right_pointing_triangle_with_double_vertical_bar:': '23ef',
      ':alarm_clock:': '23f0',
      ':stopwatch:': '23f1',
      ':timer_clock:': '23f2',
      ':hourglass_flowing_sand:': '23f3',
      ':double_vertical_bar:': '23f8',
      ':black_square_for_stop:': '23f9',
      ':black_circle_for_record:': '23fa',
      ':m:': '24c2',
      ':black_small_square:': '25aa',
      ':white_small_square:': '25ab',
      ':arrow_forward:': '25b6',
      ':arrow_backward:': '25c0',
      ':white_medium_square:': '25fb',
      ':black_medium_square:': '25fc',
      ':white_medium_small_square:': '25fd',
      ':black_medium_small_square:': '25fe',
      ':phone:': '260e',
      ':telephone:': '260e',
      ':point_up:': '261d',
      ':star_and_crescent:': '262a',
      ':peace_symbol:': '262e',
      ':yin_yang:': '262f',
      ':relaxed:': '263a',
      ':gemini:': '264a',
      ':cancer:': '264b',
      ':leo:': '264c',
      ':virgo:': '264d',
      ':libra:': '264e',
      ':scorpius:': '264f',
      ':recycle:': '267b',
      ':wheelchair:': '267f',
      ':atom_symbol:': '269b',
      ':fleur_de_lis:': '269c',
      ':warning:': '26a0',
      ':zap:': '26a1',
      ':white_circle:': '26aa',
      ':black_circle:': '26ab',
      ':coffin:': '26b0',
      ':funeral_urn:': '26b1',
      ':soccer:': '26bd',
      ':baseball:': '26be',
      ':snowman_without_snow:': '26c4',
      ':partly_sunny:': '26c5',
      ':thunder_cloud_and_rain:': '26c8',
      ':ophiuchus:': '26ce',
      ':pick:': '26cf',
      ':helmet_with_white_cross:': '26d1',
      ':chains:': '26d3',
      ':no_entry:': '26d4',
      ':shinto_shrine:': '26e9',
      ':church:': '26ea',
      ':mountain:': '26f0',
      ':umbrella_on_ground:': '26f1',
      ':fountain:': '26f2',
      ':golf:': '26f3',
      ':ferry:': '26f4',
      ':boat:': '26f5',
      ':sailboat:': '26f5',
      ':skier:': '26f7',
      ':ice_skate:': '26f8',
      ':person_with_ball:': '26f9',
      ':tent:': '26fa',
      ':fuelpump:': '26fd',
      ':fist:': '270a',
      ':hand:': '270b',
      ':raised_hand:': '270b',
      ':v:': '270c',
      ':writing_hand:': '270d',
      ':pencil2:': '270f',
      ':latin_cross:': '271d',
      ':x:': '274c',
      ':negative_squared_cross_mark:': '274e',
      ':arrow_right:': '27a1',
      ':curly_loop:': '27b0',
      ':loop:': '27bf',
      ':arrow_left:': '2b05',
      ':arrow_up:': '2b06',
      ':arrow_down:': '2b07',
      ':black_large_square:': '2b1b',
      ':white_large_square:': '2b1c',
      ':star:': '2b50',
      ':o:': '2b55',
      ':part_alternation_mark:': '303d',
      ':mahjong:': '1f004',
      ':black_joker:': '1f0cf',
      ':a:': '1f170',
      ':b:': '1f171',
      ':o2:': '1f17e',
      ':parking:': '1f17f',
      ':ab:': '1f18e',
      ':cl:': '1f191',
      ':cool:': '1f192',
      ':free:': '1f193',
      ':id:': '1f194',
      ':new:': '1f195',
      ':ng:': '1f196',
      ':ok:': '1f197',
      ':sos:': '1f198',
      ':up:': '1f199',
      ':vs:': '1f19a',
      ':koko:': '1f201',
      ':sa:': '1f202',
      ':u7121:': '1f21a',
      ':u6307:': '1f22f',
      ':u7981:': '1f232',
      ':u7a7a:': '1f233',
      ':u5408:': '1f234',
      ':u6e80:': '1f235',
      ':u6709:': '1f236',
      ':u6708:': '1f237',
      ':u7533:': '1f238',
      ':u5272:': '1f239',
      ':u55b6:': '1f23a',
      ':ideograph_advantage:': '1f250',
      ':accept:': '1f251',
      ':cyclone:': '1f300',
      ':foggy:': '1f301',
      ':closed_umbrella:': '1f302',
      ':night_with_stars:': '1f303',
      ':sunrise_over_mountains:': '1f304',
      ':sunrise:': '1f305',
      ':city_sunset:': '1f306',
      ':city_sunrise:': '1f307',
      ':rainbow:': '1f308',
      ':bridge_at_night:': '1f309',
      ':ocean:': '1f30a',
      ':volcano:': '1f30b',
      ':milky_way:': '1f30c',
      ':earth_africa:': '1f30d',
      ':earth_americas:': '1f30e',
      ':earth_asia:': '1f30f',
      ':globe_with_meridians:': '1f310',
      ':new_moon:': '1f311',
      ':waxing_crescent_moon:': '1f312',
      ':first_quarter_moon:': '1f313',
      ':moon:': '1f314',
      ':waxing_gibbous_moon:': '1f314',
      ':full_moon:': '1f315',
      ':waning_gibbous_moon:': '1f316',
      ':last_quarter_moon:': '1f317',
      ':waning_crescent_moon:': '1f318',
      ':crescent_moon:': '1f319',
      ':new_moon_with_face:': '1f31a',
      ':first_quarter_moon_with_face:': '1f31b',
      ':last_quarter_moon_with_face:': '1f31c',
      ':full_moon_with_face:': '1f31d',
      ':sun_with_face:': '1f31e',
      ':star2:': '1f31f',
      ':stars:': '1f320',
      ':thermometer:': '1f321',
      ':mostly_sunny:': '1f324',
      ':sun_small_cloud:': '1f324',
      ':barely_sunny:': '1f325',
      ':sun_behind_cloud:': '1f325',
      ':partly_sunny_rain:': '1f326',
      ':sun_behind_rain_cloud:': '1f326',
      ':rain_cloud:': '1f327',
      ':snow_cloud:': '1f328',
      ':lightning:': '1f329',
      ':lightning_cloud:': '1f329',
      ':tornado:': '1f32a',
      ':tornado_cloud:': '1f32a',
      ':fog:': '1f32b',
      ':wind_blowing_face:': '1f32c',
      ':hotdog:': '1f32d',
      ':taco:': '1f32e',
      ':burrito:': '1f32f',
      ':chestnut:': '1f330',
      ':seedling:': '1f331',
      ':evergreen_tree:': '1f332',
      ':deciduous_tree:': '1f333',
      ':palm_tree:': '1f334',
      ':cactus:': '1f335',
      ':hot_pepper:': '1f336',
      ':tulip:': '1f337',
      ':cherry_blossom:': '1f338',
      ':rose:': '1f339',
      ':hibiscus:': '1f33a',
      ':sunflower:': '1f33b',
      ':blossom:': '1f33c',
      ':corn:': '1f33d',
      ':ear_of_rice:': '1f33e',
      ':herb:': '1f33f',
      ':four_leaf_clover:': '1f340',
      ':maple_leaf:': '1f341',
      ':fallen_leaf:': '1f342',
      ':leaves:': '1f343',
      ':mushroom:': '1f344',
      ':tomato:': '1f345',
      ':eggplant:': '1f346',
      ':grapes:': '1f347',
      ':melon:': '1f348',
      ':watermelon:': '1f349',
      ':tangerine:': '1f34a',
      ':lemon:': '1f34b',
      ':banana:': '1f34c',
      ':pineapple:': '1f34d',
      ':apple:': '1f34e',
      ':green_apple:': '1f34f',
      ':pear:': '1f350',
      ':peach:': '1f351',
      ':cherries:': '1f352',
      ':strawberry:': '1f353',
      ':hamburger:': '1f354',
      ':pizza:': '1f355',
      ':meat_on_bone:': '1f356',
      ':poultry_leg:': '1f357',
      ':rice_cracker:': '1f358',
      ':rice_ball:': '1f359',
      ':rice:': '1f35a',
      ':curry:': '1f35b',
      ':ramen:': '1f35c',
      ':spaghetti:': '1f35d',
      ':bread:': '1f35e',
      ':fries:': '1f35f',
      ':sweet_potato:': '1f360',
      ':dango:': '1f361',
      ':oden:': '1f362',
      ':sushi:': '1f363',
      ':fried_shrimp:': '1f364',
      ':fish_cake:': '1f365',
      ':icecream:': '1f366',
      ':shaved_ice:': '1f367',
      ':ice_cream:': '1f368',
      ':doughnut:': '1f369',
      ':cookie:': '1f36a',
      ':chocolate_bar:': '1f36b',
      ':candy:': '1f36c',
      ':lollipop:': '1f36d',
      ':custard:': '1f36e',
      ':honey_pot:': '1f36f',
      ':cake:': '1f370',
      ':bento:': '1f371',
      ':stew:': '1f372',
      ':egg:': '1f373',
      ':fork_and_knife:': '1f374',
      ':tea:': '1f375',
      ':sake:': '1f376',
      ':wine_glass:': '1f377',
      ':cocktail:': '1f378',
      ':tropical_drink:': '1f379',
      ':beer:': '1f37a',
      ':beers:': '1f37b',
      ':baby_bottle:': '1f37c',
      ':knife_fork_plate:': '1f37d',
      ':champagne:': '1f37e',
      ':popcorn:': '1f37f',
      ':ribbon:': '1f380',
      ':gift:': '1f381',
      ':birthday:': '1f382',
      ':jack_o_lantern:': '1f383',
      ':christmas_tree:': '1f384',
      ':santa:': '1f385',
      ':fireworks:': '1f386',
      ':sparkler:': '1f387',
      ':balloon:': '1f388',
      ':tada:': '1f389',
      ':confetti_ball:': '1f38a',
      ':tanabata_tree:': '1f38b',
      ':crossed_flags:': '1f38c',
      ':bamboo:': '1f38d',
      ':dolls:': '1f38e',
      ':flags:': '1f38f',
      ':wind_chime:': '1f390',
      ':rice_scene:': '1f391',
      ':school_satchel:': '1f392',
      ':mortar_board:': '1f393',
      ':medal:': '1f396',
      ':reminder_ribbon:': '1f397',
      ':studio_microphone:': '1f399',
      ':level_slider:': '1f39a',
      ':control_knobs:': '1f39b',
      ':film_frames:': '1f39e',
      ':admission_tickets:': '1f39f',
      ':carousel_horse:': '1f3a0',
      ':ferris_wheel:': '1f3a1',
      ':roller_coaster:': '1f3a2',
      ':fishing_pole_and_fish:': '1f3a3',
      ':microphone:': '1f3a4',
      ':movie_camera:': '1f3a5',
      ':cinema:': '1f3a6',
      ':headphones:': '1f3a7',
      ':art:': '1f3a8',
      ':tophat:': '1f3a9',
      ':circus_tent:': '1f3aa',
      ':ticket:': '1f3ab',
      ':clapper:': '1f3ac',
      ':performing_arts:': '1f3ad',
      ':video_game:': '1f3ae',
      ':dart:': '1f3af',
      ':slot_machine:': '1f3b0',
      ':8ball:': '1f3b1',
      ':game_die:': '1f3b2',
      ':bowling:': '1f3b3',
      ':flower_playing_cards:': '1f3b4',
      ':musical_note:': '1f3b5',
      ':notes:': '1f3b6',
      ':saxophone:': '1f3b7',
      ':guitar:': '1f3b8',
      ':musical_keyboard:': '1f3b9',
      ':trumpet:': '1f3ba',
      ':violin:': '1f3bb',
      ':musical_score:': '1f3bc',
      ':running_shirt_with_sash:': '1f3bd',
      ':tennis:': '1f3be',
      ':ski:': '1f3bf',
      ':basketball:': '1f3c0',
      ':checkered_flag:': '1f3c1',
      ':snowboarder:': '1f3c2',
      ':runner:': '1f3c3',
      ':running:': '1f3c3',
      ':surfer:': '1f3c4',
      ':sports_medal:': '1f3c5',
      ':trophy:': '1f3c6',
      ':horse_racing:': '1f3c7',
      ':football:': '1f3c8',
      ':rugby_football:': '1f3c9',
      ':swimmer:': '1f3ca',
      ':weight_lifter:': '1f3cb',
      ':golfer:': '1f3cc',
      ':racing_motorcycle:': '1f3cd',
      ':racing_car:': '1f3ce',
      ':cricket_bat_and_ball:': '1f3cf',
      ':volleyball:': '1f3d0',
      ':field_hockey_stick_and_ball:': '1f3d1',
      ':ice_hockey_stick_and_puck:': '1f3d2',
      ':table_tennis_paddle_and_ball:': '1f3d3',
      ':snow_capped_mountain:': '1f3d4',
      ':camping:': '1f3d5',
      ':beach_with_umbrella:': '1f3d6',
      ':building_construction:': '1f3d7',
      ':house_buildings:': '1f3d8',
      ':cityscape:': '1f3d9',
      ':derelict_house_building:': '1f3da',
      ':classical_building:': '1f3db',
      ':desert:': '1f3dc',
      ':desert_island:': '1f3dd',
      ':national_park:': '1f3de',
      ':stadium:': '1f3df',
      ':house:': '1f3e0',
      ':house_with_garden:': '1f3e1',
      ':office:': '1f3e2',
      ':post_office:': '1f3e3',
      ':european_post_office:': '1f3e4',
      ':hospital:': '1f3e5',
      ':bank:': '1f3e6',
      ':atm:': '1f3e7',
      ':hotel:': '1f3e8',
      ':love_hotel:': '1f3e9',
      ':convenience_store:': '1f3ea',
      ':school:': '1f3eb',
      ':department_store:': '1f3ec',
      ':factory:': '1f3ed',
      ':izakaya_lantern:': '1f3ee',
      ':lantern:': '1f3ee',
      ':japanese_castle:': '1f3ef',
      ':european_castle:': '1f3f0',
      ':waving_white_flag:': '1f3f3',
      ':waving_black_flag:': '1f3f4',
      ':rosette:': '1f3f5',
      ':label:': '1f3f7',
      ':badminton_racquet_and_shuttlecock:': '1f3f8',
      ':bow_and_arrow:': '1f3f9',
      ':amphora:': '1f3fa',
      ':skin-tone-2:': '1f3fb',
      ':skin-tone-3:': '1f3fc',
      ':skin-tone-4:': '1f3fd',
      ':skin-tone-5:': '1f3fe',
      ':skin-tone-6:': '1f3ff',
      ':rat:': '1f400',
      ':mouse2:': '1f401',
      ':ox:': '1f402',
      ':water_buffalo:': '1f403',
      ':cow2:': '1f404',
      ':tiger2:': '1f405',
      ':leopard:': '1f406',
      ':rabbit2:': '1f407',
      ':cat2:': '1f408',
      ':dragon:': '1f409',
      ':crocodile:': '1f40a',
      ':whale2:': '1f40b',
      ':snail:': '1f40c',
      ':snake:': '1f40d',
      ':racehorse:': '1f40e',
      ':ram:': '1f40f',
      ':goat:': '1f410',
      ':sheep:': '1f411',
      ':monkey:': '1f412',
      ':rooster:': '1f413',
      ':chicken:': '1f414',
      ':dog2:': '1f415',
      ':pig2:': '1f416',
      ':boar:': '1f417',
      ':elephant:': '1f418',
      ':octopus:': '1f419',
      ':shell:': '1f41a',
      ':bug:': '1f41b',
      ':ant:': '1f41c',
      ':bee:': '1f41d',
      ':honeybee:': '1f41d',
      ':beetle:': '1f41e',
      ':fish:': '1f41f',
      ':tropical_fish:': '1f420',
      ':blowfish:': '1f421',
      ':turtle:': '1f422',
      ':hatching_chick:': '1f423',
      ':baby_chick:': '1f424',
      ':hatched_chick:': '1f425',
      ':bird:': '1f426',
      ':penguin:': '1f427',
      ':koala:': '1f428',
      ':poodle:': '1f429',
      ':dromedary_camel:': '1f42a',
      ':camel:': '1f42b',
      ':dolphin:': '1f42c',
      ':flipper:': '1f42c',
      ':mouse:': '1f42d',
      ':cow:': '1f42e',
      ':tiger:': '1f42f',
      ':rabbit:': '1f430',
      ':cat:': '1f431',
      ':dragon_face:': '1f432',
      ':whale:': '1f433',
      ':horse:': '1f434',
      ':monkey_face:': '1f435',
      ':dog:': '1f436',
      ':pig:': '1f437',
      ':frog:': '1f438',
      ':hamster:': '1f439',
      ':wolf:': '1f43a',
      ':bear:': '1f43b',
      ':panda_face:': '1f43c',
      ':pig_nose:': '1f43d',
      ':feet:': '1f43e',
      ':paw_prints:': '1f43e',
      ':chipmunk:': '1f43f',
      ':eyes:': '1f440',
      ':eye:': '1f441',
      ':ear:': '1f442',
      ':nose:': '1f443',
      ':lips:': '1f444',
      ':tongue:': '1f445',
      ':point_up_2:': '1f446',
      ':point_down:': '1f447',
      ':point_left:': '1f448',
      ':point_right:': '1f449',
      ':facepunch:': '1f44a',
      ':punch:': '1f44a',
      ':wave:': '1f44b',
      ':ok_hand:': '1f44c',
      ':+1:': '1f44d',
      ':thumbsup:': '1f44d',
      ':-1:': '1f44e',
      ':thumbsdown:': '1f44e',
      ':clap:': '1f44f',
      ':open_hands:': '1f450',
      ':crown:': '1f451',
      ':womans_hat:': '1f452',
      ':eyeglasses:': '1f453',
      ':necktie:': '1f454',
      ':shirt:': '1f455',
      ':tshirt:': '1f455',
      ':jeans:': '1f456',
      ':dress:': '1f457',
      ':kimono:': '1f458',
      ':bikini:': '1f459',
      ':womans_clothes:': '1f45a',
      ':purse:': '1f45b',
      ':handbag:': '1f45c',
      ':pouch:': '1f45d',
      ':mans_shoe:': '1f45e',
      ':shoe:': '1f45e',
      ':athletic_shoe:': '1f45f',
      ':high_heel:': '1f460',
      ':sandal:': '1f461',
      ':boot:': '1f462',
      ':footprints:': '1f463',
      ':bust_in_silhouette:': '1f464',
      ':busts_in_silhouette:': '1f465',
      ':boy:': '1f466',
      ':girl:': '1f467',
      ':man:': '1f468',
      ':woman:': '1f469',
      ':family:': '1f46a',
      ':man-woman-boy:': '1f46a',
      ':couple:': '1f46b',
      ':man_and_woman_holding_hands:': '1f46b',
      ':two_men_holding_hands:': '1f46c',
      ':two_women_holding_hands:': '1f46d',
      ':cop:': '1f46e',
      ':dancers:': '1f46f',
      ':bride_with_veil:': '1f470',
      ':person_with_blond_hair:': '1f471',
      ':man_with_gua_pi_mao:': '1f472',
      ':man_with_turban:': '1f473',
      ':older_man:': '1f474',
      ':older_woman:': '1f475',
      ':baby:': '1f476',
      ':construction_worker:': '1f477',
      ':princess:': '1f478',
      ':japanese_ogre:': '1f479',
      ':japanese_goblin:': '1f47a',
      ':ghost:': '1f47b',
      ':angel:': '1f47c',
      ':alien:': '1f47d',
      ':space_invader:': '1f47e',
      ':imp:': '1f47f',
      ':skull:': '1f480',
      ':information_desk_person:': '1f481',
      ':guardsman:': '1f482',
      ':dancer:': '1f483',
      ':lipstick:': '1f484',
      ':nail_care:': '1f485',
      ':massage:': '1f486',
      ':haircut:': '1f487',
      ':barber:': '1f488',
      ':syringe:': '1f489',
      ':pill:': '1f48a',
      ':kiss:': '1f48b',
      ':love_letter:': '1f48c',
      ':ring:': '1f48d',
      ':gem:': '1f48e',
      ':couplekiss:': '1f48f',
      ':bouquet:': '1f490',
      ':couple_with_heart:': '1f491',
      ':wedding:': '1f492',
      ':heartbeat:': '1f493',
      ':broken_heart:': '1f494',
      ':two_hearts:': '1f495',
      ':sparkling_heart:': '1f496',
      ':heartpulse:': '1f497',
      ':cupid:': '1f498',
      ':blue_heart:': '1f499',
      ':green_heart:': '1f49a',
      ':yellow_heart:': '1f49b',
      ':purple_heart:': '1f49c',
      ':gift_heart:': '1f49d',
      ':revolving_hearts:': '1f49e',
      ':heart_decoration:': '1f49f',
      ':diamond_shape_with_a_dot_inside:': '1f4a0',
      ':bulb:': '1f4a1',
      ':anger:': '1f4a2',
      ':bomb:': '1f4a3',
      ':zzz:': '1f4a4',
      ':boom:': '1f4a5',
      ':collision:': '1f4a5',
      ':sweat_drops:': '1f4a6',
      ':droplet:': '1f4a7',
      ':dash:': '1f4a8',
      ':hankey:': '1f4a9',
      ':poop:': '1f4a9',
      ':shit:': '1f4a9',
      ':muscle:': '1f4aa',
      ':dizzy:': '1f4ab',
      ':speech_balloon:': '1f4ac',
      ':thought_balloon:': '1f4ad',
      ':white_flower:': '1f4ae',
      ':moneybag:': '1f4b0',
      ':currency_exchange:': '1f4b1',
      ':heavy_dollar_sign:': '1f4b2',
      ':credit_card:': '1f4b3',
      ':yen:': '1f4b4',
      ':dollar:': '1f4b5',
      ':euro:': '1f4b6',
      ':pound:': '1f4b7',
      ':money_with_wings:': '1f4b8',
      ':chart:': '1f4b9',
      ':seat:': '1f4ba',
      ':computer:': '1f4bb',
      ':briefcase:': '1f4bc',
      ':minidisc:': '1f4bd',
      ':floppy_disk:': '1f4be',
      ':cd:': '1f4bf',
      ':dvd:': '1f4c0',
      ':file_folder:': '1f4c1',
      ':open_file_folder:': '1f4c2',
      ':page_with_curl:': '1f4c3',
      ':page_facing_up:': '1f4c4',
      ':date:': '1f4c5',
      ':calendar:': '1f4c6',
      ':card_index:': '1f4c7',
      ':chart_with_upwards_trend:': '1f4c8',
      ':chart_with_downwards_trend:': '1f4c9',
      ':bar_chart:': '1f4ca',
      ':clipboard:': '1f4cb',
      ':pushpin:': '1f4cc',
      ':round_pushpin:': '1f4cd',
      ':paperclip:': '1f4ce',
      ':straight_ruler:': '1f4cf',
      ':triangular_ruler:': '1f4d0',
      ':bookmark_tabs:': '1f4d1',
      ':ledger:': '1f4d2',
      ':notebook:': '1f4d3',
      ':notebook_with_decorative_cover:': '1f4d4',
      ':closed_book:': '1f4d5',
      ':book:': '1f4d6',
      ':open_book:': '1f4d6',
      ':green_book:': '1f4d7',
      ':blue_book:': '1f4d8',
      ':orange_book:': '1f4d9',
      ':books:': '1f4da',
      ':name_badge:': '1f4db',
      ':scroll:': '1f4dc',
      ':memo:': '1f4dd',
      ':pencil:': '1f4dd',
      ':telephone_receiver:': '1f4de',
      ':pager:': '1f4df',
      ':fax:': '1f4e0',
      ':satellite_antenna:': '1f4e1',
      ':loudspeaker:': '1f4e2',
      ':mega:': '1f4e3',
      ':outbox_tray:': '1f4e4',
      ':inbox_tray:': '1f4e5',
      ':package:': '1f4e6',
      ':e-mail:': '1f4e7',
      ':incoming_envelope:': '1f4e8',
      ':envelope_with_arrow:': '1f4e9',
      ':mailbox_closed:': '1f4ea',
      ':mailbox:': '1f4eb',
      ':mailbox_with_mail:': '1f4ec',
      ':mailbox_with_no_mail:': '1f4ed',
      ':postbox:': '1f4ee',
      ':postal_horn:': '1f4ef',
      ':newspaper:': '1f4f0',
      ':iphone:': '1f4f1',
      ':calling:': '1f4f2',
      ':vibration_mode:': '1f4f3',
      ':mobile_phone_off:': '1f4f4',
      ':no_mobile_phones:': '1f4f5',
      ':signal_strength:': '1f4f6',
      ':camera:': '1f4f7',
      ':camera_with_flash:': '1f4f8',
      ':video_camera:': '1f4f9',
      ':tv:': '1f4fa',
      ':radio:': '1f4fb',
      ':vhs:': '1f4fc',
      ':film_projector:': '1f4fd',
      ':prayer_beads:': '1f4ff',
      ':twisted_rightwards_arrows:': '1f500',
      ':repeat:': '1f501',
      ':repeat_one:': '1f502',
      ':arrows_clockwise:': '1f503',
      ':arrows_counterclockwise:': '1f504',
      ':low_brightness:': '1f505',
      ':high_brightness:': '1f506',
      ':mute:': '1f507',
      ':speaker:': '1f508',
      ':sound:': '1f509',
      ':loud_sound:': '1f50a',
      ':battery:': '1f50b',
      ':electric_plug:': '1f50c',
      ':mag:': '1f50d',
      ':mag_right:': '1f50e',
      ':lock_with_ink_pen:': '1f50f',
      ':closed_lock_with_key:': '1f510',
      ':key:': '1f511',
      ':lock:': '1f512',
      ':unlock:': '1f513',
      ':bell:': '1f514',
      ':no_bell:': '1f515',
      ':bookmark:': '1f516',
      ':link:': '1f517',
      ':radio_button:': '1f518',
      ':back:': '1f519',
      ':end:': '1f51a',
      ':on:': '1f51b',
      ':soon:': '1f51c',
      ':top:': '1f51d',
      ':underage:': '1f51e',
      ':keycap_ten:': '1f51f',
      ':capital_abcd:': '1f520',
      ':abcd:': '1f521',
      ':symbols:': '1f523',
      ':abc:': '1f524',
      ':fire:': '1f525',
      ':flashlight:': '1f526',
      ':wrench:': '1f527',
      ':hammer:': '1f528',
      ':nut_and_bolt:': '1f529',
      ':hocho:': '1f52a',
      ':knife:': '1f52a',
      ':gun:': '1f52b',
      ':microscope:': '1f52c',
      ':telescope:': '1f52d',
      ':crystal_ball:': '1f52e',
      ':six_pointed_star:': '1f52f',
      ':beginner:': '1f530',
      ':trident:': '1f531',
      ':black_square_button:': '1f532',
      ':white_square_button:': '1f533',
      ':red_circle:': '1f534',
      ':large_blue_circle:': '1f535',
      ':large_orange_diamond:': '1f536',
      ':large_blue_diamond:': '1f537',
      ':small_orange_diamond:': '1f538',
      ':small_blue_diamond:': '1f539',
      ':small_red_triangle:': '1f53a',
      ':small_red_triangle_down:': '1f53b',
      ':arrow_up_small:': '1f53c',
      ':arrow_down_small:': '1f53d',
      ':om_symbol:': '1f549',
      ':dove_of_peace:': '1f54a',
      ':kaaba:': '1f54b',
      ':mosque:': '1f54c',
      ':synagogue:': '1f54d',
      ':menorah_with_nine_branches:': '1f54e',
      ':clock1:': '1f550',
      ':clock2:': '1f551',
      ':clock3:': '1f552',
      ':clock4:': '1f553',
      ':clock5:': '1f554',
      ':clock6:': '1f555',
      ':clock7:': '1f556',
      ':clock8:': '1f557',
      ':clock9:': '1f558',
      ':clock10:': '1f559',
      ':clock11:': '1f55a',
      ':clock12:': '1f55b',
      ':clock130:': '1f55c',
      ':clock230:': '1f55d',
      ':clock330:': '1f55e',
      ':clock430:': '1f55f',
      ':clock530:': '1f560',
      ':clock630:': '1f561',
      ':clock730:': '1f562',
      ':clock830:': '1f563',
      ':clock930:': '1f564',
      ':clock1030:': '1f565',
      ':clock1130:': '1f566',
      ':clock1230:': '1f567',
      ':candle:': '1f56f',
      ':mantelpiece_clock:': '1f570',
      ':hole:': '1f573',
      ':man_in_business_suit_levitating:': '1f574',
      ':sleuth_or_spy:': '1f575',
      ':dark_sunglasses:': '1f576',
      ':spider:': '1f577',
      ':spider_web:': '1f578',
      ':joystick:': '1f579',
      ':linked_paperclips:': '1f587',
      ':lower_left_ballpoint_pen:': '1f58a',
      ':lower_left_fountain_pen:': '1f58b',
      ':lower_left_paintbrush:': '1f58c',
      ':lower_left_crayon:': '1f58d',
      ':raised_hand_with_fingers_splayed:': '1f590',
      ':middle_finger:': '1f595',
      ':reversed_hand_with_middle_finger_extended:': '1f595',
      ':spock-hand:': '1f596',
      ':desktop_computer:': '1f5a5',
      ':printer:': '1f5a8',
      ':three_button_mouse:': '1f5b1',
      ':trackball:': '1f5b2',
      ':frame_with_picture:': '1f5bc',
      ':card_index_dividers:': '1f5c2',
      ':card_file_box:': '1f5c3',
      ':file_cabinet:': '1f5c4',
      ':wastebasket:': '1f5d1',
      ':spiral_note_pad:': '1f5d2',
      ':spiral_calendar_pad:': '1f5d3',
      ':compression:': '1f5dc',
      ':old_key:': '1f5dd',
      ':rolled_up_newspaper:': '1f5de',
      ':dagger_knife:': '1f5e1',
      ':speaking_head_in_silhouette:': '1f5e3',
      ':left_speech_bubble:': '1f5e8',
      ':right_anger_bubble:': '1f5ef',
      ':ballot_box_with_ballot:': '1f5f3',
      ':world_map:': '1f5fa',
      ':mount_fuji:': '1f5fb',
      ':tokyo_tower:': '1f5fc',
      ':statue_of_liberty:': '1f5fd',
      ':japan:': '1f5fe',
      ':moyai:': '1f5ff',
      ':grinning:': '1f600',
      ':grin:': '1f601',
      ':joy:': '1f602',
      ':smiley:': '1f603',
      ':smile:': '1f604',
      ':sweat_smile:': '1f605',
      ':laughing:': '1f606',
      ':satisfied:': '1f606',
      ':innocent:': '1f607',
      ':smiling_imp:': '1f608',
      ':wink:': '1f609',
      ':blush:': '1f60a',
      ':yum:': '1f60b',
      ':relieved:': '1f60c',
      ':heart_eyes:': '1f60d',
      ':sunglasses:': '1f60e',
      ':smirk:': '1f60f',
      ':neutral_face:': '1f610',
      ':expressionless:': '1f611',
      ':unamused:': '1f612',
      ':sweat:': '1f613',
      ':pensive:': '1f614',
      ':confused:': '1f615',
      ':confounded:': '1f616',
      ':kissing:': '1f617',
      ':kissing_heart:': '1f618',
      ':kissing_smiling_eyes:': '1f619',
      ':kissing_closed_eyes:': '1f61a',
      ':stuck_out_tongue:': '1f61b',
      ':stuck_out_tongue_winking_eye:': '1f61c',
      ':stuck_out_tongue_closed_eyes:': '1f61d',
      ':disappointed:': '1f61e',
      ':worried:': '1f61f',
      ':angry:': '1f620',
      ':rage:': '1f621',
      ':cry:': '1f622',
      ':persevere:': '1f623',
      ':triumph:': '1f624',
      ':disappointed_relieved:': '1f625',
      ':frowning:': '1f626',
      ':anguished:': '1f627',
      ':fearful:': '1f628',
      ':weary:': '1f629',
      ':sleepy:': '1f62a',
      ':tired_face:': '1f62b',
      ':grimacing:': '1f62c',
      ':sob:': '1f62d',
      ':open_mouth:': '1f62e',
      ':hushed:': '1f62f',
      ':cold_sweat:': '1f630',
      ':scream:': '1f631',
      ':astonished:': '1f632',
      ':flushed:': '1f633',
      ':sleeping:': '1f634',
      ':dizzy_face:': '1f635',
      ':no_mouth:': '1f636',
      ':mask:': '1f637',
      ':smile_cat:': '1f638',
      ':joy_cat:': '1f639',
      ':smiley_cat:': '1f63a',
      ':heart_eyes_cat:': '1f63b',
      ':smirk_cat:': '1f63c',
      ':kissing_cat:': '1f63d',
      ':pouting_cat:': '1f63e',
      ':crying_cat_face:': '1f63f',
      ':scream_cat:': '1f640',
      ':slightly_frowning_face:': '1f641',
      ':slightly_smiling_face:': '1f642',
      ':upside_down_face:': '1f643',
      ':face_with_rolling_eyes:': '1f644',
      ':no_good:': '1f645',
      ':ok_woman:': '1f646',
      ':bow:': '1f647',
      ':see_no_evil:': '1f648',
      ':hear_no_evil:': '1f649',
      ':speak_no_evil:': '1f64a',
      ':raising_hand:': '1f64b',
      ':raised_hands:': '1f64c',
      ':person_frowning:': '1f64d',
      ':person_with_pouting_face:': '1f64e',
      ':pray:': '1f64f',
      ':rocket:': '1f680',
      ':helicopter:': '1f681',
      ':steam_locomotive:': '1f682',
      ':railway_car:': '1f683',
      ':bullettrain_side:': '1f684',
      ':bullettrain_front:': '1f685',
      ':train2:': '1f686',
      ':metro:': '1f687',
      ':light_rail:': '1f688',
      ':station:': '1f689',
      ':tram:': '1f68a',
      ':train:': '1f68b',
      ':bus:': '1f68c',
      ':oncoming_bus:': '1f68d',
      ':trolleybus:': '1f68e',
      ':busstop:': '1f68f',
      ':minibus:': '1f690',
      ':ambulance:': '1f691',
      ':fire_engine:': '1f692',
      ':police_car:': '1f693',
      ':oncoming_police_car:': '1f694',
      ':taxi:': '1f695',
      ':oncoming_taxi:': '1f696',
      ':car:': '1f697',
      ':red_car:': '1f697',
      ':oncoming_automobile:': '1f698',
      ':blue_car:': '1f699',
      ':truck:': '1f69a',
      ':articulated_lorry:': '1f69b',
      ':tractor:': '1f69c',
      ':monorail:': '1f69d',
      ':mountain_railway:': '1f69e',
      ':suspension_railway:': '1f69f',
      ':mountain_cableway:': '1f6a0',
      ':aerial_tramway:': '1f6a1',
      ':ship:': '1f6a2',
      ':rowboat:': '1f6a3',
      ':speedboat:': '1f6a4',
      ':traffic_light:': '1f6a5',
      ':vertical_traffic_light:': '1f6a6',
      ':construction:': '1f6a7',
      ':rotating_light:': '1f6a8',
      ':triangular_flag_on_post:': '1f6a9',
      ':door:': '1f6aa',
      ':no_entry_sign:': '1f6ab',
      ':smoking:': '1f6ac',
      ':no_smoking:': '1f6ad',
      ':put_litter_in_its_place:': '1f6ae',
      ':do_not_litter:': '1f6af',
      ':potable_water:': '1f6b0',
      ':non-potable_water:': '1f6b1',
      ':bike:': '1f6b2',
      ':no_bicycles:': '1f6b3',
      ':bicyclist:': '1f6b4',
      ':mountain_bicyclist:': '1f6b5',
      ':walking:': '1f6b6',
      ':no_pedestrians:': '1f6b7',
      ':children_crossing:': '1f6b8',
      ':mens:': '1f6b9',
      ':womens:': '1f6ba',
      ':restroom:': '1f6bb',
      ':baby_symbol:': '1f6bc',
      ':toilet:': '1f6bd',
      ':wc:': '1f6be',
      ':shower:': '1f6bf',
      ':bath:': '1f6c0',
      ':bathtub:': '1f6c1',
      ':passport_control:': '1f6c2',
      ':customs:': '1f6c3',
      ':baggage_claim:': '1f6c4',
      ':left_luggage:': '1f6c5',
      ':couch_and_lamp:': '1f6cb',
      ':sleeping_accommodation:': '1f6cc',
      ':shopping_bags:': '1f6cd',
      ':bellhop_bell:': '1f6ce',
      ':bed:': '1f6cf',
      ':place_of_worship:': '1f6d0',
      ':hammer_and_wrench:': '1f6e0',
      ':shield:': '1f6e1',
      ':oil_drum:': '1f6e2',
      ':motorway:': '1f6e3',
      ':railway_track:': '1f6e4',
      ':motor_boat:': '1f6e5',
      ':small_airplane:': '1f6e9',
      ':airplane_departure:': '1f6eb',
      ':airplane_arriving:': '1f6ec',
      ':satellite:': '1f6f0',
      ':passenger_ship:': '1f6f3',
      ':zipper_mouth_face:': '1f910',
      ':money_mouth_face:': '1f911',
      ':face_with_thermometer:': '1f912',
      ':nerd_face:': '1f913',
      ':thinking_face:': '1f914',
      ':face_with_head_bandage:': '1f915',
      ':robot_face:': '1f916',
      ':hugging_face:': '1f917',
      ':the_horns:': '1f918',
      ':sign_of_the_horns:': '1f918',
      ':crab:': '1f980',
      ':lion_face:': '1f981',
      ':scorpion:': '1f982',
      ':turkey:': '1f983',
      ':unicorn_face:': '1f984',
      ':cheese_wedge:': '1f9c0',
      ':hash:': '0023-20e3',
      ':keycap_star:': '002a-20e3',
      ':zero:': '0030-20e3',
      ':one:': '0031-20e3',
      ':two:': '0032-20e3',
      ':three:': '0033-20e3',
      ':four:': '0034-20e3',
      ':five:': '0035-20e3',
      ':six:': '0036-20e3',
      ':seven:': '0037-20e3',
      ':eight:': '0038-20e3',
      ':nine:': '0039-20e3',
      ':man-man-boy:': '1f468-200d-1f468-200d-1f466',
      ':man-man-boy-boy:': '1f468-200d-1f468-200d-1f466-200d-1f466',
      ':man-man-girl:': '1f468-200d-1f468-200d-1f467',
      ':man-man-girl-boy:': '1f468-200d-1f468-200d-1f467-200d-1f466',
      ':man-man-girl-girl:': '1f468-200d-1f468-200d-1f467-200d-1f467',
      ':man-woman-boy-boy:': '1f468-200d-1f469-200d-1f466-200d-1f466',
      ':man-woman-girl:': '1f468-200d-1f469-200d-1f467',
      ':man-woman-girl-boy:': '1f468-200d-1f469-200d-1f467-200d-1f466',
      ':man-woman-girl-girl:': '1f468-200d-1f469-200d-1f467-200d-1f467',
      ':man-heart-man:': '1f468-200d-2764-fe0f-200d-1f468',
      ':man-kiss-man:': '1f468-200d-2764-fe0f-200d-1f48b-200d-1f468',
      ':woman-woman-boy:': '1f469-200d-1f469-200d-1f466',
      ':woman-woman-boy-boy:': '1f469-200d-1f469-200d-1f466-200d-1f466',
      ':woman-woman-girl:': '1f469-200d-1f469-200d-1f467',
      ':woman-woman-girl-boy:': '1f469-200d-1f469-200d-1f467-200d-1f466',
      ':woman-woman-girl-girl:': '1f469-200d-1f469-200d-1f467-200d-1f467',
      ':woman-heart-woman:': '1f469-200d-2764-fe0f-200d-1f469',
      ':woman-kiss-woman:': '1f469-200d-2764-fe0f-200d-1f48b-200d-1f469',
  };
  /**
   * Set of the functions that are in the prototype of the object and not to convert
   */
  const objectPrototypesFunctions = new Set([
      '__defineGetter__',
      '__defineSetter__',
      '__lookupGetter__',
      '__lookupSetter__',
      '__proto__',
      'constructor',
      'hasOwnProperty',
      'isPrototypeOf',
      'propertyIsEnumerable',
      'toLocaleString',
      'toString',
      'valueOf',
  ]);
  /**
   *
   * Function to check if in the string parameter there is some emoji and in case convert it.
   *
   * @param text
   * @returns the text with the emojis converted
   */
  const checkText$1 = (text) => {
      const words = text && text.trimStart().split(' ');
      const newText = [];
      if (words) {
          words.forEach((word) => {
              let w = word;
              if (word in objectPrototypesFunctions) {
                  w = word;
              }
              else if (word in emojiMap$1) {
                  w = emojiMap$1[word];
              }
              newText.push(w);
          });
      }
      return newText.join(' ');
  };
  /**
   *
   * function to get the keys of an object that starts with a specific string
   *
   * @param obj
   * @param start
   * @returns string array
   */
  const keysStartingWith = (obj, start) => Object.keys(obj).filter((key) => key.startsWith(start));
  /**
   *
   * Function to check if in the string parameter there is some emoji but
   * with autosuggestion, so if there is only one emoji key in the map starting with the string, it use it.
   *
   * @param text
   * @returns the text with the emojis converted
   */
  const checkTextWithAutoSuggestions = (text) => {
      const words = text && text.trimStart().split(' ');
      const newText = [];
      if (words) {
          words.forEach((word) => {
              let w = word;
              if (word in objectPrototypesFunctions) {
                  w = word;
              }
              else if (word in emojiMap$1) {
                  w = emojiMap$1[word];
              }
              else {
                  const emojiArray = keysStartingWith(emojiMap$1, word);
                  if (emojiArray.length === 1) {
                      w = emojiMap$1[emojiArray[0]];
                  }
              }
              newText.push(w);
          });
      }
      return newText.join(' ');
  };
  /**
   *
   * Function to convert a unicode string to an emoji
   *
   * @param text
   * @returns string emoji
   */
  const fromUnicodeToEmoji = (text) => String.fromCodePoint(parseInt(text, 16));
  /**
   *
   * Function to check if in the string parameter there is some emoji but
   * it use the map with unicode char instead of emoji,
   * so if there is only one emoji key in the map starting with the string, it use it.
   *
   * @param text
   * @returns the text with the emojis converted
   */
  const checkTextWithAutoSuggestionsAndUnicode = (text) => {
      const words = text && text.trimStart().split(' ');
      const newText = [];
      if (words) {
          words.forEach((word) => {
              let w = word;
              if (word in objectPrototypesFunctions) {
                  w = word;
              }
              else if (word in mapStringToUnicode) {
                  w = fromUnicodeToEmoji(mapStringToUnicode[word]);
              }
              else {
                  const emojiArray = keysStartingWith(mapStringToUnicode, word);
                  if (emojiArray.length === 1) {
                      w = fromUnicodeToEmoji(mapStringToUnicode[emojiArray[0]]);
                  }
              }
              newText.push(w);
          });
      }
      return newText.join(' ');
  };

  var smile2emoji = /*#__PURE__*/Object.freeze({
    __proto__: null,
    checkText: checkText$1,
    checkTextWithAutoSuggestions: checkTextWithAutoSuggestions,
    checkTextWithAutoSuggestionsAndUnicode: checkTextWithAutoSuggestionsAndUnicode,
    emojiMap: emojiMap$1,
    fromUnicodeToEmoji: fromUnicodeToEmoji,
    keysStartingWith: keysStartingWith,
    mapStringToUnicode: mapStringToUnicode
  });

  var lib = {};

  var namedReferences = {};

  var hasRequiredNamedReferences;

  function requireNamedReferences () {
  	if (hasRequiredNamedReferences) return namedReferences;
  	hasRequiredNamedReferences = 1;
  Object.defineProperty(namedReferences,"__esModule",{value:true});namedReferences.bodyRegExps={xml:/&(?:#\d+|#[xX][\da-fA-F]+|[0-9a-zA-Z]+);?/g,html4:/&notin;|&(?:nbsp|iexcl|cent|pound|curren|yen|brvbar|sect|uml|copy|ordf|laquo|not|shy|reg|macr|deg|plusmn|sup2|sup3|acute|micro|para|middot|cedil|sup1|ordm|raquo|frac14|frac12|frac34|iquest|Agrave|Aacute|Acirc|Atilde|Auml|Aring|AElig|Ccedil|Egrave|Eacute|Ecirc|Euml|Igrave|Iacute|Icirc|Iuml|ETH|Ntilde|Ograve|Oacute|Ocirc|Otilde|Ouml|times|Oslash|Ugrave|Uacute|Ucirc|Uuml|Yacute|THORN|szlig|agrave|aacute|acirc|atilde|auml|aring|aelig|ccedil|egrave|eacute|ecirc|euml|igrave|iacute|icirc|iuml|eth|ntilde|ograve|oacute|ocirc|otilde|ouml|divide|oslash|ugrave|uacute|ucirc|uuml|yacute|thorn|yuml|quot|amp|lt|gt|#\d+|#[xX][\da-fA-F]+|[0-9a-zA-Z]+);?/g,html5:/&centerdot;|&copysr;|&divideontimes;|&gtcc;|&gtcir;|&gtdot;|&gtlPar;|&gtquest;|&gtrapprox;|&gtrarr;|&gtrdot;|&gtreqless;|&gtreqqless;|&gtrless;|&gtrsim;|&ltcc;|&ltcir;|&ltdot;|&lthree;|&ltimes;|&ltlarr;|&ltquest;|&ltrPar;|&ltri;|&ltrie;|&ltrif;|&notin;|&notinE;|&notindot;|&notinva;|&notinvb;|&notinvc;|&notni;|&notniva;|&notnivb;|&notnivc;|&parallel;|&timesb;|&timesbar;|&timesd;|&(?:AElig|AMP|Aacute|Acirc|Agrave|Aring|Atilde|Auml|COPY|Ccedil|ETH|Eacute|Ecirc|Egrave|Euml|GT|Iacute|Icirc|Igrave|Iuml|LT|Ntilde|Oacute|Ocirc|Ograve|Oslash|Otilde|Ouml|QUOT|REG|THORN|Uacute|Ucirc|Ugrave|Uuml|Yacute|aacute|acirc|acute|aelig|agrave|amp|aring|atilde|auml|brvbar|ccedil|cedil|cent|copy|curren|deg|divide|eacute|ecirc|egrave|eth|euml|frac12|frac14|frac34|gt|iacute|icirc|iexcl|igrave|iquest|iuml|laquo|lt|macr|micro|middot|nbsp|not|ntilde|oacute|ocirc|ograve|ordf|ordm|oslash|otilde|ouml|para|plusmn|pound|quot|raquo|reg|sect|shy|sup1|sup2|sup3|szlig|thorn|times|uacute|ucirc|ugrave|uml|uuml|yacute|yen|yuml|#\d+|#[xX][\da-fA-F]+|[0-9a-zA-Z]+);?/g};namedReferences.namedReferences={xml:{entities:{"&lt;":"<","&gt;":">","&quot;":'"',"&apos;":"'","&amp;":"&"},characters:{"<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;","&":"&amp;"}},html4:{entities:{"&apos;":"'","&nbsp":" ","&nbsp;":" ","&iexcl":"¡","&iexcl;":"¡","&cent":"¢","&cent;":"¢","&pound":"£","&pound;":"£","&curren":"¤","&curren;":"¤","&yen":"¥","&yen;":"¥","&brvbar":"¦","&brvbar;":"¦","&sect":"§","&sect;":"§","&uml":"¨","&uml;":"¨","&copy":"©","&copy;":"©","&ordf":"ª","&ordf;":"ª","&laquo":"«","&laquo;":"«","&not":"¬","&not;":"¬","&shy":"­","&shy;":"­","&reg":"®","&reg;":"®","&macr":"¯","&macr;":"¯","&deg":"°","&deg;":"°","&plusmn":"±","&plusmn;":"±","&sup2":"²","&sup2;":"²","&sup3":"³","&sup3;":"³","&acute":"´","&acute;":"´","&micro":"µ","&micro;":"µ","&para":"¶","&para;":"¶","&middot":"·","&middot;":"·","&cedil":"¸","&cedil;":"¸","&sup1":"¹","&sup1;":"¹","&ordm":"º","&ordm;":"º","&raquo":"»","&raquo;":"»","&frac14":"¼","&frac14;":"¼","&frac12":"½","&frac12;":"½","&frac34":"¾","&frac34;":"¾","&iquest":"¿","&iquest;":"¿","&Agrave":"À","&Agrave;":"À","&Aacute":"Á","&Aacute;":"Á","&Acirc":"Â","&Acirc;":"Â","&Atilde":"Ã","&Atilde;":"Ã","&Auml":"Ä","&Auml;":"Ä","&Aring":"Å","&Aring;":"Å","&AElig":"Æ","&AElig;":"Æ","&Ccedil":"Ç","&Ccedil;":"Ç","&Egrave":"È","&Egrave;":"È","&Eacute":"É","&Eacute;":"É","&Ecirc":"Ê","&Ecirc;":"Ê","&Euml":"Ë","&Euml;":"Ë","&Igrave":"Ì","&Igrave;":"Ì","&Iacute":"Í","&Iacute;":"Í","&Icirc":"Î","&Icirc;":"Î","&Iuml":"Ï","&Iuml;":"Ï","&ETH":"Ð","&ETH;":"Ð","&Ntilde":"Ñ","&Ntilde;":"Ñ","&Ograve":"Ò","&Ograve;":"Ò","&Oacute":"Ó","&Oacute;":"Ó","&Ocirc":"Ô","&Ocirc;":"Ô","&Otilde":"Õ","&Otilde;":"Õ","&Ouml":"Ö","&Ouml;":"Ö","&times":"×","&times;":"×","&Oslash":"Ø","&Oslash;":"Ø","&Ugrave":"Ù","&Ugrave;":"Ù","&Uacute":"Ú","&Uacute;":"Ú","&Ucirc":"Û","&Ucirc;":"Û","&Uuml":"Ü","&Uuml;":"Ü","&Yacute":"Ý","&Yacute;":"Ý","&THORN":"Þ","&THORN;":"Þ","&szlig":"ß","&szlig;":"ß","&agrave":"à","&agrave;":"à","&aacute":"á","&aacute;":"á","&acirc":"â","&acirc;":"â","&atilde":"ã","&atilde;":"ã","&auml":"ä","&auml;":"ä","&aring":"å","&aring;":"å","&aelig":"æ","&aelig;":"æ","&ccedil":"ç","&ccedil;":"ç","&egrave":"è","&egrave;":"è","&eacute":"é","&eacute;":"é","&ecirc":"ê","&ecirc;":"ê","&euml":"ë","&euml;":"ë","&igrave":"ì","&igrave;":"ì","&iacute":"í","&iacute;":"í","&icirc":"î","&icirc;":"î","&iuml":"ï","&iuml;":"ï","&eth":"ð","&eth;":"ð","&ntilde":"ñ","&ntilde;":"ñ","&ograve":"ò","&ograve;":"ò","&oacute":"ó","&oacute;":"ó","&ocirc":"ô","&ocirc;":"ô","&otilde":"õ","&otilde;":"õ","&ouml":"ö","&ouml;":"ö","&divide":"÷","&divide;":"÷","&oslash":"ø","&oslash;":"ø","&ugrave":"ù","&ugrave;":"ù","&uacute":"ú","&uacute;":"ú","&ucirc":"û","&ucirc;":"û","&uuml":"ü","&uuml;":"ü","&yacute":"ý","&yacute;":"ý","&thorn":"þ","&thorn;":"þ","&yuml":"ÿ","&yuml;":"ÿ","&quot":'"',"&quot;":'"',"&amp":"&","&amp;":"&","&lt":"<","&lt;":"<","&gt":">","&gt;":">","&OElig;":"Œ","&oelig;":"œ","&Scaron;":"Š","&scaron;":"š","&Yuml;":"Ÿ","&circ;":"ˆ","&tilde;":"˜","&ensp;":" ","&emsp;":" ","&thinsp;":" ","&zwnj;":"‌","&zwj;":"‍","&lrm;":"‎","&rlm;":"‏","&ndash;":"–","&mdash;":"—","&lsquo;":"‘","&rsquo;":"’","&sbquo;":"‚","&ldquo;":"“","&rdquo;":"”","&bdquo;":"„","&dagger;":"†","&Dagger;":"‡","&permil;":"‰","&lsaquo;":"‹","&rsaquo;":"›","&euro;":"€","&fnof;":"ƒ","&Alpha;":"Α","&Beta;":"Β","&Gamma;":"Γ","&Delta;":"Δ","&Epsilon;":"Ε","&Zeta;":"Ζ","&Eta;":"Η","&Theta;":"Θ","&Iota;":"Ι","&Kappa;":"Κ","&Lambda;":"Λ","&Mu;":"Μ","&Nu;":"Ν","&Xi;":"Ξ","&Omicron;":"Ο","&Pi;":"Π","&Rho;":"Ρ","&Sigma;":"Σ","&Tau;":"Τ","&Upsilon;":"Υ","&Phi;":"Φ","&Chi;":"Χ","&Psi;":"Ψ","&Omega;":"Ω","&alpha;":"α","&beta;":"β","&gamma;":"γ","&delta;":"δ","&epsilon;":"ε","&zeta;":"ζ","&eta;":"η","&theta;":"θ","&iota;":"ι","&kappa;":"κ","&lambda;":"λ","&mu;":"μ","&nu;":"ν","&xi;":"ξ","&omicron;":"ο","&pi;":"π","&rho;":"ρ","&sigmaf;":"ς","&sigma;":"σ","&tau;":"τ","&upsilon;":"υ","&phi;":"φ","&chi;":"χ","&psi;":"ψ","&omega;":"ω","&thetasym;":"ϑ","&upsih;":"ϒ","&piv;":"ϖ","&bull;":"•","&hellip;":"…","&prime;":"′","&Prime;":"″","&oline;":"‾","&frasl;":"⁄","&weierp;":"℘","&image;":"ℑ","&real;":"ℜ","&trade;":"™","&alefsym;":"ℵ","&larr;":"←","&uarr;":"↑","&rarr;":"→","&darr;":"↓","&harr;":"↔","&crarr;":"↵","&lArr;":"⇐","&uArr;":"⇑","&rArr;":"⇒","&dArr;":"⇓","&hArr;":"⇔","&forall;":"∀","&part;":"∂","&exist;":"∃","&empty;":"∅","&nabla;":"∇","&isin;":"∈","&notin;":"∉","&ni;":"∋","&prod;":"∏","&sum;":"∑","&minus;":"−","&lowast;":"∗","&radic;":"√","&prop;":"∝","&infin;":"∞","&ang;":"∠","&and;":"∧","&or;":"∨","&cap;":"∩","&cup;":"∪","&int;":"∫","&there4;":"∴","&sim;":"∼","&cong;":"≅","&asymp;":"≈","&ne;":"≠","&equiv;":"≡","&le;":"≤","&ge;":"≥","&sub;":"⊂","&sup;":"⊃","&nsub;":"⊄","&sube;":"⊆","&supe;":"⊇","&oplus;":"⊕","&otimes;":"⊗","&perp;":"⊥","&sdot;":"⋅","&lceil;":"⌈","&rceil;":"⌉","&lfloor;":"⌊","&rfloor;":"⌋","&lang;":"〈","&rang;":"〉","&loz;":"◊","&spades;":"♠","&clubs;":"♣","&hearts;":"♥","&diams;":"♦"},characters:{"'":"&apos;"," ":"&nbsp;","¡":"&iexcl;","¢":"&cent;","£":"&pound;","¤":"&curren;","¥":"&yen;","¦":"&brvbar;","§":"&sect;","¨":"&uml;","©":"&copy;","ª":"&ordf;","«":"&laquo;","¬":"&not;","­":"&shy;","®":"&reg;","¯":"&macr;","°":"&deg;","±":"&plusmn;","²":"&sup2;","³":"&sup3;","´":"&acute;","µ":"&micro;","¶":"&para;","·":"&middot;","¸":"&cedil;","¹":"&sup1;","º":"&ordm;","»":"&raquo;","¼":"&frac14;","½":"&frac12;","¾":"&frac34;","¿":"&iquest;","À":"&Agrave;","Á":"&Aacute;","Â":"&Acirc;","Ã":"&Atilde;","Ä":"&Auml;","Å":"&Aring;","Æ":"&AElig;","Ç":"&Ccedil;","È":"&Egrave;","É":"&Eacute;","Ê":"&Ecirc;","Ë":"&Euml;","Ì":"&Igrave;","Í":"&Iacute;","Î":"&Icirc;","Ï":"&Iuml;","Ð":"&ETH;","Ñ":"&Ntilde;","Ò":"&Ograve;","Ó":"&Oacute;","Ô":"&Ocirc;","Õ":"&Otilde;","Ö":"&Ouml;","×":"&times;","Ø":"&Oslash;","Ù":"&Ugrave;","Ú":"&Uacute;","Û":"&Ucirc;","Ü":"&Uuml;","Ý":"&Yacute;","Þ":"&THORN;","ß":"&szlig;","à":"&agrave;","á":"&aacute;","â":"&acirc;","ã":"&atilde;","ä":"&auml;","å":"&aring;","æ":"&aelig;","ç":"&ccedil;","è":"&egrave;","é":"&eacute;","ê":"&ecirc;","ë":"&euml;","ì":"&igrave;","í":"&iacute;","î":"&icirc;","ï":"&iuml;","ð":"&eth;","ñ":"&ntilde;","ò":"&ograve;","ó":"&oacute;","ô":"&ocirc;","õ":"&otilde;","ö":"&ouml;","÷":"&divide;","ø":"&oslash;","ù":"&ugrave;","ú":"&uacute;","û":"&ucirc;","ü":"&uuml;","ý":"&yacute;","þ":"&thorn;","ÿ":"&yuml;",'"':"&quot;","&":"&amp;","<":"&lt;",">":"&gt;","Œ":"&OElig;","œ":"&oelig;","Š":"&Scaron;","š":"&scaron;","Ÿ":"&Yuml;","ˆ":"&circ;","˜":"&tilde;"," ":"&ensp;"," ":"&emsp;"," ":"&thinsp;","‌":"&zwnj;","‍":"&zwj;","‎":"&lrm;","‏":"&rlm;","–":"&ndash;","—":"&mdash;","‘":"&lsquo;","’":"&rsquo;","‚":"&sbquo;","“":"&ldquo;","”":"&rdquo;","„":"&bdquo;","†":"&dagger;","‡":"&Dagger;","‰":"&permil;","‹":"&lsaquo;","›":"&rsaquo;","€":"&euro;","ƒ":"&fnof;","Α":"&Alpha;","Β":"&Beta;","Γ":"&Gamma;","Δ":"&Delta;","Ε":"&Epsilon;","Ζ":"&Zeta;","Η":"&Eta;","Θ":"&Theta;","Ι":"&Iota;","Κ":"&Kappa;","Λ":"&Lambda;","Μ":"&Mu;","Ν":"&Nu;","Ξ":"&Xi;","Ο":"&Omicron;","Π":"&Pi;","Ρ":"&Rho;","Σ":"&Sigma;","Τ":"&Tau;","Υ":"&Upsilon;","Φ":"&Phi;","Χ":"&Chi;","Ψ":"&Psi;","Ω":"&Omega;","α":"&alpha;","β":"&beta;","γ":"&gamma;","δ":"&delta;","ε":"&epsilon;","ζ":"&zeta;","η":"&eta;","θ":"&theta;","ι":"&iota;","κ":"&kappa;","λ":"&lambda;","μ":"&mu;","ν":"&nu;","ξ":"&xi;","ο":"&omicron;","π":"&pi;","ρ":"&rho;","ς":"&sigmaf;","σ":"&sigma;","τ":"&tau;","υ":"&upsilon;","φ":"&phi;","χ":"&chi;","ψ":"&psi;","ω":"&omega;","ϑ":"&thetasym;","ϒ":"&upsih;","ϖ":"&piv;","•":"&bull;","…":"&hellip;","′":"&prime;","″":"&Prime;","‾":"&oline;","⁄":"&frasl;","℘":"&weierp;","ℑ":"&image;","ℜ":"&real;","™":"&trade;","ℵ":"&alefsym;","←":"&larr;","↑":"&uarr;","→":"&rarr;","↓":"&darr;","↔":"&harr;","↵":"&crarr;","⇐":"&lArr;","⇑":"&uArr;","⇒":"&rArr;","⇓":"&dArr;","⇔":"&hArr;","∀":"&forall;","∂":"&part;","∃":"&exist;","∅":"&empty;","∇":"&nabla;","∈":"&isin;","∉":"&notin;","∋":"&ni;","∏":"&prod;","∑":"&sum;","−":"&minus;","∗":"&lowast;","√":"&radic;","∝":"&prop;","∞":"&infin;","∠":"&ang;","∧":"&and;","∨":"&or;","∩":"&cap;","∪":"&cup;","∫":"&int;","∴":"&there4;","∼":"&sim;","≅":"&cong;","≈":"&asymp;","≠":"&ne;","≡":"&equiv;","≤":"&le;","≥":"&ge;","⊂":"&sub;","⊃":"&sup;","⊄":"&nsub;","⊆":"&sube;","⊇":"&supe;","⊕":"&oplus;","⊗":"&otimes;","⊥":"&perp;","⋅":"&sdot;","⌈":"&lceil;","⌉":"&rceil;","⌊":"&lfloor;","⌋":"&rfloor;","〈":"&lang;","〉":"&rang;","◊":"&loz;","♠":"&spades;","♣":"&clubs;","♥":"&hearts;","♦":"&diams;"}},html5:{entities:{"&AElig":"Æ","&AElig;":"Æ","&AMP":"&","&AMP;":"&","&Aacute":"Á","&Aacute;":"Á","&Abreve;":"Ă","&Acirc":"Â","&Acirc;":"Â","&Acy;":"А","&Afr;":"𝔄","&Agrave":"À","&Agrave;":"À","&Alpha;":"Α","&Amacr;":"Ā","&And;":"⩓","&Aogon;":"Ą","&Aopf;":"𝔸","&ApplyFunction;":"⁡","&Aring":"Å","&Aring;":"Å","&Ascr;":"𝒜","&Assign;":"≔","&Atilde":"Ã","&Atilde;":"Ã","&Auml":"Ä","&Auml;":"Ä","&Backslash;":"∖","&Barv;":"⫧","&Barwed;":"⌆","&Bcy;":"Б","&Because;":"∵","&Bernoullis;":"ℬ","&Beta;":"Β","&Bfr;":"𝔅","&Bopf;":"𝔹","&Breve;":"˘","&Bscr;":"ℬ","&Bumpeq;":"≎","&CHcy;":"Ч","&COPY":"©","&COPY;":"©","&Cacute;":"Ć","&Cap;":"⋒","&CapitalDifferentialD;":"ⅅ","&Cayleys;":"ℭ","&Ccaron;":"Č","&Ccedil":"Ç","&Ccedil;":"Ç","&Ccirc;":"Ĉ","&Cconint;":"∰","&Cdot;":"Ċ","&Cedilla;":"¸","&CenterDot;":"·","&Cfr;":"ℭ","&Chi;":"Χ","&CircleDot;":"⊙","&CircleMinus;":"⊖","&CirclePlus;":"⊕","&CircleTimes;":"⊗","&ClockwiseContourIntegral;":"∲","&CloseCurlyDoubleQuote;":"”","&CloseCurlyQuote;":"’","&Colon;":"∷","&Colone;":"⩴","&Congruent;":"≡","&Conint;":"∯","&ContourIntegral;":"∮","&Copf;":"ℂ","&Coproduct;":"∐","&CounterClockwiseContourIntegral;":"∳","&Cross;":"⨯","&Cscr;":"𝒞","&Cup;":"⋓","&CupCap;":"≍","&DD;":"ⅅ","&DDotrahd;":"⤑","&DJcy;":"Ђ","&DScy;":"Ѕ","&DZcy;":"Џ","&Dagger;":"‡","&Darr;":"↡","&Dashv;":"⫤","&Dcaron;":"Ď","&Dcy;":"Д","&Del;":"∇","&Delta;":"Δ","&Dfr;":"𝔇","&DiacriticalAcute;":"´","&DiacriticalDot;":"˙","&DiacriticalDoubleAcute;":"˝","&DiacriticalGrave;":"`","&DiacriticalTilde;":"˜","&Diamond;":"⋄","&DifferentialD;":"ⅆ","&Dopf;":"𝔻","&Dot;":"¨","&DotDot;":"⃜","&DotEqual;":"≐","&DoubleContourIntegral;":"∯","&DoubleDot;":"¨","&DoubleDownArrow;":"⇓","&DoubleLeftArrow;":"⇐","&DoubleLeftRightArrow;":"⇔","&DoubleLeftTee;":"⫤","&DoubleLongLeftArrow;":"⟸","&DoubleLongLeftRightArrow;":"⟺","&DoubleLongRightArrow;":"⟹","&DoubleRightArrow;":"⇒","&DoubleRightTee;":"⊨","&DoubleUpArrow;":"⇑","&DoubleUpDownArrow;":"⇕","&DoubleVerticalBar;":"∥","&DownArrow;":"↓","&DownArrowBar;":"⤓","&DownArrowUpArrow;":"⇵","&DownBreve;":"̑","&DownLeftRightVector;":"⥐","&DownLeftTeeVector;":"⥞","&DownLeftVector;":"↽","&DownLeftVectorBar;":"⥖","&DownRightTeeVector;":"⥟","&DownRightVector;":"⇁","&DownRightVectorBar;":"⥗","&DownTee;":"⊤","&DownTeeArrow;":"↧","&Downarrow;":"⇓","&Dscr;":"𝒟","&Dstrok;":"Đ","&ENG;":"Ŋ","&ETH":"Ð","&ETH;":"Ð","&Eacute":"É","&Eacute;":"É","&Ecaron;":"Ě","&Ecirc":"Ê","&Ecirc;":"Ê","&Ecy;":"Э","&Edot;":"Ė","&Efr;":"𝔈","&Egrave":"È","&Egrave;":"È","&Element;":"∈","&Emacr;":"Ē","&EmptySmallSquare;":"◻","&EmptyVerySmallSquare;":"▫","&Eogon;":"Ę","&Eopf;":"𝔼","&Epsilon;":"Ε","&Equal;":"⩵","&EqualTilde;":"≂","&Equilibrium;":"⇌","&Escr;":"ℰ","&Esim;":"⩳","&Eta;":"Η","&Euml":"Ë","&Euml;":"Ë","&Exists;":"∃","&ExponentialE;":"ⅇ","&Fcy;":"Ф","&Ffr;":"𝔉","&FilledSmallSquare;":"◼","&FilledVerySmallSquare;":"▪","&Fopf;":"𝔽","&ForAll;":"∀","&Fouriertrf;":"ℱ","&Fscr;":"ℱ","&GJcy;":"Ѓ","&GT":">","&GT;":">","&Gamma;":"Γ","&Gammad;":"Ϝ","&Gbreve;":"Ğ","&Gcedil;":"Ģ","&Gcirc;":"Ĝ","&Gcy;":"Г","&Gdot;":"Ġ","&Gfr;":"𝔊","&Gg;":"⋙","&Gopf;":"𝔾","&GreaterEqual;":"≥","&GreaterEqualLess;":"⋛","&GreaterFullEqual;":"≧","&GreaterGreater;":"⪢","&GreaterLess;":"≷","&GreaterSlantEqual;":"⩾","&GreaterTilde;":"≳","&Gscr;":"𝒢","&Gt;":"≫","&HARDcy;":"Ъ","&Hacek;":"ˇ","&Hat;":"^","&Hcirc;":"Ĥ","&Hfr;":"ℌ","&HilbertSpace;":"ℋ","&Hopf;":"ℍ","&HorizontalLine;":"─","&Hscr;":"ℋ","&Hstrok;":"Ħ","&HumpDownHump;":"≎","&HumpEqual;":"≏","&IEcy;":"Е","&IJlig;":"Ĳ","&IOcy;":"Ё","&Iacute":"Í","&Iacute;":"Í","&Icirc":"Î","&Icirc;":"Î","&Icy;":"И","&Idot;":"İ","&Ifr;":"ℑ","&Igrave":"Ì","&Igrave;":"Ì","&Im;":"ℑ","&Imacr;":"Ī","&ImaginaryI;":"ⅈ","&Implies;":"⇒","&Int;":"∬","&Integral;":"∫","&Intersection;":"⋂","&InvisibleComma;":"⁣","&InvisibleTimes;":"⁢","&Iogon;":"Į","&Iopf;":"𝕀","&Iota;":"Ι","&Iscr;":"ℐ","&Itilde;":"Ĩ","&Iukcy;":"І","&Iuml":"Ï","&Iuml;":"Ï","&Jcirc;":"Ĵ","&Jcy;":"Й","&Jfr;":"𝔍","&Jopf;":"𝕁","&Jscr;":"𝒥","&Jsercy;":"Ј","&Jukcy;":"Є","&KHcy;":"Х","&KJcy;":"Ќ","&Kappa;":"Κ","&Kcedil;":"Ķ","&Kcy;":"К","&Kfr;":"𝔎","&Kopf;":"𝕂","&Kscr;":"𝒦","&LJcy;":"Љ","&LT":"<","&LT;":"<","&Lacute;":"Ĺ","&Lambda;":"Λ","&Lang;":"⟪","&Laplacetrf;":"ℒ","&Larr;":"↞","&Lcaron;":"Ľ","&Lcedil;":"Ļ","&Lcy;":"Л","&LeftAngleBracket;":"⟨","&LeftArrow;":"←","&LeftArrowBar;":"⇤","&LeftArrowRightArrow;":"⇆","&LeftCeiling;":"⌈","&LeftDoubleBracket;":"⟦","&LeftDownTeeVector;":"⥡","&LeftDownVector;":"⇃","&LeftDownVectorBar;":"⥙","&LeftFloor;":"⌊","&LeftRightArrow;":"↔","&LeftRightVector;":"⥎","&LeftTee;":"⊣","&LeftTeeArrow;":"↤","&LeftTeeVector;":"⥚","&LeftTriangle;":"⊲","&LeftTriangleBar;":"⧏","&LeftTriangleEqual;":"⊴","&LeftUpDownVector;":"⥑","&LeftUpTeeVector;":"⥠","&LeftUpVector;":"↿","&LeftUpVectorBar;":"⥘","&LeftVector;":"↼","&LeftVectorBar;":"⥒","&Leftarrow;":"⇐","&Leftrightarrow;":"⇔","&LessEqualGreater;":"⋚","&LessFullEqual;":"≦","&LessGreater;":"≶","&LessLess;":"⪡","&LessSlantEqual;":"⩽","&LessTilde;":"≲","&Lfr;":"𝔏","&Ll;":"⋘","&Lleftarrow;":"⇚","&Lmidot;":"Ŀ","&LongLeftArrow;":"⟵","&LongLeftRightArrow;":"⟷","&LongRightArrow;":"⟶","&Longleftarrow;":"⟸","&Longleftrightarrow;":"⟺","&Longrightarrow;":"⟹","&Lopf;":"𝕃","&LowerLeftArrow;":"↙","&LowerRightArrow;":"↘","&Lscr;":"ℒ","&Lsh;":"↰","&Lstrok;":"Ł","&Lt;":"≪","&Map;":"⤅","&Mcy;":"М","&MediumSpace;":" ","&Mellintrf;":"ℳ","&Mfr;":"𝔐","&MinusPlus;":"∓","&Mopf;":"𝕄","&Mscr;":"ℳ","&Mu;":"Μ","&NJcy;":"Њ","&Nacute;":"Ń","&Ncaron;":"Ň","&Ncedil;":"Ņ","&Ncy;":"Н","&NegativeMediumSpace;":"​","&NegativeThickSpace;":"​","&NegativeThinSpace;":"​","&NegativeVeryThinSpace;":"​","&NestedGreaterGreater;":"≫","&NestedLessLess;":"≪","&NewLine;":"\n","&Nfr;":"𝔑","&NoBreak;":"⁠","&NonBreakingSpace;":" ","&Nopf;":"ℕ","&Not;":"⫬","&NotCongruent;":"≢","&NotCupCap;":"≭","&NotDoubleVerticalBar;":"∦","&NotElement;":"∉","&NotEqual;":"≠","&NotEqualTilde;":"≂̸","&NotExists;":"∄","&NotGreater;":"≯","&NotGreaterEqual;":"≱","&NotGreaterFullEqual;":"≧̸","&NotGreaterGreater;":"≫̸","&NotGreaterLess;":"≹","&NotGreaterSlantEqual;":"⩾̸","&NotGreaterTilde;":"≵","&NotHumpDownHump;":"≎̸","&NotHumpEqual;":"≏̸","&NotLeftTriangle;":"⋪","&NotLeftTriangleBar;":"⧏̸","&NotLeftTriangleEqual;":"⋬","&NotLess;":"≮","&NotLessEqual;":"≰","&NotLessGreater;":"≸","&NotLessLess;":"≪̸","&NotLessSlantEqual;":"⩽̸","&NotLessTilde;":"≴","&NotNestedGreaterGreater;":"⪢̸","&NotNestedLessLess;":"⪡̸","&NotPrecedes;":"⊀","&NotPrecedesEqual;":"⪯̸","&NotPrecedesSlantEqual;":"⋠","&NotReverseElement;":"∌","&NotRightTriangle;":"⋫","&NotRightTriangleBar;":"⧐̸","&NotRightTriangleEqual;":"⋭","&NotSquareSubset;":"⊏̸","&NotSquareSubsetEqual;":"⋢","&NotSquareSuperset;":"⊐̸","&NotSquareSupersetEqual;":"⋣","&NotSubset;":"⊂⃒","&NotSubsetEqual;":"⊈","&NotSucceeds;":"⊁","&NotSucceedsEqual;":"⪰̸","&NotSucceedsSlantEqual;":"⋡","&NotSucceedsTilde;":"≿̸","&NotSuperset;":"⊃⃒","&NotSupersetEqual;":"⊉","&NotTilde;":"≁","&NotTildeEqual;":"≄","&NotTildeFullEqual;":"≇","&NotTildeTilde;":"≉","&NotVerticalBar;":"∤","&Nscr;":"𝒩","&Ntilde":"Ñ","&Ntilde;":"Ñ","&Nu;":"Ν","&OElig;":"Œ","&Oacute":"Ó","&Oacute;":"Ó","&Ocirc":"Ô","&Ocirc;":"Ô","&Ocy;":"О","&Odblac;":"Ő","&Ofr;":"𝔒","&Ograve":"Ò","&Ograve;":"Ò","&Omacr;":"Ō","&Omega;":"Ω","&Omicron;":"Ο","&Oopf;":"𝕆","&OpenCurlyDoubleQuote;":"“","&OpenCurlyQuote;":"‘","&Or;":"⩔","&Oscr;":"𝒪","&Oslash":"Ø","&Oslash;":"Ø","&Otilde":"Õ","&Otilde;":"Õ","&Otimes;":"⨷","&Ouml":"Ö","&Ouml;":"Ö","&OverBar;":"‾","&OverBrace;":"⏞","&OverBracket;":"⎴","&OverParenthesis;":"⏜","&PartialD;":"∂","&Pcy;":"П","&Pfr;":"𝔓","&Phi;":"Φ","&Pi;":"Π","&PlusMinus;":"±","&Poincareplane;":"ℌ","&Popf;":"ℙ","&Pr;":"⪻","&Precedes;":"≺","&PrecedesEqual;":"⪯","&PrecedesSlantEqual;":"≼","&PrecedesTilde;":"≾","&Prime;":"″","&Product;":"∏","&Proportion;":"∷","&Proportional;":"∝","&Pscr;":"𝒫","&Psi;":"Ψ","&QUOT":'"',"&QUOT;":'"',"&Qfr;":"𝔔","&Qopf;":"ℚ","&Qscr;":"𝒬","&RBarr;":"⤐","&REG":"®","&REG;":"®","&Racute;":"Ŕ","&Rang;":"⟫","&Rarr;":"↠","&Rarrtl;":"⤖","&Rcaron;":"Ř","&Rcedil;":"Ŗ","&Rcy;":"Р","&Re;":"ℜ","&ReverseElement;":"∋","&ReverseEquilibrium;":"⇋","&ReverseUpEquilibrium;":"⥯","&Rfr;":"ℜ","&Rho;":"Ρ","&RightAngleBracket;":"⟩","&RightArrow;":"→","&RightArrowBar;":"⇥","&RightArrowLeftArrow;":"⇄","&RightCeiling;":"⌉","&RightDoubleBracket;":"⟧","&RightDownTeeVector;":"⥝","&RightDownVector;":"⇂","&RightDownVectorBar;":"⥕","&RightFloor;":"⌋","&RightTee;":"⊢","&RightTeeArrow;":"↦","&RightTeeVector;":"⥛","&RightTriangle;":"⊳","&RightTriangleBar;":"⧐","&RightTriangleEqual;":"⊵","&RightUpDownVector;":"⥏","&RightUpTeeVector;":"⥜","&RightUpVector;":"↾","&RightUpVectorBar;":"⥔","&RightVector;":"⇀","&RightVectorBar;":"⥓","&Rightarrow;":"⇒","&Ropf;":"ℝ","&RoundImplies;":"⥰","&Rrightarrow;":"⇛","&Rscr;":"ℛ","&Rsh;":"↱","&RuleDelayed;":"⧴","&SHCHcy;":"Щ","&SHcy;":"Ш","&SOFTcy;":"Ь","&Sacute;":"Ś","&Sc;":"⪼","&Scaron;":"Š","&Scedil;":"Ş","&Scirc;":"Ŝ","&Scy;":"С","&Sfr;":"𝔖","&ShortDownArrow;":"↓","&ShortLeftArrow;":"←","&ShortRightArrow;":"→","&ShortUpArrow;":"↑","&Sigma;":"Σ","&SmallCircle;":"∘","&Sopf;":"𝕊","&Sqrt;":"√","&Square;":"□","&SquareIntersection;":"⊓","&SquareSubset;":"⊏","&SquareSubsetEqual;":"⊑","&SquareSuperset;":"⊐","&SquareSupersetEqual;":"⊒","&SquareUnion;":"⊔","&Sscr;":"𝒮","&Star;":"⋆","&Sub;":"⋐","&Subset;":"⋐","&SubsetEqual;":"⊆","&Succeeds;":"≻","&SucceedsEqual;":"⪰","&SucceedsSlantEqual;":"≽","&SucceedsTilde;":"≿","&SuchThat;":"∋","&Sum;":"∑","&Sup;":"⋑","&Superset;":"⊃","&SupersetEqual;":"⊇","&Supset;":"⋑","&THORN":"Þ","&THORN;":"Þ","&TRADE;":"™","&TSHcy;":"Ћ","&TScy;":"Ц","&Tab;":"\t","&Tau;":"Τ","&Tcaron;":"Ť","&Tcedil;":"Ţ","&Tcy;":"Т","&Tfr;":"𝔗","&Therefore;":"∴","&Theta;":"Θ","&ThickSpace;":"  ","&ThinSpace;":" ","&Tilde;":"∼","&TildeEqual;":"≃","&TildeFullEqual;":"≅","&TildeTilde;":"≈","&Topf;":"𝕋","&TripleDot;":"⃛","&Tscr;":"𝒯","&Tstrok;":"Ŧ","&Uacute":"Ú","&Uacute;":"Ú","&Uarr;":"↟","&Uarrocir;":"⥉","&Ubrcy;":"Ў","&Ubreve;":"Ŭ","&Ucirc":"Û","&Ucirc;":"Û","&Ucy;":"У","&Udblac;":"Ű","&Ufr;":"𝔘","&Ugrave":"Ù","&Ugrave;":"Ù","&Umacr;":"Ū","&UnderBar;":"_","&UnderBrace;":"⏟","&UnderBracket;":"⎵","&UnderParenthesis;":"⏝","&Union;":"⋃","&UnionPlus;":"⊎","&Uogon;":"Ų","&Uopf;":"𝕌","&UpArrow;":"↑","&UpArrowBar;":"⤒","&UpArrowDownArrow;":"⇅","&UpDownArrow;":"↕","&UpEquilibrium;":"⥮","&UpTee;":"⊥","&UpTeeArrow;":"↥","&Uparrow;":"⇑","&Updownarrow;":"⇕","&UpperLeftArrow;":"↖","&UpperRightArrow;":"↗","&Upsi;":"ϒ","&Upsilon;":"Υ","&Uring;":"Ů","&Uscr;":"𝒰","&Utilde;":"Ũ","&Uuml":"Ü","&Uuml;":"Ü","&VDash;":"⊫","&Vbar;":"⫫","&Vcy;":"В","&Vdash;":"⊩","&Vdashl;":"⫦","&Vee;":"⋁","&Verbar;":"‖","&Vert;":"‖","&VerticalBar;":"∣","&VerticalLine;":"|","&VerticalSeparator;":"❘","&VerticalTilde;":"≀","&VeryThinSpace;":" ","&Vfr;":"𝔙","&Vopf;":"𝕍","&Vscr;":"𝒱","&Vvdash;":"⊪","&Wcirc;":"Ŵ","&Wedge;":"⋀","&Wfr;":"𝔚","&Wopf;":"𝕎","&Wscr;":"𝒲","&Xfr;":"𝔛","&Xi;":"Ξ","&Xopf;":"𝕏","&Xscr;":"𝒳","&YAcy;":"Я","&YIcy;":"Ї","&YUcy;":"Ю","&Yacute":"Ý","&Yacute;":"Ý","&Ycirc;":"Ŷ","&Ycy;":"Ы","&Yfr;":"𝔜","&Yopf;":"𝕐","&Yscr;":"𝒴","&Yuml;":"Ÿ","&ZHcy;":"Ж","&Zacute;":"Ź","&Zcaron;":"Ž","&Zcy;":"З","&Zdot;":"Ż","&ZeroWidthSpace;":"​","&Zeta;":"Ζ","&Zfr;":"ℨ","&Zopf;":"ℤ","&Zscr;":"𝒵","&aacute":"á","&aacute;":"á","&abreve;":"ă","&ac;":"∾","&acE;":"∾̳","&acd;":"∿","&acirc":"â","&acirc;":"â","&acute":"´","&acute;":"´","&acy;":"а","&aelig":"æ","&aelig;":"æ","&af;":"⁡","&afr;":"𝔞","&agrave":"à","&agrave;":"à","&alefsym;":"ℵ","&aleph;":"ℵ","&alpha;":"α","&amacr;":"ā","&amalg;":"⨿","&amp":"&","&amp;":"&","&and;":"∧","&andand;":"⩕","&andd;":"⩜","&andslope;":"⩘","&andv;":"⩚","&ang;":"∠","&ange;":"⦤","&angle;":"∠","&angmsd;":"∡","&angmsdaa;":"⦨","&angmsdab;":"⦩","&angmsdac;":"⦪","&angmsdad;":"⦫","&angmsdae;":"⦬","&angmsdaf;":"⦭","&angmsdag;":"⦮","&angmsdah;":"⦯","&angrt;":"∟","&angrtvb;":"⊾","&angrtvbd;":"⦝","&angsph;":"∢","&angst;":"Å","&angzarr;":"⍼","&aogon;":"ą","&aopf;":"𝕒","&ap;":"≈","&apE;":"⩰","&apacir;":"⩯","&ape;":"≊","&apid;":"≋","&apos;":"'","&approx;":"≈","&approxeq;":"≊","&aring":"å","&aring;":"å","&ascr;":"𝒶","&ast;":"*","&asymp;":"≈","&asympeq;":"≍","&atilde":"ã","&atilde;":"ã","&auml":"ä","&auml;":"ä","&awconint;":"∳","&awint;":"⨑","&bNot;":"⫭","&backcong;":"≌","&backepsilon;":"϶","&backprime;":"‵","&backsim;":"∽","&backsimeq;":"⋍","&barvee;":"⊽","&barwed;":"⌅","&barwedge;":"⌅","&bbrk;":"⎵","&bbrktbrk;":"⎶","&bcong;":"≌","&bcy;":"б","&bdquo;":"„","&becaus;":"∵","&because;":"∵","&bemptyv;":"⦰","&bepsi;":"϶","&bernou;":"ℬ","&beta;":"β","&beth;":"ℶ","&between;":"≬","&bfr;":"𝔟","&bigcap;":"⋂","&bigcirc;":"◯","&bigcup;":"⋃","&bigodot;":"⨀","&bigoplus;":"⨁","&bigotimes;":"⨂","&bigsqcup;":"⨆","&bigstar;":"★","&bigtriangledown;":"▽","&bigtriangleup;":"△","&biguplus;":"⨄","&bigvee;":"⋁","&bigwedge;":"⋀","&bkarow;":"⤍","&blacklozenge;":"⧫","&blacksquare;":"▪","&blacktriangle;":"▴","&blacktriangledown;":"▾","&blacktriangleleft;":"◂","&blacktriangleright;":"▸","&blank;":"␣","&blk12;":"▒","&blk14;":"░","&blk34;":"▓","&block;":"█","&bne;":"=⃥","&bnequiv;":"≡⃥","&bnot;":"⌐","&bopf;":"𝕓","&bot;":"⊥","&bottom;":"⊥","&bowtie;":"⋈","&boxDL;":"╗","&boxDR;":"╔","&boxDl;":"╖","&boxDr;":"╓","&boxH;":"═","&boxHD;":"╦","&boxHU;":"╩","&boxHd;":"╤","&boxHu;":"╧","&boxUL;":"╝","&boxUR;":"╚","&boxUl;":"╜","&boxUr;":"╙","&boxV;":"║","&boxVH;":"╬","&boxVL;":"╣","&boxVR;":"╠","&boxVh;":"╫","&boxVl;":"╢","&boxVr;":"╟","&boxbox;":"⧉","&boxdL;":"╕","&boxdR;":"╒","&boxdl;":"┐","&boxdr;":"┌","&boxh;":"─","&boxhD;":"╥","&boxhU;":"╨","&boxhd;":"┬","&boxhu;":"┴","&boxminus;":"⊟","&boxplus;":"⊞","&boxtimes;":"⊠","&boxuL;":"╛","&boxuR;":"╘","&boxul;":"┘","&boxur;":"└","&boxv;":"│","&boxvH;":"╪","&boxvL;":"╡","&boxvR;":"╞","&boxvh;":"┼","&boxvl;":"┤","&boxvr;":"├","&bprime;":"‵","&breve;":"˘","&brvbar":"¦","&brvbar;":"¦","&bscr;":"𝒷","&bsemi;":"⁏","&bsim;":"∽","&bsime;":"⋍","&bsol;":"\\","&bsolb;":"⧅","&bsolhsub;":"⟈","&bull;":"•","&bullet;":"•","&bump;":"≎","&bumpE;":"⪮","&bumpe;":"≏","&bumpeq;":"≏","&cacute;":"ć","&cap;":"∩","&capand;":"⩄","&capbrcup;":"⩉","&capcap;":"⩋","&capcup;":"⩇","&capdot;":"⩀","&caps;":"∩︀","&caret;":"⁁","&caron;":"ˇ","&ccaps;":"⩍","&ccaron;":"č","&ccedil":"ç","&ccedil;":"ç","&ccirc;":"ĉ","&ccups;":"⩌","&ccupssm;":"⩐","&cdot;":"ċ","&cedil":"¸","&cedil;":"¸","&cemptyv;":"⦲","&cent":"¢","&cent;":"¢","&centerdot;":"·","&cfr;":"𝔠","&chcy;":"ч","&check;":"✓","&checkmark;":"✓","&chi;":"χ","&cir;":"○","&cirE;":"⧃","&circ;":"ˆ","&circeq;":"≗","&circlearrowleft;":"↺","&circlearrowright;":"↻","&circledR;":"®","&circledS;":"Ⓢ","&circledast;":"⊛","&circledcirc;":"⊚","&circleddash;":"⊝","&cire;":"≗","&cirfnint;":"⨐","&cirmid;":"⫯","&cirscir;":"⧂","&clubs;":"♣","&clubsuit;":"♣","&colon;":":","&colone;":"≔","&coloneq;":"≔","&comma;":",","&commat;":"@","&comp;":"∁","&compfn;":"∘","&complement;":"∁","&complexes;":"ℂ","&cong;":"≅","&congdot;":"⩭","&conint;":"∮","&copf;":"𝕔","&coprod;":"∐","&copy":"©","&copy;":"©","&copysr;":"℗","&crarr;":"↵","&cross;":"✗","&cscr;":"𝒸","&csub;":"⫏","&csube;":"⫑","&csup;":"⫐","&csupe;":"⫒","&ctdot;":"⋯","&cudarrl;":"⤸","&cudarrr;":"⤵","&cuepr;":"⋞","&cuesc;":"⋟","&cularr;":"↶","&cularrp;":"⤽","&cup;":"∪","&cupbrcap;":"⩈","&cupcap;":"⩆","&cupcup;":"⩊","&cupdot;":"⊍","&cupor;":"⩅","&cups;":"∪︀","&curarr;":"↷","&curarrm;":"⤼","&curlyeqprec;":"⋞","&curlyeqsucc;":"⋟","&curlyvee;":"⋎","&curlywedge;":"⋏","&curren":"¤","&curren;":"¤","&curvearrowleft;":"↶","&curvearrowright;":"↷","&cuvee;":"⋎","&cuwed;":"⋏","&cwconint;":"∲","&cwint;":"∱","&cylcty;":"⌭","&dArr;":"⇓","&dHar;":"⥥","&dagger;":"†","&daleth;":"ℸ","&darr;":"↓","&dash;":"‐","&dashv;":"⊣","&dbkarow;":"⤏","&dblac;":"˝","&dcaron;":"ď","&dcy;":"д","&dd;":"ⅆ","&ddagger;":"‡","&ddarr;":"⇊","&ddotseq;":"⩷","&deg":"°","&deg;":"°","&delta;":"δ","&demptyv;":"⦱","&dfisht;":"⥿","&dfr;":"𝔡","&dharl;":"⇃","&dharr;":"⇂","&diam;":"⋄","&diamond;":"⋄","&diamondsuit;":"♦","&diams;":"♦","&die;":"¨","&digamma;":"ϝ","&disin;":"⋲","&div;":"÷","&divide":"÷","&divide;":"÷","&divideontimes;":"⋇","&divonx;":"⋇","&djcy;":"ђ","&dlcorn;":"⌞","&dlcrop;":"⌍","&dollar;":"$","&dopf;":"𝕕","&dot;":"˙","&doteq;":"≐","&doteqdot;":"≑","&dotminus;":"∸","&dotplus;":"∔","&dotsquare;":"⊡","&doublebarwedge;":"⌆","&downarrow;":"↓","&downdownarrows;":"⇊","&downharpoonleft;":"⇃","&downharpoonright;":"⇂","&drbkarow;":"⤐","&drcorn;":"⌟","&drcrop;":"⌌","&dscr;":"𝒹","&dscy;":"ѕ","&dsol;":"⧶","&dstrok;":"đ","&dtdot;":"⋱","&dtri;":"▿","&dtrif;":"▾","&duarr;":"⇵","&duhar;":"⥯","&dwangle;":"⦦","&dzcy;":"џ","&dzigrarr;":"⟿","&eDDot;":"⩷","&eDot;":"≑","&eacute":"é","&eacute;":"é","&easter;":"⩮","&ecaron;":"ě","&ecir;":"≖","&ecirc":"ê","&ecirc;":"ê","&ecolon;":"≕","&ecy;":"э","&edot;":"ė","&ee;":"ⅇ","&efDot;":"≒","&efr;":"𝔢","&eg;":"⪚","&egrave":"è","&egrave;":"è","&egs;":"⪖","&egsdot;":"⪘","&el;":"⪙","&elinters;":"⏧","&ell;":"ℓ","&els;":"⪕","&elsdot;":"⪗","&emacr;":"ē","&empty;":"∅","&emptyset;":"∅","&emptyv;":"∅","&emsp13;":" ","&emsp14;":" ","&emsp;":" ","&eng;":"ŋ","&ensp;":" ","&eogon;":"ę","&eopf;":"𝕖","&epar;":"⋕","&eparsl;":"⧣","&eplus;":"⩱","&epsi;":"ε","&epsilon;":"ε","&epsiv;":"ϵ","&eqcirc;":"≖","&eqcolon;":"≕","&eqsim;":"≂","&eqslantgtr;":"⪖","&eqslantless;":"⪕","&equals;":"=","&equest;":"≟","&equiv;":"≡","&equivDD;":"⩸","&eqvparsl;":"⧥","&erDot;":"≓","&erarr;":"⥱","&escr;":"ℯ","&esdot;":"≐","&esim;":"≂","&eta;":"η","&eth":"ð","&eth;":"ð","&euml":"ë","&euml;":"ë","&euro;":"€","&excl;":"!","&exist;":"∃","&expectation;":"ℰ","&exponentiale;":"ⅇ","&fallingdotseq;":"≒","&fcy;":"ф","&female;":"♀","&ffilig;":"ﬃ","&fflig;":"ﬀ","&ffllig;":"ﬄ","&ffr;":"𝔣","&filig;":"ﬁ","&fjlig;":"fj","&flat;":"♭","&fllig;":"ﬂ","&fltns;":"▱","&fnof;":"ƒ","&fopf;":"𝕗","&forall;":"∀","&fork;":"⋔","&forkv;":"⫙","&fpartint;":"⨍","&frac12":"½","&frac12;":"½","&frac13;":"⅓","&frac14":"¼","&frac14;":"¼","&frac15;":"⅕","&frac16;":"⅙","&frac18;":"⅛","&frac23;":"⅔","&frac25;":"⅖","&frac34":"¾","&frac34;":"¾","&frac35;":"⅗","&frac38;":"⅜","&frac45;":"⅘","&frac56;":"⅚","&frac58;":"⅝","&frac78;":"⅞","&frasl;":"⁄","&frown;":"⌢","&fscr;":"𝒻","&gE;":"≧","&gEl;":"⪌","&gacute;":"ǵ","&gamma;":"γ","&gammad;":"ϝ","&gap;":"⪆","&gbreve;":"ğ","&gcirc;":"ĝ","&gcy;":"г","&gdot;":"ġ","&ge;":"≥","&gel;":"⋛","&geq;":"≥","&geqq;":"≧","&geqslant;":"⩾","&ges;":"⩾","&gescc;":"⪩","&gesdot;":"⪀","&gesdoto;":"⪂","&gesdotol;":"⪄","&gesl;":"⋛︀","&gesles;":"⪔","&gfr;":"𝔤","&gg;":"≫","&ggg;":"⋙","&gimel;":"ℷ","&gjcy;":"ѓ","&gl;":"≷","&glE;":"⪒","&gla;":"⪥","&glj;":"⪤","&gnE;":"≩","&gnap;":"⪊","&gnapprox;":"⪊","&gne;":"⪈","&gneq;":"⪈","&gneqq;":"≩","&gnsim;":"⋧","&gopf;":"𝕘","&grave;":"`","&gscr;":"ℊ","&gsim;":"≳","&gsime;":"⪎","&gsiml;":"⪐","&gt":">","&gt;":">","&gtcc;":"⪧","&gtcir;":"⩺","&gtdot;":"⋗","&gtlPar;":"⦕","&gtquest;":"⩼","&gtrapprox;":"⪆","&gtrarr;":"⥸","&gtrdot;":"⋗","&gtreqless;":"⋛","&gtreqqless;":"⪌","&gtrless;":"≷","&gtrsim;":"≳","&gvertneqq;":"≩︀","&gvnE;":"≩︀","&hArr;":"⇔","&hairsp;":" ","&half;":"½","&hamilt;":"ℋ","&hardcy;":"ъ","&harr;":"↔","&harrcir;":"⥈","&harrw;":"↭","&hbar;":"ℏ","&hcirc;":"ĥ","&hearts;":"♥","&heartsuit;":"♥","&hellip;":"…","&hercon;":"⊹","&hfr;":"𝔥","&hksearow;":"⤥","&hkswarow;":"⤦","&hoarr;":"⇿","&homtht;":"∻","&hookleftarrow;":"↩","&hookrightarrow;":"↪","&hopf;":"𝕙","&horbar;":"―","&hscr;":"𝒽","&hslash;":"ℏ","&hstrok;":"ħ","&hybull;":"⁃","&hyphen;":"‐","&iacute":"í","&iacute;":"í","&ic;":"⁣","&icirc":"î","&icirc;":"î","&icy;":"и","&iecy;":"е","&iexcl":"¡","&iexcl;":"¡","&iff;":"⇔","&ifr;":"𝔦","&igrave":"ì","&igrave;":"ì","&ii;":"ⅈ","&iiiint;":"⨌","&iiint;":"∭","&iinfin;":"⧜","&iiota;":"℩","&ijlig;":"ĳ","&imacr;":"ī","&image;":"ℑ","&imagline;":"ℐ","&imagpart;":"ℑ","&imath;":"ı","&imof;":"⊷","&imped;":"Ƶ","&in;":"∈","&incare;":"℅","&infin;":"∞","&infintie;":"⧝","&inodot;":"ı","&int;":"∫","&intcal;":"⊺","&integers;":"ℤ","&intercal;":"⊺","&intlarhk;":"⨗","&intprod;":"⨼","&iocy;":"ё","&iogon;":"į","&iopf;":"𝕚","&iota;":"ι","&iprod;":"⨼","&iquest":"¿","&iquest;":"¿","&iscr;":"𝒾","&isin;":"∈","&isinE;":"⋹","&isindot;":"⋵","&isins;":"⋴","&isinsv;":"⋳","&isinv;":"∈","&it;":"⁢","&itilde;":"ĩ","&iukcy;":"і","&iuml":"ï","&iuml;":"ï","&jcirc;":"ĵ","&jcy;":"й","&jfr;":"𝔧","&jmath;":"ȷ","&jopf;":"𝕛","&jscr;":"𝒿","&jsercy;":"ј","&jukcy;":"є","&kappa;":"κ","&kappav;":"ϰ","&kcedil;":"ķ","&kcy;":"к","&kfr;":"𝔨","&kgreen;":"ĸ","&khcy;":"х","&kjcy;":"ќ","&kopf;":"𝕜","&kscr;":"𝓀","&lAarr;":"⇚","&lArr;":"⇐","&lAtail;":"⤛","&lBarr;":"⤎","&lE;":"≦","&lEg;":"⪋","&lHar;":"⥢","&lacute;":"ĺ","&laemptyv;":"⦴","&lagran;":"ℒ","&lambda;":"λ","&lang;":"⟨","&langd;":"⦑","&langle;":"⟨","&lap;":"⪅","&laquo":"«","&laquo;":"«","&larr;":"←","&larrb;":"⇤","&larrbfs;":"⤟","&larrfs;":"⤝","&larrhk;":"↩","&larrlp;":"↫","&larrpl;":"⤹","&larrsim;":"⥳","&larrtl;":"↢","&lat;":"⪫","&latail;":"⤙","&late;":"⪭","&lates;":"⪭︀","&lbarr;":"⤌","&lbbrk;":"❲","&lbrace;":"{","&lbrack;":"[","&lbrke;":"⦋","&lbrksld;":"⦏","&lbrkslu;":"⦍","&lcaron;":"ľ","&lcedil;":"ļ","&lceil;":"⌈","&lcub;":"{","&lcy;":"л","&ldca;":"⤶","&ldquo;":"“","&ldquor;":"„","&ldrdhar;":"⥧","&ldrushar;":"⥋","&ldsh;":"↲","&le;":"≤","&leftarrow;":"←","&leftarrowtail;":"↢","&leftharpoondown;":"↽","&leftharpoonup;":"↼","&leftleftarrows;":"⇇","&leftrightarrow;":"↔","&leftrightarrows;":"⇆","&leftrightharpoons;":"⇋","&leftrightsquigarrow;":"↭","&leftthreetimes;":"⋋","&leg;":"⋚","&leq;":"≤","&leqq;":"≦","&leqslant;":"⩽","&les;":"⩽","&lescc;":"⪨","&lesdot;":"⩿","&lesdoto;":"⪁","&lesdotor;":"⪃","&lesg;":"⋚︀","&lesges;":"⪓","&lessapprox;":"⪅","&lessdot;":"⋖","&lesseqgtr;":"⋚","&lesseqqgtr;":"⪋","&lessgtr;":"≶","&lesssim;":"≲","&lfisht;":"⥼","&lfloor;":"⌊","&lfr;":"𝔩","&lg;":"≶","&lgE;":"⪑","&lhard;":"↽","&lharu;":"↼","&lharul;":"⥪","&lhblk;":"▄","&ljcy;":"љ","&ll;":"≪","&llarr;":"⇇","&llcorner;":"⌞","&llhard;":"⥫","&lltri;":"◺","&lmidot;":"ŀ","&lmoust;":"⎰","&lmoustache;":"⎰","&lnE;":"≨","&lnap;":"⪉","&lnapprox;":"⪉","&lne;":"⪇","&lneq;":"⪇","&lneqq;":"≨","&lnsim;":"⋦","&loang;":"⟬","&loarr;":"⇽","&lobrk;":"⟦","&longleftarrow;":"⟵","&longleftrightarrow;":"⟷","&longmapsto;":"⟼","&longrightarrow;":"⟶","&looparrowleft;":"↫","&looparrowright;":"↬","&lopar;":"⦅","&lopf;":"𝕝","&loplus;":"⨭","&lotimes;":"⨴","&lowast;":"∗","&lowbar;":"_","&loz;":"◊","&lozenge;":"◊","&lozf;":"⧫","&lpar;":"(","&lparlt;":"⦓","&lrarr;":"⇆","&lrcorner;":"⌟","&lrhar;":"⇋","&lrhard;":"⥭","&lrm;":"‎","&lrtri;":"⊿","&lsaquo;":"‹","&lscr;":"𝓁","&lsh;":"↰","&lsim;":"≲","&lsime;":"⪍","&lsimg;":"⪏","&lsqb;":"[","&lsquo;":"‘","&lsquor;":"‚","&lstrok;":"ł","&lt":"<","&lt;":"<","&ltcc;":"⪦","&ltcir;":"⩹","&ltdot;":"⋖","&lthree;":"⋋","&ltimes;":"⋉","&ltlarr;":"⥶","&ltquest;":"⩻","&ltrPar;":"⦖","&ltri;":"◃","&ltrie;":"⊴","&ltrif;":"◂","&lurdshar;":"⥊","&luruhar;":"⥦","&lvertneqq;":"≨︀","&lvnE;":"≨︀","&mDDot;":"∺","&macr":"¯","&macr;":"¯","&male;":"♂","&malt;":"✠","&maltese;":"✠","&map;":"↦","&mapsto;":"↦","&mapstodown;":"↧","&mapstoleft;":"↤","&mapstoup;":"↥","&marker;":"▮","&mcomma;":"⨩","&mcy;":"м","&mdash;":"—","&measuredangle;":"∡","&mfr;":"𝔪","&mho;":"℧","&micro":"µ","&micro;":"µ","&mid;":"∣","&midast;":"*","&midcir;":"⫰","&middot":"·","&middot;":"·","&minus;":"−","&minusb;":"⊟","&minusd;":"∸","&minusdu;":"⨪","&mlcp;":"⫛","&mldr;":"…","&mnplus;":"∓","&models;":"⊧","&mopf;":"𝕞","&mp;":"∓","&mscr;":"𝓂","&mstpos;":"∾","&mu;":"μ","&multimap;":"⊸","&mumap;":"⊸","&nGg;":"⋙̸","&nGt;":"≫⃒","&nGtv;":"≫̸","&nLeftarrow;":"⇍","&nLeftrightarrow;":"⇎","&nLl;":"⋘̸","&nLt;":"≪⃒","&nLtv;":"≪̸","&nRightarrow;":"⇏","&nVDash;":"⊯","&nVdash;":"⊮","&nabla;":"∇","&nacute;":"ń","&nang;":"∠⃒","&nap;":"≉","&napE;":"⩰̸","&napid;":"≋̸","&napos;":"ŉ","&napprox;":"≉","&natur;":"♮","&natural;":"♮","&naturals;":"ℕ","&nbsp":" ","&nbsp;":" ","&nbump;":"≎̸","&nbumpe;":"≏̸","&ncap;":"⩃","&ncaron;":"ň","&ncedil;":"ņ","&ncong;":"≇","&ncongdot;":"⩭̸","&ncup;":"⩂","&ncy;":"н","&ndash;":"–","&ne;":"≠","&neArr;":"⇗","&nearhk;":"⤤","&nearr;":"↗","&nearrow;":"↗","&nedot;":"≐̸","&nequiv;":"≢","&nesear;":"⤨","&nesim;":"≂̸","&nexist;":"∄","&nexists;":"∄","&nfr;":"𝔫","&ngE;":"≧̸","&nge;":"≱","&ngeq;":"≱","&ngeqq;":"≧̸","&ngeqslant;":"⩾̸","&nges;":"⩾̸","&ngsim;":"≵","&ngt;":"≯","&ngtr;":"≯","&nhArr;":"⇎","&nharr;":"↮","&nhpar;":"⫲","&ni;":"∋","&nis;":"⋼","&nisd;":"⋺","&niv;":"∋","&njcy;":"њ","&nlArr;":"⇍","&nlE;":"≦̸","&nlarr;":"↚","&nldr;":"‥","&nle;":"≰","&nleftarrow;":"↚","&nleftrightarrow;":"↮","&nleq;":"≰","&nleqq;":"≦̸","&nleqslant;":"⩽̸","&nles;":"⩽̸","&nless;":"≮","&nlsim;":"≴","&nlt;":"≮","&nltri;":"⋪","&nltrie;":"⋬","&nmid;":"∤","&nopf;":"𝕟","&not":"¬","&not;":"¬","&notin;":"∉","&notinE;":"⋹̸","&notindot;":"⋵̸","&notinva;":"∉","&notinvb;":"⋷","&notinvc;":"⋶","&notni;":"∌","&notniva;":"∌","&notnivb;":"⋾","&notnivc;":"⋽","&npar;":"∦","&nparallel;":"∦","&nparsl;":"⫽⃥","&npart;":"∂̸","&npolint;":"⨔","&npr;":"⊀","&nprcue;":"⋠","&npre;":"⪯̸","&nprec;":"⊀","&npreceq;":"⪯̸","&nrArr;":"⇏","&nrarr;":"↛","&nrarrc;":"⤳̸","&nrarrw;":"↝̸","&nrightarrow;":"↛","&nrtri;":"⋫","&nrtrie;":"⋭","&nsc;":"⊁","&nsccue;":"⋡","&nsce;":"⪰̸","&nscr;":"𝓃","&nshortmid;":"∤","&nshortparallel;":"∦","&nsim;":"≁","&nsime;":"≄","&nsimeq;":"≄","&nsmid;":"∤","&nspar;":"∦","&nsqsube;":"⋢","&nsqsupe;":"⋣","&nsub;":"⊄","&nsubE;":"⫅̸","&nsube;":"⊈","&nsubset;":"⊂⃒","&nsubseteq;":"⊈","&nsubseteqq;":"⫅̸","&nsucc;":"⊁","&nsucceq;":"⪰̸","&nsup;":"⊅","&nsupE;":"⫆̸","&nsupe;":"⊉","&nsupset;":"⊃⃒","&nsupseteq;":"⊉","&nsupseteqq;":"⫆̸","&ntgl;":"≹","&ntilde":"ñ","&ntilde;":"ñ","&ntlg;":"≸","&ntriangleleft;":"⋪","&ntrianglelefteq;":"⋬","&ntriangleright;":"⋫","&ntrianglerighteq;":"⋭","&nu;":"ν","&num;":"#","&numero;":"№","&numsp;":" ","&nvDash;":"⊭","&nvHarr;":"⤄","&nvap;":"≍⃒","&nvdash;":"⊬","&nvge;":"≥⃒","&nvgt;":">⃒","&nvinfin;":"⧞","&nvlArr;":"⤂","&nvle;":"≤⃒","&nvlt;":"<⃒","&nvltrie;":"⊴⃒","&nvrArr;":"⤃","&nvrtrie;":"⊵⃒","&nvsim;":"∼⃒","&nwArr;":"⇖","&nwarhk;":"⤣","&nwarr;":"↖","&nwarrow;":"↖","&nwnear;":"⤧","&oS;":"Ⓢ","&oacute":"ó","&oacute;":"ó","&oast;":"⊛","&ocir;":"⊚","&ocirc":"ô","&ocirc;":"ô","&ocy;":"о","&odash;":"⊝","&odblac;":"ő","&odiv;":"⨸","&odot;":"⊙","&odsold;":"⦼","&oelig;":"œ","&ofcir;":"⦿","&ofr;":"𝔬","&ogon;":"˛","&ograve":"ò","&ograve;":"ò","&ogt;":"⧁","&ohbar;":"⦵","&ohm;":"Ω","&oint;":"∮","&olarr;":"↺","&olcir;":"⦾","&olcross;":"⦻","&oline;":"‾","&olt;":"⧀","&omacr;":"ō","&omega;":"ω","&omicron;":"ο","&omid;":"⦶","&ominus;":"⊖","&oopf;":"𝕠","&opar;":"⦷","&operp;":"⦹","&oplus;":"⊕","&or;":"∨","&orarr;":"↻","&ord;":"⩝","&order;":"ℴ","&orderof;":"ℴ","&ordf":"ª","&ordf;":"ª","&ordm":"º","&ordm;":"º","&origof;":"⊶","&oror;":"⩖","&orslope;":"⩗","&orv;":"⩛","&oscr;":"ℴ","&oslash":"ø","&oslash;":"ø","&osol;":"⊘","&otilde":"õ","&otilde;":"õ","&otimes;":"⊗","&otimesas;":"⨶","&ouml":"ö","&ouml;":"ö","&ovbar;":"⌽","&par;":"∥","&para":"¶","&para;":"¶","&parallel;":"∥","&parsim;":"⫳","&parsl;":"⫽","&part;":"∂","&pcy;":"п","&percnt;":"%","&period;":".","&permil;":"‰","&perp;":"⊥","&pertenk;":"‱","&pfr;":"𝔭","&phi;":"φ","&phiv;":"ϕ","&phmmat;":"ℳ","&phone;":"☎","&pi;":"π","&pitchfork;":"⋔","&piv;":"ϖ","&planck;":"ℏ","&planckh;":"ℎ","&plankv;":"ℏ","&plus;":"+","&plusacir;":"⨣","&plusb;":"⊞","&pluscir;":"⨢","&plusdo;":"∔","&plusdu;":"⨥","&pluse;":"⩲","&plusmn":"±","&plusmn;":"±","&plussim;":"⨦","&plustwo;":"⨧","&pm;":"±","&pointint;":"⨕","&popf;":"𝕡","&pound":"£","&pound;":"£","&pr;":"≺","&prE;":"⪳","&prap;":"⪷","&prcue;":"≼","&pre;":"⪯","&prec;":"≺","&precapprox;":"⪷","&preccurlyeq;":"≼","&preceq;":"⪯","&precnapprox;":"⪹","&precneqq;":"⪵","&precnsim;":"⋨","&precsim;":"≾","&prime;":"′","&primes;":"ℙ","&prnE;":"⪵","&prnap;":"⪹","&prnsim;":"⋨","&prod;":"∏","&profalar;":"⌮","&profline;":"⌒","&profsurf;":"⌓","&prop;":"∝","&propto;":"∝","&prsim;":"≾","&prurel;":"⊰","&pscr;":"𝓅","&psi;":"ψ","&puncsp;":" ","&qfr;":"𝔮","&qint;":"⨌","&qopf;":"𝕢","&qprime;":"⁗","&qscr;":"𝓆","&quaternions;":"ℍ","&quatint;":"⨖","&quest;":"?","&questeq;":"≟","&quot":'"',"&quot;":'"',"&rAarr;":"⇛","&rArr;":"⇒","&rAtail;":"⤜","&rBarr;":"⤏","&rHar;":"⥤","&race;":"∽̱","&racute;":"ŕ","&radic;":"√","&raemptyv;":"⦳","&rang;":"⟩","&rangd;":"⦒","&range;":"⦥","&rangle;":"⟩","&raquo":"»","&raquo;":"»","&rarr;":"→","&rarrap;":"⥵","&rarrb;":"⇥","&rarrbfs;":"⤠","&rarrc;":"⤳","&rarrfs;":"⤞","&rarrhk;":"↪","&rarrlp;":"↬","&rarrpl;":"⥅","&rarrsim;":"⥴","&rarrtl;":"↣","&rarrw;":"↝","&ratail;":"⤚","&ratio;":"∶","&rationals;":"ℚ","&rbarr;":"⤍","&rbbrk;":"❳","&rbrace;":"}","&rbrack;":"]","&rbrke;":"⦌","&rbrksld;":"⦎","&rbrkslu;":"⦐","&rcaron;":"ř","&rcedil;":"ŗ","&rceil;":"⌉","&rcub;":"}","&rcy;":"р","&rdca;":"⤷","&rdldhar;":"⥩","&rdquo;":"”","&rdquor;":"”","&rdsh;":"↳","&real;":"ℜ","&realine;":"ℛ","&realpart;":"ℜ","&reals;":"ℝ","&rect;":"▭","&reg":"®","&reg;":"®","&rfisht;":"⥽","&rfloor;":"⌋","&rfr;":"𝔯","&rhard;":"⇁","&rharu;":"⇀","&rharul;":"⥬","&rho;":"ρ","&rhov;":"ϱ","&rightarrow;":"→","&rightarrowtail;":"↣","&rightharpoondown;":"⇁","&rightharpoonup;":"⇀","&rightleftarrows;":"⇄","&rightleftharpoons;":"⇌","&rightrightarrows;":"⇉","&rightsquigarrow;":"↝","&rightthreetimes;":"⋌","&ring;":"˚","&risingdotseq;":"≓","&rlarr;":"⇄","&rlhar;":"⇌","&rlm;":"‏","&rmoust;":"⎱","&rmoustache;":"⎱","&rnmid;":"⫮","&roang;":"⟭","&roarr;":"⇾","&robrk;":"⟧","&ropar;":"⦆","&ropf;":"𝕣","&roplus;":"⨮","&rotimes;":"⨵","&rpar;":")","&rpargt;":"⦔","&rppolint;":"⨒","&rrarr;":"⇉","&rsaquo;":"›","&rscr;":"𝓇","&rsh;":"↱","&rsqb;":"]","&rsquo;":"’","&rsquor;":"’","&rthree;":"⋌","&rtimes;":"⋊","&rtri;":"▹","&rtrie;":"⊵","&rtrif;":"▸","&rtriltri;":"⧎","&ruluhar;":"⥨","&rx;":"℞","&sacute;":"ś","&sbquo;":"‚","&sc;":"≻","&scE;":"⪴","&scap;":"⪸","&scaron;":"š","&sccue;":"≽","&sce;":"⪰","&scedil;":"ş","&scirc;":"ŝ","&scnE;":"⪶","&scnap;":"⪺","&scnsim;":"⋩","&scpolint;":"⨓","&scsim;":"≿","&scy;":"с","&sdot;":"⋅","&sdotb;":"⊡","&sdote;":"⩦","&seArr;":"⇘","&searhk;":"⤥","&searr;":"↘","&searrow;":"↘","&sect":"§","&sect;":"§","&semi;":";","&seswar;":"⤩","&setminus;":"∖","&setmn;":"∖","&sext;":"✶","&sfr;":"𝔰","&sfrown;":"⌢","&sharp;":"♯","&shchcy;":"щ","&shcy;":"ш","&shortmid;":"∣","&shortparallel;":"∥","&shy":"­","&shy;":"­","&sigma;":"σ","&sigmaf;":"ς","&sigmav;":"ς","&sim;":"∼","&simdot;":"⩪","&sime;":"≃","&simeq;":"≃","&simg;":"⪞","&simgE;":"⪠","&siml;":"⪝","&simlE;":"⪟","&simne;":"≆","&simplus;":"⨤","&simrarr;":"⥲","&slarr;":"←","&smallsetminus;":"∖","&smashp;":"⨳","&smeparsl;":"⧤","&smid;":"∣","&smile;":"⌣","&smt;":"⪪","&smte;":"⪬","&smtes;":"⪬︀","&softcy;":"ь","&sol;":"/","&solb;":"⧄","&solbar;":"⌿","&sopf;":"𝕤","&spades;":"♠","&spadesuit;":"♠","&spar;":"∥","&sqcap;":"⊓","&sqcaps;":"⊓︀","&sqcup;":"⊔","&sqcups;":"⊔︀","&sqsub;":"⊏","&sqsube;":"⊑","&sqsubset;":"⊏","&sqsubseteq;":"⊑","&sqsup;":"⊐","&sqsupe;":"⊒","&sqsupset;":"⊐","&sqsupseteq;":"⊒","&squ;":"□","&square;":"□","&squarf;":"▪","&squf;":"▪","&srarr;":"→","&sscr;":"𝓈","&ssetmn;":"∖","&ssmile;":"⌣","&sstarf;":"⋆","&star;":"☆","&starf;":"★","&straightepsilon;":"ϵ","&straightphi;":"ϕ","&strns;":"¯","&sub;":"⊂","&subE;":"⫅","&subdot;":"⪽","&sube;":"⊆","&subedot;":"⫃","&submult;":"⫁","&subnE;":"⫋","&subne;":"⊊","&subplus;":"⪿","&subrarr;":"⥹","&subset;":"⊂","&subseteq;":"⊆","&subseteqq;":"⫅","&subsetneq;":"⊊","&subsetneqq;":"⫋","&subsim;":"⫇","&subsub;":"⫕","&subsup;":"⫓","&succ;":"≻","&succapprox;":"⪸","&succcurlyeq;":"≽","&succeq;":"⪰","&succnapprox;":"⪺","&succneqq;":"⪶","&succnsim;":"⋩","&succsim;":"≿","&sum;":"∑","&sung;":"♪","&sup1":"¹","&sup1;":"¹","&sup2":"²","&sup2;":"²","&sup3":"³","&sup3;":"³","&sup;":"⊃","&supE;":"⫆","&supdot;":"⪾","&supdsub;":"⫘","&supe;":"⊇","&supedot;":"⫄","&suphsol;":"⟉","&suphsub;":"⫗","&suplarr;":"⥻","&supmult;":"⫂","&supnE;":"⫌","&supne;":"⊋","&supplus;":"⫀","&supset;":"⊃","&supseteq;":"⊇","&supseteqq;":"⫆","&supsetneq;":"⊋","&supsetneqq;":"⫌","&supsim;":"⫈","&supsub;":"⫔","&supsup;":"⫖","&swArr;":"⇙","&swarhk;":"⤦","&swarr;":"↙","&swarrow;":"↙","&swnwar;":"⤪","&szlig":"ß","&szlig;":"ß","&target;":"⌖","&tau;":"τ","&tbrk;":"⎴","&tcaron;":"ť","&tcedil;":"ţ","&tcy;":"т","&tdot;":"⃛","&telrec;":"⌕","&tfr;":"𝔱","&there4;":"∴","&therefore;":"∴","&theta;":"θ","&thetasym;":"ϑ","&thetav;":"ϑ","&thickapprox;":"≈","&thicksim;":"∼","&thinsp;":" ","&thkap;":"≈","&thksim;":"∼","&thorn":"þ","&thorn;":"þ","&tilde;":"˜","&times":"×","&times;":"×","&timesb;":"⊠","&timesbar;":"⨱","&timesd;":"⨰","&tint;":"∭","&toea;":"⤨","&top;":"⊤","&topbot;":"⌶","&topcir;":"⫱","&topf;":"𝕥","&topfork;":"⫚","&tosa;":"⤩","&tprime;":"‴","&trade;":"™","&triangle;":"▵","&triangledown;":"▿","&triangleleft;":"◃","&trianglelefteq;":"⊴","&triangleq;":"≜","&triangleright;":"▹","&trianglerighteq;":"⊵","&tridot;":"◬","&trie;":"≜","&triminus;":"⨺","&triplus;":"⨹","&trisb;":"⧍","&tritime;":"⨻","&trpezium;":"⏢","&tscr;":"𝓉","&tscy;":"ц","&tshcy;":"ћ","&tstrok;":"ŧ","&twixt;":"≬","&twoheadleftarrow;":"↞","&twoheadrightarrow;":"↠","&uArr;":"⇑","&uHar;":"⥣","&uacute":"ú","&uacute;":"ú","&uarr;":"↑","&ubrcy;":"ў","&ubreve;":"ŭ","&ucirc":"û","&ucirc;":"û","&ucy;":"у","&udarr;":"⇅","&udblac;":"ű","&udhar;":"⥮","&ufisht;":"⥾","&ufr;":"𝔲","&ugrave":"ù","&ugrave;":"ù","&uharl;":"↿","&uharr;":"↾","&uhblk;":"▀","&ulcorn;":"⌜","&ulcorner;":"⌜","&ulcrop;":"⌏","&ultri;":"◸","&umacr;":"ū","&uml":"¨","&uml;":"¨","&uogon;":"ų","&uopf;":"𝕦","&uparrow;":"↑","&updownarrow;":"↕","&upharpoonleft;":"↿","&upharpoonright;":"↾","&uplus;":"⊎","&upsi;":"υ","&upsih;":"ϒ","&upsilon;":"υ","&upuparrows;":"⇈","&urcorn;":"⌝","&urcorner;":"⌝","&urcrop;":"⌎","&uring;":"ů","&urtri;":"◹","&uscr;":"𝓊","&utdot;":"⋰","&utilde;":"ũ","&utri;":"▵","&utrif;":"▴","&uuarr;":"⇈","&uuml":"ü","&uuml;":"ü","&uwangle;":"⦧","&vArr;":"⇕","&vBar;":"⫨","&vBarv;":"⫩","&vDash;":"⊨","&vangrt;":"⦜","&varepsilon;":"ϵ","&varkappa;":"ϰ","&varnothing;":"∅","&varphi;":"ϕ","&varpi;":"ϖ","&varpropto;":"∝","&varr;":"↕","&varrho;":"ϱ","&varsigma;":"ς","&varsubsetneq;":"⊊︀","&varsubsetneqq;":"⫋︀","&varsupsetneq;":"⊋︀","&varsupsetneqq;":"⫌︀","&vartheta;":"ϑ","&vartriangleleft;":"⊲","&vartriangleright;":"⊳","&vcy;":"в","&vdash;":"⊢","&vee;":"∨","&veebar;":"⊻","&veeeq;":"≚","&vellip;":"⋮","&verbar;":"|","&vert;":"|","&vfr;":"𝔳","&vltri;":"⊲","&vnsub;":"⊂⃒","&vnsup;":"⊃⃒","&vopf;":"𝕧","&vprop;":"∝","&vrtri;":"⊳","&vscr;":"𝓋","&vsubnE;":"⫋︀","&vsubne;":"⊊︀","&vsupnE;":"⫌︀","&vsupne;":"⊋︀","&vzigzag;":"⦚","&wcirc;":"ŵ","&wedbar;":"⩟","&wedge;":"∧","&wedgeq;":"≙","&weierp;":"℘","&wfr;":"𝔴","&wopf;":"𝕨","&wp;":"℘","&wr;":"≀","&wreath;":"≀","&wscr;":"𝓌","&xcap;":"⋂","&xcirc;":"◯","&xcup;":"⋃","&xdtri;":"▽","&xfr;":"𝔵","&xhArr;":"⟺","&xharr;":"⟷","&xi;":"ξ","&xlArr;":"⟸","&xlarr;":"⟵","&xmap;":"⟼","&xnis;":"⋻","&xodot;":"⨀","&xopf;":"𝕩","&xoplus;":"⨁","&xotime;":"⨂","&xrArr;":"⟹","&xrarr;":"⟶","&xscr;":"𝓍","&xsqcup;":"⨆","&xuplus;":"⨄","&xutri;":"△","&xvee;":"⋁","&xwedge;":"⋀","&yacute":"ý","&yacute;":"ý","&yacy;":"я","&ycirc;":"ŷ","&ycy;":"ы","&yen":"¥","&yen;":"¥","&yfr;":"𝔶","&yicy;":"ї","&yopf;":"𝕪","&yscr;":"𝓎","&yucy;":"ю","&yuml":"ÿ","&yuml;":"ÿ","&zacute;":"ź","&zcaron;":"ž","&zcy;":"з","&zdot;":"ż","&zeetrf;":"ℨ","&zeta;":"ζ","&zfr;":"𝔷","&zhcy;":"ж","&zigrarr;":"⇝","&zopf;":"𝕫","&zscr;":"𝓏","&zwj;":"‍","&zwnj;":"‌"},characters:{"Æ":"&AElig;","&":"&amp;","Á":"&Aacute;","Ă":"&Abreve;","Â":"&Acirc;","А":"&Acy;","𝔄":"&Afr;","À":"&Agrave;","Α":"&Alpha;","Ā":"&Amacr;","⩓":"&And;","Ą":"&Aogon;","𝔸":"&Aopf;","⁡":"&af;","Å":"&angst;","𝒜":"&Ascr;","≔":"&coloneq;","Ã":"&Atilde;","Ä":"&Auml;","∖":"&ssetmn;","⫧":"&Barv;","⌆":"&doublebarwedge;","Б":"&Bcy;","∵":"&because;","ℬ":"&bernou;","Β":"&Beta;","𝔅":"&Bfr;","𝔹":"&Bopf;","˘":"&breve;","≎":"&bump;","Ч":"&CHcy;","©":"&copy;","Ć":"&Cacute;","⋒":"&Cap;","ⅅ":"&DD;","ℭ":"&Cfr;","Č":"&Ccaron;","Ç":"&Ccedil;","Ĉ":"&Ccirc;","∰":"&Cconint;","Ċ":"&Cdot;","¸":"&cedil;","·":"&middot;","Χ":"&Chi;","⊙":"&odot;","⊖":"&ominus;","⊕":"&oplus;","⊗":"&otimes;","∲":"&cwconint;","”":"&rdquor;","’":"&rsquor;","∷":"&Proportion;","⩴":"&Colone;","≡":"&equiv;","∯":"&DoubleContourIntegral;","∮":"&oint;","ℂ":"&complexes;","∐":"&coprod;","∳":"&awconint;","⨯":"&Cross;","𝒞":"&Cscr;","⋓":"&Cup;","≍":"&asympeq;","⤑":"&DDotrahd;","Ђ":"&DJcy;","Ѕ":"&DScy;","Џ":"&DZcy;","‡":"&ddagger;","↡":"&Darr;","⫤":"&DoubleLeftTee;","Ď":"&Dcaron;","Д":"&Dcy;","∇":"&nabla;","Δ":"&Delta;","𝔇":"&Dfr;","´":"&acute;","˙":"&dot;","˝":"&dblac;","`":"&grave;","˜":"&tilde;","⋄":"&diamond;","ⅆ":"&dd;","𝔻":"&Dopf;","¨":"&uml;","⃜":"&DotDot;","≐":"&esdot;","⇓":"&dArr;","⇐":"&lArr;","⇔":"&iff;","⟸":"&xlArr;","⟺":"&xhArr;","⟹":"&xrArr;","⇒":"&rArr;","⊨":"&vDash;","⇑":"&uArr;","⇕":"&vArr;","∥":"&spar;","↓":"&downarrow;","⤓":"&DownArrowBar;","⇵":"&duarr;","̑":"&DownBreve;","⥐":"&DownLeftRightVector;","⥞":"&DownLeftTeeVector;","↽":"&lhard;","⥖":"&DownLeftVectorBar;","⥟":"&DownRightTeeVector;","⇁":"&rightharpoondown;","⥗":"&DownRightVectorBar;","⊤":"&top;","↧":"&mapstodown;","𝒟":"&Dscr;","Đ":"&Dstrok;","Ŋ":"&ENG;","Ð":"&ETH;","É":"&Eacute;","Ě":"&Ecaron;","Ê":"&Ecirc;","Э":"&Ecy;","Ė":"&Edot;","𝔈":"&Efr;","È":"&Egrave;","∈":"&isinv;","Ē":"&Emacr;","◻":"&EmptySmallSquare;","▫":"&EmptyVerySmallSquare;","Ę":"&Eogon;","𝔼":"&Eopf;","Ε":"&Epsilon;","⩵":"&Equal;","≂":"&esim;","⇌":"&rlhar;","ℰ":"&expectation;","⩳":"&Esim;","Η":"&Eta;","Ë":"&Euml;","∃":"&exist;","ⅇ":"&exponentiale;","Ф":"&Fcy;","𝔉":"&Ffr;","◼":"&FilledSmallSquare;","▪":"&squf;","𝔽":"&Fopf;","∀":"&forall;","ℱ":"&Fscr;","Ѓ":"&GJcy;",">":"&gt;","Γ":"&Gamma;","Ϝ":"&Gammad;","Ğ":"&Gbreve;","Ģ":"&Gcedil;","Ĝ":"&Gcirc;","Г":"&Gcy;","Ġ":"&Gdot;","𝔊":"&Gfr;","⋙":"&ggg;","𝔾":"&Gopf;","≥":"&geq;","⋛":"&gtreqless;","≧":"&geqq;","⪢":"&GreaterGreater;","≷":"&gtrless;","⩾":"&ges;","≳":"&gtrsim;","𝒢":"&Gscr;","≫":"&gg;","Ъ":"&HARDcy;","ˇ":"&caron;","^":"&Hat;","Ĥ":"&Hcirc;","ℌ":"&Poincareplane;","ℋ":"&hamilt;","ℍ":"&quaternions;","─":"&boxh;","Ħ":"&Hstrok;","≏":"&bumpeq;","Е":"&IEcy;","Ĳ":"&IJlig;","Ё":"&IOcy;","Í":"&Iacute;","Î":"&Icirc;","И":"&Icy;","İ":"&Idot;","ℑ":"&imagpart;","Ì":"&Igrave;","Ī":"&Imacr;","ⅈ":"&ii;","∬":"&Int;","∫":"&int;","⋂":"&xcap;","⁣":"&ic;","⁢":"&it;","Į":"&Iogon;","𝕀":"&Iopf;","Ι":"&Iota;","ℐ":"&imagline;","Ĩ":"&Itilde;","І":"&Iukcy;","Ï":"&Iuml;","Ĵ":"&Jcirc;","Й":"&Jcy;","𝔍":"&Jfr;","𝕁":"&Jopf;","𝒥":"&Jscr;","Ј":"&Jsercy;","Є":"&Jukcy;","Х":"&KHcy;","Ќ":"&KJcy;","Κ":"&Kappa;","Ķ":"&Kcedil;","К":"&Kcy;","𝔎":"&Kfr;","𝕂":"&Kopf;","𝒦":"&Kscr;","Љ":"&LJcy;","<":"&lt;","Ĺ":"&Lacute;","Λ":"&Lambda;","⟪":"&Lang;","ℒ":"&lagran;","↞":"&twoheadleftarrow;","Ľ":"&Lcaron;","Ļ":"&Lcedil;","Л":"&Lcy;","⟨":"&langle;","←":"&slarr;","⇤":"&larrb;","⇆":"&lrarr;","⌈":"&lceil;","⟦":"&lobrk;","⥡":"&LeftDownTeeVector;","⇃":"&downharpoonleft;","⥙":"&LeftDownVectorBar;","⌊":"&lfloor;","↔":"&leftrightarrow;","⥎":"&LeftRightVector;","⊣":"&dashv;","↤":"&mapstoleft;","⥚":"&LeftTeeVector;","⊲":"&vltri;","⧏":"&LeftTriangleBar;","⊴":"&trianglelefteq;","⥑":"&LeftUpDownVector;","⥠":"&LeftUpTeeVector;","↿":"&upharpoonleft;","⥘":"&LeftUpVectorBar;","↼":"&lharu;","⥒":"&LeftVectorBar;","⋚":"&lesseqgtr;","≦":"&leqq;","≶":"&lg;","⪡":"&LessLess;","⩽":"&les;","≲":"&lsim;","𝔏":"&Lfr;","⋘":"&Ll;","⇚":"&lAarr;","Ŀ":"&Lmidot;","⟵":"&xlarr;","⟷":"&xharr;","⟶":"&xrarr;","𝕃":"&Lopf;","↙":"&swarrow;","↘":"&searrow;","↰":"&lsh;","Ł":"&Lstrok;","≪":"&ll;","⤅":"&Map;","М":"&Mcy;"," ":"&MediumSpace;","ℳ":"&phmmat;","𝔐":"&Mfr;","∓":"&mp;","𝕄":"&Mopf;","Μ":"&Mu;","Њ":"&NJcy;","Ń":"&Nacute;","Ň":"&Ncaron;","Ņ":"&Ncedil;","Н":"&Ncy;","​":"&ZeroWidthSpace;","\n":"&NewLine;","𝔑":"&Nfr;","⁠":"&NoBreak;"," ":"&nbsp;","ℕ":"&naturals;","⫬":"&Not;","≢":"&nequiv;","≭":"&NotCupCap;","∦":"&nspar;","∉":"&notinva;","≠":"&ne;","≂̸":"&nesim;","∄":"&nexists;","≯":"&ngtr;","≱":"&ngeq;","≧̸":"&ngeqq;","≫̸":"&nGtv;","≹":"&ntgl;","⩾̸":"&nges;","≵":"&ngsim;","≎̸":"&nbump;","≏̸":"&nbumpe;","⋪":"&ntriangleleft;","⧏̸":"&NotLeftTriangleBar;","⋬":"&ntrianglelefteq;","≮":"&nlt;","≰":"&nleq;","≸":"&ntlg;","≪̸":"&nLtv;","⩽̸":"&nles;","≴":"&nlsim;","⪢̸":"&NotNestedGreaterGreater;","⪡̸":"&NotNestedLessLess;","⊀":"&nprec;","⪯̸":"&npreceq;","⋠":"&nprcue;","∌":"&notniva;","⋫":"&ntriangleright;","⧐̸":"&NotRightTriangleBar;","⋭":"&ntrianglerighteq;","⊏̸":"&NotSquareSubset;","⋢":"&nsqsube;","⊐̸":"&NotSquareSuperset;","⋣":"&nsqsupe;","⊂⃒":"&vnsub;","⊈":"&nsubseteq;","⊁":"&nsucc;","⪰̸":"&nsucceq;","⋡":"&nsccue;","≿̸":"&NotSucceedsTilde;","⊃⃒":"&vnsup;","⊉":"&nsupseteq;","≁":"&nsim;","≄":"&nsimeq;","≇":"&ncong;","≉":"&napprox;","∤":"&nsmid;","𝒩":"&Nscr;","Ñ":"&Ntilde;","Ν":"&Nu;","Œ":"&OElig;","Ó":"&Oacute;","Ô":"&Ocirc;","О":"&Ocy;","Ő":"&Odblac;","𝔒":"&Ofr;","Ò":"&Ograve;","Ō":"&Omacr;","Ω":"&ohm;","Ο":"&Omicron;","𝕆":"&Oopf;","“":"&ldquo;","‘":"&lsquo;","⩔":"&Or;","𝒪":"&Oscr;","Ø":"&Oslash;","Õ":"&Otilde;","⨷":"&Otimes;","Ö":"&Ouml;","‾":"&oline;","⏞":"&OverBrace;","⎴":"&tbrk;","⏜":"&OverParenthesis;","∂":"&part;","П":"&Pcy;","𝔓":"&Pfr;","Φ":"&Phi;","Π":"&Pi;","±":"&pm;","ℙ":"&primes;","⪻":"&Pr;","≺":"&prec;","⪯":"&preceq;","≼":"&preccurlyeq;","≾":"&prsim;","″":"&Prime;","∏":"&prod;","∝":"&vprop;","𝒫":"&Pscr;","Ψ":"&Psi;",'"':"&quot;","𝔔":"&Qfr;","ℚ":"&rationals;","𝒬":"&Qscr;","⤐":"&drbkarow;","®":"&reg;","Ŕ":"&Racute;","⟫":"&Rang;","↠":"&twoheadrightarrow;","⤖":"&Rarrtl;","Ř":"&Rcaron;","Ŗ":"&Rcedil;","Р":"&Rcy;","ℜ":"&realpart;","∋":"&niv;","⇋":"&lrhar;","⥯":"&duhar;","Ρ":"&Rho;","⟩":"&rangle;","→":"&srarr;","⇥":"&rarrb;","⇄":"&rlarr;","⌉":"&rceil;","⟧":"&robrk;","⥝":"&RightDownTeeVector;","⇂":"&downharpoonright;","⥕":"&RightDownVectorBar;","⌋":"&rfloor;","⊢":"&vdash;","↦":"&mapsto;","⥛":"&RightTeeVector;","⊳":"&vrtri;","⧐":"&RightTriangleBar;","⊵":"&trianglerighteq;","⥏":"&RightUpDownVector;","⥜":"&RightUpTeeVector;","↾":"&upharpoonright;","⥔":"&RightUpVectorBar;","⇀":"&rightharpoonup;","⥓":"&RightVectorBar;","ℝ":"&reals;","⥰":"&RoundImplies;","⇛":"&rAarr;","ℛ":"&realine;","↱":"&rsh;","⧴":"&RuleDelayed;","Щ":"&SHCHcy;","Ш":"&SHcy;","Ь":"&SOFTcy;","Ś":"&Sacute;","⪼":"&Sc;","Š":"&Scaron;","Ş":"&Scedil;","Ŝ":"&Scirc;","С":"&Scy;","𝔖":"&Sfr;","↑":"&uparrow;","Σ":"&Sigma;","∘":"&compfn;","𝕊":"&Sopf;","√":"&radic;","□":"&square;","⊓":"&sqcap;","⊏":"&sqsubset;","⊑":"&sqsubseteq;","⊐":"&sqsupset;","⊒":"&sqsupseteq;","⊔":"&sqcup;","𝒮":"&Sscr;","⋆":"&sstarf;","⋐":"&Subset;","⊆":"&subseteq;","≻":"&succ;","⪰":"&succeq;","≽":"&succcurlyeq;","≿":"&succsim;","∑":"&sum;","⋑":"&Supset;","⊃":"&supset;","⊇":"&supseteq;","Þ":"&THORN;","™":"&trade;","Ћ":"&TSHcy;","Ц":"&TScy;","\t":"&Tab;","Τ":"&Tau;","Ť":"&Tcaron;","Ţ":"&Tcedil;","Т":"&Tcy;","𝔗":"&Tfr;","∴":"&therefore;","Θ":"&Theta;","  ":"&ThickSpace;"," ":"&thinsp;","∼":"&thksim;","≃":"&simeq;","≅":"&cong;","≈":"&thkap;","𝕋":"&Topf;","⃛":"&tdot;","𝒯":"&Tscr;","Ŧ":"&Tstrok;","Ú":"&Uacute;","↟":"&Uarr;","⥉":"&Uarrocir;","Ў":"&Ubrcy;","Ŭ":"&Ubreve;","Û":"&Ucirc;","У":"&Ucy;","Ű":"&Udblac;","𝔘":"&Ufr;","Ù":"&Ugrave;","Ū":"&Umacr;",_:"&lowbar;","⏟":"&UnderBrace;","⎵":"&bbrk;","⏝":"&UnderParenthesis;","⋃":"&xcup;","⊎":"&uplus;","Ų":"&Uogon;","𝕌":"&Uopf;","⤒":"&UpArrowBar;","⇅":"&udarr;","↕":"&varr;","⥮":"&udhar;","⊥":"&perp;","↥":"&mapstoup;","↖":"&nwarrow;","↗":"&nearrow;","ϒ":"&upsih;","Υ":"&Upsilon;","Ů":"&Uring;","𝒰":"&Uscr;","Ũ":"&Utilde;","Ü":"&Uuml;","⊫":"&VDash;","⫫":"&Vbar;","В":"&Vcy;","⊩":"&Vdash;","⫦":"&Vdashl;","⋁":"&xvee;","‖":"&Vert;","∣":"&smid;","|":"&vert;","❘":"&VerticalSeparator;","≀":"&wreath;"," ":"&hairsp;","𝔙":"&Vfr;","𝕍":"&Vopf;","𝒱":"&Vscr;","⊪":"&Vvdash;","Ŵ":"&Wcirc;","⋀":"&xwedge;","𝔚":"&Wfr;","𝕎":"&Wopf;","𝒲":"&Wscr;","𝔛":"&Xfr;","Ξ":"&Xi;","𝕏":"&Xopf;","𝒳":"&Xscr;","Я":"&YAcy;","Ї":"&YIcy;","Ю":"&YUcy;","Ý":"&Yacute;","Ŷ":"&Ycirc;","Ы":"&Ycy;","𝔜":"&Yfr;","𝕐":"&Yopf;","𝒴":"&Yscr;","Ÿ":"&Yuml;","Ж":"&ZHcy;","Ź":"&Zacute;","Ž":"&Zcaron;","З":"&Zcy;","Ż":"&Zdot;","Ζ":"&Zeta;","ℨ":"&zeetrf;","ℤ":"&integers;","𝒵":"&Zscr;","á":"&aacute;","ă":"&abreve;","∾":"&mstpos;","∾̳":"&acE;","∿":"&acd;","â":"&acirc;","а":"&acy;","æ":"&aelig;","𝔞":"&afr;","à":"&agrave;","ℵ":"&aleph;","α":"&alpha;","ā":"&amacr;","⨿":"&amalg;","∧":"&wedge;","⩕":"&andand;","⩜":"&andd;","⩘":"&andslope;","⩚":"&andv;","∠":"&angle;","⦤":"&ange;","∡":"&measuredangle;","⦨":"&angmsdaa;","⦩":"&angmsdab;","⦪":"&angmsdac;","⦫":"&angmsdad;","⦬":"&angmsdae;","⦭":"&angmsdaf;","⦮":"&angmsdag;","⦯":"&angmsdah;","∟":"&angrt;","⊾":"&angrtvb;","⦝":"&angrtvbd;","∢":"&angsph;","⍼":"&angzarr;","ą":"&aogon;","𝕒":"&aopf;","⩰":"&apE;","⩯":"&apacir;","≊":"&approxeq;","≋":"&apid;","'":"&apos;","å":"&aring;","𝒶":"&ascr;","*":"&midast;","ã":"&atilde;","ä":"&auml;","⨑":"&awint;","⫭":"&bNot;","≌":"&bcong;","϶":"&bepsi;","‵":"&bprime;","∽":"&bsim;","⋍":"&bsime;","⊽":"&barvee;","⌅":"&barwedge;","⎶":"&bbrktbrk;","б":"&bcy;","„":"&ldquor;","⦰":"&bemptyv;","β":"&beta;","ℶ":"&beth;","≬":"&twixt;","𝔟":"&bfr;","◯":"&xcirc;","⨀":"&xodot;","⨁":"&xoplus;","⨂":"&xotime;","⨆":"&xsqcup;","★":"&starf;","▽":"&xdtri;","△":"&xutri;","⨄":"&xuplus;","⤍":"&rbarr;","⧫":"&lozf;","▴":"&utrif;","▾":"&dtrif;","◂":"&ltrif;","▸":"&rtrif;","␣":"&blank;","▒":"&blk12;","░":"&blk14;","▓":"&blk34;","█":"&block;","=⃥":"&bne;","≡⃥":"&bnequiv;","⌐":"&bnot;","𝕓":"&bopf;","⋈":"&bowtie;","╗":"&boxDL;","╔":"&boxDR;","╖":"&boxDl;","╓":"&boxDr;","═":"&boxH;","╦":"&boxHD;","╩":"&boxHU;","╤":"&boxHd;","╧":"&boxHu;","╝":"&boxUL;","╚":"&boxUR;","╜":"&boxUl;","╙":"&boxUr;","║":"&boxV;","╬":"&boxVH;","╣":"&boxVL;","╠":"&boxVR;","╫":"&boxVh;","╢":"&boxVl;","╟":"&boxVr;","⧉":"&boxbox;","╕":"&boxdL;","╒":"&boxdR;","┐":"&boxdl;","┌":"&boxdr;","╥":"&boxhD;","╨":"&boxhU;","┬":"&boxhd;","┴":"&boxhu;","⊟":"&minusb;","⊞":"&plusb;","⊠":"&timesb;","╛":"&boxuL;","╘":"&boxuR;","┘":"&boxul;","└":"&boxur;","│":"&boxv;","╪":"&boxvH;","╡":"&boxvL;","╞":"&boxvR;","┼":"&boxvh;","┤":"&boxvl;","├":"&boxvr;","¦":"&brvbar;","𝒷":"&bscr;","⁏":"&bsemi;","\\":"&bsol;","⧅":"&bsolb;","⟈":"&bsolhsub;","•":"&bullet;","⪮":"&bumpE;","ć":"&cacute;","∩":"&cap;","⩄":"&capand;","⩉":"&capbrcup;","⩋":"&capcap;","⩇":"&capcup;","⩀":"&capdot;","∩︀":"&caps;","⁁":"&caret;","⩍":"&ccaps;","č":"&ccaron;","ç":"&ccedil;","ĉ":"&ccirc;","⩌":"&ccups;","⩐":"&ccupssm;","ċ":"&cdot;","⦲":"&cemptyv;","¢":"&cent;","𝔠":"&cfr;","ч":"&chcy;","✓":"&checkmark;","χ":"&chi;","○":"&cir;","⧃":"&cirE;","ˆ":"&circ;","≗":"&cire;","↺":"&olarr;","↻":"&orarr;","Ⓢ":"&oS;","⊛":"&oast;","⊚":"&ocir;","⊝":"&odash;","⨐":"&cirfnint;","⫯":"&cirmid;","⧂":"&cirscir;","♣":"&clubsuit;",":":"&colon;",",":"&comma;","@":"&commat;","∁":"&complement;","⩭":"&congdot;","𝕔":"&copf;","℗":"&copysr;","↵":"&crarr;","✗":"&cross;","𝒸":"&cscr;","⫏":"&csub;","⫑":"&csube;","⫐":"&csup;","⫒":"&csupe;","⋯":"&ctdot;","⤸":"&cudarrl;","⤵":"&cudarrr;","⋞":"&curlyeqprec;","⋟":"&curlyeqsucc;","↶":"&curvearrowleft;","⤽":"&cularrp;","∪":"&cup;","⩈":"&cupbrcap;","⩆":"&cupcap;","⩊":"&cupcup;","⊍":"&cupdot;","⩅":"&cupor;","∪︀":"&cups;","↷":"&curvearrowright;","⤼":"&curarrm;","⋎":"&cuvee;","⋏":"&cuwed;","¤":"&curren;","∱":"&cwint;","⌭":"&cylcty;","⥥":"&dHar;","†":"&dagger;","ℸ":"&daleth;","‐":"&hyphen;","⤏":"&rBarr;","ď":"&dcaron;","д":"&dcy;","⇊":"&downdownarrows;","⩷":"&eDDot;","°":"&deg;","δ":"&delta;","⦱":"&demptyv;","⥿":"&dfisht;","𝔡":"&dfr;","♦":"&diams;","ϝ":"&gammad;","⋲":"&disin;","÷":"&divide;","⋇":"&divonx;","ђ":"&djcy;","⌞":"&llcorner;","⌍":"&dlcrop;",$:"&dollar;","𝕕":"&dopf;","≑":"&eDot;","∸":"&minusd;","∔":"&plusdo;","⊡":"&sdotb;","⌟":"&lrcorner;","⌌":"&drcrop;","𝒹":"&dscr;","ѕ":"&dscy;","⧶":"&dsol;","đ":"&dstrok;","⋱":"&dtdot;","▿":"&triangledown;","⦦":"&dwangle;","џ":"&dzcy;","⟿":"&dzigrarr;","é":"&eacute;","⩮":"&easter;","ě":"&ecaron;","≖":"&eqcirc;","ê":"&ecirc;","≕":"&eqcolon;","э":"&ecy;","ė":"&edot;","≒":"&fallingdotseq;","𝔢":"&efr;","⪚":"&eg;","è":"&egrave;","⪖":"&eqslantgtr;","⪘":"&egsdot;","⪙":"&el;","⏧":"&elinters;","ℓ":"&ell;","⪕":"&eqslantless;","⪗":"&elsdot;","ē":"&emacr;","∅":"&varnothing;"," ":"&emsp13;"," ":"&emsp14;"," ":"&emsp;","ŋ":"&eng;"," ":"&ensp;","ę":"&eogon;","𝕖":"&eopf;","⋕":"&epar;","⧣":"&eparsl;","⩱":"&eplus;","ε":"&epsilon;","ϵ":"&varepsilon;","=":"&equals;","≟":"&questeq;","⩸":"&equivDD;","⧥":"&eqvparsl;","≓":"&risingdotseq;","⥱":"&erarr;","ℯ":"&escr;","η":"&eta;","ð":"&eth;","ë":"&euml;","€":"&euro;","!":"&excl;","ф":"&fcy;","♀":"&female;","ﬃ":"&ffilig;","ﬀ":"&fflig;","ﬄ":"&ffllig;","𝔣":"&ffr;","ﬁ":"&filig;",fj:"&fjlig;","♭":"&flat;","ﬂ":"&fllig;","▱":"&fltns;","ƒ":"&fnof;","𝕗":"&fopf;","⋔":"&pitchfork;","⫙":"&forkv;","⨍":"&fpartint;","½":"&half;","⅓":"&frac13;","¼":"&frac14;","⅕":"&frac15;","⅙":"&frac16;","⅛":"&frac18;","⅔":"&frac23;","⅖":"&frac25;","¾":"&frac34;","⅗":"&frac35;","⅜":"&frac38;","⅘":"&frac45;","⅚":"&frac56;","⅝":"&frac58;","⅞":"&frac78;","⁄":"&frasl;","⌢":"&sfrown;","𝒻":"&fscr;","⪌":"&gtreqqless;","ǵ":"&gacute;","γ":"&gamma;","⪆":"&gtrapprox;","ğ":"&gbreve;","ĝ":"&gcirc;","г":"&gcy;","ġ":"&gdot;","⪩":"&gescc;","⪀":"&gesdot;","⪂":"&gesdoto;","⪄":"&gesdotol;","⋛︀":"&gesl;","⪔":"&gesles;","𝔤":"&gfr;","ℷ":"&gimel;","ѓ":"&gjcy;","⪒":"&glE;","⪥":"&gla;","⪤":"&glj;","≩":"&gneqq;","⪊":"&gnapprox;","⪈":"&gneq;","⋧":"&gnsim;","𝕘":"&gopf;","ℊ":"&gscr;","⪎":"&gsime;","⪐":"&gsiml;","⪧":"&gtcc;","⩺":"&gtcir;","⋗":"&gtrdot;","⦕":"&gtlPar;","⩼":"&gtquest;","⥸":"&gtrarr;","≩︀":"&gvnE;","ъ":"&hardcy;","⥈":"&harrcir;","↭":"&leftrightsquigarrow;","ℏ":"&plankv;","ĥ":"&hcirc;","♥":"&heartsuit;","…":"&mldr;","⊹":"&hercon;","𝔥":"&hfr;","⤥":"&searhk;","⤦":"&swarhk;","⇿":"&hoarr;","∻":"&homtht;","↩":"&larrhk;","↪":"&rarrhk;","𝕙":"&hopf;","―":"&horbar;","𝒽":"&hscr;","ħ":"&hstrok;","⁃":"&hybull;","í":"&iacute;","î":"&icirc;","и":"&icy;","е":"&iecy;","¡":"&iexcl;","𝔦":"&ifr;","ì":"&igrave;","⨌":"&qint;","∭":"&tint;","⧜":"&iinfin;","℩":"&iiota;","ĳ":"&ijlig;","ī":"&imacr;","ı":"&inodot;","⊷":"&imof;","Ƶ":"&imped;","℅":"&incare;","∞":"&infin;","⧝":"&infintie;","⊺":"&intercal;","⨗":"&intlarhk;","⨼":"&iprod;","ё":"&iocy;","į":"&iogon;","𝕚":"&iopf;","ι":"&iota;","¿":"&iquest;","𝒾":"&iscr;","⋹":"&isinE;","⋵":"&isindot;","⋴":"&isins;","⋳":"&isinsv;","ĩ":"&itilde;","і":"&iukcy;","ï":"&iuml;","ĵ":"&jcirc;","й":"&jcy;","𝔧":"&jfr;","ȷ":"&jmath;","𝕛":"&jopf;","𝒿":"&jscr;","ј":"&jsercy;","є":"&jukcy;","κ":"&kappa;","ϰ":"&varkappa;","ķ":"&kcedil;","к":"&kcy;","𝔨":"&kfr;","ĸ":"&kgreen;","х":"&khcy;","ќ":"&kjcy;","𝕜":"&kopf;","𝓀":"&kscr;","⤛":"&lAtail;","⤎":"&lBarr;","⪋":"&lesseqqgtr;","⥢":"&lHar;","ĺ":"&lacute;","⦴":"&laemptyv;","λ":"&lambda;","⦑":"&langd;","⪅":"&lessapprox;","«":"&laquo;","⤟":"&larrbfs;","⤝":"&larrfs;","↫":"&looparrowleft;","⤹":"&larrpl;","⥳":"&larrsim;","↢":"&leftarrowtail;","⪫":"&lat;","⤙":"&latail;","⪭":"&late;","⪭︀":"&lates;","⤌":"&lbarr;","❲":"&lbbrk;","{":"&lcub;","[":"&lsqb;","⦋":"&lbrke;","⦏":"&lbrksld;","⦍":"&lbrkslu;","ľ":"&lcaron;","ļ":"&lcedil;","л":"&lcy;","⤶":"&ldca;","⥧":"&ldrdhar;","⥋":"&ldrushar;","↲":"&ldsh;","≤":"&leq;","⇇":"&llarr;","⋋":"&lthree;","⪨":"&lescc;","⩿":"&lesdot;","⪁":"&lesdoto;","⪃":"&lesdotor;","⋚︀":"&lesg;","⪓":"&lesges;","⋖":"&ltdot;","⥼":"&lfisht;","𝔩":"&lfr;","⪑":"&lgE;","⥪":"&lharul;","▄":"&lhblk;","љ":"&ljcy;","⥫":"&llhard;","◺":"&lltri;","ŀ":"&lmidot;","⎰":"&lmoustache;","≨":"&lneqq;","⪉":"&lnapprox;","⪇":"&lneq;","⋦":"&lnsim;","⟬":"&loang;","⇽":"&loarr;","⟼":"&xmap;","↬":"&rarrlp;","⦅":"&lopar;","𝕝":"&lopf;","⨭":"&loplus;","⨴":"&lotimes;","∗":"&lowast;","◊":"&lozenge;","(":"&lpar;","⦓":"&lparlt;","⥭":"&lrhard;","‎":"&lrm;","⊿":"&lrtri;","‹":"&lsaquo;","𝓁":"&lscr;","⪍":"&lsime;","⪏":"&lsimg;","‚":"&sbquo;","ł":"&lstrok;","⪦":"&ltcc;","⩹":"&ltcir;","⋉":"&ltimes;","⥶":"&ltlarr;","⩻":"&ltquest;","⦖":"&ltrPar;","◃":"&triangleleft;","⥊":"&lurdshar;","⥦":"&luruhar;","≨︀":"&lvnE;","∺":"&mDDot;","¯":"&strns;","♂":"&male;","✠":"&maltese;","▮":"&marker;","⨩":"&mcomma;","м":"&mcy;","—":"&mdash;","𝔪":"&mfr;","℧":"&mho;","µ":"&micro;","⫰":"&midcir;","−":"&minus;","⨪":"&minusdu;","⫛":"&mlcp;","⊧":"&models;","𝕞":"&mopf;","𝓂":"&mscr;","μ":"&mu;","⊸":"&mumap;","⋙̸":"&nGg;","≫⃒":"&nGt;","⇍":"&nlArr;","⇎":"&nhArr;","⋘̸":"&nLl;","≪⃒":"&nLt;","⇏":"&nrArr;","⊯":"&nVDash;","⊮":"&nVdash;","ń":"&nacute;","∠⃒":"&nang;","⩰̸":"&napE;","≋̸":"&napid;","ŉ":"&napos;","♮":"&natural;","⩃":"&ncap;","ň":"&ncaron;","ņ":"&ncedil;","⩭̸":"&ncongdot;","⩂":"&ncup;","н":"&ncy;","–":"&ndash;","⇗":"&neArr;","⤤":"&nearhk;","≐̸":"&nedot;","⤨":"&toea;","𝔫":"&nfr;","↮":"&nleftrightarrow;","⫲":"&nhpar;","⋼":"&nis;","⋺":"&nisd;","њ":"&njcy;","≦̸":"&nleqq;","↚":"&nleftarrow;","‥":"&nldr;","𝕟":"&nopf;","¬":"&not;","⋹̸":"&notinE;","⋵̸":"&notindot;","⋷":"&notinvb;","⋶":"&notinvc;","⋾":"&notnivb;","⋽":"&notnivc;","⫽⃥":"&nparsl;","∂̸":"&npart;","⨔":"&npolint;","↛":"&nrightarrow;","⤳̸":"&nrarrc;","↝̸":"&nrarrw;","𝓃":"&nscr;","⊄":"&nsub;","⫅̸":"&nsubseteqq;","⊅":"&nsup;","⫆̸":"&nsupseteqq;","ñ":"&ntilde;","ν":"&nu;","#":"&num;","№":"&numero;"," ":"&numsp;","⊭":"&nvDash;","⤄":"&nvHarr;","≍⃒":"&nvap;","⊬":"&nvdash;","≥⃒":"&nvge;",">⃒":"&nvgt;","⧞":"&nvinfin;","⤂":"&nvlArr;","≤⃒":"&nvle;","<⃒":"&nvlt;","⊴⃒":"&nvltrie;","⤃":"&nvrArr;","⊵⃒":"&nvrtrie;","∼⃒":"&nvsim;","⇖":"&nwArr;","⤣":"&nwarhk;","⤧":"&nwnear;","ó":"&oacute;","ô":"&ocirc;","о":"&ocy;","ő":"&odblac;","⨸":"&odiv;","⦼":"&odsold;","œ":"&oelig;","⦿":"&ofcir;","𝔬":"&ofr;","˛":"&ogon;","ò":"&ograve;","⧁":"&ogt;","⦵":"&ohbar;","⦾":"&olcir;","⦻":"&olcross;","⧀":"&olt;","ō":"&omacr;","ω":"&omega;","ο":"&omicron;","⦶":"&omid;","𝕠":"&oopf;","⦷":"&opar;","⦹":"&operp;","∨":"&vee;","⩝":"&ord;","ℴ":"&oscr;","ª":"&ordf;","º":"&ordm;","⊶":"&origof;","⩖":"&oror;","⩗":"&orslope;","⩛":"&orv;","ø":"&oslash;","⊘":"&osol;","õ":"&otilde;","⨶":"&otimesas;","ö":"&ouml;","⌽":"&ovbar;","¶":"&para;","⫳":"&parsim;","⫽":"&parsl;","п":"&pcy;","%":"&percnt;",".":"&period;","‰":"&permil;","‱":"&pertenk;","𝔭":"&pfr;","φ":"&phi;","ϕ":"&varphi;","☎":"&phone;","π":"&pi;","ϖ":"&varpi;","ℎ":"&planckh;","+":"&plus;","⨣":"&plusacir;","⨢":"&pluscir;","⨥":"&plusdu;","⩲":"&pluse;","⨦":"&plussim;","⨧":"&plustwo;","⨕":"&pointint;","𝕡":"&popf;","£":"&pound;","⪳":"&prE;","⪷":"&precapprox;","⪹":"&prnap;","⪵":"&prnE;","⋨":"&prnsim;","′":"&prime;","⌮":"&profalar;","⌒":"&profline;","⌓":"&profsurf;","⊰":"&prurel;","𝓅":"&pscr;","ψ":"&psi;"," ":"&puncsp;","𝔮":"&qfr;","𝕢":"&qopf;","⁗":"&qprime;","𝓆":"&qscr;","⨖":"&quatint;","?":"&quest;","⤜":"&rAtail;","⥤":"&rHar;","∽̱":"&race;","ŕ":"&racute;","⦳":"&raemptyv;","⦒":"&rangd;","⦥":"&range;","»":"&raquo;","⥵":"&rarrap;","⤠":"&rarrbfs;","⤳":"&rarrc;","⤞":"&rarrfs;","⥅":"&rarrpl;","⥴":"&rarrsim;","↣":"&rightarrowtail;","↝":"&rightsquigarrow;","⤚":"&ratail;","∶":"&ratio;","❳":"&rbbrk;","}":"&rcub;","]":"&rsqb;","⦌":"&rbrke;","⦎":"&rbrksld;","⦐":"&rbrkslu;","ř":"&rcaron;","ŗ":"&rcedil;","р":"&rcy;","⤷":"&rdca;","⥩":"&rdldhar;","↳":"&rdsh;","▭":"&rect;","⥽":"&rfisht;","𝔯":"&rfr;","⥬":"&rharul;","ρ":"&rho;","ϱ":"&varrho;","⇉":"&rrarr;","⋌":"&rthree;","˚":"&ring;","‏":"&rlm;","⎱":"&rmoustache;","⫮":"&rnmid;","⟭":"&roang;","⇾":"&roarr;","⦆":"&ropar;","𝕣":"&ropf;","⨮":"&roplus;","⨵":"&rotimes;",")":"&rpar;","⦔":"&rpargt;","⨒":"&rppolint;","›":"&rsaquo;","𝓇":"&rscr;","⋊":"&rtimes;","▹":"&triangleright;","⧎":"&rtriltri;","⥨":"&ruluhar;","℞":"&rx;","ś":"&sacute;","⪴":"&scE;","⪸":"&succapprox;","š":"&scaron;","ş":"&scedil;","ŝ":"&scirc;","⪶":"&succneqq;","⪺":"&succnapprox;","⋩":"&succnsim;","⨓":"&scpolint;","с":"&scy;","⋅":"&sdot;","⩦":"&sdote;","⇘":"&seArr;","§":"&sect;",";":"&semi;","⤩":"&tosa;","✶":"&sext;","𝔰":"&sfr;","♯":"&sharp;","щ":"&shchcy;","ш":"&shcy;","­":"&shy;","σ":"&sigma;","ς":"&varsigma;","⩪":"&simdot;","⪞":"&simg;","⪠":"&simgE;","⪝":"&siml;","⪟":"&simlE;","≆":"&simne;","⨤":"&simplus;","⥲":"&simrarr;","⨳":"&smashp;","⧤":"&smeparsl;","⌣":"&ssmile;","⪪":"&smt;","⪬":"&smte;","⪬︀":"&smtes;","ь":"&softcy;","/":"&sol;","⧄":"&solb;","⌿":"&solbar;","𝕤":"&sopf;","♠":"&spadesuit;","⊓︀":"&sqcaps;","⊔︀":"&sqcups;","𝓈":"&sscr;","☆":"&star;","⊂":"&subset;","⫅":"&subseteqq;","⪽":"&subdot;","⫃":"&subedot;","⫁":"&submult;","⫋":"&subsetneqq;","⊊":"&subsetneq;","⪿":"&subplus;","⥹":"&subrarr;","⫇":"&subsim;","⫕":"&subsub;","⫓":"&subsup;","♪":"&sung;","¹":"&sup1;","²":"&sup2;","³":"&sup3;","⫆":"&supseteqq;","⪾":"&supdot;","⫘":"&supdsub;","⫄":"&supedot;","⟉":"&suphsol;","⫗":"&suphsub;","⥻":"&suplarr;","⫂":"&supmult;","⫌":"&supsetneqq;","⊋":"&supsetneq;","⫀":"&supplus;","⫈":"&supsim;","⫔":"&supsub;","⫖":"&supsup;","⇙":"&swArr;","⤪":"&swnwar;","ß":"&szlig;","⌖":"&target;","τ":"&tau;","ť":"&tcaron;","ţ":"&tcedil;","т":"&tcy;","⌕":"&telrec;","𝔱":"&tfr;","θ":"&theta;","ϑ":"&vartheta;","þ":"&thorn;","×":"&times;","⨱":"&timesbar;","⨰":"&timesd;","⌶":"&topbot;","⫱":"&topcir;","𝕥":"&topf;","⫚":"&topfork;","‴":"&tprime;","▵":"&utri;","≜":"&trie;","◬":"&tridot;","⨺":"&triminus;","⨹":"&triplus;","⧍":"&trisb;","⨻":"&tritime;","⏢":"&trpezium;","𝓉":"&tscr;","ц":"&tscy;","ћ":"&tshcy;","ŧ":"&tstrok;","⥣":"&uHar;","ú":"&uacute;","ў":"&ubrcy;","ŭ":"&ubreve;","û":"&ucirc;","у":"&ucy;","ű":"&udblac;","⥾":"&ufisht;","𝔲":"&ufr;","ù":"&ugrave;","▀":"&uhblk;","⌜":"&ulcorner;","⌏":"&ulcrop;","◸":"&ultri;","ū":"&umacr;","ų":"&uogon;","𝕦":"&uopf;","υ":"&upsilon;","⇈":"&uuarr;","⌝":"&urcorner;","⌎":"&urcrop;","ů":"&uring;","◹":"&urtri;","𝓊":"&uscr;","⋰":"&utdot;","ũ":"&utilde;","ü":"&uuml;","⦧":"&uwangle;","⫨":"&vBar;","⫩":"&vBarv;","⦜":"&vangrt;","⊊︀":"&vsubne;","⫋︀":"&vsubnE;","⊋︀":"&vsupne;","⫌︀":"&vsupnE;","в":"&vcy;","⊻":"&veebar;","≚":"&veeeq;","⋮":"&vellip;","𝔳":"&vfr;","𝕧":"&vopf;","𝓋":"&vscr;","⦚":"&vzigzag;","ŵ":"&wcirc;","⩟":"&wedbar;","≙":"&wedgeq;","℘":"&wp;","𝔴":"&wfr;","𝕨":"&wopf;","𝓌":"&wscr;","𝔵":"&xfr;","ξ":"&xi;","⋻":"&xnis;","𝕩":"&xopf;","𝓍":"&xscr;","ý":"&yacute;","я":"&yacy;","ŷ":"&ycirc;","ы":"&ycy;","¥":"&yen;","𝔶":"&yfr;","ї":"&yicy;","𝕪":"&yopf;","𝓎":"&yscr;","ю":"&yucy;","ÿ":"&yuml;","ź":"&zacute;","ž":"&zcaron;","з":"&zcy;","ż":"&zdot;","ζ":"&zeta;","𝔷":"&zfr;","ж":"&zhcy;","⇝":"&zigrarr;","𝕫":"&zopf;","𝓏":"&zscr;","‍":"&zwj;","‌":"&zwnj;"}}};
  	
  	return namedReferences;
  }

  var numericUnicodeMap = {};

  var hasRequiredNumericUnicodeMap;

  function requireNumericUnicodeMap () {
  	if (hasRequiredNumericUnicodeMap) return numericUnicodeMap;
  	hasRequiredNumericUnicodeMap = 1;
  Object.defineProperty(numericUnicodeMap,"__esModule",{value:true});numericUnicodeMap.numericUnicodeMap={0:65533,128:8364,130:8218,131:402,132:8222,133:8230,134:8224,135:8225,136:710,137:8240,138:352,139:8249,140:338,142:381,145:8216,146:8217,147:8220,148:8221,149:8226,150:8211,151:8212,152:732,153:8482,154:353,155:8250,156:339,158:382,159:376};
  	
  	return numericUnicodeMap;
  }

  var surrogatePairs = {};

  var hasRequiredSurrogatePairs;

  function requireSurrogatePairs () {
  	if (hasRequiredSurrogatePairs) return surrogatePairs;
  	hasRequiredSurrogatePairs = 1;
  Object.defineProperty(surrogatePairs,"__esModule",{value:true});surrogatePairs.fromCodePoint=String.fromCodePoint||function(astralCodePoint){return String.fromCharCode(Math.floor((astralCodePoint-65536)/1024)+55296,(astralCodePoint-65536)%1024+56320)};surrogatePairs.getCodePoint=String.prototype.codePointAt?function(input,position){return input.codePointAt(position)}:function(input,position){return (input.charCodeAt(position)-55296)*1024+input.charCodeAt(position+1)-56320+65536};surrogatePairs.highSurrogateFrom=55296;surrogatePairs.highSurrogateTo=56319;
  	
  	return surrogatePairs;
  }

  var hasRequiredLib;

  function requireLib () {
  	if (hasRequiredLib) return lib;
  	hasRequiredLib = 1;
  var __assign=lib&&lib.__assign||function(){__assign=Object.assign||function(t){for(var s,i=1,n=arguments.length;i<n;i++){s=arguments[i];for(var p in s)if(Object.prototype.hasOwnProperty.call(s,p))t[p]=s[p];}return t};return __assign.apply(this,arguments)};Object.defineProperty(lib,"__esModule",{value:true});var named_references_1=/*@__PURE__*/ requireNamedReferences();var numeric_unicode_map_1=/*@__PURE__*/ requireNumericUnicodeMap();var surrogate_pairs_1=/*@__PURE__*/ requireSurrogatePairs();var allNamedReferences=__assign(__assign({},named_references_1.namedReferences),{all:named_references_1.namedReferences.html5});function replaceUsingRegExp(macroText,macroRegExp,macroReplacer){macroRegExp.lastIndex=0;var replaceMatch=macroRegExp.exec(macroText);var replaceResult;if(replaceMatch){replaceResult="";var replaceLastIndex=0;do{if(replaceLastIndex!==replaceMatch.index){replaceResult+=macroText.substring(replaceLastIndex,replaceMatch.index);}var replaceInput=replaceMatch[0];replaceResult+=macroReplacer(replaceInput);replaceLastIndex=replaceMatch.index+replaceInput.length;}while(replaceMatch=macroRegExp.exec(macroText));if(replaceLastIndex!==macroText.length){replaceResult+=macroText.substring(replaceLastIndex);}}else {replaceResult=macroText;}return replaceResult}var encodeRegExps={specialChars:/[<>'"&]/g,nonAscii:/[<>'"&\u0080-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/g,nonAsciiPrintable:/[<>'"&\x01-\x08\x11-\x15\x17-\x1F\x7f-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/g,nonAsciiPrintableOnly:/[\x01-\x08\x11-\x15\x17-\x1F\x7f-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/g,extensive:/[\x01-\x0c\x0e-\x1f\x21-\x2c\x2e-\x2f\x3a-\x40\x5b-\x60\x7b-\x7d\x7f-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/g};var defaultEncodeOptions={mode:"specialChars",level:"all",numeric:"decimal"};function encode(text,_a){var _b=_a===void 0?defaultEncodeOptions:_a,_c=_b.mode,mode=_c===void 0?"specialChars":_c,_d=_b.numeric,numeric=_d===void 0?"decimal":_d,_e=_b.level,level=_e===void 0?"all":_e;if(!text){return ""}var encodeRegExp=encodeRegExps[mode];var references=allNamedReferences[level].characters;var isHex=numeric==="hexadecimal";return replaceUsingRegExp(text,encodeRegExp,(function(input){var result=references[input];if(!result){var code=input.length>1?surrogate_pairs_1.getCodePoint(input,0):input.charCodeAt(0);result=(isHex?"&#x"+code.toString(16):"&#"+code)+";";}return result}))}lib.encode=encode;var defaultDecodeOptions={scope:"body",level:"all"};var strict=/&(?:#\d+|#[xX][\da-fA-F]+|[0-9a-zA-Z]+);/g;var attribute=/&(?:#\d+|#[xX][\da-fA-F]+|[0-9a-zA-Z]+)[;=]?/g;var baseDecodeRegExps={xml:{strict:strict,attribute:attribute,body:named_references_1.bodyRegExps.xml},html4:{strict:strict,attribute:attribute,body:named_references_1.bodyRegExps.html4},html5:{strict:strict,attribute:attribute,body:named_references_1.bodyRegExps.html5}};var decodeRegExps=__assign(__assign({},baseDecodeRegExps),{all:baseDecodeRegExps.html5});var fromCharCode=String.fromCharCode;var outOfBoundsChar=fromCharCode(65533);var defaultDecodeEntityOptions={level:"all"};function getDecodedEntity(entity,references,isAttribute,isStrict){var decodeResult=entity;var decodeEntityLastChar=entity[entity.length-1];if(isAttribute&&decodeEntityLastChar==="="){decodeResult=entity;}else if(isStrict&&decodeEntityLastChar!==";"){decodeResult=entity;}else {var decodeResultByReference=references[entity];if(decodeResultByReference){decodeResult=decodeResultByReference;}else if(entity[0]==="&"&&entity[1]==="#"){var decodeSecondChar=entity[2];var decodeCode=decodeSecondChar=="x"||decodeSecondChar=="X"?parseInt(entity.substr(3),16):parseInt(entity.substr(2));decodeResult=decodeCode>=1114111?outOfBoundsChar:decodeCode>65535?surrogate_pairs_1.fromCodePoint(decodeCode):fromCharCode(numeric_unicode_map_1.numericUnicodeMap[decodeCode]||decodeCode);}}return decodeResult}function decodeEntity(entity,_a){var _b=(_a===void 0?defaultDecodeEntityOptions:_a).level,level=_b===void 0?"all":_b;if(!entity){return ""}return getDecodedEntity(entity,allNamedReferences[level].entities,false,false)}lib.decodeEntity=decodeEntity;function decode(text,_a){var _b=_a===void 0?defaultDecodeOptions:_a,_c=_b.level,level=_c===void 0?"all":_c,_d=_b.scope,scope=_d===void 0?level==="xml"?"strict":"body":_d;if(!text){return ""}var decodeRegExp=decodeRegExps[level][scope];var references=allNamedReferences[level].entities;var isAttribute=scope==="attribute";var isStrict=scope==="strict";return replaceUsingRegExp(text,decodeRegExp,(function(entity){return getDecodedEntity(entity,references,isAttribute,isStrict)}))}lib.decode=decode;
  	
  	return lib;
  }

  var libExports = /*@__PURE__*/ requireLib();

  const { checkText,emojiMap } = smile2emoji;
  // import util from 'node:util'

  function t(str) {
      // TODO: raise as a bug?
     const leading = str.match(/^[\s]*/);
  //   console.log('"'+str+'"')

      return {type: 'text', value: leading + libExports.decode(checkText(str),{level: 'html5'})};
  }

  // This file was generated. Do not modify manually!
  var astralIdentifierCodes = [509, 0, 227, 0, 150, 4, 294, 9, 1368, 2, 2, 1, 6, 3, 41, 2, 5, 0, 166, 1, 574, 3, 9, 9, 7, 9, 32, 4, 318, 1, 80, 3, 71, 10, 50, 3, 123, 2, 54, 14, 32, 10, 3, 1, 11, 3, 46, 10, 8, 0, 46, 9, 7, 2, 37, 13, 2, 9, 6, 1, 45, 0, 13, 2, 49, 13, 9, 3, 2, 11, 83, 11, 7, 0, 3, 0, 158, 11, 6, 9, 7, 3, 56, 1, 2, 6, 3, 1, 3, 2, 10, 0, 11, 1, 3, 6, 4, 4, 68, 8, 2, 0, 3, 0, 2, 3, 2, 4, 2, 0, 15, 1, 83, 17, 10, 9, 5, 0, 82, 19, 13, 9, 214, 6, 3, 8, 28, 1, 83, 16, 16, 9, 82, 12, 9, 9, 7, 19, 58, 14, 5, 9, 243, 14, 166, 9, 71, 5, 2, 1, 3, 3, 2, 0, 2, 1, 13, 9, 120, 6, 3, 6, 4, 0, 29, 9, 41, 6, 2, 3, 9, 0, 10, 10, 47, 15, 343, 9, 54, 7, 2, 7, 17, 9, 57, 21, 2, 13, 123, 5, 4, 0, 2, 1, 2, 6, 2, 0, 9, 9, 49, 4, 2, 1, 2, 4, 9, 9, 330, 3, 10, 1, 2, 0, 49, 6, 4, 4, 14, 10, 5350, 0, 7, 14, 11465, 27, 2343, 9, 87, 9, 39, 4, 60, 6, 26, 9, 535, 9, 470, 0, 2, 54, 8, 3, 82, 0, 12, 1, 19628, 1, 4178, 9, 519, 45, 3, 22, 543, 4, 4, 5, 9, 7, 3, 6, 31, 3, 149, 2, 1418, 49, 513, 54, 5, 49, 9, 0, 15, 0, 23, 4, 2, 14, 1361, 6, 2, 16, 3, 6, 2, 1, 2, 4, 101, 0, 161, 6, 10, 9, 357, 0, 62, 13, 499, 13, 245, 1, 2, 9, 726, 6, 110, 6, 6, 9, 4759, 9, 787719, 239];

  // This file was generated. Do not modify manually!
  var astralIdentifierStartCodes = [0, 11, 2, 25, 2, 18, 2, 1, 2, 14, 3, 13, 35, 122, 70, 52, 268, 28, 4, 48, 48, 31, 14, 29, 6, 37, 11, 29, 3, 35, 5, 7, 2, 4, 43, 157, 19, 35, 5, 35, 5, 39, 9, 51, 13, 10, 2, 14, 2, 6, 2, 1, 2, 10, 2, 14, 2, 6, 2, 1, 4, 51, 13, 310, 10, 21, 11, 7, 25, 5, 2, 41, 2, 8, 70, 5, 3, 0, 2, 43, 2, 1, 4, 0, 3, 22, 11, 22, 10, 30, 66, 18, 2, 1, 11, 21, 11, 25, 71, 55, 7, 1, 65, 0, 16, 3, 2, 2, 2, 28, 43, 28, 4, 28, 36, 7, 2, 27, 28, 53, 11, 21, 11, 18, 14, 17, 111, 72, 56, 50, 14, 50, 14, 35, 39, 27, 10, 22, 251, 41, 7, 1, 17, 2, 60, 28, 11, 0, 9, 21, 43, 17, 47, 20, 28, 22, 13, 52, 58, 1, 3, 0, 14, 44, 33, 24, 27, 35, 30, 0, 3, 0, 9, 34, 4, 0, 13, 47, 15, 3, 22, 0, 2, 0, 36, 17, 2, 24, 20, 1, 64, 6, 2, 0, 2, 3, 2, 14, 2, 9, 8, 46, 39, 7, 3, 1, 3, 21, 2, 6, 2, 1, 2, 4, 4, 0, 19, 0, 13, 4, 31, 9, 2, 0, 3, 0, 2, 37, 2, 0, 26, 0, 2, 0, 45, 52, 19, 3, 21, 2, 31, 47, 21, 1, 2, 0, 185, 46, 42, 3, 37, 47, 21, 0, 60, 42, 14, 0, 72, 26, 38, 6, 186, 43, 117, 63, 32, 7, 3, 0, 3, 7, 2, 1, 2, 23, 16, 0, 2, 0, 95, 7, 3, 38, 17, 0, 2, 0, 29, 0, 11, 39, 8, 0, 22, 0, 12, 45, 20, 0, 19, 72, 200, 32, 32, 8, 2, 36, 18, 0, 50, 29, 113, 6, 2, 1, 2, 37, 22, 0, 26, 5, 2, 1, 2, 31, 15, 0, 328, 18, 16, 0, 2, 12, 2, 33, 125, 0, 80, 921, 103, 110, 18, 195, 2637, 96, 16, 1071, 18, 5, 26, 3994, 6, 582, 6842, 29, 1763, 568, 8, 30, 18, 78, 18, 29, 19, 47, 17, 3, 32, 20, 6, 18, 433, 44, 212, 63, 129, 74, 6, 0, 67, 12, 65, 1, 2, 0, 29, 6135, 9, 1237, 42, 9, 8936, 3, 2, 6, 2, 1, 2, 290, 16, 0, 30, 2, 3, 0, 15, 3, 9, 395, 2309, 106, 6, 12, 4, 8, 8, 9, 5991, 84, 2, 70, 2, 1, 3, 0, 3, 1, 3, 3, 2, 11, 2, 0, 2, 6, 2, 64, 2, 3, 3, 7, 2, 6, 2, 27, 2, 3, 2, 4, 2, 0, 4, 6, 2, 339, 3, 24, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 7, 1845, 30, 7, 5, 262, 61, 147, 44, 11, 6, 17, 0, 322, 29, 19, 43, 485, 27, 229, 29, 3, 0, 496, 6, 2, 3, 2, 1, 2, 14, 2, 196, 60, 67, 8, 0, 1205, 3, 2, 26, 2, 1, 2, 0, 3, 0, 2, 9, 2, 3, 2, 0, 2, 0, 7, 0, 5, 0, 2, 0, 2, 0, 2, 2, 2, 1, 2, 0, 3, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 1, 2, 0, 3, 3, 2, 6, 2, 3, 2, 3, 2, 0, 2, 9, 2, 16, 6, 2, 2, 4, 2, 16, 4421, 42719, 33, 4153, 7, 221, 3, 5761, 15, 7472, 16, 621, 2467, 541, 1507, 4938, 6, 4191];

  // This file was generated. Do not modify manually!
  var nonASCIIidentifierChars = "\u200c\u200d\xb7\u0300-\u036f\u0387\u0483-\u0487\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u0669\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7\u06e8\u06ea-\u06ed\u06f0-\u06f9\u0711\u0730-\u074a\u07a6-\u07b0\u07c0-\u07c9\u07eb-\u07f3\u07fd\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0859-\u085b\u0897-\u089f\u08ca-\u08e1\u08e3-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962\u0963\u0966-\u096f\u0981-\u0983\u09bc\u09be-\u09c4\u09c7\u09c8\u09cb-\u09cd\u09d7\u09e2\u09e3\u09e6-\u09ef\u09fe\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a66-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2\u0ae3\u0ae6-\u0aef\u0afa-\u0aff\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b55-\u0b57\u0b62\u0b63\u0b66-\u0b6f\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7\u0be6-\u0bef\u0c00-\u0c04\u0c3c\u0c3e-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0c66-\u0c6f\u0c81-\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0ce6-\u0cef\u0cf3\u0d00-\u0d03\u0d3b\u0d3c\u0d3e-\u0d44\u0d46-\u0d48\u0d4a-\u0d4d\u0d57\u0d62\u0d63\u0d66-\u0d6f\u0d81-\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0de6-\u0def\u0df2\u0df3\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0e50-\u0e59\u0eb1\u0eb4-\u0ebc\u0ec8-\u0ece\u0ed0-\u0ed9\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e\u0f3f\u0f71-\u0f84\u0f86\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u102b-\u103e\u1040-\u1049\u1056-\u1059\u105e-\u1060\u1062-\u1064\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-\u109d\u135d-\u135f\u1369-\u1371\u1712-\u1715\u1732-\u1734\u1752\u1753\u1772\u1773\u17b4-\u17d3\u17dd\u17e0-\u17e9\u180b-\u180d\u180f-\u1819\u18a9\u1920-\u192b\u1930-\u193b\u1946-\u194f\u19d0-\u19da\u1a17-\u1a1b\u1a55-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1ab0-\u1abd\u1abf-\u1ace\u1b00-\u1b04\u1b34-\u1b44\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1b82\u1ba1-\u1bad\u1bb0-\u1bb9\u1be6-\u1bf3\u1c24-\u1c37\u1c40-\u1c49\u1c50-\u1c59\u1cd0-\u1cd2\u1cd4-\u1ce8\u1ced\u1cf4\u1cf7-\u1cf9\u1dc0-\u1dff\u200c\u200d\u203f\u2040\u2054\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2cef-\u2cf1\u2d7f\u2de0-\u2dff\u302a-\u302f\u3099\u309a\u30fb\ua620-\ua629\ua66f\ua674-\ua67d\ua69e\ua69f\ua6f0\ua6f1\ua802\ua806\ua80b\ua823-\ua827\ua82c\ua880\ua881\ua8b4-\ua8c5\ua8d0-\ua8d9\ua8e0-\ua8f1\ua8ff-\ua909\ua926-\ua92d\ua947-\ua953\ua980-\ua983\ua9b3-\ua9c0\ua9d0-\ua9d9\ua9e5\ua9f0-\ua9f9\uaa29-\uaa36\uaa43\uaa4c\uaa4d\uaa50-\uaa59\uaa7b-\uaa7d\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uaaeb-\uaaef\uaaf5\uaaf6\uabe3-\uabea\uabec\uabed\uabf0-\uabf9\ufb1e\ufe00-\ufe0f\ufe20-\ufe2f\ufe33\ufe34\ufe4d-\ufe4f\uff10-\uff19\uff3f\uff65";

  // This file was generated. Do not modify manually!
  var nonASCIIidentifierStartChars = "\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u037f\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u052f\u0531-\u0556\u0559\u0560-\u0588\u05d0-\u05ea\u05ef-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u0860-\u086a\u0870-\u0887\u0889-\u088e\u08a0-\u08c9\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u09fc\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0af9\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c39\u0c3d\u0c58-\u0c5a\u0c5d\u0c60\u0c61\u0c80\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cdd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d04-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d54-\u0d56\u0d5f-\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e86-\u0e8a\u0e8c-\u0ea3\u0ea5\u0ea7-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f5\u13f8-\u13fd\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f8\u1700-\u1711\u171f-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1878\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191e\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4c\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1c80-\u1c8a\u1c90-\u1cba\u1cbd-\u1cbf\u1ce9-\u1cec\u1cee-\u1cf3\u1cf5\u1cf6\u1cfa\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2118-\u211d\u2124\u2126\u2128\u212a-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309b-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312f\u3131-\u318e\u31a0-\u31bf\u31f0-\u31ff\u3400-\u4dbf\u4e00-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua69d\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua7cd\ua7d0\ua7d1\ua7d3\ua7d5-\ua7dc\ua7f2-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua8fd\ua8fe\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\ua9e0-\ua9e4\ua9e6-\ua9ef\ua9fa-\ua9fe\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa7e-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uab30-\uab5a\uab5c-\uab69\uab70-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc";

  // These are a run-length and offset encoded representation of the
  // >0xffff code points that are a valid part of identifiers. The
  // offset starts at 0x10000, and each pair of numbers represents an
  // offset to the next range, and then a size of the range.

  // Reserved word lists for various dialects of the language

  var reservedWords = {
    3: "abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile",
    5: "class enum extends super const export import",
    6: "enum",
    strict: "implements interface let package private protected public static yield",
    strictBind: "eval arguments"
  };

  // And the keywords

  var ecma5AndLessKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this";

  var keywords$1 = {
    5: ecma5AndLessKeywords,
    "5module": ecma5AndLessKeywords + " export import",
    6: ecma5AndLessKeywords + " const class extends export import super"
  };

  var keywordRelationalOperator = /^in(stanceof)?$/;

  // ## Character categories

  var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
  var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");

  // This has a complexity linear to the value of the code. The
  // assumption is that looking up astral identifier characters is
  // rare.
  function isInAstralSet(code, set) {
    var pos = 0x10000;
    for (var i = 0; i < set.length; i += 2) {
      pos += set[i];
      if (pos > code) { return false }
      pos += set[i + 1];
      if (pos >= code) { return true }
    }
    return false
  }

  // Test whether a given character code starts an identifier.

  function isIdentifierStart(code, astral) {
    if (code < 65) { return code === 36 }
    if (code < 91) { return true }
    if (code < 97) { return code === 95 }
    if (code < 123) { return true }
    if (code <= 0xffff) { return code >= 0xaa && nonASCIIidentifierStart.test(String.fromCharCode(code)) }
    if (astral === false) { return false }
    return isInAstralSet(code, astralIdentifierStartCodes)
  }

  // Test whether a given character is part of an identifier.

  function isIdentifierChar(code, astral) {
    if (code < 48) { return code === 36 }
    if (code < 58) { return true }
    if (code < 65) { return false }
    if (code < 91) { return true }
    if (code < 97) { return code === 95 }
    if (code < 123) { return true }
    if (code <= 0xffff) { return code >= 0xaa && nonASCIIidentifier.test(String.fromCharCode(code)) }
    if (astral === false) { return false }
    return isInAstralSet(code, astralIdentifierStartCodes) || isInAstralSet(code, astralIdentifierCodes)
  }

  // ## Token types

  // The assignment of fine-grained, information-carrying type objects
  // allows the tokenizer to store the information it has about a
  // token in a way that is very cheap for the parser to look up.

  // All token type variables start with an underscore, to make them
  // easy to recognize.

  // The `beforeExpr` property is used to disambiguate between regular
  // expressions and divisions. It is set on all token types that can
  // be followed by an expression (thus, a slash after them would be a
  // regular expression).
  //
  // The `startsExpr` property is used to check if the token ends a
  // `yield` expression. It is set on all token types that either can
  // directly start an expression (like a quotation mark) or can
  // continue an expression (like the body of a string).
  //
  // `isLoop` marks a keyword as starting a loop, which is important
  // to know when parsing a label, in order to allow or disallow
  // continue jumps to that label.

  var TokenType = function TokenType(label, conf) {
    if ( conf === void 0 ) conf = {};

    this.label = label;
    this.keyword = conf.keyword;
    this.beforeExpr = !!conf.beforeExpr;
    this.startsExpr = !!conf.startsExpr;
    this.isLoop = !!conf.isLoop;
    this.isAssign = !!conf.isAssign;
    this.prefix = !!conf.prefix;
    this.postfix = !!conf.postfix;
    this.binop = conf.binop || null;
    this.updateContext = null;
  };

  function binop(name, prec) {
    return new TokenType(name, {beforeExpr: true, binop: prec})
  }
  var beforeExpr = {beforeExpr: true}, startsExpr = {startsExpr: true};

  // Map keyword names to token types.

  var keywords = {};

  // Succinct definitions of keyword token types
  function kw(name, options) {
    if ( options === void 0 ) options = {};

    options.keyword = name;
    return keywords[name] = new TokenType(name, options)
  }

  var types$1 = {
    num: new TokenType("num", startsExpr),
    regexp: new TokenType("regexp", startsExpr),
    string: new TokenType("string", startsExpr),
    name: new TokenType("name", startsExpr),
    privateId: new TokenType("privateId", startsExpr),
    eof: new TokenType("eof"),

    // Punctuation token types.
    bracketL: new TokenType("[", {beforeExpr: true, startsExpr: true}),
    bracketR: new TokenType("]"),
    braceL: new TokenType("{", {beforeExpr: true, startsExpr: true}),
    braceR: new TokenType("}"),
    parenL: new TokenType("(", {beforeExpr: true, startsExpr: true}),
    parenR: new TokenType(")"),
    comma: new TokenType(",", beforeExpr),
    semi: new TokenType(";", beforeExpr),
    colon: new TokenType(":", beforeExpr),
    dot: new TokenType("."),
    question: new TokenType("?", beforeExpr),
    questionDot: new TokenType("?."),
    arrow: new TokenType("=>", beforeExpr),
    template: new TokenType("template"),
    invalidTemplate: new TokenType("invalidTemplate"),
    ellipsis: new TokenType("...", beforeExpr),
    backQuote: new TokenType("`", startsExpr),
    dollarBraceL: new TokenType("${", {beforeExpr: true, startsExpr: true}),

    // Operators. These carry several kinds of properties to help the
    // parser use them properly (the presence of these properties is
    // what categorizes them as operators).
    //
    // `binop`, when present, specifies that this operator is a binary
    // operator, and will refer to its precedence.
    //
    // `prefix` and `postfix` mark the operator as a prefix or postfix
    // unary operator.
    //
    // `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
    // binary operators with a very low precedence, that should result
    // in AssignmentExpression nodes.

    eq: new TokenType("=", {beforeExpr: true, isAssign: true}),
    assign: new TokenType("_=", {beforeExpr: true, isAssign: true}),
    incDec: new TokenType("++/--", {prefix: true, postfix: true, startsExpr: true}),
    prefix: new TokenType("!/~", {beforeExpr: true, prefix: true, startsExpr: true}),
    logicalOR: binop("||", 1),
    logicalAND: binop("&&", 2),
    bitwiseOR: binop("|", 3),
    bitwiseXOR: binop("^", 4),
    bitwiseAND: binop("&", 5),
    equality: binop("==/!=/===/!==", 6),
    relational: binop("</>/<=/>=", 7),
    bitShift: binop("<</>>/>>>", 8),
    plusMin: new TokenType("+/-", {beforeExpr: true, binop: 9, prefix: true, startsExpr: true}),
    modulo: binop("%", 10),
    star: binop("*", 10),
    slash: binop("/", 10),
    starstar: new TokenType("**", {beforeExpr: true}),
    coalesce: binop("??", 1),

    // Keyword token types.
    _break: kw("break"),
    _case: kw("case", beforeExpr),
    _catch: kw("catch"),
    _continue: kw("continue"),
    _debugger: kw("debugger"),
    _default: kw("default", beforeExpr),
    _do: kw("do", {isLoop: true, beforeExpr: true}),
    _else: kw("else", beforeExpr),
    _finally: kw("finally"),
    _for: kw("for", {isLoop: true}),
    _function: kw("function", startsExpr),
    _if: kw("if"),
    _return: kw("return", beforeExpr),
    _switch: kw("switch"),
    _throw: kw("throw", beforeExpr),
    _try: kw("try"),
    _var: kw("var"),
    _const: kw("const"),
    _while: kw("while", {isLoop: true}),
    _with: kw("with"),
    _new: kw("new", {beforeExpr: true, startsExpr: true}),
    _this: kw("this", startsExpr),
    _super: kw("super", startsExpr),
    _class: kw("class", startsExpr),
    _extends: kw("extends", beforeExpr),
    _export: kw("export"),
    _import: kw("import", startsExpr),
    _null: kw("null", startsExpr),
    _true: kw("true", startsExpr),
    _false: kw("false", startsExpr),
    _in: kw("in", {beforeExpr: true, binop: 7}),
    _instanceof: kw("instanceof", {beforeExpr: true, binop: 7}),
    _typeof: kw("typeof", {beforeExpr: true, prefix: true, startsExpr: true}),
    _void: kw("void", {beforeExpr: true, prefix: true, startsExpr: true}),
    _delete: kw("delete", {beforeExpr: true, prefix: true, startsExpr: true})
  };

  // Matches a whole line break (where CRLF is considered a single
  // line break). Used to count lines.

  var lineBreak = /\r\n?|\n|\u2028|\u2029/;
  var lineBreakG = new RegExp(lineBreak.source, "g");

  function isNewLine(code) {
    return code === 10 || code === 13 || code === 0x2028 || code === 0x2029
  }

  function nextLineBreak(code, from, end) {
    if ( end === void 0 ) end = code.length;

    for (var i = from; i < end; i++) {
      var next = code.charCodeAt(i);
      if (isNewLine(next))
        { return i < end - 1 && next === 13 && code.charCodeAt(i + 1) === 10 ? i + 2 : i + 1 }
    }
    return -1
  }

  var nonASCIIwhitespace = /[\u1680\u2000-\u200a\u202f\u205f\u3000\ufeff]/;

  var skipWhiteSpace = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g;

  var ref = Object.prototype;
  var hasOwnProperty = ref.hasOwnProperty;
  var toString = ref.toString;

  var hasOwn = Object.hasOwn || (function (obj, propName) { return (
    hasOwnProperty.call(obj, propName)
  ); });

  var isArray = Array.isArray || (function (obj) { return (
    toString.call(obj) === "[object Array]"
  ); });

  var regexpCache = Object.create(null);

  function wordsRegexp(words) {
    return regexpCache[words] || (regexpCache[words] = new RegExp("^(?:" + words.replace(/ /g, "|") + ")$"))
  }

  function codePointToString(code) {
    // UTF-16 Decoding
    if (code <= 0xFFFF) { return String.fromCharCode(code) }
    code -= 0x10000;
    return String.fromCharCode((code >> 10) + 0xD800, (code & 1023) + 0xDC00)
  }

  var loneSurrogate = /(?:[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/;

  // These are used when `options.locations` is on, for the
  // `startLoc` and `endLoc` properties.

  var Position = function Position(line, col) {
    this.line = line;
    this.column = col;
  };

  Position.prototype.offset = function offset (n) {
    return new Position(this.line, this.column + n)
  };

  var SourceLocation = function SourceLocation(p, start, end) {
    this.start = start;
    this.end = end;
    if (p.sourceFile !== null) { this.source = p.sourceFile; }
  };

  // The `getLineInfo` function is mostly useful when the
  // `locations` option is off (for performance reasons) and you
  // want to find the line/column position for a given character
  // offset. `input` should be the code string that the offset refers
  // into.

  function getLineInfo(input, offset) {
    for (var line = 1, cur = 0;;) {
      var nextBreak = nextLineBreak(input, cur, offset);
      if (nextBreak < 0) { return new Position(line, offset - cur) }
      ++line;
      cur = nextBreak;
    }
  }

  // A second argument must be given to configure the parser process.
  // These options are recognized (only `ecmaVersion` is required):

  var defaultOptions = {
    // `ecmaVersion` indicates the ECMAScript version to parse. Must be
    // either 3, 5, 6 (or 2015), 7 (2016), 8 (2017), 9 (2018), 10
    // (2019), 11 (2020), 12 (2021), 13 (2022), 14 (2023), or `"latest"`
    // (the latest version the library supports). This influences
    // support for strict mode, the set of reserved words, and support
    // for new syntax features.
    ecmaVersion: null,
    // `sourceType` indicates the mode the code should be parsed in.
    // Can be either `"script"` or `"module"`. This influences global
    // strict mode and parsing of `import` and `export` declarations.
    sourceType: "script",
    // `onInsertedSemicolon` can be a callback that will be called when
    // a semicolon is automatically inserted. It will be passed the
    // position of the inserted semicolon as an offset, and if
    // `locations` is enabled, it is given the location as a `{line,
    // column}` object as second argument.
    onInsertedSemicolon: null,
    // `onTrailingComma` is similar to `onInsertedSemicolon`, but for
    // trailing commas.
    onTrailingComma: null,
    // By default, reserved words are only enforced if ecmaVersion >= 5.
    // Set `allowReserved` to a boolean value to explicitly turn this on
    // an off. When this option has the value "never", reserved words
    // and keywords can also not be used as property names.
    allowReserved: null,
    // When enabled, a return at the top level is not considered an
    // error.
    allowReturnOutsideFunction: false,
    // When enabled, import/export statements are not constrained to
    // appearing at the top of the program, and an import.meta expression
    // in a script isn't considered an error.
    allowImportExportEverywhere: false,
    // By default, await identifiers are allowed to appear at the top-level scope only if ecmaVersion >= 2022.
    // When enabled, await identifiers are allowed to appear at the top-level scope,
    // but they are still not allowed in non-async functions.
    allowAwaitOutsideFunction: null,
    // When enabled, super identifiers are not constrained to
    // appearing in methods and do not raise an error when they appear elsewhere.
    allowSuperOutsideMethod: null,
    // When enabled, hashbang directive in the beginning of file is
    // allowed and treated as a line comment. Enabled by default when
    // `ecmaVersion` >= 2023.
    allowHashBang: false,
    // By default, the parser will verify that private properties are
    // only used in places where they are valid and have been declared.
    // Set this to false to turn such checks off.
    checkPrivateFields: true,
    // When `locations` is on, `loc` properties holding objects with
    // `start` and `end` properties in `{line, column}` form (with
    // line being 1-based and column 0-based) will be attached to the
    // nodes.
    locations: false,
    // A function can be passed as `onToken` option, which will
    // cause Acorn to call that function with object in the same
    // format as tokens returned from `tokenizer().getToken()`. Note
    // that you are not allowed to call the parser from the
    // callback—that will corrupt its internal state.
    onToken: null,
    // A function can be passed as `onComment` option, which will
    // cause Acorn to call that function with `(block, text, start,
    // end)` parameters whenever a comment is skipped. `block` is a
    // boolean indicating whether this is a block (`/* */`) comment,
    // `text` is the content of the comment, and `start` and `end` are
    // character offsets that denote the start and end of the comment.
    // When the `locations` option is on, two more parameters are
    // passed, the full `{line, column}` locations of the start and
    // end of the comments. Note that you are not allowed to call the
    // parser from the callback—that will corrupt its internal state.
    // When this option has an array as value, objects representing the
    // comments are pushed to it.
    onComment: null,
    // Nodes have their start and end characters offsets recorded in
    // `start` and `end` properties (directly on the node, rather than
    // the `loc` object, which holds line/column data. To also add a
    // [semi-standardized][range] `range` property holding a `[start,
    // end]` array with the same numbers, set the `ranges` option to
    // `true`.
    //
    // [range]: https://bugzilla.mozilla.org/show_bug.cgi?id=745678
    ranges: false,
    // It is possible to parse multiple files into a single AST by
    // passing the tree produced by parsing the first file as
    // `program` option in subsequent parses. This will add the
    // toplevel forms of the parsed file to the `Program` (top) node
    // of an existing parse tree.
    program: null,
    // When `locations` is on, you can pass this to record the source
    // file in every node's `loc` object.
    sourceFile: null,
    // This value, if given, is stored in every node, whether
    // `locations` is on or off.
    directSourceFile: null,
    // When enabled, parenthesized expressions are represented by
    // (non-standard) ParenthesizedExpression nodes
    preserveParens: false
  };

  // Interpret and default an options object

  var warnedAboutEcmaVersion = false;

  function getOptions(opts) {
    var options = {};

    for (var opt in defaultOptions)
      { options[opt] = opts && hasOwn(opts, opt) ? opts[opt] : defaultOptions[opt]; }

    if (options.ecmaVersion === "latest") {
      options.ecmaVersion = 1e8;
    } else if (options.ecmaVersion == null) {
      if (!warnedAboutEcmaVersion && typeof console === "object" && console.warn) {
        warnedAboutEcmaVersion = true;
        console.warn("Since Acorn 8.0.0, options.ecmaVersion is required.\nDefaulting to 2020, but this will stop working in the future.");
      }
      options.ecmaVersion = 11;
    } else if (options.ecmaVersion >= 2015) {
      options.ecmaVersion -= 2009;
    }

    if (options.allowReserved == null)
      { options.allowReserved = options.ecmaVersion < 5; }

    if (!opts || opts.allowHashBang == null)
      { options.allowHashBang = options.ecmaVersion >= 14; }

    if (isArray(options.onToken)) {
      var tokens = options.onToken;
      options.onToken = function (token) { return tokens.push(token); };
    }
    if (isArray(options.onComment))
      { options.onComment = pushComment(options, options.onComment); }

    return options
  }

  function pushComment(options, array) {
    return function(block, text, start, end, startLoc, endLoc) {
      var comment = {
        type: block ? "Block" : "Line",
        value: text,
        start: start,
        end: end
      };
      if (options.locations)
        { comment.loc = new SourceLocation(this, startLoc, endLoc); }
      if (options.ranges)
        { comment.range = [start, end]; }
      array.push(comment);
    }
  }

  // Each scope gets a bitset that may contain these flags
  var
      SCOPE_TOP = 1,
      SCOPE_FUNCTION = 2,
      SCOPE_ASYNC = 4,
      SCOPE_GENERATOR = 8,
      SCOPE_ARROW = 16,
      SCOPE_SIMPLE_CATCH = 32,
      SCOPE_SUPER = 64,
      SCOPE_DIRECT_SUPER = 128,
      SCOPE_CLASS_STATIC_BLOCK = 256,
      SCOPE_VAR = SCOPE_TOP | SCOPE_FUNCTION | SCOPE_CLASS_STATIC_BLOCK;

  function functionFlags(async, generator) {
    return SCOPE_FUNCTION | (async ? SCOPE_ASYNC : 0) | (generator ? SCOPE_GENERATOR : 0)
  }

  // Used in checkLVal* and declareName to determine the type of a binding
  var
      BIND_NONE = 0, // Not a binding
      BIND_VAR = 1, // Var-style binding
      BIND_LEXICAL = 2, // Let- or const-style binding
      BIND_FUNCTION = 3, // Function declaration
      BIND_SIMPLE_CATCH = 4, // Simple (identifier pattern) catch binding
      BIND_OUTSIDE = 5; // Special case for function names as bound inside the function

  var Parser = function Parser(options, input, startPos) {
    this.options = options = getOptions(options);
    this.sourceFile = options.sourceFile;
    this.keywords = wordsRegexp(keywords$1[options.ecmaVersion >= 6 ? 6 : options.sourceType === "module" ? "5module" : 5]);
    var reserved = "";
    if (options.allowReserved !== true) {
      reserved = reservedWords[options.ecmaVersion >= 6 ? 6 : options.ecmaVersion === 5 ? 5 : 3];
      if (options.sourceType === "module") { reserved += " await"; }
    }
    this.reservedWords = wordsRegexp(reserved);
    var reservedStrict = (reserved ? reserved + " " : "") + reservedWords.strict;
    this.reservedWordsStrict = wordsRegexp(reservedStrict);
    this.reservedWordsStrictBind = wordsRegexp(reservedStrict + " " + reservedWords.strictBind);
    this.input = String(input);

    // Used to signal to callers of `readWord1` whether the word
    // contained any escape sequences. This is needed because words with
    // escape sequences must not be interpreted as keywords.
    this.containsEsc = false;

    // Set up token state

    // The current position of the tokenizer in the input.
    if (startPos) {
      this.pos = startPos;
      this.lineStart = this.input.lastIndexOf("\n", startPos - 1) + 1;
      this.curLine = this.input.slice(0, this.lineStart).split(lineBreak).length;
    } else {
      this.pos = this.lineStart = 0;
      this.curLine = 1;
    }

    // Properties of the current token:
    // Its type
    this.type = types$1.eof;
    // For tokens that include more information than their type, the value
    this.value = null;
    // Its start and end offset
    this.start = this.end = this.pos;
    // And, if locations are used, the {line, column} object
    // corresponding to those offsets
    this.startLoc = this.endLoc = this.curPosition();

    // Position information for the previous token
    this.lastTokEndLoc = this.lastTokStartLoc = null;
    this.lastTokStart = this.lastTokEnd = this.pos;

    // The context stack is used to superficially track syntactic
    // context to predict whether a regular expression is allowed in a
    // given position.
    this.context = this.initialContext();
    this.exprAllowed = true;

    // Figure out if it's a module code.
    this.inModule = options.sourceType === "module";
    this.strict = this.inModule || this.strictDirective(this.pos);

    // Used to signify the start of a potential arrow function
    this.potentialArrowAt = -1;
    this.potentialArrowInForAwait = false;

    // Positions to delayed-check that yield/await does not exist in default parameters.
    this.yieldPos = this.awaitPos = this.awaitIdentPos = 0;
    // Labels in scope.
    this.labels = [];
    // Thus-far undefined exports.
    this.undefinedExports = Object.create(null);

    // If enabled, skip leading hashbang line.
    if (this.pos === 0 && options.allowHashBang && this.input.slice(0, 2) === "#!")
      { this.skipLineComment(2); }

    // Scope tracking for duplicate variable names (see scope.js)
    this.scopeStack = [];
    this.enterScope(SCOPE_TOP);

    // For RegExp validation
    this.regexpState = null;

    // The stack of private names.
    // Each element has two properties: 'declared' and 'used'.
    // When it exited from the outermost class definition, all used private names must be declared.
    this.privateNameStack = [];
  };

  var prototypeAccessors = { inFunction: { configurable: true },inGenerator: { configurable: true },inAsync: { configurable: true },canAwait: { configurable: true },allowSuper: { configurable: true },allowDirectSuper: { configurable: true },treatFunctionsAsVar: { configurable: true },allowNewDotTarget: { configurable: true },inClassStaticBlock: { configurable: true } };

  Parser.prototype.parse = function parse () {
    var node = this.options.program || this.startNode();
    this.nextToken();
    return this.parseTopLevel(node)
  };

  prototypeAccessors.inFunction.get = function () { return (this.currentVarScope().flags & SCOPE_FUNCTION) > 0 };

  prototypeAccessors.inGenerator.get = function () { return (this.currentVarScope().flags & SCOPE_GENERATOR) > 0 && !this.currentVarScope().inClassFieldInit };

  prototypeAccessors.inAsync.get = function () { return (this.currentVarScope().flags & SCOPE_ASYNC) > 0 && !this.currentVarScope().inClassFieldInit };

  prototypeAccessors.canAwait.get = function () {
    for (var i = this.scopeStack.length - 1; i >= 0; i--) {
      var scope = this.scopeStack[i];
      if (scope.inClassFieldInit || scope.flags & SCOPE_CLASS_STATIC_BLOCK) { return false }
      if (scope.flags & SCOPE_FUNCTION) { return (scope.flags & SCOPE_ASYNC) > 0 }
    }
    return (this.inModule && this.options.ecmaVersion >= 13) || this.options.allowAwaitOutsideFunction
  };

  prototypeAccessors.allowSuper.get = function () {
    var ref = this.currentThisScope();
      var flags = ref.flags;
      var inClassFieldInit = ref.inClassFieldInit;
    return (flags & SCOPE_SUPER) > 0 || inClassFieldInit || this.options.allowSuperOutsideMethod
  };

  prototypeAccessors.allowDirectSuper.get = function () { return (this.currentThisScope().flags & SCOPE_DIRECT_SUPER) > 0 };

  prototypeAccessors.treatFunctionsAsVar.get = function () { return this.treatFunctionsAsVarInScope(this.currentScope()) };

  prototypeAccessors.allowNewDotTarget.get = function () {
    var ref = this.currentThisScope();
      var flags = ref.flags;
      var inClassFieldInit = ref.inClassFieldInit;
    return (flags & (SCOPE_FUNCTION | SCOPE_CLASS_STATIC_BLOCK)) > 0 || inClassFieldInit
  };

  prototypeAccessors.inClassStaticBlock.get = function () {
    return (this.currentVarScope().flags & SCOPE_CLASS_STATIC_BLOCK) > 0
  };

  Parser.extend = function extend () {
      var plugins = [], len = arguments.length;
      while ( len-- ) plugins[ len ] = arguments[ len ];

    var cls = this;
    for (var i = 0; i < plugins.length; i++) { cls = plugins[i](cls); }
    return cls
  };

  Parser.parse = function parse (input, options) {
    return new this(options, input).parse()
  };

  Parser.parseExpressionAt = function parseExpressionAt (input, pos, options) {
    var parser = new this(options, input, pos);
    parser.nextToken();
    return parser.parseExpression()
  };

  Parser.tokenizer = function tokenizer (input, options) {
    return new this(options, input)
  };

  Object.defineProperties( Parser.prototype, prototypeAccessors );

  var pp$9 = Parser.prototype;

  // ## Parser utilities

  var literal$1 = /^(?:'((?:\\[^]|[^'\\])*?)'|"((?:\\[^]|[^"\\])*?)")/;
  pp$9.strictDirective = function(start) {
    if (this.options.ecmaVersion < 5) { return false }
    for (;;) {
      // Try to find string literal.
      skipWhiteSpace.lastIndex = start;
      start += skipWhiteSpace.exec(this.input)[0].length;
      var match = literal$1.exec(this.input.slice(start));
      if (!match) { return false }
      if ((match[1] || match[2]) === "use strict") {
        skipWhiteSpace.lastIndex = start + match[0].length;
        var spaceAfter = skipWhiteSpace.exec(this.input), end = spaceAfter.index + spaceAfter[0].length;
        var next = this.input.charAt(end);
        return next === ";" || next === "}" ||
          (lineBreak.test(spaceAfter[0]) &&
           !(/[(`.[+\-/*%<>=,?^&]/.test(next) || next === "!" && this.input.charAt(end + 1) === "="))
      }
      start += match[0].length;

      // Skip semicolon, if any.
      skipWhiteSpace.lastIndex = start;
      start += skipWhiteSpace.exec(this.input)[0].length;
      if (this.input[start] === ";")
        { start++; }
    }
  };

  // Predicate that tests whether the next token is of the given
  // type, and if yes, consumes it as a side effect.

  pp$9.eat = function(type) {
    if (this.type === type) {
      this.next();
      return true
    } else {
      return false
    }
  };

  // Tests whether parsed token is a contextual keyword.

  pp$9.isContextual = function(name) {
    return this.type === types$1.name && this.value === name && !this.containsEsc
  };

  // Consumes contextual keyword if possible.

  pp$9.eatContextual = function(name) {
    if (!this.isContextual(name)) { return false }
    this.next();
    return true
  };

  // Asserts that following token is given contextual keyword.

  pp$9.expectContextual = function(name) {
    if (!this.eatContextual(name)) { this.unexpected(); }
  };

  // Test whether a semicolon can be inserted at the current position.

  pp$9.canInsertSemicolon = function() {
    return this.type === types$1.eof ||
      this.type === types$1.braceR ||
      lineBreak.test(this.input.slice(this.lastTokEnd, this.start))
  };

  pp$9.insertSemicolon = function() {
    if (this.canInsertSemicolon()) {
      if (this.options.onInsertedSemicolon)
        { this.options.onInsertedSemicolon(this.lastTokEnd, this.lastTokEndLoc); }
      return true
    }
  };

  // Consume a semicolon, or, failing that, see if we are allowed to
  // pretend that there is a semicolon at this position.

  pp$9.semicolon = function() {
    if (!this.eat(types$1.semi) && !this.insertSemicolon()) { this.unexpected(); }
  };

  pp$9.afterTrailingComma = function(tokType, notNext) {
    if (this.type === tokType) {
      if (this.options.onTrailingComma)
        { this.options.onTrailingComma(this.lastTokStart, this.lastTokStartLoc); }
      if (!notNext)
        { this.next(); }
      return true
    }
  };

  // Expect a token of a given type. If found, consume it, otherwise,
  // raise an unexpected token error.

  pp$9.expect = function(type) {
    this.eat(type) || this.unexpected();
  };

  // Raise an unexpected token error.

  pp$9.unexpected = function(pos) {
    this.raise(pos != null ? pos : this.start, "Unexpected token");
  };

  var DestructuringErrors = function DestructuringErrors() {
    this.shorthandAssign =
    this.trailingComma =
    this.parenthesizedAssign =
    this.parenthesizedBind =
    this.doubleProto =
      -1;
  };

  pp$9.checkPatternErrors = function(refDestructuringErrors, isAssign) {
    if (!refDestructuringErrors) { return }
    if (refDestructuringErrors.trailingComma > -1)
      { this.raiseRecoverable(refDestructuringErrors.trailingComma, "Comma is not permitted after the rest element"); }
    var parens = isAssign ? refDestructuringErrors.parenthesizedAssign : refDestructuringErrors.parenthesizedBind;
    if (parens > -1) { this.raiseRecoverable(parens, isAssign ? "Assigning to rvalue" : "Parenthesized pattern"); }
  };

  pp$9.checkExpressionErrors = function(refDestructuringErrors, andThrow) {
    if (!refDestructuringErrors) { return false }
    var shorthandAssign = refDestructuringErrors.shorthandAssign;
    var doubleProto = refDestructuringErrors.doubleProto;
    if (!andThrow) { return shorthandAssign >= 0 || doubleProto >= 0 }
    if (shorthandAssign >= 0)
      { this.raise(shorthandAssign, "Shorthand property assignments are valid only in destructuring patterns"); }
    if (doubleProto >= 0)
      { this.raiseRecoverable(doubleProto, "Redefinition of __proto__ property"); }
  };

  pp$9.checkYieldAwaitInDefaultParams = function() {
    if (this.yieldPos && (!this.awaitPos || this.yieldPos < this.awaitPos))
      { this.raise(this.yieldPos, "Yield expression cannot be a default value"); }
    if (this.awaitPos)
      { this.raise(this.awaitPos, "Await expression cannot be a default value"); }
  };

  pp$9.isSimpleAssignTarget = function(expr) {
    if (expr.type === "ParenthesizedExpression")
      { return this.isSimpleAssignTarget(expr.expression) }
    return expr.type === "Identifier" || expr.type === "MemberExpression"
  };

  var pp$8 = Parser.prototype;

  // ### Statement parsing

  // Parse a program. Initializes the parser, reads any number of
  // statements, and wraps them in a Program node.  Optionally takes a
  // `program` argument.  If present, the statements will be appended
  // to its body instead of creating a new node.

  pp$8.parseTopLevel = function(node) {
    var exports = Object.create(null);
    if (!node.body) { node.body = []; }
    while (this.type !== types$1.eof) {
      var stmt = this.parseStatement(null, true, exports);
      node.body.push(stmt);
    }
    if (this.inModule)
      { for (var i = 0, list = Object.keys(this.undefinedExports); i < list.length; i += 1)
        {
          var name = list[i];

          this.raiseRecoverable(this.undefinedExports[name].start, ("Export '" + name + "' is not defined"));
        } }
    this.adaptDirectivePrologue(node.body);
    this.next();
    node.sourceType = this.options.sourceType;
    return this.finishNode(node, "Program")
  };

  var loopLabel = {kind: "loop"}, switchLabel = {kind: "switch"};

  pp$8.isLet = function(context) {
    if (this.options.ecmaVersion < 6 || !this.isContextual("let")) { return false }
    skipWhiteSpace.lastIndex = this.pos;
    var skip = skipWhiteSpace.exec(this.input);
    var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
    // For ambiguous cases, determine if a LexicalDeclaration (or only a
    // Statement) is allowed here. If context is not empty then only a Statement
    // is allowed. However, `let [` is an explicit negative lookahead for
    // ExpressionStatement, so special-case it first.
    if (nextCh === 91 || nextCh === 92) { return true } // '[', '\'
    if (context) { return false }

    if (nextCh === 123 || nextCh > 0xd7ff && nextCh < 0xdc00) { return true } // '{', astral
    if (isIdentifierStart(nextCh, true)) {
      var pos = next + 1;
      while (isIdentifierChar(nextCh = this.input.charCodeAt(pos), true)) { ++pos; }
      if (nextCh === 92 || nextCh > 0xd7ff && nextCh < 0xdc00) { return true }
      var ident = this.input.slice(next, pos);
      if (!keywordRelationalOperator.test(ident)) { return true }
    }
    return false
  };

  // check 'async [no LineTerminator here] function'
  // - 'async /*foo*/ function' is OK.
  // - 'async /*\n*/ function' is invalid.
  pp$8.isAsyncFunction = function() {
    if (this.options.ecmaVersion < 8 || !this.isContextual("async"))
      { return false }

    skipWhiteSpace.lastIndex = this.pos;
    var skip = skipWhiteSpace.exec(this.input);
    var next = this.pos + skip[0].length, after;
    return !lineBreak.test(this.input.slice(this.pos, next)) &&
      this.input.slice(next, next + 8) === "function" &&
      (next + 8 === this.input.length ||
       !(isIdentifierChar(after = this.input.charCodeAt(next + 8)) || after > 0xd7ff && after < 0xdc00))
  };

  // Parse a single statement.
  //
  // If expecting a statement and finding a slash operator, parse a
  // regular expression literal. This is to handle cases like
  // `if (foo) /blah/.exec(foo)`, where looking at the previous token
  // does not help.

  pp$8.parseStatement = function(context, topLevel, exports) {
    var starttype = this.type, node = this.startNode(), kind;

    if (this.isLet(context)) {
      starttype = types$1._var;
      kind = "let";
    }

    // Most types of statements are recognized by the keyword they
    // start with. Many are trivial to parse, some require a bit of
    // complexity.

    switch (starttype) {
    case types$1._break: case types$1._continue: return this.parseBreakContinueStatement(node, starttype.keyword)
    case types$1._debugger: return this.parseDebuggerStatement(node)
    case types$1._do: return this.parseDoStatement(node)
    case types$1._for: return this.parseForStatement(node)
    case types$1._function:
      // Function as sole body of either an if statement or a labeled statement
      // works, but not when it is part of a labeled statement that is the sole
      // body of an if statement.
      if ((context && (this.strict || context !== "if" && context !== "label")) && this.options.ecmaVersion >= 6) { this.unexpected(); }
      return this.parseFunctionStatement(node, false, !context)
    case types$1._class:
      if (context) { this.unexpected(); }
      return this.parseClass(node, true)
    case types$1._if: return this.parseIfStatement(node)
    case types$1._return: return this.parseReturnStatement(node)
    case types$1._switch: return this.parseSwitchStatement(node)
    case types$1._throw: return this.parseThrowStatement(node)
    case types$1._try: return this.parseTryStatement(node)
    case types$1._const: case types$1._var:
      kind = kind || this.value;
      if (context && kind !== "var") { this.unexpected(); }
      return this.parseVarStatement(node, kind)
    case types$1._while: return this.parseWhileStatement(node)
    case types$1._with: return this.parseWithStatement(node)
    case types$1.braceL: return this.parseBlock(true, node)
    case types$1.semi: return this.parseEmptyStatement(node)
    case types$1._export:
    case types$1._import:
      if (this.options.ecmaVersion > 10 && starttype === types$1._import) {
        skipWhiteSpace.lastIndex = this.pos;
        var skip = skipWhiteSpace.exec(this.input);
        var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
        if (nextCh === 40 || nextCh === 46) // '(' or '.'
          { return this.parseExpressionStatement(node, this.parseExpression()) }
      }

      if (!this.options.allowImportExportEverywhere) {
        if (!topLevel)
          { this.raise(this.start, "'import' and 'export' may only appear at the top level"); }
        if (!this.inModule)
          { this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'"); }
      }
      return starttype === types$1._import ? this.parseImport(node) : this.parseExport(node, exports)

      // If the statement does not start with a statement keyword or a
      // brace, it's an ExpressionStatement or LabeledStatement. We
      // simply start parsing an expression, and afterwards, if the
      // next token is a colon and the expression was a simple
      // Identifier node, we switch to interpreting it as a label.
    default:
      if (this.isAsyncFunction()) {
        if (context) { this.unexpected(); }
        this.next();
        return this.parseFunctionStatement(node, true, !context)
      }

      var maybeName = this.value, expr = this.parseExpression();
      if (starttype === types$1.name && expr.type === "Identifier" && this.eat(types$1.colon))
        { return this.parseLabeledStatement(node, maybeName, expr, context) }
      else { return this.parseExpressionStatement(node, expr) }
    }
  };

  pp$8.parseBreakContinueStatement = function(node, keyword) {
    var isBreak = keyword === "break";
    this.next();
    if (this.eat(types$1.semi) || this.insertSemicolon()) { node.label = null; }
    else if (this.type !== types$1.name) { this.unexpected(); }
    else {
      node.label = this.parseIdent();
      this.semicolon();
    }

    // Verify that there is an actual destination to break or
    // continue to.
    var i = 0;
    for (; i < this.labels.length; ++i) {
      var lab = this.labels[i];
      if (node.label == null || lab.name === node.label.name) {
        if (lab.kind != null && (isBreak || lab.kind === "loop")) { break }
        if (node.label && isBreak) { break }
      }
    }
    if (i === this.labels.length) { this.raise(node.start, "Unsyntactic " + keyword); }
    return this.finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement")
  };

  pp$8.parseDebuggerStatement = function(node) {
    this.next();
    this.semicolon();
    return this.finishNode(node, "DebuggerStatement")
  };

  pp$8.parseDoStatement = function(node) {
    this.next();
    this.labels.push(loopLabel);
    node.body = this.parseStatement("do");
    this.labels.pop();
    this.expect(types$1._while);
    node.test = this.parseParenExpression();
    if (this.options.ecmaVersion >= 6)
      { this.eat(types$1.semi); }
    else
      { this.semicolon(); }
    return this.finishNode(node, "DoWhileStatement")
  };

  // Disambiguating between a `for` and a `for`/`in` or `for`/`of`
  // loop is non-trivial. Basically, we have to parse the init `var`
  // statement or expression, disallowing the `in` operator (see
  // the second parameter to `parseExpression`), and then check
  // whether the next token is `in` or `of`. When there is no init
  // part (semicolon immediately after the opening parenthesis), it
  // is a regular `for` loop.

  pp$8.parseForStatement = function(node) {
    this.next();
    var awaitAt = (this.options.ecmaVersion >= 9 && this.canAwait && this.eatContextual("await")) ? this.lastTokStart : -1;
    this.labels.push(loopLabel);
    this.enterScope(0);
    this.expect(types$1.parenL);
    if (this.type === types$1.semi) {
      if (awaitAt > -1) { this.unexpected(awaitAt); }
      return this.parseFor(node, null)
    }
    var isLet = this.isLet();
    if (this.type === types$1._var || this.type === types$1._const || isLet) {
      var init$1 = this.startNode(), kind = isLet ? "let" : this.value;
      this.next();
      this.parseVar(init$1, true, kind);
      this.finishNode(init$1, "VariableDeclaration");
      if ((this.type === types$1._in || (this.options.ecmaVersion >= 6 && this.isContextual("of"))) && init$1.declarations.length === 1) {
        if (this.options.ecmaVersion >= 9) {
          if (this.type === types$1._in) {
            if (awaitAt > -1) { this.unexpected(awaitAt); }
          } else { node.await = awaitAt > -1; }
        }
        return this.parseForIn(node, init$1)
      }
      if (awaitAt > -1) { this.unexpected(awaitAt); }
      return this.parseFor(node, init$1)
    }
    var startsWithLet = this.isContextual("let"), isForOf = false;
    var containsEsc = this.containsEsc;
    var refDestructuringErrors = new DestructuringErrors;
    var initPos = this.start;
    var init = awaitAt > -1
      ? this.parseExprSubscripts(refDestructuringErrors, "await")
      : this.parseExpression(true, refDestructuringErrors);
    if (this.type === types$1._in || (isForOf = this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
      if (awaitAt > -1) { // implies `ecmaVersion >= 9` (see declaration of awaitAt)
        if (this.type === types$1._in) { this.unexpected(awaitAt); }
        node.await = true;
      } else if (isForOf && this.options.ecmaVersion >= 8) {
        if (init.start === initPos && !containsEsc && init.type === "Identifier" && init.name === "async") { this.unexpected(); }
        else if (this.options.ecmaVersion >= 9) { node.await = false; }
      }
      if (startsWithLet && isForOf) { this.raise(init.start, "The left-hand side of a for-of loop may not start with 'let'."); }
      this.toAssignable(init, false, refDestructuringErrors);
      this.checkLValPattern(init);
      return this.parseForIn(node, init)
    } else {
      this.checkExpressionErrors(refDestructuringErrors, true);
    }
    if (awaitAt > -1) { this.unexpected(awaitAt); }
    return this.parseFor(node, init)
  };

  pp$8.parseFunctionStatement = function(node, isAsync, declarationPosition) {
    this.next();
    return this.parseFunction(node, FUNC_STATEMENT | (declarationPosition ? 0 : FUNC_HANGING_STATEMENT), false, isAsync)
  };

  pp$8.parseIfStatement = function(node) {
    this.next();
    node.test = this.parseParenExpression();
    // allow function declarations in branches, but only in non-strict mode
    node.consequent = this.parseStatement("if");
    node.alternate = this.eat(types$1._else) ? this.parseStatement("if") : null;
    return this.finishNode(node, "IfStatement")
  };

  pp$8.parseReturnStatement = function(node) {
    if (!this.inFunction && !this.options.allowReturnOutsideFunction)
      { this.raise(this.start, "'return' outside of function"); }
    this.next();

    // In `return` (and `break`/`continue`), the keywords with
    // optional arguments, we eagerly look for a semicolon or the
    // possibility to insert one.

    if (this.eat(types$1.semi) || this.insertSemicolon()) { node.argument = null; }
    else { node.argument = this.parseExpression(); this.semicolon(); }
    return this.finishNode(node, "ReturnStatement")
  };

  pp$8.parseSwitchStatement = function(node) {
    this.next();
    node.discriminant = this.parseParenExpression();
    node.cases = [];
    this.expect(types$1.braceL);
    this.labels.push(switchLabel);
    this.enterScope(0);

    // Statements under must be grouped (by label) in SwitchCase
    // nodes. `cur` is used to keep the node that we are currently
    // adding statements to.

    var cur;
    for (var sawDefault = false; this.type !== types$1.braceR;) {
      if (this.type === types$1._case || this.type === types$1._default) {
        var isCase = this.type === types$1._case;
        if (cur) { this.finishNode(cur, "SwitchCase"); }
        node.cases.push(cur = this.startNode());
        cur.consequent = [];
        this.next();
        if (isCase) {
          cur.test = this.parseExpression();
        } else {
          if (sawDefault) { this.raiseRecoverable(this.lastTokStart, "Multiple default clauses"); }
          sawDefault = true;
          cur.test = null;
        }
        this.expect(types$1.colon);
      } else {
        if (!cur) { this.unexpected(); }
        cur.consequent.push(this.parseStatement(null));
      }
    }
    this.exitScope();
    if (cur) { this.finishNode(cur, "SwitchCase"); }
    this.next(); // Closing brace
    this.labels.pop();
    return this.finishNode(node, "SwitchStatement")
  };

  pp$8.parseThrowStatement = function(node) {
    this.next();
    if (lineBreak.test(this.input.slice(this.lastTokEnd, this.start)))
      { this.raise(this.lastTokEnd, "Illegal newline after throw"); }
    node.argument = this.parseExpression();
    this.semicolon();
    return this.finishNode(node, "ThrowStatement")
  };

  // Reused empty array added for node fields that are always empty.

  var empty$1$1 = [];

  pp$8.parseCatchClauseParam = function() {
    var param = this.parseBindingAtom();
    var simple = param.type === "Identifier";
    this.enterScope(simple ? SCOPE_SIMPLE_CATCH : 0);
    this.checkLValPattern(param, simple ? BIND_SIMPLE_CATCH : BIND_LEXICAL);
    this.expect(types$1.parenR);

    return param
  };

  pp$8.parseTryStatement = function(node) {
    this.next();
    node.block = this.parseBlock();
    node.handler = null;
    if (this.type === types$1._catch) {
      var clause = this.startNode();
      this.next();
      if (this.eat(types$1.parenL)) {
        clause.param = this.parseCatchClauseParam();
      } else {
        if (this.options.ecmaVersion < 10) { this.unexpected(); }
        clause.param = null;
        this.enterScope(0);
      }
      clause.body = this.parseBlock(false);
      this.exitScope();
      node.handler = this.finishNode(clause, "CatchClause");
    }
    node.finalizer = this.eat(types$1._finally) ? this.parseBlock() : null;
    if (!node.handler && !node.finalizer)
      { this.raise(node.start, "Missing catch or finally clause"); }
    return this.finishNode(node, "TryStatement")
  };

  pp$8.parseVarStatement = function(node, kind, allowMissingInitializer) {
    this.next();
    this.parseVar(node, false, kind, allowMissingInitializer);
    this.semicolon();
    return this.finishNode(node, "VariableDeclaration")
  };

  pp$8.parseWhileStatement = function(node) {
    this.next();
    node.test = this.parseParenExpression();
    this.labels.push(loopLabel);
    node.body = this.parseStatement("while");
    this.labels.pop();
    return this.finishNode(node, "WhileStatement")
  };

  pp$8.parseWithStatement = function(node) {
    if (this.strict) { this.raise(this.start, "'with' in strict mode"); }
    this.next();
    node.object = this.parseParenExpression();
    node.body = this.parseStatement("with");
    return this.finishNode(node, "WithStatement")
  };

  pp$8.parseEmptyStatement = function(node) {
    this.next();
    return this.finishNode(node, "EmptyStatement")
  };

  pp$8.parseLabeledStatement = function(node, maybeName, expr, context) {
    for (var i$1 = 0, list = this.labels; i$1 < list.length; i$1 += 1)
      {
      var label = list[i$1];

      if (label.name === maybeName)
        { this.raise(expr.start, "Label '" + maybeName + "' is already declared");
    } }
    var kind = this.type.isLoop ? "loop" : this.type === types$1._switch ? "switch" : null;
    for (var i = this.labels.length - 1; i >= 0; i--) {
      var label$1 = this.labels[i];
      if (label$1.statementStart === node.start) {
        // Update information about previous labels on this node
        label$1.statementStart = this.start;
        label$1.kind = kind;
      } else { break }
    }
    this.labels.push({name: maybeName, kind: kind, statementStart: this.start});
    node.body = this.parseStatement(context ? context.indexOf("label") === -1 ? context + "label" : context : "label");
    this.labels.pop();
    node.label = expr;
    return this.finishNode(node, "LabeledStatement")
  };

  pp$8.parseExpressionStatement = function(node, expr) {
    node.expression = expr;
    this.semicolon();
    return this.finishNode(node, "ExpressionStatement")
  };

  // Parse a semicolon-enclosed block of statements, handling `"use
  // strict"` declarations when `allowStrict` is true (used for
  // function bodies).

  pp$8.parseBlock = function(createNewLexicalScope, node, exitStrict) {
    if ( createNewLexicalScope === void 0 ) createNewLexicalScope = true;
    if ( node === void 0 ) node = this.startNode();

    node.body = [];
    this.expect(types$1.braceL);
    if (createNewLexicalScope) { this.enterScope(0); }
    while (this.type !== types$1.braceR) {
      var stmt = this.parseStatement(null);
      node.body.push(stmt);
    }
    if (exitStrict) { this.strict = false; }
    this.next();
    if (createNewLexicalScope) { this.exitScope(); }
    return this.finishNode(node, "BlockStatement")
  };

  // Parse a regular `for` loop. The disambiguation code in
  // `parseStatement` will already have parsed the init statement or
  // expression.

  pp$8.parseFor = function(node, init) {
    node.init = init;
    this.expect(types$1.semi);
    node.test = this.type === types$1.semi ? null : this.parseExpression();
    this.expect(types$1.semi);
    node.update = this.type === types$1.parenR ? null : this.parseExpression();
    this.expect(types$1.parenR);
    node.body = this.parseStatement("for");
    this.exitScope();
    this.labels.pop();
    return this.finishNode(node, "ForStatement")
  };

  // Parse a `for`/`in` and `for`/`of` loop, which are almost
  // same from parser's perspective.

  pp$8.parseForIn = function(node, init) {
    var isForIn = this.type === types$1._in;
    this.next();

    if (
      init.type === "VariableDeclaration" &&
      init.declarations[0].init != null &&
      (
        !isForIn ||
        this.options.ecmaVersion < 8 ||
        this.strict ||
        init.kind !== "var" ||
        init.declarations[0].id.type !== "Identifier"
      )
    ) {
      this.raise(
        init.start,
        ((isForIn ? "for-in" : "for-of") + " loop variable declaration may not have an initializer")
      );
    }
    node.left = init;
    node.right = isForIn ? this.parseExpression() : this.parseMaybeAssign();
    this.expect(types$1.parenR);
    node.body = this.parseStatement("for");
    this.exitScope();
    this.labels.pop();
    return this.finishNode(node, isForIn ? "ForInStatement" : "ForOfStatement")
  };

  // Parse a list of variable declarations.

  pp$8.parseVar = function(node, isFor, kind, allowMissingInitializer) {
    node.declarations = [];
    node.kind = kind;
    for (;;) {
      var decl = this.startNode();
      this.parseVarId(decl, kind);
      if (this.eat(types$1.eq)) {
        decl.init = this.parseMaybeAssign(isFor);
      } else if (!allowMissingInitializer && kind === "const" && !(this.type === types$1._in || (this.options.ecmaVersion >= 6 && this.isContextual("of")))) {
        this.unexpected();
      } else if (!allowMissingInitializer && decl.id.type !== "Identifier" && !(isFor && (this.type === types$1._in || this.isContextual("of")))) {
        this.raise(this.lastTokEnd, "Complex binding patterns require an initialization value");
      } else {
        decl.init = null;
      }
      node.declarations.push(this.finishNode(decl, "VariableDeclarator"));
      if (!this.eat(types$1.comma)) { break }
    }
    return node
  };

  pp$8.parseVarId = function(decl, kind) {
    decl.id = this.parseBindingAtom();
    this.checkLValPattern(decl.id, kind === "var" ? BIND_VAR : BIND_LEXICAL, false);
  };

  var FUNC_STATEMENT = 1, FUNC_HANGING_STATEMENT = 2, FUNC_NULLABLE_ID = 4;

  // Parse a function declaration or literal (depending on the
  // `statement & FUNC_STATEMENT`).

  // Remove `allowExpressionBody` for 7.0.0, as it is only called with false
  pp$8.parseFunction = function(node, statement, allowExpressionBody, isAsync, forInit) {
    this.initFunction(node);
    if (this.options.ecmaVersion >= 9 || this.options.ecmaVersion >= 6 && !isAsync) {
      if (this.type === types$1.star && (statement & FUNC_HANGING_STATEMENT))
        { this.unexpected(); }
      node.generator = this.eat(types$1.star);
    }
    if (this.options.ecmaVersion >= 8)
      { node.async = !!isAsync; }

    if (statement & FUNC_STATEMENT) {
      node.id = (statement & FUNC_NULLABLE_ID) && this.type !== types$1.name ? null : this.parseIdent();
      if (node.id && !(statement & FUNC_HANGING_STATEMENT))
        // If it is a regular function declaration in sloppy mode, then it is
        // subject to Annex B semantics (BIND_FUNCTION). Otherwise, the binding
        // mode depends on properties of the current scope (see
        // treatFunctionsAsVar).
        { this.checkLValSimple(node.id, (this.strict || node.generator || node.async) ? this.treatFunctionsAsVar ? BIND_VAR : BIND_LEXICAL : BIND_FUNCTION); }
    }

    var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
    this.yieldPos = 0;
    this.awaitPos = 0;
    this.awaitIdentPos = 0;
    this.enterScope(functionFlags(node.async, node.generator));

    if (!(statement & FUNC_STATEMENT))
      { node.id = this.type === types$1.name ? this.parseIdent() : null; }

    this.parseFunctionParams(node);
    this.parseFunctionBody(node, allowExpressionBody, false, forInit);

    this.yieldPos = oldYieldPos;
    this.awaitPos = oldAwaitPos;
    this.awaitIdentPos = oldAwaitIdentPos;
    return this.finishNode(node, (statement & FUNC_STATEMENT) ? "FunctionDeclaration" : "FunctionExpression")
  };

  pp$8.parseFunctionParams = function(node) {
    this.expect(types$1.parenL);
    node.params = this.parseBindingList(types$1.parenR, false, this.options.ecmaVersion >= 8);
    this.checkYieldAwaitInDefaultParams();
  };

  // Parse a class declaration or literal (depending on the
  // `isStatement` parameter).

  pp$8.parseClass = function(node, isStatement) {
    this.next();

    // ecma-262 14.6 Class Definitions
    // A class definition is always strict mode code.
    var oldStrict = this.strict;
    this.strict = true;

    this.parseClassId(node, isStatement);
    this.parseClassSuper(node);
    var privateNameMap = this.enterClassBody();
    var classBody = this.startNode();
    var hadConstructor = false;
    classBody.body = [];
    this.expect(types$1.braceL);
    while (this.type !== types$1.braceR) {
      var element = this.parseClassElement(node.superClass !== null);
      if (element) {
        classBody.body.push(element);
        if (element.type === "MethodDefinition" && element.kind === "constructor") {
          if (hadConstructor) { this.raiseRecoverable(element.start, "Duplicate constructor in the same class"); }
          hadConstructor = true;
        } else if (element.key && element.key.type === "PrivateIdentifier" && isPrivateNameConflicted(privateNameMap, element)) {
          this.raiseRecoverable(element.key.start, ("Identifier '#" + (element.key.name) + "' has already been declared"));
        }
      }
    }
    this.strict = oldStrict;
    this.next();
    node.body = this.finishNode(classBody, "ClassBody");
    this.exitClassBody();
    return this.finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression")
  };

  pp$8.parseClassElement = function(constructorAllowsSuper) {
    if (this.eat(types$1.semi)) { return null }

    var ecmaVersion = this.options.ecmaVersion;
    var node = this.startNode();
    var keyName = "";
    var isGenerator = false;
    var isAsync = false;
    var kind = "method";
    var isStatic = false;

    if (this.eatContextual("static")) {
      // Parse static init block
      if (ecmaVersion >= 13 && this.eat(types$1.braceL)) {
        this.parseClassStaticBlock(node);
        return node
      }
      if (this.isClassElementNameStart() || this.type === types$1.star) {
        isStatic = true;
      } else {
        keyName = "static";
      }
    }
    node.static = isStatic;
    if (!keyName && ecmaVersion >= 8 && this.eatContextual("async")) {
      if ((this.isClassElementNameStart() || this.type === types$1.star) && !this.canInsertSemicolon()) {
        isAsync = true;
      } else {
        keyName = "async";
      }
    }
    if (!keyName && (ecmaVersion >= 9 || !isAsync) && this.eat(types$1.star)) {
      isGenerator = true;
    }
    if (!keyName && !isAsync && !isGenerator) {
      var lastValue = this.value;
      if (this.eatContextual("get") || this.eatContextual("set")) {
        if (this.isClassElementNameStart()) {
          kind = lastValue;
        } else {
          keyName = lastValue;
        }
      }
    }

    // Parse element name
    if (keyName) {
      // 'async', 'get', 'set', or 'static' were not a keyword contextually.
      // The last token is any of those. Make it the element name.
      node.computed = false;
      node.key = this.startNodeAt(this.lastTokStart, this.lastTokStartLoc);
      node.key.name = keyName;
      this.finishNode(node.key, "Identifier");
    } else {
      this.parseClassElementName(node);
    }

    // Parse element value
    if (ecmaVersion < 13 || this.type === types$1.parenL || kind !== "method" || isGenerator || isAsync) {
      var isConstructor = !node.static && checkKeyName(node, "constructor");
      var allowsDirectSuper = isConstructor && constructorAllowsSuper;
      // Couldn't move this check into the 'parseClassMethod' method for backward compatibility.
      if (isConstructor && kind !== "method") { this.raise(node.key.start, "Constructor can't have get/set modifier"); }
      node.kind = isConstructor ? "constructor" : kind;
      this.parseClassMethod(node, isGenerator, isAsync, allowsDirectSuper);
    } else {
      this.parseClassField(node);
    }

    return node
  };

  pp$8.isClassElementNameStart = function() {
    return (
      this.type === types$1.name ||
      this.type === types$1.privateId ||
      this.type === types$1.num ||
      this.type === types$1.string ||
      this.type === types$1.bracketL ||
      this.type.keyword
    )
  };

  pp$8.parseClassElementName = function(element) {
    if (this.type === types$1.privateId) {
      if (this.value === "constructor") {
        this.raise(this.start, "Classes can't have an element named '#constructor'");
      }
      element.computed = false;
      element.key = this.parsePrivateIdent();
    } else {
      this.parsePropertyName(element);
    }
  };

  pp$8.parseClassMethod = function(method, isGenerator, isAsync, allowsDirectSuper) {
    // Check key and flags
    var key = method.key;
    if (method.kind === "constructor") {
      if (isGenerator) { this.raise(key.start, "Constructor can't be a generator"); }
      if (isAsync) { this.raise(key.start, "Constructor can't be an async method"); }
    } else if (method.static && checkKeyName(method, "prototype")) {
      this.raise(key.start, "Classes may not have a static property named prototype");
    }

    // Parse value
    var value = method.value = this.parseMethod(isGenerator, isAsync, allowsDirectSuper);

    // Check value
    if (method.kind === "get" && value.params.length !== 0)
      { this.raiseRecoverable(value.start, "getter should have no params"); }
    if (method.kind === "set" && value.params.length !== 1)
      { this.raiseRecoverable(value.start, "setter should have exactly one param"); }
    if (method.kind === "set" && value.params[0].type === "RestElement")
      { this.raiseRecoverable(value.params[0].start, "Setter cannot use rest params"); }

    return this.finishNode(method, "MethodDefinition")
  };

  pp$8.parseClassField = function(field) {
    if (checkKeyName(field, "constructor")) {
      this.raise(field.key.start, "Classes can't have a field named 'constructor'");
    } else if (field.static && checkKeyName(field, "prototype")) {
      this.raise(field.key.start, "Classes can't have a static field named 'prototype'");
    }

    if (this.eat(types$1.eq)) {
      // To raise SyntaxError if 'arguments' exists in the initializer.
      var scope = this.currentThisScope();
      var inClassFieldInit = scope.inClassFieldInit;
      scope.inClassFieldInit = true;
      field.value = this.parseMaybeAssign();
      scope.inClassFieldInit = inClassFieldInit;
    } else {
      field.value = null;
    }
    this.semicolon();

    return this.finishNode(field, "PropertyDefinition")
  };

  pp$8.parseClassStaticBlock = function(node) {
    node.body = [];

    var oldLabels = this.labels;
    this.labels = [];
    this.enterScope(SCOPE_CLASS_STATIC_BLOCK | SCOPE_SUPER);
    while (this.type !== types$1.braceR) {
      var stmt = this.parseStatement(null);
      node.body.push(stmt);
    }
    this.next();
    this.exitScope();
    this.labels = oldLabels;

    return this.finishNode(node, "StaticBlock")
  };

  pp$8.parseClassId = function(node, isStatement) {
    if (this.type === types$1.name) {
      node.id = this.parseIdent();
      if (isStatement)
        { this.checkLValSimple(node.id, BIND_LEXICAL, false); }
    } else {
      if (isStatement === true)
        { this.unexpected(); }
      node.id = null;
    }
  };

  pp$8.parseClassSuper = function(node) {
    node.superClass = this.eat(types$1._extends) ? this.parseExprSubscripts(null, false) : null;
  };

  pp$8.enterClassBody = function() {
    var element = {declared: Object.create(null), used: []};
    this.privateNameStack.push(element);
    return element.declared
  };

  pp$8.exitClassBody = function() {
    var ref = this.privateNameStack.pop();
    var declared = ref.declared;
    var used = ref.used;
    if (!this.options.checkPrivateFields) { return }
    var len = this.privateNameStack.length;
    var parent = len === 0 ? null : this.privateNameStack[len - 1];
    for (var i = 0; i < used.length; ++i) {
      var id = used[i];
      if (!hasOwn(declared, id.name)) {
        if (parent) {
          parent.used.push(id);
        } else {
          this.raiseRecoverable(id.start, ("Private field '#" + (id.name) + "' must be declared in an enclosing class"));
        }
      }
    }
  };

  function isPrivateNameConflicted(privateNameMap, element) {
    var name = element.key.name;
    var curr = privateNameMap[name];

    var next = "true";
    if (element.type === "MethodDefinition" && (element.kind === "get" || element.kind === "set")) {
      next = (element.static ? "s" : "i") + element.kind;
    }

    // `class { get #a(){}; static set #a(_){} }` is also conflict.
    if (
      curr === "iget" && next === "iset" ||
      curr === "iset" && next === "iget" ||
      curr === "sget" && next === "sset" ||
      curr === "sset" && next === "sget"
    ) {
      privateNameMap[name] = "true";
      return false
    } else if (!curr) {
      privateNameMap[name] = next;
      return false
    } else {
      return true
    }
  }

  function checkKeyName(node, name) {
    var computed = node.computed;
    var key = node.key;
    return !computed && (
      key.type === "Identifier" && key.name === name ||
      key.type === "Literal" && key.value === name
    )
  }

  // Parses module export declaration.

  pp$8.parseExportAllDeclaration = function(node, exports) {
    if (this.options.ecmaVersion >= 11) {
      if (this.eatContextual("as")) {
        node.exported = this.parseModuleExportName();
        this.checkExport(exports, node.exported, this.lastTokStart);
      } else {
        node.exported = null;
      }
    }
    this.expectContextual("from");
    if (this.type !== types$1.string) { this.unexpected(); }
    node.source = this.parseExprAtom();
    if (this.options.ecmaVersion >= 16)
      { node.attributes = this.parseWithClause(); }
    this.semicolon();
    return this.finishNode(node, "ExportAllDeclaration")
  };

  pp$8.parseExport = function(node, exports) {
    this.next();
    // export * from '...'
    if (this.eat(types$1.star)) {
      return this.parseExportAllDeclaration(node, exports)
    }
    if (this.eat(types$1._default)) { // export default ...
      this.checkExport(exports, "default", this.lastTokStart);
      node.declaration = this.parseExportDefaultDeclaration();
      return this.finishNode(node, "ExportDefaultDeclaration")
    }
    // export var|const|let|function|class ...
    if (this.shouldParseExportStatement()) {
      node.declaration = this.parseExportDeclaration(node);
      if (node.declaration.type === "VariableDeclaration")
        { this.checkVariableExport(exports, node.declaration.declarations); }
      else
        { this.checkExport(exports, node.declaration.id, node.declaration.id.start); }
      node.specifiers = [];
      node.source = null;
    } else { // export { x, y as z } [from '...']
      node.declaration = null;
      node.specifiers = this.parseExportSpecifiers(exports);
      if (this.eatContextual("from")) {
        if (this.type !== types$1.string) { this.unexpected(); }
        node.source = this.parseExprAtom();
        if (this.options.ecmaVersion >= 16)
          { node.attributes = this.parseWithClause(); }
      } else {
        for (var i = 0, list = node.specifiers; i < list.length; i += 1) {
          // check for keywords used as local names
          var spec = list[i];

          this.checkUnreserved(spec.local);
          // check if export is defined
          this.checkLocalExport(spec.local);

          if (spec.local.type === "Literal") {
            this.raise(spec.local.start, "A string literal cannot be used as an exported binding without `from`.");
          }
        }

        node.source = null;
      }
      this.semicolon();
    }
    return this.finishNode(node, "ExportNamedDeclaration")
  };

  pp$8.parseExportDeclaration = function(node) {
    return this.parseStatement(null)
  };

  pp$8.parseExportDefaultDeclaration = function() {
    var isAsync;
    if (this.type === types$1._function || (isAsync = this.isAsyncFunction())) {
      var fNode = this.startNode();
      this.next();
      if (isAsync) { this.next(); }
      return this.parseFunction(fNode, FUNC_STATEMENT | FUNC_NULLABLE_ID, false, isAsync)
    } else if (this.type === types$1._class) {
      var cNode = this.startNode();
      return this.parseClass(cNode, "nullableID")
    } else {
      var declaration = this.parseMaybeAssign();
      this.semicolon();
      return declaration
    }
  };

  pp$8.checkExport = function(exports, name, pos) {
    if (!exports) { return }
    if (typeof name !== "string")
      { name = name.type === "Identifier" ? name.name : name.value; }
    if (hasOwn(exports, name))
      { this.raiseRecoverable(pos, "Duplicate export '" + name + "'"); }
    exports[name] = true;
  };

  pp$8.checkPatternExport = function(exports, pat) {
    var type = pat.type;
    if (type === "Identifier")
      { this.checkExport(exports, pat, pat.start); }
    else if (type === "ObjectPattern")
      { for (var i = 0, list = pat.properties; i < list.length; i += 1)
        {
          var prop = list[i];

          this.checkPatternExport(exports, prop);
        } }
    else if (type === "ArrayPattern")
      { for (var i$1 = 0, list$1 = pat.elements; i$1 < list$1.length; i$1 += 1) {
        var elt = list$1[i$1];

          if (elt) { this.checkPatternExport(exports, elt); }
      } }
    else if (type === "Property")
      { this.checkPatternExport(exports, pat.value); }
    else if (type === "AssignmentPattern")
      { this.checkPatternExport(exports, pat.left); }
    else if (type === "RestElement")
      { this.checkPatternExport(exports, pat.argument); }
  };

  pp$8.checkVariableExport = function(exports, decls) {
    if (!exports) { return }
    for (var i = 0, list = decls; i < list.length; i += 1)
      {
      var decl = list[i];

      this.checkPatternExport(exports, decl.id);
    }
  };

  pp$8.shouldParseExportStatement = function() {
    return this.type.keyword === "var" ||
      this.type.keyword === "const" ||
      this.type.keyword === "class" ||
      this.type.keyword === "function" ||
      this.isLet() ||
      this.isAsyncFunction()
  };

  // Parses a comma-separated list of module exports.

  pp$8.parseExportSpecifier = function(exports) {
    var node = this.startNode();
    node.local = this.parseModuleExportName();

    node.exported = this.eatContextual("as") ? this.parseModuleExportName() : node.local;
    this.checkExport(
      exports,
      node.exported,
      node.exported.start
    );

    return this.finishNode(node, "ExportSpecifier")
  };

  pp$8.parseExportSpecifiers = function(exports) {
    var nodes = [], first = true;
    // export { x, y as z } [from '...']
    this.expect(types$1.braceL);
    while (!this.eat(types$1.braceR)) {
      if (!first) {
        this.expect(types$1.comma);
        if (this.afterTrailingComma(types$1.braceR)) { break }
      } else { first = false; }

      nodes.push(this.parseExportSpecifier(exports));
    }
    return nodes
  };

  // Parses import declaration.

  pp$8.parseImport = function(node) {
    this.next();

    // import '...'
    if (this.type === types$1.string) {
      node.specifiers = empty$1$1;
      node.source = this.parseExprAtom();
    } else {
      node.specifiers = this.parseImportSpecifiers();
      this.expectContextual("from");
      node.source = this.type === types$1.string ? this.parseExprAtom() : this.unexpected();
    }
    if (this.options.ecmaVersion >= 16)
      { node.attributes = this.parseWithClause(); }
    this.semicolon();
    return this.finishNode(node, "ImportDeclaration")
  };

  // Parses a comma-separated list of module imports.

  pp$8.parseImportSpecifier = function() {
    var node = this.startNode();
    node.imported = this.parseModuleExportName();

    if (this.eatContextual("as")) {
      node.local = this.parseIdent();
    } else {
      this.checkUnreserved(node.imported);
      node.local = node.imported;
    }
    this.checkLValSimple(node.local, BIND_LEXICAL);

    return this.finishNode(node, "ImportSpecifier")
  };

  pp$8.parseImportDefaultSpecifier = function() {
    // import defaultObj, { x, y as z } from '...'
    var node = this.startNode();
    node.local = this.parseIdent();
    this.checkLValSimple(node.local, BIND_LEXICAL);
    return this.finishNode(node, "ImportDefaultSpecifier")
  };

  pp$8.parseImportNamespaceSpecifier = function() {
    var node = this.startNode();
    this.next();
    this.expectContextual("as");
    node.local = this.parseIdent();
    this.checkLValSimple(node.local, BIND_LEXICAL);
    return this.finishNode(node, "ImportNamespaceSpecifier")
  };

  pp$8.parseImportSpecifiers = function() {
    var nodes = [], first = true;
    if (this.type === types$1.name) {
      nodes.push(this.parseImportDefaultSpecifier());
      if (!this.eat(types$1.comma)) { return nodes }
    }
    if (this.type === types$1.star) {
      nodes.push(this.parseImportNamespaceSpecifier());
      return nodes
    }
    this.expect(types$1.braceL);
    while (!this.eat(types$1.braceR)) {
      if (!first) {
        this.expect(types$1.comma);
        if (this.afterTrailingComma(types$1.braceR)) { break }
      } else { first = false; }

      nodes.push(this.parseImportSpecifier());
    }
    return nodes
  };

  pp$8.parseWithClause = function() {
    var nodes = [];
    if (!this.eat(types$1._with)) {
      return nodes
    }
    this.expect(types$1.braceL);
    var attributeKeys = {};
    var first = true;
    while (!this.eat(types$1.braceR)) {
      if (!first) {
        this.expect(types$1.comma);
        if (this.afterTrailingComma(types$1.braceR)) { break }
      } else { first = false; }

      var attr = this.parseImportAttribute();
      var keyName = attr.key.type === "Identifier" ? attr.key.name : attr.key.value;
      if (hasOwn(attributeKeys, keyName))
        { this.raiseRecoverable(attr.key.start, "Duplicate attribute key '" + keyName + "'"); }
      attributeKeys[keyName] = true;
      nodes.push(attr);
    }
    return nodes
  };

  pp$8.parseImportAttribute = function() {
    var node = this.startNode();
    node.key = this.type === types$1.string ? this.parseExprAtom() : this.parseIdent(this.options.allowReserved !== "never");
    this.expect(types$1.colon);
    if (this.type !== types$1.string) {
      this.unexpected();
    }
    node.value = this.parseExprAtom();
    return this.finishNode(node, "ImportAttribute")
  };

  pp$8.parseModuleExportName = function() {
    if (this.options.ecmaVersion >= 13 && this.type === types$1.string) {
      var stringLiteral = this.parseLiteral(this.value);
      if (loneSurrogate.test(stringLiteral.value)) {
        this.raise(stringLiteral.start, "An export name cannot include a lone surrogate.");
      }
      return stringLiteral
    }
    return this.parseIdent(true)
  };

  // Set `ExpressionStatement#directive` property for directive prologues.
  pp$8.adaptDirectivePrologue = function(statements) {
    for (var i = 0; i < statements.length && this.isDirectiveCandidate(statements[i]); ++i) {
      statements[i].directive = statements[i].expression.raw.slice(1, -1);
    }
  };
  pp$8.isDirectiveCandidate = function(statement) {
    return (
      this.options.ecmaVersion >= 5 &&
      statement.type === "ExpressionStatement" &&
      statement.expression.type === "Literal" &&
      typeof statement.expression.value === "string" &&
      // Reject parenthesized strings.
      (this.input[statement.start] === "\"" || this.input[statement.start] === "'")
    )
  };

  var pp$7 = Parser.prototype;

  // Convert existing expression atom to assignable pattern
  // if possible.

  pp$7.toAssignable = function(node, isBinding, refDestructuringErrors) {
    if (this.options.ecmaVersion >= 6 && node) {
      switch (node.type) {
      case "Identifier":
        if (this.inAsync && node.name === "await")
          { this.raise(node.start, "Cannot use 'await' as identifier inside an async function"); }
        break

      case "ObjectPattern":
      case "ArrayPattern":
      case "AssignmentPattern":
      case "RestElement":
        break

      case "ObjectExpression":
        node.type = "ObjectPattern";
        if (refDestructuringErrors) { this.checkPatternErrors(refDestructuringErrors, true); }
        for (var i = 0, list = node.properties; i < list.length; i += 1) {
          var prop = list[i];

        this.toAssignable(prop, isBinding);
          // Early error:
          //   AssignmentRestProperty[Yield, Await] :
          //     `...` DestructuringAssignmentTarget[Yield, Await]
          //
          //   It is a Syntax Error if |DestructuringAssignmentTarget| is an |ArrayLiteral| or an |ObjectLiteral|.
          if (
            prop.type === "RestElement" &&
            (prop.argument.type === "ArrayPattern" || prop.argument.type === "ObjectPattern")
          ) {
            this.raise(prop.argument.start, "Unexpected token");
          }
        }
        break

      case "Property":
        // AssignmentProperty has type === "Property"
        if (node.kind !== "init") { this.raise(node.key.start, "Object pattern can't contain getter or setter"); }
        this.toAssignable(node.value, isBinding);
        break

      case "ArrayExpression":
        node.type = "ArrayPattern";
        if (refDestructuringErrors) { this.checkPatternErrors(refDestructuringErrors, true); }
        this.toAssignableList(node.elements, isBinding);
        break

      case "SpreadElement":
        node.type = "RestElement";
        this.toAssignable(node.argument, isBinding);
        if (node.argument.type === "AssignmentPattern")
          { this.raise(node.argument.start, "Rest elements cannot have a default value"); }
        break

      case "AssignmentExpression":
        if (node.operator !== "=") { this.raise(node.left.end, "Only '=' operator can be used for specifying default value."); }
        node.type = "AssignmentPattern";
        delete node.operator;
        this.toAssignable(node.left, isBinding);
        break

      case "ParenthesizedExpression":
        this.toAssignable(node.expression, isBinding, refDestructuringErrors);
        break

      case "ChainExpression":
        this.raiseRecoverable(node.start, "Optional chaining cannot appear in left-hand side");
        break

      case "MemberExpression":
        if (!isBinding) { break }

      default:
        this.raise(node.start, "Assigning to rvalue");
      }
    } else if (refDestructuringErrors) { this.checkPatternErrors(refDestructuringErrors, true); }
    return node
  };

  // Convert list of expression atoms to binding list.

  pp$7.toAssignableList = function(exprList, isBinding) {
    var end = exprList.length;
    for (var i = 0; i < end; i++) {
      var elt = exprList[i];
      if (elt) { this.toAssignable(elt, isBinding); }
    }
    if (end) {
      var last = exprList[end - 1];
      if (this.options.ecmaVersion === 6 && isBinding && last && last.type === "RestElement" && last.argument.type !== "Identifier")
        { this.unexpected(last.argument.start); }
    }
    return exprList
  };

  // Parses spread element.

  pp$7.parseSpread = function(refDestructuringErrors) {
    var node = this.startNode();
    this.next();
    node.argument = this.parseMaybeAssign(false, refDestructuringErrors);
    return this.finishNode(node, "SpreadElement")
  };

  pp$7.parseRestBinding = function() {
    var node = this.startNode();
    this.next();

    // RestElement inside of a function parameter must be an identifier
    if (this.options.ecmaVersion === 6 && this.type !== types$1.name)
      { this.unexpected(); }

    node.argument = this.parseBindingAtom();

    return this.finishNode(node, "RestElement")
  };

  // Parses lvalue (assignable) atom.

  pp$7.parseBindingAtom = function() {
    if (this.options.ecmaVersion >= 6) {
      switch (this.type) {
      case types$1.bracketL:
        var node = this.startNode();
        this.next();
        node.elements = this.parseBindingList(types$1.bracketR, true, true);
        return this.finishNode(node, "ArrayPattern")

      case types$1.braceL:
        return this.parseObj(true)
      }
    }
    return this.parseIdent()
  };

  pp$7.parseBindingList = function(close, allowEmpty, allowTrailingComma, allowModifiers) {
    var elts = [], first = true;
    while (!this.eat(close)) {
      if (first) { first = false; }
      else { this.expect(types$1.comma); }
      if (allowEmpty && this.type === types$1.comma) {
        elts.push(null);
      } else if (allowTrailingComma && this.afterTrailingComma(close)) {
        break
      } else if (this.type === types$1.ellipsis) {
        var rest = this.parseRestBinding();
        this.parseBindingListItem(rest);
        elts.push(rest);
        if (this.type === types$1.comma) { this.raiseRecoverable(this.start, "Comma is not permitted after the rest element"); }
        this.expect(close);
        break
      } else {
        elts.push(this.parseAssignableListItem(allowModifiers));
      }
    }
    return elts
  };

  pp$7.parseAssignableListItem = function(allowModifiers) {
    var elem = this.parseMaybeDefault(this.start, this.startLoc);
    this.parseBindingListItem(elem);
    return elem
  };

  pp$7.parseBindingListItem = function(param) {
    return param
  };

  // Parses assignment pattern around given atom if possible.

  pp$7.parseMaybeDefault = function(startPos, startLoc, left) {
    left = left || this.parseBindingAtom();
    if (this.options.ecmaVersion < 6 || !this.eat(types$1.eq)) { return left }
    var node = this.startNodeAt(startPos, startLoc);
    node.left = left;
    node.right = this.parseMaybeAssign();
    return this.finishNode(node, "AssignmentPattern")
  };

  // The following three functions all verify that a node is an lvalue —
  // something that can be bound, or assigned to. In order to do so, they perform
  // a variety of checks:
  //
  // - Check that none of the bound/assigned-to identifiers are reserved words.
  // - Record name declarations for bindings in the appropriate scope.
  // - Check duplicate argument names, if checkClashes is set.
  //
  // If a complex binding pattern is encountered (e.g., object and array
  // destructuring), the entire pattern is recursively checked.
  //
  // There are three versions of checkLVal*() appropriate for different
  // circumstances:
  //
  // - checkLValSimple() shall be used if the syntactic construct supports
  //   nothing other than identifiers and member expressions. Parenthesized
  //   expressions are also correctly handled. This is generally appropriate for
  //   constructs for which the spec says
  //
  //   > It is a Syntax Error if AssignmentTargetType of [the production] is not
  //   > simple.
  //
  //   It is also appropriate for checking if an identifier is valid and not
  //   defined elsewhere, like import declarations or function/class identifiers.
  //
  //   Examples where this is used include:
  //     a += …;
  //     import a from '…';
  //   where a is the node to be checked.
  //
  // - checkLValPattern() shall be used if the syntactic construct supports
  //   anything checkLValSimple() supports, as well as object and array
  //   destructuring patterns. This is generally appropriate for constructs for
  //   which the spec says
  //
  //   > It is a Syntax Error if [the production] is neither an ObjectLiteral nor
  //   > an ArrayLiteral and AssignmentTargetType of [the production] is not
  //   > simple.
  //
  //   Examples where this is used include:
  //     (a = …);
  //     const a = …;
  //     try { … } catch (a) { … }
  //   where a is the node to be checked.
  //
  // - checkLValInnerPattern() shall be used if the syntactic construct supports
  //   anything checkLValPattern() supports, as well as default assignment
  //   patterns, rest elements, and other constructs that may appear within an
  //   object or array destructuring pattern.
  //
  //   As a special case, function parameters also use checkLValInnerPattern(),
  //   as they also support defaults and rest constructs.
  //
  // These functions deliberately support both assignment and binding constructs,
  // as the logic for both is exceedingly similar. If the node is the target of
  // an assignment, then bindingType should be set to BIND_NONE. Otherwise, it
  // should be set to the appropriate BIND_* constant, like BIND_VAR or
  // BIND_LEXICAL.
  //
  // If the function is called with a non-BIND_NONE bindingType, then
  // additionally a checkClashes object may be specified to allow checking for
  // duplicate argument names. checkClashes is ignored if the provided construct
  // is an assignment (i.e., bindingType is BIND_NONE).

  pp$7.checkLValSimple = function(expr, bindingType, checkClashes) {
    if ( bindingType === void 0 ) bindingType = BIND_NONE;

    var isBind = bindingType !== BIND_NONE;

    switch (expr.type) {
    case "Identifier":
      if (this.strict && this.reservedWordsStrictBind.test(expr.name))
        { this.raiseRecoverable(expr.start, (isBind ? "Binding " : "Assigning to ") + expr.name + " in strict mode"); }
      if (isBind) {
        if (bindingType === BIND_LEXICAL && expr.name === "let")
          { this.raiseRecoverable(expr.start, "let is disallowed as a lexically bound name"); }
        if (checkClashes) {
          if (hasOwn(checkClashes, expr.name))
            { this.raiseRecoverable(expr.start, "Argument name clash"); }
          checkClashes[expr.name] = true;
        }
        if (bindingType !== BIND_OUTSIDE) { this.declareName(expr.name, bindingType, expr.start); }
      }
      break

    case "ChainExpression":
      this.raiseRecoverable(expr.start, "Optional chaining cannot appear in left-hand side");
      break

    case "MemberExpression":
      if (isBind) { this.raiseRecoverable(expr.start, "Binding member expression"); }
      break

    case "ParenthesizedExpression":
      if (isBind) { this.raiseRecoverable(expr.start, "Binding parenthesized expression"); }
      return this.checkLValSimple(expr.expression, bindingType, checkClashes)

    default:
      this.raise(expr.start, (isBind ? "Binding" : "Assigning to") + " rvalue");
    }
  };

  pp$7.checkLValPattern = function(expr, bindingType, checkClashes) {
    if ( bindingType === void 0 ) bindingType = BIND_NONE;

    switch (expr.type) {
    case "ObjectPattern":
      for (var i = 0, list = expr.properties; i < list.length; i += 1) {
        var prop = list[i];

      this.checkLValInnerPattern(prop, bindingType, checkClashes);
      }
      break

    case "ArrayPattern":
      for (var i$1 = 0, list$1 = expr.elements; i$1 < list$1.length; i$1 += 1) {
        var elem = list$1[i$1];

      if (elem) { this.checkLValInnerPattern(elem, bindingType, checkClashes); }
      }
      break

    default:
      this.checkLValSimple(expr, bindingType, checkClashes);
    }
  };

  pp$7.checkLValInnerPattern = function(expr, bindingType, checkClashes) {
    if ( bindingType === void 0 ) bindingType = BIND_NONE;

    switch (expr.type) {
    case "Property":
      // AssignmentProperty has type === "Property"
      this.checkLValInnerPattern(expr.value, bindingType, checkClashes);
      break

    case "AssignmentPattern":
      this.checkLValPattern(expr.left, bindingType, checkClashes);
      break

    case "RestElement":
      this.checkLValPattern(expr.argument, bindingType, checkClashes);
      break

    default:
      this.checkLValPattern(expr, bindingType, checkClashes);
    }
  };

  // The algorithm used to determine whether a regexp can appear at a
  // given point in the program is loosely based on sweet.js' approach.
  // See https://github.com/mozilla/sweet.js/wiki/design


  var TokContext = function TokContext(token, isExpr, preserveSpace, override, generator) {
    this.token = token;
    this.isExpr = !!isExpr;
    this.preserveSpace = !!preserveSpace;
    this.override = override;
    this.generator = !!generator;
  };

  var types$2 = {
    b_stat: new TokContext("{", false),
    b_expr: new TokContext("{", true),
    b_tmpl: new TokContext("${", false),
    p_stat: new TokContext("(", false),
    p_expr: new TokContext("(", true),
    q_tmpl: new TokContext("`", true, true, function (p) { return p.tryReadTemplateToken(); }),
    f_stat: new TokContext("function", false),
    f_expr: new TokContext("function", true),
    f_expr_gen: new TokContext("function", true, false, null, true),
    f_gen: new TokContext("function", false, false, null, true)
  };

  var pp$6 = Parser.prototype;

  pp$6.initialContext = function() {
    return [types$2.b_stat]
  };

  pp$6.curContext = function() {
    return this.context[this.context.length - 1]
  };

  pp$6.braceIsBlock = function(prevType) {
    var parent = this.curContext();
    if (parent === types$2.f_expr || parent === types$2.f_stat)
      { return true }
    if (prevType === types$1.colon && (parent === types$2.b_stat || parent === types$2.b_expr))
      { return !parent.isExpr }

    // The check for `tt.name && exprAllowed` detects whether we are
    // after a `yield` or `of` construct. See the `updateContext` for
    // `tt.name`.
    if (prevType === types$1._return || prevType === types$1.name && this.exprAllowed)
      { return lineBreak.test(this.input.slice(this.lastTokEnd, this.start)) }
    if (prevType === types$1._else || prevType === types$1.semi || prevType === types$1.eof || prevType === types$1.parenR || prevType === types$1.arrow)
      { return true }
    if (prevType === types$1.braceL)
      { return parent === types$2.b_stat }
    if (prevType === types$1._var || prevType === types$1._const || prevType === types$1.name)
      { return false }
    return !this.exprAllowed
  };

  pp$6.inGeneratorContext = function() {
    for (var i = this.context.length - 1; i >= 1; i--) {
      var context = this.context[i];
      if (context.token === "function")
        { return context.generator }
    }
    return false
  };

  pp$6.updateContext = function(prevType) {
    var update, type = this.type;
    if (type.keyword && prevType === types$1.dot)
      { this.exprAllowed = false; }
    else if (update = type.updateContext)
      { update.call(this, prevType); }
    else
      { this.exprAllowed = type.beforeExpr; }
  };

  // Used to handle edge cases when token context could not be inferred correctly during tokenization phase

  pp$6.overrideContext = function(tokenCtx) {
    if (this.curContext() !== tokenCtx) {
      this.context[this.context.length - 1] = tokenCtx;
    }
  };

  // Token-specific context update code

  types$1.parenR.updateContext = types$1.braceR.updateContext = function() {
    if (this.context.length === 1) {
      this.exprAllowed = true;
      return
    }
    var out = this.context.pop();
    if (out === types$2.b_stat && this.curContext().token === "function") {
      out = this.context.pop();
    }
    this.exprAllowed = !out.isExpr;
  };

  types$1.braceL.updateContext = function(prevType) {
    this.context.push(this.braceIsBlock(prevType) ? types$2.b_stat : types$2.b_expr);
    this.exprAllowed = true;
  };

  types$1.dollarBraceL.updateContext = function() {
    this.context.push(types$2.b_tmpl);
    this.exprAllowed = true;
  };

  types$1.parenL.updateContext = function(prevType) {
    var statementParens = prevType === types$1._if || prevType === types$1._for || prevType === types$1._with || prevType === types$1._while;
    this.context.push(statementParens ? types$2.p_stat : types$2.p_expr);
    this.exprAllowed = true;
  };

  types$1.incDec.updateContext = function() {
    // tokExprAllowed stays unchanged
  };

  types$1._function.updateContext = types$1._class.updateContext = function(prevType) {
    if (prevType.beforeExpr && prevType !== types$1._else &&
        !(prevType === types$1.semi && this.curContext() !== types$2.p_stat) &&
        !(prevType === types$1._return && lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) &&
        !((prevType === types$1.colon || prevType === types$1.braceL) && this.curContext() === types$2.b_stat))
      { this.context.push(types$2.f_expr); }
    else
      { this.context.push(types$2.f_stat); }
    this.exprAllowed = false;
  };

  types$1.colon.updateContext = function() {
    if (this.curContext().token === "function") { this.context.pop(); }
    this.exprAllowed = true;
  };

  types$1.backQuote.updateContext = function() {
    if (this.curContext() === types$2.q_tmpl)
      { this.context.pop(); }
    else
      { this.context.push(types$2.q_tmpl); }
    this.exprAllowed = false;
  };

  types$1.star.updateContext = function(prevType) {
    if (prevType === types$1._function) {
      var index = this.context.length - 1;
      if (this.context[index] === types$2.f_expr)
        { this.context[index] = types$2.f_expr_gen; }
      else
        { this.context[index] = types$2.f_gen; }
    }
    this.exprAllowed = true;
  };

  types$1.name.updateContext = function(prevType) {
    var allowed = false;
    if (this.options.ecmaVersion >= 6 && prevType !== types$1.dot) {
      if (this.value === "of" && !this.exprAllowed ||
          this.value === "yield" && this.inGeneratorContext())
        { allowed = true; }
    }
    this.exprAllowed = allowed;
  };

  // A recursive descent parser operates by defining functions for all
  // syntactic elements, and recursively calling those, each function
  // advancing the input stream and returning an AST node. Precedence
  // of constructs (for example, the fact that `!x[1]` means `!(x[1])`
  // instead of `(!x)[1]` is handled by the fact that the parser
  // function that parses unary prefix operators is called first, and
  // in turn calls the function that parses `[]` subscripts — that
  // way, it'll receive the node for `x[1]` already parsed, and wraps
  // *that* in the unary operator node.
  //
  // Acorn uses an [operator precedence parser][opp] to handle binary
  // operator precedence, because it is much more compact than using
  // the technique outlined above, which uses different, nesting
  // functions to specify precedence, for all of the ten binary
  // precedence levels that JavaScript defines.
  //
  // [opp]: http://en.wikipedia.org/wiki/Operator-precedence_parser


  var pp$5 = Parser.prototype;

  // Check if property name clashes with already added.
  // Object/class getters and setters are not allowed to clash —
  // either with each other or with an init property — and in
  // strict mode, init properties are also not allowed to be repeated.

  pp$5.checkPropClash = function(prop, propHash, refDestructuringErrors) {
    if (this.options.ecmaVersion >= 9 && prop.type === "SpreadElement")
      { return }
    if (this.options.ecmaVersion >= 6 && (prop.computed || prop.method || prop.shorthand))
      { return }
    var key = prop.key;
    var name;
    switch (key.type) {
    case "Identifier": name = key.name; break
    case "Literal": name = String(key.value); break
    default: return
    }
    var kind = prop.kind;
    if (this.options.ecmaVersion >= 6) {
      if (name === "__proto__" && kind === "init") {
        if (propHash.proto) {
          if (refDestructuringErrors) {
            if (refDestructuringErrors.doubleProto < 0) {
              refDestructuringErrors.doubleProto = key.start;
            }
          } else {
            this.raiseRecoverable(key.start, "Redefinition of __proto__ property");
          }
        }
        propHash.proto = true;
      }
      return
    }
    name = "$" + name;
    var other = propHash[name];
    if (other) {
      var redefinition;
      if (kind === "init") {
        redefinition = this.strict && other.init || other.get || other.set;
      } else {
        redefinition = other.init || other[kind];
      }
      if (redefinition)
        { this.raiseRecoverable(key.start, "Redefinition of property"); }
    } else {
      other = propHash[name] = {
        init: false,
        get: false,
        set: false
      };
    }
    other[kind] = true;
  };

  // ### Expression parsing

  // These nest, from the most general expression type at the top to
  // 'atomic', nondivisible expression types at the bottom. Most of
  // the functions will simply let the function(s) below them parse,
  // and, *if* the syntactic construct they handle is present, wrap
  // the AST node that the inner parser gave them in another node.

  // Parse a full expression. The optional arguments are used to
  // forbid the `in` operator (in for loops initalization expressions)
  // and provide reference for storing '=' operator inside shorthand
  // property assignment in contexts where both object expression
  // and object pattern might appear (so it's possible to raise
  // delayed syntax error at correct position).

  pp$5.parseExpression = function(forInit, refDestructuringErrors) {
    var startPos = this.start, startLoc = this.startLoc;
    var expr = this.parseMaybeAssign(forInit, refDestructuringErrors);
    if (this.type === types$1.comma) {
      var node = this.startNodeAt(startPos, startLoc);
      node.expressions = [expr];
      while (this.eat(types$1.comma)) { node.expressions.push(this.parseMaybeAssign(forInit, refDestructuringErrors)); }
      return this.finishNode(node, "SequenceExpression")
    }
    return expr
  };

  // Parse an assignment expression. This includes applications of
  // operators like `+=`.

  pp$5.parseMaybeAssign = function(forInit, refDestructuringErrors, afterLeftParse) {
    if (this.isContextual("yield")) {
      if (this.inGenerator) { return this.parseYield(forInit) }
      // The tokenizer will assume an expression is allowed after
      // `yield`, but this isn't that kind of yield
      else { this.exprAllowed = false; }
    }

    var ownDestructuringErrors = false, oldParenAssign = -1, oldTrailingComma = -1, oldDoubleProto = -1;
    if (refDestructuringErrors) {
      oldParenAssign = refDestructuringErrors.parenthesizedAssign;
      oldTrailingComma = refDestructuringErrors.trailingComma;
      oldDoubleProto = refDestructuringErrors.doubleProto;
      refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = -1;
    } else {
      refDestructuringErrors = new DestructuringErrors;
      ownDestructuringErrors = true;
    }

    var startPos = this.start, startLoc = this.startLoc;
    if (this.type === types$1.parenL || this.type === types$1.name) {
      this.potentialArrowAt = this.start;
      this.potentialArrowInForAwait = forInit === "await";
    }
    var left = this.parseMaybeConditional(forInit, refDestructuringErrors);
    if (afterLeftParse) { left = afterLeftParse.call(this, left, startPos, startLoc); }
    if (this.type.isAssign) {
      var node = this.startNodeAt(startPos, startLoc);
      node.operator = this.value;
      if (this.type === types$1.eq)
        { left = this.toAssignable(left, false, refDestructuringErrors); }
      if (!ownDestructuringErrors) {
        refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = refDestructuringErrors.doubleProto = -1;
      }
      if (refDestructuringErrors.shorthandAssign >= left.start)
        { refDestructuringErrors.shorthandAssign = -1; } // reset because shorthand default was used correctly
      if (this.type === types$1.eq)
        { this.checkLValPattern(left); }
      else
        { this.checkLValSimple(left); }
      node.left = left;
      this.next();
      node.right = this.parseMaybeAssign(forInit);
      if (oldDoubleProto > -1) { refDestructuringErrors.doubleProto = oldDoubleProto; }
      return this.finishNode(node, "AssignmentExpression")
    } else {
      if (ownDestructuringErrors) { this.checkExpressionErrors(refDestructuringErrors, true); }
    }
    if (oldParenAssign > -1) { refDestructuringErrors.parenthesizedAssign = oldParenAssign; }
    if (oldTrailingComma > -1) { refDestructuringErrors.trailingComma = oldTrailingComma; }
    return left
  };

  // Parse a ternary conditional (`?:`) operator.

  pp$5.parseMaybeConditional = function(forInit, refDestructuringErrors) {
    var startPos = this.start, startLoc = this.startLoc;
    var expr = this.parseExprOps(forInit, refDestructuringErrors);
    if (this.checkExpressionErrors(refDestructuringErrors)) { return expr }
    if (this.eat(types$1.question)) {
      var node = this.startNodeAt(startPos, startLoc);
      node.test = expr;
      node.consequent = this.parseMaybeAssign();
      this.expect(types$1.colon);
      node.alternate = this.parseMaybeAssign(forInit);
      return this.finishNode(node, "ConditionalExpression")
    }
    return expr
  };

  // Start the precedence parser.

  pp$5.parseExprOps = function(forInit, refDestructuringErrors) {
    var startPos = this.start, startLoc = this.startLoc;
    var expr = this.parseMaybeUnary(refDestructuringErrors, false, false, forInit);
    if (this.checkExpressionErrors(refDestructuringErrors)) { return expr }
    return expr.start === startPos && expr.type === "ArrowFunctionExpression" ? expr : this.parseExprOp(expr, startPos, startLoc, -1, forInit)
  };

  // Parse binary operators with the operator precedence parsing
  // algorithm. `left` is the left-hand side of the operator.
  // `minPrec` provides context that allows the function to stop and
  // defer further parser to one of its callers when it encounters an
  // operator that has a lower precedence than the set it is parsing.

  pp$5.parseExprOp = function(left, leftStartPos, leftStartLoc, minPrec, forInit) {
    var prec = this.type.binop;
    if (prec != null && (!forInit || this.type !== types$1._in)) {
      if (prec > minPrec) {
        var logical = this.type === types$1.logicalOR || this.type === types$1.logicalAND;
        var coalesce = this.type === types$1.coalesce;
        if (coalesce) {
          // Handle the precedence of `tt.coalesce` as equal to the range of logical expressions.
          // In other words, `node.right` shouldn't contain logical expressions in order to check the mixed error.
          prec = types$1.logicalAND.binop;
        }
        var op = this.value;
        this.next();
        var startPos = this.start, startLoc = this.startLoc;
        var right = this.parseExprOp(this.parseMaybeUnary(null, false, false, forInit), startPos, startLoc, prec, forInit);
        var node = this.buildBinary(leftStartPos, leftStartLoc, left, right, op, logical || coalesce);
        if ((logical && this.type === types$1.coalesce) || (coalesce && (this.type === types$1.logicalOR || this.type === types$1.logicalAND))) {
          this.raiseRecoverable(this.start, "Logical expressions and coalesce expressions cannot be mixed. Wrap either by parentheses");
        }
        return this.parseExprOp(node, leftStartPos, leftStartLoc, minPrec, forInit)
      }
    }
    return left
  };

  pp$5.buildBinary = function(startPos, startLoc, left, right, op, logical) {
    if (right.type === "PrivateIdentifier") { this.raise(right.start, "Private identifier can only be left side of binary expression"); }
    var node = this.startNodeAt(startPos, startLoc);
    node.left = left;
    node.operator = op;
    node.right = right;
    return this.finishNode(node, logical ? "LogicalExpression" : "BinaryExpression")
  };

  // Parse unary operators, both prefix and postfix.

  pp$5.parseMaybeUnary = function(refDestructuringErrors, sawUnary, incDec, forInit) {
    var startPos = this.start, startLoc = this.startLoc, expr;
    if (this.isContextual("await") && this.canAwait) {
      expr = this.parseAwait(forInit);
      sawUnary = true;
    } else if (this.type.prefix) {
      var node = this.startNode(), update = this.type === types$1.incDec;
      node.operator = this.value;
      node.prefix = true;
      this.next();
      node.argument = this.parseMaybeUnary(null, true, update, forInit);
      this.checkExpressionErrors(refDestructuringErrors, true);
      if (update) { this.checkLValSimple(node.argument); }
      else if (this.strict && node.operator === "delete" && isLocalVariableAccess(node.argument))
        { this.raiseRecoverable(node.start, "Deleting local variable in strict mode"); }
      else if (node.operator === "delete" && isPrivateFieldAccess(node.argument))
        { this.raiseRecoverable(node.start, "Private fields can not be deleted"); }
      else { sawUnary = true; }
      expr = this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
    } else if (!sawUnary && this.type === types$1.privateId) {
      if ((forInit || this.privateNameStack.length === 0) && this.options.checkPrivateFields) { this.unexpected(); }
      expr = this.parsePrivateIdent();
      // only could be private fields in 'in', such as #x in obj
      if (this.type !== types$1._in) { this.unexpected(); }
    } else {
      expr = this.parseExprSubscripts(refDestructuringErrors, forInit);
      if (this.checkExpressionErrors(refDestructuringErrors)) { return expr }
      while (this.type.postfix && !this.canInsertSemicolon()) {
        var node$1 = this.startNodeAt(startPos, startLoc);
        node$1.operator = this.value;
        node$1.prefix = false;
        node$1.argument = expr;
        this.checkLValSimple(expr);
        this.next();
        expr = this.finishNode(node$1, "UpdateExpression");
      }
    }

    if (!incDec && this.eat(types$1.starstar)) {
      if (sawUnary)
        { this.unexpected(this.lastTokStart); }
      else
        { return this.buildBinary(startPos, startLoc, expr, this.parseMaybeUnary(null, false, false, forInit), "**", false) }
    } else {
      return expr
    }
  };

  function isLocalVariableAccess(node) {
    return (
      node.type === "Identifier" ||
      node.type === "ParenthesizedExpression" && isLocalVariableAccess(node.expression)
    )
  }

  function isPrivateFieldAccess(node) {
    return (
      node.type === "MemberExpression" && node.property.type === "PrivateIdentifier" ||
      node.type === "ChainExpression" && isPrivateFieldAccess(node.expression) ||
      node.type === "ParenthesizedExpression" && isPrivateFieldAccess(node.expression)
    )
  }

  // Parse call, dot, and `[]`-subscript expressions.

  pp$5.parseExprSubscripts = function(refDestructuringErrors, forInit) {
    var startPos = this.start, startLoc = this.startLoc;
    var expr = this.parseExprAtom(refDestructuringErrors, forInit);
    if (expr.type === "ArrowFunctionExpression" && this.input.slice(this.lastTokStart, this.lastTokEnd) !== ")")
      { return expr }
    var result = this.parseSubscripts(expr, startPos, startLoc, false, forInit);
    if (refDestructuringErrors && result.type === "MemberExpression") {
      if (refDestructuringErrors.parenthesizedAssign >= result.start) { refDestructuringErrors.parenthesizedAssign = -1; }
      if (refDestructuringErrors.parenthesizedBind >= result.start) { refDestructuringErrors.parenthesizedBind = -1; }
      if (refDestructuringErrors.trailingComma >= result.start) { refDestructuringErrors.trailingComma = -1; }
    }
    return result
  };

  pp$5.parseSubscripts = function(base, startPos, startLoc, noCalls, forInit) {
    var maybeAsyncArrow = this.options.ecmaVersion >= 8 && base.type === "Identifier" && base.name === "async" &&
        this.lastTokEnd === base.end && !this.canInsertSemicolon() && base.end - base.start === 5 &&
        this.potentialArrowAt === base.start;
    var optionalChained = false;

    while (true) {
      var element = this.parseSubscript(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained, forInit);

      if (element.optional) { optionalChained = true; }
      if (element === base || element.type === "ArrowFunctionExpression") {
        if (optionalChained) {
          var chainNode = this.startNodeAt(startPos, startLoc);
          chainNode.expression = element;
          element = this.finishNode(chainNode, "ChainExpression");
        }
        return element
      }

      base = element;
    }
  };

  pp$5.shouldParseAsyncArrow = function() {
    return !this.canInsertSemicolon() && this.eat(types$1.arrow)
  };

  pp$5.parseSubscriptAsyncArrow = function(startPos, startLoc, exprList, forInit) {
    return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList, true, forInit)
  };

  pp$5.parseSubscript = function(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained, forInit) {
    var optionalSupported = this.options.ecmaVersion >= 11;
    var optional = optionalSupported && this.eat(types$1.questionDot);
    if (noCalls && optional) { this.raise(this.lastTokStart, "Optional chaining cannot appear in the callee of new expressions"); }

    var computed = this.eat(types$1.bracketL);
    if (computed || (optional && this.type !== types$1.parenL && this.type !== types$1.backQuote) || this.eat(types$1.dot)) {
      var node = this.startNodeAt(startPos, startLoc);
      node.object = base;
      if (computed) {
        node.property = this.parseExpression();
        this.expect(types$1.bracketR);
      } else if (this.type === types$1.privateId && base.type !== "Super") {
        node.property = this.parsePrivateIdent();
      } else {
        node.property = this.parseIdent(this.options.allowReserved !== "never");
      }
      node.computed = !!computed;
      if (optionalSupported) {
        node.optional = optional;
      }
      base = this.finishNode(node, "MemberExpression");
    } else if (!noCalls && this.eat(types$1.parenL)) {
      var refDestructuringErrors = new DestructuringErrors, oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
      this.yieldPos = 0;
      this.awaitPos = 0;
      this.awaitIdentPos = 0;
      var exprList = this.parseExprList(types$1.parenR, this.options.ecmaVersion >= 8, false, refDestructuringErrors);
      if (maybeAsyncArrow && !optional && this.shouldParseAsyncArrow()) {
        this.checkPatternErrors(refDestructuringErrors, false);
        this.checkYieldAwaitInDefaultParams();
        if (this.awaitIdentPos > 0)
          { this.raise(this.awaitIdentPos, "Cannot use 'await' as identifier inside an async function"); }
        this.yieldPos = oldYieldPos;
        this.awaitPos = oldAwaitPos;
        this.awaitIdentPos = oldAwaitIdentPos;
        return this.parseSubscriptAsyncArrow(startPos, startLoc, exprList, forInit)
      }
      this.checkExpressionErrors(refDestructuringErrors, true);
      this.yieldPos = oldYieldPos || this.yieldPos;
      this.awaitPos = oldAwaitPos || this.awaitPos;
      this.awaitIdentPos = oldAwaitIdentPos || this.awaitIdentPos;
      var node$1 = this.startNodeAt(startPos, startLoc);
      node$1.callee = base;
      node$1.arguments = exprList;
      if (optionalSupported) {
        node$1.optional = optional;
      }
      base = this.finishNode(node$1, "CallExpression");
    } else if (this.type === types$1.backQuote) {
      if (optional || optionalChained) {
        this.raise(this.start, "Optional chaining cannot appear in the tag of tagged template expressions");
      }
      var node$2 = this.startNodeAt(startPos, startLoc);
      node$2.tag = base;
      node$2.quasi = this.parseTemplate({isTagged: true});
      base = this.finishNode(node$2, "TaggedTemplateExpression");
    }
    return base
  };

  // Parse an atomic expression — either a single token that is an
  // expression, an expression started by a keyword like `function` or
  // `new`, or an expression wrapped in punctuation like `()`, `[]`,
  // or `{}`.

  pp$5.parseExprAtom = function(refDestructuringErrors, forInit, forNew) {
    // If a division operator appears in an expression position, the
    // tokenizer got confused, and we force it to read a regexp instead.
    if (this.type === types$1.slash) { this.readRegexp(); }

    var node, canBeArrow = this.potentialArrowAt === this.start;
    switch (this.type) {
    case types$1._super:
      if (!this.allowSuper)
        { this.raise(this.start, "'super' keyword outside a method"); }
      node = this.startNode();
      this.next();
      if (this.type === types$1.parenL && !this.allowDirectSuper)
        { this.raise(node.start, "super() call outside constructor of a subclass"); }
      // The `super` keyword can appear at below:
      // SuperProperty:
      //     super [ Expression ]
      //     super . IdentifierName
      // SuperCall:
      //     super ( Arguments )
      if (this.type !== types$1.dot && this.type !== types$1.bracketL && this.type !== types$1.parenL)
        { this.unexpected(); }
      return this.finishNode(node, "Super")

    case types$1._this:
      node = this.startNode();
      this.next();
      return this.finishNode(node, "ThisExpression")

    case types$1.name:
      var startPos = this.start, startLoc = this.startLoc, containsEsc = this.containsEsc;
      var id = this.parseIdent(false);
      if (this.options.ecmaVersion >= 8 && !containsEsc && id.name === "async" && !this.canInsertSemicolon() && this.eat(types$1._function)) {
        this.overrideContext(types$2.f_expr);
        return this.parseFunction(this.startNodeAt(startPos, startLoc), 0, false, true, forInit)
      }
      if (canBeArrow && !this.canInsertSemicolon()) {
        if (this.eat(types$1.arrow))
          { return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], false, forInit) }
        if (this.options.ecmaVersion >= 8 && id.name === "async" && this.type === types$1.name && !containsEsc &&
            (!this.potentialArrowInForAwait || this.value !== "of" || this.containsEsc)) {
          id = this.parseIdent(false);
          if (this.canInsertSemicolon() || !this.eat(types$1.arrow))
            { this.unexpected(); }
          return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], true, forInit)
        }
      }
      return id

    case types$1.regexp:
      var value = this.value;
      node = this.parseLiteral(value.value);
      node.regex = {pattern: value.pattern, flags: value.flags};
      return node

    case types$1.num: case types$1.string:
      return this.parseLiteral(this.value)

    case types$1._null: case types$1._true: case types$1._false:
      node = this.startNode();
      node.value = this.type === types$1._null ? null : this.type === types$1._true;
      node.raw = this.type.keyword;
      this.next();
      return this.finishNode(node, "Literal")

    case types$1.parenL:
      var start = this.start, expr = this.parseParenAndDistinguishExpression(canBeArrow, forInit);
      if (refDestructuringErrors) {
        if (refDestructuringErrors.parenthesizedAssign < 0 && !this.isSimpleAssignTarget(expr))
          { refDestructuringErrors.parenthesizedAssign = start; }
        if (refDestructuringErrors.parenthesizedBind < 0)
          { refDestructuringErrors.parenthesizedBind = start; }
      }
      return expr

    case types$1.bracketL:
      node = this.startNode();
      this.next();
      node.elements = this.parseExprList(types$1.bracketR, true, true, refDestructuringErrors);
      return this.finishNode(node, "ArrayExpression")

    case types$1.braceL:
      this.overrideContext(types$2.b_expr);
      return this.parseObj(false, refDestructuringErrors)

    case types$1._function:
      node = this.startNode();
      this.next();
      return this.parseFunction(node, 0)

    case types$1._class:
      return this.parseClass(this.startNode(), false)

    case types$1._new:
      return this.parseNew()

    case types$1.backQuote:
      return this.parseTemplate()

    case types$1._import:
      if (this.options.ecmaVersion >= 11) {
        return this.parseExprImport(forNew)
      } else {
        return this.unexpected()
      }

    default:
      return this.parseExprAtomDefault()
    }
  };

  pp$5.parseExprAtomDefault = function() {
    this.unexpected();
  };

  pp$5.parseExprImport = function(forNew) {
    var node = this.startNode();

    // Consume `import` as an identifier for `import.meta`.
    // Because `this.parseIdent(true)` doesn't check escape sequences, it needs the check of `this.containsEsc`.
    if (this.containsEsc) { this.raiseRecoverable(this.start, "Escape sequence in keyword import"); }
    this.next();

    if (this.type === types$1.parenL && !forNew) {
      return this.parseDynamicImport(node)
    } else if (this.type === types$1.dot) {
      var meta = this.startNodeAt(node.start, node.loc && node.loc.start);
      meta.name = "import";
      node.meta = this.finishNode(meta, "Identifier");
      return this.parseImportMeta(node)
    } else {
      this.unexpected();
    }
  };

  pp$5.parseDynamicImport = function(node) {
    this.next(); // skip `(`

    // Parse node.source.
    node.source = this.parseMaybeAssign();

    if (this.options.ecmaVersion >= 16) {
      if (!this.eat(types$1.parenR)) {
        this.expect(types$1.comma);
        if (!this.afterTrailingComma(types$1.parenR)) {
          node.options = this.parseMaybeAssign();
          if (!this.eat(types$1.parenR)) {
            this.expect(types$1.comma);
            if (!this.afterTrailingComma(types$1.parenR)) {
              this.unexpected();
            }
          }
        } else {
          node.options = null;
        }
      } else {
        node.options = null;
      }
    } else {
      // Verify ending.
      if (!this.eat(types$1.parenR)) {
        var errorPos = this.start;
        if (this.eat(types$1.comma) && this.eat(types$1.parenR)) {
          this.raiseRecoverable(errorPos, "Trailing comma is not allowed in import()");
        } else {
          this.unexpected(errorPos);
        }
      }
    }

    return this.finishNode(node, "ImportExpression")
  };

  pp$5.parseImportMeta = function(node) {
    this.next(); // skip `.`

    var containsEsc = this.containsEsc;
    node.property = this.parseIdent(true);

    if (node.property.name !== "meta")
      { this.raiseRecoverable(node.property.start, "The only valid meta property for import is 'import.meta'"); }
    if (containsEsc)
      { this.raiseRecoverable(node.start, "'import.meta' must not contain escaped characters"); }
    if (this.options.sourceType !== "module" && !this.options.allowImportExportEverywhere)
      { this.raiseRecoverable(node.start, "Cannot use 'import.meta' outside a module"); }

    return this.finishNode(node, "MetaProperty")
  };

  pp$5.parseLiteral = function(value) {
    var node = this.startNode();
    node.value = value;
    node.raw = this.input.slice(this.start, this.end);
    if (node.raw.charCodeAt(node.raw.length - 1) === 110) { node.bigint = node.raw.slice(0, -1).replace(/_/g, ""); }
    this.next();
    return this.finishNode(node, "Literal")
  };

  pp$5.parseParenExpression = function() {
    this.expect(types$1.parenL);
    var val = this.parseExpression();
    this.expect(types$1.parenR);
    return val
  };

  pp$5.shouldParseArrow = function(exprList) {
    return !this.canInsertSemicolon()
  };

  pp$5.parseParenAndDistinguishExpression = function(canBeArrow, forInit) {
    var startPos = this.start, startLoc = this.startLoc, val, allowTrailingComma = this.options.ecmaVersion >= 8;
    if (this.options.ecmaVersion >= 6) {
      this.next();

      var innerStartPos = this.start, innerStartLoc = this.startLoc;
      var exprList = [], first = true, lastIsComma = false;
      var refDestructuringErrors = new DestructuringErrors, oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, spreadStart;
      this.yieldPos = 0;
      this.awaitPos = 0;
      // Do not save awaitIdentPos to allow checking awaits nested in parameters
      while (this.type !== types$1.parenR) {
        first ? first = false : this.expect(types$1.comma);
        if (allowTrailingComma && this.afterTrailingComma(types$1.parenR, true)) {
          lastIsComma = true;
          break
        } else if (this.type === types$1.ellipsis) {
          spreadStart = this.start;
          exprList.push(this.parseParenItem(this.parseRestBinding()));
          if (this.type === types$1.comma) {
            this.raiseRecoverable(
              this.start,
              "Comma is not permitted after the rest element"
            );
          }
          break
        } else {
          exprList.push(this.parseMaybeAssign(false, refDestructuringErrors, this.parseParenItem));
        }
      }
      var innerEndPos = this.lastTokEnd, innerEndLoc = this.lastTokEndLoc;
      this.expect(types$1.parenR);

      if (canBeArrow && this.shouldParseArrow(exprList) && this.eat(types$1.arrow)) {
        this.checkPatternErrors(refDestructuringErrors, false);
        this.checkYieldAwaitInDefaultParams();
        this.yieldPos = oldYieldPos;
        this.awaitPos = oldAwaitPos;
        return this.parseParenArrowList(startPos, startLoc, exprList, forInit)
      }

      if (!exprList.length || lastIsComma) { this.unexpected(this.lastTokStart); }
      if (spreadStart) { this.unexpected(spreadStart); }
      this.checkExpressionErrors(refDestructuringErrors, true);
      this.yieldPos = oldYieldPos || this.yieldPos;
      this.awaitPos = oldAwaitPos || this.awaitPos;

      if (exprList.length > 1) {
        val = this.startNodeAt(innerStartPos, innerStartLoc);
        val.expressions = exprList;
        this.finishNodeAt(val, "SequenceExpression", innerEndPos, innerEndLoc);
      } else {
        val = exprList[0];
      }
    } else {
      val = this.parseParenExpression();
    }

    if (this.options.preserveParens) {
      var par = this.startNodeAt(startPos, startLoc);
      par.expression = val;
      return this.finishNode(par, "ParenthesizedExpression")
    } else {
      return val
    }
  };

  pp$5.parseParenItem = function(item) {
    return item
  };

  pp$5.parseParenArrowList = function(startPos, startLoc, exprList, forInit) {
    return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList, false, forInit)
  };

  // New's precedence is slightly tricky. It must allow its argument to
  // be a `[]` or dot subscript expression, but not a call — at least,
  // not without wrapping it in parentheses. Thus, it uses the noCalls
  // argument to parseSubscripts to prevent it from consuming the
  // argument list.

  var empty$2 = [];

  pp$5.parseNew = function() {
    if (this.containsEsc) { this.raiseRecoverable(this.start, "Escape sequence in keyword new"); }
    var node = this.startNode();
    this.next();
    if (this.options.ecmaVersion >= 6 && this.type === types$1.dot) {
      var meta = this.startNodeAt(node.start, node.loc && node.loc.start);
      meta.name = "new";
      node.meta = this.finishNode(meta, "Identifier");
      this.next();
      var containsEsc = this.containsEsc;
      node.property = this.parseIdent(true);
      if (node.property.name !== "target")
        { this.raiseRecoverable(node.property.start, "The only valid meta property for new is 'new.target'"); }
      if (containsEsc)
        { this.raiseRecoverable(node.start, "'new.target' must not contain escaped characters"); }
      if (!this.allowNewDotTarget)
        { this.raiseRecoverable(node.start, "'new.target' can only be used in functions and class static block"); }
      return this.finishNode(node, "MetaProperty")
    }
    var startPos = this.start, startLoc = this.startLoc;
    node.callee = this.parseSubscripts(this.parseExprAtom(null, false, true), startPos, startLoc, true, false);
    if (this.eat(types$1.parenL)) { node.arguments = this.parseExprList(types$1.parenR, this.options.ecmaVersion >= 8, false); }
    else { node.arguments = empty$2; }
    return this.finishNode(node, "NewExpression")
  };

  // Parse template expression.

  pp$5.parseTemplateElement = function(ref) {
    var isTagged = ref.isTagged;

    var elem = this.startNode();
    if (this.type === types$1.invalidTemplate) {
      if (!isTagged) {
        this.raiseRecoverable(this.start, "Bad escape sequence in untagged template literal");
      }
      elem.value = {
        raw: this.value.replace(/\r\n?/g, "\n"),
        cooked: null
      };
    } else {
      elem.value = {
        raw: this.input.slice(this.start, this.end).replace(/\r\n?/g, "\n"),
        cooked: this.value
      };
    }
    this.next();
    elem.tail = this.type === types$1.backQuote;
    return this.finishNode(elem, "TemplateElement")
  };

  pp$5.parseTemplate = function(ref) {
    if ( ref === void 0 ) ref = {};
    var isTagged = ref.isTagged; if ( isTagged === void 0 ) isTagged = false;

    var node = this.startNode();
    this.next();
    node.expressions = [];
    var curElt = this.parseTemplateElement({isTagged: isTagged});
    node.quasis = [curElt];
    while (!curElt.tail) {
      if (this.type === types$1.eof) { this.raise(this.pos, "Unterminated template literal"); }
      this.expect(types$1.dollarBraceL);
      node.expressions.push(this.parseExpression());
      this.expect(types$1.braceR);
      node.quasis.push(curElt = this.parseTemplateElement({isTagged: isTagged}));
    }
    this.next();
    return this.finishNode(node, "TemplateLiteral")
  };

  pp$5.isAsyncProp = function(prop) {
    return !prop.computed && prop.key.type === "Identifier" && prop.key.name === "async" &&
      (this.type === types$1.name || this.type === types$1.num || this.type === types$1.string || this.type === types$1.bracketL || this.type.keyword || (this.options.ecmaVersion >= 9 && this.type === types$1.star)) &&
      !lineBreak.test(this.input.slice(this.lastTokEnd, this.start))
  };

  // Parse an object literal or binding pattern.

  pp$5.parseObj = function(isPattern, refDestructuringErrors) {
    var node = this.startNode(), first = true, propHash = {};
    node.properties = [];
    this.next();
    while (!this.eat(types$1.braceR)) {
      if (!first) {
        this.expect(types$1.comma);
        if (this.options.ecmaVersion >= 5 && this.afterTrailingComma(types$1.braceR)) { break }
      } else { first = false; }

      var prop = this.parseProperty(isPattern, refDestructuringErrors);
      if (!isPattern) { this.checkPropClash(prop, propHash, refDestructuringErrors); }
      node.properties.push(prop);
    }
    return this.finishNode(node, isPattern ? "ObjectPattern" : "ObjectExpression")
  };

  pp$5.parseProperty = function(isPattern, refDestructuringErrors) {
    var prop = this.startNode(), isGenerator, isAsync, startPos, startLoc;
    if (this.options.ecmaVersion >= 9 && this.eat(types$1.ellipsis)) {
      if (isPattern) {
        prop.argument = this.parseIdent(false);
        if (this.type === types$1.comma) {
          this.raiseRecoverable(this.start, "Comma is not permitted after the rest element");
        }
        return this.finishNode(prop, "RestElement")
      }
      // Parse argument.
      prop.argument = this.parseMaybeAssign(false, refDestructuringErrors);
      // To disallow trailing comma via `this.toAssignable()`.
      if (this.type === types$1.comma && refDestructuringErrors && refDestructuringErrors.trailingComma < 0) {
        refDestructuringErrors.trailingComma = this.start;
      }
      // Finish
      return this.finishNode(prop, "SpreadElement")
    }
    if (this.options.ecmaVersion >= 6) {
      prop.method = false;
      prop.shorthand = false;
      if (isPattern || refDestructuringErrors) {
        startPos = this.start;
        startLoc = this.startLoc;
      }
      if (!isPattern)
        { isGenerator = this.eat(types$1.star); }
    }
    var containsEsc = this.containsEsc;
    this.parsePropertyName(prop);
    if (!isPattern && !containsEsc && this.options.ecmaVersion >= 8 && !isGenerator && this.isAsyncProp(prop)) {
      isAsync = true;
      isGenerator = this.options.ecmaVersion >= 9 && this.eat(types$1.star);
      this.parsePropertyName(prop);
    } else {
      isAsync = false;
    }
    this.parsePropertyValue(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc);
    return this.finishNode(prop, "Property")
  };

  pp$5.parseGetterSetter = function(prop) {
    prop.kind = prop.key.name;
    this.parsePropertyName(prop);
    prop.value = this.parseMethod(false);
    var paramCount = prop.kind === "get" ? 0 : 1;
    if (prop.value.params.length !== paramCount) {
      var start = prop.value.start;
      if (prop.kind === "get")
        { this.raiseRecoverable(start, "getter should have no params"); }
      else
        { this.raiseRecoverable(start, "setter should have exactly one param"); }
    } else {
      if (prop.kind === "set" && prop.value.params[0].type === "RestElement")
        { this.raiseRecoverable(prop.value.params[0].start, "Setter cannot use rest params"); }
    }
  };

  pp$5.parsePropertyValue = function(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc) {
    if ((isGenerator || isAsync) && this.type === types$1.colon)
      { this.unexpected(); }

    if (this.eat(types$1.colon)) {
      prop.value = isPattern ? this.parseMaybeDefault(this.start, this.startLoc) : this.parseMaybeAssign(false, refDestructuringErrors);
      prop.kind = "init";
    } else if (this.options.ecmaVersion >= 6 && this.type === types$1.parenL) {
      if (isPattern) { this.unexpected(); }
      prop.kind = "init";
      prop.method = true;
      prop.value = this.parseMethod(isGenerator, isAsync);
    } else if (!isPattern && !containsEsc &&
               this.options.ecmaVersion >= 5 && !prop.computed && prop.key.type === "Identifier" &&
               (prop.key.name === "get" || prop.key.name === "set") &&
               (this.type !== types$1.comma && this.type !== types$1.braceR && this.type !== types$1.eq)) {
      if (isGenerator || isAsync) { this.unexpected(); }
      this.parseGetterSetter(prop);
    } else if (this.options.ecmaVersion >= 6 && !prop.computed && prop.key.type === "Identifier") {
      if (isGenerator || isAsync) { this.unexpected(); }
      this.checkUnreserved(prop.key);
      if (prop.key.name === "await" && !this.awaitIdentPos)
        { this.awaitIdentPos = startPos; }
      prop.kind = "init";
      if (isPattern) {
        prop.value = this.parseMaybeDefault(startPos, startLoc, this.copyNode(prop.key));
      } else if (this.type === types$1.eq && refDestructuringErrors) {
        if (refDestructuringErrors.shorthandAssign < 0)
          { refDestructuringErrors.shorthandAssign = this.start; }
        prop.value = this.parseMaybeDefault(startPos, startLoc, this.copyNode(prop.key));
      } else {
        prop.value = this.copyNode(prop.key);
      }
      prop.shorthand = true;
    } else { this.unexpected(); }
  };

  pp$5.parsePropertyName = function(prop) {
    if (this.options.ecmaVersion >= 6) {
      if (this.eat(types$1.bracketL)) {
        prop.computed = true;
        prop.key = this.parseMaybeAssign();
        this.expect(types$1.bracketR);
        return prop.key
      } else {
        prop.computed = false;
      }
    }
    return prop.key = this.type === types$1.num || this.type === types$1.string ? this.parseExprAtom() : this.parseIdent(this.options.allowReserved !== "never")
  };

  // Initialize empty function node.

  pp$5.initFunction = function(node) {
    node.id = null;
    if (this.options.ecmaVersion >= 6) { node.generator = node.expression = false; }
    if (this.options.ecmaVersion >= 8) { node.async = false; }
  };

  // Parse object or class method.

  pp$5.parseMethod = function(isGenerator, isAsync, allowDirectSuper) {
    var node = this.startNode(), oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;

    this.initFunction(node);
    if (this.options.ecmaVersion >= 6)
      { node.generator = isGenerator; }
    if (this.options.ecmaVersion >= 8)
      { node.async = !!isAsync; }

    this.yieldPos = 0;
    this.awaitPos = 0;
    this.awaitIdentPos = 0;
    this.enterScope(functionFlags(isAsync, node.generator) | SCOPE_SUPER | (allowDirectSuper ? SCOPE_DIRECT_SUPER : 0));

    this.expect(types$1.parenL);
    node.params = this.parseBindingList(types$1.parenR, false, this.options.ecmaVersion >= 8);
    this.checkYieldAwaitInDefaultParams();
    this.parseFunctionBody(node, false, true, false);

    this.yieldPos = oldYieldPos;
    this.awaitPos = oldAwaitPos;
    this.awaitIdentPos = oldAwaitIdentPos;
    return this.finishNode(node, "FunctionExpression")
  };

  // Parse arrow function expression with given parameters.

  pp$5.parseArrowExpression = function(node, params, isAsync, forInit) {
    var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;

    this.enterScope(functionFlags(isAsync, false) | SCOPE_ARROW);
    this.initFunction(node);
    if (this.options.ecmaVersion >= 8) { node.async = !!isAsync; }

    this.yieldPos = 0;
    this.awaitPos = 0;
    this.awaitIdentPos = 0;

    node.params = this.toAssignableList(params, true);
    this.parseFunctionBody(node, true, false, forInit);

    this.yieldPos = oldYieldPos;
    this.awaitPos = oldAwaitPos;
    this.awaitIdentPos = oldAwaitIdentPos;
    return this.finishNode(node, "ArrowFunctionExpression")
  };

  // Parse function body and check parameters.

  pp$5.parseFunctionBody = function(node, isArrowFunction, isMethod, forInit) {
    var isExpression = isArrowFunction && this.type !== types$1.braceL;
    var oldStrict = this.strict, useStrict = false;

    if (isExpression) {
      node.body = this.parseMaybeAssign(forInit);
      node.expression = true;
      this.checkParams(node, false);
    } else {
      var nonSimple = this.options.ecmaVersion >= 7 && !this.isSimpleParamList(node.params);
      if (!oldStrict || nonSimple) {
        useStrict = this.strictDirective(this.end);
        // If this is a strict mode function, verify that argument names
        // are not repeated, and it does not try to bind the words `eval`
        // or `arguments`.
        if (useStrict && nonSimple)
          { this.raiseRecoverable(node.start, "Illegal 'use strict' directive in function with non-simple parameter list"); }
      }
      // Start a new scope with regard to labels and the `inFunction`
      // flag (restore them to their old value afterwards).
      var oldLabels = this.labels;
      this.labels = [];
      if (useStrict) { this.strict = true; }

      // Add the params to varDeclaredNames to ensure that an error is thrown
      // if a let/const declaration in the function clashes with one of the params.
      this.checkParams(node, !oldStrict && !useStrict && !isArrowFunction && !isMethod && this.isSimpleParamList(node.params));
      // Ensure the function name isn't a forbidden identifier in strict mode, e.g. 'eval'
      if (this.strict && node.id) { this.checkLValSimple(node.id, BIND_OUTSIDE); }
      node.body = this.parseBlock(false, undefined, useStrict && !oldStrict);
      node.expression = false;
      this.adaptDirectivePrologue(node.body.body);
      this.labels = oldLabels;
    }
    this.exitScope();
  };

  pp$5.isSimpleParamList = function(params) {
    for (var i = 0, list = params; i < list.length; i += 1)
      {
      var param = list[i];

      if (param.type !== "Identifier") { return false
    } }
    return true
  };

  // Checks function params for various disallowed patterns such as using "eval"
  // or "arguments" and duplicate parameters.

  pp$5.checkParams = function(node, allowDuplicates) {
    var nameHash = Object.create(null);
    for (var i = 0, list = node.params; i < list.length; i += 1)
      {
      var param = list[i];

      this.checkLValInnerPattern(param, BIND_VAR, allowDuplicates ? null : nameHash);
    }
  };

  // Parses a comma-separated list of expressions, and returns them as
  // an array. `close` is the token type that ends the list, and
  // `allowEmpty` can be turned on to allow subsequent commas with
  // nothing in between them to be parsed as `null` (which is needed
  // for array literals).

  pp$5.parseExprList = function(close, allowTrailingComma, allowEmpty, refDestructuringErrors) {
    var elts = [], first = true;
    while (!this.eat(close)) {
      if (!first) {
        this.expect(types$1.comma);
        if (allowTrailingComma && this.afterTrailingComma(close)) { break }
      } else { first = false; }

      var elt = (void 0);
      if (allowEmpty && this.type === types$1.comma)
        { elt = null; }
      else if (this.type === types$1.ellipsis) {
        elt = this.parseSpread(refDestructuringErrors);
        if (refDestructuringErrors && this.type === types$1.comma && refDestructuringErrors.trailingComma < 0)
          { refDestructuringErrors.trailingComma = this.start; }
      } else {
        elt = this.parseMaybeAssign(false, refDestructuringErrors);
      }
      elts.push(elt);
    }
    return elts
  };

  pp$5.checkUnreserved = function(ref) {
    var start = ref.start;
    var end = ref.end;
    var name = ref.name;

    if (this.inGenerator && name === "yield")
      { this.raiseRecoverable(start, "Cannot use 'yield' as identifier inside a generator"); }
    if (this.inAsync && name === "await")
      { this.raiseRecoverable(start, "Cannot use 'await' as identifier inside an async function"); }
    if (this.currentThisScope().inClassFieldInit && name === "arguments")
      { this.raiseRecoverable(start, "Cannot use 'arguments' in class field initializer"); }
    if (this.inClassStaticBlock && (name === "arguments" || name === "await"))
      { this.raise(start, ("Cannot use " + name + " in class static initialization block")); }
    if (this.keywords.test(name))
      { this.raise(start, ("Unexpected keyword '" + name + "'")); }
    if (this.options.ecmaVersion < 6 &&
      this.input.slice(start, end).indexOf("\\") !== -1) { return }
    var re = this.strict ? this.reservedWordsStrict : this.reservedWords;
    if (re.test(name)) {
      if (!this.inAsync && name === "await")
        { this.raiseRecoverable(start, "Cannot use keyword 'await' outside an async function"); }
      this.raiseRecoverable(start, ("The keyword '" + name + "' is reserved"));
    }
  };

  // Parse the next token as an identifier. If `liberal` is true (used
  // when parsing properties), it will also convert keywords into
  // identifiers.

  pp$5.parseIdent = function(liberal) {
    var node = this.parseIdentNode();
    this.next(!!liberal);
    this.finishNode(node, "Identifier");
    if (!liberal) {
      this.checkUnreserved(node);
      if (node.name === "await" && !this.awaitIdentPos)
        { this.awaitIdentPos = node.start; }
    }
    return node
  };

  pp$5.parseIdentNode = function() {
    var node = this.startNode();
    if (this.type === types$1.name) {
      node.name = this.value;
    } else if (this.type.keyword) {
      node.name = this.type.keyword;

      // To fix https://github.com/acornjs/acorn/issues/575
      // `class` and `function` keywords push new context into this.context.
      // But there is no chance to pop the context if the keyword is consumed as an identifier such as a property name.
      // If the previous token is a dot, this does not apply because the context-managing code already ignored the keyword
      if ((node.name === "class" || node.name === "function") &&
        (this.lastTokEnd !== this.lastTokStart + 1 || this.input.charCodeAt(this.lastTokStart) !== 46)) {
        this.context.pop();
      }
      this.type = types$1.name;
    } else {
      this.unexpected();
    }
    return node
  };

  pp$5.parsePrivateIdent = function() {
    var node = this.startNode();
    if (this.type === types$1.privateId) {
      node.name = this.value;
    } else {
      this.unexpected();
    }
    this.next();
    this.finishNode(node, "PrivateIdentifier");

    // For validating existence
    if (this.options.checkPrivateFields) {
      if (this.privateNameStack.length === 0) {
        this.raise(node.start, ("Private field '#" + (node.name) + "' must be declared in an enclosing class"));
      } else {
        this.privateNameStack[this.privateNameStack.length - 1].used.push(node);
      }
    }

    return node
  };

  // Parses yield expression inside generator.

  pp$5.parseYield = function(forInit) {
    if (!this.yieldPos) { this.yieldPos = this.start; }

    var node = this.startNode();
    this.next();
    if (this.type === types$1.semi || this.canInsertSemicolon() || (this.type !== types$1.star && !this.type.startsExpr)) {
      node.delegate = false;
      node.argument = null;
    } else {
      node.delegate = this.eat(types$1.star);
      node.argument = this.parseMaybeAssign(forInit);
    }
    return this.finishNode(node, "YieldExpression")
  };

  pp$5.parseAwait = function(forInit) {
    if (!this.awaitPos) { this.awaitPos = this.start; }

    var node = this.startNode();
    this.next();
    node.argument = this.parseMaybeUnary(null, true, false, forInit);
    return this.finishNode(node, "AwaitExpression")
  };

  var pp$4 = Parser.prototype;

  // This function is used to raise exceptions on parse errors. It
  // takes an offset integer (into the current `input`) to indicate
  // the location of the error, attaches the position to the end
  // of the error message, and then raises a `SyntaxError` with that
  // message.

  pp$4.raise = function(pos, message) {
    var loc = getLineInfo(this.input, pos);
    message += " (" + loc.line + ":" + loc.column + ")";
    var err = new SyntaxError(message);
    err.pos = pos; err.loc = loc; err.raisedAt = this.pos;
    throw err
  };

  pp$4.raiseRecoverable = pp$4.raise;

  pp$4.curPosition = function() {
    if (this.options.locations) {
      return new Position(this.curLine, this.pos - this.lineStart)
    }
  };

  var pp$3 = Parser.prototype;

  var Scope = function Scope(flags) {
    this.flags = flags;
    // A list of var-declared names in the current lexical scope
    this.var = [];
    // A list of lexically-declared names in the current lexical scope
    this.lexical = [];
    // A list of lexically-declared FunctionDeclaration names in the current lexical scope
    this.functions = [];
    // A switch to disallow the identifier reference 'arguments'
    this.inClassFieldInit = false;
  };

  // The functions in this module keep track of declared variables in the current scope in order to detect duplicate variable names.

  pp$3.enterScope = function(flags) {
    this.scopeStack.push(new Scope(flags));
  };

  pp$3.exitScope = function() {
    this.scopeStack.pop();
  };

  // The spec says:
  // > At the top level of a function, or script, function declarations are
  // > treated like var declarations rather than like lexical declarations.
  pp$3.treatFunctionsAsVarInScope = function(scope) {
    return (scope.flags & SCOPE_FUNCTION) || !this.inModule && (scope.flags & SCOPE_TOP)
  };

  pp$3.declareName = function(name, bindingType, pos) {
    var redeclared = false;
    if (bindingType === BIND_LEXICAL) {
      var scope = this.currentScope();
      redeclared = scope.lexical.indexOf(name) > -1 || scope.functions.indexOf(name) > -1 || scope.var.indexOf(name) > -1;
      scope.lexical.push(name);
      if (this.inModule && (scope.flags & SCOPE_TOP))
        { delete this.undefinedExports[name]; }
    } else if (bindingType === BIND_SIMPLE_CATCH) {
      var scope$1 = this.currentScope();
      scope$1.lexical.push(name);
    } else if (bindingType === BIND_FUNCTION) {
      var scope$2 = this.currentScope();
      if (this.treatFunctionsAsVar)
        { redeclared = scope$2.lexical.indexOf(name) > -1; }
      else
        { redeclared = scope$2.lexical.indexOf(name) > -1 || scope$2.var.indexOf(name) > -1; }
      scope$2.functions.push(name);
    } else {
      for (var i = this.scopeStack.length - 1; i >= 0; --i) {
        var scope$3 = this.scopeStack[i];
        if (scope$3.lexical.indexOf(name) > -1 && !((scope$3.flags & SCOPE_SIMPLE_CATCH) && scope$3.lexical[0] === name) ||
            !this.treatFunctionsAsVarInScope(scope$3) && scope$3.functions.indexOf(name) > -1) {
          redeclared = true;
          break
        }
        scope$3.var.push(name);
        if (this.inModule && (scope$3.flags & SCOPE_TOP))
          { delete this.undefinedExports[name]; }
        if (scope$3.flags & SCOPE_VAR) { break }
      }
    }
    if (redeclared) { this.raiseRecoverable(pos, ("Identifier '" + name + "' has already been declared")); }
  };

  pp$3.checkLocalExport = function(id) {
    // scope.functions must be empty as Module code is always strict.
    if (this.scopeStack[0].lexical.indexOf(id.name) === -1 &&
        this.scopeStack[0].var.indexOf(id.name) === -1) {
      this.undefinedExports[id.name] = id;
    }
  };

  pp$3.currentScope = function() {
    return this.scopeStack[this.scopeStack.length - 1]
  };

  pp$3.currentVarScope = function() {
    for (var i = this.scopeStack.length - 1;; i--) {
      var scope = this.scopeStack[i];
      if (scope.flags & SCOPE_VAR) { return scope }
    }
  };

  // Could be useful for `this`, `new.target`, `super()`, `super.property`, and `super[property]`.
  pp$3.currentThisScope = function() {
    for (var i = this.scopeStack.length - 1;; i--) {
      var scope = this.scopeStack[i];
      if (scope.flags & SCOPE_VAR && !(scope.flags & SCOPE_ARROW)) { return scope }
    }
  };

  var Node = function Node(parser, pos, loc) {
    this.type = "";
    this.start = pos;
    this.end = 0;
    if (parser.options.locations)
      { this.loc = new SourceLocation(parser, loc); }
    if (parser.options.directSourceFile)
      { this.sourceFile = parser.options.directSourceFile; }
    if (parser.options.ranges)
      { this.range = [pos, 0]; }
  };

  // Start an AST node, attaching a start offset.

  var pp$2 = Parser.prototype;

  pp$2.startNode = function() {
    return new Node(this, this.start, this.startLoc)
  };

  pp$2.startNodeAt = function(pos, loc) {
    return new Node(this, pos, loc)
  };

  // Finish an AST node, adding `type` and `end` properties.

  function finishNodeAt(node, type, pos, loc) {
    node.type = type;
    node.end = pos;
    if (this.options.locations)
      { node.loc.end = loc; }
    if (this.options.ranges)
      { node.range[1] = pos; }
    return node
  }

  pp$2.finishNode = function(node, type) {
    return finishNodeAt.call(this, node, type, this.lastTokEnd, this.lastTokEndLoc)
  };

  // Finish node at given position

  pp$2.finishNodeAt = function(node, type, pos, loc) {
    return finishNodeAt.call(this, node, type, pos, loc)
  };

  pp$2.copyNode = function(node) {
    var newNode = new Node(this, node.start, this.startLoc);
    for (var prop in node) { newNode[prop] = node[prop]; }
    return newNode
  };

  // This file was generated by "bin/generate-unicode-script-values.js". Do not modify manually!
  var scriptValuesAddedInUnicode = "Gara Garay Gukh Gurung_Khema Hrkt Katakana_Or_Hiragana Kawi Kirat_Rai Krai Nag_Mundari Nagm Ol_Onal Onao Sunu Sunuwar Todhri Todr Tulu_Tigalari Tutg Unknown Zzzz";

  // This file contains Unicode properties extracted from the ECMAScript specification.
  // The lists are extracted like so:
  // $$('#table-binary-unicode-properties > figure > table > tbody > tr > td:nth-child(1) code').map(el => el.innerText)

  // #table-binary-unicode-properties
  var ecma9BinaryProperties = "ASCII ASCII_Hex_Digit AHex Alphabetic Alpha Any Assigned Bidi_Control Bidi_C Bidi_Mirrored Bidi_M Case_Ignorable CI Cased Changes_When_Casefolded CWCF Changes_When_Casemapped CWCM Changes_When_Lowercased CWL Changes_When_NFKC_Casefolded CWKCF Changes_When_Titlecased CWT Changes_When_Uppercased CWU Dash Default_Ignorable_Code_Point DI Deprecated Dep Diacritic Dia Emoji Emoji_Component Emoji_Modifier Emoji_Modifier_Base Emoji_Presentation Extender Ext Grapheme_Base Gr_Base Grapheme_Extend Gr_Ext Hex_Digit Hex IDS_Binary_Operator IDSB IDS_Trinary_Operator IDST ID_Continue IDC ID_Start IDS Ideographic Ideo Join_Control Join_C Logical_Order_Exception LOE Lowercase Lower Math Noncharacter_Code_Point NChar Pattern_Syntax Pat_Syn Pattern_White_Space Pat_WS Quotation_Mark QMark Radical Regional_Indicator RI Sentence_Terminal STerm Soft_Dotted SD Terminal_Punctuation Term Unified_Ideograph UIdeo Uppercase Upper Variation_Selector VS White_Space space XID_Continue XIDC XID_Start XIDS";
  var ecma10BinaryProperties = ecma9BinaryProperties + " Extended_Pictographic";
  var ecma11BinaryProperties = ecma10BinaryProperties;
  var ecma12BinaryProperties = ecma11BinaryProperties + " EBase EComp EMod EPres ExtPict";
  var ecma13BinaryProperties = ecma12BinaryProperties;
  var ecma14BinaryProperties = ecma13BinaryProperties;

  var unicodeBinaryProperties = {
    9: ecma9BinaryProperties,
    10: ecma10BinaryProperties,
    11: ecma11BinaryProperties,
    12: ecma12BinaryProperties,
    13: ecma13BinaryProperties,
    14: ecma14BinaryProperties
  };

  // #table-binary-unicode-properties-of-strings
  var ecma14BinaryPropertiesOfStrings = "Basic_Emoji Emoji_Keycap_Sequence RGI_Emoji_Modifier_Sequence RGI_Emoji_Flag_Sequence RGI_Emoji_Tag_Sequence RGI_Emoji_ZWJ_Sequence RGI_Emoji";

  var unicodeBinaryPropertiesOfStrings = {
    9: "",
    10: "",
    11: "",
    12: "",
    13: "",
    14: ecma14BinaryPropertiesOfStrings
  };

  // #table-unicode-general-category-values
  var unicodeGeneralCategoryValues = "Cased_Letter LC Close_Punctuation Pe Connector_Punctuation Pc Control Cc cntrl Currency_Symbol Sc Dash_Punctuation Pd Decimal_Number Nd digit Enclosing_Mark Me Final_Punctuation Pf Format Cf Initial_Punctuation Pi Letter L Letter_Number Nl Line_Separator Zl Lowercase_Letter Ll Mark M Combining_Mark Math_Symbol Sm Modifier_Letter Lm Modifier_Symbol Sk Nonspacing_Mark Mn Number N Open_Punctuation Ps Other C Other_Letter Lo Other_Number No Other_Punctuation Po Other_Symbol So Paragraph_Separator Zp Private_Use Co Punctuation P punct Separator Z Space_Separator Zs Spacing_Mark Mc Surrogate Cs Symbol S Titlecase_Letter Lt Unassigned Cn Uppercase_Letter Lu";

  // #table-unicode-script-values
  var ecma9ScriptValues = "Adlam Adlm Ahom Anatolian_Hieroglyphs Hluw Arabic Arab Armenian Armn Avestan Avst Balinese Bali Bamum Bamu Bassa_Vah Bass Batak Batk Bengali Beng Bhaiksuki Bhks Bopomofo Bopo Brahmi Brah Braille Brai Buginese Bugi Buhid Buhd Canadian_Aboriginal Cans Carian Cari Caucasian_Albanian Aghb Chakma Cakm Cham Cham Cherokee Cher Common Zyyy Coptic Copt Qaac Cuneiform Xsux Cypriot Cprt Cyrillic Cyrl Deseret Dsrt Devanagari Deva Duployan Dupl Egyptian_Hieroglyphs Egyp Elbasan Elba Ethiopic Ethi Georgian Geor Glagolitic Glag Gothic Goth Grantha Gran Greek Grek Gujarati Gujr Gurmukhi Guru Han Hani Hangul Hang Hanunoo Hano Hatran Hatr Hebrew Hebr Hiragana Hira Imperial_Aramaic Armi Inherited Zinh Qaai Inscriptional_Pahlavi Phli Inscriptional_Parthian Prti Javanese Java Kaithi Kthi Kannada Knda Katakana Kana Kayah_Li Kali Kharoshthi Khar Khmer Khmr Khojki Khoj Khudawadi Sind Lao Laoo Latin Latn Lepcha Lepc Limbu Limb Linear_A Lina Linear_B Linb Lisu Lisu Lycian Lyci Lydian Lydi Mahajani Mahj Malayalam Mlym Mandaic Mand Manichaean Mani Marchen Marc Masaram_Gondi Gonm Meetei_Mayek Mtei Mende_Kikakui Mend Meroitic_Cursive Merc Meroitic_Hieroglyphs Mero Miao Plrd Modi Mongolian Mong Mro Mroo Multani Mult Myanmar Mymr Nabataean Nbat New_Tai_Lue Talu Newa Newa Nko Nkoo Nushu Nshu Ogham Ogam Ol_Chiki Olck Old_Hungarian Hung Old_Italic Ital Old_North_Arabian Narb Old_Permic Perm Old_Persian Xpeo Old_South_Arabian Sarb Old_Turkic Orkh Oriya Orya Osage Osge Osmanya Osma Pahawh_Hmong Hmng Palmyrene Palm Pau_Cin_Hau Pauc Phags_Pa Phag Phoenician Phnx Psalter_Pahlavi Phlp Rejang Rjng Runic Runr Samaritan Samr Saurashtra Saur Sharada Shrd Shavian Shaw Siddham Sidd SignWriting Sgnw Sinhala Sinh Sora_Sompeng Sora Soyombo Soyo Sundanese Sund Syloti_Nagri Sylo Syriac Syrc Tagalog Tglg Tagbanwa Tagb Tai_Le Tale Tai_Tham Lana Tai_Viet Tavt Takri Takr Tamil Taml Tangut Tang Telugu Telu Thaana Thaa Thai Thai Tibetan Tibt Tifinagh Tfng Tirhuta Tirh Ugaritic Ugar Vai Vaii Warang_Citi Wara Yi Yiii Zanabazar_Square Zanb";
  var ecma10ScriptValues = ecma9ScriptValues + " Dogra Dogr Gunjala_Gondi Gong Hanifi_Rohingya Rohg Makasar Maka Medefaidrin Medf Old_Sogdian Sogo Sogdian Sogd";
  var ecma11ScriptValues = ecma10ScriptValues + " Elymaic Elym Nandinagari Nand Nyiakeng_Puachue_Hmong Hmnp Wancho Wcho";
  var ecma12ScriptValues = ecma11ScriptValues + " Chorasmian Chrs Diak Dives_Akuru Khitan_Small_Script Kits Yezi Yezidi";
  var ecma13ScriptValues = ecma12ScriptValues + " Cypro_Minoan Cpmn Old_Uyghur Ougr Tangsa Tnsa Toto Vithkuqi Vith";
  var ecma14ScriptValues = ecma13ScriptValues + " " + scriptValuesAddedInUnicode;

  var unicodeScriptValues = {
    9: ecma9ScriptValues,
    10: ecma10ScriptValues,
    11: ecma11ScriptValues,
    12: ecma12ScriptValues,
    13: ecma13ScriptValues,
    14: ecma14ScriptValues
  };

  var data = {};
  function buildUnicodeData(ecmaVersion) {
    var d = data[ecmaVersion] = {
      binary: wordsRegexp(unicodeBinaryProperties[ecmaVersion] + " " + unicodeGeneralCategoryValues),
      binaryOfStrings: wordsRegexp(unicodeBinaryPropertiesOfStrings[ecmaVersion]),
      nonBinary: {
        General_Category: wordsRegexp(unicodeGeneralCategoryValues),
        Script: wordsRegexp(unicodeScriptValues[ecmaVersion])
      }
    };
    d.nonBinary.Script_Extensions = d.nonBinary.Script;

    d.nonBinary.gc = d.nonBinary.General_Category;
    d.nonBinary.sc = d.nonBinary.Script;
    d.nonBinary.scx = d.nonBinary.Script_Extensions;
  }

  for (var i = 0, list = [9, 10, 11, 12, 13, 14]; i < list.length; i += 1) {
    var ecmaVersion = list[i];

    buildUnicodeData(ecmaVersion);
  }

  var pp$1 = Parser.prototype;

  // Track disjunction structure to determine whether a duplicate
  // capture group name is allowed because it is in a separate branch.
  var BranchID = function BranchID(parent, base) {
    // Parent disjunction branch
    this.parent = parent;
    // Identifies this set of sibling branches
    this.base = base || this;
  };

  BranchID.prototype.separatedFrom = function separatedFrom (alt) {
    // A branch is separate from another branch if they or any of
    // their parents are siblings in a given disjunction
    for (var self = this; self; self = self.parent) {
      for (var other = alt; other; other = other.parent) {
        if (self.base === other.base && self !== other) { return true }
      }
    }
    return false
  };

  BranchID.prototype.sibling = function sibling () {
    return new BranchID(this.parent, this.base)
  };

  var RegExpValidationState = function RegExpValidationState(parser) {
    this.parser = parser;
    this.validFlags = "gim" + (parser.options.ecmaVersion >= 6 ? "uy" : "") + (parser.options.ecmaVersion >= 9 ? "s" : "") + (parser.options.ecmaVersion >= 13 ? "d" : "") + (parser.options.ecmaVersion >= 15 ? "v" : "");
    this.unicodeProperties = data[parser.options.ecmaVersion >= 14 ? 14 : parser.options.ecmaVersion];
    this.source = "";
    this.flags = "";
    this.start = 0;
    this.switchU = false;
    this.switchV = false;
    this.switchN = false;
    this.pos = 0;
    this.lastIntValue = 0;
    this.lastStringValue = "";
    this.lastAssertionIsQuantifiable = false;
    this.numCapturingParens = 0;
    this.maxBackReference = 0;
    this.groupNames = Object.create(null);
    this.backReferenceNames = [];
    this.branchID = null;
  };

  RegExpValidationState.prototype.reset = function reset (start, pattern, flags) {
    var unicodeSets = flags.indexOf("v") !== -1;
    var unicode = flags.indexOf("u") !== -1;
    this.start = start | 0;
    this.source = pattern + "";
    this.flags = flags;
    if (unicodeSets && this.parser.options.ecmaVersion >= 15) {
      this.switchU = true;
      this.switchV = true;
      this.switchN = true;
    } else {
      this.switchU = unicode && this.parser.options.ecmaVersion >= 6;
      this.switchV = false;
      this.switchN = unicode && this.parser.options.ecmaVersion >= 9;
    }
  };

  RegExpValidationState.prototype.raise = function raise (message) {
    this.parser.raiseRecoverable(this.start, ("Invalid regular expression: /" + (this.source) + "/: " + message));
  };

  // If u flag is given, this returns the code point at the index (it combines a surrogate pair).
  // Otherwise, this returns the code unit of the index (can be a part of a surrogate pair).
  RegExpValidationState.prototype.at = function at (i, forceU) {
      if ( forceU === void 0 ) forceU = false;

    var s = this.source;
    var l = s.length;
    if (i >= l) {
      return -1
    }
    var c = s.charCodeAt(i);
    if (!(forceU || this.switchU) || c <= 0xD7FF || c >= 0xE000 || i + 1 >= l) {
      return c
    }
    var next = s.charCodeAt(i + 1);
    return next >= 0xDC00 && next <= 0xDFFF ? (c << 10) + next - 0x35FDC00 : c
  };

  RegExpValidationState.prototype.nextIndex = function nextIndex (i, forceU) {
      if ( forceU === void 0 ) forceU = false;

    var s = this.source;
    var l = s.length;
    if (i >= l) {
      return l
    }
    var c = s.charCodeAt(i), next;
    if (!(forceU || this.switchU) || c <= 0xD7FF || c >= 0xE000 || i + 1 >= l ||
        (next = s.charCodeAt(i + 1)) < 0xDC00 || next > 0xDFFF) {
      return i + 1
    }
    return i + 2
  };

  RegExpValidationState.prototype.current = function current (forceU) {
      if ( forceU === void 0 ) forceU = false;

    return this.at(this.pos, forceU)
  };

  RegExpValidationState.prototype.lookahead = function lookahead (forceU) {
      if ( forceU === void 0 ) forceU = false;

    return this.at(this.nextIndex(this.pos, forceU), forceU)
  };

  RegExpValidationState.prototype.advance = function advance (forceU) {
      if ( forceU === void 0 ) forceU = false;

    this.pos = this.nextIndex(this.pos, forceU);
  };

  RegExpValidationState.prototype.eat = function eat (ch, forceU) {
      if ( forceU === void 0 ) forceU = false;

    if (this.current(forceU) === ch) {
      this.advance(forceU);
      return true
    }
    return false
  };

  RegExpValidationState.prototype.eatChars = function eatChars (chs, forceU) {
      if ( forceU === void 0 ) forceU = false;

    var pos = this.pos;
    for (var i = 0, list = chs; i < list.length; i += 1) {
      var ch = list[i];

        var current = this.at(pos, forceU);
      if (current === -1 || current !== ch) {
        return false
      }
      pos = this.nextIndex(pos, forceU);
    }
    this.pos = pos;
    return true
  };

  /**
   * Validate the flags part of a given RegExpLiteral.
   *
   * @param {RegExpValidationState} state The state to validate RegExp.
   * @returns {void}
   */
  pp$1.validateRegExpFlags = function(state) {
    var validFlags = state.validFlags;
    var flags = state.flags;

    var u = false;
    var v = false;

    for (var i = 0; i < flags.length; i++) {
      var flag = flags.charAt(i);
      if (validFlags.indexOf(flag) === -1) {
        this.raise(state.start, "Invalid regular expression flag");
      }
      if (flags.indexOf(flag, i + 1) > -1) {
        this.raise(state.start, "Duplicate regular expression flag");
      }
      if (flag === "u") { u = true; }
      if (flag === "v") { v = true; }
    }
    if (this.options.ecmaVersion >= 15 && u && v) {
      this.raise(state.start, "Invalid regular expression flag");
    }
  };

  function hasProp(obj) {
    for (var _ in obj) { return true }
    return false
  }

  /**
   * Validate the pattern part of a given RegExpLiteral.
   *
   * @param {RegExpValidationState} state The state to validate RegExp.
   * @returns {void}
   */
  pp$1.validateRegExpPattern = function(state) {
    this.regexp_pattern(state);

    // The goal symbol for the parse is |Pattern[~U, ~N]|. If the result of
    // parsing contains a |GroupName|, reparse with the goal symbol
    // |Pattern[~U, +N]| and use this result instead. Throw a *SyntaxError*
    // exception if _P_ did not conform to the grammar, if any elements of _P_
    // were not matched by the parse, or if any Early Error conditions exist.
    if (!state.switchN && this.options.ecmaVersion >= 9 && hasProp(state.groupNames)) {
      state.switchN = true;
      this.regexp_pattern(state);
    }
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-Pattern
  pp$1.regexp_pattern = function(state) {
    state.pos = 0;
    state.lastIntValue = 0;
    state.lastStringValue = "";
    state.lastAssertionIsQuantifiable = false;
    state.numCapturingParens = 0;
    state.maxBackReference = 0;
    state.groupNames = Object.create(null);
    state.backReferenceNames.length = 0;
    state.branchID = null;

    this.regexp_disjunction(state);

    if (state.pos !== state.source.length) {
      // Make the same messages as V8.
      if (state.eat(0x29 /* ) */)) {
        state.raise("Unmatched ')'");
      }
      if (state.eat(0x5D /* ] */) || state.eat(0x7D /* } */)) {
        state.raise("Lone quantifier brackets");
      }
    }
    if (state.maxBackReference > state.numCapturingParens) {
      state.raise("Invalid escape");
    }
    for (var i = 0, list = state.backReferenceNames; i < list.length; i += 1) {
      var name = list[i];

      if (!state.groupNames[name]) {
        state.raise("Invalid named capture referenced");
      }
    }
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-Disjunction
  pp$1.regexp_disjunction = function(state) {
    var trackDisjunction = this.options.ecmaVersion >= 16;
    if (trackDisjunction) { state.branchID = new BranchID(state.branchID, null); }
    this.regexp_alternative(state);
    while (state.eat(0x7C /* | */)) {
      if (trackDisjunction) { state.branchID = state.branchID.sibling(); }
      this.regexp_alternative(state);
    }
    if (trackDisjunction) { state.branchID = state.branchID.parent; }

    // Make the same message as V8.
    if (this.regexp_eatQuantifier(state, true)) {
      state.raise("Nothing to repeat");
    }
    if (state.eat(0x7B /* { */)) {
      state.raise("Lone quantifier brackets");
    }
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-Alternative
  pp$1.regexp_alternative = function(state) {
    while (state.pos < state.source.length && this.regexp_eatTerm(state)) {}
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-Term
  pp$1.regexp_eatTerm = function(state) {
    if (this.regexp_eatAssertion(state)) {
      // Handle `QuantifiableAssertion Quantifier` alternative.
      // `state.lastAssertionIsQuantifiable` is true if the last eaten Assertion
      // is a QuantifiableAssertion.
      if (state.lastAssertionIsQuantifiable && this.regexp_eatQuantifier(state)) {
        // Make the same message as V8.
        if (state.switchU) {
          state.raise("Invalid quantifier");
        }
      }
      return true
    }

    if (state.switchU ? this.regexp_eatAtom(state) : this.regexp_eatExtendedAtom(state)) {
      this.regexp_eatQuantifier(state);
      return true
    }

    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-Assertion
  pp$1.regexp_eatAssertion = function(state) {
    var start = state.pos;
    state.lastAssertionIsQuantifiable = false;

    // ^, $
    if (state.eat(0x5E /* ^ */) || state.eat(0x24 /* $ */)) {
      return true
    }

    // \b \B
    if (state.eat(0x5C /* \ */)) {
      if (state.eat(0x42 /* B */) || state.eat(0x62 /* b */)) {
        return true
      }
      state.pos = start;
    }

    // Lookahead / Lookbehind
    if (state.eat(0x28 /* ( */) && state.eat(0x3F /* ? */)) {
      var lookbehind = false;
      if (this.options.ecmaVersion >= 9) {
        lookbehind = state.eat(0x3C /* < */);
      }
      if (state.eat(0x3D /* = */) || state.eat(0x21 /* ! */)) {
        this.regexp_disjunction(state);
        if (!state.eat(0x29 /* ) */)) {
          state.raise("Unterminated group");
        }
        state.lastAssertionIsQuantifiable = !lookbehind;
        return true
      }
    }

    state.pos = start;
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-Quantifier
  pp$1.regexp_eatQuantifier = function(state, noError) {
    if ( noError === void 0 ) noError = false;

    if (this.regexp_eatQuantifierPrefix(state, noError)) {
      state.eat(0x3F /* ? */);
      return true
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-QuantifierPrefix
  pp$1.regexp_eatQuantifierPrefix = function(state, noError) {
    return (
      state.eat(0x2A /* * */) ||
      state.eat(0x2B /* + */) ||
      state.eat(0x3F /* ? */) ||
      this.regexp_eatBracedQuantifier(state, noError)
    )
  };
  pp$1.regexp_eatBracedQuantifier = function(state, noError) {
    var start = state.pos;
    if (state.eat(0x7B /* { */)) {
      var min = 0, max = -1;
      if (this.regexp_eatDecimalDigits(state)) {
        min = state.lastIntValue;
        if (state.eat(0x2C /* , */) && this.regexp_eatDecimalDigits(state)) {
          max = state.lastIntValue;
        }
        if (state.eat(0x7D /* } */)) {
          // SyntaxError in https://www.ecma-international.org/ecma-262/8.0/#sec-term
          if (max !== -1 && max < min && !noError) {
            state.raise("numbers out of order in {} quantifier");
          }
          return true
        }
      }
      if (state.switchU && !noError) {
        state.raise("Incomplete quantifier");
      }
      state.pos = start;
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-Atom
  pp$1.regexp_eatAtom = function(state) {
    return (
      this.regexp_eatPatternCharacters(state) ||
      state.eat(0x2E /* . */) ||
      this.regexp_eatReverseSolidusAtomEscape(state) ||
      this.regexp_eatCharacterClass(state) ||
      this.regexp_eatUncapturingGroup(state) ||
      this.regexp_eatCapturingGroup(state)
    )
  };
  pp$1.regexp_eatReverseSolidusAtomEscape = function(state) {
    var start = state.pos;
    if (state.eat(0x5C /* \ */)) {
      if (this.regexp_eatAtomEscape(state)) {
        return true
      }
      state.pos = start;
    }
    return false
  };
  pp$1.regexp_eatUncapturingGroup = function(state) {
    var start = state.pos;
    if (state.eat(0x28 /* ( */)) {
      if (state.eat(0x3F /* ? */)) {
        if (this.options.ecmaVersion >= 16) {
          var addModifiers = this.regexp_eatModifiers(state);
          var hasHyphen = state.eat(0x2D /* - */);
          if (addModifiers || hasHyphen) {
            for (var i = 0; i < addModifiers.length; i++) {
              var modifier = addModifiers.charAt(i);
              if (addModifiers.indexOf(modifier, i + 1) > -1) {
                state.raise("Duplicate regular expression modifiers");
              }
            }
            if (hasHyphen) {
              var removeModifiers = this.regexp_eatModifiers(state);
              if (!addModifiers && !removeModifiers && state.current() === 0x3A /* : */) {
                state.raise("Invalid regular expression modifiers");
              }
              for (var i$1 = 0; i$1 < removeModifiers.length; i$1++) {
                var modifier$1 = removeModifiers.charAt(i$1);
                if (
                  removeModifiers.indexOf(modifier$1, i$1 + 1) > -1 ||
                  addModifiers.indexOf(modifier$1) > -1
                ) {
                  state.raise("Duplicate regular expression modifiers");
                }
              }
            }
          }
        }
        if (state.eat(0x3A /* : */)) {
          this.regexp_disjunction(state);
          if (state.eat(0x29 /* ) */)) {
            return true
          }
          state.raise("Unterminated group");
        }
      }
      state.pos = start;
    }
    return false
  };
  pp$1.regexp_eatCapturingGroup = function(state) {
    if (state.eat(0x28 /* ( */)) {
      if (this.options.ecmaVersion >= 9) {
        this.regexp_groupSpecifier(state);
      } else if (state.current() === 0x3F /* ? */) {
        state.raise("Invalid group");
      }
      this.regexp_disjunction(state);
      if (state.eat(0x29 /* ) */)) {
        state.numCapturingParens += 1;
        return true
      }
      state.raise("Unterminated group");
    }
    return false
  };
  // RegularExpressionModifiers ::
  //   [empty]
  //   RegularExpressionModifiers RegularExpressionModifier
  pp$1.regexp_eatModifiers = function(state) {
    var modifiers = "";
    var ch = 0;
    while ((ch = state.current()) !== -1 && isRegularExpressionModifier(ch)) {
      modifiers += codePointToString(ch);
      state.advance();
    }
    return modifiers
  };
  // RegularExpressionModifier :: one of
  //   `i` `m` `s`
  function isRegularExpressionModifier(ch) {
    return ch === 0x69 /* i */ || ch === 0x6d /* m */ || ch === 0x73 /* s */
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ExtendedAtom
  pp$1.regexp_eatExtendedAtom = function(state) {
    return (
      state.eat(0x2E /* . */) ||
      this.regexp_eatReverseSolidusAtomEscape(state) ||
      this.regexp_eatCharacterClass(state) ||
      this.regexp_eatUncapturingGroup(state) ||
      this.regexp_eatCapturingGroup(state) ||
      this.regexp_eatInvalidBracedQuantifier(state) ||
      this.regexp_eatExtendedPatternCharacter(state)
    )
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-InvalidBracedQuantifier
  pp$1.regexp_eatInvalidBracedQuantifier = function(state) {
    if (this.regexp_eatBracedQuantifier(state, true)) {
      state.raise("Nothing to repeat");
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-SyntaxCharacter
  pp$1.regexp_eatSyntaxCharacter = function(state) {
    var ch = state.current();
    if (isSyntaxCharacter(ch)) {
      state.lastIntValue = ch;
      state.advance();
      return true
    }
    return false
  };
  function isSyntaxCharacter(ch) {
    return (
      ch === 0x24 /* $ */ ||
      ch >= 0x28 /* ( */ && ch <= 0x2B /* + */ ||
      ch === 0x2E /* . */ ||
      ch === 0x3F /* ? */ ||
      ch >= 0x5B /* [ */ && ch <= 0x5E /* ^ */ ||
      ch >= 0x7B /* { */ && ch <= 0x7D /* } */
    )
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-PatternCharacter
  // But eat eager.
  pp$1.regexp_eatPatternCharacters = function(state) {
    var start = state.pos;
    var ch = 0;
    while ((ch = state.current()) !== -1 && !isSyntaxCharacter(ch)) {
      state.advance();
    }
    return state.pos !== start
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ExtendedPatternCharacter
  pp$1.regexp_eatExtendedPatternCharacter = function(state) {
    var ch = state.current();
    if (
      ch !== -1 &&
      ch !== 0x24 /* $ */ &&
      !(ch >= 0x28 /* ( */ && ch <= 0x2B /* + */) &&
      ch !== 0x2E /* . */ &&
      ch !== 0x3F /* ? */ &&
      ch !== 0x5B /* [ */ &&
      ch !== 0x5E /* ^ */ &&
      ch !== 0x7C /* | */
    ) {
      state.advance();
      return true
    }
    return false
  };

  // GroupSpecifier ::
  //   [empty]
  //   `?` GroupName
  pp$1.regexp_groupSpecifier = function(state) {
    if (state.eat(0x3F /* ? */)) {
      if (!this.regexp_eatGroupName(state)) { state.raise("Invalid group"); }
      var trackDisjunction = this.options.ecmaVersion >= 16;
      var known = state.groupNames[state.lastStringValue];
      if (known) {
        if (trackDisjunction) {
          for (var i = 0, list = known; i < list.length; i += 1) {
            var altID = list[i];

            if (!altID.separatedFrom(state.branchID))
              { state.raise("Duplicate capture group name"); }
          }
        } else {
          state.raise("Duplicate capture group name");
        }
      }
      if (trackDisjunction) {
        (known || (state.groupNames[state.lastStringValue] = [])).push(state.branchID);
      } else {
        state.groupNames[state.lastStringValue] = true;
      }
    }
  };

  // GroupName ::
  //   `<` RegExpIdentifierName `>`
  // Note: this updates `state.lastStringValue` property with the eaten name.
  pp$1.regexp_eatGroupName = function(state) {
    state.lastStringValue = "";
    if (state.eat(0x3C /* < */)) {
      if (this.regexp_eatRegExpIdentifierName(state) && state.eat(0x3E /* > */)) {
        return true
      }
      state.raise("Invalid capture group name");
    }
    return false
  };

  // RegExpIdentifierName ::
  //   RegExpIdentifierStart
  //   RegExpIdentifierName RegExpIdentifierPart
  // Note: this updates `state.lastStringValue` property with the eaten name.
  pp$1.regexp_eatRegExpIdentifierName = function(state) {
    state.lastStringValue = "";
    if (this.regexp_eatRegExpIdentifierStart(state)) {
      state.lastStringValue += codePointToString(state.lastIntValue);
      while (this.regexp_eatRegExpIdentifierPart(state)) {
        state.lastStringValue += codePointToString(state.lastIntValue);
      }
      return true
    }
    return false
  };

  // RegExpIdentifierStart ::
  //   UnicodeIDStart
  //   `$`
  //   `_`
  //   `\` RegExpUnicodeEscapeSequence[+U]
  pp$1.regexp_eatRegExpIdentifierStart = function(state) {
    var start = state.pos;
    var forceU = this.options.ecmaVersion >= 11;
    var ch = state.current(forceU);
    state.advance(forceU);

    if (ch === 0x5C /* \ */ && this.regexp_eatRegExpUnicodeEscapeSequence(state, forceU)) {
      ch = state.lastIntValue;
    }
    if (isRegExpIdentifierStart(ch)) {
      state.lastIntValue = ch;
      return true
    }

    state.pos = start;
    return false
  };
  function isRegExpIdentifierStart(ch) {
    return isIdentifierStart(ch, true) || ch === 0x24 /* $ */ || ch === 0x5F /* _ */
  }

  // RegExpIdentifierPart ::
  //   UnicodeIDContinue
  //   `$`
  //   `_`
  //   `\` RegExpUnicodeEscapeSequence[+U]
  //   <ZWNJ>
  //   <ZWJ>
  pp$1.regexp_eatRegExpIdentifierPart = function(state) {
    var start = state.pos;
    var forceU = this.options.ecmaVersion >= 11;
    var ch = state.current(forceU);
    state.advance(forceU);

    if (ch === 0x5C /* \ */ && this.regexp_eatRegExpUnicodeEscapeSequence(state, forceU)) {
      ch = state.lastIntValue;
    }
    if (isRegExpIdentifierPart(ch)) {
      state.lastIntValue = ch;
      return true
    }

    state.pos = start;
    return false
  };
  function isRegExpIdentifierPart(ch) {
    return isIdentifierChar(ch, true) || ch === 0x24 /* $ */ || ch === 0x5F /* _ */ || ch === 0x200C /* <ZWNJ> */ || ch === 0x200D /* <ZWJ> */
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-AtomEscape
  pp$1.regexp_eatAtomEscape = function(state) {
    if (
      this.regexp_eatBackReference(state) ||
      this.regexp_eatCharacterClassEscape(state) ||
      this.regexp_eatCharacterEscape(state) ||
      (state.switchN && this.regexp_eatKGroupName(state))
    ) {
      return true
    }
    if (state.switchU) {
      // Make the same message as V8.
      if (state.current() === 0x63 /* c */) {
        state.raise("Invalid unicode escape");
      }
      state.raise("Invalid escape");
    }
    return false
  };
  pp$1.regexp_eatBackReference = function(state) {
    var start = state.pos;
    if (this.regexp_eatDecimalEscape(state)) {
      var n = state.lastIntValue;
      if (state.switchU) {
        // For SyntaxError in https://www.ecma-international.org/ecma-262/8.0/#sec-atomescape
        if (n > state.maxBackReference) {
          state.maxBackReference = n;
        }
        return true
      }
      if (n <= state.numCapturingParens) {
        return true
      }
      state.pos = start;
    }
    return false
  };
  pp$1.regexp_eatKGroupName = function(state) {
    if (state.eat(0x6B /* k */)) {
      if (this.regexp_eatGroupName(state)) {
        state.backReferenceNames.push(state.lastStringValue);
        return true
      }
      state.raise("Invalid named reference");
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-CharacterEscape
  pp$1.regexp_eatCharacterEscape = function(state) {
    return (
      this.regexp_eatControlEscape(state) ||
      this.regexp_eatCControlLetter(state) ||
      this.regexp_eatZero(state) ||
      this.regexp_eatHexEscapeSequence(state) ||
      this.regexp_eatRegExpUnicodeEscapeSequence(state, false) ||
      (!state.switchU && this.regexp_eatLegacyOctalEscapeSequence(state)) ||
      this.regexp_eatIdentityEscape(state)
    )
  };
  pp$1.regexp_eatCControlLetter = function(state) {
    var start = state.pos;
    if (state.eat(0x63 /* c */)) {
      if (this.regexp_eatControlLetter(state)) {
        return true
      }
      state.pos = start;
    }
    return false
  };
  pp$1.regexp_eatZero = function(state) {
    if (state.current() === 0x30 /* 0 */ && !isDecimalDigit(state.lookahead())) {
      state.lastIntValue = 0;
      state.advance();
      return true
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-ControlEscape
  pp$1.regexp_eatControlEscape = function(state) {
    var ch = state.current();
    if (ch === 0x74 /* t */) {
      state.lastIntValue = 0x09; /* \t */
      state.advance();
      return true
    }
    if (ch === 0x6E /* n */) {
      state.lastIntValue = 0x0A; /* \n */
      state.advance();
      return true
    }
    if (ch === 0x76 /* v */) {
      state.lastIntValue = 0x0B; /* \v */
      state.advance();
      return true
    }
    if (ch === 0x66 /* f */) {
      state.lastIntValue = 0x0C; /* \f */
      state.advance();
      return true
    }
    if (ch === 0x72 /* r */) {
      state.lastIntValue = 0x0D; /* \r */
      state.advance();
      return true
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-ControlLetter
  pp$1.regexp_eatControlLetter = function(state) {
    var ch = state.current();
    if (isControlLetter(ch)) {
      state.lastIntValue = ch % 0x20;
      state.advance();
      return true
    }
    return false
  };
  function isControlLetter(ch) {
    return (
      (ch >= 0x41 /* A */ && ch <= 0x5A /* Z */) ||
      (ch >= 0x61 /* a */ && ch <= 0x7A /* z */)
    )
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-RegExpUnicodeEscapeSequence
  pp$1.regexp_eatRegExpUnicodeEscapeSequence = function(state, forceU) {
    if ( forceU === void 0 ) forceU = false;

    var start = state.pos;
    var switchU = forceU || state.switchU;

    if (state.eat(0x75 /* u */)) {
      if (this.regexp_eatFixedHexDigits(state, 4)) {
        var lead = state.lastIntValue;
        if (switchU && lead >= 0xD800 && lead <= 0xDBFF) {
          var leadSurrogateEnd = state.pos;
          if (state.eat(0x5C /* \ */) && state.eat(0x75 /* u */) && this.regexp_eatFixedHexDigits(state, 4)) {
            var trail = state.lastIntValue;
            if (trail >= 0xDC00 && trail <= 0xDFFF) {
              state.lastIntValue = (lead - 0xD800) * 0x400 + (trail - 0xDC00) + 0x10000;
              return true
            }
          }
          state.pos = leadSurrogateEnd;
          state.lastIntValue = lead;
        }
        return true
      }
      if (
        switchU &&
        state.eat(0x7B /* { */) &&
        this.regexp_eatHexDigits(state) &&
        state.eat(0x7D /* } */) &&
        isValidUnicode(state.lastIntValue)
      ) {
        return true
      }
      if (switchU) {
        state.raise("Invalid unicode escape");
      }
      state.pos = start;
    }

    return false
  };
  function isValidUnicode(ch) {
    return ch >= 0 && ch <= 0x10FFFF
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-IdentityEscape
  pp$1.regexp_eatIdentityEscape = function(state) {
    if (state.switchU) {
      if (this.regexp_eatSyntaxCharacter(state)) {
        return true
      }
      if (state.eat(0x2F /* / */)) {
        state.lastIntValue = 0x2F; /* / */
        return true
      }
      return false
    }

    var ch = state.current();
    if (ch !== 0x63 /* c */ && (!state.switchN || ch !== 0x6B /* k */)) {
      state.lastIntValue = ch;
      state.advance();
      return true
    }

    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-DecimalEscape
  pp$1.regexp_eatDecimalEscape = function(state) {
    state.lastIntValue = 0;
    var ch = state.current();
    if (ch >= 0x31 /* 1 */ && ch <= 0x39 /* 9 */) {
      do {
        state.lastIntValue = 10 * state.lastIntValue + (ch - 0x30 /* 0 */);
        state.advance();
      } while ((ch = state.current()) >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */)
      return true
    }
    return false
  };

  // Return values used by character set parsing methods, needed to
  // forbid negation of sets that can match strings.
  var CharSetNone = 0; // Nothing parsed
  var CharSetOk = 1; // Construct parsed, cannot contain strings
  var CharSetString = 2; // Construct parsed, can contain strings

  // https://www.ecma-international.org/ecma-262/8.0/#prod-CharacterClassEscape
  pp$1.regexp_eatCharacterClassEscape = function(state) {
    var ch = state.current();

    if (isCharacterClassEscape(ch)) {
      state.lastIntValue = -1;
      state.advance();
      return CharSetOk
    }

    var negate = false;
    if (
      state.switchU &&
      this.options.ecmaVersion >= 9 &&
      ((negate = ch === 0x50 /* P */) || ch === 0x70 /* p */)
    ) {
      state.lastIntValue = -1;
      state.advance();
      var result;
      if (
        state.eat(0x7B /* { */) &&
        (result = this.regexp_eatUnicodePropertyValueExpression(state)) &&
        state.eat(0x7D /* } */)
      ) {
        if (negate && result === CharSetString) { state.raise("Invalid property name"); }
        return result
      }
      state.raise("Invalid property name");
    }

    return CharSetNone
  };

  function isCharacterClassEscape(ch) {
    return (
      ch === 0x64 /* d */ ||
      ch === 0x44 /* D */ ||
      ch === 0x73 /* s */ ||
      ch === 0x53 /* S */ ||
      ch === 0x77 /* w */ ||
      ch === 0x57 /* W */
    )
  }

  // UnicodePropertyValueExpression ::
  //   UnicodePropertyName `=` UnicodePropertyValue
  //   LoneUnicodePropertyNameOrValue
  pp$1.regexp_eatUnicodePropertyValueExpression = function(state) {
    var start = state.pos;

    // UnicodePropertyName `=` UnicodePropertyValue
    if (this.regexp_eatUnicodePropertyName(state) && state.eat(0x3D /* = */)) {
      var name = state.lastStringValue;
      if (this.regexp_eatUnicodePropertyValue(state)) {
        var value = state.lastStringValue;
        this.regexp_validateUnicodePropertyNameAndValue(state, name, value);
        return CharSetOk
      }
    }
    state.pos = start;

    // LoneUnicodePropertyNameOrValue
    if (this.regexp_eatLoneUnicodePropertyNameOrValue(state)) {
      var nameOrValue = state.lastStringValue;
      return this.regexp_validateUnicodePropertyNameOrValue(state, nameOrValue)
    }
    return CharSetNone
  };

  pp$1.regexp_validateUnicodePropertyNameAndValue = function(state, name, value) {
    if (!hasOwn(state.unicodeProperties.nonBinary, name))
      { state.raise("Invalid property name"); }
    if (!state.unicodeProperties.nonBinary[name].test(value))
      { state.raise("Invalid property value"); }
  };

  pp$1.regexp_validateUnicodePropertyNameOrValue = function(state, nameOrValue) {
    if (state.unicodeProperties.binary.test(nameOrValue)) { return CharSetOk }
    if (state.switchV && state.unicodeProperties.binaryOfStrings.test(nameOrValue)) { return CharSetString }
    state.raise("Invalid property name");
  };

  // UnicodePropertyName ::
  //   UnicodePropertyNameCharacters
  pp$1.regexp_eatUnicodePropertyName = function(state) {
    var ch = 0;
    state.lastStringValue = "";
    while (isUnicodePropertyNameCharacter(ch = state.current())) {
      state.lastStringValue += codePointToString(ch);
      state.advance();
    }
    return state.lastStringValue !== ""
  };

  function isUnicodePropertyNameCharacter(ch) {
    return isControlLetter(ch) || ch === 0x5F /* _ */
  }

  // UnicodePropertyValue ::
  //   UnicodePropertyValueCharacters
  pp$1.regexp_eatUnicodePropertyValue = function(state) {
    var ch = 0;
    state.lastStringValue = "";
    while (isUnicodePropertyValueCharacter(ch = state.current())) {
      state.lastStringValue += codePointToString(ch);
      state.advance();
    }
    return state.lastStringValue !== ""
  };
  function isUnicodePropertyValueCharacter(ch) {
    return isUnicodePropertyNameCharacter(ch) || isDecimalDigit(ch)
  }

  // LoneUnicodePropertyNameOrValue ::
  //   UnicodePropertyValueCharacters
  pp$1.regexp_eatLoneUnicodePropertyNameOrValue = function(state) {
    return this.regexp_eatUnicodePropertyValue(state)
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-CharacterClass
  pp$1.regexp_eatCharacterClass = function(state) {
    if (state.eat(0x5B /* [ */)) {
      var negate = state.eat(0x5E /* ^ */);
      var result = this.regexp_classContents(state);
      if (!state.eat(0x5D /* ] */))
        { state.raise("Unterminated character class"); }
      if (negate && result === CharSetString)
        { state.raise("Negated character class may contain strings"); }
      return true
    }
    return false
  };

  // https://tc39.es/ecma262/#prod-ClassContents
  // https://www.ecma-international.org/ecma-262/8.0/#prod-ClassRanges
  pp$1.regexp_classContents = function(state) {
    if (state.current() === 0x5D /* ] */) { return CharSetOk }
    if (state.switchV) { return this.regexp_classSetExpression(state) }
    this.regexp_nonEmptyClassRanges(state);
    return CharSetOk
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-NonemptyClassRanges
  // https://www.ecma-international.org/ecma-262/8.0/#prod-NonemptyClassRangesNoDash
  pp$1.regexp_nonEmptyClassRanges = function(state) {
    while (this.regexp_eatClassAtom(state)) {
      var left = state.lastIntValue;
      if (state.eat(0x2D /* - */) && this.regexp_eatClassAtom(state)) {
        var right = state.lastIntValue;
        if (state.switchU && (left === -1 || right === -1)) {
          state.raise("Invalid character class");
        }
        if (left !== -1 && right !== -1 && left > right) {
          state.raise("Range out of order in character class");
        }
      }
    }
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-ClassAtom
  // https://www.ecma-international.org/ecma-262/8.0/#prod-ClassAtomNoDash
  pp$1.regexp_eatClassAtom = function(state) {
    var start = state.pos;

    if (state.eat(0x5C /* \ */)) {
      if (this.regexp_eatClassEscape(state)) {
        return true
      }
      if (state.switchU) {
        // Make the same message as V8.
        var ch$1 = state.current();
        if (ch$1 === 0x63 /* c */ || isOctalDigit(ch$1)) {
          state.raise("Invalid class escape");
        }
        state.raise("Invalid escape");
      }
      state.pos = start;
    }

    var ch = state.current();
    if (ch !== 0x5D /* ] */) {
      state.lastIntValue = ch;
      state.advance();
      return true
    }

    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ClassEscape
  pp$1.regexp_eatClassEscape = function(state) {
    var start = state.pos;

    if (state.eat(0x62 /* b */)) {
      state.lastIntValue = 0x08; /* <BS> */
      return true
    }

    if (state.switchU && state.eat(0x2D /* - */)) {
      state.lastIntValue = 0x2D; /* - */
      return true
    }

    if (!state.switchU && state.eat(0x63 /* c */)) {
      if (this.regexp_eatClassControlLetter(state)) {
        return true
      }
      state.pos = start;
    }

    return (
      this.regexp_eatCharacterClassEscape(state) ||
      this.regexp_eatCharacterEscape(state)
    )
  };

  // https://tc39.es/ecma262/#prod-ClassSetExpression
  // https://tc39.es/ecma262/#prod-ClassUnion
  // https://tc39.es/ecma262/#prod-ClassIntersection
  // https://tc39.es/ecma262/#prod-ClassSubtraction
  pp$1.regexp_classSetExpression = function(state) {
    var result = CharSetOk, subResult;
    if (this.regexp_eatClassSetRange(state)) ; else if (subResult = this.regexp_eatClassSetOperand(state)) {
      if (subResult === CharSetString) { result = CharSetString; }
      // https://tc39.es/ecma262/#prod-ClassIntersection
      var start = state.pos;
      while (state.eatChars([0x26, 0x26] /* && */)) {
        if (
          state.current() !== 0x26 /* & */ &&
          (subResult = this.regexp_eatClassSetOperand(state))
        ) {
          if (subResult !== CharSetString) { result = CharSetOk; }
          continue
        }
        state.raise("Invalid character in character class");
      }
      if (start !== state.pos) { return result }
      // https://tc39.es/ecma262/#prod-ClassSubtraction
      while (state.eatChars([0x2D, 0x2D] /* -- */)) {
        if (this.regexp_eatClassSetOperand(state)) { continue }
        state.raise("Invalid character in character class");
      }
      if (start !== state.pos) { return result }
    } else {
      state.raise("Invalid character in character class");
    }
    // https://tc39.es/ecma262/#prod-ClassUnion
    for (;;) {
      if (this.regexp_eatClassSetRange(state)) { continue }
      subResult = this.regexp_eatClassSetOperand(state);
      if (!subResult) { return result }
      if (subResult === CharSetString) { result = CharSetString; }
    }
  };

  // https://tc39.es/ecma262/#prod-ClassSetRange
  pp$1.regexp_eatClassSetRange = function(state) {
    var start = state.pos;
    if (this.regexp_eatClassSetCharacter(state)) {
      var left = state.lastIntValue;
      if (state.eat(0x2D /* - */) && this.regexp_eatClassSetCharacter(state)) {
        var right = state.lastIntValue;
        if (left !== -1 && right !== -1 && left > right) {
          state.raise("Range out of order in character class");
        }
        return true
      }
      state.pos = start;
    }
    return false
  };

  // https://tc39.es/ecma262/#prod-ClassSetOperand
  pp$1.regexp_eatClassSetOperand = function(state) {
    if (this.regexp_eatClassSetCharacter(state)) { return CharSetOk }
    return this.regexp_eatClassStringDisjunction(state) || this.regexp_eatNestedClass(state)
  };

  // https://tc39.es/ecma262/#prod-NestedClass
  pp$1.regexp_eatNestedClass = function(state) {
    var start = state.pos;
    if (state.eat(0x5B /* [ */)) {
      var negate = state.eat(0x5E /* ^ */);
      var result = this.regexp_classContents(state);
      if (state.eat(0x5D /* ] */)) {
        if (negate && result === CharSetString) {
          state.raise("Negated character class may contain strings");
        }
        return result
      }
      state.pos = start;
    }
    if (state.eat(0x5C /* \ */)) {
      var result$1 = this.regexp_eatCharacterClassEscape(state);
      if (result$1) {
        return result$1
      }
      state.pos = start;
    }
    return null
  };

  // https://tc39.es/ecma262/#prod-ClassStringDisjunction
  pp$1.regexp_eatClassStringDisjunction = function(state) {
    var start = state.pos;
    if (state.eatChars([0x5C, 0x71] /* \q */)) {
      if (state.eat(0x7B /* { */)) {
        var result = this.regexp_classStringDisjunctionContents(state);
        if (state.eat(0x7D /* } */)) {
          return result
        }
      } else {
        // Make the same message as V8.
        state.raise("Invalid escape");
      }
      state.pos = start;
    }
    return null
  };

  // https://tc39.es/ecma262/#prod-ClassStringDisjunctionContents
  pp$1.regexp_classStringDisjunctionContents = function(state) {
    var result = this.regexp_classString(state);
    while (state.eat(0x7C /* | */)) {
      if (this.regexp_classString(state) === CharSetString) { result = CharSetString; }
    }
    return result
  };

  // https://tc39.es/ecma262/#prod-ClassString
  // https://tc39.es/ecma262/#prod-NonEmptyClassString
  pp$1.regexp_classString = function(state) {
    var count = 0;
    while (this.regexp_eatClassSetCharacter(state)) { count++; }
    return count === 1 ? CharSetOk : CharSetString
  };

  // https://tc39.es/ecma262/#prod-ClassSetCharacter
  pp$1.regexp_eatClassSetCharacter = function(state) {
    var start = state.pos;
    if (state.eat(0x5C /* \ */)) {
      if (
        this.regexp_eatCharacterEscape(state) ||
        this.regexp_eatClassSetReservedPunctuator(state)
      ) {
        return true
      }
      if (state.eat(0x62 /* b */)) {
        state.lastIntValue = 0x08; /* <BS> */
        return true
      }
      state.pos = start;
      return false
    }
    var ch = state.current();
    if (ch < 0 || ch === state.lookahead() && isClassSetReservedDoublePunctuatorCharacter(ch)) { return false }
    if (isClassSetSyntaxCharacter(ch)) { return false }
    state.advance();
    state.lastIntValue = ch;
    return true
  };

  // https://tc39.es/ecma262/#prod-ClassSetReservedDoublePunctuator
  function isClassSetReservedDoublePunctuatorCharacter(ch) {
    return (
      ch === 0x21 /* ! */ ||
      ch >= 0x23 /* # */ && ch <= 0x26 /* & */ ||
      ch >= 0x2A /* * */ && ch <= 0x2C /* , */ ||
      ch === 0x2E /* . */ ||
      ch >= 0x3A /* : */ && ch <= 0x40 /* @ */ ||
      ch === 0x5E /* ^ */ ||
      ch === 0x60 /* ` */ ||
      ch === 0x7E /* ~ */
    )
  }

  // https://tc39.es/ecma262/#prod-ClassSetSyntaxCharacter
  function isClassSetSyntaxCharacter(ch) {
    return (
      ch === 0x28 /* ( */ ||
      ch === 0x29 /* ) */ ||
      ch === 0x2D /* - */ ||
      ch === 0x2F /* / */ ||
      ch >= 0x5B /* [ */ && ch <= 0x5D /* ] */ ||
      ch >= 0x7B /* { */ && ch <= 0x7D /* } */
    )
  }

  // https://tc39.es/ecma262/#prod-ClassSetReservedPunctuator
  pp$1.regexp_eatClassSetReservedPunctuator = function(state) {
    var ch = state.current();
    if (isClassSetReservedPunctuator(ch)) {
      state.lastIntValue = ch;
      state.advance();
      return true
    }
    return false
  };

  // https://tc39.es/ecma262/#prod-ClassSetReservedPunctuator
  function isClassSetReservedPunctuator(ch) {
    return (
      ch === 0x21 /* ! */ ||
      ch === 0x23 /* # */ ||
      ch === 0x25 /* % */ ||
      ch === 0x26 /* & */ ||
      ch === 0x2C /* , */ ||
      ch === 0x2D /* - */ ||
      ch >= 0x3A /* : */ && ch <= 0x3E /* > */ ||
      ch === 0x40 /* @ */ ||
      ch === 0x60 /* ` */ ||
      ch === 0x7E /* ~ */
    )
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ClassControlLetter
  pp$1.regexp_eatClassControlLetter = function(state) {
    var ch = state.current();
    if (isDecimalDigit(ch) || ch === 0x5F /* _ */) {
      state.lastIntValue = ch % 0x20;
      state.advance();
      return true
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-HexEscapeSequence
  pp$1.regexp_eatHexEscapeSequence = function(state) {
    var start = state.pos;
    if (state.eat(0x78 /* x */)) {
      if (this.regexp_eatFixedHexDigits(state, 2)) {
        return true
      }
      if (state.switchU) {
        state.raise("Invalid escape");
      }
      state.pos = start;
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-DecimalDigits
  pp$1.regexp_eatDecimalDigits = function(state) {
    var start = state.pos;
    var ch = 0;
    state.lastIntValue = 0;
    while (isDecimalDigit(ch = state.current())) {
      state.lastIntValue = 10 * state.lastIntValue + (ch - 0x30 /* 0 */);
      state.advance();
    }
    return state.pos !== start
  };
  function isDecimalDigit(ch) {
    return ch >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-HexDigits
  pp$1.regexp_eatHexDigits = function(state) {
    var start = state.pos;
    var ch = 0;
    state.lastIntValue = 0;
    while (isHexDigit(ch = state.current())) {
      state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
      state.advance();
    }
    return state.pos !== start
  };
  function isHexDigit(ch) {
    return (
      (ch >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */) ||
      (ch >= 0x41 /* A */ && ch <= 0x46 /* F */) ||
      (ch >= 0x61 /* a */ && ch <= 0x66 /* f */)
    )
  }
  function hexToInt(ch) {
    if (ch >= 0x41 /* A */ && ch <= 0x46 /* F */) {
      return 10 + (ch - 0x41 /* A */)
    }
    if (ch >= 0x61 /* a */ && ch <= 0x66 /* f */) {
      return 10 + (ch - 0x61 /* a */)
    }
    return ch - 0x30 /* 0 */
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-LegacyOctalEscapeSequence
  // Allows only 0-377(octal) i.e. 0-255(decimal).
  pp$1.regexp_eatLegacyOctalEscapeSequence = function(state) {
    if (this.regexp_eatOctalDigit(state)) {
      var n1 = state.lastIntValue;
      if (this.regexp_eatOctalDigit(state)) {
        var n2 = state.lastIntValue;
        if (n1 <= 3 && this.regexp_eatOctalDigit(state)) {
          state.lastIntValue = n1 * 64 + n2 * 8 + state.lastIntValue;
        } else {
          state.lastIntValue = n1 * 8 + n2;
        }
      } else {
        state.lastIntValue = n1;
      }
      return true
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-OctalDigit
  pp$1.regexp_eatOctalDigit = function(state) {
    var ch = state.current();
    if (isOctalDigit(ch)) {
      state.lastIntValue = ch - 0x30; /* 0 */
      state.advance();
      return true
    }
    state.lastIntValue = 0;
    return false
  };
  function isOctalDigit(ch) {
    return ch >= 0x30 /* 0 */ && ch <= 0x37 /* 7 */
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-Hex4Digits
  // https://www.ecma-international.org/ecma-262/8.0/#prod-HexDigit
  // And HexDigit HexDigit in https://www.ecma-international.org/ecma-262/8.0/#prod-HexEscapeSequence
  pp$1.regexp_eatFixedHexDigits = function(state, length) {
    var start = state.pos;
    state.lastIntValue = 0;
    for (var i = 0; i < length; ++i) {
      var ch = state.current();
      if (!isHexDigit(ch)) {
        state.pos = start;
        return false
      }
      state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
      state.advance();
    }
    return true
  };

  // Object type used to represent tokens. Note that normally, tokens
  // simply exist as properties on the parser object. This is only
  // used for the onToken callback and the external tokenizer.

  var Token = function Token(p) {
    this.type = p.type;
    this.value = p.value;
    this.start = p.start;
    this.end = p.end;
    if (p.options.locations)
      { this.loc = new SourceLocation(p, p.startLoc, p.endLoc); }
    if (p.options.ranges)
      { this.range = [p.start, p.end]; }
  };

  // ## Tokenizer

  var pp = Parser.prototype;

  // Move to the next token

  pp.next = function(ignoreEscapeSequenceInKeyword) {
    if (!ignoreEscapeSequenceInKeyword && this.type.keyword && this.containsEsc)
      { this.raiseRecoverable(this.start, "Escape sequence in keyword " + this.type.keyword); }
    if (this.options.onToken)
      { this.options.onToken(new Token(this)); }

    this.lastTokEnd = this.end;
    this.lastTokStart = this.start;
    this.lastTokEndLoc = this.endLoc;
    this.lastTokStartLoc = this.startLoc;
    this.nextToken();
  };

  pp.getToken = function() {
    this.next();
    return new Token(this)
  };

  // If we're in an ES6 environment, make parsers iterable
  if (typeof Symbol !== "undefined")
    { pp[Symbol.iterator] = function() {
      var this$1$1 = this;

      return {
        next: function () {
          var token = this$1$1.getToken();
          return {
            done: token.type === types$1.eof,
            value: token
          }
        }
      }
    }; }

  // Toggle strict mode. Re-reads the next number or string to please
  // pedantic tests (`"use strict"; 010;` should fail).

  // Read a single token, updating the parser object's token-related
  // properties.

  pp.nextToken = function() {
    var curContext = this.curContext();
    if (!curContext || !curContext.preserveSpace) { this.skipSpace(); }

    this.start = this.pos;
    if (this.options.locations) { this.startLoc = this.curPosition(); }
    if (this.pos >= this.input.length) { return this.finishToken(types$1.eof) }

    if (curContext.override) { return curContext.override(this) }
    else { this.readToken(this.fullCharCodeAtPos()); }
  };

  pp.readToken = function(code) {
    // Identifier or keyword. '\uXXXX' sequences are allowed in
    // identifiers, so '\' also dispatches to that.
    if (isIdentifierStart(code, this.options.ecmaVersion >= 6) || code === 92 /* '\' */)
      { return this.readWord() }

    return this.getTokenFromCode(code)
  };

  pp.fullCharCodeAtPos = function() {
    var code = this.input.charCodeAt(this.pos);
    if (code <= 0xd7ff || code >= 0xdc00) { return code }
    var next = this.input.charCodeAt(this.pos + 1);
    return next <= 0xdbff || next >= 0xe000 ? code : (code << 10) + next - 0x35fdc00
  };

  pp.skipBlockComment = function() {
    var startLoc = this.options.onComment && this.curPosition();
    var start = this.pos, end = this.input.indexOf("*/", this.pos += 2);
    if (end === -1) { this.raise(this.pos - 2, "Unterminated comment"); }
    this.pos = end + 2;
    if (this.options.locations) {
      for (var nextBreak = (void 0), pos = start; (nextBreak = nextLineBreak(this.input, pos, this.pos)) > -1;) {
        ++this.curLine;
        pos = this.lineStart = nextBreak;
      }
    }
    if (this.options.onComment)
      { this.options.onComment(true, this.input.slice(start + 2, end), start, this.pos,
                             startLoc, this.curPosition()); }
  };

  pp.skipLineComment = function(startSkip) {
    var start = this.pos;
    var startLoc = this.options.onComment && this.curPosition();
    var ch = this.input.charCodeAt(this.pos += startSkip);
    while (this.pos < this.input.length && !isNewLine(ch)) {
      ch = this.input.charCodeAt(++this.pos);
    }
    if (this.options.onComment)
      { this.options.onComment(false, this.input.slice(start + startSkip, this.pos), start, this.pos,
                             startLoc, this.curPosition()); }
  };

  // Called at the start of the parse and after every token. Skips
  // whitespace and comments, and.

  pp.skipSpace = function() {
    loop: while (this.pos < this.input.length) {
      var ch = this.input.charCodeAt(this.pos);
      switch (ch) {
      case 32: case 160: // ' '
        ++this.pos;
        break
      case 13:
        if (this.input.charCodeAt(this.pos + 1) === 10) {
          ++this.pos;
        }
      case 10: case 8232: case 8233:
        ++this.pos;
        if (this.options.locations) {
          ++this.curLine;
          this.lineStart = this.pos;
        }
        break
      case 47: // '/'
        switch (this.input.charCodeAt(this.pos + 1)) {
        case 42: // '*'
          this.skipBlockComment();
          break
        case 47:
          this.skipLineComment(2);
          break
        default:
          break loop
        }
        break
      default:
        if (ch > 8 && ch < 14 || ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
          ++this.pos;
        } else {
          break loop
        }
      }
    }
  };

  // Called at the end of every token. Sets `end`, `val`, and
  // maintains `context` and `exprAllowed`, and skips the space after
  // the token, so that the next one's `start` will point at the
  // right position.

  pp.finishToken = function(type, val) {
    this.end = this.pos;
    if (this.options.locations) { this.endLoc = this.curPosition(); }
    var prevType = this.type;
    this.type = type;
    this.value = val;

    this.updateContext(prevType);
  };

  // ### Token reading

  // This is the function that is called to fetch the next token. It
  // is somewhat obscure, because it works in character codes rather
  // than characters, and because operator parsing has been inlined
  // into it.
  //
  // All in the name of speed.
  //
  pp.readToken_dot = function() {
    var next = this.input.charCodeAt(this.pos + 1);
    if (next >= 48 && next <= 57) { return this.readNumber(true) }
    var next2 = this.input.charCodeAt(this.pos + 2);
    if (this.options.ecmaVersion >= 6 && next === 46 && next2 === 46) { // 46 = dot '.'
      this.pos += 3;
      return this.finishToken(types$1.ellipsis)
    } else {
      ++this.pos;
      return this.finishToken(types$1.dot)
    }
  };

  pp.readToken_slash = function() { // '/'
    var next = this.input.charCodeAt(this.pos + 1);
    if (this.exprAllowed) { ++this.pos; return this.readRegexp() }
    if (next === 61) { return this.finishOp(types$1.assign, 2) }
    return this.finishOp(types$1.slash, 1)
  };

  pp.readToken_mult_modulo_exp = function(code) { // '%*'
    var next = this.input.charCodeAt(this.pos + 1);
    var size = 1;
    var tokentype = code === 42 ? types$1.star : types$1.modulo;

    // exponentiation operator ** and **=
    if (this.options.ecmaVersion >= 7 && code === 42 && next === 42) {
      ++size;
      tokentype = types$1.starstar;
      next = this.input.charCodeAt(this.pos + 2);
    }

    if (next === 61) { return this.finishOp(types$1.assign, size + 1) }
    return this.finishOp(tokentype, size)
  };

  pp.readToken_pipe_amp = function(code) { // '|&'
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === code) {
      if (this.options.ecmaVersion >= 12) {
        var next2 = this.input.charCodeAt(this.pos + 2);
        if (next2 === 61) { return this.finishOp(types$1.assign, 3) }
      }
      return this.finishOp(code === 124 ? types$1.logicalOR : types$1.logicalAND, 2)
    }
    if (next === 61) { return this.finishOp(types$1.assign, 2) }
    return this.finishOp(code === 124 ? types$1.bitwiseOR : types$1.bitwiseAND, 1)
  };

  pp.readToken_caret = function() { // '^'
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === 61) { return this.finishOp(types$1.assign, 2) }
    return this.finishOp(types$1.bitwiseXOR, 1)
  };

  pp.readToken_plus_min = function(code) { // '+-'
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === code) {
      if (next === 45 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 62 &&
          (this.lastTokEnd === 0 || lineBreak.test(this.input.slice(this.lastTokEnd, this.pos)))) {
        // A `-->` line comment
        this.skipLineComment(3);
        this.skipSpace();
        return this.nextToken()
      }
      return this.finishOp(types$1.incDec, 2)
    }
    if (next === 61) { return this.finishOp(types$1.assign, 2) }
    return this.finishOp(types$1.plusMin, 1)
  };

  pp.readToken_lt_gt = function(code) { // '<>'
    var next = this.input.charCodeAt(this.pos + 1);
    var size = 1;
    if (next === code) {
      size = code === 62 && this.input.charCodeAt(this.pos + 2) === 62 ? 3 : 2;
      if (this.input.charCodeAt(this.pos + size) === 61) { return this.finishOp(types$1.assign, size + 1) }
      return this.finishOp(types$1.bitShift, size)
    }
    if (next === 33 && code === 60 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 45 &&
        this.input.charCodeAt(this.pos + 3) === 45) {
      // `<!--`, an XML-style comment that should be interpreted as a line comment
      this.skipLineComment(4);
      this.skipSpace();
      return this.nextToken()
    }
    if (next === 61) { size = 2; }
    return this.finishOp(types$1.relational, size)
  };

  pp.readToken_eq_excl = function(code) { // '=!'
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === 61) { return this.finishOp(types$1.equality, this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2) }
    if (code === 61 && next === 62 && this.options.ecmaVersion >= 6) { // '=>'
      this.pos += 2;
      return this.finishToken(types$1.arrow)
    }
    return this.finishOp(code === 61 ? types$1.eq : types$1.prefix, 1)
  };

  pp.readToken_question = function() { // '?'
    var ecmaVersion = this.options.ecmaVersion;
    if (ecmaVersion >= 11) {
      var next = this.input.charCodeAt(this.pos + 1);
      if (next === 46) {
        var next2 = this.input.charCodeAt(this.pos + 2);
        if (next2 < 48 || next2 > 57) { return this.finishOp(types$1.questionDot, 2) }
      }
      if (next === 63) {
        if (ecmaVersion >= 12) {
          var next2$1 = this.input.charCodeAt(this.pos + 2);
          if (next2$1 === 61) { return this.finishOp(types$1.assign, 3) }
        }
        return this.finishOp(types$1.coalesce, 2)
      }
    }
    return this.finishOp(types$1.question, 1)
  };

  pp.readToken_numberSign = function() { // '#'
    var ecmaVersion = this.options.ecmaVersion;
    var code = 35; // '#'
    if (ecmaVersion >= 13) {
      ++this.pos;
      code = this.fullCharCodeAtPos();
      if (isIdentifierStart(code, true) || code === 92 /* '\' */) {
        return this.finishToken(types$1.privateId, this.readWord1())
      }
    }

    this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
  };

  pp.getTokenFromCode = function(code) {
    switch (code) {
    // The interpretation of a dot depends on whether it is followed
    // by a digit or another two dots.
    case 46: // '.'
      return this.readToken_dot()

    // Punctuation tokens.
    case 40: ++this.pos; return this.finishToken(types$1.parenL)
    case 41: ++this.pos; return this.finishToken(types$1.parenR)
    case 59: ++this.pos; return this.finishToken(types$1.semi)
    case 44: ++this.pos; return this.finishToken(types$1.comma)
    case 91: ++this.pos; return this.finishToken(types$1.bracketL)
    case 93: ++this.pos; return this.finishToken(types$1.bracketR)
    case 123: ++this.pos; return this.finishToken(types$1.braceL)
    case 125: ++this.pos; return this.finishToken(types$1.braceR)
    case 58: ++this.pos; return this.finishToken(types$1.colon)

    case 96: // '`'
      if (this.options.ecmaVersion < 6) { break }
      ++this.pos;
      return this.finishToken(types$1.backQuote)

    case 48: // '0'
      var next = this.input.charCodeAt(this.pos + 1);
      if (next === 120 || next === 88) { return this.readRadixNumber(16) } // '0x', '0X' - hex number
      if (this.options.ecmaVersion >= 6) {
        if (next === 111 || next === 79) { return this.readRadixNumber(8) } // '0o', '0O' - octal number
        if (next === 98 || next === 66) { return this.readRadixNumber(2) } // '0b', '0B' - binary number
      }

    // Anything else beginning with a digit is an integer, octal
    // number, or float.
    case 49: case 50: case 51: case 52: case 53: case 54: case 55: case 56: case 57: // 1-9
      return this.readNumber(false)

    // Quotes produce strings.
    case 34: case 39: // '"', "'"
      return this.readString(code)

    // Operators are parsed inline in tiny state machines. '=' (61) is
    // often referred to. `finishOp` simply skips the amount of
    // characters it is given as second argument, and returns a token
    // of the type given by its first argument.
    case 47: // '/'
      return this.readToken_slash()

    case 37: case 42: // '%*'
      return this.readToken_mult_modulo_exp(code)

    case 124: case 38: // '|&'
      return this.readToken_pipe_amp(code)

    case 94: // '^'
      return this.readToken_caret()

    case 43: case 45: // '+-'
      return this.readToken_plus_min(code)

    case 60: case 62: // '<>'
      return this.readToken_lt_gt(code)

    case 61: case 33: // '=!'
      return this.readToken_eq_excl(code)

    case 63: // '?'
      return this.readToken_question()

    case 126: // '~'
      return this.finishOp(types$1.prefix, 1)

    case 35: // '#'
      return this.readToken_numberSign()
    }

    this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
  };

  pp.finishOp = function(type, size) {
    var str = this.input.slice(this.pos, this.pos + size);
    this.pos += size;
    return this.finishToken(type, str)
  };

  pp.readRegexp = function() {
    var escaped, inClass, start = this.pos;
    for (;;) {
      if (this.pos >= this.input.length) { this.raise(start, "Unterminated regular expression"); }
      var ch = this.input.charAt(this.pos);
      if (lineBreak.test(ch)) { this.raise(start, "Unterminated regular expression"); }
      if (!escaped) {
        if (ch === "[") { inClass = true; }
        else if (ch === "]" && inClass) { inClass = false; }
        else if (ch === "/" && !inClass) { break }
        escaped = ch === "\\";
      } else { escaped = false; }
      ++this.pos;
    }
    var pattern = this.input.slice(start, this.pos);
    ++this.pos;
    var flagsStart = this.pos;
    var flags = this.readWord1();
    if (this.containsEsc) { this.unexpected(flagsStart); }

    // Validate pattern
    var state = this.regexpState || (this.regexpState = new RegExpValidationState(this));
    state.reset(start, pattern, flags);
    this.validateRegExpFlags(state);
    this.validateRegExpPattern(state);

    // Create Literal#value property value.
    var value = null;
    try {
      value = new RegExp(pattern, flags);
    } catch (e) {
      // ESTree requires null if it failed to instantiate RegExp object.
      // https://github.com/estree/estree/blob/a27003adf4fd7bfad44de9cef372a2eacd527b1c/es5.md#regexpliteral
    }

    return this.finishToken(types$1.regexp, {pattern: pattern, flags: flags, value: value})
  };

  // Read an integer in the given radix. Return null if zero digits
  // were read, the integer value otherwise. When `len` is given, this
  // will return `null` unless the integer has exactly `len` digits.

  pp.readInt = function(radix, len, maybeLegacyOctalNumericLiteral) {
    // `len` is used for character escape sequences. In that case, disallow separators.
    var allowSeparators = this.options.ecmaVersion >= 12 && len === undefined;

    // `maybeLegacyOctalNumericLiteral` is true if it doesn't have prefix (0x,0o,0b)
    // and isn't fraction part nor exponent part. In that case, if the first digit
    // is zero then disallow separators.
    var isLegacyOctalNumericLiteral = maybeLegacyOctalNumericLiteral && this.input.charCodeAt(this.pos) === 48;

    var start = this.pos, total = 0, lastCode = 0;
    for (var i = 0, e = len == null ? Infinity : len; i < e; ++i, ++this.pos) {
      var code = this.input.charCodeAt(this.pos), val = (void 0);

      if (allowSeparators && code === 95) {
        if (isLegacyOctalNumericLiteral) { this.raiseRecoverable(this.pos, "Numeric separator is not allowed in legacy octal numeric literals"); }
        if (lastCode === 95) { this.raiseRecoverable(this.pos, "Numeric separator must be exactly one underscore"); }
        if (i === 0) { this.raiseRecoverable(this.pos, "Numeric separator is not allowed at the first of digits"); }
        lastCode = code;
        continue
      }

      if (code >= 97) { val = code - 97 + 10; } // a
      else if (code >= 65) { val = code - 65 + 10; } // A
      else if (code >= 48 && code <= 57) { val = code - 48; } // 0-9
      else { val = Infinity; }
      if (val >= radix) { break }
      lastCode = code;
      total = total * radix + val;
    }

    if (allowSeparators && lastCode === 95) { this.raiseRecoverable(this.pos - 1, "Numeric separator is not allowed at the last of digits"); }
    if (this.pos === start || len != null && this.pos - start !== len) { return null }

    return total
  };

  function stringToNumber(str, isLegacyOctalNumericLiteral) {
    if (isLegacyOctalNumericLiteral) {
      return parseInt(str, 8)
    }

    // `parseFloat(value)` stops parsing at the first numeric separator then returns a wrong value.
    return parseFloat(str.replace(/_/g, ""))
  }

  function stringToBigInt(str) {
    if (typeof BigInt !== "function") {
      return null
    }

    // `BigInt(value)` throws syntax error if the string contains numeric separators.
    return BigInt(str.replace(/_/g, ""))
  }

  pp.readRadixNumber = function(radix) {
    var start = this.pos;
    this.pos += 2; // 0x
    var val = this.readInt(radix);
    if (val == null) { this.raise(this.start + 2, "Expected number in radix " + radix); }
    if (this.options.ecmaVersion >= 11 && this.input.charCodeAt(this.pos) === 110) {
      val = stringToBigInt(this.input.slice(start, this.pos));
      ++this.pos;
    } else if (isIdentifierStart(this.fullCharCodeAtPos())) { this.raise(this.pos, "Identifier directly after number"); }
    return this.finishToken(types$1.num, val)
  };

  // Read an integer, octal integer, or floating-point number.

  pp.readNumber = function(startsWithDot) {
    var start = this.pos;
    if (!startsWithDot && this.readInt(10, undefined, true) === null) { this.raise(start, "Invalid number"); }
    var octal = this.pos - start >= 2 && this.input.charCodeAt(start) === 48;
    if (octal && this.strict) { this.raise(start, "Invalid number"); }
    var next = this.input.charCodeAt(this.pos);
    if (!octal && !startsWithDot && this.options.ecmaVersion >= 11 && next === 110) {
      var val$1 = stringToBigInt(this.input.slice(start, this.pos));
      ++this.pos;
      if (isIdentifierStart(this.fullCharCodeAtPos())) { this.raise(this.pos, "Identifier directly after number"); }
      return this.finishToken(types$1.num, val$1)
    }
    if (octal && /[89]/.test(this.input.slice(start, this.pos))) { octal = false; }
    if (next === 46 && !octal) { // '.'
      ++this.pos;
      this.readInt(10);
      next = this.input.charCodeAt(this.pos);
    }
    if ((next === 69 || next === 101) && !octal) { // 'eE'
      next = this.input.charCodeAt(++this.pos);
      if (next === 43 || next === 45) { ++this.pos; } // '+-'
      if (this.readInt(10) === null) { this.raise(start, "Invalid number"); }
    }
    if (isIdentifierStart(this.fullCharCodeAtPos())) { this.raise(this.pos, "Identifier directly after number"); }

    var val = stringToNumber(this.input.slice(start, this.pos), octal);
    return this.finishToken(types$1.num, val)
  };

  // Read a string value, interpreting backslash-escapes.

  pp.readCodePoint = function() {
    var ch = this.input.charCodeAt(this.pos), code;

    if (ch === 123) { // '{'
      if (this.options.ecmaVersion < 6) { this.unexpected(); }
      var codePos = ++this.pos;
      code = this.readHexChar(this.input.indexOf("}", this.pos) - this.pos);
      ++this.pos;
      if (code > 0x10FFFF) { this.invalidStringToken(codePos, "Code point out of bounds"); }
    } else {
      code = this.readHexChar(4);
    }
    return code
  };

  pp.readString = function(quote) {
    var out = "", chunkStart = ++this.pos;
    for (;;) {
      if (this.pos >= this.input.length) { this.raise(this.start, "Unterminated string constant"); }
      var ch = this.input.charCodeAt(this.pos);
      if (ch === quote) { break }
      if (ch === 92) { // '\'
        out += this.input.slice(chunkStart, this.pos);
        out += this.readEscapedChar(false);
        chunkStart = this.pos;
      } else if (ch === 0x2028 || ch === 0x2029) {
        if (this.options.ecmaVersion < 10) { this.raise(this.start, "Unterminated string constant"); }
        ++this.pos;
        if (this.options.locations) {
          this.curLine++;
          this.lineStart = this.pos;
        }
      } else {
        if (isNewLine(ch)) { this.raise(this.start, "Unterminated string constant"); }
        ++this.pos;
      }
    }
    out += this.input.slice(chunkStart, this.pos++);
    return this.finishToken(types$1.string, out)
  };

  // Reads template string tokens.

  var INVALID_TEMPLATE_ESCAPE_ERROR = {};

  pp.tryReadTemplateToken = function() {
    this.inTemplateElement = true;
    try {
      this.readTmplToken();
    } catch (err) {
      if (err === INVALID_TEMPLATE_ESCAPE_ERROR) {
        this.readInvalidTemplateToken();
      } else {
        throw err
      }
    }

    this.inTemplateElement = false;
  };

  pp.invalidStringToken = function(position, message) {
    if (this.inTemplateElement && this.options.ecmaVersion >= 9) {
      throw INVALID_TEMPLATE_ESCAPE_ERROR
    } else {
      this.raise(position, message);
    }
  };

  pp.readTmplToken = function() {
    var out = "", chunkStart = this.pos;
    for (;;) {
      if (this.pos >= this.input.length) { this.raise(this.start, "Unterminated template"); }
      var ch = this.input.charCodeAt(this.pos);
      if (ch === 96 || ch === 36 && this.input.charCodeAt(this.pos + 1) === 123) { // '`', '${'
        if (this.pos === this.start && (this.type === types$1.template || this.type === types$1.invalidTemplate)) {
          if (ch === 36) {
            this.pos += 2;
            return this.finishToken(types$1.dollarBraceL)
          } else {
            ++this.pos;
            return this.finishToken(types$1.backQuote)
          }
        }
        out += this.input.slice(chunkStart, this.pos);
        return this.finishToken(types$1.template, out)
      }
      if (ch === 92) { // '\'
        out += this.input.slice(chunkStart, this.pos);
        out += this.readEscapedChar(true);
        chunkStart = this.pos;
      } else if (isNewLine(ch)) {
        out += this.input.slice(chunkStart, this.pos);
        ++this.pos;
        switch (ch) {
        case 13:
          if (this.input.charCodeAt(this.pos) === 10) { ++this.pos; }
        case 10:
          out += "\n";
          break
        default:
          out += String.fromCharCode(ch);
          break
        }
        if (this.options.locations) {
          ++this.curLine;
          this.lineStart = this.pos;
        }
        chunkStart = this.pos;
      } else {
        ++this.pos;
      }
    }
  };

  // Reads a template token to search for the end, without validating any escape sequences
  pp.readInvalidTemplateToken = function() {
    for (; this.pos < this.input.length; this.pos++) {
      switch (this.input[this.pos]) {
      case "\\":
        ++this.pos;
        break

      case "$":
        if (this.input[this.pos + 1] !== "{") { break }
        // fall through
      case "`":
        return this.finishToken(types$1.invalidTemplate, this.input.slice(this.start, this.pos))

      case "\r":
        if (this.input[this.pos + 1] === "\n") { ++this.pos; }
        // fall through
      case "\n": case "\u2028": case "\u2029":
        ++this.curLine;
        this.lineStart = this.pos + 1;
        break
      }
    }
    this.raise(this.start, "Unterminated template");
  };

  // Used to read escaped characters

  pp.readEscapedChar = function(inTemplate) {
    var ch = this.input.charCodeAt(++this.pos);
    ++this.pos;
    switch (ch) {
    case 110: return "\n" // 'n' -> '\n'
    case 114: return "\r" // 'r' -> '\r'
    case 120: return String.fromCharCode(this.readHexChar(2)) // 'x'
    case 117: return codePointToString(this.readCodePoint()) // 'u'
    case 116: return "\t" // 't' -> '\t'
    case 98: return "\b" // 'b' -> '\b'
    case 118: return "\u000b" // 'v' -> '\u000b'
    case 102: return "\f" // 'f' -> '\f'
    case 13: if (this.input.charCodeAt(this.pos) === 10) { ++this.pos; } // '\r\n'
    case 10: // ' \n'
      if (this.options.locations) { this.lineStart = this.pos; ++this.curLine; }
      return ""
    case 56:
    case 57:
      if (this.strict) {
        this.invalidStringToken(
          this.pos - 1,
          "Invalid escape sequence"
        );
      }
      if (inTemplate) {
        var codePos = this.pos - 1;

        this.invalidStringToken(
          codePos,
          "Invalid escape sequence in template string"
        );
      }
    default:
      if (ch >= 48 && ch <= 55) {
        var octalStr = this.input.substr(this.pos - 1, 3).match(/^[0-7]+/)[0];
        var octal = parseInt(octalStr, 8);
        if (octal > 255) {
          octalStr = octalStr.slice(0, -1);
          octal = parseInt(octalStr, 8);
        }
        this.pos += octalStr.length - 1;
        ch = this.input.charCodeAt(this.pos);
        if ((octalStr !== "0" || ch === 56 || ch === 57) && (this.strict || inTemplate)) {
          this.invalidStringToken(
            this.pos - 1 - octalStr.length,
            inTemplate
              ? "Octal literal in template string"
              : "Octal literal in strict mode"
          );
        }
        return String.fromCharCode(octal)
      }
      if (isNewLine(ch)) {
        // Unicode new line characters after \ get removed from output in both
        // template literals and strings
        if (this.options.locations) { this.lineStart = this.pos; ++this.curLine; }
        return ""
      }
      return String.fromCharCode(ch)
    }
  };

  // Used to read character escape sequences ('\x', '\u', '\U').

  pp.readHexChar = function(len) {
    var codePos = this.pos;
    var n = this.readInt(16, len);
    if (n === null) { this.invalidStringToken(codePos, "Bad character escape sequence"); }
    return n
  };

  // Read an identifier, and return it as a string. Sets `this.containsEsc`
  // to whether the word contained a '\u' escape.
  //
  // Incrementally adds only escaped chars, adding other chunks as-is
  // as a micro-optimization.

  pp.readWord1 = function() {
    this.containsEsc = false;
    var word = "", first = true, chunkStart = this.pos;
    var astral = this.options.ecmaVersion >= 6;
    while (this.pos < this.input.length) {
      var ch = this.fullCharCodeAtPos();
      if (isIdentifierChar(ch, astral)) {
        this.pos += ch <= 0xffff ? 1 : 2;
      } else if (ch === 92) { // "\"
        this.containsEsc = true;
        word += this.input.slice(chunkStart, this.pos);
        var escStart = this.pos;
        if (this.input.charCodeAt(++this.pos) !== 117) // "u"
          { this.invalidStringToken(this.pos, "Expecting Unicode escape sequence \\uXXXX"); }
        ++this.pos;
        var esc = this.readCodePoint();
        if (!(first ? isIdentifierStart : isIdentifierChar)(esc, astral))
          { this.invalidStringToken(escStart, "Invalid Unicode escape"); }
        word += codePointToString(esc);
        chunkStart = this.pos;
      } else {
        break
      }
      first = false;
    }
    return word + this.input.slice(chunkStart, this.pos)
  };

  // Read an identifier or keyword token. Will check for reserved
  // words when necessary.

  pp.readWord = function() {
    var word = this.readWord1();
    var type = types$1.name;
    if (this.keywords.test(word)) {
      type = keywords[word];
    }
    return this.finishToken(type, word)
  };

  // Acorn is a tiny, fast JavaScript parser written in JavaScript.
  //
  // Acorn was written by Marijn Haverbeke, Ingvar Stepanyan, and
  // various contributors and released under an MIT license.
  //
  // Git repositories for Acorn are available at
  //
  //     http://marijnhaverbeke.nl/git/acorn
  //     https://github.com/acornjs/acorn.git
  //
  // Please use the [github bug tracker][ghbt] to report issues.
  //
  // [ghbt]: https://github.com/acornjs/acorn/issues
  //
  // [walk]: util/walk.js


  var version = "8.14.0";

  Parser.acorn = {
    Parser: Parser,
    version: version,
    defaultOptions: defaultOptions,
    Position: Position,
    SourceLocation: SourceLocation,
    getLineInfo: getLineInfo,
    Node: Node,
    TokenType: TokenType,
    tokTypes: types$1,
    keywordTypes: keywords,
    TokContext: TokContext,
    tokContexts: types$2,
    isIdentifierChar: isIdentifierChar,
    isIdentifierStart: isIdentifierStart,
    Token: Token,
    isNewLine: isNewLine,
    lineBreak: lineBreak,
    lineBreakG: lineBreakG,
    nonASCIIwhitespace: nonASCIIwhitespace
  };

  // The main exported interface (under `self.acorn` when in the
  // browser) is a `parse` function that takes a code string and returns
  // an abstract syntax tree as specified by the [ESTree spec][estree].
  //
  // [estree]: https://github.com/estree/estree

  function parse$2(input, options) {
    return Parser.parse(input, options)
  }

  // Could be in ticks so that we can have \n's but we dont want template
  // replacements so using double quotes (escape double quotes and new lines)
  // https://gist.github.com/getify/3667624
  function qouted(str) {
  	if (str===undefined) return `""`
  	str = str.replaceAll('\r','');
  	str = str.replace(/\\([\s\S])|(")/g,"\\$1$2");
  	str = str.replace(/\\([\s\S])|(\n)/g,"\\$1$2");
      return `"${str}"`
  }

  function templateOrString(str) {

      try {
          let ast = parse$2("`" + str + "`", {ecmaVersion: 2020});
          return ast.body[0].expression
      } catch (e) {
          return {
              type: "Literal",
              start: -1,
              end: -1,
              value: qouted(str),
              raw: qouted(str)
          }
      }
  }


  function yamlToEsast(str,throwOnInvalid = false) {

      console.log('yamlToEsast',str);

      const src = '(() => { try { return ' + str + '; } catch (e) { return `' + str + '`; } })()';

      try {
          const rawNode = parse$2(str, {ecmaVersion: 2020});
          if (rawNode.body[0].type == "ExpressionStatement") {
              if (rawNode.body[0].expression.type == "TemplateLiteral"
                      || rawNode.body[0].expression.type == "Literal") {
                  return rawNode.body[0].expression
              } else {
                  // console.log(util.inspect(rawNode,false,null,true))
                  const srcNode = parse$2(src, {ecmaVersion: 2020});
                  // console.log(util.inspect(srcNode,false,null,true))
                  return srcNode.body[0].expression
              }
          } else {
              // console.log(util.inspect(rawNode,false,null,true))
          }
      } catch (e) {
          // console.log(e)
      }

      return {
          type: "Literal",
          start: -1,
          end: -1,
          value: qouted(str),
          raw: qouted(str)
      }
  }

  function yamlToEsastArray(str) {

  //    console.log('yamlToEsastArray',str)

      const src = '(() => { try { return [' + str + ']; } catch (e) { return [`' + str + '`]; } })()';

      try {
          const node = parse$2(src, {ecmaVersion: 2020});
          return node.body[0].expression
      } catch (e) {
          return {
              type: "Literal",
              start: -1,
              end: -1,
              value: qouted(str),
              raw: qouted(str)
          }
      }


  }

  /**
   * @typedef {import('./info.js').Info} Info
   * @typedef {Record<string, Info>} Properties
   * @typedef {Record<string, string>} Normal
   */

  class Schema {
    /**
     * @constructor
     * @param {Properties} property
     * @param {Normal} normal
     * @param {string} [space]
     */
    constructor(property, normal, space) {
      this.property = property;
      this.normal = normal;
      if (space) {
        this.space = space;
      }
    }
  }

  /** @type {Properties} */
  Schema.prototype.property = {};
  /** @type {Normal} */
  Schema.prototype.normal = {};
  /** @type {string|null} */
  Schema.prototype.space = null;

  /**
   * @typedef {import('./schema.js').Properties} Properties
   * @typedef {import('./schema.js').Normal} Normal
   */


  /**
   * @param {Schema[]} definitions
   * @param {string} [space]
   * @returns {Schema}
   */
  function merge(definitions, space) {
    /** @type {Properties} */
    const property = {};
    /** @type {Normal} */
    const normal = {};
    let index = -1;

    while (++index < definitions.length) {
      Object.assign(property, definitions[index].property);
      Object.assign(normal, definitions[index].normal);
    }

    return new Schema(property, normal, space)
  }

  /**
   * @param {string} value
   * @returns {string}
   */
  function normalize(value) {
    return value.toLowerCase()
  }

  class Info {
    /**
     * @constructor
     * @param {string} property
     * @param {string} attribute
     */
    constructor(property, attribute) {
      /** @type {string} */
      this.property = property;
      /** @type {string} */
      this.attribute = attribute;
    }
  }

  /** @type {string|null} */
  Info.prototype.space = null;
  Info.prototype.boolean = false;
  Info.prototype.booleanish = false;
  Info.prototype.overloadedBoolean = false;
  Info.prototype.number = false;
  Info.prototype.commaSeparated = false;
  Info.prototype.spaceSeparated = false;
  Info.prototype.commaOrSpaceSeparated = false;
  Info.prototype.mustUseProperty = false;
  Info.prototype.defined = false;

  let powers = 0;

  const boolean = increment();
  const booleanish = increment();
  const overloadedBoolean = increment();
  const number = increment();
  const spaceSeparated = increment();
  const commaSeparated = increment();
  const commaOrSpaceSeparated = increment();

  function increment() {
    return 2 ** ++powers
  }

  var types = /*#__PURE__*/Object.freeze({
    __proto__: null,
    boolean: boolean,
    booleanish: booleanish,
    commaOrSpaceSeparated: commaOrSpaceSeparated,
    commaSeparated: commaSeparated,
    number: number,
    overloadedBoolean: overloadedBoolean,
    spaceSeparated: spaceSeparated
  });

  /** @type {Array<keyof types>} */
  // @ts-expect-error: hush.
  const checks = Object.keys(types);

  class DefinedInfo extends Info {
    /**
     * @constructor
     * @param {string} property
     * @param {string} attribute
     * @param {number|null} [mask]
     * @param {string} [space]
     */
    constructor(property, attribute, mask, space) {
      let index = -1;

      super(property, attribute);

      mark(this, 'space', space);

      if (typeof mask === 'number') {
        while (++index < checks.length) {
          const check = checks[index];
          mark(this, checks[index], (mask & types[check]) === types[check]);
        }
      }
    }
  }

  DefinedInfo.prototype.defined = true;

  /**
   * @param {DefinedInfo} values
   * @param {string} key
   * @param {unknown} value
   */
  function mark(values, key, value) {
    if (value) {
      // @ts-expect-error: assume `value` matches the expected value of `key`.
      values[key] = value;
    }
  }

  /**
   * @typedef {import('./schema.js').Properties} Properties
   * @typedef {import('./schema.js').Normal} Normal
   *
   * @typedef {Record<string, string>} Attributes
   *
   * @typedef {Object} Definition
   * @property {Record<string, number|null>} properties
   * @property {(attributes: Attributes, property: string) => string} transform
   * @property {string} [space]
   * @property {Attributes} [attributes]
   * @property {Array<string>} [mustUseProperty]
   */


  const own$5 = {}.hasOwnProperty;

  /**
   * @param {Definition} definition
   * @returns {Schema}
   */
  function create(definition) {
    /** @type {Properties} */
    const property = {};
    /** @type {Normal} */
    const normal = {};
    /** @type {string} */
    let prop;

    for (prop in definition.properties) {
      if (own$5.call(definition.properties, prop)) {
        const value = definition.properties[prop];
        const info = new DefinedInfo(
          prop,
          definition.transform(definition.attributes || {}, prop),
          value,
          definition.space
        );

        if (
          definition.mustUseProperty &&
          definition.mustUseProperty.includes(prop)
        ) {
          info.mustUseProperty = true;
        }

        property[prop] = info;

        normal[normalize(prop)] = prop;
        normal[normalize(info.attribute)] = prop;
      }
    }

    return new Schema(property, normal, definition.space)
  }

  const xlink = create({
    space: 'xlink',
    transform(_, prop) {
      return 'xlink:' + prop.slice(5).toLowerCase()
    },
    properties: {
      xLinkActuate: null,
      xLinkArcRole: null,
      xLinkHref: null,
      xLinkRole: null,
      xLinkShow: null,
      xLinkTitle: null,
      xLinkType: null
    }
  });

  const xml = create({
    space: 'xml',
    transform(_, prop) {
      return 'xml:' + prop.slice(3).toLowerCase()
    },
    properties: {xmlLang: null, xmlBase: null, xmlSpace: null}
  });

  /**
   * @param {Record<string, string>} attributes
   * @param {string} attribute
   * @returns {string}
   */
  function caseSensitiveTransform(attributes, attribute) {
    return attribute in attributes ? attributes[attribute] : attribute
  }

  /**
   * @param {Record<string, string>} attributes
   * @param {string} property
   * @returns {string}
   */
  function caseInsensitiveTransform(attributes, property) {
    return caseSensitiveTransform(attributes, property.toLowerCase())
  }

  const xmlns = create({
    space: 'xmlns',
    attributes: {xmlnsxlink: 'xmlns:xlink'},
    transform: caseInsensitiveTransform,
    properties: {xmlns: null, xmlnsXLink: null}
  });

  const aria = create({
    transform(_, prop) {
      return prop === 'role' ? prop : 'aria-' + prop.slice(4).toLowerCase()
    },
    properties: {
      ariaActiveDescendant: null,
      ariaAtomic: booleanish,
      ariaAutoComplete: null,
      ariaBusy: booleanish,
      ariaChecked: booleanish,
      ariaColCount: number,
      ariaColIndex: number,
      ariaColSpan: number,
      ariaControls: spaceSeparated,
      ariaCurrent: null,
      ariaDescribedBy: spaceSeparated,
      ariaDetails: null,
      ariaDisabled: booleanish,
      ariaDropEffect: spaceSeparated,
      ariaErrorMessage: null,
      ariaExpanded: booleanish,
      ariaFlowTo: spaceSeparated,
      ariaGrabbed: booleanish,
      ariaHasPopup: null,
      ariaHidden: booleanish,
      ariaInvalid: null,
      ariaKeyShortcuts: null,
      ariaLabel: null,
      ariaLabelledBy: spaceSeparated,
      ariaLevel: number,
      ariaLive: null,
      ariaModal: booleanish,
      ariaMultiLine: booleanish,
      ariaMultiSelectable: booleanish,
      ariaOrientation: null,
      ariaOwns: spaceSeparated,
      ariaPlaceholder: null,
      ariaPosInSet: number,
      ariaPressed: booleanish,
      ariaReadOnly: booleanish,
      ariaRelevant: null,
      ariaRequired: booleanish,
      ariaRoleDescription: spaceSeparated,
      ariaRowCount: number,
      ariaRowIndex: number,
      ariaRowSpan: number,
      ariaSelected: booleanish,
      ariaSetSize: number,
      ariaSort: null,
      ariaValueMax: number,
      ariaValueMin: number,
      ariaValueNow: number,
      ariaValueText: null,
      role: null
    }
  });

  const html$3 = create({
    space: 'html',
    attributes: {
      acceptcharset: 'accept-charset',
      classname: 'class',
      htmlfor: 'for',
      httpequiv: 'http-equiv'
    },
    transform: caseInsensitiveTransform,
    mustUseProperty: ['checked', 'multiple', 'muted', 'selected'],
    properties: {
      // Standard Properties.
      abbr: null,
      accept: commaSeparated,
      acceptCharset: spaceSeparated,
      accessKey: spaceSeparated,
      action: null,
      allow: null,
      allowFullScreen: boolean,
      allowPaymentRequest: boolean,
      allowUserMedia: boolean,
      alt: null,
      as: null,
      async: boolean,
      autoCapitalize: null,
      autoComplete: spaceSeparated,
      autoFocus: boolean,
      autoPlay: boolean,
      blocking: spaceSeparated,
      capture: null,
      charSet: null,
      checked: boolean,
      cite: null,
      className: spaceSeparated,
      cols: number,
      colSpan: null,
      content: null,
      contentEditable: booleanish,
      controls: boolean,
      controlsList: spaceSeparated,
      coords: number | commaSeparated,
      crossOrigin: null,
      data: null,
      dateTime: null,
      decoding: null,
      default: boolean,
      defer: boolean,
      dir: null,
      dirName: null,
      disabled: boolean,
      download: overloadedBoolean,
      draggable: booleanish,
      encType: null,
      enterKeyHint: null,
      fetchPriority: null,
      form: null,
      formAction: null,
      formEncType: null,
      formMethod: null,
      formNoValidate: boolean,
      formTarget: null,
      headers: spaceSeparated,
      height: number,
      hidden: boolean,
      high: number,
      href: null,
      hrefLang: null,
      htmlFor: spaceSeparated,
      httpEquiv: spaceSeparated,
      id: null,
      imageSizes: null,
      imageSrcSet: null,
      inert: boolean,
      inputMode: null,
      integrity: null,
      is: null,
      isMap: boolean,
      itemId: null,
      itemProp: spaceSeparated,
      itemRef: spaceSeparated,
      itemScope: boolean,
      itemType: spaceSeparated,
      kind: null,
      label: null,
      lang: null,
      language: null,
      list: null,
      loading: null,
      loop: boolean,
      low: number,
      manifest: null,
      max: null,
      maxLength: number,
      media: null,
      method: null,
      min: null,
      minLength: number,
      multiple: boolean,
      muted: boolean,
      name: null,
      nonce: null,
      noModule: boolean,
      noValidate: boolean,
      onAbort: null,
      onAfterPrint: null,
      onAuxClick: null,
      onBeforeMatch: null,
      onBeforePrint: null,
      onBeforeToggle: null,
      onBeforeUnload: null,
      onBlur: null,
      onCancel: null,
      onCanPlay: null,
      onCanPlayThrough: null,
      onChange: null,
      onClick: null,
      onClose: null,
      onContextLost: null,
      onContextMenu: null,
      onContextRestored: null,
      onCopy: null,
      onCueChange: null,
      onCut: null,
      onDblClick: null,
      onDrag: null,
      onDragEnd: null,
      onDragEnter: null,
      onDragExit: null,
      onDragLeave: null,
      onDragOver: null,
      onDragStart: null,
      onDrop: null,
      onDurationChange: null,
      onEmptied: null,
      onEnded: null,
      onError: null,
      onFocus: null,
      onFormData: null,
      onHashChange: null,
      onInput: null,
      onInvalid: null,
      onKeyDown: null,
      onKeyPress: null,
      onKeyUp: null,
      onLanguageChange: null,
      onLoad: null,
      onLoadedData: null,
      onLoadedMetadata: null,
      onLoadEnd: null,
      onLoadStart: null,
      onMessage: null,
      onMessageError: null,
      onMouseDown: null,
      onMouseEnter: null,
      onMouseLeave: null,
      onMouseMove: null,
      onMouseOut: null,
      onMouseOver: null,
      onMouseUp: null,
      onOffline: null,
      onOnline: null,
      onPageHide: null,
      onPageShow: null,
      onPaste: null,
      onPause: null,
      onPlay: null,
      onPlaying: null,
      onPopState: null,
      onProgress: null,
      onRateChange: null,
      onRejectionHandled: null,
      onReset: null,
      onResize: null,
      onScroll: null,
      onScrollEnd: null,
      onSecurityPolicyViolation: null,
      onSeeked: null,
      onSeeking: null,
      onSelect: null,
      onSlotChange: null,
      onStalled: null,
      onStorage: null,
      onSubmit: null,
      onSuspend: null,
      onTimeUpdate: null,
      onToggle: null,
      onUnhandledRejection: null,
      onUnload: null,
      onVolumeChange: null,
      onWaiting: null,
      onWheel: null,
      open: boolean,
      optimum: number,
      pattern: null,
      ping: spaceSeparated,
      placeholder: null,
      playsInline: boolean,
      popover: null,
      popoverTarget: null,
      popoverTargetAction: null,
      poster: null,
      preload: null,
      readOnly: boolean,
      referrerPolicy: null,
      rel: spaceSeparated,
      required: boolean,
      reversed: boolean,
      rows: number,
      rowSpan: number,
      sandbox: spaceSeparated,
      scope: null,
      scoped: boolean,
      seamless: boolean,
      selected: boolean,
      shadowRootClonable: boolean,
      shadowRootDelegatesFocus: boolean,
      shadowRootMode: null,
      shape: null,
      size: number,
      sizes: null,
      slot: null,
      span: number,
      spellCheck: booleanish,
      src: null,
      srcDoc: null,
      srcLang: null,
      srcSet: null,
      start: number,
      step: null,
      style: null,
      tabIndex: number,
      target: null,
      title: null,
      translate: null,
      type: null,
      typeMustMatch: boolean,
      useMap: null,
      value: booleanish,
      width: number,
      wrap: null,
      writingSuggestions: null,

      // Legacy.
      // See: https://html.spec.whatwg.org/#other-elements,-attributes-and-apis
      align: null, // Several. Use CSS `text-align` instead,
      aLink: null, // `<body>`. Use CSS `a:active {color}` instead
      archive: spaceSeparated, // `<object>`. List of URIs to archives
      axis: null, // `<td>` and `<th>`. Use `scope` on `<th>`
      background: null, // `<body>`. Use CSS `background-image` instead
      bgColor: null, // `<body>` and table elements. Use CSS `background-color` instead
      border: number, // `<table>`. Use CSS `border-width` instead,
      borderColor: null, // `<table>`. Use CSS `border-color` instead,
      bottomMargin: number, // `<body>`
      cellPadding: null, // `<table>`
      cellSpacing: null, // `<table>`
      char: null, // Several table elements. When `align=char`, sets the character to align on
      charOff: null, // Several table elements. When `char`, offsets the alignment
      classId: null, // `<object>`
      clear: null, // `<br>`. Use CSS `clear` instead
      code: null, // `<object>`
      codeBase: null, // `<object>`
      codeType: null, // `<object>`
      color: null, // `<font>` and `<hr>`. Use CSS instead
      compact: boolean, // Lists. Use CSS to reduce space between items instead
      declare: boolean, // `<object>`
      event: null, // `<script>`
      face: null, // `<font>`. Use CSS instead
      frame: null, // `<table>`
      frameBorder: null, // `<iframe>`. Use CSS `border` instead
      hSpace: number, // `<img>` and `<object>`
      leftMargin: number, // `<body>`
      link: null, // `<body>`. Use CSS `a:link {color: *}` instead
      longDesc: null, // `<frame>`, `<iframe>`, and `<img>`. Use an `<a>`
      lowSrc: null, // `<img>`. Use a `<picture>`
      marginHeight: number, // `<body>`
      marginWidth: number, // `<body>`
      noResize: boolean, // `<frame>`
      noHref: boolean, // `<area>`. Use no href instead of an explicit `nohref`
      noShade: boolean, // `<hr>`. Use background-color and height instead of borders
      noWrap: boolean, // `<td>` and `<th>`
      object: null, // `<applet>`
      profile: null, // `<head>`
      prompt: null, // `<isindex>`
      rev: null, // `<link>`
      rightMargin: number, // `<body>`
      rules: null, // `<table>`
      scheme: null, // `<meta>`
      scrolling: booleanish, // `<frame>`. Use overflow in the child context
      standby: null, // `<object>`
      summary: null, // `<table>`
      text: null, // `<body>`. Use CSS `color` instead
      topMargin: number, // `<body>`
      valueType: null, // `<param>`
      version: null, // `<html>`. Use a doctype.
      vAlign: null, // Several. Use CSS `vertical-align` instead
      vLink: null, // `<body>`. Use CSS `a:visited {color}` instead
      vSpace: number, // `<img>` and `<object>`

      // Non-standard Properties.
      allowTransparency: null,
      autoCorrect: null,
      autoSave: null,
      disablePictureInPicture: boolean,
      disableRemotePlayback: boolean,
      prefix: null,
      property: null,
      results: number,
      security: null,
      unselectable: null
    }
  });

  const svg$1 = create({
    space: 'svg',
    attributes: {
      accentHeight: 'accent-height',
      alignmentBaseline: 'alignment-baseline',
      arabicForm: 'arabic-form',
      baselineShift: 'baseline-shift',
      capHeight: 'cap-height',
      className: 'class',
      clipPath: 'clip-path',
      clipRule: 'clip-rule',
      colorInterpolation: 'color-interpolation',
      colorInterpolationFilters: 'color-interpolation-filters',
      colorProfile: 'color-profile',
      colorRendering: 'color-rendering',
      crossOrigin: 'crossorigin',
      dataType: 'datatype',
      dominantBaseline: 'dominant-baseline',
      enableBackground: 'enable-background',
      fillOpacity: 'fill-opacity',
      fillRule: 'fill-rule',
      floodColor: 'flood-color',
      floodOpacity: 'flood-opacity',
      fontFamily: 'font-family',
      fontSize: 'font-size',
      fontSizeAdjust: 'font-size-adjust',
      fontStretch: 'font-stretch',
      fontStyle: 'font-style',
      fontVariant: 'font-variant',
      fontWeight: 'font-weight',
      glyphName: 'glyph-name',
      glyphOrientationHorizontal: 'glyph-orientation-horizontal',
      glyphOrientationVertical: 'glyph-orientation-vertical',
      hrefLang: 'hreflang',
      horizAdvX: 'horiz-adv-x',
      horizOriginX: 'horiz-origin-x',
      horizOriginY: 'horiz-origin-y',
      imageRendering: 'image-rendering',
      letterSpacing: 'letter-spacing',
      lightingColor: 'lighting-color',
      markerEnd: 'marker-end',
      markerMid: 'marker-mid',
      markerStart: 'marker-start',
      navDown: 'nav-down',
      navDownLeft: 'nav-down-left',
      navDownRight: 'nav-down-right',
      navLeft: 'nav-left',
      navNext: 'nav-next',
      navPrev: 'nav-prev',
      navRight: 'nav-right',
      navUp: 'nav-up',
      navUpLeft: 'nav-up-left',
      navUpRight: 'nav-up-right',
      onAbort: 'onabort',
      onActivate: 'onactivate',
      onAfterPrint: 'onafterprint',
      onBeforePrint: 'onbeforeprint',
      onBegin: 'onbegin',
      onCancel: 'oncancel',
      onCanPlay: 'oncanplay',
      onCanPlayThrough: 'oncanplaythrough',
      onChange: 'onchange',
      onClick: 'onclick',
      onClose: 'onclose',
      onCopy: 'oncopy',
      onCueChange: 'oncuechange',
      onCut: 'oncut',
      onDblClick: 'ondblclick',
      onDrag: 'ondrag',
      onDragEnd: 'ondragend',
      onDragEnter: 'ondragenter',
      onDragExit: 'ondragexit',
      onDragLeave: 'ondragleave',
      onDragOver: 'ondragover',
      onDragStart: 'ondragstart',
      onDrop: 'ondrop',
      onDurationChange: 'ondurationchange',
      onEmptied: 'onemptied',
      onEnd: 'onend',
      onEnded: 'onended',
      onError: 'onerror',
      onFocus: 'onfocus',
      onFocusIn: 'onfocusin',
      onFocusOut: 'onfocusout',
      onHashChange: 'onhashchange',
      onInput: 'oninput',
      onInvalid: 'oninvalid',
      onKeyDown: 'onkeydown',
      onKeyPress: 'onkeypress',
      onKeyUp: 'onkeyup',
      onLoad: 'onload',
      onLoadedData: 'onloadeddata',
      onLoadedMetadata: 'onloadedmetadata',
      onLoadStart: 'onloadstart',
      onMessage: 'onmessage',
      onMouseDown: 'onmousedown',
      onMouseEnter: 'onmouseenter',
      onMouseLeave: 'onmouseleave',
      onMouseMove: 'onmousemove',
      onMouseOut: 'onmouseout',
      onMouseOver: 'onmouseover',
      onMouseUp: 'onmouseup',
      onMouseWheel: 'onmousewheel',
      onOffline: 'onoffline',
      onOnline: 'ononline',
      onPageHide: 'onpagehide',
      onPageShow: 'onpageshow',
      onPaste: 'onpaste',
      onPause: 'onpause',
      onPlay: 'onplay',
      onPlaying: 'onplaying',
      onPopState: 'onpopstate',
      onProgress: 'onprogress',
      onRateChange: 'onratechange',
      onRepeat: 'onrepeat',
      onReset: 'onreset',
      onResize: 'onresize',
      onScroll: 'onscroll',
      onSeeked: 'onseeked',
      onSeeking: 'onseeking',
      onSelect: 'onselect',
      onShow: 'onshow',
      onStalled: 'onstalled',
      onStorage: 'onstorage',
      onSubmit: 'onsubmit',
      onSuspend: 'onsuspend',
      onTimeUpdate: 'ontimeupdate',
      onToggle: 'ontoggle',
      onUnload: 'onunload',
      onVolumeChange: 'onvolumechange',
      onWaiting: 'onwaiting',
      onZoom: 'onzoom',
      overlinePosition: 'overline-position',
      overlineThickness: 'overline-thickness',
      paintOrder: 'paint-order',
      panose1: 'panose-1',
      pointerEvents: 'pointer-events',
      referrerPolicy: 'referrerpolicy',
      renderingIntent: 'rendering-intent',
      shapeRendering: 'shape-rendering',
      stopColor: 'stop-color',
      stopOpacity: 'stop-opacity',
      strikethroughPosition: 'strikethrough-position',
      strikethroughThickness: 'strikethrough-thickness',
      strokeDashArray: 'stroke-dasharray',
      strokeDashOffset: 'stroke-dashoffset',
      strokeLineCap: 'stroke-linecap',
      strokeLineJoin: 'stroke-linejoin',
      strokeMiterLimit: 'stroke-miterlimit',
      strokeOpacity: 'stroke-opacity',
      strokeWidth: 'stroke-width',
      tabIndex: 'tabindex',
      textAnchor: 'text-anchor',
      textDecoration: 'text-decoration',
      textRendering: 'text-rendering',
      transformOrigin: 'transform-origin',
      typeOf: 'typeof',
      underlinePosition: 'underline-position',
      underlineThickness: 'underline-thickness',
      unicodeBidi: 'unicode-bidi',
      unicodeRange: 'unicode-range',
      unitsPerEm: 'units-per-em',
      vAlphabetic: 'v-alphabetic',
      vHanging: 'v-hanging',
      vIdeographic: 'v-ideographic',
      vMathematical: 'v-mathematical',
      vectorEffect: 'vector-effect',
      vertAdvY: 'vert-adv-y',
      vertOriginX: 'vert-origin-x',
      vertOriginY: 'vert-origin-y',
      wordSpacing: 'word-spacing',
      writingMode: 'writing-mode',
      xHeight: 'x-height',
      // These were camelcased in Tiny. Now lowercased in SVG 2
      playbackOrder: 'playbackorder',
      timelineBegin: 'timelinebegin'
    },
    transform: caseSensitiveTransform,
    properties: {
      about: commaOrSpaceSeparated,
      accentHeight: number,
      accumulate: null,
      additive: null,
      alignmentBaseline: null,
      alphabetic: number,
      amplitude: number,
      arabicForm: null,
      ascent: number,
      attributeName: null,
      attributeType: null,
      azimuth: number,
      bandwidth: null,
      baselineShift: null,
      baseFrequency: null,
      baseProfile: null,
      bbox: null,
      begin: null,
      bias: number,
      by: null,
      calcMode: null,
      capHeight: number,
      className: spaceSeparated,
      clip: null,
      clipPath: null,
      clipPathUnits: null,
      clipRule: null,
      color: null,
      colorInterpolation: null,
      colorInterpolationFilters: null,
      colorProfile: null,
      colorRendering: null,
      content: null,
      contentScriptType: null,
      contentStyleType: null,
      crossOrigin: null,
      cursor: null,
      cx: null,
      cy: null,
      d: null,
      dataType: null,
      defaultAction: null,
      descent: number,
      diffuseConstant: number,
      direction: null,
      display: null,
      dur: null,
      divisor: number,
      dominantBaseline: null,
      download: boolean,
      dx: null,
      dy: null,
      edgeMode: null,
      editable: null,
      elevation: number,
      enableBackground: null,
      end: null,
      event: null,
      exponent: number,
      externalResourcesRequired: null,
      fill: null,
      fillOpacity: number,
      fillRule: null,
      filter: null,
      filterRes: null,
      filterUnits: null,
      floodColor: null,
      floodOpacity: null,
      focusable: null,
      focusHighlight: null,
      fontFamily: null,
      fontSize: null,
      fontSizeAdjust: null,
      fontStretch: null,
      fontStyle: null,
      fontVariant: null,
      fontWeight: null,
      format: null,
      fr: null,
      from: null,
      fx: null,
      fy: null,
      g1: commaSeparated,
      g2: commaSeparated,
      glyphName: commaSeparated,
      glyphOrientationHorizontal: null,
      glyphOrientationVertical: null,
      glyphRef: null,
      gradientTransform: null,
      gradientUnits: null,
      handler: null,
      hanging: number,
      hatchContentUnits: null,
      hatchUnits: null,
      height: null,
      href: null,
      hrefLang: null,
      horizAdvX: number,
      horizOriginX: number,
      horizOriginY: number,
      id: null,
      ideographic: number,
      imageRendering: null,
      initialVisibility: null,
      in: null,
      in2: null,
      intercept: number,
      k: number,
      k1: number,
      k2: number,
      k3: number,
      k4: number,
      kernelMatrix: commaOrSpaceSeparated,
      kernelUnitLength: null,
      keyPoints: null, // SEMI_COLON_SEPARATED
      keySplines: null, // SEMI_COLON_SEPARATED
      keyTimes: null, // SEMI_COLON_SEPARATED
      kerning: null,
      lang: null,
      lengthAdjust: null,
      letterSpacing: null,
      lightingColor: null,
      limitingConeAngle: number,
      local: null,
      markerEnd: null,
      markerMid: null,
      markerStart: null,
      markerHeight: null,
      markerUnits: null,
      markerWidth: null,
      mask: null,
      maskContentUnits: null,
      maskUnits: null,
      mathematical: null,
      max: null,
      media: null,
      mediaCharacterEncoding: null,
      mediaContentEncodings: null,
      mediaSize: number,
      mediaTime: null,
      method: null,
      min: null,
      mode: null,
      name: null,
      navDown: null,
      navDownLeft: null,
      navDownRight: null,
      navLeft: null,
      navNext: null,
      navPrev: null,
      navRight: null,
      navUp: null,
      navUpLeft: null,
      navUpRight: null,
      numOctaves: null,
      observer: null,
      offset: null,
      onAbort: null,
      onActivate: null,
      onAfterPrint: null,
      onBeforePrint: null,
      onBegin: null,
      onCancel: null,
      onCanPlay: null,
      onCanPlayThrough: null,
      onChange: null,
      onClick: null,
      onClose: null,
      onCopy: null,
      onCueChange: null,
      onCut: null,
      onDblClick: null,
      onDrag: null,
      onDragEnd: null,
      onDragEnter: null,
      onDragExit: null,
      onDragLeave: null,
      onDragOver: null,
      onDragStart: null,
      onDrop: null,
      onDurationChange: null,
      onEmptied: null,
      onEnd: null,
      onEnded: null,
      onError: null,
      onFocus: null,
      onFocusIn: null,
      onFocusOut: null,
      onHashChange: null,
      onInput: null,
      onInvalid: null,
      onKeyDown: null,
      onKeyPress: null,
      onKeyUp: null,
      onLoad: null,
      onLoadedData: null,
      onLoadedMetadata: null,
      onLoadStart: null,
      onMessage: null,
      onMouseDown: null,
      onMouseEnter: null,
      onMouseLeave: null,
      onMouseMove: null,
      onMouseOut: null,
      onMouseOver: null,
      onMouseUp: null,
      onMouseWheel: null,
      onOffline: null,
      onOnline: null,
      onPageHide: null,
      onPageShow: null,
      onPaste: null,
      onPause: null,
      onPlay: null,
      onPlaying: null,
      onPopState: null,
      onProgress: null,
      onRateChange: null,
      onRepeat: null,
      onReset: null,
      onResize: null,
      onScroll: null,
      onSeeked: null,
      onSeeking: null,
      onSelect: null,
      onShow: null,
      onStalled: null,
      onStorage: null,
      onSubmit: null,
      onSuspend: null,
      onTimeUpdate: null,
      onToggle: null,
      onUnload: null,
      onVolumeChange: null,
      onWaiting: null,
      onZoom: null,
      opacity: null,
      operator: null,
      order: null,
      orient: null,
      orientation: null,
      origin: null,
      overflow: null,
      overlay: null,
      overlinePosition: number,
      overlineThickness: number,
      paintOrder: null,
      panose1: null,
      path: null,
      pathLength: number,
      patternContentUnits: null,
      patternTransform: null,
      patternUnits: null,
      phase: null,
      ping: spaceSeparated,
      pitch: null,
      playbackOrder: null,
      pointerEvents: null,
      points: null,
      pointsAtX: number,
      pointsAtY: number,
      pointsAtZ: number,
      preserveAlpha: null,
      preserveAspectRatio: null,
      primitiveUnits: null,
      propagate: null,
      property: commaOrSpaceSeparated,
      r: null,
      radius: null,
      referrerPolicy: null,
      refX: null,
      refY: null,
      rel: commaOrSpaceSeparated,
      rev: commaOrSpaceSeparated,
      renderingIntent: null,
      repeatCount: null,
      repeatDur: null,
      requiredExtensions: commaOrSpaceSeparated,
      requiredFeatures: commaOrSpaceSeparated,
      requiredFonts: commaOrSpaceSeparated,
      requiredFormats: commaOrSpaceSeparated,
      resource: null,
      restart: null,
      result: null,
      rotate: null,
      rx: null,
      ry: null,
      scale: null,
      seed: null,
      shapeRendering: null,
      side: null,
      slope: null,
      snapshotTime: null,
      specularConstant: number,
      specularExponent: number,
      spreadMethod: null,
      spacing: null,
      startOffset: null,
      stdDeviation: null,
      stemh: null,
      stemv: null,
      stitchTiles: null,
      stopColor: null,
      stopOpacity: null,
      strikethroughPosition: number,
      strikethroughThickness: number,
      string: null,
      stroke: null,
      strokeDashArray: commaOrSpaceSeparated,
      strokeDashOffset: null,
      strokeLineCap: null,
      strokeLineJoin: null,
      strokeMiterLimit: number,
      strokeOpacity: number,
      strokeWidth: null,
      style: null,
      surfaceScale: number,
      syncBehavior: null,
      syncBehaviorDefault: null,
      syncMaster: null,
      syncTolerance: null,
      syncToleranceDefault: null,
      systemLanguage: commaOrSpaceSeparated,
      tabIndex: number,
      tableValues: null,
      target: null,
      targetX: number,
      targetY: number,
      textAnchor: null,
      textDecoration: null,
      textRendering: null,
      textLength: null,
      timelineBegin: null,
      title: null,
      transformBehavior: null,
      type: null,
      typeOf: commaOrSpaceSeparated,
      to: null,
      transform: null,
      transformOrigin: null,
      u1: null,
      u2: null,
      underlinePosition: number,
      underlineThickness: number,
      unicode: null,
      unicodeBidi: null,
      unicodeRange: null,
      unitsPerEm: number,
      values: null,
      vAlphabetic: number,
      vMathematical: number,
      vectorEffect: null,
      vHanging: number,
      vIdeographic: number,
      version: null,
      vertAdvY: number,
      vertOriginX: number,
      vertOriginY: number,
      viewBox: null,
      viewTarget: null,
      visibility: null,
      width: null,
      widths: null,
      wordSpacing: null,
      writingMode: null,
      x: null,
      x1: null,
      x2: null,
      xChannelSelector: null,
      xHeight: number,
      y: null,
      y1: null,
      y2: null,
      yChannelSelector: null,
      z: null,
      zoomAndPan: null
    }
  });

  /**
   * @typedef {import('./util/schema.js').Schema} Schema
   */


  const valid = /^data[-\w.:]+$/i;
  const dash = /-[a-z]/g;
  const cap = /[A-Z]/g;

  /**
   * @param {Schema} schema
   * @param {string} value
   * @returns {Info}
   */
  function find(schema, value) {
    const normal = normalize(value);
    let prop = value;
    let Type = Info;

    if (normal in schema.normal) {
      return schema.property[schema.normal[normal]]
    }

    if (normal.length > 4 && normal.slice(0, 4) === 'data' && valid.test(value)) {
      // Attribute or property.
      if (value.charAt(4) === '-') {
        // Turn it into a property.
        const rest = value.slice(5).replace(dash, camelcase);
        prop = 'data' + rest.charAt(0).toUpperCase() + rest.slice(1);
      } else {
        // Turn it into an attribute.
        const rest = value.slice(4);

        if (!dash.test(rest)) {
          let dashes = rest.replace(cap, kebab);

          if (dashes.charAt(0) !== '-') {
            dashes = '-' + dashes;
          }

          value = 'data' + dashes;
        }
      }

      Type = DefinedInfo;
    }

    return new Type(prop, value)
  }

  /**
   * @param {string} $0
   * @returns {string}
   */
  function kebab($0) {
    return '-' + $0.toLowerCase()
  }

  /**
   * @param {string} $0
   * @returns {string}
   */
  function camelcase($0) {
    return $0.charAt(1).toUpperCase()
  }

  /**
   * @typedef {import('./lib/util/info.js').Info} Info
   * @typedef {import('./lib/util/schema.js').Schema} Schema
   */

  const html$2 = merge([xml, xlink, xmlns, aria, html$3], 'html');
  const svg = merge([xml, xlink, xmlns, aria, svg$1], 'svg');

  /**
   * @typedef Options
   *   Configuration for `stringify`.
   * @property {boolean} [padLeft=true]
   *   Whether to pad a space before a token.
   * @property {boolean} [padRight=false]
   *   Whether to pad a space after a token.
   */

  /**
   * @typedef {Options} StringifyOptions
   *   Please use `StringifyOptions` instead.
   */

  /**
   * Parse comma-separated tokens to an array.
   *
   * @param {string} value
   *   Comma-separated tokens.
   * @returns {Array<string>}
   *   List of tokens.
   */
  function parse$1(value) {
    /** @type {Array<string>} */
    const tokens = [];
    const input = String(value || '');
    let index = input.indexOf(',');
    let start = 0;
    /** @type {boolean} */
    let end = false;

    while (!end) {
      if (index === -1) {
        index = input.length;
        end = true;
      }

      const token = input.slice(start, index).trim();

      if (token || !end) {
        tokens.push(token);
      }

      start = index + 1;
      index = input.indexOf(',', start);
    }

    return tokens
  }

  /**
   * Serialize an array of strings or numbers to comma-separated tokens.
   *
   * @param {Array<string|number>} values
   *   List of tokens.
   * @param {Options} [options]
   *   Configuration for `stringify` (optional).
   * @returns {string}
   *   Comma-separated tokens.
   */
  function stringify$2(values, options) {
    const settings = options || {};

    // Ensure the last empty entry is seen.
    const input = values[values.length - 1] === '' ? [...values, ''] : values;

    return input
      .join(
        (settings.padRight ? ' ' : '') +
          ',' +
          (settings.padLeft === false ? '' : ' ')
      )
      .trim()
  }

  /**
   * @typedef {import('hast').Element} Element
   * @typedef {import('hast').Properties} Properties
   */

  /**
   * @template {string} SimpleSelector
   *   Selector type.
   * @template {string} DefaultTagName
   *   Default tag name.
   * @typedef {(
   *   SimpleSelector extends ''
   *     ? DefaultTagName
   *     : SimpleSelector extends `${infer TagName}.${infer Rest}`
   *     ? ExtractTagName<TagName, DefaultTagName>
   *     : SimpleSelector extends `${infer TagName}#${infer Rest}`
   *     ? ExtractTagName<TagName, DefaultTagName>
   *     : SimpleSelector extends string
   *     ? SimpleSelector
   *     : DefaultTagName
   * )} ExtractTagName
   *   Extract tag name from a simple selector.
   */

  const search = /[#.]/g;

  /**
   * Create a hast element from a simple CSS selector.
   *
   * @template {string} Selector
   *   Type of selector.
   * @template {string} [DefaultTagName='div']
   *   Type of default tag name (default: `'div'`).
   * @param {Selector | null | undefined} [selector]
   *   Simple CSS selector (optional).
   *
   *   Can contain a tag name (`foo`), classes (`.bar`), and an ID (`#baz`).
   *   Multiple classes are allowed.
   *   Uses the last ID if multiple IDs are found.
   * @param {DefaultTagName | null | undefined} [defaultTagName='div']
   *   Tag name to use if `selector` does not specify one (default: `'div'`).
   * @returns {Element & {tagName: ExtractTagName<Selector, DefaultTagName>}}
   *   Built element.
   */
  function parseSelector(selector, defaultTagName) {
    const value = selector || '';
    /** @type {Properties} */
    const props = {};
    let start = 0;
    /** @type {string | undefined} */
    let previous;
    /** @type {string | undefined} */
    let tagName;

    while (start < value.length) {
      search.lastIndex = start;
      const match = search.exec(value);
      const subvalue = value.slice(start, match ? match.index : value.length);

      if (subvalue) {
        if (!previous) {
          tagName = subvalue;
        } else if (previous === '#') {
          props.id = subvalue;
        } else if (Array.isArray(props.className)) {
          props.className.push(subvalue);
        } else {
          props.className = [subvalue];
        }

        start += subvalue.length;
      }

      if (match) {
        previous = match[0];
        start++;
      }
    }

    return {
      type: 'element',
      // @ts-expect-error: tag name is parsed.
      tagName: tagName || defaultTagName || 'div',
      properties: props,
      children: []
    }
  }

  /**
   * Parse space-separated tokens to an array of strings.
   *
   * @param {string} value
   *   Space-separated tokens.
   * @returns {Array<string>}
   *   List of tokens.
   */
  function parse(value) {
    const input = String(value || '').trim();
    return input ? input.split(/[ \t\n\r\f]+/g) : []
  }

  /**
   * Serialize an array of strings as space separated-tokens.
   *
   * @param {Array<string|number>} values
   *   List of tokens.
   * @returns {string}
   *   Space-separated tokens.
   */
  function stringify$1(values) {
    return values.join(' ').trim()
  }

  /**
   * @typedef {import('hast').Element} Element
   * @typedef {import('hast').Nodes} Nodes
   * @typedef {import('hast').Root} Root
   * @typedef {import('hast').RootContent} RootContent
   *
   * @typedef {import('property-information').Info} Info
   * @typedef {import('property-information').Schema} Schema
   */


  const own$4 = {}.hasOwnProperty;

  /**
   * @param {Schema} schema
   *   Schema to use.
   * @param {string} defaultTagName
   *   Default tag name.
   * @param {Array<string> | undefined} [caseSensitive]
   *   Case-sensitive tag names (default: `undefined`).
   * @returns
   *   `h`.
   */
  function createH(schema, defaultTagName, caseSensitive) {
    const adjust = caseSensitive && createAdjustMap(caseSensitive);

    /**
     * Hyperscript compatible DSL for creating virtual hast trees.
     *
     * @overload
     * @param {null | undefined} [selector]
     * @param {...Child} children
     * @returns {Root}
     *
     * @overload
     * @param {string} selector
     * @param {Properties} properties
     * @param {...Child} children
     * @returns {Element}
     *
     * @overload
     * @param {string} selector
     * @param {...Child} children
     * @returns {Element}
     *
     * @param {string | null | undefined} [selector]
     *   Selector.
     * @param {Child | Properties | null | undefined} [properties]
     *   Properties (or first child) (default: `undefined`).
     * @param {...Child} children
     *   Children.
     * @returns {Result}
     *   Result.
     */
    function h(selector, properties, ...children) {
      let index = -1;
      /** @type {Result} */
      let node;

      if (selector === undefined || selector === null) {
        node = {type: 'root', children: []};
        // Properties are not supported for roots.
        const child = /** @type {Child} */ (properties);
        children.unshift(child);
      } else {
        node = parseSelector(selector, defaultTagName);
        // Normalize the name.
        node.tagName = node.tagName.toLowerCase();
        if (adjust && own$4.call(adjust, node.tagName)) {
          node.tagName = adjust[node.tagName];
        }

        // Handle props.
        if (isChild(properties)) {
          children.unshift(properties);
        } else {
          /** @type {string} */
          let key;

          for (key in properties) {
            if (own$4.call(properties, key)) {
              addProperty(schema, node.properties, key, properties[key]);
            }
          }
        }
      }

      // Handle children.
      while (++index < children.length) {
        addChild(node.children, children[index]);
      }

      if (node.type === 'element' && node.tagName === 'template') {
        node.content = {type: 'root', children: node.children};
        node.children = [];
      }

      return node
    }

    return h
  }

  /**
   * Check if something is properties or a child.
   *
   * @param {Child | Properties} value
   *   Value to check.
   * @returns {value is Child}
   *   Whether `value` is definitely a child.
   */
  function isChild(value) {
    // Never properties if not an object.
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      return true
    }

    // Never node without `type`; that’s the main discriminator.
    if (typeof value.type !== 'string') return false

    // Slower check: never property value if object or array with
    // non-number/strings.
    const record = /** @type {Record<string, unknown>} */ (value);
    const keys = Object.keys(value);

    for (const key of keys) {
      const value = record[key];

      if (value && typeof value === 'object') {
        if (!Array.isArray(value)) return true

        const list = /** @type {Array<unknown>} */ (value);

        for (const item of list) {
          if (typeof item !== 'number' && typeof item !== 'string') {
            return true
          }
        }
      }
    }

    // Also see empty `children` as a node.
    if ('children' in value && Array.isArray(value.children)) {
      return true
    }

    // Default to properties, someone can always pass an empty object,
    // put `data: {}` in a node,
    // or wrap it in an array.
    return false
  }

  /**
   * @param {Schema} schema
   *   Schema.
   * @param {Properties} properties
   *   Properties object.
   * @param {string} key
   *   Property name.
   * @param {PropertyValue | Style} value
   *   Property value.
   * @returns {undefined}
   *   Nothing.
   */
  function addProperty(schema, properties, key, value) {
    const info = find(schema, key);
    let index = -1;
    /** @type {PropertyValue} */
    let result;

    // Ignore nullish and NaN values.
    if (value === undefined || value === null) return

    if (typeof value === 'number') {
      // Ignore NaN.
      if (Number.isNaN(value)) return

      result = value;
    }
    // Booleans.
    else if (typeof value === 'boolean') {
      result = value;
    }
    // Handle list values.
    else if (typeof value === 'string') {
      if (info.spaceSeparated) {
        result = parse(value);
      } else if (info.commaSeparated) {
        result = parse$1(value);
      } else if (info.commaOrSpaceSeparated) {
        result = parse(parse$1(value).join(' '));
      } else {
        result = parsePrimitive(info, info.property, value);
      }
    } else if (Array.isArray(value)) {
      result = value.concat();
    } else {
      result = info.property === 'style' ? style(value) : String(value);
    }

    if (Array.isArray(result)) {
      /** @type {Array<number | string>} */
      const finalResult = [];

      while (++index < result.length) {
        // Assume no booleans in array.
        const value = /** @type {number | string} */ (
          parsePrimitive(info, info.property, result[index])
        );
        finalResult[index] = value;
      }

      result = finalResult;
    }

    // Class names (which can be added both on the `selector` and here).
    if (info.property === 'className' && Array.isArray(properties.className)) {
      // Assume no booleans in `className`.
      const value = /** @type {number | string} */ (result);
      result = properties.className.concat(value);
    }

    properties[info.property] = result;
  }

  /**
   * @param {Array<RootContent>} nodes
   *   Children.
   * @param {Child} value
   *   Child.
   * @returns {undefined}
   *   Nothing.
   */
  function addChild(nodes, value) {
    let index = -1;

    if (value === undefined || value === null) ; else if (typeof value === 'string' || typeof value === 'number') {
      nodes.push({type: 'text', value: String(value)});
    } else if (Array.isArray(value)) {
      while (++index < value.length) {
        addChild(nodes, value[index]);
      }
    } else if (typeof value === 'object' && 'type' in value) {
      if (value.type === 'root') {
        addChild(nodes, value.children);
      } else {
        nodes.push(value);
      }
    } else {
      throw new Error('Expected node, nodes, or string, got `' + value + '`')
    }
  }

  /**
   * Parse a single primitives.
   *
   * @param {Info} info
   *   Property information.
   * @param {string} name
   *   Property name.
   * @param {PrimitiveValue} value
   *   Property value.
   * @returns {PrimitiveValue}
   *   Property value.
   */
  function parsePrimitive(info, name, value) {
    if (typeof value === 'string') {
      if (info.number && value && !Number.isNaN(Number(value))) {
        return Number(value)
      }

      if (
        (info.boolean || info.overloadedBoolean) &&
        (value === '' || normalize(value) === normalize(name))
      ) {
        return true
      }
    }

    return value
  }

  /**
   * Serialize a `style` object as a string.
   *
   * @param {Style} value
   *   Style object.
   * @returns {string}
   *   CSS string.
   */
  function style(value) {
    /** @type {Array<string>} */
    const result = [];
    /** @type {string} */
    let key;

    for (key in value) {
      if (own$4.call(value, key)) {
        result.push([key, value[key]].join(': '));
      }
    }

    return result.join('; ')
  }

  /**
   * Create a map to adjust casing.
   *
   * @param {Array<string>} values
   *   List of properly cased keys.
   * @returns {Record<string, string>}
   *   Map of lowercase keys to uppercase keys.
   */
  function createAdjustMap(values) {
    /** @type {Record<string, string>} */
    const result = {};
    let index = -1;

    while (++index < values.length) {
      result[values[index].toLowerCase()] = values[index];
    }

    return result
  }

  const svgCaseSensitiveTagNames = [
    'altGlyph',
    'altGlyphDef',
    'altGlyphItem',
    'animateColor',
    'animateMotion',
    'animateTransform',
    'clipPath',
    'feBlend',
    'feColorMatrix',
    'feComponentTransfer',
    'feComposite',
    'feConvolveMatrix',
    'feDiffuseLighting',
    'feDisplacementMap',
    'feDistantLight',
    'feDropShadow',
    'feFlood',
    'feFuncA',
    'feFuncB',
    'feFuncG',
    'feFuncR',
    'feGaussianBlur',
    'feImage',
    'feMerge',
    'feMergeNode',
    'feMorphology',
    'feOffset',
    'fePointLight',
    'feSpecularLighting',
    'feSpotLight',
    'feTile',
    'feTurbulence',
    'foreignObject',
    'glyphRef',
    'linearGradient',
    'radialGradient',
    'solidColor',
    'textArea',
    'textPath'
  ];

  /**
   * @typedef {import('./create-h.js').Child} Child
   *   Acceptable child value.
   * @typedef {import('./create-h.js').Properties} Properties
   *   Acceptable value for element properties.
   * @typedef {import('./create-h.js').Result} Result
   *   Result from a `h` (or `s`) call.
   */


  // Note: this explicit type is needed, otherwise TS creates broken types.
  /** @type {ReturnType<createH>} */
  const h = createH(html$2, 'div');

  // Note: this explicit type is needed, otherwise TS creates broken types.
  /** @type {ReturnType<createH>} */
  createH(svg, 'g', svgCaseSensitiveTagNames);

  // THIS FILE IS AUTOMATICALLY GENERATED DO NOT EDIT DIRECTLY
  // See update-tlds.js for encoding/decoding format
  // https://data.iana.org/TLD/tlds-alpha-by-domain.txt
  const encodedTlds = 'aaa1rp3bb0ott3vie4c1le2ogado5udhabi7c0ademy5centure6ountant0s9o1tor4d0s1ult4e0g1ro2tna4f0l1rica5g0akhan5ency5i0g1rbus3force5tel5kdn3l0ibaba4pay4lfinanz6state5y2sace3tom5m0azon4ericanexpress7family11x2fam3ica3sterdam8nalytics7droid5quan4z2o0l2partments8p0le4q0uarelle8r0ab1mco4chi3my2pa2t0e3s0da2ia2sociates9t0hleta5torney7u0ction5di0ble3o3spost5thor3o0s4vianca6w0s2x0a2z0ure5ba0by2idu3namex3narepublic11d1k2r0celona5laycard4s5efoot5gains6seball5ketball8uhaus5yern5b0c1t1va3cg1n2d1e0ats2uty4er2ntley5rlin4st0buy5t2f1g1h0arti5i0ble3d1ke2ng0o3o1z2j1lack0friday9ockbuster8g1omberg7ue3m0s1w2n0pparibas9o0ats3ehringer8fa2m1nd2o0k0ing5sch2tik2on4t1utique6x2r0adesco6idgestone9oadway5ker3ther5ussels7s1t1uild0ers6siness6y1zz3v1w1y1z0h3ca0b1fe2l0l1vinklein9m0era3p2non3petown5ital0one8r0avan4ds2e0er0s4s2sa1e1h1ino4t0ering5holic7ba1n1re3c1d1enter4o1rn3f0a1d2g1h0anel2nel4rity4se2t2eap3intai5ristmas6ome4urch5i0priani6rcle4sco3tadel4i0c2y3k1l0aims4eaning6ick2nic1que6othing5ud3ub0med6m1n1o0ach3des3ffee4llege4ogne5m0cast4mbank4unity6pany2re3uter5sec4ndos3struction8ulting7tact3ractors9oking4l1p2rsica5untry4pon0s4rses6pa2r0edit0card4union9icket5own3s1uise0s6u0isinella9v1w1x1y0mru3ou3z2dabur3d1nce3ta1e1ing3sun4y2clk3ds2e0al0er2s3gree4livery5l1oitte5ta3mocrat6ntal2ist5si0gn4v2hl2iamonds6et2gital5rect0ory7scount3ver5h2y2j1k1m1np2o0cs1tor4g1mains5t1wnload7rive4tv2ubai3nlop4pont4rban5vag2r2z2earth3t2c0o2deka3u0cation8e1g1mail3erck5nergy4gineer0ing9terprises10pson4quipment8r0icsson6ni3s0q1tate5t1u0rovision8s2vents5xchange6pert3osed4ress5traspace10fage2il1rwinds6th3mily4n0s2rm0ers5shion4t3edex3edback6rrari3ero6i0delity5o2lm2nal1nce1ial7re0stone6mdale6sh0ing5t0ness6j1k1lickr3ghts4r2orist4wers5y2m1o0o0d1tball6rd1ex2sale4um3undation8x2r0ee1senius7l1ogans4ntier7tr2ujitsu5n0d2rniture7tbol5yi3ga0l0lery3o1up4me0s3p1rden4y2b0iz3d0n2e0a1nt0ing5orge5f1g0ee3h1i0ft0s3ves2ing5l0ass3e1obal2o4m0ail3bh2o1x2n1odaddy5ld0point6f2o0dyear5g0le4p1t1v2p1q1r0ainger5phics5tis4een3ipe3ocery4up4s1t1u0ardian6cci3ge2ide2tars5ru3w1y2hair2mburg5ngout5us3bo2dfc0bank7ealth0care8lp1sinki6re1mes5iphop4samitsu7tachi5v2k0t2m1n1ockey4ldings5iday5medepot5goods5s0ense7nda3rse3spital5t0ing5t0els3mail5use3w2r1sbc3t1u0ghes5yatt3undai7ibm2cbc2e1u2d1e0ee3fm2kano4l1m0amat4db2mo0bilien9n0c1dustries8finiti5o2g1k1stitute6urance4e4t0ernational10uit4vestments10o1piranga7q1r0ish4s0maili5t0anbul7t0au2v3jaguar4va3cb2e0ep2tzt3welry6io2ll2m0p2nj2o0bs1urg4t1y2p0morgan6rs3uegos4niper7kaufen5ddi3e0rryhotels6logistics9properties14fh2g1h1i0a1ds2m1ndle4tchen5wi3m1n1oeln3matsu5sher5p0mg2n2r0d1ed3uokgroup8w1y0oto4z2la0caixa5mborghini8er3ncaster6d0rover6xess5salle5t0ino3robe5w0yer5b1c1ds2ease3clerc5frak4gal2o2xus4gbt3i0dl2fe0insurance9style7ghting6ke2lly3mited4o2ncoln4k2psy3ve1ing5k1lc1p2oan0s3cker3us3l1ndon4tte1o3ve3pl0financial11r1s1t0d0a3u0ndbeck6xe1ury5v1y2ma0drid4if1son4keup4n0agement7go3p1rket0ing3s4riott5shalls7ttel5ba2c0kinsey7d1e0d0ia3et2lbourne7me1orial6n0u2rckmsd7g1h1iami3crosoft7l1ni1t2t0subishi9k1l0b1s2m0a2n1o0bi0le4da2e1i1m1nash3ey2ster5rmon3tgage6scow4to0rcycles9v0ie4p1q1r1s0d2t0n1r2u0seum3ic4v1w1x1y1z2na0b1goya4me2tura4vy3ba2c1e0c1t0bank4flix4work5ustar5w0s2xt0direct7us4f0l2g0o2hk2i0co2ke1on3nja3ssan1y5l1o0kia3rton4w0ruz3tv4p1r0a1w2tt2u1yc2z2obi1server7ffice5kinawa6layan0group9dnavy5lo3m0ega4ne1g1l0ine5oo2pen3racle3nge4g0anic5igins6saka4tsuka4t2vh3pa0ge2nasonic7ris2s1tners4s1y3y2ccw3e0t2f0izer5g1h0armacy6d1ilips5one2to0graphy6s4ysio5ics1tet2ures6d1n0g1k2oneer5zza4k1l0ace2y0station9umbing5s3m1n0c2ohl2ker3litie5rn2st3r0america6xi3ess3ime3o0d0uctions8f1gressive8mo2perties3y5tection8u0dential9s1t1ub2w0c2y2qa1pon3uebec3st5racing4dio4e0ad1lestate6tor2y4cipes5d0stone5umbrella9hab3ise0n3t2liance6n0t0als5pair3ort3ublican8st0aurant8view0s5xroth6ich0ardli6oh3l1o1p2o0cks3deo3gers4om3s0vp3u0gby3hr2n2w0e2yukyu6sa0arland6fe0ty4kura4le1on3msclub4ung5ndvik0coromant12ofi4p1rl2s1ve2xo3b0i1s2c0a1b1haeffler7midt4olarships8ol3ule3warz5ience5ot3d1e0arch3t2cure1ity6ek2lect4ner3rvices6ven3w1x0y3fr2g1h0angrila6rp2w2ell3ia1ksha5oes2p0ping5uji3w3i0lk2na1gles5te3j1k0i0n2y0pe4l0ing4m0art3ile4n0cf3o0ccer3ial4ftbank4ware6hu2lar2utions7ng1y2y2pa0ce3ort2t3r0l2s1t0ada2ples4r1tebank4farm7c0group6ockholm6rage3e3ream4udio2y3yle4u0cks3pplies3y2ort5rf1gery5zuki5v1watch4iss4x1y0dney4stems6z2tab1ipei4lk2obao4rget4tamotors6r2too4x0i3c0i2d0k2eam2ch0nology8l1masek5nnis4va3f1g1h0d1eater2re6iaa2ckets5enda4ps2res2ol4j0maxx4x2k0maxx5l1m0all4n1o0day3kyo3ols3p1ray3shiba5tal3urs3wn2yota3s3r0ade1ing4ining5vel0ers0insurance16ust3v2t1ube2i1nes3shu4v0s2w1z2ua1bank3s2g1k1nicom3versity8o2ol2ps2s1y1z2va0cations7na1guard7c1e0gas3ntures6risign5mögensberater2ung14sicherung10t2g1i0ajes4deo3g1king4llas4n1p1rgin4sa1ion4va1o3laanderen9n1odka3lvo3te1ing3o2yage5u2wales2mart4ter4ng0gou5tch0es6eather0channel12bcam3er2site5d0ding5ibo2r3f1hoswho6ien2ki2lliamhill9n0dows4e1ners6me2olterskluwer11odside6rk0s2ld3w2s1tc1f3xbox3erox4finity6ihuan4n2xx2yz3yachts4hoo3maxun5ndex5e1odobashi7ga2kohama6u0tube6t1un3za0ppos4ra3ero3ip2m1one3uerich6w2';
  // Internationalized domain names containing non-ASCII
  const encodedUtlds = 'ελ1υ2бг1ел3дети4ею2католик6ом3мкд2он1сква6онлайн5рг3рус2ф2сайт3рб3укр3қаз3հայ3ישראל5קום3ابوظبي5رامكو5لاردن4بحرين5جزائر5سعودية6عليان5مغرب5مارات5یران5بارت2زار4يتك3ھارت5تونس4سودان3رية5شبكة4عراق2ب2مان4فلسطين6قطر3كاثوليك6وم3مصر2ليسيا5وريتانيا7قع4همراه5پاکستان7ڀارت4कॉम3नेट3भारत0म्3ोत5संगठन5বাংলা5ভারত2ৰত4ਭਾਰਤ4ભારત4ଭାରତ4இந்தியா6லங்கை6சிங்கப்பூர்11భారత్5ಭಾರತ4ഭാരതം5ලංකා4คอม3ไทย3ລາວ3გე2みんな3アマゾン4クラウド4グーグル4コム2ストア3セール3ファッション6ポイント4世界2中信1国1國1文网3亚马逊3企业2佛山2信息2健康2八卦2公司1益2台湾1灣2商城1店1标2嘉里0大酒店5在线2大拿2天主教3娱乐2家電2广东2微博2慈善2我爱你3手机2招聘2政务1府2新加坡2闻2时尚2書籍2机构2淡马锡3游戏2澳門2点看2移动2组织机构4网址1店1站1络2联通2谷歌2购物2通販2集团2電訊盈科4飞利浦3食品2餐厅2香格里拉3港2닷넷1컴2삼성2한국2';

  /**
   * @template A
   * @template B
   * @param {A} target
   * @param {B} properties
   * @return {A & B}
   */
  const assign = (target, properties) => {
    for (const key in properties) {
      target[key] = properties[key];
    }
    return target;
  };

  /**
   * Finite State Machine generation utilities
   */

  /**
   * @template T
   * @typedef {{ [group: string]: T[] }} Collections
   */

  /**
   * @typedef {{ [group: string]: true }} Flags
   */

  // Keys in scanner Collections instances
  const numeric = 'numeric';
  const ascii = 'ascii';
  const alpha = 'alpha';
  const asciinumeric = 'asciinumeric';
  const alphanumeric = 'alphanumeric';
  const domain = 'domain';
  const emoji = 'emoji';
  const scheme = 'scheme';
  const slashscheme = 'slashscheme';
  const whitespace$1 = 'whitespace';

  /**
   * @template T
   * @param {string} name
   * @param {Collections<T>} groups to register in
   * @returns {T[]} Current list of tokens in the given collection
   */
  function registerGroup(name, groups) {
    if (!(name in groups)) {
      groups[name] = [];
    }
    return groups[name];
  }

  /**
   * @template T
   * @param {T} t token to add
   * @param {Collections<T>} groups
   * @param {Flags} flags
   */
  function addToGroups(t, flags, groups) {
    if (flags[numeric]) {
      flags[asciinumeric] = true;
      flags[alphanumeric] = true;
    }
    if (flags[ascii]) {
      flags[asciinumeric] = true;
      flags[alpha] = true;
    }
    if (flags[asciinumeric]) {
      flags[alphanumeric] = true;
    }
    if (flags[alpha]) {
      flags[alphanumeric] = true;
    }
    if (flags[alphanumeric]) {
      flags[domain] = true;
    }
    if (flags[emoji]) {
      flags[domain] = true;
    }
    for (const k in flags) {
      const group = registerGroup(k, groups);
      if (group.indexOf(t) < 0) {
        group.push(t);
      }
    }
  }

  /**
   * @template T
   * @param {T} t token to check
   * @param {Collections<T>} groups
   * @returns {Flags} group flags that contain this token
   */
  function flagsForToken(t, groups) {
    const result = {};
    for (const c in groups) {
      if (groups[c].indexOf(t) >= 0) {
        result[c] = true;
      }
    }
    return result;
  }

  /**
   * @template T
   * @typedef {null | T } Transition
   */

  /**
   * Define a basic state machine state. j is the list of character transitions,
   * jr is the list of regex-match transitions, jd is the default state to
   * transition to t is the accepting token type, if any. If this is the terminal
   * state, then it does not emit a token.
   *
   * The template type T represents the type of the token this state accepts. This
   * should be a string (such as of the token exports in `text.js`) or a
   * MultiToken subclass (from `multi.js`)
   *
   * @template T
   * @param {T} [token] Token that this state emits
   */
  function State$1(token) {
    if (token === void 0) {
      token = null;
    }
    // this.n = null; // DEBUG: State name
    /** @type {{ [input: string]: State<T> }} j */
    this.j = {}; // IMPLEMENTATION 1
    // this.j = []; // IMPLEMENTATION 2
    /** @type {[RegExp, State<T>][]} jr */
    this.jr = [];
    /** @type {?State<T>} jd */
    this.jd = null;
    /** @type {?T} t */
    this.t = token;
  }

  /**
   * Scanner token groups
   * @type Collections<string>
   */
  State$1.groups = {};
  State$1.prototype = {
    accepts() {
      return !!this.t;
    },
    /**
     * Follow an existing transition from the given input to the next state.
     * Does not mutate.
     * @param {string} input character or token type to transition on
     * @returns {?State<T>} the next state, if any
     */
    go(input) {
      const state = this;
      const nextState = state.j[input];
      if (nextState) {
        return nextState;
      }
      for (let i = 0; i < state.jr.length; i++) {
        const regex = state.jr[i][0];
        const nextState = state.jr[i][1]; // note: might be empty to prevent default jump
        if (nextState && regex.test(input)) {
          return nextState;
        }
      }
      // Nowhere left to jump! Return default, if any
      return state.jd;
    },
    /**
     * Whether the state has a transition for the given input. Set the second
     * argument to true to only look for an exact match (and not a default or
     * regular-expression-based transition)
     * @param {string} input
     * @param {boolean} exactOnly
     */
    has(input, exactOnly) {
      if (exactOnly === void 0) {
        exactOnly = false;
      }
      return exactOnly ? input in this.j : !!this.go(input);
    },
    /**
     * Short for "transition all"; create a transition from the array of items
     * in the given list to the same final resulting state.
     * @param {string | string[]} inputs Group of inputs to transition on
     * @param {Transition<T> | State<T>} [next] Transition options
     * @param {Flags} [flags] Collections flags to add token to
     * @param {Collections<T>} [groups] Master list of token groups
     */
    ta(inputs, next, flags, groups) {
      for (let i = 0; i < inputs.length; i++) {
        this.tt(inputs[i], next, flags, groups);
      }
    },
    /**
     * Short for "take regexp transition"; defines a transition for this state
     * when it encounters a token which matches the given regular expression
     * @param {RegExp} regexp Regular expression transition (populate first)
     * @param {T | State<T>} [next] Transition options
     * @param {Flags} [flags] Collections flags to add token to
     * @param {Collections<T>} [groups] Master list of token groups
     * @returns {State<T>} taken after the given input
     */
    tr(regexp, next, flags, groups) {
      groups = groups || State$1.groups;
      let nextState;
      if (next && next.j) {
        nextState = next;
      } else {
        // Token with maybe token groups
        nextState = new State$1(next);
        if (flags && groups) {
          addToGroups(next, flags, groups);
        }
      }
      this.jr.push([regexp, nextState]);
      return nextState;
    },
    /**
     * Short for "take transitions", will take as many sequential transitions as
     * the length of the given input and returns the
     * resulting final state.
     * @param {string | string[]} input
     * @param {T | State<T>} [next] Transition options
     * @param {Flags} [flags] Collections flags to add token to
     * @param {Collections<T>} [groups] Master list of token groups
     * @returns {State<T>} taken after the given input
     */
    ts(input, next, flags, groups) {
      let state = this;
      const len = input.length;
      if (!len) {
        return state;
      }
      for (let i = 0; i < len - 1; i++) {
        state = state.tt(input[i]);
      }
      return state.tt(input[len - 1], next, flags, groups);
    },
    /**
     * Short for "take transition", this is a method for building/working with
     * state machines.
     *
     * If a state already exists for the given input, returns it.
     *
     * If a token is specified, that state will emit that token when reached by
     * the linkify engine.
     *
     * If no state exists, it will be initialized with some default transitions
     * that resemble existing default transitions.
     *
     * If a state is given for the second argument, that state will be
     * transitioned to on the given input regardless of what that input
     * previously did.
     *
     * Specify a token group flags to define groups that this token belongs to.
     * The token will be added to corresponding entires in the given groups
     * object.
     *
     * @param {string} input character, token type to transition on
     * @param {T | State<T>} [next] Transition options
     * @param {Flags} [flags] Collections flags to add token to
     * @param {Collections<T>} [groups] Master list of groups
     * @returns {State<T>} taken after the given input
     */
    tt(input, next, flags, groups) {
      groups = groups || State$1.groups;
      const state = this;

      // Check if existing state given, just a basic transition
      if (next && next.j) {
        state.j[input] = next;
        return next;
      }
      const t = next;

      // Take the transition with the usual default mechanisms and use that as
      // a template for creating the next state
      let nextState,
        templateState = state.go(input);
      if (templateState) {
        nextState = new State$1();
        assign(nextState.j, templateState.j);
        nextState.jr.push.apply(nextState.jr, templateState.jr);
        nextState.jd = templateState.jd;
        nextState.t = templateState.t;
      } else {
        nextState = new State$1();
      }
      if (t) {
        // Ensure newly token is in the same groups as the old token
        if (groups) {
          if (nextState.t && typeof nextState.t === 'string') {
            const allFlags = assign(flagsForToken(nextState.t, groups), flags);
            addToGroups(t, allFlags, groups);
          } else if (flags) {
            addToGroups(t, flags, groups);
          }
        }
        nextState.t = t; // overwrite anything that was previously there
      }

      state.j[input] = nextState;
      return nextState;
    }
  };

  // Helper functions to improve minification (not exported outside linkifyjs module)

  /**
   * @template T
   * @param {State<T>} state
   * @param {string | string[]} input
   * @param {Flags} [flags]
   * @param {Collections<T>} [groups]
   */
  const ta = (state, input, next, flags, groups) => state.ta(input, next, flags, groups);

  /**
   * @template T
   * @param {State<T>} state
   * @param {RegExp} regexp
   * @param {T | State<T>} [next]
   * @param {Flags} [flags]
   * @param {Collections<T>} [groups]
   */
  const tr$1 = (state, regexp, next, flags, groups) => state.tr(regexp, next, flags, groups);

  /**
   * @template T
   * @param {State<T>} state
   * @param {string | string[]} input
   * @param {T | State<T>} [next]
   * @param {Flags} [flags]
   * @param {Collections<T>} [groups]
   */
  const ts = (state, input, next, flags, groups) => state.ts(input, next, flags, groups);

  /**
   * @template T
   * @param {State<T>} state
   * @param {string} input
   * @param {T | State<T>} [next]
   * @param {Collections<T>} [groups]
   * @param {Flags} [flags]
   */
  const tt = (state, input, next, flags, groups) => state.tt(input, next, flags, groups);

  /******************************************************************************
  Text Tokens
  Identifiers for token outputs from the regexp scanner
  ******************************************************************************/

  // A valid web domain token
  const WORD = 'WORD'; // only contains a-z
  const UWORD = 'UWORD'; // contains letters other than a-z, used for IDN

  // Special case of word
  const LOCALHOST = 'LOCALHOST';

  // Valid top-level domain, special case of WORD (see tlds.js)
  const TLD = 'TLD';

  // Valid IDN TLD, special case of UWORD (see tlds.js)
  const UTLD = 'UTLD';

  // The scheme portion of a web URI protocol. Supported types include: `mailto`,
  // `file`, and user-defined custom protocols. Limited to schemes that contain
  // only letters
  const SCHEME = 'SCHEME';

  // Similar to SCHEME, except makes distinction for schemes that must always be
  // followed by `://`, not just `:`. Supported types include `http`, `https`,
  // `ftp`, `ftps`
  const SLASH_SCHEME = 'SLASH_SCHEME';

  // Any sequence of digits 0-9
  const NUM = 'NUM';

  // Any number of consecutive whitespace characters that are not newline
  const WS = 'WS';

  // New line (unix style)
  const NL$1 = 'NL'; // \n

  // Opening/closing bracket classes
  // TODO: Rename OPEN -> LEFT and CLOSE -> RIGHT in v5 to fit with Unicode names
  // Also rename angle brackes to LESSTHAN and GREATER THAN
  const OPENBRACE = 'OPENBRACE'; // {
  const CLOSEBRACE = 'CLOSEBRACE'; // }
  const OPENBRACKET = 'OPENBRACKET'; // [
  const CLOSEBRACKET = 'CLOSEBRACKET'; // ]
  const OPENPAREN = 'OPENPAREN'; // (
  const CLOSEPAREN = 'CLOSEPAREN'; // )
  const OPENANGLEBRACKET = 'OPENANGLEBRACKET'; // <
  const CLOSEANGLEBRACKET = 'CLOSEANGLEBRACKET'; // >
  const FULLWIDTHLEFTPAREN = 'FULLWIDTHLEFTPAREN'; // （
  const FULLWIDTHRIGHTPAREN = 'FULLWIDTHRIGHTPAREN'; // ）
  const LEFTCORNERBRACKET = 'LEFTCORNERBRACKET'; // 「
  const RIGHTCORNERBRACKET = 'RIGHTCORNERBRACKET'; // 」
  const LEFTWHITECORNERBRACKET = 'LEFTWHITECORNERBRACKET'; // 『
  const RIGHTWHITECORNERBRACKET = 'RIGHTWHITECORNERBRACKET'; // 』
  const FULLWIDTHLESSTHAN = 'FULLWIDTHLESSTHAN'; // ＜
  const FULLWIDTHGREATERTHAN = 'FULLWIDTHGREATERTHAN'; // ＞

  // Various symbols
  const AMPERSAND = 'AMPERSAND'; // &
  const APOSTROPHE = 'APOSTROPHE'; // '
  const ASTERISK = 'ASTERISK'; // *
  const AT = 'AT'; // @
  const BACKSLASH = 'BACKSLASH'; // \
  const BACKTICK = 'BACKTICK'; // `
  const CARET = 'CARET'; // ^
  const COLON = 'COLON'; // :
  const COMMA = 'COMMA'; // ,
  const DOLLAR = 'DOLLAR'; // $
  const DOT = 'DOT'; // .
  const EQUALS = 'EQUALS'; // =
  const EXCLAMATION = 'EXCLAMATION'; // !
  const HYPHEN = 'HYPHEN'; // -
  const PERCENT = 'PERCENT'; // %
  const PIPE = 'PIPE'; // |
  const PLUS = 'PLUS'; // +
  const POUND = 'POUND'; // #
  const QUERY = 'QUERY'; // ?
  const QUOTE = 'QUOTE'; // "

  const SEMI = 'SEMI'; // ;
  const SLASH = 'SLASH'; // /
  const TILDE = 'TILDE'; // ~
  const UNDERSCORE = 'UNDERSCORE'; // _

  // Emoji symbol
  const EMOJI$1 = 'EMOJI';

  // Default token - anything that is not one of the above
  const SYM = 'SYM';

  var tk = /*#__PURE__*/Object.freeze({
  	__proto__: null,
  	WORD: WORD,
  	UWORD: UWORD,
  	LOCALHOST: LOCALHOST,
  	TLD: TLD,
  	UTLD: UTLD,
  	SCHEME: SCHEME,
  	SLASH_SCHEME: SLASH_SCHEME,
  	NUM: NUM,
  	WS: WS,
  	NL: NL$1,
  	OPENBRACE: OPENBRACE,
  	CLOSEBRACE: CLOSEBRACE,
  	OPENBRACKET: OPENBRACKET,
  	CLOSEBRACKET: CLOSEBRACKET,
  	OPENPAREN: OPENPAREN,
  	CLOSEPAREN: CLOSEPAREN,
  	OPENANGLEBRACKET: OPENANGLEBRACKET,
  	CLOSEANGLEBRACKET: CLOSEANGLEBRACKET,
  	FULLWIDTHLEFTPAREN: FULLWIDTHLEFTPAREN,
  	FULLWIDTHRIGHTPAREN: FULLWIDTHRIGHTPAREN,
  	LEFTCORNERBRACKET: LEFTCORNERBRACKET,
  	RIGHTCORNERBRACKET: RIGHTCORNERBRACKET,
  	LEFTWHITECORNERBRACKET: LEFTWHITECORNERBRACKET,
  	RIGHTWHITECORNERBRACKET: RIGHTWHITECORNERBRACKET,
  	FULLWIDTHLESSTHAN: FULLWIDTHLESSTHAN,
  	FULLWIDTHGREATERTHAN: FULLWIDTHGREATERTHAN,
  	AMPERSAND: AMPERSAND,
  	APOSTROPHE: APOSTROPHE,
  	ASTERISK: ASTERISK,
  	AT: AT,
  	BACKSLASH: BACKSLASH,
  	BACKTICK: BACKTICK,
  	CARET: CARET,
  	COLON: COLON,
  	COMMA: COMMA,
  	DOLLAR: DOLLAR,
  	DOT: DOT,
  	EQUALS: EQUALS,
  	EXCLAMATION: EXCLAMATION,
  	HYPHEN: HYPHEN,
  	PERCENT: PERCENT,
  	PIPE: PIPE,
  	PLUS: PLUS,
  	POUND: POUND,
  	QUERY: QUERY,
  	QUOTE: QUOTE,
  	SEMI: SEMI,
  	SLASH: SLASH,
  	TILDE: TILDE,
  	UNDERSCORE: UNDERSCORE,
  	EMOJI: EMOJI$1,
  	SYM: SYM
  });

  // Note that these two Unicode ones expand into a really big one with Babel
  const ASCII_LETTER = /[a-z]/;
  const LETTER = /\p{L}/u; // Any Unicode character with letter data type
  const EMOJI = /\p{Emoji}/u; // Any Unicode emoji character
  const DIGIT = /\d/;
  const SPACE = /\s/;

  /**
  	The scanner provides an interface that takes a string of text as input, and
  	outputs an array of tokens instances that can be used for easy URL parsing.
  */
  const NL = '\n'; // New line character
  const EMOJI_VARIATION = '\ufe0f'; // Variation selector, follows heart and others
  const EMOJI_JOINER = '\u200d'; // zero-width joiner

  let tlds = null,
    utlds = null; // don't change so only have to be computed once

  /**
   * Scanner output token:
   * - `t` is the token name (e.g., 'NUM', 'EMOJI', 'TLD')
   * - `v` is the value of the token (e.g., '123', '❤️', 'com')
   * - `s` is the start index of the token in the original string
   * - `e` is the end index of the token in the original string
   * @typedef {{t: string, v: string, s: number, e: number}} Token
   */

  /**
   * @template T
   * @typedef {{ [collection: string]: T[] }} Collections
   */

  /**
   * Initialize the scanner character-based state machine for the given start
   * state
   * @param {[string, boolean][]} customSchemes List of custom schemes, where each
   * item is a length-2 tuple with the first element set to the string scheme, and
   * the second element set to `true` if the `://` after the scheme is optional
   */
  function init$2(customSchemes) {
    if (customSchemes === void 0) {
      customSchemes = [];
    }
    // Frequently used states (name argument removed during minification)
    /** @type Collections<string> */
    const groups = {}; // of tokens
    State$1.groups = groups;
    /** @type State<string> */
    const Start = new State$1();
    if (tlds == null) {
      tlds = decodeTlds(encodedTlds);
    }
    if (utlds == null) {
      utlds = decodeTlds(encodedUtlds);
    }

    // States for special URL symbols that accept immediately after start
    tt(Start, "'", APOSTROPHE);
    tt(Start, '{', OPENBRACE);
    tt(Start, '}', CLOSEBRACE);
    tt(Start, '[', OPENBRACKET);
    tt(Start, ']', CLOSEBRACKET);
    tt(Start, '(', OPENPAREN);
    tt(Start, ')', CLOSEPAREN);
    tt(Start, '<', OPENANGLEBRACKET);
    tt(Start, '>', CLOSEANGLEBRACKET);
    tt(Start, '（', FULLWIDTHLEFTPAREN);
    tt(Start, '）', FULLWIDTHRIGHTPAREN);
    tt(Start, '「', LEFTCORNERBRACKET);
    tt(Start, '」', RIGHTCORNERBRACKET);
    tt(Start, '『', LEFTWHITECORNERBRACKET);
    tt(Start, '』', RIGHTWHITECORNERBRACKET);
    tt(Start, '＜', FULLWIDTHLESSTHAN);
    tt(Start, '＞', FULLWIDTHGREATERTHAN);
    tt(Start, '&', AMPERSAND);
    tt(Start, '*', ASTERISK);
    tt(Start, '@', AT);
    tt(Start, '`', BACKTICK);
    tt(Start, '^', CARET);
    tt(Start, ':', COLON);
    tt(Start, ',', COMMA);
    tt(Start, '$', DOLLAR);
    tt(Start, '.', DOT);
    tt(Start, '=', EQUALS);
    tt(Start, '!', EXCLAMATION);
    tt(Start, '-', HYPHEN);
    tt(Start, '%', PERCENT);
    tt(Start, '|', PIPE);
    tt(Start, '+', PLUS);
    tt(Start, '#', POUND);
    tt(Start, '?', QUERY);
    tt(Start, '"', QUOTE);
    tt(Start, '/', SLASH);
    tt(Start, ';', SEMI);
    tt(Start, '~', TILDE);
    tt(Start, '_', UNDERSCORE);
    tt(Start, '\\', BACKSLASH);
    const Num = tr$1(Start, DIGIT, NUM, {
      [numeric]: true
    });
    tr$1(Num, DIGIT, Num);

    // State which emits a word token
    const Word = tr$1(Start, ASCII_LETTER, WORD, {
      [ascii]: true
    });
    tr$1(Word, ASCII_LETTER, Word);

    // Same as previous, but specific to non-fsm.ascii alphabet words
    const UWord = tr$1(Start, LETTER, UWORD, {
      [alpha]: true
    });
    tr$1(UWord, ASCII_LETTER); // Non-accepting
    tr$1(UWord, LETTER, UWord);

    // Whitespace jumps
    // Tokens of only non-newline whitespace are arbitrarily long
    // If any whitespace except newline, more whitespace!
    const Ws = tr$1(Start, SPACE, WS, {
      [whitespace$1]: true
    });
    tt(Start, NL, NL$1, {
      [whitespace$1]: true
    });
    tt(Ws, NL); // non-accepting state to avoid mixing whitespaces
    tr$1(Ws, SPACE, Ws);

    // Emoji tokens. They are not grouped by the scanner except in cases where a
    // zero-width joiner is present
    const Emoji = tr$1(Start, EMOJI, EMOJI$1, {
      [emoji]: true
    });
    tr$1(Emoji, EMOJI, Emoji);
    tt(Emoji, EMOJI_VARIATION, Emoji);
    // tt(Start, EMOJI_VARIATION, Emoji); // This one is sketchy

    const EmojiJoiner = tt(Emoji, EMOJI_JOINER);
    tr$1(EmojiJoiner, EMOJI, Emoji);
    // tt(EmojiJoiner, EMOJI_VARIATION, Emoji); // also sketchy

    // Generates states for top-level domains
    // Note that this is most accurate when tlds are in alphabetical order
    const wordjr = [[ASCII_LETTER, Word]];
    const uwordjr = [[ASCII_LETTER, null], [LETTER, UWord]];
    for (let i = 0; i < tlds.length; i++) {
      fastts(Start, tlds[i], TLD, WORD, wordjr);
    }
    for (let i = 0; i < utlds.length; i++) {
      fastts(Start, utlds[i], UTLD, UWORD, uwordjr);
    }
    addToGroups(TLD, {
      tld: true,
      ascii: true
    }, groups);
    addToGroups(UTLD, {
      utld: true,
      alpha: true
    }, groups);

    // Collect the states generated by different protocols. NOTE: If any new TLDs
    // get added that are also protocols, set the token to be the same as the
    // protocol to ensure parsing works as expected.
    fastts(Start, 'file', SCHEME, WORD, wordjr);
    fastts(Start, 'mailto', SCHEME, WORD, wordjr);
    fastts(Start, 'http', SLASH_SCHEME, WORD, wordjr);
    fastts(Start, 'https', SLASH_SCHEME, WORD, wordjr);
    fastts(Start, 'ftp', SLASH_SCHEME, WORD, wordjr);
    fastts(Start, 'ftps', SLASH_SCHEME, WORD, wordjr);
    addToGroups(SCHEME, {
      scheme: true,
      ascii: true
    }, groups);
    addToGroups(SLASH_SCHEME, {
      slashscheme: true,
      ascii: true
    }, groups);

    // Register custom schemes. Assumes each scheme is asciinumeric with hyphens
    customSchemes = customSchemes.sort((a, b) => a[0] > b[0] ? 1 : -1);
    for (let i = 0; i < customSchemes.length; i++) {
      const sch = customSchemes[i][0];
      const optionalSlashSlash = customSchemes[i][1];
      const flags = optionalSlashSlash ? {
        [scheme]: true
      } : {
        [slashscheme]: true
      };
      if (sch.indexOf('-') >= 0) {
        flags[domain] = true;
      } else if (!ASCII_LETTER.test(sch)) {
        flags[numeric] = true; // numbers only
      } else if (DIGIT.test(sch)) {
        flags[asciinumeric] = true;
      } else {
        flags[ascii] = true;
      }
      ts(Start, sch, sch, flags);
    }

    // Localhost token
    ts(Start, 'localhost', LOCALHOST, {
      ascii: true
    });

    // Set default transition for start state (some symbol)
    Start.jd = new State$1(SYM);
    return {
      start: Start,
      tokens: assign({
        groups
      }, tk)
    };
  }

  /**
  	Given a string, returns an array of TOKEN instances representing the
  	composition of that string.

  	@method run
  	@param {State<string>} start scanner starting state
  	@param {string} str input string to scan
  	@return {Token[]} list of tokens, each with a type and value
  */
  function run$1(start, str) {
    // State machine is not case sensitive, so input is tokenized in lowercased
    // form (still returns regular case). Uses selective `toLowerCase` because
    // lowercasing the entire string causes the length and character position to
    // vary in some non-English strings with V8-based runtimes.
    const iterable = stringToArray(str.replace(/[A-Z]/g, c => c.toLowerCase()));
    const charCount = iterable.length; // <= len if there are emojis, etc
    const tokens = []; // return value

    // cursor through the string itself, accounting for characters that have
    // width with length 2 such as emojis
    let cursor = 0;

    // Cursor through the array-representation of the string
    let charCursor = 0;

    // Tokenize the string
    while (charCursor < charCount) {
      let state = start;
      let nextState = null;
      let tokenLength = 0;
      let latestAccepting = null;
      let sinceAccepts = -1;
      let charsSinceAccepts = -1;
      while (charCursor < charCount && (nextState = state.go(iterable[charCursor]))) {
        state = nextState;

        // Keep track of the latest accepting state
        if (state.accepts()) {
          sinceAccepts = 0;
          charsSinceAccepts = 0;
          latestAccepting = state;
        } else if (sinceAccepts >= 0) {
          sinceAccepts += iterable[charCursor].length;
          charsSinceAccepts++;
        }
        tokenLength += iterable[charCursor].length;
        cursor += iterable[charCursor].length;
        charCursor++;
      }

      // Roll back to the latest accepting state
      cursor -= sinceAccepts;
      charCursor -= charsSinceAccepts;
      tokenLength -= sinceAccepts;

      // No more jumps, just make a new token from the last accepting one
      tokens.push({
        t: latestAccepting.t,
        // token type/name
        v: str.slice(cursor - tokenLength, cursor),
        // string value
        s: cursor - tokenLength,
        // start index
        e: cursor // end index (excluding)
      });
    }

    return tokens;
  }

  /**
   * Convert a String to an Array of characters, taking into account that some
   * characters like emojis take up two string indexes.
   *
   * Adapted from core-js (MIT license)
   * https://github.com/zloirock/core-js/blob/2d69cf5f99ab3ea3463c395df81e5a15b68f49d9/packages/core-js/internals/string-multibyte.js
   *
   * @function stringToArray
   * @param {string} str
   * @returns {string[]}
   */
  function stringToArray(str) {
    const result = [];
    const len = str.length;
    let index = 0;
    while (index < len) {
      let first = str.charCodeAt(index);
      let second;
      let char = first < 0xd800 || first > 0xdbff || index + 1 === len || (second = str.charCodeAt(index + 1)) < 0xdc00 || second > 0xdfff ? str[index] // single character
      : str.slice(index, index + 2); // two-index characters
      result.push(char);
      index += char.length;
    }
    return result;
  }

  /**
   * Fast version of ts function for when transition defaults are well known
   * @param {State<string>} state
   * @param {string} input
   * @param {string} t
   * @param {string} defaultt
   * @param {[RegExp, State<string>][]} jr
   * @returns {State<string>}
   */
  function fastts(state, input, t, defaultt, jr) {
    let next;
    const len = input.length;
    for (let i = 0; i < len - 1; i++) {
      const char = input[i];
      if (state.j[char]) {
        next = state.j[char];
      } else {
        next = new State$1(defaultt);
        next.jr = jr.slice();
        state.j[char] = next;
      }
      state = next;
    }
    next = new State$1(t);
    next.jr = jr.slice();
    state.j[input[len - 1]] = next;
    return next;
  }

  /**
   * Converts a string of Top-Level Domain names encoded in update-tlds.js back
   * into a list of strings.
   * @param {str} encoded encoded TLDs string
   * @returns {str[]} original TLDs list
   */
  function decodeTlds(encoded) {
    const words = [];
    const stack = [];
    let i = 0;
    let digits = '0123456789';
    while (i < encoded.length) {
      let popDigitCount = 0;
      while (digits.indexOf(encoded[i + popDigitCount]) >= 0) {
        popDigitCount++; // encountered some digits, have to pop to go one level up trie
      }

      if (popDigitCount > 0) {
        words.push(stack.join('')); // whatever preceded the pop digits must be a word
        for (let popCount = parseInt(encoded.substring(i, i + popDigitCount), 10); popCount > 0; popCount--) {
          stack.pop();
        }
        i += popDigitCount;
      } else {
        stack.push(encoded[i]); // drop down a level into the trie
        i++;
      }
    }
    return words;
  }

  /**
   * An object where each key is a valid DOM Event Name such as `click` or `focus`
   * and each value is an event handler function.
   *
   * https://developer.mozilla.org/en-US/docs/Web/API/Element#events
   * @typedef {?{ [event: string]: Function }} EventListeners
   */

  /**
   * All formatted properties required to render a link, including `tagName`,
   * `attributes`, `content` and `eventListeners`.
   * @typedef {{ tagName: any, attributes: {[attr: string]: any}, content: string,
   * eventListeners: EventListeners }} IntermediateRepresentation
   */

  /**
   * Specify either an object described by the template type `O` or a function.
   *
   * The function takes a string value (usually the link's href attribute), the
   * link type (`'url'`, `'hashtag`', etc.) and an internal token representation
   * of the link. It should return an object of the template type `O`
   * @template O
   * @typedef {O | ((value: string, type: string, token: MultiToken) => O)} OptObj
   */

  /**
   * Specify either a function described by template type `F` or an object.
   *
   * Each key in the object should be a link type (`'url'`, `'hashtag`', etc.). Each
   * value should be a function with template type `F` that is called when the
   * corresponding link type is encountered.
   * @template F
   * @typedef {F | { [type: string]: F}} OptFn
   */

  /**
   * Specify either a value with template type `V`, a function that returns `V` or
   * an object where each value resolves to `V`.
   *
   * The function takes a string value (usually the link's href attribute), the
   * link type (`'url'`, `'hashtag`', etc.) and an internal token representation
   * of the link. It should return an object of the template type `V`
   *
   * For the object, each key should be a link type (`'url'`, `'hashtag`', etc.).
   * Each value should either have type `V` or a function that returns V. This
   * function similarly takes a string value and a token.
   *
   * Example valid types for `Opt<string>`:
   *
   * ```js
   * 'hello'
   * (value, type, token) => 'world'
   * { url: 'hello', email: (value, token) => 'world'}
   * ```
   * @template V
   * @typedef {V | ((value: string, type: string, token: MultiToken) => V) | { [type: string]: V | ((value: string, token: MultiToken) => V) }} Opt
   */

  /**
   * See available options: https://linkify.js.org/docs/options.html
   * @typedef {{
   * 	defaultProtocol?: string,
   *  events?: OptObj<EventListeners>,
   * 	format?: Opt<string>,
   * 	formatHref?: Opt<string>,
   * 	nl2br?: boolean,
   * 	tagName?: Opt<any>,
   * 	target?: Opt<string>,
   * 	rel?: Opt<string>,
   * 	validate?: Opt<boolean>,
   * 	truncate?: Opt<number>,
   * 	className?: Opt<string>,
   * 	attributes?: OptObj<({ [attr: string]: any })>,
   *  ignoreTags?: string[],
   * 	render?: OptFn<((ir: IntermediateRepresentation) => any)>
   * }} Opts
   */

  /**
   * @type Required<Opts>
   */
  const defaults = {
    defaultProtocol: 'http',
    events: null,
    format: noop,
    formatHref: noop,
    nl2br: false,
    tagName: 'a',
    target: null,
    rel: null,
    validate: true,
    truncate: Infinity,
    className: null,
    attributes: null,
    ignoreTags: [],
    render: null
  };

  /**
   * Utility class for linkify interfaces to apply specified
   * {@link Opts formatting and rendering options}.
   *
   * @param {Opts | Options} [opts] Option value overrides.
   * @param {(ir: IntermediateRepresentation) => any} [defaultRender] (For
   *   internal use) default render function that determines how to generate an
   *   HTML element based on a link token's derived tagName, attributes and HTML.
   *   Similar to render option
   */
  function Options(opts, defaultRender) {
    if (defaultRender === void 0) {
      defaultRender = null;
    }
    let o = assign({}, defaults);
    if (opts) {
      o = assign(o, opts instanceof Options ? opts.o : opts);
    }

    // Ensure all ignored tags are uppercase
    const ignoredTags = o.ignoreTags;
    const uppercaseIgnoredTags = [];
    for (let i = 0; i < ignoredTags.length; i++) {
      uppercaseIgnoredTags.push(ignoredTags[i].toUpperCase());
    }
    /** @protected */
    this.o = o;
    if (defaultRender) {
      this.defaultRender = defaultRender;
    }
    this.ignoreTags = uppercaseIgnoredTags;
  }
  Options.prototype = {
    o: defaults,
    /**
     * @type string[]
     */
    ignoreTags: [],
    /**
     * @param {IntermediateRepresentation} ir
     * @returns {any}
     */
    defaultRender(ir) {
      return ir;
    },
    /**
     * Returns true or false based on whether a token should be displayed as a
     * link based on the user options.
     * @param {MultiToken} token
     * @returns {boolean}
     */
    check(token) {
      return this.get('validate', token.toString(), token);
    },
    // Private methods

    /**
     * Resolve an option's value based on the value of the option and the given
     * params. If operator and token are specified and the target option is
     * callable, automatically calls the function with the given argument.
     * @template {keyof Opts} K
     * @param {K} key Name of option to use
     * @param {string} [operator] will be passed to the target option if it's a
     * function. If not specified, RAW function value gets returned
     * @param {MultiToken} [token] The token from linkify.tokenize
     * @returns {Opts[K] | any}
     */
    get(key, operator, token) {
      const isCallable = operator != null;
      let option = this.o[key];
      if (!option) {
        return option;
      }
      if (typeof option === 'object') {
        option = token.t in option ? option[token.t] : defaults[key];
        if (typeof option === 'function' && isCallable) {
          option = option(operator, token);
        }
      } else if (typeof option === 'function' && isCallable) {
        option = option(operator, token.t, token);
      }
      return option;
    },
    /**
     * @template {keyof Opts} L
     * @param {L} key Name of options object to use
     * @param {string} [operator]
     * @param {MultiToken} [token]
     * @returns {Opts[L] | any}
     */
    getObj(key, operator, token) {
      let obj = this.o[key];
      if (typeof obj === 'function' && operator != null) {
        obj = obj(operator, token.t, token);
      }
      return obj;
    },
    /**
     * Convert the given token to a rendered element that may be added to the
     * calling-interface's DOM
     * @param {MultiToken} token Token to render to an HTML element
     * @returns {any} Render result; e.g., HTML string, DOM element, React
     *   Component, etc.
     */
    render(token) {
      const ir = token.render(this); // intermediate representation
      const renderFn = this.get('render', null, token) || this.defaultRender;
      return renderFn(ir, token.t, token);
    }
  };
  function noop(val) {
    return val;
  }

  /******************************************************************************
  	Multi-Tokens
  	Tokens composed of arrays of TextTokens
  ******************************************************************************/

  /**
   * @param {string} value
   * @param {Token[]} tokens
   */
  function MultiToken(value, tokens) {
    this.t = 'token';
    this.v = value;
    this.tk = tokens;
  }

  /**
   * Abstract class used for manufacturing tokens of text tokens. That is rather
   * than the value for a token being a small string of text, it's value an array
   * of text tokens.
   *
   * Used for grouping together URLs, emails, hashtags, and other potential
   * creations.
   * @class MultiToken
   * @property {string} t
   * @property {string} v
   * @property {Token[]} tk
   * @abstract
   */
  MultiToken.prototype = {
    isLink: false,
    /**
     * Return the string this token represents.
     * @return {string}
     */
    toString() {
      return this.v;
    },
    /**
     * What should the value for this token be in the `href` HTML attribute?
     * Returns the `.toString` value by default.
     * @param {string} [scheme]
     * @return {string}
    */
    toHref(scheme) {
      return this.toString();
    },
    /**
     * @param {Options} options Formatting options
     * @returns {string}
     */
    toFormattedString(options) {
      const val = this.toString();
      const truncate = options.get('truncate', val, this);
      const formatted = options.get('format', val, this);
      return truncate && formatted.length > truncate ? formatted.substring(0, truncate) + '…' : formatted;
    },
    /**
     *
     * @param {Options} options
     * @returns {string}
     */
    toFormattedHref(options) {
      return options.get('formatHref', this.toHref(options.get('defaultProtocol')), this);
    },
    /**
     * The start index of this token in the original input string
     * @returns {number}
     */
    startIndex() {
      return this.tk[0].s;
    },
    /**
     * The end index of this token in the original input string (up to this
     * index but not including it)
     * @returns {number}
     */
    endIndex() {
      return this.tk[this.tk.length - 1].e;
    },
    /**
    	Returns an object  of relevant values for this token, which includes keys
    	* type - Kind of token ('url', 'email', etc.)
    	* value - Original text
    	* href - The value that should be added to the anchor tag's href
    		attribute
    		@method toObject
    	@param {string} [protocol] `'http'` by default
    */
    toObject(protocol) {
      if (protocol === void 0) {
        protocol = defaults.defaultProtocol;
      }
      return {
        type: this.t,
        value: this.toString(),
        isLink: this.isLink,
        href: this.toHref(protocol),
        start: this.startIndex(),
        end: this.endIndex()
      };
    },
    /**
     *
     * @param {Options} options Formatting option
     */
    toFormattedObject(options) {
      return {
        type: this.t,
        value: this.toFormattedString(options),
        isLink: this.isLink,
        href: this.toFormattedHref(options),
        start: this.startIndex(),
        end: this.endIndex()
      };
    },
    /**
     * Whether this token should be rendered as a link according to the given options
     * @param {Options} options
     * @returns {boolean}
     */
    validate(options) {
      return options.get('validate', this.toString(), this);
    },
    /**
     * Return an object that represents how this link should be rendered.
     * @param {Options} options Formattinng options
     */
    render(options) {
      const token = this;
      const href = this.toHref(options.get('defaultProtocol'));
      const formattedHref = options.get('formatHref', href, this);
      const tagName = options.get('tagName', href, token);
      const content = this.toFormattedString(options);
      const attributes = {};
      const className = options.get('className', href, token);
      const target = options.get('target', href, token);
      const rel = options.get('rel', href, token);
      const attrs = options.getObj('attributes', href, token);
      const eventListeners = options.getObj('events', href, token);
      attributes.href = formattedHref;
      if (className) {
        attributes.class = className;
      }
      if (target) {
        attributes.target = target;
      }
      if (rel) {
        attributes.rel = rel;
      }
      if (attrs) {
        assign(attributes, attrs);
      }
      return {
        tagName,
        attributes,
        content,
        eventListeners
      };
    }
  };

  /**
   * Create a new token that can be emitted by the parser state machine
   * @param {string} type readable type of the token
   * @param {object} props properties to assign or override, including isLink = true or false
   * @returns {new (value: string, tokens: Token[]) => MultiToken} new token class
   */
  function createTokenClass(type, props) {
    class Token extends MultiToken {
      constructor(value, tokens) {
        super(value, tokens);
        this.t = type;
      }
    }
    for (const p in props) {
      Token.prototype[p] = props[p];
    }
    Token.t = type;
    return Token;
  }

  /**
  	Represents a list of tokens making up a valid email address
  */
  const Email = createTokenClass('email', {
    isLink: true,
    toHref() {
      return 'mailto:' + this.toString();
    }
  });

  /**
  	Represents some plain text
  */
  const Text = createTokenClass('text');

  /**
  	Multi-linebreak token - represents a line break
  	@class Nl
  */
  const Nl = createTokenClass('nl');

  /**
  	Represents a list of text tokens making up a valid URL
  	@class Url
  */
  const Url = createTokenClass('url', {
    isLink: true,
    /**
    	Lowercases relevant parts of the domain and adds the protocol if
    	required. Note that this will not escape unsafe HTML characters in the
    	URL.
    		@param {string} [scheme] default scheme (e.g., 'https')
    	@return {string} the full href
    */
    toHref(scheme) {
      if (scheme === void 0) {
        scheme = defaults.defaultProtocol;
      }
      // Check if already has a prefix scheme
      return this.hasProtocol() ? this.v : `${scheme}://${this.v}`;
    },
    /**
     * Check whether this URL token has a protocol
     * @return {boolean}
     */
    hasProtocol() {
      const tokens = this.tk;
      return tokens.length >= 2 && tokens[0].t !== LOCALHOST && tokens[1].t === COLON;
    }
  });

  /**
  	Not exactly parser, more like the second-stage scanner (although we can
  	theoretically hotswap the code here with a real parser in the future... but
  	for a little URL-finding utility abstract syntax trees may be a little
  	overkill).

  	URL format: http://en.wikipedia.org/wiki/URI_scheme
  	Email format: http://en.wikipedia.org/wiki/EmailAddress (links to RFC in
  	reference)

  	@module linkify
  	@submodule parser
  	@main run
  */
  const makeState = arg => new State$1(arg);

  /**
   * Generate the parser multi token-based state machine
   * @param {{ groups: Collections<string> }} tokens
   */
  function init$1(_ref) {
    let {
      groups
    } = _ref;
    // Types of characters the URL can definitely end in
    const qsAccepting = groups.domain.concat([AMPERSAND, ASTERISK, AT, BACKSLASH, BACKTICK, CARET, DOLLAR, EQUALS, HYPHEN, NUM, PERCENT, PIPE, PLUS, POUND, SLASH, SYM, TILDE, UNDERSCORE]);

    // Types of tokens that can follow a URL and be part of the query string
    // but cannot be the very last characters
    // Characters that cannot appear in the URL at all should be excluded
    const qsNonAccepting = [APOSTROPHE, COLON, COMMA, DOT, EXCLAMATION, QUERY, QUOTE, SEMI, OPENANGLEBRACKET, CLOSEANGLEBRACKET, OPENBRACE, CLOSEBRACE, CLOSEBRACKET, OPENBRACKET, OPENPAREN, CLOSEPAREN, FULLWIDTHLEFTPAREN, FULLWIDTHRIGHTPAREN, LEFTCORNERBRACKET, RIGHTCORNERBRACKET, LEFTWHITECORNERBRACKET, RIGHTWHITECORNERBRACKET, FULLWIDTHLESSTHAN, FULLWIDTHGREATERTHAN];

    // For addresses without the mailto prefix
    // Tokens allowed in the localpart of the email
    const localpartAccepting = [AMPERSAND, APOSTROPHE, ASTERISK, BACKSLASH, BACKTICK, CARET, DOLLAR, EQUALS, HYPHEN, OPENBRACE, CLOSEBRACE, PERCENT, PIPE, PLUS, POUND, QUERY, SLASH, SYM, TILDE, UNDERSCORE];

    // The universal starting state.
    /**
     * @type State<Token>
     */
    const Start = makeState();
    const Localpart = tt(Start, TILDE); // Local part of the email address
    ta(Localpart, localpartAccepting, Localpart);
    ta(Localpart, groups.domain, Localpart);
    const Domain = makeState(),
      Scheme = makeState(),
      SlashScheme = makeState();
    ta(Start, groups.domain, Domain); // parsed string ends with a potential domain name (A)
    ta(Start, groups.scheme, Scheme); // e.g., 'mailto'
    ta(Start, groups.slashscheme, SlashScheme); // e.g., 'http'

    ta(Domain, localpartAccepting, Localpart);
    ta(Domain, groups.domain, Domain);
    const LocalpartAt = tt(Domain, AT); // Local part of the email address plus @

    tt(Localpart, AT, LocalpartAt); // close to an email address now

    // Local part of an email address can be e.g. 'http' or 'mailto'
    tt(Scheme, AT, LocalpartAt);
    tt(SlashScheme, AT, LocalpartAt);
    const LocalpartDot = tt(Localpart, DOT); // Local part of the email address plus '.' (localpart cannot end in .)
    ta(LocalpartDot, localpartAccepting, Localpart);
    ta(LocalpartDot, groups.domain, Localpart);
    const EmailDomain = makeState();
    ta(LocalpartAt, groups.domain, EmailDomain); // parsed string starts with local email info + @ with a potential domain name
    ta(EmailDomain, groups.domain, EmailDomain);
    const EmailDomainDot = tt(EmailDomain, DOT); // domain followed by DOT
    ta(EmailDomainDot, groups.domain, EmailDomain);
    const Email$1 = makeState(Email); // Possible email address (could have more tlds)
    ta(EmailDomainDot, groups.tld, Email$1);
    ta(EmailDomainDot, groups.utld, Email$1);
    tt(LocalpartAt, LOCALHOST, Email$1);

    // Hyphen can jump back to a domain name
    const EmailDomainHyphen = tt(EmailDomain, HYPHEN); // parsed string starts with local email info + @ with a potential domain name
    ta(EmailDomainHyphen, groups.domain, EmailDomain);
    ta(Email$1, groups.domain, EmailDomain);
    tt(Email$1, DOT, EmailDomainDot);
    tt(Email$1, HYPHEN, EmailDomainHyphen);

    // Final possible email states
    const EmailColon = tt(Email$1, COLON); // URL followed by colon (potential port number here)
    /*const EmailColonPort = */
    ta(EmailColon, groups.numeric, Email); // URL followed by colon and port number

    // Account for dots and hyphens. Hyphens are usually parts of domain names
    // (but not TLDs)
    const DomainHyphen = tt(Domain, HYPHEN); // domain followed by hyphen
    const DomainDot = tt(Domain, DOT); // domain followed by DOT
    ta(DomainHyphen, groups.domain, Domain);
    ta(DomainDot, localpartAccepting, Localpart);
    ta(DomainDot, groups.domain, Domain);
    const DomainDotTld = makeState(Url); // Simplest possible URL with no query string
    ta(DomainDot, groups.tld, DomainDotTld);
    ta(DomainDot, groups.utld, DomainDotTld);
    ta(DomainDotTld, groups.domain, Domain);
    ta(DomainDotTld, localpartAccepting, Localpart);
    tt(DomainDotTld, DOT, DomainDot);
    tt(DomainDotTld, HYPHEN, DomainHyphen);
    tt(DomainDotTld, AT, LocalpartAt);
    const DomainDotTldColon = tt(DomainDotTld, COLON); // URL followed by colon (potential port number here)
    const DomainDotTldColonPort = makeState(Url); // TLD followed by a port number
    ta(DomainDotTldColon, groups.numeric, DomainDotTldColonPort);

    // Long URL with optional port and maybe query string
    const Url$1 = makeState(Url);

    // URL with extra symbols at the end, followed by an opening bracket
    const UrlNonaccept = makeState(); // URL followed by some symbols (will not be part of the final URL)

    // Query strings
    ta(Url$1, qsAccepting, Url$1);
    ta(Url$1, qsNonAccepting, UrlNonaccept);
    ta(UrlNonaccept, qsAccepting, Url$1);
    ta(UrlNonaccept, qsNonAccepting, UrlNonaccept);

    // Become real URLs after `SLASH` or `COLON NUM SLASH`
    // Here works with or without scheme:// prefix
    tt(DomainDotTld, SLASH, Url$1);
    tt(DomainDotTldColonPort, SLASH, Url$1);

    // Note that domains that begin with schemes are treated slighly differently
    const SchemeColon = tt(Scheme, COLON); // e.g., 'mailto:'
    const SlashSchemeColon = tt(SlashScheme, COLON); // e.g., 'http:'
    const SlashSchemeColonSlash = tt(SlashSchemeColon, SLASH); // e.g., 'http:/'

    const UriPrefix = tt(SlashSchemeColonSlash, SLASH); // e.g., 'http://'

    // Scheme states can transition to domain states
    ta(Scheme, groups.domain, Domain);
    tt(Scheme, DOT, DomainDot);
    tt(Scheme, HYPHEN, DomainHyphen);
    ta(SlashScheme, groups.domain, Domain);
    tt(SlashScheme, DOT, DomainDot);
    tt(SlashScheme, HYPHEN, DomainHyphen);

    // Force URL with scheme prefix followed by anything sane
    ta(SchemeColon, groups.domain, Url$1);
    tt(SchemeColon, SLASH, Url$1);
    ta(UriPrefix, groups.domain, Url$1);
    ta(UriPrefix, qsAccepting, Url$1);
    tt(UriPrefix, SLASH, Url$1);
    const bracketPairs = [[OPENBRACE, CLOSEBRACE],
    // {}
    [OPENBRACKET, CLOSEBRACKET],
    // []
    [OPENPAREN, CLOSEPAREN],
    // ()
    [OPENANGLEBRACKET, CLOSEANGLEBRACKET],
    // <>
    [FULLWIDTHLEFTPAREN, FULLWIDTHRIGHTPAREN],
    // （）
    [LEFTCORNERBRACKET, RIGHTCORNERBRACKET],
    // 「」
    [LEFTWHITECORNERBRACKET, RIGHTWHITECORNERBRACKET],
    // 『』
    [FULLWIDTHLESSTHAN, FULLWIDTHGREATERTHAN] // ＜＞
    ];

    for (let i = 0; i < bracketPairs.length; i++) {
      const [OPEN, CLOSE] = bracketPairs[i];
      const UrlOpen = tt(Url$1, OPEN); // URL followed by open bracket

      // Continue not accepting for open brackets
      tt(UrlNonaccept, OPEN, UrlOpen);

      // Closing bracket component. This character WILL be included in the URL
      tt(UrlOpen, CLOSE, Url$1);

      // URL that beings with an opening bracket, followed by a symbols.
      // Note that the final state can still be `UrlOpen` (if the URL has a
      // single opening bracket for some reason).
      const UrlOpenQ = makeState(Url);
      ta(UrlOpen, qsAccepting, UrlOpenQ);
      const UrlOpenSyms = makeState(); // UrlOpen followed by some symbols it cannot end it
      ta(UrlOpen, qsNonAccepting);

      // URL that begins with an opening bracket, followed by some symbols
      ta(UrlOpenQ, qsAccepting, UrlOpenQ);
      ta(UrlOpenQ, qsNonAccepting, UrlOpenSyms);
      ta(UrlOpenSyms, qsAccepting, UrlOpenQ);
      ta(UrlOpenSyms, qsNonAccepting, UrlOpenSyms);

      // Close brace/bracket to become regular URL
      tt(UrlOpenQ, CLOSE, Url$1);
      tt(UrlOpenSyms, CLOSE, Url$1);
    }
    tt(Start, LOCALHOST, DomainDotTld); // localhost is a valid URL state
    tt(Start, NL$1, Nl); // single new line

    return {
      start: Start,
      tokens: tk
    };
  }

  /**
   * Run the parser state machine on a list of scanned string-based tokens to
   * create a list of multi tokens, each of which represents a URL, email address,
   * plain text, etc.
   *
   * @param {State<MultiToken>} start parser start state
   * @param {string} input the original input used to generate the given tokens
   * @param {Token[]} tokens list of scanned tokens
   * @returns {MultiToken[]}
   */
  function run(start, input, tokens) {
    let len = tokens.length;
    let cursor = 0;
    let multis = [];
    let textTokens = [];
    while (cursor < len) {
      let state = start;
      let secondState = null;
      let nextState = null;
      let multiLength = 0;
      let latestAccepting = null;
      let sinceAccepts = -1;
      while (cursor < len && !(secondState = state.go(tokens[cursor].t))) {
        // Starting tokens with nowhere to jump to.
        // Consider these to be just plain text
        textTokens.push(tokens[cursor++]);
      }
      while (cursor < len && (nextState = secondState || state.go(tokens[cursor].t))) {
        // Get the next state
        secondState = null;
        state = nextState;

        // Keep track of the latest accepting state
        if (state.accepts()) {
          sinceAccepts = 0;
          latestAccepting = state;
        } else if (sinceAccepts >= 0) {
          sinceAccepts++;
        }
        cursor++;
        multiLength++;
      }
      if (sinceAccepts < 0) {
        // No accepting state was found, part of a regular text token add
        // the first text token to the text tokens array and try again from
        // the next
        cursor -= multiLength;
        if (cursor < len) {
          textTokens.push(tokens[cursor]);
          cursor++;
        }
      } else {
        // Accepting state!
        // First close off the textTokens (if available)
        if (textTokens.length > 0) {
          multis.push(initMultiToken(Text, input, textTokens));
          textTokens = [];
        }

        // Roll back to the latest accepting state
        cursor -= sinceAccepts;
        multiLength -= sinceAccepts;

        // Create a new multitoken
        const Multi = latestAccepting.t;
        const subtokens = tokens.slice(cursor - multiLength, cursor);
        multis.push(initMultiToken(Multi, input, subtokens));
      }
    }

    // Finally close off the textTokens (if available)
    if (textTokens.length > 0) {
      multis.push(initMultiToken(Text, input, textTokens));
    }
    return multis;
  }

  /**
   * Utility function for instantiating a new multitoken with all the relevant
   * fields during parsing.
   * @param {new (value: string, tokens: Token[]) => MultiToken} Multi class to instantiate
   * @param {string} input original input string
   * @param {Token[]} tokens consecutive tokens scanned from input string
   * @returns {MultiToken}
   */
  function initMultiToken(Multi, input, tokens) {
    const startIdx = tokens[0].s;
    const endIdx = tokens[tokens.length - 1].e;
    const value = input.slice(startIdx, endIdx);
    return new Multi(value, tokens);
  }

  // Side-effect initialization state
  const INIT = {
    scanner: null,
    parser: null,
    tokenQueue: [],
    pluginQueue: [],
    customSchemes: [],
    initialized: false
  };

  /**
   * Initialize the linkify state machine. Called automatically the first time
   * linkify is called on a string, but may be called manually as well.
   */
  function init() {
    // Initialize scanner state machine and plugins
    INIT.scanner = init$2(INIT.customSchemes);
    for (let i = 0; i < INIT.tokenQueue.length; i++) {
      INIT.tokenQueue[i][1]({
        scanner: INIT.scanner
      });
    }

    // Initialize parser state machine and plugins
    INIT.parser = init$1(INIT.scanner.tokens);
    for (let i = 0; i < INIT.pluginQueue.length; i++) {
      INIT.pluginQueue[i][1]({
        scanner: INIT.scanner,
        parser: INIT.parser
      });
    }
    INIT.initialized = true;
  }

  /**
   * Parse a string into tokens that represent linkable and non-linkable sub-components
   * @param {string} str
   * @return {MultiToken[]} tokens
   */
  function tokenize(str) {
    if (!INIT.initialized) {
      init();
    }
    return run(INIT.parser.start, str, run$1(INIT.scanner.start, str));
  }

  /**
  	Convert strings of text into linkable HTML text
  */
  function escapeText(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function escapeAttr(href) {
    return href.replace(/"/g, '&quot;');
  }
  function attributesToString(attributes) {
    const result = [];
    for (const attr in attributes) {
      let val = attributes[attr] + '';
      result.push(`${attr}="${escapeAttr(val)}"`);
    }
    return result.join(' ');
  }
  function defaultRender(_ref) {
    let {
      tagName,
      attributes,
      content
    } = _ref;
    return `<${tagName} ${attributesToString(attributes)}>${escapeText(content)}</${tagName}>`;
  }

  /**
   * Convert a plan text string to an HTML string with links. Expects that the
   * given strings does not contain any HTML entities. Use the linkify-html
   * interface if you need to parse HTML entities.
   *
   * @param {string} str string to linkify
   * @param {import('linkifyjs').Opts} [opts] overridable options
   * @returns {string}
   */
  function linkifyStr(str, opts) {
    if (opts === void 0) {
      opts = {};
    }
    opts = new Options(opts, defaultRender);
    const tokens = tokenize(str);
    const result = [];
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.t === 'nl' && opts.get('nl2br')) {
        result.push('<br>\n');
      } else if (!token.isLink || !opts.check(token)) {
        result.push(escapeText(token.toString()));
      } else {
        result.push(opts.render(token));
      }
    }
    return result.join('');
  }
  if (!String.prototype.linkify) {
    Object.defineProperty(String.prototype, 'linkify', {
      writable: false,
      value: function linkify(options) {
        return linkifyStr(this, options);
      }
    });
  }

  const linkifyOptions = { defaultProtocol: 'https' };

  function url(s) {
  //    s = s.replace(/\\\\/g,'\\')
      const l = linkifyStr(s, linkifyOptions);
      const m = l.match(/"([^"]+)"/);

      if (m==null) {
          return null
      } else {
          return m[1]
      }
  }

  function internalLink(l) {
      switch(l[0]) {
          case '/':
              return '/' + encodeURIComponent(l.substring(1).replace(/ +/g,"_").toLowerCase());
          case '#':
              return '#' + encodeURIComponent(l.substring(1).replace(/ +/g,"_").toLowerCase());
          default:
              return null
      }
  }

  function strToLink(s) {

      var parts = s.split("|", 2);
      // console.log(parts)
      if (parts.length == 2 && parts[0].charAt(parts[0].length-1) == '\\') {
          parts[0] = parts[0].substring(0,parts[0].length - 1) + '|' + parts[1];
          parts.pop();
      }
      if (parts.length == 1) {
          if (parts[0].trim() == '') {
              return null // not actually a link
          }

          let u = parts[0].trim().replace(/\\\]/g,']');

          if (u[0] == '^') {
              u = u.substring(1).trim();
              return { type: 'link', ref: `#footnote-${u}`, text: u }
          } else {
              const addr = parts[0].trim().replace(/\]/g,']');
              const u = url(addr);

              if (u==null) {
                  const il = internalLink(addr);

                  if (il == null) {
                      return { type: 'link', ref: addr.toLowerCase(), text: addr }
                  // } else if (il[0] == '#') {
                  //     return { type: 'link', ref: il, text: il }
                  } else {
                      return { type: 'link', ref: il, text: il }
                  }
              } else {
                  return { type: 'link', ref: u, text: u }
              }
          }
      } else {
          const txt = parts[0].trim().replace(/\|/g,'|');
          const addr = parts[1].trim().replace(/\]/g,']');
          const u = url(addr);

          if (u==null) {
              const il = internalLink(addr);
              if (il == null) {
                  return { type: 'link', ref: addr.toLowerCase(), text: txt }
              // } else if (il[0] == '#') {
              //     return { type: 'link', ref: il, text: txt }
              } else {
                  return { type: 'link', ref: il, text: txt }
              }
          } else {
              return { type: 'link', ref: u, text: txt }
          }
      }
  }

  function styleFor(c) {
      switch (c) {
          case '!':
          case '*':
              return "bold";
          case '~':
          case '/':
              return "italic";
          case '_':
              return "underline";
          case '-':
              return "strike-through";
          case '^':
              return "superscript";
          case '`':
              return "code";
          case '$':
              return "kbd";
          case ',':
              return "subscript";
          default:
              return c + "";
      }
  }


  function parseText(s) {
  s = s.trim();

      let elements = [];
      let index = 0;

      // if (typeof str == 'string') {
      //     process(root,str,0,'')
      // } else {
      //     root.children.push(str);
      // }

      // function escapeChar(c) {
      //     return c
          
      //     if (c=='`') {
      //         return '\\`' // '&#96;'
      //     // } else if (c==':') {
      //     //     return '&#58;'
      //     } else if (c=='\\') {
      //         return '\\\\'
      //     } else {
      //         return c;
      //     }
      // }



      // function path(s) {
      //     return '/' + encodeURIComponent(s.replace(/ +/g,"_").toLowerCase());
      // }

   
  //    function process(parent,s,index,inChar) {

          var a, b;
          let str = '';

          while (index < s.length) {
              a = s.charAt(index++);
              b = s.charAt(index);


              if (a == '\\') {
  //                console.log(a,b)
                  if (b == '$') {
                      str += '\\$';
                      index++;
                      continue;
                  }
                  let punc = /^[-!\"#%&'()*+,-./:;<=>?@[\]^_`{|}~]$/;
                  if (b.match(punc)) {

  //                    console.log(punc)
                      str += b;//escapeChar(b);
                      index++;
                      continue;    
                  } else {
  //                    console.log('\\\\')
                      str += '\\\\';
                      continue
                  }
              } else if (a == '[') {
                  let prev = a;
                  let curr;
                  let foundLink = false;
                  let k = index;
                  let linkText = '';
                  for ( ; k < s.length; k++) {
                      curr = s.charAt(k);
                      if (curr == ']') {
                          if (prev == '\\') {
                              linkText = linkText.substring(0,linkText.length-1) + curr;
                          } else {
                              foundLink = true;
                              break
                          }
                      } else {
                          linkText += curr;
                      }
                      
                      prev = curr;
                  }

                  if (!foundLink) {
                      str += a;
    //                  index++;
                      continue
                  }

                  const ln = strToLink(linkText);
  console.log(ln);
                  if (ln == null) {
                      str += a;
  //                    index++;
                      continue
                  }

                  if (str!='') {
                      elements.push(t(str));
                      str = '';
                  }
                  elements.push(ln);
                  index = k+1;

              } else if (a == '@') {
                  const ch0 = /^[a-zA-Z]$/;
                  const chx = /^[a-zA-Z\d_]$/;

                  if (s.charAt(index).match(ch0)) {

                      if (str != '') {
                          elements.push(t(str));
                          str = '';
                      }

                      let k = index+1;
                      while (k < s.length && s.charAt(k).match(chx)) {
                          k++;
                      }

                      elements.push({ type: 'mention', value: s.substring(index,k)});
                      index = k;
                  } else {
                      str += a;
                  }

              } else if (a == '#') {
                  const tagAt = index-1;

                  const tagRegex = /#(?<bang>!)?(?<part1>[a-zA-Z][a-zA-Z\d_]{2,})(\.(?<part2>[a-zA-Z][a-zA-Z\d_]{2,}))?/y; // must start at specified start index
                  tagRegex.lastIndex = tagAt;
                  let res = tagRegex.exec(s);

                  // only include can have a namespace/collection
                  if (!res || (!res.groups.bang && res.groups.part2)) {
                      str += a;
                  } else {
                      // console.log(res)
                      // console.log(res[0])
                      index = tagAt+res[0].length;
                      // console.log(s.substring(index))

  //                    index = jj;
                      a = s.charAt(index);
                      let tagStr = null;
                      let tagValueStr = null;

                      if (a=='(') {
                          for (var k = index; k < s.length; k++) {
                              let ch = s.charAt(k);
                              if (ch==')') {
                                  tagStr = s.substring(tagAt,k+1);
                                  tagValueStr = s.substring(index+1,k);
                                  // console.log(tagStr,tagValueStr)
                                  tagValueStr = tagValueStr.trim();
                                  if (tagValueStr=='') tagValueStr = 'true';
  //                                tagValueStr = '['+tagValueStr+']'
                                  // console.log(`"${tagValueStr}"`)
                                  index = k + 1;
                                  break
                                  // try {
                                  //     tagValue = functionParamsToEsast(tagValueStr,true)
                                  //     tagStr = s.substring(tagAt,k+1)
                                  //     index = k + 1
                                  //     a = s.charAt(index++);
                                  //     break;
                                  // } catch (e) {
                                  //     // find next end bracket and try again
                                  // }
                              }
                          }
                          
                          // if ')' was never found tagValueStr == null
                          if (tagStr == null) {
                              tagStr = s.substring(tagAt,index);
                              tagValueStr = 'true';//'true'//functionParamsToEsast('true',false)
                          }
                      } else {
                          tagStr = s.substring(tagAt,index);
                          tagValueStr = 'true';//'true'//functionParamsToEsast('true',false)
                      }

                      if (str != '') {
                          elements.push(t(str));
                          str = '';
                      }

                      if (res.groups.bang) {
                          const includeOpts = {
                              type: 'include',
                              name: res.groups.part1,
                              text: tagStr 
                          };
                          if (tagValueStr) {
                              includeOpts.args = tagValueStr;
                              includeOpts.$js = yamlToEsastArray(tagValueStr);
                          }
                          if (res.groups.part2) {
                              includeOpts.collection = res.groups.part1;
                              includeOpts.name = res.groups.part2;
                          }
                          elements.push(includeOpts);
                      } else {
                          elements.push({
                              type:'tag',
                              name: res.groups.part1,
                              args: tagValueStr || 'true',
                              $js: yamlToEsastArray(tagValueStr || 'true'),
                              text: tagStr 
                          });
                      }

                  }
              // } else if (index + 1 > s.length) {
              //     str += a//escapeChar(a);
              //     console.log('got to end, returning')
              //     elements.push(t(str))
              //     continue//return index;//{index: index, str: strs};
              } else if (a == b
                      && (a == '!' || a == '*' || a == '~' || a == '/' || a == '_' || a == '-'
                              || a == '^' || a == '`' || a == '$' || a == ',')) {
                  index++;
                  while (s.charAt(index)==a) {
                      b = a;
                      index++; // permissive with extra formatting tag chars
                  }

  //                console.log('a="'+a+'",b="'+b+'",inChar="'+inChar+'",str="'+str+'"')
                  // if (a == inChar) {
                  //     elements.push(t(str))
                  //     continue//return index; //{index: index, str: strs};
                  // } else {
                      elements.push(t(str));
                      str = '';
                      const el = { type: 'format', style: styleFor(a) };
                      elements.push(el);
                      continue//index = process(el,s,index,a)
                  // }
              } else {
                  str += a;//escapeChar(a);
              }
          }

          // check if there is any text left over
          if (str != '' ) {
              // console.log('got to end')
              elements.push(t(str));//strs.push(str)
          }
  //        continue// index;//{index: index,str: strs};
  //    }

      return elements//root.children
  }

  function parseTableRow(text) {

      function splitText(text) {
          let cells = text.split('|');

          for (let c = cells.length-1 ; c>0 ; c--) {
              if (cells[c-1].charAt(cells[c-1].length-1) == '\\') {
                  cells[c-1] = cells[c-1].slice(0,-1) + '|' + cells[c];
                  cells.splice(c,1);
              }
          }
      
          return cells;
      }

      function pragmasToAttributes(pragmas) {
          let attr = {};
          
          for (let i=0 ; i<pragmas.length ; i++) {
              switch (pragmas[i]) {
                  case '!' :
                      attr.header = true;
                      break;
                  case 'r':
                      attr.align='right';
                      break;
                  case 'l':
                      attr.align='left';
                      break;
                  case 'c':
                      attr.align='center';
                      break;
                  case 'v':
                      if (i+1<pragmas.length) {
                          let c = pragmas[i+1];
                          if (c >= '3' && c <= '9') {
                              attr.rowspan=c*1;
                              i++;
                          } else {
                              attr.rowspan=2;
                          }
                      } else {
                          attr.rowspan=2;
                      }
                      break;
                  case '>':
                      if (i+1<pragmas.length) {
                          let c = pragmas[i+1];
                          if (c >= '3' && c <= '9') {
                              attr.colspan=c*1;
                              i++;
                          } else {
                              attr.colspan=2;
                          }
                      } else {
                          attr.colspan=2;
                      }

                      break;
              }
          }
          return attr
      }

      function tableCellFormatting(s) {
          for (let i=0; i<s.length ; i++) {
              if (s[i]==' ') {
                  if (i==0 || i==s.length-1) return ['',s.trim()];
                  return [s.substring(0,i),s.substring(i).trim()]
              }
          }
          return ["",s.trim()];
      }
          
      let cells = splitText(text);
      for (let i=0 ; i<cells.length ; i++) {
          let [f,t] = tableCellFormatting(cells[i]);
          cells[i] = { type: 'table-cell', children: parseText(t), formatting: pragmasToAttributes(f) };
      }
      return cells;
  }

  const RE_DocumentSeparator = /^---$/d;

  const RE_BlankLine = /^\s*$/d;
  const RE_Tag = /^\s*(([a-zA-Z_$][-a-zA-Z\d_$]*)\s*:(\s+(.*?))?)\s*$/d;
  const RE_Script = /^(\s*)<%(.*?)\s*(%>\s*)?$/d;
  const RE_Footnote = /^\s*\[ *\^ *(\S+) *\] *: *(.+?) *$/d;
  const RE_LinkDefinition = /^\s*\[ *([^\]]+) *\] *: *(.+?) *$/d;
  const RE_CodeBlock = /^\s*``` *(([a-zA-Z]+)?)\s*$/d;
  const RE_Element = /^\s*(<\s*((\!doctype)|([a-z]+([a-z0-9]+)?))((?:\s+[a-z]+(="[^"]*")?)*)\s*>?\s*)$/id;
  const RE_Heading = /^\s*((=+)\s*(\S.*?)\s*[-=]*)\s*$/d;
  const RE_HR = /^\s*[-=_\*]+\s*$/d;
  const RE_ListItem = /^\s*(?:(?:([-*+])|(\d+[\.)]))\s+(\S.*?))\s*$/d;
  const RE_ListItemTask = /^\s*\[ *([xX]?) *\]\s+(.*?)\s*$/d;
  const RE_Table = /^\s*(\|(.+?)\|?)\s*$/d;
  const RE_TableHeader = /^[-| ]+$/d;

  const RE_ScriptEnd = /^(.*?)\s*%>\s*$/d;

  function lineToSqrm(ln) {

      if (ln.value.length==0) {
          return {
              type:'blank-line',
              // position: ln.position
          }
      }

      let m;

      m = ln.value.match(RE_DocumentSeparator);
      if (ln.indent==0 && m) {
          return {
              type:'document-separator-line',
              // position: ln.position
          }
      }

      m = ln.value.match(RE_HR);
      if (m) {
          return {
              type:'hr-line',
              indent: ln.indent,
              // position: ln.position,
          }
      }

      m = ln.value.match(RE_Heading);
      if (m) {
          // let textPos = {
          //     start: Object.assign({},ln.position.start),
          //     end: Object.assign({},ln.position.end)
          // }
          // textPos.start.column = m.indices[3][0]
          // textPos.start.offset += m.indices[3][0]
          // textPos.end.column = m.indices[3][1]

          return {
              type:'heading-line',
              indent: ln.indent,
              level: m[2].length,
              children: parseText(m[3]),
              // position: textPos,
          }
      }

      m = ln.value.match(RE_ListItem);
      if (m) {

          if (m[1]!==undefined) {
              let t = m[3].match(RE_ListItemTask);
              if (t) {
                  let task = { line: ln.line, done: t[1]!='', text: t[2] };
                  // children = text and is converted to hast in post-process
                  return {
                      type: 'unordered-list-item-line',
                      indent: ln.indent, 
                      marker: m[1],
                      children: parseText(t[2]),
                      line: ln.line,
                      task: task
                  }
              } else {
                  // children = text and is converted to hast in post-process
                  let uli = {
                      type: 'unordered-list-item-line',
                      indent: ln.indent,
                      marker: m[1],
                      children: parseText(m[3]),
                      line: ln.line
                  };

                  // let yaml = ln.value.match(RE_ListItemTag)
                  // if (yaml) {
                  //     uli.yaml = { indent: ln.indent, isArrayElement: true }
                  //     if (yaml[4]) {
                  //         uli.yaml.name = yaml[1]
                  //         uli.yaml.$js = yamlToEsast(yaml[4],false)
                  //         uli.yaml.colon = true
                  //     } else if (yaml[2]) {
                  //         uli.yaml.name = yaml[1]
                  //         uli.yaml.colon = true
                  //     } else {
                  //         uli.yaml.$js = yamlToEsast(yaml[1],false)
                  //         uli.yaml.colon = false
                  //     }
                  // }

                  return uli
              }
          } else if (m[2]!==undefined) {
              let t = m[3].match(RE_ListItemTask);
              if (t) {
                  let task = {
                      line: ln.line, 
                      done: t[1]!='', 
                      text: t[2]
                  };
                  // children = text and is converted to hast in post-process
                  return {
                      type: 'ordered-list-item-line',
                      indent: ln.indent,
                      number: m[2],
                      children: parseText(t[2]),
                      line: ln.line,
                      task: task
                  }
              } else {
                  // children = text and is converted to hast in post-process
                  return {
                      type: 'ordered-list-item-line',
                      indent: ln.indent,
                      number: m[2],
                      children: parseText(m[3]),
                      line: ln.line
                  }
              }
          }
      }

      m = ln.value.match(RE_Script);
      if (m) {
  //        console.log(m)
          return {
              type: 'script-line',
              indent: ln.indent,
              code: m[1] + '  ' + m[2],
              line: ln.line,
              endScript: m[3] != undefined
          }
      }

      m = ln.value.match(RE_Element);
      if (m) {
          let properties = {};
          if (m[6]) {
              let props =  [... m[6].matchAll(/([^\s=]+)(=["]([^"]*)["])?/g) ];
              for (let prop of props) {
                  if (prop[3]) {
                      properties[prop[1]] = prop[3];
                  } else {
                      properties[prop[1]] = true;
                  }
              }
          }
          return {
              type: 'element-line',
              indent: ln.indent,
              tag: (m[2]?m[2].toLowerCase():'div'),
              properties: properties,
              line:ln.line,
              text: ln.value
          }
      }

      m = ln.value.match(RE_Table);
      if (m) {
          if (ln.value.match(RE_TableHeader) !== null) {
              return {
                  type: 'table-divider-line',
                  indent: ln.indent,
                  text: ln.value
              }
          } else {
              return {
                  type: 'table-row-line',
                  indent: ln.indent,
                  children: parseTableRow(m[2]),
                  text: ln.value
               }
          }
      }

      m = ln.value.match(RE_BlankLine); 
      if (m) {
          return {
              type:'blank-line',
              // position: ln.position
          }
      }

      m = ln.value.match(RE_Tag);
      if (m) {
          let tag = {
              type: 'yaml-line',
              indent: ln.indent, 
              name: m[2], 
              colon: true, 
              isArrayElement: false, 
              line: ln.line,
              text: ln.value
          };
          if (m[4]) {
              tag.$js  = yamlToEsast(m[4],false);
              // console.log(m[4],' = ',tag.value)
          }

          // console.log(tag.name + " = " + util.inspect(tag.$js,false,null,true))
          return tag
      }

      m = ln.value.match(RE_Footnote);
      if (m) {
          return {
              type: 'footnote-line',
              indent: ln.indent,
              id: m[1],
              children: parseText(m[2])
          }
      }

      m = ln.value.match(RE_LinkDefinition);
      if (m) {
          return {
              type: 'link-definition-line',
              indent: ln.indent, 
              id: m[1].trim().toLowerCase(), 
              link: strToLink(m[2]) 
          }
      }

      m = ln.value.match(RE_CodeBlock);
      if (m) {
          return {
              type:'code-block-line',
              indent: ln.indent, 
              language: m[1],
              line:ln.line
          }
      }

      // children = text and is converted to hast in post-process
      return {
          type: 'text-line',
          indent: ln.indent,
          // position: ln.position,
          children: parseText(ln.value),
          text: ln.value
      }

  }

  function indentedLinesToSxast(options = {}) {
      return (tree,file) => {

          const root = {
              type: 'sast-root',
              children: [],
          };

          for (let i=0 ; i<tree.children.length ; i++) {
              let iline = tree.children[i];
              let sast = lineToSqrm(iline);
              root.children.push(sast);
              if (sast.type == 'script-line' && !sast.endScript) {
                  for (i++ ; i<tree.children.length ; i++) {
                      iline = tree.children[i];
                      sast = {
                          type: 'script-line',
                          indent: iline.indent,
                          line: iline.line
                      };
                      root.children.push(sast);
                      let m = iline.value.match(RE_ScriptEnd);
                      if (m) {
                          sast.code = m[1];
                          break;
                      } else {
                          sast.code = iline.value;
                      }
                  }
              }
          }

          return root
      }
  }

  /**
   * @param {string} d
   * @returns {string}
   */
  function color$1(d) {
    return d
  }

  /**
   * @typedef {import('estree-jsx').Node} Node
   */


  const own$3 = {}.hasOwnProperty;

  /**
   * Continue traversing as normal.
   */
  const CONTINUE$1 = Symbol('continue');

  /**
   * Stop traversing immediately.
   */
  const EXIT$1 = Symbol('exit');

  /**
   * Do not traverse this node’s children.
   */
  const SKIP$1 = Symbol('skip');

  /**
   * Visit nodes, with ancestral information.
   *
   * This algorithm performs *depth-first* *tree traversal* in *preorder*
   * (**NLR**) and/or *postorder* (**LRN**).
   *
   * Walking the tree is an intensive task.
   * Make use of the return values of the visitor(s) when possible.
   * Instead of walking a tree multiple times, walk it once, use `unist-util-is`
   * to check if a node matches, and then perform different operations.
   *
   * @param {Node} tree
   *   Tree to traverse
   * @param {Visitor | Visitors | null | undefined} [visitor]
   *   Handle each node (optional).
   * @returns {undefined}
   *   Nothing.
   */
  function visit$1(tree, visitor) {
    /** @type {Visitor | undefined} */
    let enter;
    /** @type {Visitor | undefined} */
    let leave;

    if (typeof visitor === 'function') {
      enter = visitor;
    } else if (visitor && typeof visitor === 'object') {
      if (visitor.enter) enter = visitor.enter;
      if (visitor.leave) leave = visitor.leave;
    }

    build(tree, undefined, undefined, [])();

    /**
     * @param {Node} node
     * @param {string | undefined} key
     * @param {number | undefined} index
     * @param {Array<Node>} parents
     */
    function build(node, key, index, parents) {
      if (nodelike(node)) {
        visit.displayName = 'node (' + color$1(node.type) + ')';
      }

      return visit

      /**
       * @returns {ActionTuple}
       */
      function visit() {
        /** @type {ActionTuple} */
        const result = enter ? toResult$1(enter(node, key, index, parents)) : [];

        if (result[0] === EXIT$1) {
          return result
        }

        if (result[0] !== SKIP$1) {
          /** @type {keyof node} */
          let cKey;

          for (cKey in node) {
            if (
              own$3.call(node, cKey) &&
              node[cKey] &&
              typeof node[cKey] === 'object' &&
              // @ts-expect-error: custom esast extension.
              cKey !== 'data' &&
              // @ts-expect-error: custom esast extension.
              cKey !== 'position'
            ) {
              const grandparents = parents.concat(node);
              /** @type {unknown} */
              const value = node[cKey];

              if (Array.isArray(value)) {
                const nodes = /** @type {Array<unknown>} */ (value);
                let cIndex = 0;

                while (cIndex > -1 && cIndex < nodes.length) {
                  const subvalue = nodes[cIndex];

                  if (nodelike(subvalue)) {
                    const subresult = build(
                      subvalue,
                      cKey,
                      cIndex,
                      grandparents
                    )();
                    if (subresult[0] === EXIT$1) return subresult
                    cIndex =
                      typeof subresult[1] === 'number' ? subresult[1] : cIndex + 1;
                  } else {
                    cIndex++;
                  }
                }
              } else if (nodelike(value)) {
                const subresult = build(value, cKey, undefined, grandparents)();
                if (subresult[0] === EXIT$1) return subresult
              }
            }
          }
        }

        return leave ? toResult$1(leave(node, key, index, parents)) : result
      }
    }
  }

  /**
   * Turn a return value into a clean result.
   *
   * @param {Action | ActionTuple | Index | null | undefined | void} value
   *   Valid return values from visitors.
   * @returns {ActionTuple}
   *   Clean result.
   */
  function toResult$1(value) {
    if (Array.isArray(value)) {
      return value
    }

    if (typeof value === 'number') {
      return [CONTINUE$1, value]
    }

    return [value]
  }

  /**
   * Check if something looks like a node.
   *
   * @param {unknown} value
   *   Anything.
   * @returns {value is Node}
   *   Whether `value` looks like a node.
   */
  function nodelike(value) {
    return Boolean(
      value &&
        typeof value === 'object' &&
        'type' in value &&
        typeof value.type === 'string' &&
        value.type.length > 0
    )
  }

  /**
   * @typedef {import('unist').Point} UnistPoint
   * @typedef {import('unist').Position} UnistPosition
   */

  /**
   * @typedef {[start: number | null | undefined, end: number | null | undefined]} RangeLike
   *
   * @typedef PointLike
   * @property {number | null | undefined} [line]
   * @property {number | null | undefined} [column]
   *
   * @typedef LocLike
   * @property {PointLike | null | undefined} [start]
   * @property {PointLike | null | undefined} [end]
   *
   * @typedef NodeLike
   * @property {LocLike | null | undefined} [loc]
   * @property {RangeLike | null | undefined} [range]
   * @property {number | null | undefined} [start]
   * @property {number | null | undefined} [end]
   */

  /**
   * Turn an estree `node` into a unist `position`.
   *
   * @param {NodeLike | null | undefined} [node]
   *   estree node.
   * @returns {UnistPosition | undefined}
   *   unist position.
   */
  function positionFromEstree(node) {
    const nodeLike = node || {};
    const loc = nodeLike.loc || {};
    const range = nodeLike.range || [undefined, undefined];
    const start = pointOrUndefined(loc.start, range[0] || nodeLike.start);
    const end = pointOrUndefined(loc.end, range[1] || nodeLike.end);

    if (start && end) {
      return {start, end}
    }
  }

  /**
   * @param {unknown} estreePoint
   *   estree point.
   * @param {unknown} estreeOffset
   *  estree offset.
   * @returns {UnistPoint | undefined}
   *   unist point.
   */
  function pointOrUndefined(estreePoint, estreeOffset) {
    if (estreePoint && typeof estreePoint === 'object') {
      const line =
        'line' in estreePoint ? numberOrUndefined(estreePoint.line) : undefined;
      const column =
        'column' in estreePoint
          ? numberOrUndefined(estreePoint.column)
          : undefined;

      if (line && column !== undefined) {
        return {
          line,
          column: column + 1,
          offset: numberOrUndefined(estreeOffset)
        }
      }
    }
  }

  /**
   * @param {unknown} value
   * @returns {number | undefined}
   */
  function numberOrUndefined(value) {
    return typeof value === 'number' && value > -1 ? value : undefined
  }

  /**
   * @typedef {import('estree-jsx').Node} Nodes
   */


  /** @type {Options} */
  const emptyOptions$1 = {};

  /**
   * Turn an estree into an esast.
   *
   * @template {Nodes} Kind
   *   Node kind.
   * @param {Kind} estree
   *   estree.
   * @param {Options | null | undefined} [options]
   *   Configuration (optional).
   * @returns {Kind}
   *   Clean clone of `estree`.
   */
  function fromEstree(estree, options) {
    const settings = emptyOptions$1;
    /** @type {Kind} */
    // Drop the `Node` and such constructors on Acorn nodes.
    const esast = JSON.parse(JSON.stringify(estree, ignoreBigint));

    visit$1(esast, {
      leave(node) {
        const position = positionFromEstree(node);

        if (!settings.dirty) {
          // Acorn specific.
          // @ts-expect-error: acorn adds this.
          if ('end' in node) remove(node, 'end');
          // @ts-expect-error: acorn adds this.
          if ('start' in node) remove(node, 'start');
          if (node.type === 'JSXOpeningFragment') {
            // @ts-expect-error: acorn adds this, but it should not exist.
            if ('attributes' in node) remove(node, 'attributes');
            // @ts-expect-error: acorn adds this, but it should not exist.
            if ('selfClosing' in node) remove(node, 'selfClosing');
          }

          // Estree.
          if ('loc' in node) remove(node, 'loc');
          // @ts-expect-error: `JSXText` types are wrong: `raw` is optional.
          if ('raw' in node) remove(node, 'raw');

          if (node.type === 'Literal') {
            // These `value`s on bigint/regex literals represent a raw value,
            // which is an antipattern.
            if ('bigint' in node) remove(node, 'value');
            if ('regex' in node) remove(node, 'value');
          }
        }

        if (node.type === 'Literal' && 'bigint' in node) {
          const bigint = node.bigint;
          const match = /0[box]/.exec(bigint.slice(0, 2).toLowerCase());

          if (match) {
            const code = match[0].charCodeAt(1);
            const base =
              code === 98 /* `x` */ ? 2 : code === 111 /* `o` */ ? 8 : 16;
            node.bigint = Number.parseInt(bigint.slice(2), base).toString();
          }
        }

        // @ts-expect-error: `position` is not in `Node`, but we add it anyway
        // because it’s useful.
        node.position = position;
      }
    });

    return esast
  }

  /**
   * @template {Nodes} Kind
   * @param {Kind} value
   * @param {OptionalKeys<Kind>} key
   * @returns {undefined}
   */
  function remove(value, key) {
    delete value[key];
  }

  /**
   *
   * @param {string} _
   * @param {unknown} value
   * @returns {unknown}
   */
  function ignoreBigint(_, value) {
    return typeof value === 'bigint' ? undefined : value
  }

  function parseEcma(options = {}) {
      const self = this;
      self.parser = parser;
      self.options = { ...options };
    
      function parser(value,vfile) {

          let acorn = Parser;
          const comments = [];
          let tree;
        
          if (self.options.plugins) {
            acorn = acorn.extend(...self.options.plugins);
          }
        
          const text =
            typeof value === 'string'
              ? value.toString()
              : new TextDecoder().decode(value);
        
          try {
            tree = acorn.parse(text, {
              ecmaVersion: self.options.version || 'latest',
              sourceType: self.options.module ? 'module' : 'script',
              allowReturnOutsideFunction:
                self.options.allowReturnOutsideFunction || undefined,
              allowImportExportEverywhere:
                self.options.allowImportExportEverywhere || undefined,
              allowAwaitOutsideFunction:
                self.options.allowAwaitOutsideFunction || undefined,
              allowHashBang: self.options.allowHashBang || undefined,
              allowSuperOutsideMethod: self.options.allowSuperOutsideMethod || undefined,
              locations: true,
              onComment: comments
            });
          } catch (error) {
            const cause = (error);
        
            const message = new VFileMessage('Could not parse JavaScript with Acorn', {
              cause,
              place: {
                line: cause.loc.line,
                column: cause.loc.column + 1,
                offset: cause.pos
              },
              ruleId: 'acorn',
              source: 'esast-util-from-js'
            });
        
            message.url = 'https://github.com/syntax-tree/esast-util-from-js#throws';
        
            throw message
          }
        
          tree.comments = comments;
        
          return fromEstree(tree)
      }
  }

  let p$1 = new parseEcma();

  function program() {
      return {
          type: "Program",
          sourceType: 'module',
          start: 0,
          end: 0,
          body: []
      };
  }

  function literal(s) {
      return {
          type: "Literal",
          start: -1,
          end: -1,
          value: s,
          raw: s
        }
  }

  function id(s) {
      return {
          type: "Identifier",
          start: -1,
          end: -1,
          name: s
        }
  }

  function inlineTag(tag) {
      return {
          "type": "CallExpression",
          "callee": {
              "type": "ArrowFunctionExpression",
              "id": null,
              "expression": false,
              "generator": false,
              "async": false,
              "params": [],
              "body": {
                  "type": "BlockStatement",
                  "body": [{
                      "type": "ReturnStatement",
                      "argument": {
                          "type": "ExpressionStatement",
                          "expression": {
                            "type": "CallExpression",
                            "callee": {
                              "type": "MemberExpression",
                              "object": {
                                "type": "ThisExpression",
                              },
                              "property": {
                                "type": "Identifier",
                                "name": "inlineTag"
                              },
                              "computed": false,
                              "optional": false
                            },
                            "arguments": [{
                                "type": "ObjectExpression",
                                "properties": props(tag)//[
      //                            prop(id('type'),literal('"tag"')),
                              //     prop(id('name'),literal(quoted(tag.name))),
                              //     prop(id('value'),p.parser(`${tag.value}`).body[0].expression) ////////////////////////////////////////
                              //   ]//props(tag)
                            }],
                            "optional": false
                          }
                      },
                  }]
              }},
              "arguments": [],
              "optional": false
      }
  }

  function inlineInclude(o) {
      return {
          "type": "CallExpression",
          "callee": {
              "type": "ArrowFunctionExpression",
              "id": null,
              "expression": false,
              "generator": false,
              "async": false,
              "params": [],
              "body": {
                  "type": "BlockStatement",
                  "body": [{
                      "type": "ReturnStatement",
                      "argument": {
                          "type": "ExpressionStatement",
                          "expression": {
                            "type": "CallExpression",
                            "callee": {
                              "type": "MemberExpression",
                              "object": {
                                "type": "ThisExpression",
                              },
                              "property": {
                                "type": "Identifier",
                                "name": "inlineInclude"
                              },
                              "computed": false,
                              "optional": false
                            },
                            "arguments": [{
                                "type": "ObjectExpression",
                                "properties": props(o)//[
                              //     prop(id('type'),literal('"tag"')),
                              //     prop(id('name'),literal(quoted(o.name))),
                              //     prop(id('value'),p.parser(`${o.value}`).body[0].expression) ////////////////////////////////////////
                              //   ]//props(tag)
                            }],
                            "optional": false
                          }
                      },
                  }]
              }},
              "arguments": [],
              "optional": false
      }
  }

  function inlineMention(o) {
      return {
          "type": "CallExpression",
          "callee": {
              "type": "ArrowFunctionExpression",
              "id": null,
              "expression": false,
              "generator": false,
              "async": false,
              "params": [],
              "body": {
                  "type": "BlockStatement",
                  "body": [{
                      "type": "ReturnStatement",
                      "argument": {
                          "type": "ExpressionStatement",
                          "expression": {
                            "type": "CallExpression",
                            "callee": {
                              "type": "MemberExpression",
                              "object": {
                                "type": "ThisExpression",
                              },
                              "property": {
                                "type": "Identifier",
                                "name": "inlineMention"
                              },
                              "computed": false,
                              "optional": false
                            },
                            "arguments": [{
                                "type": "ObjectExpression",
                                "properties": props(o)//[
                                  // prop(id('type'),literal('"tag"')),
                                  // prop(id('name'),literal(quoted(o.value))),
                                  // prop(id('value'),p.parser(`${o.value}`).body[0].expression) ////////////////////////////////////////
                              //   ]//props(tag)
                            }],
                            "optional": false
                          }
                      }
                  }]
              }},
              "arguments": [],
              "optional": false
      }
  }

  function object(o) {

      if (o.type && o.type=='tag') {
          return inlineTag(o)
      } else if (o.type && o.type=='include') {
          return inlineInclude(o)
      } else if (o.type && o.type=='mention') {
          return inlineMention(o)
      } else if (o.type && o.type=='text') {

          return {
              type: "ObjectExpression",
              start: 0,
              end: 0,
              properties: [{
                  type: "Property",
                  start: 0,
                  end: 0,
                  method: false,
                  shorthand: false,
                  computed: false,
                  key: id('type'),
                  value: literal('"text"'),
                  kind: "init"
              },{
                  type: "Property",
                  start: 0,
                  end: 0,
                  method: false,
                  shorthand: false,
                  computed: false,
                  key: id('value'),
                  value: templateOrString(o.value),
                  kind: "init"
              }]
          };

      } else {
          return {
              type: "ObjectExpression",
              properties: props(o)
          };
      }
  }

  function array(a) {
      return {
          type: "ArrayExpression",
          elements: a.map((x) => value(x))
      }
  }

  function value(o) {
      if (o === null) {
          return literal('null')
      } else if (Array.isArray(o)) {
          return array(o)
      } else if (typeof o === 'object') {
          return object(o)
      } else if (typeof o === 'string') {
          return literal(qouted(o))
      } else {
          return literal(o)
      }
  }

  function prop(k,v) {
      return {
          type: "Property",
          method: false,
          shorthand: false,
          computed: false,
          key: k,
          value: v,
          kind: "init"
      }

  }
  function props(o) {
      return Object.keys(o).map((k) => {
          if (k=='$js') {
              // console.log(o[k])
              return prop(id(k),o[k])
          } else {
              return prop(id(k),value(o[k]))
          }
          // return {
          //     type: "Property",
          //     start: 0,
          //     end: 0,
          //     method: false,
          //     shorthand: false,
          //     computed: false,
          //     key: id(k),
          //     value: value(o[k]),
          //     kind: "init"
          // }
      })
  }

  function this_addLine(line) {

      return {
          "type": "ExpressionStatement",
          "expression": {
              "type": "CallExpression",
              "callee": {
                  "type": "MemberExpression",
                  "object": {
                      "type": "ThisExpression",
                  },
                  "property": {
                      "type": "Identifier",
                      "name": "addLine"
                  },
                  "computed": false,
                  "optional": false
              },
              "arguments": [{
                  "type": "ObjectExpression",
                  "properties": Object.keys(line)
                      .map(k => k=='$js'?prop(id('value'),line[k]):prop(id(k),value(line[k])))
              }],
              "optional": false
          }
        }
  }

  function resqrmToEsast(options = {}) {

      return (root,file) => {
          const prog = program();

          for (let child of root.children) {
              if (child.type == "script-line") {
                  prog.body.push(p$1.parser(child.code).body[0]);
              } else {
                  prog.body.push(this_addLine(child));
              }
          }

          return prog
      }

  }

  // Astring is a tiny and fast JavaScript code generator from an ESTree-compliant AST.
  //
  // Astring was written by David Bonnet and released under an MIT license.
  //
  // The Git repository for Astring is available at:
  // https://github.com/davidbonnet/astring.git
  //
  // Please use the GitHub bug tracker to report issues:
  // https://github.com/davidbonnet/astring/issues

  const { stringify } = JSON;

  /* c8 ignore if */
  if (!String.prototype.repeat) {
    /* c8 ignore next */
    throw new Error(
      'String.prototype.repeat is undefined, see https://github.com/davidbonnet/astring#installation',
    )
  }

  /* c8 ignore if */
  if (!String.prototype.endsWith) {
    /* c8 ignore next */
    throw new Error(
      'String.prototype.endsWith is undefined, see https://github.com/davidbonnet/astring#installation',
    )
  }

  const OPERATOR_PRECEDENCE = {
    '||': 2,
    '??': 3,
    '&&': 4,
    '|': 5,
    '^': 6,
    '&': 7,
    '==': 8,
    '!=': 8,
    '===': 8,
    '!==': 8,
    '<': 9,
    '>': 9,
    '<=': 9,
    '>=': 9,
    in: 9,
    instanceof: 9,
    '<<': 10,
    '>>': 10,
    '>>>': 10,
    '+': 11,
    '-': 11,
    '*': 12,
    '%': 12,
    '/': 12,
    '**': 13,
  };

  // Enables parenthesis regardless of precedence
  const NEEDS_PARENTHESES = 17;

  const EXPRESSIONS_PRECEDENCE = {
    // Definitions
    ArrayExpression: 20,
    TaggedTemplateExpression: 20,
    ThisExpression: 20,
    Identifier: 20,
    PrivateIdentifier: 20,
    Literal: 18,
    TemplateLiteral: 20,
    Super: 20,
    SequenceExpression: 20,
    // Operations
    MemberExpression: 19,
    ChainExpression: 19,
    CallExpression: 19,
    NewExpression: 19,
    // Other definitions
    ArrowFunctionExpression: NEEDS_PARENTHESES,
    ClassExpression: NEEDS_PARENTHESES,
    FunctionExpression: NEEDS_PARENTHESES,
    ObjectExpression: NEEDS_PARENTHESES,
    // Other operations
    UpdateExpression: 16,
    UnaryExpression: 15,
    AwaitExpression: 15,
    BinaryExpression: 14,
    LogicalExpression: 13,
    ConditionalExpression: 4,
    AssignmentExpression: 3,
    YieldExpression: 2,
    RestElement: 1,
  };

  function formatSequence(state, nodes) {
    /*
    Writes into `state` a sequence of `nodes`.
    */
    const { generator } = state;
    state.write('(');
    if (nodes != null && nodes.length > 0) {
      generator[nodes[0].type](nodes[0], state);
      const { length } = nodes;
      for (let i = 1; i < length; i++) {
        const param = nodes[i];
        state.write(', ');
        generator[param.type](param, state);
      }
    }
    state.write(')');
  }

  function expressionNeedsParenthesis(state, node, parentNode, isRightHand) {
    const nodePrecedence = state.expressionsPrecedence[node.type];
    if (nodePrecedence === NEEDS_PARENTHESES) {
      return true
    }
    const parentNodePrecedence = state.expressionsPrecedence[parentNode.type];
    if (nodePrecedence !== parentNodePrecedence) {
      // Different node types
      return (
        (!isRightHand &&
          nodePrecedence === 15 &&
          parentNodePrecedence === 14 &&
          parentNode.operator === '**') ||
        nodePrecedence < parentNodePrecedence
      )
    }
    if (nodePrecedence !== 13 && nodePrecedence !== 14) {
      // Not a `LogicalExpression` or `BinaryExpression`
      return false
    }
    if (node.operator === '**' && parentNode.operator === '**') {
      // Exponentiation operator has right-to-left associativity
      return !isRightHand
    }
    if (
      nodePrecedence === 13 &&
      parentNodePrecedence === 13 &&
      (node.operator === '??' || parentNode.operator === '??')
    ) {
      // Nullish coalescing and boolean operators cannot be combined
      return true
    }
    if (isRightHand) {
      // Parenthesis are used if both operators have the same precedence
      return (
        OPERATOR_PRECEDENCE[node.operator] <=
        OPERATOR_PRECEDENCE[parentNode.operator]
      )
    }
    return (
      OPERATOR_PRECEDENCE[node.operator] <
      OPERATOR_PRECEDENCE[parentNode.operator]
    )
  }

  function formatExpression(state, node, parentNode, isRightHand) {
    /*
    Writes into `state` the provided `node`, adding parenthesis around if the provided `parentNode` needs it. If `node` is a right-hand argument, the provided `isRightHand` parameter should be `true`.
    */
    const { generator } = state;
    if (expressionNeedsParenthesis(state, node, parentNode, isRightHand)) {
      state.write('(');
      generator[node.type](node, state);
      state.write(')');
    } else {
      generator[node.type](node, state);
    }
  }

  function reindent(state, text, indent, lineEnd) {
    /*
    Writes into `state` the `text` string reindented with the provided `indent`.
    */
    const lines = text.split('\n');
    const end = lines.length - 1;
    state.write(lines[0].trim());
    if (end > 0) {
      state.write(lineEnd);
      for (let i = 1; i < end; i++) {
        state.write(indent + lines[i].trim() + lineEnd);
      }
      state.write(indent + lines[end].trim());
    }
  }

  function formatComments(state, comments, indent, lineEnd) {
    /*
    Writes into `state` the provided list of `comments`, with the given `indent` and `lineEnd` strings.
    Line comments will end with `"\n"` regardless of the value of `lineEnd`.
    Expects to start on a new unindented line.
    */
    const { length } = comments;
    for (let i = 0; i < length; i++) {
      const comment = comments[i];
      state.write(indent);
      if (comment.type[0] === 'L') {
        // Line comment
        state.write('// ' + comment.value.trim() + '\n', comment);
      } else {
        // Block comment
        state.write('/*');
        reindent(state, comment.value, indent, lineEnd);
        state.write('*/' + lineEnd);
      }
    }
  }

  function hasCallExpression(node) {
    /*
    Returns `true` if the provided `node` contains a call expression and `false` otherwise.
    */
    let currentNode = node;
    while (currentNode != null) {
      const { type } = currentNode;
      if (type[0] === 'C' && type[1] === 'a') {
        // Is CallExpression
        return true
      } else if (type[0] === 'M' && type[1] === 'e' && type[2] === 'm') {
        // Is MemberExpression
        currentNode = currentNode.object;
      } else {
        return false
      }
    }
  }

  function formatVariableDeclaration(state, node) {
    /*
    Writes into `state` a variable declaration.
    */
    const { generator } = state;
    const { declarations } = node;
    state.write(node.kind + ' ');
    const { length } = declarations;
    if (length > 0) {
      generator.VariableDeclarator(declarations[0], state);
      for (let i = 1; i < length; i++) {
        state.write(', ');
        generator.VariableDeclarator(declarations[i], state);
      }
    }
  }

  let ForInStatement,
    FunctionDeclaration,
    RestElement,
    BinaryExpression,
    ArrayExpression,
    BlockStatement;

  const GENERATOR = {
    /*
    Default generator.
    */
    Program(node, state) {
      const indent = state.indent.repeat(state.indentLevel);
      const { lineEnd, writeComments } = state;
      if (writeComments && node.comments != null) {
        formatComments(state, node.comments, indent, lineEnd);
      }
      const statements = node.body;
      const { length } = statements;
      for (let i = 0; i < length; i++) {
        const statement = statements[i];
        if (writeComments && statement.comments != null) {
          formatComments(state, statement.comments, indent, lineEnd);
        }
        state.write(indent);
        this[statement.type](statement, state);
        state.write(lineEnd);
      }
      if (writeComments && node.trailingComments != null) {
        formatComments(state, node.trailingComments, indent, lineEnd);
      }
    },
    BlockStatement: (BlockStatement = function (node, state) {
      const indent = state.indent.repeat(state.indentLevel++);
      const { lineEnd, writeComments } = state;
      const statementIndent = indent + state.indent;
      state.write('{');
      const statements = node.body;
      if (statements != null && statements.length > 0) {
        state.write(lineEnd);
        if (writeComments && node.comments != null) {
          formatComments(state, node.comments, statementIndent, lineEnd);
        }
        const { length } = statements;
        for (let i = 0; i < length; i++) {
          const statement = statements[i];
          if (writeComments && statement.comments != null) {
            formatComments(state, statement.comments, statementIndent, lineEnd);
          }
          state.write(statementIndent);
          this[statement.type](statement, state);
          state.write(lineEnd);
        }
        state.write(indent);
      } else {
        if (writeComments && node.comments != null) {
          state.write(lineEnd);
          formatComments(state, node.comments, statementIndent, lineEnd);
          state.write(indent);
        }
      }
      if (writeComments && node.trailingComments != null) {
        formatComments(state, node.trailingComments, statementIndent, lineEnd);
      }
      state.write('}');
      state.indentLevel--;
    }),
    ClassBody: BlockStatement,
    StaticBlock(node, state) {
      state.write('static ');
      this.BlockStatement(node, state);
    },
    EmptyStatement(node, state) {
      state.write(';');
    },
    ExpressionStatement(node, state) {
      const precedence = state.expressionsPrecedence[node.expression.type];
      if (
        precedence === NEEDS_PARENTHESES ||
        (precedence === 3 && node.expression.left.type[0] === 'O')
      ) {
        // Should always have parentheses or is an AssignmentExpression to an ObjectPattern
        state.write('(');
        this[node.expression.type](node.expression, state);
        state.write(')');
      } else {
        this[node.expression.type](node.expression, state);
      }
      state.write(';');
    },
    IfStatement(node, state) {
      state.write('if (');
      this[node.test.type](node.test, state);
      state.write(') ');
      this[node.consequent.type](node.consequent, state);
      if (node.alternate != null) {
        state.write(' else ');
        this[node.alternate.type](node.alternate, state);
      }
    },
    LabeledStatement(node, state) {
      this[node.label.type](node.label, state);
      state.write(': ');
      this[node.body.type](node.body, state);
    },
    BreakStatement(node, state) {
      state.write('break');
      if (node.label != null) {
        state.write(' ');
        this[node.label.type](node.label, state);
      }
      state.write(';');
    },
    ContinueStatement(node, state) {
      state.write('continue');
      if (node.label != null) {
        state.write(' ');
        this[node.label.type](node.label, state);
      }
      state.write(';');
    },
    WithStatement(node, state) {
      state.write('with (');
      this[node.object.type](node.object, state);
      state.write(') ');
      this[node.body.type](node.body, state);
    },
    SwitchStatement(node, state) {
      const indent = state.indent.repeat(state.indentLevel++);
      const { lineEnd, writeComments } = state;
      state.indentLevel++;
      const caseIndent = indent + state.indent;
      const statementIndent = caseIndent + state.indent;
      state.write('switch (');
      this[node.discriminant.type](node.discriminant, state);
      state.write(') {' + lineEnd);
      const { cases: occurences } = node;
      const { length: occurencesCount } = occurences;
      for (let i = 0; i < occurencesCount; i++) {
        const occurence = occurences[i];
        if (writeComments && occurence.comments != null) {
          formatComments(state, occurence.comments, caseIndent, lineEnd);
        }
        if (occurence.test) {
          state.write(caseIndent + 'case ');
          this[occurence.test.type](occurence.test, state);
          state.write(':' + lineEnd);
        } else {
          state.write(caseIndent + 'default:' + lineEnd);
        }
        const { consequent } = occurence;
        const { length: consequentCount } = consequent;
        for (let i = 0; i < consequentCount; i++) {
          const statement = consequent[i];
          if (writeComments && statement.comments != null) {
            formatComments(state, statement.comments, statementIndent, lineEnd);
          }
          state.write(statementIndent);
          this[statement.type](statement, state);
          state.write(lineEnd);
        }
      }
      state.indentLevel -= 2;
      state.write(indent + '}');
    },
    ReturnStatement(node, state) {
      state.write('return');
      if (node.argument) {
        state.write(' ');
        this[node.argument.type](node.argument, state);
      }
      state.write(';');
    },
    ThrowStatement(node, state) {
      state.write('throw ');
      this[node.argument.type](node.argument, state);
      state.write(';');
    },
    TryStatement(node, state) {
      state.write('try ');
      this[node.block.type](node.block, state);
      if (node.handler) {
        const { handler } = node;
        if (handler.param == null) {
          state.write(' catch ');
        } else {
          state.write(' catch (');
          this[handler.param.type](handler.param, state);
          state.write(') ');
        }
        this[handler.body.type](handler.body, state);
      }
      if (node.finalizer) {
        state.write(' finally ');
        this[node.finalizer.type](node.finalizer, state);
      }
    },
    WhileStatement(node, state) {
      state.write('while (');
      this[node.test.type](node.test, state);
      state.write(') ');
      this[node.body.type](node.body, state);
    },
    DoWhileStatement(node, state) {
      state.write('do ');
      this[node.body.type](node.body, state);
      state.write(' while (');
      this[node.test.type](node.test, state);
      state.write(');');
    },
    ForStatement(node, state) {
      state.write('for (');
      if (node.init != null) {
        const { init } = node;
        if (init.type[0] === 'V') {
          formatVariableDeclaration(state, init);
        } else {
          this[init.type](init, state);
        }
      }
      state.write('; ');
      if (node.test) {
        this[node.test.type](node.test, state);
      }
      state.write('; ');
      if (node.update) {
        this[node.update.type](node.update, state);
      }
      state.write(') ');
      this[node.body.type](node.body, state);
    },
    ForInStatement: (ForInStatement = function (node, state) {
      state.write(`for ${node.await ? 'await ' : ''}(`);
      const { left } = node;
      if (left.type[0] === 'V') {
        formatVariableDeclaration(state, left);
      } else {
        this[left.type](left, state);
      }
      // Identifying whether node.type is `ForInStatement` or `ForOfStatement`
      state.write(node.type[3] === 'I' ? ' in ' : ' of ');
      this[node.right.type](node.right, state);
      state.write(') ');
      this[node.body.type](node.body, state);
    }),
    ForOfStatement: ForInStatement,
    DebuggerStatement(node, state) {
      state.write('debugger;', node);
    },
    FunctionDeclaration: (FunctionDeclaration = function (node, state) {
      state.write(
        (node.async ? 'async ' : '') +
          (node.generator ? 'function* ' : 'function ') +
          (node.id ? node.id.name : ''),
        node,
      );
      formatSequence(state, node.params);
      state.write(' ');
      this[node.body.type](node.body, state);
    }),
    FunctionExpression: FunctionDeclaration,
    VariableDeclaration(node, state) {
      formatVariableDeclaration(state, node);
      state.write(';');
    },
    VariableDeclarator(node, state) {
      this[node.id.type](node.id, state);
      if (node.init != null) {
        state.write(' = ');
        this[node.init.type](node.init, state);
      }
    },
    ClassDeclaration(node, state) {
      state.write('class ' + (node.id ? `${node.id.name} ` : ''), node);
      if (node.superClass) {
        state.write('extends ');
        const { superClass } = node;
        const { type } = superClass;
        const precedence = state.expressionsPrecedence[type];
        if (
          (type[0] !== 'C' || type[1] !== 'l' || type[5] !== 'E') &&
          (precedence === NEEDS_PARENTHESES ||
            precedence < state.expressionsPrecedence.ClassExpression)
        ) {
          // Not a ClassExpression that needs parentheses
          state.write('(');
          this[node.superClass.type](superClass, state);
          state.write(')');
        } else {
          this[superClass.type](superClass, state);
        }
        state.write(' ');
      }
      this.ClassBody(node.body, state);
    },
    ImportDeclaration(node, state) {
      state.write('import ');
      const { specifiers, attributes } = node;
      const { length } = specifiers;
      // TODO: Once babili is fixed, put this after condition
      // https://github.com/babel/babili/issues/430
      let i = 0;
      if (length > 0) {
        for (; i < length; ) {
          if (i > 0) {
            state.write(', ');
          }
          const specifier = specifiers[i];
          const type = specifier.type[6];
          if (type === 'D') {
            // ImportDefaultSpecifier
            state.write(specifier.local.name, specifier);
            i++;
          } else if (type === 'N') {
            // ImportNamespaceSpecifier
            state.write('* as ' + specifier.local.name, specifier);
            i++;
          } else {
            // ImportSpecifier
            break
          }
        }
        if (i < length) {
          state.write('{');
          for (;;) {
            const specifier = specifiers[i];
            const { name } = specifier.imported;
            state.write(name, specifier);
            if (name !== specifier.local.name) {
              state.write(' as ' + specifier.local.name);
            }
            if (++i < length) {
              state.write(', ');
            } else {
              break
            }
          }
          state.write('}');
        }
        state.write(' from ');
      }
      this.Literal(node.source, state);

      if (attributes && attributes.length > 0) {
        state.write(' with { ');
        for (let i = 0; i < attributes.length; i++) {
          this.ImportAttribute(attributes[i], state);
          if (i < attributes.length - 1) state.write(', ');
        }

        state.write(' }');
      }
      state.write(';');
    },
    ImportAttribute(node, state) {
      this.Identifier(node.key, state);
      state.write(': ');
      this.Literal(node.value, state);
    },
    ImportExpression(node, state) {
      state.write('import(');
      this[node.source.type](node.source, state);
      state.write(')');
    },
    ExportDefaultDeclaration(node, state) {
      state.write('export default ');
      this[node.declaration.type](node.declaration, state);
      if (
        state.expressionsPrecedence[node.declaration.type] != null &&
        node.declaration.type[0] !== 'F'
      ) {
        // All expression nodes except `FunctionExpression`
        state.write(';');
      }
    },
    ExportNamedDeclaration(node, state) {
      state.write('export ');
      if (node.declaration) {
        this[node.declaration.type](node.declaration, state);
      } else {
        state.write('{');
        const { specifiers } = node,
          { length } = specifiers;
        if (length > 0) {
          for (let i = 0; ; ) {
            const specifier = specifiers[i];
            const { name } = specifier.local;
            state.write(name, specifier);
            if (name !== specifier.exported.name) {
              state.write(' as ' + specifier.exported.name);
            }
            if (++i < length) {
              state.write(', ');
            } else {
              break
            }
          }
        }
        state.write('}');
        if (node.source) {
          state.write(' from ');
          this.Literal(node.source, state);
        }

        if (node.attributes && node.attributes.length > 0) {
          state.write(' with { ');
          for (let i = 0; i < node.attributes.length; i++) {
            this.ImportAttribute(node.attributes[i], state);
            if (i < node.attributes.length - 1) state.write(', ');
          }

          state.write(' }');
        }

        state.write(';');
      }
    },
    ExportAllDeclaration(node, state) {
      if (node.exported != null) {
        state.write('export * as ' + node.exported.name + ' from ');
      } else {
        state.write('export * from ');
      }
      this.Literal(node.source, state);

      if (node.attributes && node.attributes.length > 0) {
        state.write(' with { ');
        for (let i = 0; i < node.attributes.length; i++) {
          this.ImportAttribute(node.attributes[i], state);
          if (i < node.attributes.length - 1) state.write(', ');
        }

        state.write(' }');
      }

      state.write(';');
    },
    MethodDefinition(node, state) {
      if (node.static) {
        state.write('static ');
      }
      const kind = node.kind[0];
      if (kind === 'g' || kind === 's') {
        // Getter or setter
        state.write(node.kind + ' ');
      }
      if (node.value.async) {
        state.write('async ');
      }
      if (node.value.generator) {
        state.write('*');
      }
      if (node.computed) {
        state.write('[');
        this[node.key.type](node.key, state);
        state.write(']');
      } else {
        this[node.key.type](node.key, state);
      }
      formatSequence(state, node.value.params);
      state.write(' ');
      this[node.value.body.type](node.value.body, state);
    },
    ClassExpression(node, state) {
      this.ClassDeclaration(node, state);
    },
    ArrowFunctionExpression(node, state) {
      state.write(node.async ? 'async ' : '', node);
      const { params } = node;
      if (params != null) {
        // Omit parenthesis if only one named parameter
        if (params.length === 1 && params[0].type[0] === 'I') {
          // If params[0].type[0] starts with 'I', it can't be `ImportDeclaration` nor `IfStatement` and thus is `Identifier`
          state.write(params[0].name, params[0]);
        } else {
          formatSequence(state, node.params);
        }
      }
      state.write(' => ');
      if (node.body.type[0] === 'O') {
        // Body is an object expression
        state.write('(');
        this.ObjectExpression(node.body, state);
        state.write(')');
      } else {
        this[node.body.type](node.body, state);
      }
    },
    ThisExpression(node, state) {
      state.write('this', node);
    },
    Super(node, state) {
      state.write('super', node);
    },
    RestElement: (RestElement = function (node, state) {
      state.write('...');
      this[node.argument.type](node.argument, state);
    }),
    SpreadElement: RestElement,
    YieldExpression(node, state) {
      state.write(node.delegate ? 'yield*' : 'yield');
      if (node.argument) {
        state.write(' ');
        this[node.argument.type](node.argument, state);
      }
    },
    AwaitExpression(node, state) {
      state.write('await ', node);
      formatExpression(state, node.argument, node);
    },
    TemplateLiteral(node, state) {
      const { quasis, expressions } = node;
      state.write('`');
      const { length } = expressions;
      for (let i = 0; i < length; i++) {
        const expression = expressions[i];
        const quasi = quasis[i];
        state.write(quasi.value.raw, quasi);
        state.write('${');
        this[expression.type](expression, state);
        state.write('}');
      }
      const quasi = quasis[quasis.length - 1];
      state.write(quasi.value.raw, quasi);
      state.write('`');
    },
    TemplateElement(node, state) {
      state.write(node.value.raw, node);
    },
    TaggedTemplateExpression(node, state) {
      formatExpression(state, node.tag, node);
      this[node.quasi.type](node.quasi, state);
    },
    ArrayExpression: (ArrayExpression = function (node, state) {
      state.write('[');
      if (node.elements.length > 0) {
        const { elements } = node,
          { length } = elements;
        for (let i = 0; ; ) {
          const element = elements[i];
          if (element != null) {
            this[element.type](element, state);
          }
          if (++i < length) {
            state.write(', ');
          } else {
            if (element == null) {
              state.write(', ');
            }
            break
          }
        }
      }
      state.write(']');
    }),
    ArrayPattern: ArrayExpression,
    ObjectExpression(node, state) {
      const indent = state.indent.repeat(state.indentLevel++);
      const { lineEnd, writeComments } = state;
      const propertyIndent = indent + state.indent;
      state.write('{');
      if (node.properties.length > 0) {
        state.write(lineEnd);
        if (writeComments && node.comments != null) {
          formatComments(state, node.comments, propertyIndent, lineEnd);
        }
        const comma = ',' + lineEnd;
        const { properties } = node,
          { length } = properties;
        for (let i = 0; ; ) {
          const property = properties[i];
          if (writeComments && property.comments != null) {
            formatComments(state, property.comments, propertyIndent, lineEnd);
          }
          state.write(propertyIndent);
          this[property.type](property, state);
          if (++i < length) {
            state.write(comma);
          } else {
            break
          }
        }
        state.write(lineEnd);
        if (writeComments && node.trailingComments != null) {
          formatComments(state, node.trailingComments, propertyIndent, lineEnd);
        }
        state.write(indent + '}');
      } else if (writeComments) {
        if (node.comments != null) {
          state.write(lineEnd);
          formatComments(state, node.comments, propertyIndent, lineEnd);
          if (node.trailingComments != null) {
            formatComments(state, node.trailingComments, propertyIndent, lineEnd);
          }
          state.write(indent + '}');
        } else if (node.trailingComments != null) {
          state.write(lineEnd);
          formatComments(state, node.trailingComments, propertyIndent, lineEnd);
          state.write(indent + '}');
        } else {
          state.write('}');
        }
      } else {
        state.write('}');
      }
      state.indentLevel--;
    },
    Property(node, state) {
      if (node.method || node.kind[0] !== 'i') {
        // Either a method or of kind `set` or `get` (not `init`)
        this.MethodDefinition(node, state);
      } else {
        if (!node.shorthand) {
          if (node.computed) {
            state.write('[');
            this[node.key.type](node.key, state);
            state.write(']');
          } else {
            this[node.key.type](node.key, state);
          }
          state.write(': ');
        }
        this[node.value.type](node.value, state);
      }
    },
    PropertyDefinition(node, state) {
      if (node.static) {
        state.write('static ');
      }
      if (node.computed) {
        state.write('[');
      }
      this[node.key.type](node.key, state);
      if (node.computed) {
        state.write(']');
      }
      if (node.value == null) {
        if (node.key.type[0] !== 'F') {
          state.write(';');
        }
        return
      }
      state.write(' = ');
      this[node.value.type](node.value, state);
      state.write(';');
    },
    ObjectPattern(node, state) {
      state.write('{');
      if (node.properties.length > 0) {
        const { properties } = node,
          { length } = properties;
        for (let i = 0; ; ) {
          this[properties[i].type](properties[i], state);
          if (++i < length) {
            state.write(', ');
          } else {
            break
          }
        }
      }
      state.write('}');
    },
    SequenceExpression(node, state) {
      formatSequence(state, node.expressions);
    },
    UnaryExpression(node, state) {
      if (node.prefix) {
        const {
          operator,
          argument,
          argument: { type },
        } = node;
        state.write(operator);
        const needsParentheses = expressionNeedsParenthesis(state, argument, node);
        if (
          !needsParentheses &&
          (operator.length > 1 ||
            (type[0] === 'U' &&
              (type[1] === 'n' || type[1] === 'p') &&
              argument.prefix &&
              argument.operator[0] === operator &&
              (operator === '+' || operator === '-')))
        ) {
          // Large operator or argument is UnaryExpression or UpdateExpression node
          state.write(' ');
        }
        if (needsParentheses) {
          state.write(operator.length > 1 ? ' (' : '(');
          this[type](argument, state);
          state.write(')');
        } else {
          this[type](argument, state);
        }
      } else {
        // FIXME: This case never occurs
        this[node.argument.type](node.argument, state);
        state.write(node.operator);
      }
    },
    UpdateExpression(node, state) {
      // Always applied to identifiers or members, no parenthesis check needed
      if (node.prefix) {
        state.write(node.operator);
        this[node.argument.type](node.argument, state);
      } else {
        this[node.argument.type](node.argument, state);
        state.write(node.operator);
      }
    },
    AssignmentExpression(node, state) {
      this[node.left.type](node.left, state);
      state.write(' ' + node.operator + ' ');
      this[node.right.type](node.right, state);
    },
    AssignmentPattern(node, state) {
      this[node.left.type](node.left, state);
      state.write(' = ');
      this[node.right.type](node.right, state);
    },
    BinaryExpression: (BinaryExpression = function (node, state) {
      const isIn = node.operator === 'in';
      if (isIn) {
        // Avoids confusion in `for` loops initializers
        state.write('(');
      }
      formatExpression(state, node.left, node, false);
      state.write(' ' + node.operator + ' ');
      formatExpression(state, node.right, node, true);
      if (isIn) {
        state.write(')');
      }
    }),
    LogicalExpression: BinaryExpression,
    ConditionalExpression(node, state) {
      const { test } = node;
      const precedence = state.expressionsPrecedence[test.type];
      if (
        precedence === NEEDS_PARENTHESES ||
        precedence <= state.expressionsPrecedence.ConditionalExpression
      ) {
        state.write('(');
        this[test.type](test, state);
        state.write(')');
      } else {
        this[test.type](test, state);
      }
      state.write(' ? ');
      this[node.consequent.type](node.consequent, state);
      state.write(' : ');
      this[node.alternate.type](node.alternate, state);
    },
    NewExpression(node, state) {
      state.write('new ');
      const precedence = state.expressionsPrecedence[node.callee.type];
      if (
        precedence === NEEDS_PARENTHESES ||
        precedence < state.expressionsPrecedence.CallExpression ||
        hasCallExpression(node.callee)
      ) {
        state.write('(');
        this[node.callee.type](node.callee, state);
        state.write(')');
      } else {
        this[node.callee.type](node.callee, state);
      }
      formatSequence(state, node['arguments']);
    },
    CallExpression(node, state) {
      const precedence = state.expressionsPrecedence[node.callee.type];
      if (
        precedence === NEEDS_PARENTHESES ||
        precedence < state.expressionsPrecedence.CallExpression
      ) {
        state.write('(');
        this[node.callee.type](node.callee, state);
        state.write(')');
      } else {
        this[node.callee.type](node.callee, state);
      }
      if (node.optional) {
        state.write('?.');
      }
      formatSequence(state, node['arguments']);
    },
    ChainExpression(node, state) {
      this[node.expression.type](node.expression, state);
    },
    MemberExpression(node, state) {
      const precedence = state.expressionsPrecedence[node.object.type];
      if (
        precedence === NEEDS_PARENTHESES ||
        precedence < state.expressionsPrecedence.MemberExpression
      ) {
        state.write('(');
        this[node.object.type](node.object, state);
        state.write(')');
      } else {
        this[node.object.type](node.object, state);
      }
      if (node.computed) {
        if (node.optional) {
          state.write('?.');
        }
        state.write('[');
        this[node.property.type](node.property, state);
        state.write(']');
      } else {
        if (node.optional) {
          state.write('?.');
        } else {
          state.write('.');
        }
        this[node.property.type](node.property, state);
      }
    },
    MetaProperty(node, state) {
      state.write(node.meta.name + '.' + node.property.name, node);
    },
    Identifier(node, state) {
      state.write(node.name, node);
    },
    PrivateIdentifier(node, state) {
      state.write(`#${node.name}`, node);
    },
    Literal(node, state) {
      if (node.raw != null) {
        // Non-standard property
        state.write(node.raw, node);
      } else if (node.regex != null) {
        this.RegExpLiteral(node, state);
      } else if (node.bigint != null) {
        state.write(node.bigint + 'n', node);
      } else {
        state.write(stringify(node.value), node);
      }
    },
    RegExpLiteral(node, state) {
      const { regex } = node;
      state.write(`/${regex.pattern}/${regex.flags}`, node);
    },
  };

  const EMPTY_OBJECT = {};

  class State {
    constructor(options) {
      const setup = options == null ? EMPTY_OBJECT : options;
      this.output = '';
      // Functional options
      if (setup.output != null) {
        this.output = setup.output;
        this.write = this.writeToStream;
      } else {
        this.output = '';
      }
      this.generator = setup.generator != null ? setup.generator : GENERATOR;
      this.expressionsPrecedence =
        setup.expressionsPrecedence != null
          ? setup.expressionsPrecedence
          : EXPRESSIONS_PRECEDENCE;
      // Formating setup
      this.indent = setup.indent != null ? setup.indent : '  ';
      this.lineEnd = setup.lineEnd != null ? setup.lineEnd : '\n';
      this.indentLevel =
        setup.startingIndentLevel != null ? setup.startingIndentLevel : 0;
      this.writeComments = setup.comments ? setup.comments : false;
      // Source map
      if (setup.sourceMap != null) {
        this.write =
          setup.output == null ? this.writeAndMap : this.writeToStreamAndMap;
        this.sourceMap = setup.sourceMap;
        this.line = 1;
        this.column = 0;
        this.lineEndSize = this.lineEnd.split('\n').length - 1;
        this.mapping = {
          original: null,
          // Uses the entire state to avoid generating ephemeral objects
          generated: this,
          name: undefined,
          source: setup.sourceMap.file || setup.sourceMap._file,
        };
      }
    }

    write(code) {
      this.output += code;
    }

    writeToStream(code) {
      this.output.write(code);
    }

    writeAndMap(code, node) {
      this.output += code;
      this.map(code, node);
    }

    writeToStreamAndMap(code, node) {
      this.output.write(code);
      this.map(code, node);
    }

    map(code, node) {
      if (node != null) {
        const { type } = node;
        if (type[0] === 'L' && type[2] === 'n') {
          // LineComment
          this.column = 0;
          this.line++;
          return
        }
        if (node.loc != null) {
          const { mapping } = this;
          mapping.original = node.loc.start;
          mapping.name = node.name;
          this.sourceMap.addMapping(mapping);
        }
        if (
          (type[0] === 'T' && type[8] === 'E') ||
          (type[0] === 'L' && type[1] === 'i' && typeof node.value === 'string')
        ) {
          // TemplateElement or Literal string node
          const { length } = code;
          let { column, line } = this;
          for (let i = 0; i < length; i++) {
            if (code[i] === '\n') {
              column = 0;
              line++;
            } else {
              column++;
            }
          }
          this.column = column;
          this.line = line;
          return
        }
      }
      const { length } = code;
      const { lineEnd } = this;
      if (length > 0) {
        if (
          this.lineEndSize > 0 &&
          (lineEnd.length === 1
            ? code[length - 1] === lineEnd
            : code.endsWith(lineEnd))
        ) {
          this.line += this.lineEndSize;
          this.column = 0;
        } else {
          this.column += length;
        }
      }
    }

    toString() {
      return this.output
    }
  }

  function generate(node, options) {
    /*
    Returns a string representing the rendered code of the provided AST `node`.
    The `options` are:

    - `indent`: string to use for indentation (defaults to `␣␣`)
    - `lineEnd`: string to use for line endings (defaults to `\n`)
    - `startingIndentLevel`: indent level to start from (defaults to `0`)
    - `comments`: generate comments if `true` (defaults to `false`)
    - `output`: output stream to write the rendered code to (defaults to `null`)
    - `generator`: custom code generator (defaults to `GENERATOR`)
    - `expressionsPrecedence`: custom map of node types and their precedence level (defaults to `EXPRESSIONS_PRECEDENCE`)
    */
    const state = new State(options);
    // Travel through the AST node and generate the code
    state.generator[node.type](node, state);
    return state.output
  }

  function compileEcma(options) {
    const self = this;
    ({...self.data('settings'), ...options});
    self.compiler = compiler;

    function compiler(tree) {

      const {SourceMapGenerator, filePath, handlers} = self.settings || {};
      const sourceMap = SourceMapGenerator
        ? new SourceMapGenerator({file: filePath || '<unknown>.js'})
        : undefined;
    
      const value = generate(
        tree,
        {
          comments: true,
          generator: {...GENERATOR, ...handlers},
          sourceMap: sourceMap || undefined
        }
      );
      const map = sourceMap ? sourceMap.toJSON() : undefined;
    
      return {value, map}
    }
  }

  /**
   * @typedef {import('unist').Node} Node
   * @typedef {import('unist').Parent} Parent
   */


  /**
   * Generate an assertion from a test.
   *
   * Useful if you’re going to test many nodes, for example when creating a
   * utility where something else passes a compatible test.
   *
   * The created function is a bit faster because it expects valid input only:
   * a `node`, `index`, and `parent`.
   *
   * @param {Test} test
   *   *   when nullish, checks if `node` is a `Node`.
   *   *   when `string`, works like passing `(node) => node.type === test`.
   *   *   when `function` checks if function passed the node is true.
   *   *   when `object`, checks that all keys in test are in node, and that they have (strictly) equal values.
   *   *   when `array`, checks if any one of the subtests pass.
   * @returns {Check}
   *   An assertion.
   */
  const convert =
    // Note: overloads in JSDoc can’t yet use different `@template`s.
    /**
     * @type {(
     *   (<Condition extends string>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & {type: Condition}) &
     *   (<Condition extends Props>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & Condition) &
     *   (<Condition extends TestFunction>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & Predicate<Condition, Node>) &
     *   ((test?: null | undefined) => (node?: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node) &
     *   ((test?: Test) => Check)
     * )}
     */
    (
      /**
       * @param {Test} [test]
       * @returns {Check}
       */
      function (test) {
        if (test === null || test === undefined) {
          return ok
        }

        if (typeof test === 'function') {
          return castFactory(test)
        }

        if (typeof test === 'object') {
          return Array.isArray(test) ? anyFactory(test) : propsFactory(test)
        }

        if (typeof test === 'string') {
          return typeFactory(test)
        }

        throw new Error('Expected function, string, or object as test')
      }
    );

  /**
   * @param {Array<Props | TestFunction | string>} tests
   * @returns {Check}
   */
  function anyFactory(tests) {
    /** @type {Array<Check>} */
    const checks = [];
    let index = -1;

    while (++index < tests.length) {
      checks[index] = convert(tests[index]);
    }

    return castFactory(any)

    /**
     * @this {unknown}
     * @type {TestFunction}
     */
    function any(...parameters) {
      let index = -1;

      while (++index < checks.length) {
        if (checks[index].apply(this, parameters)) return true
      }

      return false
    }
  }

  /**
   * Turn an object into a test for a node with a certain fields.
   *
   * @param {Props} check
   * @returns {Check}
   */
  function propsFactory(check) {
    const checkAsRecord = /** @type {Record<string, unknown>} */ (check);

    return castFactory(all)

    /**
     * @param {Node} node
     * @returns {boolean}
     */
    function all(node) {
      const nodeAsRecord = /** @type {Record<string, unknown>} */ (
        /** @type {unknown} */ (node)
      );

      /** @type {string} */
      let key;

      for (key in check) {
        if (nodeAsRecord[key] !== checkAsRecord[key]) return false
      }

      return true
    }
  }

  /**
   * Turn a string into a test for a node with a certain type.
   *
   * @param {string} check
   * @returns {Check}
   */
  function typeFactory(check) {
    return castFactory(type)

    /**
     * @param {Node} node
     */
    function type(node) {
      return node && node.type === check
    }
  }

  /**
   * Turn a custom test into a test for a node that passes that test.
   *
   * @param {TestFunction} testFunction
   * @returns {Check}
   */
  function castFactory(testFunction) {
    return check

    /**
     * @this {unknown}
     * @type {Check}
     */
    function check(value, index, parent) {
      return Boolean(
        looksLikeANode(value) &&
          testFunction.call(
            this,
            value,
            typeof index === 'number' ? index : undefined,
            parent || undefined
          )
      )
    }
  }

  function ok() {
    return true
  }

  /**
   * @param {unknown} value
   * @returns {value is Node}
   */
  function looksLikeANode(value) {
    return value !== null && typeof value === 'object' && 'type' in value
  }

  /**
   * @param {string} d
   * @returns {string}
   */
  function color(d) {
    return d
  }

  /**
   * @typedef {import('unist').Node} UnistNode
   * @typedef {import('unist').Parent} UnistParent
   */


  /** @type {Readonly<ActionTuple>} */
  const empty$1 = [];

  /**
   * Continue traversing as normal.
   */
  const CONTINUE = true;

  /**
   * Stop traversing immediately.
   */
  const EXIT = false;

  /**
   * Do not traverse this node’s children.
   */
  const SKIP = 'skip';

  /**
   * Visit nodes, with ancestral information.
   *
   * This algorithm performs *depth-first* *tree traversal* in *preorder*
   * (**NLR**) or if `reverse` is given, in *reverse preorder* (**NRL**).
   *
   * You can choose for which nodes `visitor` is called by passing a `test`.
   * For complex tests, you should test yourself in `visitor`, as it will be
   * faster and will have improved type information.
   *
   * Walking the tree is an intensive task.
   * Make use of the return values of the visitor when possible.
   * Instead of walking a tree multiple times, walk it once, use `unist-util-is`
   * to check if a node matches, and then perform different operations.
   *
   * You can change the tree.
   * See `Visitor` for more info.
   *
   * @overload
   * @param {Tree} tree
   * @param {Check} check
   * @param {BuildVisitor<Tree, Check>} visitor
   * @param {boolean | null | undefined} [reverse]
   * @returns {undefined}
   *
   * @overload
   * @param {Tree} tree
   * @param {BuildVisitor<Tree>} visitor
   * @param {boolean | null | undefined} [reverse]
   * @returns {undefined}
   *
   * @param {UnistNode} tree
   *   Tree to traverse.
   * @param {Visitor | Test} test
   *   `unist-util-is`-compatible test
   * @param {Visitor | boolean | null | undefined} [visitor]
   *   Handle each node.
   * @param {boolean | null | undefined} [reverse]
   *   Traverse in reverse preorder (NRL) instead of the default preorder (NLR).
   * @returns {undefined}
   *   Nothing.
   *
   * @template {UnistNode} Tree
   *   Node type.
   * @template {Test} Check
   *   `unist-util-is`-compatible test.
   */
  function visitParents(tree, test, visitor, reverse) {
    /** @type {Test} */
    let check;

    if (typeof test === 'function' && typeof visitor !== 'function') {
      reverse = visitor;
      // @ts-expect-error no visitor given, so `visitor` is test.
      visitor = test;
    } else {
      // @ts-expect-error visitor given, so `test` isn’t a visitor.
      check = test;
    }

    const is = convert(check);
    const step = reverse ? -1 : 1;

    factory(tree, undefined, [])();

    /**
     * @param {UnistNode} node
     * @param {number | undefined} index
     * @param {Array<UnistParent>} parents
     */
    function factory(node, index, parents) {
      const value = /** @type {Record<string, unknown>} */ (
        node && typeof node === 'object' ? node : {}
      );

      if (typeof value.type === 'string') {
        const name =
          // `hast`
          typeof value.tagName === 'string'
            ? value.tagName
            : // `xast`
            typeof value.name === 'string'
            ? value.name
            : undefined;

        Object.defineProperty(visit, 'name', {
          value:
            'node (' + color(node.type + (name ? '<' + name + '>' : '')) + ')'
        });
      }

      return visit

      function visit() {
        /** @type {Readonly<ActionTuple>} */
        let result = empty$1;
        /** @type {Readonly<ActionTuple>} */
        let subresult;
        /** @type {number} */
        let offset;
        /** @type {Array<UnistParent>} */
        let grandparents;

        if (!test || is(node, index, parents[parents.length - 1] || undefined)) {
          // @ts-expect-error: `visitor` is now a visitor.
          result = toResult(visitor(node, parents));

          if (result[0] === EXIT) {
            return result
          }
        }

        if ('children' in node && node.children) {
          const nodeAsParent = /** @type {UnistParent} */ (node);

          if (nodeAsParent.children && result[0] !== SKIP) {
            offset = (reverse ? nodeAsParent.children.length : -1) + step;
            grandparents = parents.concat(nodeAsParent);

            while (offset > -1 && offset < nodeAsParent.children.length) {
              const child = nodeAsParent.children[offset];

              subresult = factory(child, offset, grandparents)();

              if (subresult[0] === EXIT) {
                return subresult
              }

              offset =
                typeof subresult[1] === 'number' ? subresult[1] : offset + step;
            }
          }
        }

        return result
      }
    }
  }

  /**
   * Turn a return value into a clean result.
   *
   * @param {VisitorResult} value
   *   Valid return values from visitors.
   * @returns {Readonly<ActionTuple>}
   *   Clean result.
   */
  function toResult(value) {
    if (Array.isArray(value)) {
      return value
    }

    if (typeof value === 'number') {
      return [CONTINUE, value]
    }

    return value === null || value === undefined ? empty$1 : [value]
  }

  /**
   * @typedef {import('unist').Node} UnistNode
   * @typedef {import('unist').Parent} UnistParent
   * @typedef {import('unist-util-visit-parents').VisitorResult} VisitorResult
   */


  /**
   * Visit nodes.
   *
   * This algorithm performs *depth-first* *tree traversal* in *preorder*
   * (**NLR**) or if `reverse` is given, in *reverse preorder* (**NRL**).
   *
   * You can choose for which nodes `visitor` is called by passing a `test`.
   * For complex tests, you should test yourself in `visitor`, as it will be
   * faster and will have improved type information.
   *
   * Walking the tree is an intensive task.
   * Make use of the return values of the visitor when possible.
   * Instead of walking a tree multiple times, walk it once, use `unist-util-is`
   * to check if a node matches, and then perform different operations.
   *
   * You can change the tree.
   * See `Visitor` for more info.
   *
   * @overload
   * @param {Tree} tree
   * @param {Check} check
   * @param {BuildVisitor<Tree, Check>} visitor
   * @param {boolean | null | undefined} [reverse]
   * @returns {undefined}
   *
   * @overload
   * @param {Tree} tree
   * @param {BuildVisitor<Tree>} visitor
   * @param {boolean | null | undefined} [reverse]
   * @returns {undefined}
   *
   * @param {UnistNode} tree
   *   Tree to traverse.
   * @param {Visitor | Test} testOrVisitor
   *   `unist-util-is`-compatible test (optional, omit to pass a visitor).
   * @param {Visitor | boolean | null | undefined} [visitorOrReverse]
   *   Handle each node (when test is omitted, pass `reverse`).
   * @param {boolean | null | undefined} [maybeReverse=false]
   *   Traverse in reverse preorder (NRL) instead of the default preorder (NLR).
   * @returns {undefined}
   *   Nothing.
   *
   * @template {UnistNode} Tree
   *   Node type.
   * @template {Test} Check
   *   `unist-util-is`-compatible test.
   */
  function visit(tree, testOrVisitor, visitorOrReverse, maybeReverse) {
    /** @type {boolean | null | undefined} */
    let reverse;
    /** @type {Test} */
    let test;
    /** @type {Visitor} */
    let visitor;

    if (
      typeof testOrVisitor === 'function' &&
      typeof visitorOrReverse !== 'function'
    ) {
      test = undefined;
      visitor = testOrVisitor;
      reverse = visitorOrReverse;
    } else {
      // @ts-expect-error: assume the overload with test was given.
      test = testOrVisitor;
      // @ts-expect-error: assume the overload with test was given.
      visitor = visitorOrReverse;
      reverse = maybeReverse;
    }

    visitParents(tree, test, overload, reverse);

    /**
     * @param {UnistNode} node
     * @param {Array<UnistParent>} parents
     */
    function overload(node, parents) {
      const parent = parents[parents.length - 1];
      const index = parent ? parent.children.indexOf(node) : undefined;
      return visitor(node, index, parent)
    }
  }

  /**
   * List of HTML void tag names.
   *
   * @type {Array<string>}
   */
  const htmlVoidElements = [
    'area',
    'base',
    'basefont',
    'bgsound',
    'br',
    'col',
    'command',
    'embed',
    'frame',
    'hr',
    'image',
    'img',
    'input',
    'keygen',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr'
  ];

  /**
   * @callback Handler
   *   Handle a value, with a certain ID field set to a certain value.
   *   The ID field is passed to `zwitch`, and it’s value is this function’s
   *   place on the `handlers` record.
   * @param {...any} parameters
   *   Arbitrary parameters passed to the zwitch.
   *   The first will be an object with a certain ID field set to a certain value.
   * @returns {any}
   *   Anything!
   */

  /**
   * @callback UnknownHandler
   *   Handle values that do have a certain ID field, but it’s set to a value
   *   that is not listed in the `handlers` record.
   * @param {unknown} value
   *   An object with a certain ID field set to an unknown value.
   * @param {...any} rest
   *   Arbitrary parameters passed to the zwitch.
   * @returns {any}
   *   Anything!
   */

  /**
   * @callback InvalidHandler
   *   Handle values that do not have a certain ID field.
   * @param {unknown} value
   *   Any unknown value.
   * @param {...any} rest
   *   Arbitrary parameters passed to the zwitch.
   * @returns {void|null|undefined|never}
   *   This should crash or return nothing.
   */

  /**
   * @template {InvalidHandler} [Invalid=InvalidHandler]
   * @template {UnknownHandler} [Unknown=UnknownHandler]
   * @template {Record<string, Handler>} [Handlers=Record<string, Handler>]
   * @typedef Options
   *   Configuration (required).
   * @property {Invalid} [invalid]
   *   Handler to use for invalid values.
   * @property {Unknown} [unknown]
   *   Handler to use for unknown values.
   * @property {Handlers} [handlers]
   *   Handlers to use.
   */

  const own$2 = {}.hasOwnProperty;

  /**
   * Handle values based on a field.
   *
   * @template {InvalidHandler} [Invalid=InvalidHandler]
   * @template {UnknownHandler} [Unknown=UnknownHandler]
   * @template {Record<string, Handler>} [Handlers=Record<string, Handler>]
   * @param {string} key
   *   Field to switch on.
   * @param {Options<Invalid, Unknown, Handlers>} [options]
   *   Configuration (required).
   * @returns {{unknown: Unknown, invalid: Invalid, handlers: Handlers, (...parameters: Parameters<Handlers[keyof Handlers]>): ReturnType<Handlers[keyof Handlers]>, (...parameters: Parameters<Unknown>): ReturnType<Unknown>}}
   */
  function zwitch(key, options) {
    const settings = options || {};

    /**
     * Handle one value.
     *
     * Based on the bound `key`, a respective handler will be called.
     * If `value` is not an object, or doesn’t have a `key` property, the special
     * “invalid” handler will be called.
     * If `value` has an unknown `key`, the special “unknown” handler will be
     * called.
     *
     * All arguments, and the context object, are passed through to the handler,
     * and it’s result is returned.
     *
     * @this {unknown}
     *   Any context object.
     * @param {unknown} [value]
     *   Any value.
     * @param {...unknown} parameters
     *   Arbitrary parameters passed to the zwitch.
     * @property {Handler} invalid
     *   Handle for values that do not have a certain ID field.
     * @property {Handler} unknown
     *   Handle values that do have a certain ID field, but it’s set to a value
     *   that is not listed in the `handlers` record.
     * @property {Handlers} handlers
     *   Record of handlers.
     * @returns {unknown}
     *   Anything.
     */
    function one(value, ...parameters) {
      /** @type {Handler|undefined} */
      let fn = one.invalid;
      const handlers = one.handlers;

      if (value && own$2.call(value, key)) {
        // @ts-expect-error Indexable.
        const id = String(value[key]);
        // @ts-expect-error Indexable.
        fn = own$2.call(handlers, id) ? handlers[id] : one.unknown;
      }

      if (fn) {
        return fn.call(this, value, ...parameters)
      }
    }

    one.handlers = settings.handlers || {};
    one.invalid = settings.invalid;
    one.unknown = settings.unknown;

    // @ts-expect-error: matches!
    return one
  }

  /**
   * @typedef CoreOptions
   * @property {ReadonlyArray<string>} [subset=[]]
   *   Whether to only escape the given subset of characters.
   * @property {boolean} [escapeOnly=false]
   *   Whether to only escape possibly dangerous characters.
   *   Those characters are `"`, `&`, `'`, `<`, `>`, and `` ` ``.
   *
   * @typedef FormatOptions
   * @property {(code: number, next: number, options: CoreWithFormatOptions) => string} format
   *   Format strategy.
   *
   * @typedef {CoreOptions & FormatOptions & import('./util/format-smart.js').FormatSmartOptions} CoreWithFormatOptions
   */

  const defaultSubsetRegex = /["&'<>`]/g;
  const surrogatePairsRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
  const controlCharactersRegex =
    // eslint-disable-next-line no-control-regex, unicorn/no-hex-escape
    /[\x01-\t\v\f\x0E-\x1F\x7F\x81\x8D\x8F\x90\x9D\xA0-\uFFFF]/g;
  const regexEscapeRegex = /[|\\{}()[\]^$+*?.]/g;

  /** @type {WeakMap<ReadonlyArray<string>, RegExp>} */
  const subsetToRegexCache = new WeakMap();

  /**
   * Encode certain characters in `value`.
   *
   * @param {string} value
   * @param {CoreWithFormatOptions} options
   * @returns {string}
   */
  function core(value, options) {
    value = value.replace(
      options.subset
        ? charactersToExpressionCached(options.subset)
        : defaultSubsetRegex,
      basic
    );

    if (options.subset || options.escapeOnly) {
      return value
    }

    return (
      value
        // Surrogate pairs.
        .replace(surrogatePairsRegex, surrogate)
        // BMP control characters (C0 except for LF, CR, SP; DEL; and some more
        // non-ASCII ones).
        .replace(controlCharactersRegex, basic)
    )

    /**
     * @param {string} pair
     * @param {number} index
     * @param {string} all
     */
    function surrogate(pair, index, all) {
      return options.format(
        (pair.charCodeAt(0) - 0xd800) * 0x400 +
          pair.charCodeAt(1) -
          0xdc00 +
          0x10000,
        all.charCodeAt(index + 2),
        options
      )
    }

    /**
     * @param {string} character
     * @param {number} index
     * @param {string} all
     */
    function basic(character, index, all) {
      return options.format(
        character.charCodeAt(0),
        all.charCodeAt(index + 1),
        options
      )
    }
  }

  /**
   * A wrapper function that caches the result of `charactersToExpression` with a WeakMap.
   * This can improve performance when tooling calls `charactersToExpression` repeatedly
   * with the same subset.
   *
   * @param {ReadonlyArray<string>} subset
   * @returns {RegExp}
   */
  function charactersToExpressionCached(subset) {
    let cached = subsetToRegexCache.get(subset);

    if (!cached) {
      cached = charactersToExpression(subset);
      subsetToRegexCache.set(subset, cached);
    }

    return cached
  }

  /**
   * @param {ReadonlyArray<string>} subset
   * @returns {RegExp}
   */
  function charactersToExpression(subset) {
    /** @type {Array<string>} */
    const groups = [];
    let index = -1;

    while (++index < subset.length) {
      groups.push(subset[index].replace(regexEscapeRegex, '\\$&'));
    }

    return new RegExp('(?:' + groups.join('|') + ')', 'g')
  }

  const hexadecimalRegex = /[\dA-Fa-f]/;

  /**
   * Configurable ways to encode characters as hexadecimal references.
   *
   * @param {number} code
   * @param {number} next
   * @param {boolean|undefined} omit
   * @returns {string}
   */
  function toHexadecimal(code, next, omit) {
    const value = '&#x' + code.toString(16).toUpperCase();
    return omit && next && !hexadecimalRegex.test(String.fromCharCode(next))
      ? value
      : value + ';'
  }

  const decimalRegex = /\d/;

  /**
   * Configurable ways to encode characters as decimal references.
   *
   * @param {number} code
   * @param {number} next
   * @param {boolean|undefined} omit
   * @returns {string}
   */
  function toDecimal(code, next, omit) {
    const value = '&#' + String(code);
    return omit && next && !decimalRegex.test(String.fromCharCode(next))
      ? value
      : value + ';'
  }

  /**
   * List of legacy HTML named character references that don’t need a trailing semicolon.
   *
   * @type {Array<string>}
   */
  const characterEntitiesLegacy = [
    'AElig',
    'AMP',
    'Aacute',
    'Acirc',
    'Agrave',
    'Aring',
    'Atilde',
    'Auml',
    'COPY',
    'Ccedil',
    'ETH',
    'Eacute',
    'Ecirc',
    'Egrave',
    'Euml',
    'GT',
    'Iacute',
    'Icirc',
    'Igrave',
    'Iuml',
    'LT',
    'Ntilde',
    'Oacute',
    'Ocirc',
    'Ograve',
    'Oslash',
    'Otilde',
    'Ouml',
    'QUOT',
    'REG',
    'THORN',
    'Uacute',
    'Ucirc',
    'Ugrave',
    'Uuml',
    'Yacute',
    'aacute',
    'acirc',
    'acute',
    'aelig',
    'agrave',
    'amp',
    'aring',
    'atilde',
    'auml',
    'brvbar',
    'ccedil',
    'cedil',
    'cent',
    'copy',
    'curren',
    'deg',
    'divide',
    'eacute',
    'ecirc',
    'egrave',
    'eth',
    'euml',
    'frac12',
    'frac14',
    'frac34',
    'gt',
    'iacute',
    'icirc',
    'iexcl',
    'igrave',
    'iquest',
    'iuml',
    'laquo',
    'lt',
    'macr',
    'micro',
    'middot',
    'nbsp',
    'not',
    'ntilde',
    'oacute',
    'ocirc',
    'ograve',
    'ordf',
    'ordm',
    'oslash',
    'otilde',
    'ouml',
    'para',
    'plusmn',
    'pound',
    'quot',
    'raquo',
    'reg',
    'sect',
    'shy',
    'sup1',
    'sup2',
    'sup3',
    'szlig',
    'thorn',
    'times',
    'uacute',
    'ucirc',
    'ugrave',
    'uml',
    'uuml',
    'yacute',
    'yen',
    'yuml'
  ];

  /**
   * Map of named character references from HTML 4.
   *
   * @type {Record<string, string>}
   */
  const characterEntitiesHtml4 = {
    nbsp: ' ',
    iexcl: '¡',
    cent: '¢',
    pound: '£',
    curren: '¤',
    yen: '¥',
    brvbar: '¦',
    sect: '§',
    uml: '¨',
    copy: '©',
    ordf: 'ª',
    laquo: '«',
    not: '¬',
    shy: '­',
    reg: '®',
    macr: '¯',
    deg: '°',
    plusmn: '±',
    sup2: '²',
    sup3: '³',
    acute: '´',
    micro: 'µ',
    para: '¶',
    middot: '·',
    cedil: '¸',
    sup1: '¹',
    ordm: 'º',
    raquo: '»',
    frac14: '¼',
    frac12: '½',
    frac34: '¾',
    iquest: '¿',
    Agrave: 'À',
    Aacute: 'Á',
    Acirc: 'Â',
    Atilde: 'Ã',
    Auml: 'Ä',
    Aring: 'Å',
    AElig: 'Æ',
    Ccedil: 'Ç',
    Egrave: 'È',
    Eacute: 'É',
    Ecirc: 'Ê',
    Euml: 'Ë',
    Igrave: 'Ì',
    Iacute: 'Í',
    Icirc: 'Î',
    Iuml: 'Ï',
    ETH: 'Ð',
    Ntilde: 'Ñ',
    Ograve: 'Ò',
    Oacute: 'Ó',
    Ocirc: 'Ô',
    Otilde: 'Õ',
    Ouml: 'Ö',
    times: '×',
    Oslash: 'Ø',
    Ugrave: 'Ù',
    Uacute: 'Ú',
    Ucirc: 'Û',
    Uuml: 'Ü',
    Yacute: 'Ý',
    THORN: 'Þ',
    szlig: 'ß',
    agrave: 'à',
    aacute: 'á',
    acirc: 'â',
    atilde: 'ã',
    auml: 'ä',
    aring: 'å',
    aelig: 'æ',
    ccedil: 'ç',
    egrave: 'è',
    eacute: 'é',
    ecirc: 'ê',
    euml: 'ë',
    igrave: 'ì',
    iacute: 'í',
    icirc: 'î',
    iuml: 'ï',
    eth: 'ð',
    ntilde: 'ñ',
    ograve: 'ò',
    oacute: 'ó',
    ocirc: 'ô',
    otilde: 'õ',
    ouml: 'ö',
    divide: '÷',
    oslash: 'ø',
    ugrave: 'ù',
    uacute: 'ú',
    ucirc: 'û',
    uuml: 'ü',
    yacute: 'ý',
    thorn: 'þ',
    yuml: 'ÿ',
    fnof: 'ƒ',
    Alpha: 'Α',
    Beta: 'Β',
    Gamma: 'Γ',
    Delta: 'Δ',
    Epsilon: 'Ε',
    Zeta: 'Ζ',
    Eta: 'Η',
    Theta: 'Θ',
    Iota: 'Ι',
    Kappa: 'Κ',
    Lambda: 'Λ',
    Mu: 'Μ',
    Nu: 'Ν',
    Xi: 'Ξ',
    Omicron: 'Ο',
    Pi: 'Π',
    Rho: 'Ρ',
    Sigma: 'Σ',
    Tau: 'Τ',
    Upsilon: 'Υ',
    Phi: 'Φ',
    Chi: 'Χ',
    Psi: 'Ψ',
    Omega: 'Ω',
    alpha: 'α',
    beta: 'β',
    gamma: 'γ',
    delta: 'δ',
    epsilon: 'ε',
    zeta: 'ζ',
    eta: 'η',
    theta: 'θ',
    iota: 'ι',
    kappa: 'κ',
    lambda: 'λ',
    mu: 'μ',
    nu: 'ν',
    xi: 'ξ',
    omicron: 'ο',
    pi: 'π',
    rho: 'ρ',
    sigmaf: 'ς',
    sigma: 'σ',
    tau: 'τ',
    upsilon: 'υ',
    phi: 'φ',
    chi: 'χ',
    psi: 'ψ',
    omega: 'ω',
    thetasym: 'ϑ',
    upsih: 'ϒ',
    piv: 'ϖ',
    bull: '•',
    hellip: '…',
    prime: '′',
    Prime: '″',
    oline: '‾',
    frasl: '⁄',
    weierp: '℘',
    image: 'ℑ',
    real: 'ℜ',
    trade: '™',
    alefsym: 'ℵ',
    larr: '←',
    uarr: '↑',
    rarr: '→',
    darr: '↓',
    harr: '↔',
    crarr: '↵',
    lArr: '⇐',
    uArr: '⇑',
    rArr: '⇒',
    dArr: '⇓',
    hArr: '⇔',
    forall: '∀',
    part: '∂',
    exist: '∃',
    empty: '∅',
    nabla: '∇',
    isin: '∈',
    notin: '∉',
    ni: '∋',
    prod: '∏',
    sum: '∑',
    minus: '−',
    lowast: '∗',
    radic: '√',
    prop: '∝',
    infin: '∞',
    ang: '∠',
    and: '∧',
    or: '∨',
    cap: '∩',
    cup: '∪',
    int: '∫',
    there4: '∴',
    sim: '∼',
    cong: '≅',
    asymp: '≈',
    ne: '≠',
    equiv: '≡',
    le: '≤',
    ge: '≥',
    sub: '⊂',
    sup: '⊃',
    nsub: '⊄',
    sube: '⊆',
    supe: '⊇',
    oplus: '⊕',
    otimes: '⊗',
    perp: '⊥',
    sdot: '⋅',
    lceil: '⌈',
    rceil: '⌉',
    lfloor: '⌊',
    rfloor: '⌋',
    lang: '〈',
    rang: '〉',
    loz: '◊',
    spades: '♠',
    clubs: '♣',
    hearts: '♥',
    diams: '♦',
    quot: '"',
    amp: '&',
    lt: '<',
    gt: '>',
    OElig: 'Œ',
    oelig: 'œ',
    Scaron: 'Š',
    scaron: 'š',
    Yuml: 'Ÿ',
    circ: 'ˆ',
    tilde: '˜',
    ensp: ' ',
    emsp: ' ',
    thinsp: ' ',
    zwnj: '‌',
    zwj: '‍',
    lrm: '‎',
    rlm: '‏',
    ndash: '–',
    mdash: '—',
    lsquo: '‘',
    rsquo: '’',
    sbquo: '‚',
    ldquo: '“',
    rdquo: '”',
    bdquo: '„',
    dagger: '†',
    Dagger: '‡',
    permil: '‰',
    lsaquo: '‹',
    rsaquo: '›',
    euro: '€'
  };

  /**
   * List of legacy (that don’t need a trailing `;`) named references which could,
   * depending on what follows them, turn into a different meaning
   *
   * @type {Array<string>}
   */
  const dangerous = [
    'cent',
    'copy',
    'divide',
    'gt',
    'lt',
    'not',
    'para',
    'times'
  ];

  const own$1 = {}.hasOwnProperty;

  /**
   * `characterEntitiesHtml4` but inverted.
   *
   * @type {Record<string, string>}
   */
  const characters = {};

  /** @type {string} */
  let key;

  for (key in characterEntitiesHtml4) {
    if (own$1.call(characterEntitiesHtml4, key)) {
      characters[characterEntitiesHtml4[key]] = key;
    }
  }

  const notAlphanumericRegex = /[^\dA-Za-z]/;

  /**
   * Configurable ways to encode characters as named references.
   *
   * @param {number} code
   * @param {number} next
   * @param {boolean|undefined} omit
   * @param {boolean|undefined} attribute
   * @returns {string}
   */
  function toNamed(code, next, omit, attribute) {
    const character = String.fromCharCode(code);

    if (own$1.call(characters, character)) {
      const name = characters[character];
      const value = '&' + name;

      if (
        omit &&
        characterEntitiesLegacy.includes(name) &&
        !dangerous.includes(name) &&
        (!attribute ||
          (next &&
            next !== 61 /* `=` */ &&
            notAlphanumericRegex.test(String.fromCharCode(next))))
      ) {
        return value
      }

      return value + ';'
    }

    return ''
  }

  /**
   * @typedef FormatSmartOptions
   * @property {boolean} [useNamedReferences=false]
   *   Prefer named character references (`&amp;`) where possible.
   * @property {boolean} [useShortestReferences=false]
   *   Prefer the shortest possible reference, if that results in less bytes.
   *   **Note**: `useNamedReferences` can be omitted when using `useShortestReferences`.
   * @property {boolean} [omitOptionalSemicolons=false]
   *   Whether to omit semicolons when possible.
   *   **Note**: This creates what HTML calls “parse errors” but is otherwise still valid HTML — don’t use this except when building a minifier.
   *   Omitting semicolons is possible for certain named and numeric references in some cases.
   * @property {boolean} [attribute=false]
   *   Create character references which don’t fail in attributes.
   *   **Note**: `attribute` only applies when operating dangerously with
   *   `omitOptionalSemicolons: true`.
   */


  /**
   * Configurable ways to encode a character yielding pretty or small results.
   *
   * @param {number} code
   * @param {number} next
   * @param {FormatSmartOptions} options
   * @returns {string}
   */
  function formatSmart(code, next, options) {
    let numeric = toHexadecimal(code, next, options.omitOptionalSemicolons);
    /** @type {string|undefined} */
    let named;

    if (options.useNamedReferences || options.useShortestReferences) {
      named = toNamed(
        code,
        next,
        options.omitOptionalSemicolons,
        options.attribute
      );
    }

    // Use the shortest numeric reference when requested.
    // A simple algorithm would use decimal for all code points under 100, as
    // those are shorter than hexadecimal:
    //
    // * `&#99;` vs `&#x63;` (decimal shorter)
    // * `&#100;` vs `&#x64;` (equal)
    //
    // However, because we take `next` into consideration when `omit` is used,
    // And it would be possible that decimals are shorter on bigger values as
    // well if `next` is hexadecimal but not decimal, we instead compare both.
    if (
      (options.useShortestReferences || !named) &&
      options.useShortestReferences
    ) {
      const decimal = toDecimal(code, next, options.omitOptionalSemicolons);

      if (decimal.length < numeric.length) {
        numeric = decimal;
      }
    }

    return named &&
      (!options.useShortestReferences || named.length < numeric.length)
      ? named
      : numeric
  }

  /**
   * @typedef {import('./core.js').CoreOptions & import('./util/format-smart.js').FormatSmartOptions} Options
   * @typedef {import('./core.js').CoreOptions} LightOptions
   */


  /**
   * Encode special characters in `value`.
   *
   * @param {string} value
   *   Value to encode.
   * @param {Options} [options]
   *   Configuration.
   * @returns {string}
   *   Encoded value.
   */
  function stringifyEntities(value, options) {
    return core(value, Object.assign({format: formatSmart}, options))
  }

  /**
   * @import {Comment, Parents} from 'hast'
   * @import {State} from '../index.js'
   */


  const htmlCommentRegex = /^>|^->|<!--|-->|--!>|<!-$/g;

  // Declare arrays as variables so it can be cached by `stringifyEntities`
  const bogusCommentEntitySubset = ['>'];
  const commentEntitySubset = ['<', '>'];

  /**
   * Serialize a comment.
   *
   * @param {Comment} node
   *   Node to handle.
   * @param {number | undefined} _1
   *   Index of `node` in `parent.
   * @param {Parents | undefined} _2
   *   Parent of `node`.
   * @param {State} state
   *   Info passed around about the current state.
   * @returns {string}
   *   Serialized node.
   */
  function comment(node, _1, _2, state) {
    // See: <https://html.spec.whatwg.org/multipage/syntax.html#comments>
    return state.settings.bogusComments
      ? '<?' +
          stringifyEntities(
            node.value,
            Object.assign({}, state.settings.characterReferences, {
              subset: bogusCommentEntitySubset
            })
          ) +
          '>'
      : '<!--' + node.value.replace(htmlCommentRegex, encode) + '-->'

    /**
     * @param {string} $0
     */
    function encode($0) {
      return stringifyEntities(
        $0,
        Object.assign({}, state.settings.characterReferences, {
          subset: commentEntitySubset
        })
      )
    }
  }

  /**
   * @import {Doctype, Parents} from 'hast'
   * @import {State} from '../index.js'
   */

  /**
   * Serialize a doctype.
   *
   * @param {Doctype} _1
   *   Node to handle.
   * @param {number | undefined} _2
   *   Index of `node` in `parent.
   * @param {Parents | undefined} _3
   *   Parent of `node`.
   * @param {State} state
   *   Info passed around about the current state.
   * @returns {string}
   *   Serialized node.
   */
  function doctype(_1, _2, _3, state) {
    return (
      '<!' +
      (state.settings.upperDoctype ? 'DOCTYPE' : 'doctype') +
      (state.settings.tightDoctype ? '' : ' ') +
      'html>'
    )
  }

  /**
   * Count how often a character (or substring) is used in a string.
   *
   * @param {string} value
   *   Value to search in.
   * @param {string} character
   *   Character (or substring) to look for.
   * @return {number}
   *   Number of times `character` occurred in `value`.
   */
  function ccount(value, character) {
    const source = String(value);

    if (typeof character !== 'string') {
      throw new TypeError('Expected character')
    }

    let count = 0;
    let index = source.indexOf(character);

    while (index !== -1) {
      count++;
      index = source.indexOf(character, index + character.length);
    }

    return count
  }

  /**
   * @typedef {import('hast').Nodes} Nodes
   */

  // HTML whitespace expression.
  // See <https://infra.spec.whatwg.org/#ascii-whitespace>.
  const re = /[ \t\n\f\r]/g;

  /**
   * Check if the given value is *inter-element whitespace*.
   *
   * @param {Nodes | string} thing
   *   Thing to check (`Node` or `string`).
   * @returns {boolean}
   *   Whether the `value` is inter-element whitespace (`boolean`): consisting of
   *   zero or more of space, tab (`\t`), line feed (`\n`), carriage return
   *   (`\r`), or form feed (`\f`); if a node is passed it must be a `Text` node,
   *   whose `value` field is checked.
   */
  function whitespace(thing) {
    return typeof thing === 'object'
      ? thing.type === 'text'
        ? empty(thing.value)
        : false
      : empty(thing)
  }

  /**
   * @param {string} value
   * @returns {boolean}
   */
  function empty(value) {
    return value.replace(re, '') === ''
  }

  /**
   * @import {Parents, RootContent} from 'hast'
   */


  const siblingAfter = siblings(1);
  const siblingBefore = siblings(-1);

  /** @type {Array<RootContent>} */
  const emptyChildren$1 = [];

  /**
   * Factory to check siblings in a direction.
   *
   * @param {number} increment
   */
  function siblings(increment) {
    return sibling

    /**
     * Find applicable siblings in a direction.
     *
     * @template {Parents} Parent
     *   Parent type.
     * @param {Parent | undefined} parent
     *   Parent.
     * @param {number | undefined} index
     *   Index of child in `parent`.
     * @param {boolean | undefined} [includeWhitespace=false]
     *   Whether to include whitespace (default: `false`).
     * @returns {Parent extends {children: Array<infer Child>} ? Child | undefined : never}
     *   Child of parent.
     */
    function sibling(parent, index, includeWhitespace) {
      const siblings = parent ? parent.children : emptyChildren$1;
      let offset = (index || 0) + increment;
      let next = siblings[offset];

      if (!includeWhitespace) {
        while (next && whitespace(next)) {
          offset += increment;
          next = siblings[offset];
        }
      }

      // @ts-expect-error: it’s a correct child.
      return next
    }
  }

  /**
   * @import {Element, Parents} from 'hast'
   */

  /**
   * @callback OmitHandle
   *   Check if a tag can be omitted.
   * @param {Element} element
   *   Element to check.
   * @param {number | undefined} index
   *   Index of element in parent.
   * @param {Parents | undefined} parent
   *   Parent of element.
   * @returns {boolean}
   *   Whether to omit a tag.
   *
   */

  const own = {}.hasOwnProperty;

  /**
   * Factory to check if a given node can have a tag omitted.
   *
   * @param {Record<string, OmitHandle>} handlers
   *   Omission handlers, where each key is a tag name, and each value is the
   *   corresponding handler.
   * @returns {OmitHandle}
   *   Whether to omit a tag of an element.
   */
  function omission(handlers) {
    return omit

    /**
     * Check if a given node can have a tag omitted.
     *
     * @type {OmitHandle}
     */
    function omit(node, index, parent) {
      return (
        own.call(handlers, node.tagName) &&
        handlers[node.tagName](node, index, parent)
      )
    }
  }

  /**
   * @import {Element, Parents} from 'hast'
   */


  const closing = omission({
    body: body$1,
    caption: headOrColgroupOrCaption,
    colgroup: headOrColgroupOrCaption,
    dd,
    dt,
    head: headOrColgroupOrCaption,
    html: html$1,
    li,
    optgroup,
    option,
    p,
    rp: rubyElement,
    rt: rubyElement,
    tbody: tbody$1,
    td: cells,
    tfoot,
    th: cells,
    thead,
    tr
  });

  /**
   * Macro for `</head>`, `</colgroup>`, and `</caption>`.
   *
   * @param {Element} _
   *   Element.
   * @param {number | undefined} index
   *   Index of element in parent.
   * @param {Parents | undefined} parent
   *   Parent of element.
   * @returns {boolean}
   *   Whether the closing tag can be omitted.
   */
  function headOrColgroupOrCaption(_, index, parent) {
    const next = siblingAfter(parent, index, true);
    return (
      !next ||
      (next.type !== 'comment' &&
        !(next.type === 'text' && whitespace(next.value.charAt(0))))
    )
  }

  /**
   * Whether to omit `</html>`.
   *
   * @param {Element} _
   *   Element.
   * @param {number | undefined} index
   *   Index of element in parent.
   * @param {Parents | undefined} parent
   *   Parent of element.
   * @returns {boolean}
   *   Whether the closing tag can be omitted.
   */
  function html$1(_, index, parent) {
    const next = siblingAfter(parent, index);
    return !next || next.type !== 'comment'
  }

  /**
   * Whether to omit `</body>`.
   *
   * @param {Element} _
   *   Element.
   * @param {number | undefined} index
   *   Index of element in parent.
   * @param {Parents | undefined} parent
   *   Parent of element.
   * @returns {boolean}
   *   Whether the closing tag can be omitted.
   */
  function body$1(_, index, parent) {
    const next = siblingAfter(parent, index);
    return !next || next.type !== 'comment'
  }

  /**
   * Whether to omit `</p>`.
   *
   * @param {Element} _
   *   Element.
   * @param {number | undefined} index
   *   Index of element in parent.
   * @param {Parents | undefined} parent
   *   Parent of element.
   * @returns {boolean}
   *   Whether the closing tag can be omitted.
   */
  function p(_, index, parent) {
    const next = siblingAfter(parent, index);
    return next
      ? next.type === 'element' &&
          (next.tagName === 'address' ||
            next.tagName === 'article' ||
            next.tagName === 'aside' ||
            next.tagName === 'blockquote' ||
            next.tagName === 'details' ||
            next.tagName === 'div' ||
            next.tagName === 'dl' ||
            next.tagName === 'fieldset' ||
            next.tagName === 'figcaption' ||
            next.tagName === 'figure' ||
            next.tagName === 'footer' ||
            next.tagName === 'form' ||
            next.tagName === 'h1' ||
            next.tagName === 'h2' ||
            next.tagName === 'h3' ||
            next.tagName === 'h4' ||
            next.tagName === 'h5' ||
            next.tagName === 'h6' ||
            next.tagName === 'header' ||
            next.tagName === 'hgroup' ||
            next.tagName === 'hr' ||
            next.tagName === 'main' ||
            next.tagName === 'menu' ||
            next.tagName === 'nav' ||
            next.tagName === 'ol' ||
            next.tagName === 'p' ||
            next.tagName === 'pre' ||
            next.tagName === 'section' ||
            next.tagName === 'table' ||
            next.tagName === 'ul')
      : !parent ||
          // Confusing parent.
          !(
            parent.type === 'element' &&
            (parent.tagName === 'a' ||
              parent.tagName === 'audio' ||
              parent.tagName === 'del' ||
              parent.tagName === 'ins' ||
              parent.tagName === 'map' ||
              parent.tagName === 'noscript' ||
              parent.tagName === 'video')
          )
  }

  /**
   * Whether to omit `</li>`.
   *
   * @param {Element} _
   *   Element.
   * @param {number | undefined} index
   *   Index of element in parent.
   * @param {Parents | undefined} parent
   *   Parent of element.
   * @returns {boolean}
   *   Whether the closing tag can be omitted.
   */
  function li(_, index, parent) {
    const next = siblingAfter(parent, index);
    return !next || (next.type === 'element' && next.tagName === 'li')
  }

  /**
   * Whether to omit `</dt>`.
   *
   * @param {Element} _
   *   Element.
   * @param {number | undefined} index
   *   Index of element in parent.
   * @param {Parents | undefined} parent
   *   Parent of element.
   * @returns {boolean}
   *   Whether the closing tag can be omitted.
   */
  function dt(_, index, parent) {
    const next = siblingAfter(parent, index);
    return Boolean(
      next &&
        next.type === 'element' &&
        (next.tagName === 'dt' || next.tagName === 'dd')
    )
  }

  /**
   * Whether to omit `</dd>`.
   *
   * @param {Element} _
   *   Element.
   * @param {number | undefined} index
   *   Index of element in parent.
   * @param {Parents | undefined} parent
   *   Parent of element.
   * @returns {boolean}
   *   Whether the closing tag can be omitted.
   */
  function dd(_, index, parent) {
    const next = siblingAfter(parent, index);
    return (
      !next ||
      (next.type === 'element' &&
        (next.tagName === 'dt' || next.tagName === 'dd'))
    )
  }

  /**
   * Whether to omit `</rt>` or `</rp>`.
   *
   * @param {Element} _
   *   Element.
   * @param {number | undefined} index
   *   Index of element in parent.
   * @param {Parents | undefined} parent
   *   Parent of element.
   * @returns {boolean}
   *   Whether the closing tag can be omitted.
   */
  function rubyElement(_, index, parent) {
    const next = siblingAfter(parent, index);
    return (
      !next ||
      (next.type === 'element' &&
        (next.tagName === 'rp' || next.tagName === 'rt'))
    )
  }

  /**
   * Whether to omit `</optgroup>`.
   *
   * @param {Element} _
   *   Element.
   * @param {number | undefined} index
   *   Index of element in parent.
   * @param {Parents | undefined} parent
   *   Parent of element.
   * @returns {boolean}
   *   Whether the closing tag can be omitted.
   */
  function optgroup(_, index, parent) {
    const next = siblingAfter(parent, index);
    return !next || (next.type === 'element' && next.tagName === 'optgroup')
  }

  /**
   * Whether to omit `</option>`.
   *
   * @param {Element} _
   *   Element.
   * @param {number | undefined} index
   *   Index of element in parent.
   * @param {Parents | undefined} parent
   *   Parent of element.
   * @returns {boolean}
   *   Whether the closing tag can be omitted.
   */
  function option(_, index, parent) {
    const next = siblingAfter(parent, index);
    return (
      !next ||
      (next.type === 'element' &&
        (next.tagName === 'option' || next.tagName === 'optgroup'))
    )
  }

  /**
   * Whether to omit `</thead>`.
   *
   * @param {Element} _
   *   Element.
   * @param {number | undefined} index
   *   Index of element in parent.
   * @param {Parents | undefined} parent
   *   Parent of element.
   * @returns {boolean}
   *   Whether the closing tag can be omitted.
   */
  function thead(_, index, parent) {
    const next = siblingAfter(parent, index);
    return Boolean(
      next &&
        next.type === 'element' &&
        (next.tagName === 'tbody' || next.tagName === 'tfoot')
    )
  }

  /**
   * Whether to omit `</tbody>`.
   *
   * @param {Element} _
   *   Element.
   * @param {number | undefined} index
   *   Index of element in parent.
   * @param {Parents | undefined} parent
   *   Parent of element.
   * @returns {boolean}
   *   Whether the closing tag can be omitted.
   */
  function tbody$1(_, index, parent) {
    const next = siblingAfter(parent, index);
    return (
      !next ||
      (next.type === 'element' &&
        (next.tagName === 'tbody' || next.tagName === 'tfoot'))
    )
  }

  /**
   * Whether to omit `</tfoot>`.
   *
   * @param {Element} _
   *   Element.
   * @param {number | undefined} index
   *   Index of element in parent.
   * @param {Parents | undefined} parent
   *   Parent of element.
   * @returns {boolean}
   *   Whether the closing tag can be omitted.
   */
  function tfoot(_, index, parent) {
    return !siblingAfter(parent, index)
  }

  /**
   * Whether to omit `</tr>`.
   *
   * @param {Element} _
   *   Element.
   * @param {number | undefined} index
   *   Index of element in parent.
   * @param {Parents | undefined} parent
   *   Parent of element.
   * @returns {boolean}
   *   Whether the closing tag can be omitted.
   */
  function tr(_, index, parent) {
    const next = siblingAfter(parent, index);
    return !next || (next.type === 'element' && next.tagName === 'tr')
  }

  /**
   * Whether to omit `</td>` or `</th>`.
   *
   * @param {Element} _
   *   Element.
   * @param {number | undefined} index
   *   Index of element in parent.
   * @param {Parents | undefined} parent
   *   Parent of element.
   * @returns {boolean}
   *   Whether the closing tag can be omitted.
   */
  function cells(_, index, parent) {
    const next = siblingAfter(parent, index);
    return (
      !next ||
      (next.type === 'element' &&
        (next.tagName === 'td' || next.tagName === 'th'))
    )
  }

  /**
   * @import {Element, Parents} from 'hast'
   */


  const opening = omission({
    body,
    colgroup,
    head,
    html,
    tbody
  });

  /**
   * Whether to omit `<html>`.
   *
   * @param {Element} node
   *   Element.
   * @returns {boolean}
   *   Whether the opening tag can be omitted.
   */
  function html(node) {
    const head = siblingAfter(node, -1);
    return !head || head.type !== 'comment'
  }

  /**
   * Whether to omit `<head>`.
   *
   * @param {Element} node
   *   Element.
   * @returns {boolean}
   *   Whether the opening tag can be omitted.
   */
  function head(node) {
    /** @type {Set<string>} */
    const seen = new Set();

    // Whether `srcdoc` or not,
    // make sure the content model at least doesn’t have too many `base`s/`title`s.
    for (const child of node.children) {
      if (
        child.type === 'element' &&
        (child.tagName === 'base' || child.tagName === 'title')
      ) {
        if (seen.has(child.tagName)) return false
        seen.add(child.tagName);
      }
    }

    // “May be omitted if the element is empty,
    // or if the first thing inside the head element is an element.”
    const child = node.children[0];
    return !child || child.type === 'element'
  }

  /**
   * Whether to omit `<body>`.
   *
   * @param {Element} node
   *   Element.
   * @returns {boolean}
   *   Whether the opening tag can be omitted.
   */
  function body(node) {
    const head = siblingAfter(node, -1, true);

    return (
      !head ||
      (head.type !== 'comment' &&
        !(head.type === 'text' && whitespace(head.value.charAt(0))) &&
        !(
          head.type === 'element' &&
          (head.tagName === 'meta' ||
            head.tagName === 'link' ||
            head.tagName === 'script' ||
            head.tagName === 'style' ||
            head.tagName === 'template')
        ))
    )
  }

  /**
   * Whether to omit `<colgroup>`.
   * The spec describes some logic for the opening tag, but it’s easier to
   * implement in the closing tag, to the same effect, so we handle it there
   * instead.
   *
   * @param {Element} node
   *   Element.
   * @param {number | undefined} index
   *   Index of element in parent.
   * @param {Parents | undefined} parent
   *   Parent of element.
   * @returns {boolean}
   *   Whether the opening tag can be omitted.
   */
  function colgroup(node, index, parent) {
    const previous = siblingBefore(parent, index);
    const head = siblingAfter(node, -1, true);

    // Previous colgroup was already omitted.
    if (
      parent &&
      previous &&
      previous.type === 'element' &&
      previous.tagName === 'colgroup' &&
      closing(previous, parent.children.indexOf(previous), parent)
    ) {
      return false
    }

    return Boolean(head && head.type === 'element' && head.tagName === 'col')
  }

  /**
   * Whether to omit `<tbody>`.
   *
   * @param {Element} node
   *   Element.
   * @param {number | undefined} index
   *   Index of element in parent.
   * @param {Parents | undefined} parent
   *   Parent of element.
   * @returns {boolean}
   *   Whether the opening tag can be omitted.
   */
  function tbody(node, index, parent) {
    const previous = siblingBefore(parent, index);
    const head = siblingAfter(node, -1);

    // Previous table section was already omitted.
    if (
      parent &&
      previous &&
      previous.type === 'element' &&
      (previous.tagName === 'thead' || previous.tagName === 'tbody') &&
      closing(previous, parent.children.indexOf(previous), parent)
    ) {
      return false
    }

    return Boolean(head && head.type === 'element' && head.tagName === 'tr')
  }

  /**
   * @import {Element, Parents, Properties} from 'hast'
   * @import {State} from '../index.js'
   */


  /**
   * Maps of subsets.
   *
   * Each value is a matrix of tuples.
   * The value at `0` causes parse errors, the value at `1` is valid.
   * Of both, the value at `0` is unsafe, and the value at `1` is safe.
   *
   * @type {Record<'double' | 'name' | 'single' | 'unquoted', Array<[Array<string>, Array<string>]>>}
   */
  const constants = {
    // See: <https://html.spec.whatwg.org/#attribute-name-state>.
    name: [
      ['\t\n\f\r &/=>'.split(''), '\t\n\f\r "&\'/=>`'.split('')],
      ['\0\t\n\f\r "&\'/<=>'.split(''), '\0\t\n\f\r "&\'/<=>`'.split('')]
    ],
    // See: <https://html.spec.whatwg.org/#attribute-value-(unquoted)-state>.
    unquoted: [
      ['\t\n\f\r &>'.split(''), '\0\t\n\f\r "&\'<=>`'.split('')],
      ['\0\t\n\f\r "&\'<=>`'.split(''), '\0\t\n\f\r "&\'<=>`'.split('')]
    ],
    // See: <https://html.spec.whatwg.org/#attribute-value-(single-quoted)-state>.
    single: [
      ["&'".split(''), '"&\'`'.split('')],
      ["\0&'".split(''), '\0"&\'`'.split('')]
    ],
    // See: <https://html.spec.whatwg.org/#attribute-value-(double-quoted)-state>.
    double: [
      ['"&'.split(''), '"&\'`'.split('')],
      ['\0"&'.split(''), '\0"&\'`'.split('')]
    ]
  };

  /**
   * Serialize an element node.
   *
   * @param {Element} node
   *   Node to handle.
   * @param {number | undefined} index
   *   Index of `node` in `parent.
   * @param {Parents | undefined} parent
   *   Parent of `node`.
   * @param {State} state
   *   Info passed around about the current state.
   * @returns {string}
   *   Serialized node.
   */
  function element(node, index, parent, state) {
    const schema = state.schema;
    const omit = schema.space === 'svg' ? false : state.settings.omitOptionalTags;
    let selfClosing =
      schema.space === 'svg'
        ? state.settings.closeEmptyElements
        : state.settings.voids.includes(node.tagName.toLowerCase());
    /** @type {Array<string>} */
    const parts = [];
    /** @type {string} */
    let last;

    if (schema.space === 'html' && node.tagName === 'svg') {
      state.schema = svg;
    }

    const attributes = serializeAttributes(state, node.properties);

    const content = state.all(
      schema.space === 'html' && node.tagName === 'template' ? node.content : node
    );

    state.schema = schema;

    // If the node is categorised as void, but it has children, remove the
    // categorisation.
    // This enables for example `menuitem`s, which are void in W3C HTML but not
    // void in WHATWG HTML, to be stringified properly.
    // Note: `menuitem` has since been removed from the HTML spec, and so is no
    // longer void.
    if (content) selfClosing = false;

    if (attributes || !omit || !opening(node, index, parent)) {
      parts.push('<', node.tagName, attributes ? ' ' + attributes : '');

      if (
        selfClosing &&
        (schema.space === 'svg' || state.settings.closeSelfClosing)
      ) {
        last = attributes.charAt(attributes.length - 1);
        if (
          !state.settings.tightSelfClosing ||
          last === '/' ||
          (last && last !== '"' && last !== "'")
        ) {
          parts.push(' ');
        }

        parts.push('/');
      }

      parts.push('>');
    }

    parts.push(content);

    if (!selfClosing && (!omit || !closing(node, index, parent))) {
      parts.push('</' + node.tagName + '>');
    }

    return parts.join('')
  }

  /**
   * @param {State} state
   * @param {Properties | null | undefined} properties
   * @returns {string}
   */
  function serializeAttributes(state, properties) {
    /** @type {Array<string>} */
    const values = [];
    let index = -1;
    /** @type {string} */
    let key;

    if (properties) {
      for (key in properties) {
        if (properties[key] !== null && properties[key] !== undefined) {
          const value = serializeAttribute(state, key, properties[key]);
          if (value) values.push(value);
        }
      }
    }

    while (++index < values.length) {
      const last = state.settings.tightAttributes
        ? values[index].charAt(values[index].length - 1)
        : undefined;

      // In tight mode, don’t add a space after quoted attributes.
      if (index !== values.length - 1 && last !== '"' && last !== "'") {
        values[index] += ' ';
      }
    }

    return values.join('')
  }

  /**
   * @param {State} state
   * @param {string} key
   * @param {Properties[keyof Properties]} value
   * @returns {string}
   */
  function serializeAttribute(state, key, value) {
    const info = find(state.schema, key);
    const x =
      state.settings.allowParseErrors && state.schema.space === 'html' ? 0 : 1;
    const y = state.settings.allowDangerousCharacters ? 0 : 1;
    let quote = state.quote;
    /** @type {string | undefined} */
    let result;

    if (info.overloadedBoolean && (value === info.attribute || value === '')) {
      value = true;
    } else if (
      info.boolean ||
      (info.overloadedBoolean && typeof value !== 'string')
    ) {
      value = Boolean(value);
    }

    if (
      value === null ||
      value === undefined ||
      value === false ||
      (typeof value === 'number' && Number.isNaN(value))
    ) {
      return ''
    }

    const name = stringifyEntities(
      info.attribute,
      Object.assign({}, state.settings.characterReferences, {
        // Always encode without parse errors in non-HTML.
        subset: constants.name[x][y]
      })
    );

    // No value.
    // There is currently only one boolean property in SVG: `[download]` on
    // `<a>`.
    // This property does not seem to work in browsers (Firefox, Safari, Chrome),
    // so I can’t test if dropping the value works.
    // But I assume that it should:
    //
    // ```html
    // <!doctype html>
    // <svg viewBox="0 0 100 100">
    //   <a href=https://example.com download>
    //     <circle cx=50 cy=40 r=35 />
    //   </a>
    // </svg>
    // ```
    //
    // See: <https://github.com/wooorm/property-information/blob/main/lib/svg.js>
    if (value === true) return name

    // `spaces` doesn’t accept a second argument, but it’s given here just to
    // keep the code cleaner.
    value = Array.isArray(value)
      ? (info.commaSeparated ? stringify$2 : stringify$1)(value, {
          padLeft: !state.settings.tightCommaSeparatedLists
        })
      : String(value);

    if (state.settings.collapseEmptyAttributes && !value) return name

    // Check unquoted value.
    if (state.settings.preferUnquoted) {
      result = stringifyEntities(
        value,
        Object.assign({}, state.settings.characterReferences, {
          attribute: true,
          subset: constants.unquoted[x][y]
        })
      );
    }

    // If we don’t want unquoted, or if `value` contains character references when
    // unquoted…
    if (result !== value) {
      // If the alternative is less common than `quote`, switch.
      if (
        state.settings.quoteSmart &&
        ccount(value, quote) > ccount(value, state.alternative)
      ) {
        quote = state.alternative;
      }

      result =
        quote +
        stringifyEntities(
          value,
          Object.assign({}, state.settings.characterReferences, {
            // Always encode without parse errors in non-HTML.
            subset: (quote === "'" ? constants.single : constants.double)[x][y],
            attribute: true
          })
        ) +
        quote;
    }

    // Don’t add a `=` for unquoted empties.
    return name + (result ? '=' + result : result)
  }

  /**
   * @import {Parents, Text} from 'hast'
   * @import {Raw} from 'mdast-util-to-hast'
   * @import {State} from '../index.js'
   */


  // Declare array as variable so it can be cached by `stringifyEntities`
  const textEntitySubset = ['<', '&'];

  /**
   * Serialize a text node.
   *
   * @param {Raw | Text} node
   *   Node to handle.
   * @param {number | undefined} _
   *   Index of `node` in `parent.
   * @param {Parents | undefined} parent
   *   Parent of `node`.
   * @param {State} state
   *   Info passed around about the current state.
   * @returns {string}
   *   Serialized node.
   */
  function text(node, _, parent, state) {
    // Check if content of `node` should be escaped.
    return parent &&
      parent.type === 'element' &&
      (parent.tagName === 'script' || parent.tagName === 'style')
      ? node.value
      : stringifyEntities(
          node.value,
          Object.assign({}, state.settings.characterReferences, {
            subset: textEntitySubset
          })
        )
  }

  /**
   * @import {Parents} from 'hast'
   * @import {Raw} from 'mdast-util-to-hast'
   * @import {State} from '../index.js'
   */


  /**
   * Serialize a raw node.
   *
   * @param {Raw} node
   *   Node to handle.
   * @param {number | undefined} index
   *   Index of `node` in `parent.
   * @param {Parents | undefined} parent
   *   Parent of `node`.
   * @param {State} state
   *   Info passed around about the current state.
   * @returns {string}
   *   Serialized node.
   */
  function raw(node, index, parent, state) {
    return state.settings.allowDangerousHtml
      ? node.value
      : text(node, index, parent, state)
  }

  /**
   * @import {Parents, Root} from 'hast'
   * @import {State} from '../index.js'
   */

  /**
   * Serialize a root.
   *
   * @param {Root} node
   *   Node to handle.
   * @param {number | undefined} _1
   *   Index of `node` in `parent.
   * @param {Parents | undefined} _2
   *   Parent of `node`.
   * @param {State} state
   *   Info passed around about the current state.
   * @returns {string}
   *   Serialized node.
   */
  function root(node, _1, _2, state) {
    return state.all(node)
  }

  /**
   * @import {Nodes, Parents} from 'hast'
   * @import {State} from '../index.js'
   */


  /**
   * @type {(node: Nodes, index: number | undefined, parent: Parents | undefined, state: State) => string}
   */
  const handle = zwitch('type', {
    invalid,
    unknown,
    handlers: {comment, doctype, element, raw, root, text}
  });

  /**
   * Fail when a non-node is found in the tree.
   *
   * @param {unknown} node
   *   Unknown value.
   * @returns {never}
   *   Never.
   */
  function invalid(node) {
    throw new Error('Expected node, not `' + node + '`')
  }

  /**
   * Fail when a node with an unknown type is found in the tree.
   *
   * @param {unknown} node_
   *  Unknown node.
   * @returns {never}
   *   Never.
   */
  function unknown(node_) {
    // `type` is guaranteed by runtime JS.
    const node = /** @type {Nodes} */ (node_);
    throw new Error('Cannot compile unknown node `' + node.type + '`')
  }

  /**
   * @import {Nodes, Parents, RootContent} from 'hast'
   * @import {Schema} from 'property-information'
   * @import {Options as StringifyEntitiesOptions} from 'stringify-entities'
   */


  /** @type {Options} */
  const emptyOptions = {};

  /** @type {CharacterReferences} */
  const emptyCharacterReferences = {};

  /** @type {Array<never>} */
  const emptyChildren = [];

  /**
   * Serialize hast as HTML.
   *
   * @param {Array<RootContent> | Nodes} tree
   *   Tree to serialize.
   * @param {Options | null | undefined} [options]
   *   Configuration (optional).
   * @returns {string}
   *   Serialized HTML.
   */
  function toHtml(tree, options) {
    const options_ = options || emptyOptions;
    const quote = options_.quote || '"';
    const alternative = quote === '"' ? "'" : '"';

    if (quote !== '"' && quote !== "'") {
      throw new Error('Invalid quote `' + quote + '`, expected `\'` or `"`')
    }

    /** @type {State} */
    const state = {
      one,
      all,
      settings: {
        omitOptionalTags: options_.omitOptionalTags || false,
        allowParseErrors: options_.allowParseErrors || false,
        allowDangerousCharacters: options_.allowDangerousCharacters || false,
        quoteSmart: options_.quoteSmart || false,
        preferUnquoted: options_.preferUnquoted || false,
        tightAttributes: options_.tightAttributes || false,
        upperDoctype: options_.upperDoctype || false,
        tightDoctype: options_.tightDoctype || false,
        bogusComments: options_.bogusComments || false,
        tightCommaSeparatedLists: options_.tightCommaSeparatedLists || false,
        tightSelfClosing: options_.tightSelfClosing || false,
        collapseEmptyAttributes: options_.collapseEmptyAttributes || false,
        allowDangerousHtml: options_.allowDangerousHtml || false,
        voids: options_.voids || htmlVoidElements,
        characterReferences:
          options_.characterReferences || emptyCharacterReferences,
        closeSelfClosing: options_.closeSelfClosing || false,
        closeEmptyElements: options_.closeEmptyElements || false
      },
      schema: options_.space === 'svg' ? svg : html$2,
      quote,
      alternative
    };

    return state.one(
      Array.isArray(tree) ? {type: 'root', children: tree} : tree,
      undefined,
      undefined
    )
  }

  /**
   * Serialize a node.
   *
   * @this {State}
   *   Info passed around about the current state.
   * @param {Nodes} node
   *   Node to handle.
   * @param {number | undefined} index
   *   Index of `node` in `parent.
   * @param {Parents | undefined} parent
   *   Parent of `node`.
   * @returns {string}
   *   Serialized node.
   */
  function one(node, index, parent) {
    return handle(node, index, parent, this)
  }

  /**
   * Serialize all children of `parent`.
   *
   * @this {State}
   *   Info passed around about the current state.
   * @param {Parents | undefined} parent
   *   Parent whose children to serialize.
   * @returns {string}
   */
  function all(parent) {
    /** @type {Array<string>} */
    const results = [];
    const children = (parent && parent.children) || emptyChildren;
    let index = -1;

    while (++index < children.length) {
      results[index] = this.one(children[index], index, parent);
    }

    return results.join('')
  }

  /**
   * @import {Root} from 'hast'
   * @import {Options} from 'hast-util-to-html'
   * @import {Compiler, Processor} from 'unified'
   */


  /**
   * Plugin to add support for serializing as HTML.
   *
   * @param {Options | null | undefined} [options]
   *   Configuration (optional).
   * @returns {undefined}
   *   Nothing.
   */
  function rehypeStringify(options) {
    /** @type {Processor<undefined, undefined, undefined, Root, string>} */
    // @ts-expect-error: TS in JSDoc generates wrong types if `this` is typed regularly.
    const self = this;
    const settings = {...self.data('settings'), ...options};

    self.compiler = compiler;

    /**
     * @type {Compiler<Root, string>}
     */
    function compiler(tree) {
      return toHtml(tree, settings)
    }
  }

  let handler = {
      has(target, property) {
          switch (target.type) {
              case 'object': {
                  for (let i=0 ; i<target.children.length ; i++) {
                      let child = target.children[i];
                      if (child.name == property) {
                          return true
                      }
                  }
              }
              case 'array': {
                  return property in target.children
              }
              case 'unknown': {
                  return false
              }
              // case 'value': {
              //     return true
              // }
              default: {
                  throw new Error(target.type)
              }
          }
          return false

          // return property in target
      },
      get(target, property, receiver) {
          if (property=='toJSON') {
              const obj = {};
              if (target.children) target.children.forEach(child => {
                  obj[child.name] = child.value;
              });
              return () => (obj)
          }
          switch (target.type) {
              case 'object': {

                  if (property == 'constructor') return Object

                  for (let i=0 ; i<target.children.length ; i++) {
                      let child = target.children[i];
                      if (child.name == property) {
                          if (child.type == 'value') {
                              return child.value
                          } else {
                              return new Proxy(child,handler)
                          }
                      }
                  }
                  return null;
              }
              case 'array': {

                  if (property == 'constructor') return Array

                  const v = target.children[property];
                  if (v==null) return null
                  else if (v.type == 'value') return v.value
                  return new Proxy(v,handler)
              }
              case 'unknown': {
                  return null;
              }
              case 'value': {
                  return target.value[property]
              }
              default: {
                  throw new Error(target.type)
              }
          }
      },
      set(target, property, value, receiver) {
          throw new Error('set not-implemented')
      },
      ownKeys(target) {
          if (target.children) {
              return target.children.map(child => child.name)
          } else {
              return []
          }
      }
  };

  class JsonTree {

      constructor() {
          this.root = { minChildIndent: 0, type: 'unknown', name: 'root' };
          this.json = new Proxy(this.root,handler);        
      }

      iterateLikeStack(cb) {
          let el = this.root;
          while (el != null) {
              if (cb.call(null,el) === false) return
              el = (el.children ? el.children[el.children.length-1] : null);
              if (el!=null && el.type == 'value') {
                  el = null;
              }
          }
      }   
  }

  function tagForStyle(s) {
      switch (s) {
          case 'bold': return h('b');
          case 'italic': return h('i');
          case 'underline': return h('u');
          case 'strike-through': return h('s')
          case 'superscript': return h('sup')
          case 'subscript': return h('sub')
          case 'code': return h('code')
          case 'kbd': return h('kbd')
          default: return h('div',{'data-style':s})
      }
  }

  function sastTextToHast(children) {

      let hast = [];

      let stack = [{ children: hast }];

      function openStyle(s) {
          let n = tagForStyle(s);
          stack[stack.length-1].children.push(n);
          stack.push({ style: s, children: n.children });
      }

      function closedOpenStyle(s) {

  //        console.log(util.inspect(stack,false,null,true))
          let i = stack.length - 1;
          while (i>0 && stack[i].style != s) {
              i--;
          }
          if (i>0) {
              // console.log('currently in style: ' + s + ' at stack i=' + i)

              while (stack.length>i) {
                  stack.pop();
              }

              return true
          } else {
              return false
          }
      }

      // console.log('init stack',util.inspect(stack,false,null,true))
      // console.log('init hast',util.inspect(hast,false,null,true))

      if (children) for (let i=0 ; i<children.length ; i++) {

          // console.log('next child: ',util.inspect(children[i],false,null,true))

          switch (children[i].type) {
              case 'text':
              case 'element':
              case 'comment':
                  stack[stack.length-1].children.push(children[i]);
                  // console.log('text, stack now',util.inspect(stack,false,null,true))
                  break;
              case 'link':
                  let link = children[i];
                  stack[stack.length-1].children.push(h('a',{
                      href: link.ref,
                  },[t(link.text)]));
                  break;
              // case 'include':
              //     let inc = children[i]
              //     stack[stack.length-1].children.push(h('span',{
              //         class: inc.name,
              //         args: inc.args
              //     },[]))               
              //     break;
              // case 'mention':
              //     let m = children[i]
              //     stack[stack.length-1].children.push(h('a',{
              //         href: '/users/' + m.value,
              //     },[t( '@' + m.value)]))
              //     break;
              case 'format':
                  if (!closedOpenStyle(children[i].style)) {
                      openStyle(children[i].style);
                  }
                  break;
              default:
                  throw new Error('not implemented: ' + JSON.stringify(children[i]))
          }

          // console.log('stack',util.inspect(stack,false,null,true))
          // console.log('hast',util.inspect(hast,false,null,true))

      }

      return hast
  }

  function sastTableToHast(rows) {
      let head = [];
      let body = [];
      let foot = [];
      let colAlignment = {};

      // console.log(util.inspect(rows,false,null,true))

      let r = 0;

      // put all lines in body until end or there is a divider
      while ( r<rows.length && rows[r].type != 'table-divider-line') {
          body.push(rows[r++]);
      }

      // got a divider, put rows so far in header and start filling body
      if (r<rows.length) {
          r++;
          head = body;
          body = [];

          // put all lines in body until end or there is a divider
          while ( r<rows.length && rows[r].type != 'table-divider-line') {
              body.push(rows[r++]);
          }

          // found a second divider, put all remaining rows in foot
          if (r<rows.length) {
              r++;

              while ( r<rows.length ) {
                  if (rows[r].type == 'table-row-line') {
                      foot.push(rows[r]);
                  }
                  r++;
              }
          
          }
      }

      if (head.length>0) {
          for (let i=0 ; i<head.length ; i++) {
              for (let j=0 ; j<head[i].children.length ; j++) {
                  if (head[i].children[j].formatting.align) {
                      colAlignment[j] = head[i].children[j].formatting.align;
                  }
              }
          }
      }

      function cell(row,cellNumber,forceHeader) {
          let el = h((forceHeader || row.children[cellNumber].formatting.header ? 'th' : 'td'));

          if (row.children[cellNumber].formatting.colspan !== undefined) {
              el.properties.colspan = row.children[cellNumber].formatting.colspan;
          }

          if (row.children[cellNumber].formatting.rowspan !== undefined) {
              el.properties.rowspan = row.children[cellNumber].formatting.rowspan;
          }

          if (row.children[cellNumber].formatting.align !== undefined) {
              el.properties.style = `text-align: ${row.children[cellNumber].formatting.align};`;
          } else if (colAlignment[cellNumber] !== undefined) {
              el.properties.style = `text-align: ${colAlignment[cellNumber]};`;
          }

          return el
      }

      const table = h('table');

      if (head.length>0) {
          const thead = h('thead');
          table.children.push(thead);
          for (let i=0 ; i<head.length ; i++) {
              const tr = h('tr');
              thead.children.push(tr);
              for (let j=0 ; j<head[i].children.length ; j++) {
                  const th = cell(head[i],j,true);
                  tr.children.push(th);
                  th.children = head[i].children[j].children;
              }
          }
      }

      const tbody = h('tbody');
      table.children.push(tbody);
      for (let i=0 ; i<body.length ; i++) {
          const tr = h('tr');
          tbody.children.push(tr);
          for (let j=0 ; j<body[i].children.length ; j++) {
              const td = cell(body[i],j);
              tr.children.push(td);
              td.children = body[i].children[j].children;
          }
      }

      if (foot.length>0) {
          const tfoot = h('tfoot');
          table.children.push(tfoot);
          for (let i=0 ; i<foot.length ; i++) {
              const tr = h('tr');
              tfoot.children.push(tr);
              for (let j=0 ; j<foot[i].children.length ; j++) {
                  const td = cell(foot[i],j);
                  tr.children.push(td);
                  td.children = foot[i].children[j].children;
              }
          }
      }

      return table;
  }

  function sastFootnotesToHast(hast,footnotes) {

      // http://www.java2s.com/example/html-css/css-widget/adding-parentheses-in-html-ordered-list.html

      if (footnotes.length>0) {
          let footnotesLookup = {};
          const ol = h('ol');
          hast.children.push(h('section',{ class: 'footnotes'},[ol]));
          for (let i=0 ; i<footnotes.length ; i++) {
              footnotesLookup[footnotes[i].id] = i+1;

              ol.children.push(h('li',{},[ h('a',{name:`footnote-${footnotes[i].id}`}
              )].concat([t(' ')]).concat(footnotes[i].children)));
          }

          visit(hast, (node) => {
              return node.type=='element' && node.tagName=='a' && node.properties['footnote-u'] !== undefined
          }, (node) => {
              const id = node.properties['footnote-u'];
              let num = footnotesLookup[node.properties['footnote-u']];
              if (num===undefined) {
                  // used but not defined
                  num = Object.keys(footnotesLookup).length + 1;
                  footnotesLookup[id] = num;
                  ol.children.push(h('li',{},[ h('a',{name:`footnote-${id}`}) ]));
              }
              node.children[0].value = `[${num}]`;
          });
      }

  }

  class SqrmContext {
      constructor(db,jsonTree) {
          this.db = db;

          this.hast = {
              type: 'root',
              children: [],
          };

          this.indentStack = [this.hast];
          this.yamlNotAllowedIndent = -1;
          this.hastCallbacks = [];
          this.jsonTree = jsonTree || new JsonTree();
          this.json = this.jsonTree.json;
          this.blank = null;
          this.preIndent = -1;
          this.footnotes = [];
      }

      addLine(obj) {

          function spaces(i) {
              let ss = '';
              for (let j=0 ; j<i ; j++) ss = ss + '  ';
              return ss
          }

          if (this.preIndent > 0 && (obj.type == 'blank-line' || obj.indent >= this.preIndent)) {

              if (obj.type == 'element-line' 
                      && obj.tag == 'code'
                      && this.indentStack[this.preIndent].tagName == 'pre') {

                  const code = h('code',obj.properties,[{type:'text',value:'\n'}]);
                  const pre = this.indentStack[this.preIndent];
                  pre.children.push(code);
                  this.indentStack.push(code);
                  this.preIndent++;
              } else {
                  this.indentStack[this.preIndent].children.push({
                      type: 'text',
                      value: obj.text ? spaces(obj.indent-this.preIndent)+obj.text+'\n' : '\n'
                  });
              }
          } else if (obj.type == 'blank-line') {
              if (this.blank = null) {
                  this.blank = '\n';
              } else {
                  this.blank += '\n';
              }
          } else {

              this.preIndent = -1;

              if (obj.type == 'yaml-line') {

                  if (this.blank = null) {
                      this.blank = '\n';
                  } else {
                      this.blank += '\n';
                  }
                  this.jsonTag(obj);

              } else {
                  const indent = obj.indent;

                  while (this.indentStack.length - 1 < indent) {
                      let node = h('div');
                      this.indentStack[this.indentStack.length - 1].children.push(node);
                      this.indentStack.push(node);
                  }

                  while (this.indentStack.length - 1 > indent) {
                      this.indentStack.pop();
                  }

                  let prev = null;
                  const indentLevel = this.indentStack[indent];

                  if (indentLevel && indentLevel.children.length>0) {
                      prev = indentLevel.children[indentLevel.children.length-1];
                  }

                  if (obj.type == 'text-line') {

                      if (this.blank == null && prev && prev.tagName == 'p') {
                          if (prev.sqrm.length>0) prev.sqrm.push({ type: 'text', value: '\n' });
                          prev.sqrm.push(... obj.children);
                          prev.children = sastTextToHast(prev.sqrm);
                      } else if (this.blank == null && indentLevel.tagName == 'li') {
                          if (indentLevel.sqrm.length>0) indentLevel.sqrm.push({ type: 'text', value: '\n' });
                          indentLevel.sqrm.push(... obj.children);
                          indentLevel.children = sastTextToHast(indentLevel.sqrm);
                      } else {
                          let hast = h('p');
                          hast.sqrm = obj.children;
                          hast.children = sastTextToHast(obj.children);
                          indentLevel.children.push(hast);
                      }
                  } else if (obj.type == 'table-row-line' || obj.type == 'table-divider-line') {
                      if (this.blank == null && prev && prev.tagName == 'table') {
                          prev.sqrm.push(obj);
                          prev.children = sastTableToHast(prev.sqrm).children;
                      } else {
                          let hast = h('table');
                          hast.sqrm = [obj];
                          hast.children = sastTableToHast(hast.sqrm).children;
                          indentLevel.children.push(hast);
                      }
                  } else if (obj.type == 'ordered-list-item-line') {
                      if (prev && prev.tagName == 'ol') {
                          let li = h('li');
                          li.sqrm = obj.children;
                          li.children = sastTextToHast(obj.children);
                          prev.children.push(li);
                         this.indentStack.push(li);
                      } else {
                          let li = h('li');
                          li.sqrm = obj.children;
                          li.children = sastTextToHast(obj.children);
                          let ol = h('ol',{},[li]); //{ type: 'ordered-list', children: [toHast(obj)] }
                          indentLevel.children.push(ol);
                          this.indentStack.push(li);
                      }
                  } else if (obj.type == 'unordered-list-item-line') {
                      if (prev && prev.tagName == 'ul') {
                          let li = h('li');
                          li.sqrm = obj.children;
                          li.children = sastTextToHast(obj.children);
                          prev.children.push(li);
                         this.indentStack.push(li);
                      } else {
                          let li = h('li');
                          li.sqrm = obj.children;
                          li.children = sastTextToHast(obj.children);
                          let ul = h('ul',{},[li]); //{ type: 'ordered-list', children: [toHast(obj)] }
                          indentLevel.children.push(ul);
                          this.indentStack.push(li);
                      }
                  } else if (obj.type == 'hr-line') {
                      indentLevel.children.push(h('hr'));
                  } else if (obj.type == 'heading-line') {
                      indentLevel.children.push(h('h'+obj.level,{},obj.children));

                  } else if (obj.type == 'code-block-line') {

                      let cls = 'language-' + (obj.language ? obj.language : 'text' );
                      this.preIndent = indent + 1;
                      let code = h('code',{ class: cls },[{type:'text',value:'\n'}]);
                      let pre = h('pre',{},[code]);
                      pre.children.push = function(el) {
                          code.children.push(el);
                      };
                      indentLevel.children.push(pre);
                      this.indentStack.push(pre);

                  } else if (obj.type == 'element-line') {
                      let hast;
                      if (obj.tag == '!doctype') {
                          hast = { type: 'doctype' };
                      } else {
                          hast = h(obj.tag,obj.properties);
                          hast.sqrm = [];

                          if (obj.tag=='pre' || obj.tag=='script' || obj.tag=='style') {
                              //console.log('=============== ' + (indent+1));
                              this.preIndent = indent + 1;
                              hast.children.push({type:'text',value:'\n'});
                              hast.sqrm.push(... hast.children);
                          }
                      }
                      indentLevel.children.push(hast);
                      this.indentStack.push(hast);
                  } else if (obj.type == 'footnote-line') {
                      this.footnotes.push(obj);
                  } else {
                      throw new Error('not implemented obj.type='+obj.type)
                  }

                  this.blank = null;
              }
          }
      }

      processFootnotes() {
          sastFootnotesToHast(this.hast,this.footnotes);
      }

      appendToDoc(obj) {

          if (this.yamlNotAllowedIndent != -1 && obj.type != 'blank-line') {
              if (obj.indent < this.yamlNotAllowedIndent) {
                  this.yamlNotAllowedIndent = -1;
              }
          }

          if (this.yamlNotAllowedIndent == -1 && obj.type == 'div-line') {
              switch (obj.tag) {
                  case 'pre':
                  case 'script':
                  case 'style':
                  case '!--':
                      this.yamlNotAllowedIndent = obj.indent + 1;
              }
          }

          let wasAppended = false;
          if (this.appendTextToNode != null && obj.type == 'text-line') {
              if (this.appendTextToNode.minIndent !== undefined) {
                  if (this.appendTextToNode.minIndent <= obj.indent) {
                      delete this.appendTextToNode.minIndent;
                      this.appendTextToNode.indent = obj.indent;
                      const ls = obj.text.split('\n');
                      for (let i=0 ; i<ls.length ; i++) {
                          if (this.appendTextToNode.jsonNode.value != '') {
                              if (this.appendTextToNode.mode == '|') {
                                  this.appendTextToNode.jsonNode.value += '\n';
                              } else {
                                  this.appendTextToNode.jsonNode.value += ' ';
                              }
                          }
                          this.appendTextToNode.jsonNode.value += ls[i].trim(); // obj.text.trim()
                      }
                      wasAppended = true;
                  }
              } else if (this.appendTextToNode.indent == obj.indent) {
                  const ls = obj.text.split('\n');
                  for (let i=0 ; i<ls.length ; i++) {
                      if (this.appendTextToNode.jsonNode.value != '') {
                          if (this.appendTextToNode.mode == '|') {
                              this.appendTextToNode.jsonNode.value += '\n';
                          } else {
                              this.appendTextToNode.jsonNode.value += ' ';
                          }
                      }
                      this.appendTextToNode.jsonNode.value += ls[i].trim(); // obj.text.trim()
                  }
                  wasAppended = true;
              }
          }

          if (!wasAppended) {
              this.appendTextToNode = null;
              this.doc.children.push(obj);
          }
      }

      maybeYaml(obj) {
  // console.log('maybeYaml',obj)
          if (this.yamlNotAllowedIndent != -1 && obj.indent < this.yamlNotAllowedIndent) {
              this.yamlNotAllowedIndent = -1;
          }

          const yaml = ( obj.type == 'yaml-line' ? obj : obj.yaml );

          if (this.yamlNotAllowedIndent != -1) {
              this.appendTextToNode = null;
              if (obj.type == 'yaml-line') obj.type = 'paragraph-line';
              this.doc.children.push( obj );// { type: 'text', line: obj.line, text: obj.text, indent: obj.indent, children: obj.children }
          } else {

              // console.log('yaml:',yaml)
              let jsonNode = this.jsonTag(yaml);
              // console.log('jsonNode:',jsonNode)

              if (jsonNode != null) {
                  if (yaml.value && yaml.value.length==1 && typeof yaml.value[0] == "string") {

                      if (yaml.value[0]=='|' || yaml.value[0]=='>') {
                          // remove the | or > from the value of this node
                          jsonNode.value = '';
                          this.appendTextToNode = { minIndent: yaml.indent+1, mode: yaml.value[0], jsonNode: jsonNode };
                      } else {
                          this.appendTextToNode = null;
                      }
                  } else {
                      this.appendTextToNode = null;
                  }

                  this.doc.children.push( { type: 'blank-line', line: obj.line } );// h('a',{href:`/tags/${obj.name}`},obj.children)
              } else {
                  this.appendTextToNode = null;
                  // if (obj.type == 'yaml') obj.type = 'paragraph'
                  // this.doc.children.push( obj )// { type: 'text', line: obj.line, text: obj.text, indent: obj.indent, children: obj.children }
              }
          }
      }

      // addTask({line,done,text}) {
      //     let tasksNode = null

      //     if (this.jsonTree.root.type == 'unknown') {
      //         this.jsonTree.root.type = 'object'
      //         this.jsonTree.root.childrenIndent = 0
      //         delete this.jsonTree.root.minChildIndent
      //         tasksNode = { type: 'array', name: 'tasks', childrenIndent: 1, children: [] }
      //         this.jsonTree.root.children = [tasksNode]
      //     } else if (this.jsonTree.root.type == 'object') {
      //         for (let i=0 ; i<this.jsonTree.root.children.length ; i++) {
      //             const child = this.jsonTree.root.children[i]
      //             if (child.name == 'tasks') {
      //                 tasksNode = child
      //                 break
      //             }
      //         }

      //         if (tasksNode == null) {
      //             tasksNode = { type: 'array', name: 'tasks', childrenIndent: 1, children: [] }
      //             this.jsonTree.root.children.push(tasksNode)
      //         }
      //     } else {
      //         // silently not supported if the root is an array
      //         return
      //     }

      //     const taskNode = { type: 'object', childrenIndent: 2, children: [] }
      //     taskNode.children.push({ type: 'value', name: 'line', value: line })
      //     taskNode.children.push({ type: 'value', name: 'text', value: text })
      //     taskNode.children.push({ type: 'value', name: 'done', value: done })
      //     tasksNode.children.push(taskNode)

      //     // this.updateJson()
      // }

      // template(fn) {
      //     return fn()
      // }

      // inlineTag({name,args,children}) {
      //     this.jsonTag({
      //         indent: 0,
      //         isArrayElement: false,
      //         name: name,
      //         colon: true,
      //         value: (args === undefined ? true : args )
      //     })

      //     return h('a',{ href: `/tags/${name}` }, children )
      // }

      // j(name,value) {

      //     if (typeof name == 'object') {
      //         if (this.jsonTag(name)) {
      //             // valid yaml, added to json
      //             return h('a',{href:`/tags/${name.name}`},name.children)
      //         } else {
      //             return name.children
      //         }
      //     } else {
      //         if (this.jsonTag({
      //                 indent: 0,
      //                 isArrayElement: false,
      //                 name: name,
      //                 colon: true,
      //                 value: value})) {
      //             // valid yaml, added to json
      //             return h('a',{href:`/tags/${name.name}`},name.children)
      //         } else {
      //             return name.children
      //         }
      //     }
      // }

      inlineTag({type,name,args,$js,text}) {

          let query = '';

          if ($js && Array.isArray($js) && ($js.length != 1 || $js[0] !== true)) {
              query = '?args=' + encodeURIComponent(JSON.stringify($js));
          }

          if ($js && Array.isArray($js)) {
              if ($js.length == 1) {
                  this.json[name] = $js[0];
              } else {
                  this.json[name] = $js;
              }
          }
  //console.log(name,args,$js,text,query)
          return h('a',{ href: '/tags/' + name  + query},[t(text)])
      }

      inlineMention({type,value}) {
          // console.log({type,value})
          return h('a',{ href: '/users/' + value },[t('@'+value)])

      }

      include(args) {
          this.indentStack[this.indentStack.length-1].children.push(this.inlineInclude(args));
      }

      inlineInclude({type,collection ='default',name,args,text,$js}) {
          return {
              type: 'comment',
              value: `failed to include single doc: ${collection}.${name}( ${args} )`
          }
      }

      // todo: move to json-tree.js
      jsonTag({indent=1,isArrayElement=false,name,colon=true,value}) {

          if (value != undefined && value.length == 1) {
              value = value[0];
          }

          let parent = null;
          if (isArrayElement) {
              // if this is an array element: look for unknown or array

              this.jsonTree.iterateLikeStack((el) => {
                  if (el.type=='unknown' && el.minChildIndent<=indent) {
                      parent = el;
                      return false
                  } else if (el.type=='array' && el.childrenIndent==indent) {
                      parent = el;
                      return false
                  }
              });

          } else {
              // if this is not an array element: look fo unknown or object
  // console.log(util.inspect(this.jsonTree,false,null,true))
              this.jsonTree.iterateLikeStack((el) => {
                  if (el.type=='unknown' && el.minChildIndent<=indent) {
                      parent = el;
                      return false
                  } else if (el.type=='object' && el.childrenIndent==indent) {
                      parent = el;
                      return false
                  }                
              });
          }
  // console.log('parent=',parent)
          if (parent == null) {
              return null
          }

          if (parent.type == 'unknown' && !isArrayElement) {
              if (parent.minChildIndent > indent) throw new Error()

              parent.type = 'object';
              parent.childrenIndent = indent;
              delete parent.minChildIndent;

              if (colon && value === undefined) {
                  parent.children = [ { minChildIndent: indent, type: 'unknown', name: name } ];
              } else {
                  parent.children = [ { type: 'value', name: name, value: value } ];
              }

              // this.updateJson()
              return parent.children[0]
          }

          if (parent.type == 'unknown' && isArrayElement) {
              if (parent.minChildIndent > indent) throw new Error()

              parent.type = 'array';
              parent.childrenIndent = indent;
              delete parent.minChildIndent;

              let jsonNode = null;
              if (colon && value === undefined) {
                  jsonNode = { minChildIndent: indent+1, type:'unknown',name:name };
                  const arrayElement = { childrenIndent: indent+1, type: 'object', children: [jsonNode]};
                  parent.children = [arrayElement];
              } else if (colon) {
                  jsonNode = { childrenIndent: indent+1, type:'value', name:name, value:value};
                  const arrayElement = { childrenIndent: indent+1, type: 'object', children: [jsonNode]};
                  parent.children = [arrayElement];
              } else if (!colon) {
                  jsonNode = { type: 'value', value: value };
                  parent.children = [ jsonNode ];
              }

              // this.updateJson()
              return jsonNode
          }

          if (parent.type == 'object' && !isArrayElement) {
   
              let child = null;
              if (colon && value === undefined) {
                  child = { minChildIndent: indent, type: 'unknown', name: name };
              } else {
                  child = { type: 'value', name: name, value: value };
              }

              for (let i=0 ; i<parent.children.length ; i++) {
                  if (parent.children[i].name == name) {
                      parent.children[i] = child;
                      return parent.children[i]
                  }
              }

              parent.children.push(child);
              return parent.children[parent.children.length-1]
          }

          if (parent.type == 'array' && isArrayElement) {

              let jsonNode = null;
              if (colon && value === undefined) {
                  jsonNode = { minChildIndent: indent+1, type:'unknown',name:name };
                  const arrayElement = { childrenIndent: indent+1, type: 'object', children: [jsonNode]};
                  parent.children.push(arrayElement);
              } else if (colon) {
                  jsonNode = { childrenIndent: indent+1, type:'value',name:name,value:value};
                  const arrayElement = { childrenIndent: indent+1, type: 'object', children: [jsonNode]};
                  parent.children.push(arrayElement);
              } else if (!colon) {
                  jsonNode = { type: 'value', value: value };
                  parent.children.push(jsonNode);
              }

              // this.updateJson()
              return jsonNode
          }

          return null
      }

      // append(ln) {
      //     this.lines.push(ln)
      // }
  }

  function sqrm(src) {

      const file = unified()
          .use(parseIndentedLines)
          .use(indentedLinesToSxast)
          .use(resqrmToEsast)
          .use(compileEcma)
          .processSync(src);

      const f = new Function(file.result.value);

      const self = new SqrmContext();
      const req = {};

      try {
          f.call(self,req);
      } catch (e) {
          console.error(e);
      }

      self.processFootnotes();

      visit(self.hast, (node) => {
          delete node.sqrm;
      });

      const html = unified()
          .use(rehypeStringify)
          .stringify(self.hast);

      const json = self.json.toJSON();

      return {html,json}

  }

  return sqrm;

})();
//# sourceMappingURL=sqrm-1.0.0.iife.js.map
