import { Metadata } from "../common";
import { TokenizerParams } from "../text";
import { MultimodalModelType } from "./modelType";

export type MultimodalMetadata = Metadata & {
  type?: MultimodalModelType;
  modelPaths: Map<string, string>;
  outputNames?: Map<string, string>;
  preprocessorPath: string;
  tokenizerPath: string;
  tokenizerParams: TokenizerParams;
};
