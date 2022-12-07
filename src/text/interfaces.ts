import { TextMetadata } from "./metadata";

export interface TextModel {
  metadata: TextMetadata;
  initialized: boolean;

  init(): Promise<number>;
  process(input: string): Promise<TextProcessingResult>;
}

export interface TextProcessingResult {
  cached: boolean;
  tokensNum: number;
  elapsed: number;
}
