import { Metadata } from "../metadata";
import { TextModelType } from "./modeType";

export type TextMetadata = Metadata & {
  type?: TextModelType;
  modelPaths: Map<string, string>;
  tokenizerPath: string;
};
