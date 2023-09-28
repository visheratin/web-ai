import { WasmTokenizer } from "@visheratin/tokenizers-node";
import fetch from "node-fetch";

export class Tokenizer {
  instance: WasmTokenizer | undefined;
  private tokenizerPath: string;

  constructor(tokenizerPath: string) {
    this.tokenizerPath = tokenizerPath;
  }

  async init() {
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
    return this.instance.decode(ids, skip_special_tokens);
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
