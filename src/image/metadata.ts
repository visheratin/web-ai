import { Metadata } from "../common.js";
import { ModelType } from "./modelType.js";

export type ImageMetadata = Metadata & {
  type?: ModelType;
  modelPaths: Map<string, string>;
  configPath?: string;
  preprocessorPath: string;
  examples?: string[];
};
