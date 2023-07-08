import { WasmTokenizer } from "@visheratin/tokenizers-node";
import fetch from "node-fetch";

export const loadTokenizer = async (
  tokenizerPath: string
): Promise<WasmTokenizer> => {
  const response = await fetch(tokenizerPath);
  const tokenizerData = await response.json();
  // @ts-ignore
  tokenizerData["padding"] = null;
  return new WasmTokenizer(JSON.stringify(tokenizerData));
};
