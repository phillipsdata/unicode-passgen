import regenerate from 'regenerate';

/**
 * Character Range interface
 */
export interface CharRange {
    chars: string[][] | string[];
}

/**
 * Character Range interface with a optional min length
 */
export interface IncludeSet extends CharRange {
    min?: number;
}

/**
 * Options interface for the password generator
 */
export interface PasswordOptions {
    length?: number;
    include?: (string | IncludeSet)[];
    exclude?: (string | CharRange)[];
}

/**
 * Character set interface that includes the regenerate library
 */
interface CharacterSet {
    [key: string]: regenerate;
}

/**
 * Predefined character sets
 */
export const UNICODE_SETS: CharacterSet = {
    alpha: regenerate().addRange(0x0041, 0x005A).addRange(0x0061, 0x007A), // A-Z, a-z
    alpha_lower: regenerate().addRange(0x0061, 0x007A), // a-z
    alpha_upper: regenerate().addRange(0x0041, 0x005A), // A-Z
    numeric: regenerate().addRange(0x0030, 0x0039), // 0-9
    alpha_numeric: regenerate()
        .addRange(0x0041, 0x005A)
        .addRange(0x0061, 0x007A)
        .addRange(0x0030, 0x0039), // A-Z, a-z, 0-9
    alpha_numeric_lower: regenerate()
        .addRange(0x0061, 0x007A)
        .addRange(0x0030, 0x0039), // a-z, 0-9
    alpha_numeric_upper: regenerate()
        .addRange(0x0041, 0x005A)
        .addRange(0x0030, 0x0039), // A-Z, 0-9
    symbols: regenerate()
        .addRange(0x0021, 0x002F) // ! to /
        .addRange(0x003A, 0x0040) // : to @
        .addRange(0x005B, 0x0060) // [ to `
        .addRange(0x007B, 0x007E), // { to ~
    space: regenerate(0x0020), // space
    latin_extended: regenerate().addRange(0x00C0, 0x013F), // U+00C0 to U+013F
    greek: regenerate().addRange(0x0370, 0x03CF), // U+0370 to U+03CF
};

/**
 * UnicodePassgen class
 *
 * Exposes "generate"
 */
class UnicodePassgen {
    private characters: string[];
    private minRequirements: IncludeSet[];

    /**
     * Set options
     *
     * @param options The options containing:
     *  - length (optional) - The numbe of characters to generate (optional, default 12)
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
     */
    constructor(options: PasswordOptions = {}) {
        this.characters = this.buildCharacterSet(options);
        this.minRequirements = this.extractMinRequirements(options);
    }

    /**
     * Build a character set
     *
     * @param options The options containing:
     *  - length (optional) - The numbe of characters to generate (optional, default 12)
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
     *  @return array
     */
    private buildCharacterSet(options: PasswordOptions): string[] {
        let charSet = regenerate();

        // Include predefined sets or custom characters
        if (options.include) {
            const includes = Array.isArray(options.include) ? options.include : [options.include];
            for (const item of includes) {
                if (typeof item === 'string') {
                    // Add the predefined character set if provided
                    if (UNICODE_SETS[item]) {
                        charSet = charSet.add(UNICODE_SETS[item]);
                    } else {
                        charSet = charSet.add(item);
                    }
                } else {
                    charSet = charSet.add(this.buildCharSet(item.chars));
                }
            }
        } else {
            // Default to all characters
            charSet = charSet.addRange(0x0000, 0xFFFF);
        }

        // Exclude predefined sets or custom characters (exclusion takes precedence)
        if (options.exclude) {
            const excludes = Array.isArray(options.exclude) ? options.exclude : [options.exclude];
            for (const item of excludes) {
                if (typeof item === 'string') {
                    // Remove the predefined character set if provided
                    if (UNICODE_SETS[item]) {
                        charSet = charSet.remove(UNICODE_SETS[item]);
                    } else {
                        charSet = charSet.remove(item);
                    }
                } else {
                    charSet = charSet.remove(this.buildCharSet(item.chars));
                }
            }
        }

        // Return the list of all characters from unicode
        return charSet.toArray().map(code => String.fromCharCode(code));
    }

    /**
     * Adds a character or character set to the list
     *
     * @param chars The character or character range
     * @return regenerate
     * @private
     */
    private buildCharSet(chars: string[][] | string[]): regenerate {
        const charSet = regenerate();

        // Add the character code to the list
        for (const char of chars) {
            if (Array.isArray(char) && char.length === 2) {
                // Range, e.g. ['a', 'z']
                charSet.addRange(char[0].charCodeAt(0), char[1].charCodeAt(0));
            } else if (typeof char === 'string') {
                // Single character, e.g. ['i']
                charSet.add(char);
            }
        }

        return charSet;
    }

    /**
     * Determine the minimum number of characters in the set to include
     *
     * @param options The options containing:
     *  - length (optional) - The numbe of characters to generate (optional, default 12)
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
     * @return IncludeSet[]
     * @private
     */
    private extractMinRequirements(options: PasswordOptions): IncludeSet[] {
        const minReqs: IncludeSet[] = [];

        if (options.include) {
            const includes = Array.isArray(options.include) ? options.include : [options.include];

            for (const item of includes) {
                if (typeof item === 'string') {
                    // Predefined sets default to min of 1 char # TODO: to update this to support a min value provided
                    if (UNICODE_SETS[item]) {
                        minReqs.push({
                            chars: UNICODE_SETS[item].toArray().map((code) => String.fromCharCode(code)),
                            min: 1
                        });
                    }
                } else {
                    minReqs.push({
                        chars: item.chars,
                        min: item.min || 1
                    });
                }
            }
        }

        return minReqs;
    }

    /**
     * Everyone do the Fisher-Yates shuffle now -_(*-*)_-
     *
     * @param array The list of characters
     * @return string[] The shuffled list
     * @private
     */
    private shuffle(array: string[]): string[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));

            // Swap the values
            [array[i], array[j]] = [array[j], array[i]];
        }

        return array;
    }

    /**
     * Determine whether the string contains the expected number of minimum values
     *
     * @param password The string to check
     * @return boolean Whether the password contains the expected number of minimum values
     * @private
     */
    private meetsMinRequirements(password: string): boolean {
        for (const req of this.minRequirements) {
            // Build the character set
            const chars = this.buildCharSet(req.chars).toArray().map((code) => String.fromCharCode(code));
            // Filter out the specific characters
            const count = password.split('').filter((char) => chars.includes(char)).length;
            if (count < (req.min || 0)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Generates a random string
     *
     * @param options The options containing:
     *  - length (optional) - The numbe of characters to generate (optional, default 12)
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
     * @return string The generated string
     */
    public generate(options: PasswordOptions = {}): string {
        const length = options.length || 12;
        let password: string;

        // Ensure it meets minimum requirements
        // # TODO: this could be better done the old way from v1.1.0 since this could be an infinite loop on randomness
        do {
            const chars = this.shuffle([...this.characters]);
            password = chars.slice(0, length).join('');
        } while (!this.meetsMinRequirements(password));

        return password;
    }
}

export default UnicodePassgen;
