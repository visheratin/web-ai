import { Metadata } from "../metadata";

export type ImageMetadata = Metadata & {
  modelPath: string;
  configPath: string;
  preprocessorPath: string;
  examples: string[];
};
