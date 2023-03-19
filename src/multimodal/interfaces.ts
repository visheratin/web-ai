import { MultimodalMetadata } from "./metadata";

export interface IMultimodalModel {
  metadata: MultimodalMetadata;
  initialized: boolean;

  init(proxy: boolean): Promise<number>;
}
