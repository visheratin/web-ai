import { ModelConfig } from "./model";
import { NormalizerConfig } from "./normalizer";
import { PostProcessingConfig } from "./postProcessor";
import { PreTokenizerConfig } from "./preTokenizer";

export interface TokenizerConfig {
  normalizer: NormalizerConfig;
  preTokenizer: PreTokenizerConfig;
  model: ModelConfig;
  postProcessing: PostProcessingConfig;
  decoder: DecoderConfig;
  addedTokens: AddedToken[];
}
