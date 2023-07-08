import { Metadata } from "../common.js";
import { TokenizerParams } from "../text.js";
import { MultimodalModelType } from "./modelType.js";

export type MultimodalMetadata = Metadata & {
  type?: MultimodalModelType;
  modelPaths: Map<string, string>;
  outputNames?: Map<string, string>;
  preprocessorPath: string;
  tokenizerPath: string;
  tokenizerParams: TokenizerParams;
};
