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

describe('#getCharacterList', function() {
  it('alphanumeric characters work', function() {
    var options = {
      include: [
        {
          chars: [
            ['A', 'Z'],
            ['0', '8']
          ]
        }
      ],
      exclude: [{chars: []}]
    };

    // There should be characters from A-Z and 0-8 in the list, but not 9
    expect(
      generator.getCharacterList(options)
    ).to.deep.include.members([65,66,67,77,90,48,53,56]).not.include(57);

    // The total number of characters should be 26 + 9 = 35
    generator.getCharacterList(options).should.lengthOf(35);
  });

  it('decimal characters work', function() {
    var options = {
      include: [
        {
          chars: [
            [50, 53],
            [1000, 1002]
          ]
        }
      ],
      exclude: [
        {
          chars: [
            ['3']
          ]
        }
      ]
    };

    // There should be characters from 50-53 (digits 2 to 5), excluding 3,
    // and 1000-1002 (cyrillic characters) in the list
    expect(
      generator.getCharacterList(options)
    ).to.deep.include.members([50,52,53,1000,1001,1002]);

  });

  it('all included characters are set', function() {
    // No values
    expect(
      generator.getCharacterList({include: [{chars: []}], exclude: [{chars: []}]})
    ).to.be.an('array').that.is.empty;

    // Unicode character 0x41 equates to decimal equivalent 65
    expect(
      generator.getCharacterList({include: [{chars: [[0x41]]}], exclude: [{chars: []}]})
    ).to.deep.include(65);

    // Unicode character range should include values in the middle
    expect(
      generator.getCharacterList({include: [{chars: [[0x41, 0x43]]}], exclude: [{chars: []}]})
    ).to.deep.include.members([65,66,67]);

    // Unicode character range should include values from multiple sets
    expect(
      generator.getCharacterList({include: [{chars: [[0x41, 0x43], [0x46]]}], exclude: [{chars: []}]})
    ).to.deep.include.members([65,66,67,70]);
  });

  it('all excluded characters are removed', function() {
    // No values
    expect(
      generator.getCharacterList({include: [{chars: [[0x41]]}], exclude: [{chars: [[0x41]]}]})
    ).to.be.an('array').that.is.empty;

    // Include a range but exclude a character in the middle of it
    expect(
      generator.getCharacterList({include: [{chars: [[0x41, 0x43]]}], exclude: [{chars: [[0x42]]}]})
    ).to.deep.not.include(66);

    // Exclude a range
    expect(
      generator.getCharacterList({include: [{chars: [[0x41, 0x43]]}], exclude: [{chars: [[0x41, 0x43]]}]})
    ).to.be.empty;
  });
});

describe('#isInt', function() {
  it('integers are accepted', function() {
    generator.isInt(-100).should.equal(true);
    generator.isInt(-1).should.equal(true);
    generator.isInt(0).should.equal(true);
    generator.isInt(1).should.equal(true);
    generator.isInt(100).should.equal(true);
  });

  it('non-integers are not accepted', function() {
    generator.isInt('').should.equal(false);
    generator.isInt('1').should.equal(false);
    generator.isInt('test').should.equal(false);
    generator.isInt({}).should.equal(false);
    generator.isInt(3.14159).should.equal(false);
    generator.isInt(null).should.equal(false);
  });
});
