import { Metadata } from "../metadata";
import { ImageModelType } from "./modelType";

export type ImageMetadata = Metadata & {
  type: ImageModelType;
  modelPath: string;
  configPath: string;
  preprocessorPath: string;
  examples: string[];
};
