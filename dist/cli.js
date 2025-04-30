#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importStar(require("./index"));
function parseArgs() {
    const args = {};
    const argv = process.argv.slice(2);
    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === '--length' && i + 1 < argv.length) {
            args.length = parseInt(argv[++i], 10);
        }
        else if (argv[i] === '--include' && i + 1 < argv.length) {
            args.include = argv[++i].split(',');
        }
        else if (argv[i] === '--exclude' && i + 1 < argv.length) {
            args.exclude = argv[++i].split(',');
        }
        else if (argv[i] === '--min' && i + 1 < argv.length) {
            args.min = JSON.parse(argv[++i]);
        }
        else if (argv[i] === '--sets') {
            args.sets = true;
        }
    }
    return args;
}
function main() {
    const args = parseArgs();
    if (args.sets) {
        console.log('Available character sets:');
        console.log(Object.keys(index_1.UNICODE_SETS).join(', '));
        return;
    }
    // Validate include sets
    if (args.include) {
        for (const set of args.include) {
            if (!index_1.UNICODE_SETS[set]) {
                console.error(`Error: Invalid character set '${set}'. Use --sets to list available sets.`);
                process.exit(1);
            }
        }
    }
    // Validate exclude sets
    if (args.exclude) {
        for (const set of args.exclude) {
            if (!index_1.UNICODE_SETS[set]) {
                console.error(`Error: Invalid character set '${set}'. Use --sets to list available sets.`);
                process.exit(1);
            }
        }
    }
    const options = {
        length: args.length,
        exclude: args.exclude,
    };
    if (args.include) {
        options.include = args.include.map((set) => ({
            chars: index_1.UNICODE_SETS[set].toArray().map((code) => String.fromCharCode(code)),
            min: args.min && args.min[set] ? args.min[set] : 1,
        }));
    }
    const passgen = new index_1.default(options);
    console.log(passgen.generate(options));
}
if (require.main === module) {
    main();
}
//# sourceMappingURL=cli.js.map