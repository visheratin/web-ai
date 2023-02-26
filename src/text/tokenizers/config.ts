import { NormalizerConfig } from "./normalizer";

export interface TokenizerConfig {
  normalizer: NormalizerConfig;
  preTokenizer: PreTokenizerConfig;
  model: ModelConfig;
  postProcessing: PostProcessingConfig;
  decoder: DecoderConfig;
  addedTokens: AddedToken[];
}
