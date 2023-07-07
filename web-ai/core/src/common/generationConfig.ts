export interface GenerationConfig {
  // The maximum number of tokens to generate.
  // If not provided, the model will generate until it reaches the end of the sequence.
  maxTokens?: number;
  // The maximum number of tokens to generate.
  // If not provided, the model will generate until it reaches the end of the sequence.
  maxLength?: number;
  // The ID of the padding token.
  padTokenID: number;
  // The ID of the beginning of sequence token.
  bosTokenID: number;
  // The ID of the end of sequence token.
  eosTokenID: number;
}
