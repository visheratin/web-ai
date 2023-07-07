import { Metadata } from "../common";
import { ImageModelType } from "./modelType";

export type ImageMetadata = Metadata & {
  type?: ImageModelType;
  modelPaths: Map<string, string>;
  configPath?: string;
  preprocessorPath: string;
  examples?: string[];
};
