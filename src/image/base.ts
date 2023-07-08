import { Session } from "../common.js";
import { ImageMetadata } from "./metadata.js";
import Preprocessor from "./preprocessor.js";
import { PreprocessorConfig } from "./preprocessorConfig.js";
import Config from "./config.js";
import { createSession, SessionParams } from "../browser.js";

export class BaseImageModel {
  metadata: ImageMetadata;
  initialized: boolean;
  config?: Config;
  preprocessor?: Preprocessor;
  sessions?: Map<string, Session>;

  constructor(metadata: ImageMetadata) {
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

  init = async (proxy = true): Promise<number> => {
    const start = new Date();
    for (const [name, path] of this.metadata.modelPaths) {
      if (!this.sessions) {
        this.sessions = new Map<string, Session>();
      }
      this.sessions.set(name, await createSession(path, proxy));
    }
    const preprocessorConfig = await PreprocessorConfig.fromFile(
      this.metadata.preprocessorPath
    );
    this.preprocessor = new Preprocessor(preprocessorConfig);
    if (this.metadata.configPath) {
      this.config = await Config.fromFile(this.metadata.configPath);
    }
    this.initialized = true;
    const end = new Date();
    const elapsed = (end.getTime() - start.getTime()) / 1000;
    return elapsed;
  };
}
