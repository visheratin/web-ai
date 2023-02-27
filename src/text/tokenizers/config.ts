import { NormalizerConfig } from "./normalizer";
import { PreTokenizerConfig } from "./preTokenizer";

export interface TokenizerConfig {
  normalizer: NormalizerConfig;
  preTokenizer: PreTokenizerConfig;
  model: ModelConfig;
  postProcessing: PostProcessingConfig;
  decoder: DecoderConfig;
  addedTokens: AddedToken[];
}
