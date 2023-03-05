import { ImageMetadata } from "./metadata";

export interface IImageModel {
  metadata: ImageMetadata;
  initialized: boolean;

  init(cacheSizeMB: number, proxy: boolean): Promise<number>;
  process(input: string | Buffer): Promise<ImageProcessingResult>;
}

export interface ImageProcessingResult {
  elapsed: number;
}
