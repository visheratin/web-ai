import { Metadata } from "../common.js";
import { TokenizerParams } from "../text.js";
import { ModelType } from "./modelType.js";

export type MultimodalMetadata = Metadata & {
  type?: ModelType;
  modelPaths: Map<string, string>;
  outputNames?: Map<string, string>;
  preprocessorPath: string;
  tokenizerPath: string;
  tokenizerParams: TokenizerParams;
  languages?: Map<string, string>;
};
