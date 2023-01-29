import { createSession } from "../sessionController";
import Tokenizer from "./tokenizer";
import { TextMetadata } from "./metadata";
import { ITextModel, TextProcessingResult } from "./interfaces";
import { T5Decoder, T5Encoder } from "./t5model";
import { generate } from "../utils/generator";
import * as ort from "onnxruntime-web";
import { GenerationConfig } from "../utils/generationConfig";

export type Seq2SeqResult = TextProcessingResult & {
  text: string;
};

export class Seq2SeqModel implements ITextModel {
  metadata: TextMetadata;
  initialized: boolean;
  private tokenizer?: Tokenizer;
  private encoder?: T5Encoder;
  private decoder?: T5Decoder;
  private cache: Map<string, string>;

  constructor(metadata: TextMetadata) {
    this.metadata = metadata;
    this.initialized = false;
    this.cache = new Map<string, string>();
  }

  init = async (cache_size_mb: number = 500, proxy: boolean = true): Promise<number> => {
    const start = new Date();
    const encoderPath = this.metadata.modelPaths.get("encoder");
    if (!encoderPath) {
      throw new Error("model paths do not have the 'encoder' path");
    }
    const encoderSession = await createSession(encoderPath, cache_size_mb, proxy);
    const decoderPath = this.metadata.modelPaths.get("decoder");
    if (!decoderPath) {
      throw new Error("model paths do not have the 'decoder' path");
    }
    const decoderSession = await createSession(decoderPath, cache_size_mb, proxy);
    this.encoder = new T5Encoder(encoderSession);
    this.decoder = new T5Decoder(decoderSession);
    const response = await fetch(this.metadata.tokenizerPath);
    this.tokenizer = Tokenizer.fromConfig(await response.json());
    const end = new Date();
    const elapsed = (end.getTime() - start.getTime()) / 1000;
    this.initialized = true;
    return elapsed;
  };

  process = async (input: string): Promise<Seq2SeqResult> => {
    if (!this.initialized || !this.encoder || !this.decoder || !this.tokenizer) {
      throw Error("the model is not initialized");
    }
    if (this.cache.has(input)) {
      return {
        text: this.cache.get(input) as string,
        cached: true,
        tokensNum: 0,
        elapsed: 0,
      };
    }
    const generationOptions: GenerationConfig = {
      maxLength: 500,
      eosTokenID: 1,
      bosTokenID: 0,
    };
    const inputTokenIds = this.tokenizer.encode(input);
    if (!inputTokenIds) {
      throw Error("unable to get tokens for the text");
    }
    const start = new Date();
    const tensor = new ort.Tensor("int64", new BigInt64Array(inputTokenIds.map((x) => BigInt(x))), [
      1,
      inputTokenIds.length,
    ]);
    let outputTokenIDs: number[] = [];
    for await (const outputTokenID of generate(tensor, this.encoder, this.decoder, generationOptions)) {
      outputTokenIDs.push(outputTokenID);
    }
    const end = new Date();
    const elapsed = (end.getTime() - start.getTime()) / 1000;
    const output: string = this.tokenizer.decode(outputTokenIDs, true).trim();
    return {
      text: output,
      cached: false,
      tokensNum: inputTokenIds.length,
      elapsed: elapsed,
    };
  };

  async *processStream(input: string): AsyncIterable<string> {
    if (!this.initialized || !this.encoder || !this.decoder || !this.tokenizer) {
      throw Error("the model is not initialized");
    }
    if (this.cache.has(input)) {
      return this.cache.get(input) as string;
    }
    const generationOptions: GenerationConfig = {
      maxLength: 500,
      eosTokenID: 1,
      bosTokenID: 0,
    };
    const inputTokenIds = this.tokenizer.encode(input);
    if (!inputTokenIds) {
      throw Error("unable to get tokens for the text");
    }
    const tensor = new ort.Tensor("int64", new BigInt64Array(inputTokenIds.map((x) => BigInt(x))), [
      1,
      inputTokenIds.length,
    ]);
    let outputTokenIDs: number[] = [];
    let oldOutput: string = "";
    for await (const outputTokenID of generate(tensor, this.encoder, this.decoder, generationOptions)) {
      outputTokenIDs.push(outputTokenID);
      const output: string = this.tokenizer.decode(outputTokenIDs, true);
      const diff = output.substring(oldOutput.length);
      yield diff;
      oldOutput = output;
    }
  }
}
