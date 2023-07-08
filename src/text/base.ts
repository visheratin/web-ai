import { SessionParams, Tokenizer } from "../common.js";
import { TextMetadata } from "./metadata.js";

export class BaseTextModel {
  metadata: TextMetadata;
  initialized: boolean;
  tokenizer?: Tokenizer;

  constructor(metadata: TextMetadata) {
    if (
      SessionParams.memoryLimitMB > 0 &&
      SessionParams.memoryLimitMB < metadata.memEstimateMB
    ) {
      throw new Error(
        `The model requires ${metadata.memEstimateMB} MB of memory, but the current memory limit is 
          ${SessionParams.memoryLimitMB} MB.`
      );
    }
    this.metadata = metadata;
    this.initialized = false;
  }
}
