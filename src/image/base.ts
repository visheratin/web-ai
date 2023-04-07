import { Session } from "../session";
import { SessionParams } from "../sessionParams";
import { ImageMetadata } from "./metadata";
import Preprocessor from "./preprocessor";
import * as Comlink from "comlink";
import { createSession } from "../sessionController";
import PreprocessorConfig from "./preprocessorConfig";
import Config from "./config";

export class BaseImageModel {
  metadata: ImageMetadata;
  initialized: boolean;
  config?: Config;
  preprocessor?: Preprocessor;
  sessions?: Map<string, Session | Comlink.Remote<Session>>;

  constructor(metadata: ImageMetadata) {
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
    for (const [name, path] of this.metadata.modelPaths) {
      if (!this.sessions) {
        this.sessions = new Map<string, Session | Comlink.Remote<Session>>();
      }
      this.sessions.set(name, await createSession(path, proxy));
    }
    const preprocessorConfig = await PreprocessorConfig.fromFile(this.metadata.preprocessorPath);
    this.preprocessor = new Preprocessor(preprocessorConfig);
    if (!this.metadata.configPath) {
      throw Error("configPath is not defined");
    }
    this.config = await Config.fromFile(this.metadata.configPath);
    this.initialized = true;
    const end = new Date();
    const elapsed = (end.getTime() - start.getTime()) / 1000;
    return elapsed;
  };
}
