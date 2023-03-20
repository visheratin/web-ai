import Preprocessor from "../image/preprocessor";
import { Session, SessionParams } from "../session";
import { MultimodalMetadata } from "./metadata";
import * as Comlink from "comlink";
import { WasmTokenizer } from "@visheratin/tokenizers";
import { createSession } from "../sessionController";
import PreprocessorConfig from "../image/preprocessorConfig";
import { loadTokenizer } from "../text/tokenizer";

export class BaseMultimodalModel {
  metadata: MultimodalMetadata;
  initialized: boolean;
  preprocessor?: Preprocessor;
  tokenizer?: WasmTokenizer;
  session?: Session | Comlink.Remote<Session>;

  constructor(metadata: MultimodalMetadata) {
    if (SessionParams.memoryLimitMB > 0 && SessionParams.memoryLimitMB < metadata.memEstimateMB) {
      throw new Error(
        `The model requires ${metadata.memEstimateMB} MB of memory, but the current memory limit is 
          ${SessionParams.memoryLimitMB} MB.`,
      );
    }
    this.metadata = metadata;
    this.initialized = false;
  }

  init = async (proxy = true): Promise<number> => {
    const start = new Date();
    this.session = await createSession(this.metadata.modelPath, proxy);
    const preprocessorConfig = await PreprocessorConfig.fromFile(this.metadata.preprocessorPath);
    this.preprocessor = new Preprocessor(preprocessorConfig);
    this.tokenizer = await loadTokenizer(this.metadata.tokenizerPath);
    this.initialized = true;
    const end = new Date();
    const elapsed = (end.getTime() - start.getTime()) / 1000;
    return elapsed;
  };
}
