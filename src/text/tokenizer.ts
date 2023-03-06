import init, { WasmTokenizer } from "@visheratin/tokenizers";

export const loadTokenizer = async (tokenizerPath: string): Promise<WasmTokenizer> => {
  await init();
  const response = await fetch(tokenizerPath);
  const tokenizerData = await response.json();
  tokenizerData["padding"] = null;
  return new WasmTokenizer(JSON.stringify(tokenizerData));
};
