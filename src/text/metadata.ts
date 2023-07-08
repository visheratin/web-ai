import { Metadata } from "../common.js";
import { TextModelType } from "./modeType.js";

export type TextMetadata = Metadata & {
  type?: TextModelType;
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
