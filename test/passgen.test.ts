import UnicodePassgen from '../src/index';

describe('unicode-passgen', () => {
    it('should generate a password with length 12 by default', () => {
        const passgen = new UnicodePassgen();
        const password = passgen.generate();
        expect(password).toHaveLength(12);
    });

    it('should generate a password with specified length', () => {
        const passgen = new UnicodePassgen();
        const password = passgen.generate({ length: 20 });
        expect(password).toHaveLength(20);
    });

    it('should include only specified character sets', () => {
        const passgen = new UnicodePassgen({ include: ['alpha_lower', 'numeric'] });
        const password = passgen.generate();
        expect(password).toMatch(/^[a-z0-9]+$/);
    });

    it('should include only specified character set', () => {
        const passgen = new UnicodePassgen({ include: [{ chars: [['a', 'c'], ['1', '3']] }] });
        const password = passgen.generate();
        expect(password).toMatch(/^[abc123]+$/);
    });

    it('should exclude specified character sets', () => {
        const passgen = new UnicodePassgen({ exclude: ['symbols'] });
        const password = passgen.generate();
        expect(password).not.toMatch(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/);
    });

    it('should respect minimum character requirements', () => {
        const passgen = new UnicodePassgen({
            include: [
                { chars: [['a', 'z']] },
                { chars: [['A', 'Z']] },
                { chars: [['0', '9']] }
            ],
            exclude: ['symbols']
        });
        const password = passgen.generate({ length: 6 });
        expect(password).toHaveLength(6);
        expect(password.match(/[a-z]/g)?.length).toBeGreaterThanOrEqual(1);
        expect(password.match(/[A-Z]/g)?.length).toBeGreaterThanOrEqual(1);
        expect(password.match(/[0-9]/g)?.length).toBeGreaterThanOrEqual(1);
    });

    it('should respect minimum character requirements with min', () => {
        const passgen = new UnicodePassgen({
            include: [
                { chars: [['a', 'z']] },
                { chars: [['A', 'Z']] },
                { chars: [['0', '9']], min: 2 }
            ]
        });
        const password = passgen.generate({ length: 6 });
        expect(password).toHaveLength(6);
        expect(password.match(/[a-z]/g)?.length).toBeGreaterThanOrEqual(1);
        expect(password.match(/[A-Z]/g)?.length).toBeGreaterThanOrEqual(1);
        expect(password.match(/[0-9]/g)?.length).toBeGreaterThanOrEqual(2);
    });
});
