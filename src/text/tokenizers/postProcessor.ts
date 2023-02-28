export interface PostProcessingConfig {
  type: string;
}

export interface PostProcessor {
  config: PostProcessingConfig;

  process(tokens: string[]): string[];
}
