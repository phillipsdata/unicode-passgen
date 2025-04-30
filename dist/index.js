"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UNICODE_SETS = void 0;
const regenerate_1 = __importDefault(require("regenerate"));
exports.UNICODE_SETS = {
    alpha: (0, regenerate_1.default)().addRange(0x0041, 0x005A).addRange(0x0061, 0x007A), // A-Z, a-z
    alpha_lower: (0, regenerate_1.default)().addRange(0x0061, 0x007A), // a-z
    alpha_upper: (0, regenerate_1.default)().addRange(0x0041, 0x005A), // A-Z
    numeric: (0, regenerate_1.default)().addRange(0x0030, 0x0039), // 0-9
    alpha_numeric: (0, regenerate_1.default)()
        .addRange(0x0041, 0x005A)
        .addRange(0x0061, 0x007A)
        .addRange(0x0030, 0x0039), // A-Z, a-z, 0-9
    alpha_numeric_lower: (0, regenerate_1.default)()
        .addRange(0x0061, 0x007A)
        .addRange(0x0030, 0x0039), // a-z, 0-9
    alpha_numeric_upper: (0, regenerate_1.default)()
        .addRange(0x0041, 0x005A)
        .addRange(0x0030, 0x0039), // A-Z, 0-9
    symbols: (0, regenerate_1.default)()
        .addRange(0x0021, 0x002F) // ! to /
        .addRange(0x003A, 0x0040) // : to @
        .addRange(0x005B, 0x0060) // [ to `
        .addRange(0x007B, 0x007E), // { to ~
    space: (0, regenerate_1.default)(0x0020), // space
    latin_extended: (0, regenerate_1.default)().addRange(0x00C0, 0x013F), // U+00C0 to U+013F
    greek: (0, regenerate_1.default)().addRange(0x0370, 0x03CF), // U+0370 to U+03CF
};
class UnicodePassgen {
    constructor(options = {}) {
        this.characters = this.buildCharacterSet(options);
        this.minRequirements = this.extractMinRequirements(options);
    }
    buildCharacterSet(options) {
        let charSet = (0, regenerate_1.default)();
        // Include predefined sets or custom characters
        if (options.include) {
            const includes = Array.isArray(options.include) ? options.include : [options.include];
            for (const item of includes) {
                if (typeof item === 'string') {
                    if (exports.UNICODE_SETS[item]) {
                        charSet = charSet.add(exports.UNICODE_SETS[item]);
                    }
                    else {
                        charSet = charSet.add(item);
                    }
                }
                else {
                    charSet = charSet.add(this.buildCharSet(item.chars));
                }
            }
        }
        else {
            // Default to all predefined sets
            Object.values(exports.UNICODE_SETS).forEach((set) => {
                charSet = charSet.add(set);
            });
        }
        // Exclude predefined sets or custom characters
        if (options.exclude) {
            const excludes = Array.isArray(options.exclude) ? options.exclude : [options.exclude];
            for (const item of excludes) {
                if (typeof item === 'string') {
                    if (exports.UNICODE_SETS[item]) {
                        charSet = charSet.remove(exports.UNICODE_SETS[item]);
                    }
                    else {
                        charSet = charSet.remove(item);
                    }
                }
                else {
                    charSet = charSet.remove(this.buildCharSet(item.chars));
                }
            }
        }
        return charSet.toArray().map((code) => String.fromCharCode(code));
    }
    buildCharSet(chars) {
        const charSet = (0, regenerate_1.default)();
        for (const char of chars) {
            if (Array.isArray(char) && char.length === 2) {
                // Range: ['a', 'z']
                charSet.addRange(char[0].charCodeAt(0), char[1].charCodeAt(0));
            }
            else if (typeof char === 'string') {
                // Single character: ['i']
                charSet.add(char);
            }
        }
        return charSet;
    }
    extractMinRequirements(options) {
        const minReqs = [];
        if (options.include) {
            const includes = Array.isArray(options.include) ? options.include : [options.include];
            for (const item of includes) {
                if (typeof item === 'string') {
                    // Predefined sets get min: 1
                    if (exports.UNICODE_SETS[item]) {
                        minReqs.push({ chars: exports.UNICODE_SETS[item].toArray().map((code) => String.fromCharCode(code)), min: 1 });
                    }
                }
                else {
                    // Custom char sets get min: 1 or specified min
                    minReqs.push({ chars: item.chars, min: item.min || 1 });
                }
            }
        }
        return minReqs;
    }
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    meetsMinRequirements(password) {
        for (const req of this.minRequirements) {
            const chars = this.buildCharSet(req.chars).toArray().map((code) => String.fromCharCode(code));
            const count = password.split('').filter((char) => chars.includes(char)).length;
            if (count < (req.min || 0)) {
                return false;
            }
        }
        return true;
    }
    generate(options = {}) {
        const length = options.length || 12;
        let password;
        do {
            const chars = this.shuffle([...this.characters]);
            password = chars.slice(0, length).join('');
        } while (!this.meetsMinRequirements(password));
        return password;
    }
}
exports.default = UnicodePassgen;
//# sourceMappingURL=index.js.map