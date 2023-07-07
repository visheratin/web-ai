export interface Tokenizer {
  encode(inputs: string, addSpecialTokens: boolean): Uint32Array;
  decode(inputs: Uint32Array, skipSpecialTokens: boolean): string;
}
