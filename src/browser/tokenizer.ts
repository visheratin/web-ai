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

  async decode(
    ids: Uint32Array,
    skip_special_tokens: boolean
  ): Promise<string> {
    if (this.instance === undefined) {
      throw new Error("Tokenizer is not initialized");
    }
    const res = this.instance.decode(ids, skip_special_tokens);
    return res;
  }

  async encode(
    text: string,
    add_special_tokens: boolean
  ): Promise<Uint32Array> {
    if (this.instance === undefined) {
      throw new Error("Tokenizer is not initialized");
    }
    return this.instance.encode(text, add_special_tokens);
  }
}
