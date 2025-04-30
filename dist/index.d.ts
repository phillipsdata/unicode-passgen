import regenerate from 'regenerate';
export interface CharRange {
    chars: string[][] | string[];
}
export interface IncludeSet extends CharRange {
    min?: number;
}
export interface PasswordOptions {
    length?: number;
    include?: (string | IncludeSet)[];
    exclude?: (string | CharRange)[];
}
interface CharacterSet {
    [key: string]: regenerate;
}
export declare const UNICODE_SETS: CharacterSet;
declare class UnicodePassgen {
    private characters;
    private minRequirements;
    constructor(options?: PasswordOptions);
    private buildCharacterSet;
    private buildCharSet;
    private extractMinRequirements;
    private shuffle;
    private meetsMinRequirements;
    generate(options?: PasswordOptions): string;
}
export default UnicodePassgen;
