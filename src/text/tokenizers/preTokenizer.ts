interface PreTokenizerConfig {
  type: string;
  tokenizers?: PreTokenizerConfig[];
  replacement?: string;
  addPrefixSpace?: boolean;
  strReplacement?: string;
}

interface PreTokenizer {
  config: PreTokenizerConfig;

  process(str: string): string[];
}
