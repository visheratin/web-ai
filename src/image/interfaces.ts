import { ImageMetadata } from "./metadata";

export interface IImageModel {
  metadata: ImageMetadata;
  initialized: boolean;

  init(cache_size_mb: number, proxy: boolean): Promise<number>;
  process(input: string | Buffer): Promise<ImageProcessingResult>;
}

export interface ImageProcessingResult {
  elapsed: number;
}
