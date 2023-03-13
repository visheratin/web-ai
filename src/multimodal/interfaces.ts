import { MultimodalMetadata } from "./metadata";

export interface IMultimodalModel {
  metadata: MultimodalMetadata;
  initialized: boolean;

  init(cache_size_mb: number, proxy: boolean): Promise<number>;
}
