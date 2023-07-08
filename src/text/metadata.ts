import { Metadata } from "../common.js";
import { ModelType } from "./modeType.js";

export type TextMetadata = Metadata & {
  type?: ModelType;
  modelPaths: Map<string, string>;
  outputNames: Map<string, string>;
  tokenizerPath: string;
  tokenizerParams: TokenizerParams;
  prefixes?: string[];
};

export type TokenizerParams = {
  bosTokenID?: number;
  eosTokenID?: number;
  padTokenID: number;
};
