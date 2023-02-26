interface PostProcessingConfig {
  type: string;
}

interface PostProcessor {
  config: PostProcessingConfig;

  process(tokens: string[]): string[];
}
