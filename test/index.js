var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var generator = require('../index');

describe('#generate', function() {
  it('generates password of expected length', function() {
    var lengths = [0, 1, 10, 1000];
    var options = {include: [{chars: [[0x41, 0x44]]}]};

    for (var length in lengths) {
      generator.generate(lengths[length], options)
        .should.lengthOf(lengths[length]);
    }
  });

  it('generates password of expected length without options set', function() {
    var lengths = [0, 1, 10, 1000];

    for (var length in lengths) {
      generator.generate(lengths[length])
        .should.lengthOf(lengths[length]);
    }
  });

  it('generates password with expected minimum character lengths', function() {
    var lengths = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1000];
    var options = {
      include: [
        {chars: [['a', 'd']], min: 2},
        {chars: [['0', '5'], ['7']], min: 5}
      ],
      exclude: [
        {chars: [['3', '4']]}
      ]
    };

    for (var length in lengths) {
      // The length should be the length of the sum of the character lengths or
      // the total length provided, whichever is larger
      var value = generator.generate(lengths[length], options);
      value.should.lengthOf(Math.max(lengths[length], 7));

      // The value *must* contain at least 2 of the characters and 5 digits
      expect(value)
        .to.match(/(?=.*[abcd]).{2,}/)
        .to.match(/(?=.*[0-2,5,7]).{5,}/);
    }
  });

  it('generates password respecting excluded character sets', function() {
    // Exclude the only character
    var options = {
      include: [{chars: [['i']], min: 5}],
      exclude: [{chars: [['i']]}]
    };

    generator.generate(10, options)
      .should.lengthOf(0);

    // If multiple characters exist and one is removed that has a min value
    // ensure that it does not use the NUL byte as a character instead
    options = {
      include: [{chars: [['a', 'z']]}, {chars: [['i']], min: 5}],
      exclude: [{chars: [['i']]}]
    };

    var value = generator.generate(10, options);

    value.should.lengthOf(10);

    expect(value)
      .to.not.match(/(?=.*[\u0000]).{1,}/); // 0x00
  });

it('generates password with translated characters', function() {
    var sets = [
      {name: 'alpha', regex: /(?=.*[a-z])./i},
      {name: 'alpha_lower', regex: /(?=.*[a-z])./},
      {name: 'alpha_upper', regex: /(?=.*[A-Z])./},
      {name: 'numeric', regex: /(?=.*[0-9])./},
      {name: 'alpha_numeric', regex: /(?=.*[a-z0-9])./i},
      {name: 'alpha_numeric_lower', regex: /(?=.*[a-z0-9])./},
      {name: 'alpha_numeric_upper', regex: /(?=.*[A-Z0-9])./},
      {name: 'symbols', regex: /(?=.*[!"#$%&\'\(\)\*\+\,\-\./:;<=>?@\[\\\]^_`\{\|\}~])./i}
    ];

    for (var obj in sets) {
      var value = generator.generate(1000, {include: [{chars: [[sets[obj].name]]}]});
      value.should.lengthOf(1000);

      expect(value).to.match(sets[obj].regex);
    }
  });

  it('generates password with mixed translated character options', function() {
    var lengths = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1000];
    var options = {
      include: [
        {chars: [['alpha_lower']], min: 2},
        {chars: [['alpha_upper'], ['0', '7'], ['symbols']], min: 5},
        {chars: [['q']], min: 3}
      ],
      exclude: [
        {chars: [['3', '4'], ['6']]},
        {chars: [['alpha_upper']]}
      ]
    };

   for (var length in lengths) {
      // The length should be the length of the sum of the character lengths or
      // the total length provided, whichever is larger
      var value = generator.generate(lengths[length], options);
      value.should.lengthOf(Math.max(lengths[length], 10));

      // The value *must* contain at least 2 of the characters, 5 digits,
      // and 3 "q" characters
      expect(value)
        .to.match(/(?=.*[a-z]).{2,}/)
        .to.match(/(?=.*([0-2]|5|7|[!"#$%&'\(\)\*\+\,\-\./:;<=>?@\[\\\]^_`\{\|\}~])).{5,}/)
        .to.match(/(?=.*[q]).{3,}/)
        .to.not.match(/(?=.*[A-Z].{1,})/)
        .to.not.match(/(?=.*(3|4|6|8|9)).{1,}/);
    }
  });

  it('skips invalid options', function() {
    // Skip setting no characters on include/exclude
    // and invalid properties (i.e. 'skip')
    var options = {
      include: [
        {chars: [['a']], min: 5},
        {chars: [[]], min: 2}
      ],
      exclude: [
        {chars: [[]]}
      ],
      skip: 'this property should be ignored'
    };

    var value = generator.generate(5, options);

    value.should.lengthOf(5);
    expect(value).to.equal('aaaaa');
  });

  it('generates password within BMP character range', function() {
    var options = {
      include: [
        {chars: [[0x00]], min: 1},
        {chars: [[0xFFFF]], min: 1},
        {chars: [[97]], min: 1},
        {chars: [['€']], min: 1},
        {chars: [['ز']], min: 1},
        {chars: [[0x1709]], min: 1},
        {chars: [['⠧']], min: 1},
        {chars: [['\u30B8']], min:1},
        {chars: [['\uD800']], min:1}
      ]
    };

    var value = generator.generate(9, options);
    value.should.lengthOf(9);

    expect(value)
      .to.match(/(?=.*[\u0000]).{1}/) // 0x00
      .to.match(/(?=.*[\uFFFF]).{1}/) // 0xFFFF
      .to.match(/(?=.*[a]).{1}/) // a
      .to.match(/(?=.*[\u20AC]).{1}/) // €, (0x20AC) Euro symbol
      .to.match(/(?=.*[\u0632]).{1}/) // ز, (0x0632) Arabic
      .to.match(/(?=.*[\u1709]).{1}/) // ᜉ, (0x1709) Tagalog
      .to.match(/(?=.*[\u2827]).{1}/) // ⠧, (0x2827) Braille
      .to.match(/(?=.*[\u30B8]).{1}/) // ジ, (0x30B8) Katakana
      .to.match(/(?=.*[\uD800]).{1}/); // 0xD800 High Surrogate
  });

  it('fails to generate with characters outside of the BMP character range', function() {
    var options = {
      include: [
        {chars: [[0x10000]], min: 1}, // beginning of plane 1
        {chars: [[0x20000]], min: 1}, // beginning of plane 2
        {chars: [[0x30000]], min: 1}, // beginning of plane 3 - 13
        {chars: [[0xE0000]], min: 1}, // beginning of plane 14
        {chars: [[0xF0000]], min: 1}, // beginning of plane 15 - 16
        {chars: [[0x1F4A9]], min: 1} // poo
      ]
    };

    var value = generator.generate(8, options);
    value.should.lengthOf(8);

    // Characters in the astral planes should not be found in the result set
    // since they are currently not supported
    expect(value)
      .to.not
      .match(/(?=.*[\u10000]).{1}/) // beginning of plane 1
      .match(/(?=.*[\u20000]).{1}/) // beginning of plane 2
      .match(/(?=.*[\u30000]).{1}/) // beginning of plane 3 - 13
      .match(/(?=.*[\uE0000]).{1}/) // beginning of plane 14
      .match(/(?=.*[\uF0000]).{1}/) // beginning of plane 15 - 16
      .match(/(?=.*[\u1F4A9]).{1}/); // poo
  });

  it('RangeError thrown when given negative length', function() {
    var lengths = [-1, -10, -1000];
    var options = {include: [{chars: [[0x41, 0x44]]}]};

    for (var length in lengths) {
      expect(
        function() { generator.generate(lengths[length], options); }
      ).to.throw(RangeError);
    }
  });

  it('TypeError thrown when given non-integer length type', function() {
    var lengths = ['5', 5.5, 'test', {}, null, undefined];
    var options = {include: [{chars: [[0x41, 0x44]]}]};

    for (var length in lengths) {
      expect(
        function() { generator.generate(lengths[length], options); }
      ).to.throw(TypeError);
    }
  });
});
