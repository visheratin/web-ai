import { Metadata } from "../metadata";
import { TokenizerParams } from "../text/metadata";
import { MultimodalModelType } from "./modelType";

export type MultimodalMetadata = Metadata & {
  type?: MultimodalModelType;
  modelPaths: Map<string, string>;
  outputNames?: Map<string, string>;
  preprocessorPath: string;
  tokenizerPath: string;
  tokenizerParams: TokenizerParams;
};
