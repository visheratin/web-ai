import { ImageMetadata } from "./metadata";

export interface ImageModel {
  metadata: ImageMetadata;
  initialized: boolean;

  init(): Promise<number>;
  process(input: string | Buffer): Promise<ImageProcessingResult>;
}

export interface ImageProcessingResult {
  elapsed: number;
}
