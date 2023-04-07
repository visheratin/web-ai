import { WasmTokenizer } from "@visheratin/tokenizers";
import { TextMetadata } from "./metadata";
import { SessionParams } from "../sessionParams";

export class BaseTextModel {
  metadata: TextMetadata;
  initialized: boolean;
  tokenizer?: WasmTokenizer;

  constructor(metadata: TextMetadata) {
    if (SessionParams.memoryLimitMB > 0 && SessionParams.memoryLimitMB < metadata.memEstimateMB) {
      throw new Error(
        `The model requires ${metadata.memEstimateMB} MB of memory, but the current memory limit is 
          ${SessionParams.memoryLimitMB} MB.`,
      );
    }
    this.metadata = metadata;
    this.initialized = false;
  }
}
