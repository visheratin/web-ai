import { TextMetadata } from "./metadata";

export interface ITextModel {
  metadata: TextMetadata;
  initialized: boolean;

  init(cache_size_mb: number, proxy: boolean): Promise<number>;
  process(input: string): Promise<TextProcessingResult>;
}

export interface TextProcessingResult {
  cached: boolean;
  tokensNum: number;
  elapsed: number;
}
