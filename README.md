# Unicode Password Generator
[![Build Status](https://api.travis-ci.org/phillipsdata/unicode-passgen.svg)](http://travis-ci.org/phillipsdata/unicode-passgen) [![Dependency Status](https://david-dm.org/phillipsdata/unicode-passgen.svg)](https://david-dm.org/phillipsdata/unicode-passgen) [![Node Version](https://img.shields.io/npm/v/unicode-passgen.svg) ![Downloads](https://img.shields.io/npm/dm/unicode-passgen.svg)](https://www.npmjs.org/package/unicode-passgen)

This password generator will generate a random string from a range of characters
available in the BMP (Basic Multilingual Plane)
[Unicode character set](https://en.wikipedia.org/wiki/Plane_\(Unicode\)#Basic_Multilingual_Plane).

This offers character support in the:

* decimal range, i.e. [0, 65535]
* hexadecimal range, i.e. [0x0000, 0xFFFF]

_Astral plane characters are currently not supported._

## Installation

### NodeJS/npm

```
npm install unicode-passgen
```

### Bower

```
bower install unicode-passgen
```

## Usage

### From NodeJS

```
var unicodePassgen = require('unicode-passgen');
```

### From the browser

```
<script type="text/javascript" src="/path/to/dist/app.min.js"></script>
```

## Examples

Generate a random 10-character string from the entire BMP Unicode character set

```
unicodePassgen.generate(10); // ⚢㦴缔碅Χꂨ〱⁪㋃桷䳟껫
```

Generate a random 10-character string from the latin alphabet lower-case characters from 'a' to 'z'

```
var options = {
    include: [
        {
            chars: [['a', 'z']]
        }
    ]
};
unicodePassgen.generate(10, options); // sqxkhvjayd
```

Generate a random 10-character string from the latin alphabet lower-case characters from 'a' to 'z',
excluding 'i', 'k', 'l' and 'o'


```
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

Generate a random 10-character alphanumeric string where at least 8 digits must be present

```
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

Generate a random 10-character string where at least 8 'f' characters are present

```
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