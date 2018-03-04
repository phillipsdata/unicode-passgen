/**
 * Password Generator
 * https://github.com/phillipsdata/unicode-passgen
 * Copyright (c) 2018 Phillips Data, Inc.
 * MIT License
 */
;(function() {
  'use strict';

  // Setup the root object--'window', 'global', or 'this'
  var root = typeof self == 'object' && self.self === self && self ||
    typeof global == 'object' && global.global === global && global ||
    this ||
    {};
  var previousUnicodePassgen = root.unicodePassgen;
  var unicodePassgen = {};

  // Be sure our dependencies exist
  var regenerate = root.regenerate || (typeof require !== undefined) && require('regenerate');
  if (!regenerate) {
    throw new Error('unicodePassgen requires regenerate, see https://github.com/mathiasbynens/regenerate');
  }

  /**
    * Generates a string of the given length that include characters as defined
    * by the given options.
    *
    * @param {Integer} length The length of the string to generate
    * @param {Object} options An Object containing:
    *  - include (optional) - An Object containing an Array of Objects, each of which contain:
    *    - chars - An Array containing an Array of 1 character per index:
    *      - 0 - A single character, hex character, or unicode character.
    *        This may be a single character to include, or the beginning of a
    *        range of characters to include
    *      - 1 - A single character, hex character, or unicode character.
    *        This must be the end of the range of the characters to include.
    *    - min (optional) - An Integer representing the minimum number of
    *      characters from the 'chars' set that *must* be included in the generated
    *      string
    *  - exclude (optional) - An Object containing an Array of Objects, each of which contain:
    *    - chars - An Array containing an Array of 1 character per index:
    *      - 0 - A single character, hex character, or unicode character.
    *        This may be a single character to exclude, or the beginning of a
    *        range of characters to exclude
    *      - 1 - A single character, hex character, or unicode character.
    *        This must be the end of the range of the characters to exclude.
    * @returns {String} A random generated string
    */
  unicodePassgen.generate = function(length, options) {
    if (!isInt(length)) {
      throw new TypeError('Non-integer length type');
    } else if (length < 0) {
      throw new RangeError('Length must be a positive integer');
    }

    var opts = getOptions(options);
    var allCharacters = getCharacterList(opts);

    // Return no password if we have no data set to generate it from
    var value = '';
    if (allCharacters.length <= 0) {
      return value;
    }

    // Generate random characters for the required minimum number of values
    var characterSets = getCharacterSets(opts);
    for (var i in characterSets) {
      value += generateString(characterSets[i].set, characterSets[i].min);
    }

    // Generate random characters for the remainder of the length
    value += generateString(allCharacters, (length - value.length));

    return shuffle(value);
  };

  /**
   * Avoid conflicts with module name
   *
   * @returns {Object}
   */
  unicodePassgen.noConflict = function() {
    root.unicodePassgen = previousUnicodePassgen;
    return unicodePassgen;
  };

  /**
   * Creates a set of options for the generator from the given options
   *
   * @param {Object} options An Object containing:
   *  - include (optional) - An Object containing an Array of Objects, each of which contain:
   *    - chars - An Array containing an Array of 1 character per index:
   *      - 0 - A single character, hex character, or unicode character.
   *        This may be a single character to include, or the beginning of a
   *        range of characters to include
   *      - 1 - A single character, hex character, or unicode character.
   *        This must be the end of the range of the characters to include.
   *    - min (optional) - An Integer representing the minimum number of
   *      characters from the 'chars' set that *must* be included in the generated
   *      string
   *  - exclude (optional) - An Object containing an Array of Objects, each of which contain:
   *    - chars - An Array containing an Array of 1 character per index:
   *      - 0 - A single character, hex character, or unicode character.
   *        This may be a single character to exclude, or the beginning of a
   *        range of characters to exclude
   *      - 1 - A single character, hex character, or unicode character.
   *        This must be the end of the range of the characters to exclude.
   * @returns {Object} An Object representing the given options
   */
  function getOptions(options) {
    var opts = {
      include: [
        {
          chars: [[0x0000, 0xFFFF]],
          min: 0
        }
      ],
      exclude: []
    };

    // Merge the properties of our options
    for (var property in options) {
      // Ignore options that are not in our opts set or are not an array
      if (!opts.hasOwnProperty(property) || !Array.isArray(options[property])) {
        continue;
      }

      // Reset the default value for this property since it's being overridden
      if (property === 'include') {
        opts.include = [];
      }

      // Merge the options given
      for (var set in options[property]) {
        if (typeof options[property][set] === 'object' &&
          options[property][set].hasOwnProperty('chars') &&
          Array.isArray(options[property][set].chars)
        ) {
          // Add the character set to the options
          var charSet = {
            chars: options[property][set].chars,
            min: 0
          };

          // Set the minimum value if given
          if (options[property][set].hasOwnProperty('min') &&
            isInt(options[property][set].min) &&
            options[property][set].min > 0
          ) {
            charSet.min = options[property][set].min;
          }

          opts[property].push(charSet);
        }
      }
    }

    return opts;
  }

  /**
   * Generates a string of the given length from the given set of characters
   *
   * @param {Array} set An Array of decimal characters
   * @param {Integer} length The length of the string to generate
   * @returns {String} The random generated string
   */
  function generateString(set, length) {
    var content = '';

    // Cannot generate a string from an empty set
    if (set.length <= 0) {
      return content;
    }

    for (var i = 0; i < length; i++) {
      content += String.fromCharCode(
        set[Math.floor(Math.random() * set.length)]
      );
    }

    return content;
  }

  /**
   * Retrieves a complete list of all characters from the given options
   *
   * @param {Object} options An Object containing:
   *  - include (optional) - An Object containing an Array of Objects, each of which contain:
   *    - chars - An Array containing an Array of 1 character per index:
   *      - 0 - A single character, hex character, or unicode character.
   *        This may be a single character to include, or the beginning of a
   *        range of characters to include
   *      - 1 - A single character, hex character, or unicode character.
   *        This must be the end of the range of the characters to include.
   *    - min (optional) - An Integer representing the minimum number of
   *      characters from the 'chars' set that *must* be included in the generated
   *      string
   *  - exclude (optional) - An Object containing an Array of Objects, each of which contain:
   *    - chars - An Array containing an Array of 1 character per index:
   *      - 0 - A single character, hex character, or unicode character.
   *        This may be a single character to exclude, or the beginning of a
   *        range of characters to exclude
   *      - 1 - A single character, hex character, or unicode character.
   *        This must be the end of the range of the characters to exclude.
   * @returns {Array} an array of characters
   */
  function getCharacterList(options) {
    var regen = regenerate();
    var include = options.include;

    for (var i in include) {
      for (var j in include[i].chars) {
        // There should always be a 0th-index element
        if (include[i].chars[j][0] === undefined) {
          continue;
        }

        regen = addCharacters(regen, include[i].chars[j]);
      }
    }

    removeCharacters(regen, options.exclude);

    return regen.valueOf();
  }

  /**
   * Retrieves a complete list of all character sets from the given options
   *
   * @param {Object} options An Object containing:
   *  - include (optional) - An Object containing an Array of Objects, each of which contain:
   *    - chars - An Array containing an Array of 1 character per index:
   *      - 0 - A single character, hex character, or unicode character.
   *        This may be a single character to include, or the beginning of a
   *        range of characters to include
   *      - 1 - A single character, hex character, or unicode character.
   *        This must be the end of the range of the characters to include.
   *    - min (optional) - An Integer representing the minimum number of
   *      characters from the 'chars' set that *must* be included in the generated
   *      string
   *  - exclude (optional) - An Object containing an Array of Objects, each of which contain:
   *    - chars - An Array containing an Array of 1 character per index:
   *      - 0 - A single character, hex character, or unicode character.
   *        This may be a single character to exclude, or the beginning of a
   *        range of characters to exclude
   *      - 1 - A single character, hex character, or unicode character.
   *        This must be the end of the range of the characters to exclude.
   * @returns {Array} An Array of Objects, each of which include:
   *  - set - An Array of decimal characters
   *  - min - An Integer representing the minimum number of characters from the
   *    set that must be included in the generated string
   */
  function getCharacterSets(options) {
    var regen;
    var include = options.include;
    var sets = [];

    for (var i in include) {
      regen = regenerate();

      for (var j in include[i].chars) {
        // There should always be a 0th-index element
        if (include[i].chars[j][0] === undefined) {
          continue;
        }

        // Add the characters from the set
        regen = addCharacters(regen, include[i].chars[j]);
      }

      // Remove the characters from the exclusion set
      regen = removeCharacters(regen, options.exclude);

      sets.push(
        {
          set: regen.valueOf(),
          min: include[i].min
        }
      );
    }

    return sets;
  }

  /**
   * Adds the given character/range to the set
   *
   * @param {Regenerate} regen An instance of the Regenerate object
   * @param {Array} set An Array containing a 0th and (optionally) a 1st index
   *  representing a character or character range
   * @returns {Regenerate} An updated instance of the Regenerate object
   */
  function addCharacters(regen, set) {
    // Add the character range, or a single character itself, to the set
    if (set[1] !== undefined) {
      regen.addRange(set[0], set[1]);
    } else {
      regen.add(set[0]);
    }

    return regen;
  }

  /**
   * Removes the given character/range from the set
   *
   * @param {Regenerate} regen An instance of the Regenerate object
   * @param {Array} set An Array containing a 0th and (optionally) a 1st index
   *  representing a character or character range
   * @returns {Regenerate} An updated instance of the Regenerate object
   */
  function removeCharacters(regen, set) {
    // Remove characters provided
    for (var i in set) {
      for (var j in set[i].chars) {
        // There should always be a 0th-index element
        if (set[i].chars[j][0] === undefined) {
          continue;
        }

        // Remove the character range, or a single character itself, from the set
        if (set[i].chars[j][1] !== undefined) {
          regen.removeRange(set[i].chars[j][0], set[i].chars[j][1]);
        } else {
          regen.remove(set[i].chars[j][0]);
        }
      }
    }

    return regen;
  }

  /**
   * Everyone do the Fisher-Yates shuffle now -_(*-*)_-
   *
   * @param {Array|String} data An array of characters or a character string
   *  whose index values to shuffle
   * @returns {String} The shuffled data
   */
  function shuffle(data) {
    // Convert the string to an array
    var content = (typeof data === 'string' ? data.split('') : data);

    // Perform the shuffle on the array
    for (var length = content.length - 1; length > 0; length--) {
      var index = Math.floor(Math.random() * (length + 1));
      var temp = content[length];
      content[length] = content[index];
      content[index] = temp;
    }

    return content.join('');
  }

  /**
   * Checks whether the given number is an Integer
   *
   * @param {Mixed} number The value to check
   * @returns {Boolean} The
   */
  function isInt(number) {
    if (isNaN(number)) {
      return false;
    }

    return (parseFloat(number) | 0) === number;
  }

  // Setup module for node/browser
  if (typeof exports !== undefined) {
    if (typeof module !== undefined && module.exports) {
      module.exports = unicodePassgen;
    }

    exports.unicodePassgen = unicodePassgen;
  } else {
    root.unicodePassgen = unicodePassgen;
  }
}).call(this);
