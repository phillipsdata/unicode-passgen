# Unicode Password Generator
[![Build Status](https://api.travis-ci.org/phillipsdata/unicode-passgen.svg)](http://travis-ci.org/phillipsdata/unicode-passgen) [![Coverage Status](https://coveralls.io/repos/github/phillipsdata/unicode-passgen/badge.svg?branch=master)](https://coveralls.io/github/phillipsdata/unicode-passgen?branch=master) [![Dependency Status](https://david-dm.org/phillipsdata/unicode-passgen.svg)](https://david-dm.org/phillipsdata/unicode-passgen) [![Node Version](https://img.shields.io/npm/v/unicode-passgen.svg) ![Downloads](https://img.shields.io/npm/dm/unicode-passgen.svg)](https://www.npmjs.org/package/unicode-passgen)

This password generator will generate a random string from a range of characters
available in the
[BMP (Basic Multilingual Plane) Unicode character set](https://en.wikipedia.org/wiki/Plane_\(Unicode\)#Basic_Multilingual_Plane).

This offers character support in the:

* decimal range, i.e. [0, 65535]
* hexadecimal range, i.e. [0x0000, 0xFFFF]
* unicode range, i.e. [\u0000, \uFFFF]

**_Astral plane characters are currently not supported._**

## Installation

### npm

```
npm install unicode-passgen
```

### bower

```
bower install unicode-passgen
```

## Usage

### From nodejs

```javascript
var unicodePassgen = require('unicode-passgen');
```

### From the browser

```html
<script type="text/javascript" src="/path/to/dist/unicode-passgen.min.js"></script>
<script type="text/javascript">
    var unicodePassgen = require('unicode-passgen');
</script>
```

## API

The `unicodePassgen` object provides a single method: `generate`

### `generate(length [, options])`

`generate` will generate a random string of `length` characters from the entire
BMP Unicode character set by default.

By setting `options`, the generator can limit the available character set to fit
your particular domain.

#### Options

The `options` must be an object that defines at least one of the two properties,
`include` or `exclude`. These properties define which characters should be
included as a character set to draw from, or characters that should be
explicitly excluded, respectively. Each property should be defined as an array
of objects, each containing the `chars` property and an optional `min` property.

The `chars` property defines an array of arrays representing a single character,
or range of characters from a starting character to the ending character.
A range of characters must be set from a lower value to a higher value.
For example, 'a' (hex 0x61, decimal 97) appears before
'z' (hex 0x7A, decimal 122) in BMP, so the set should be provided `['a', 'z']`,
i.e. _from 'a' to 'z'_.

**NOTE: Each character in the character set is unique and exists only once.
Defining the same character multiple times does not increase the character's
probability of appearing in the generated string relative to other characters.**

The `min` property denotes that the defined character set group *must* have _at
least_ that many characters represented in the generated string. By default,
this value is zero.

##### Syntax for `options`

Characters may be defined in decimal, hexadecimal, unicode, or string format.

For example, you may define the letter 'Q' as any of the following:

* in decimal: `81`
* in hexadecimal: `0x51` or `0x0051`
* in unicode: `\u51` or `\u0051`
* as a string: `'Q'`

```javascript
// The options syntax
var options = {
    include: [
        {
            chars: [
                [rangeStart [, rangeEnd]],
                ...
                [singleCharacter],
                ...
            ],
            min: integer
            ...
        },
        ...
    ],
    exclude: [
        {
            chars: [
                [rangeStart [, rangeEnd]],
                ...
                [singleCharacter],
                ...
            ]
        },
        ...
    ]
}
```

##### Example `options`

The following example options denote the generator to:

* Draw only from the following alphanumeric character set:
    * `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`
* Require at least 2 characters be from the character set:
    * `0123456789`
* Require at least 1 character be from the character set:
    * `i`
* Exclude the characters:
    * `ilo01`

```javascript
var options = {
    include: [
        {
            chars: [
                ['A', 'Z'],
                ['a', 'z']
            ]
        },
        {
            chars: [
                ['0', '9']
            ],
            min: 2
        },
        {
            chars: [
                ['i']
            ],
            min: 1
        }
    ],
    exclude: [
        {
            chars: [
                ['i'],
                ['l'],
                ['o'],
                ['0', '1']
            ]
        }
    ]
}
```

Interpreting this, the generator will require that:

* The character set only draw from the following subset:
    * `abcdefghjkmnpqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ23456789`
* At least 2 characters must be present from the character set:
    * `23456789`
* No `i` character will be present (because exclusion takes precedence)

```
unicodePassgen.generate(13, options); // aqf8sQf33Gsk9
```

## Examples

Generate a random 10-character string from the entire BMP Unicode character set

```javascript
unicodePassgen.generate(10); // ⚢㦴缔碅Χꂨ〱⁪㋃桷䳟껫

// The above is identical to including the following options
var options = {
    include: [
        {
            chars: [[0x0000, 0xFFFF]]
        }
    ]
}
unicodePassgen.generate(10, options); // ⚢㦴缔碅Χꂨ〱⁪㋃桷䳟껫
```

----

Generate a random 10-character string from the Latin alphabet subset of
lower-case characters from 'a' to 'z'

```javascript
var options = {
    include: [
        {
            chars: [['a', 'z']]
        }
    ]
};
unicodePassgen.generate(10, options); // sqxkhvjayd
```

----

Generate a random 10-character string from the Latin alphabet subset of
lower-case characters from 'a' to 'z', excluding 'i', 'j', 'k', 'l' and 'o'

```javascript
var options = {
    include: [
        {
            chars: [['a', 'z']]
        }
    ],
    exclude: [
        {
            chars: [['i', 'l'], ['o']]
        }
    ]
};
unicodePassgen.generate(10, options); // aszvpwaeus
```

----

Generate a random 10-character alphanumeric string where at least 8 digits must
be present

```javascript
var options = {
    include: [
        {
            chars: [['a', 'z']]
        },
        {
            chars: [['0', '9']],
            min: 8
        }
    ]
};
unicodePassgen.generate(10, options); // 9fs9704187
```

----

Generate a random 10-character string where at least 8 'f' characters are
present

```javascript
var options = {
    include: [
        {
            chars: [['a', 'z']]
        },
        {
            chars: [['f']],
            min: 8
        }
    ]
};
unicodePassgen.generate(10, options); // ffffzfffef
```

----

Generate a random 10-character string where at least 20 characters are digits.

**Note that the required minimum values will override the provided length if
they exceed it**

```javascript
var options = {
    include: [
        {
            chars: [['0', '9']],
            min: 20
        }
    ]
};
unicodePassgen.generate(10, options); // 54843463349183889425
```

----

Generate a random 10-character string of digits, but exclude the entire BMP
character set (which also excludes the digit characters).

**Note that excluding all of the included characters will cause an empty string
to be returned by the generator**

```javascript
var options = {
    include: [
        {
            chars: [['0', '9']]
        }
    ],
    exclude: [
        {
            chars: [[0x0000, 0xFFFF]]
        }
    ]
};
unicodePassgen.generate(10, options); //
```

## Testing

```
npm test
```

## License

MIT
