import { Metadata } from "../metadata";
import { MultimodalModelType } from "./modelType";

export type MultimodalMetadata = Metadata & {
  type?: MultimodalModelType;
  modelPath: string;
  preprocessorPath: string;
  tokenizerPath: string;
};
