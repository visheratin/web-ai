interface ModelConfig {
  vocab: (string | number)[][];
  unk_id: number;
}

interface Model {
  config: ModelConfig;

  process(str: string): number[];
}
