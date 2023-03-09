import init, { WasmTokenizer } from "@visheratin/tokenizers";

export const loadTokenizer = async (tokenizerPath: string): Promise<WasmTokenizer> => {
  await init("https://edge-ai-models.s3.us-east-2.amazonaws.com/tokenizers.wasm");
  const response = await fetch(tokenizerPath);
  const tokenizerData = await response.json();
  tokenizerData["padding"] = null;
  return new WasmTokenizer(JSON.stringify(tokenizerData));
};
