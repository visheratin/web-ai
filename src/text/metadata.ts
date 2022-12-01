import { Metadata } from "../metadata";

export type TextMetadata = Metadata & {
  modelPaths: Map<string, string>;
  tokenizerPath: string;
};
