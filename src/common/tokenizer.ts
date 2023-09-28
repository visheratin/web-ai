export interface Tokenizer {
  encode(inputs: string, addSpecialTokens: boolean): Promise<Uint32Array>;
  decode(inputs: Uint32Array, skipSpecialTokens: boolean): Promise<string>;
}
