import { Metadata } from "../common.js";
import { ImageModelType } from "./modelType.js";

export type ImageMetadata = Metadata & {
  type?: ImageModelType;
  modelPaths: Map<string, string>;
  configPath?: string;
  preprocessorPath: string;
  examples?: string[];
};
