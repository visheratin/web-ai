export interface ModelConfig {
  vocab: Map<string, number>;
  unkID: number;
}

export interface Model {
  config: ModelConfig;

  process(str: string[]): number[];
}
