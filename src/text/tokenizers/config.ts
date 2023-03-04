import { DecoderConfig } from "./decoder";
import { ModelConfig } from "./model";
import { NormalizerConfig } from "./normalizer";
import { PreTokenizerConfig } from "./preTokenizer";

export class TokenizerConfig {
  normalizer?: NormalizerConfig;
  preTokenizer: PreTokenizerConfig;
  model: ModelConfig;
  decoder: DecoderConfig;

  constructor() {
    this.preTokenizer = {
      type: "unknown",
    };
    this.model = {
      type: "unknown",
      vocab: new Map<string, number>(),
      bosToken: "",
      eosToken: "",
      unknownToken: "",
    };
    this.decoder = {
      type: "unknown",
      vocab: new Map<string, number>(),
    };
  }

  static fromJSON(jsonData: any): TokenizerConfig {
    const config = new TokenizerConfig();
    if (jsonData.normalizer) {
      config.normalizer = NormalizerConfig.fromJSON(jsonData.normalizer);
    }
    // config.preTokenizer = PreTokenizerConfig.fromJSON(jsonData.preTokenizer);
    // config.model = ModelConfig.fromJSON(jsonData.model);
    // config.decoder = DecoderConfig.fromJSON(jsonData.decoder);
    return config;
  }
}
