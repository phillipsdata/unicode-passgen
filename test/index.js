var chai = require('chai');
var should = chai.should();
var assert = chai.assert;
var expect = chai.expect;
var generator = require('../index');

describe('#generate', function() {
  it('generates password of expected length', function() {
    var lengths = [0, 1, 10, 1000];
    var options = {include: [{chars: [[0x41, 0x44]]}]};

    for (var length in lengths) {
      generator.generate(lengths[length], options).should.lengthOf(lengths[length]);
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
        {chars: [['4']]}
      ]
    };

    for (var length in lengths) {
      // The length should be the length of the sum of the character lengths or
      // the total length provided, whichever is larger
      var value = generator.generate(lengths[length], options);
      value.should.lengthOf(Math.max(lengths[length], 7));

      // The value *must* contain at least 2 of the characters and 5 digits
      expect(value).to.match(/(?=.*[abcd]).{2,}/).to.match(/(?=.*[0-3,5,7]).{5,}/);
    }
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
        {chars: [['\u30B8']], min:1}
      ]
    };

    var value = generator.generate(8, options);
    value.should.lengthOf(8);

    expect(value)
      .to.match(/(?=.*[\u0000]).{1}/) // 0x00
      .to.match(/(?=.*[\uFFFF]).{1}/) // 0xFFFF
      .to.match(/(?=.*[a]).{1}/) // a
      .to.match(/(?=.*[\u20AC]).{1}/) // €, (0x20AC) Euro symbol
      .to.match(/(?=.*[\u0632]).{1}/) // ز, (0x0632) Arabic
      .to.match(/(?=.*[\u1709]).{1}/) // ᜉ, (0x1709) Tagalog
      .to.match(/(?=.*[\u2827]).{1}/) // ⠧, (0x2827) Braille
      .to.match(/(?=.*[\u30B8]).{1}/); // ジ, (0x30B8) Katakana
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
