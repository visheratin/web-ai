import init, { WasmTokenizer } from "@visheratin/tokenizers";
import { SessionParams } from "./sessionParams.js";

export class Tokenizer {
  instance: WasmTokenizer | undefined;
  private tokenizerPath: string;

  constructor(tokenizerPath: string) {
    this.tokenizerPath = tokenizerPath;
  }

  async init() {
    await init(SessionParams.tokenizersPath);
    const response = await fetch(this.tokenizerPath);
    const tokenizerData = await response.json();
    tokenizerData["padding"] = null;
    this.instance = new WasmTokenizer(JSON.stringify(tokenizerData));
  }

  decode(ids: Uint32Array, skip_special_tokens: boolean): string {
    if (this.instance === undefined) {
      throw new Error("Tokenizer is not initialized");
    }
    return this.instance.decode(ids, skip_special_tokens);
  }

  encode(text: string, add_special_tokens: boolean): Uint32Array {
    if (this.instance === undefined) {
      throw new Error("Tokenizer is not initialized");
    }
    return this.instance.encode(text, add_special_tokens);
  }
}
