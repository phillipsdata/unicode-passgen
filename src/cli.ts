#!/usr/bin/env node
import UnicodePassgen, { UNICODE_SETS, IncludeSet } from './index';

interface CliArgs {
    length?: number;
    include?: string[];
    exclude?: string[];
    min?: { [key: string]: number };
    sets?: boolean;
}

function parseArgs(): CliArgs {
    const args: CliArgs = {};
    const argv = process.argv.slice(2);

    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === '--length' && i + 1 < argv.length) {
            args.length = parseInt(argv[++i], 10);
        } else if (argv[i] === '--include' && i + 1 < argv.length) {
            args.include = argv[++i].split(',');
        } else if (argv[i] === '--exclude' && i + 1 < argv.length) {
            args.exclude = argv[++i].split(',');
        } else if (argv[i] === '--min' && i + 1 < argv.length) {
            args.min = JSON.parse(argv[++i]);
        } else if (argv[i] === '--sets') {
            args.sets = true;
        }
    }

    return args;
}

function main() {
    const args = parseArgs();

    if (args.sets) {
        console.log('Available character sets:');
        console.log(Object.keys(UNICODE_SETS).join(', '));
        return;
    }

    // Validate include sets
    if (args.include) {
        for (const set of args.include) {
            if (!UNICODE_SETS[set]) {
                console.error(`Error: Invalid character set '${set}'. Use --sets to list available sets.`);
                process.exit(1);
            }
        }
    }

    // Validate exclude sets
    if (args.exclude) {
        for (const set of args.exclude) {
            if (!UNICODE_SETS[set]) {
                console.error(`Error: Invalid character set '${set}'. Use --sets to list available sets.`);
                process.exit(1);
            }
        }
    }

    const options: { length?: number; include?: IncludeSet[]; exclude?: string[] } = {
        length: args.length,
        exclude: args.exclude,
    };

    if (args.include) {
        options.include = args.include.map((set) => ({
            chars: UNICODE_SETS[set].toArray().map((code) => String.fromCharCode(code)),
            min: args.min && args.min[set] ? args.min[set] : 1,
        }));
    }

    const passgen = new UnicodePassgen(options);
    console.log(passgen.generate(options));
}

if (require.main === module) {
    main();
}
