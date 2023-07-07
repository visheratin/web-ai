import { WasmTokenizer } from "@visheratin/tokenizers-node";

export const loadTokenizer = async (tokenizerPath: string): Promise<WasmTokenizer> => {
  const response = await fetch(tokenizerPath);
  const tokenizerData = await response.json();
  tokenizerData["padding"] = null;
  return new WasmTokenizer(JSON.stringify(tokenizerData));
};