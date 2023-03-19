import { createSession } from "../sessionController";
import { TextMetadata } from "./metadata";
import { ITextModel, TextProcessingResult } from "./interfaces";
import { Encoder } from "./encoder";
import { Decoder } from "./decoder";
import { generate } from "../utils/generator";
import * as ort from "onnxruntime-web";
import { GenerationConfig } from "../utils/generationConfig";
import { WasmTokenizer } from "@visheratin/tokenizers";
import { loadTokenizer } from "./tokenizer";
import { SessionParams } from "../session";

export type Seq2SeqResult = TextProcessingResult & {
  text: string;
};

export class Seq2SeqModel implements ITextModel {
  metadata: TextMetadata;
  initialized: boolean;
  private tokenizer?: WasmTokenizer;
  private encoder?: Encoder;
  private decoder?: Decoder;
  private cache: Map<string, string>;

  constructor(metadata: TextMetadata) {
    if (SessionParams.memoryLimitMB > 0 && SessionParams.memoryLimitMB < metadata.memEstimateMB) {
      throw new Error(
        `The model requires ${metadata.memEstimateMB} MB of memory, but the current memory limit is 
          ${SessionParams.memoryLimitMB} MB.`,
      );
    }
    this.metadata = metadata;
    this.initialized = false;
    this.cache = new Map<string, string>();
  }

  init = async (proxy = true): Promise<number> => {
    const start = new Date();
    const encoderPath = this.metadata.modelPaths.get("encoder");
    if (!encoderPath) {
      throw new Error("model paths do not have the 'encoder' path");
    }
    const encoderOutputName = this.metadata.outputNames.get("encoder");
    if (!encoderOutputName) {
      throw new Error("output names do not have the 'encoder' path");
    }
    const encoderSession = await createSession(encoderPath, proxy);
    const decoderPath = this.metadata.modelPaths.get("decoder");
    if (!decoderPath) {
      throw new Error("model paths do not have the 'decoder' path");
    }
    const decoderOutputName = this.metadata.outputNames.get("decoder");
    if (!decoderOutputName) {
      throw new Error("output names do not have the 'decoder' path");
    }
    const decoderSession = await createSession(decoderPath, proxy);
    this.encoder = new Encoder(encoderSession, encoderOutputName);
    this.decoder = new Decoder(decoderSession, decoderOutputName);
    this.tokenizer = await loadTokenizer(this.metadata.tokenizerPath);
    const end = new Date();
    const elapsed = (end.getTime() - start.getTime()) / 1000;
    this.initialized = true;
    return elapsed;
  };

  process = async (input: string, prefix?: string): Promise<Seq2SeqResult> => {
    if (!this.initialized || !this.encoder || !this.decoder || !this.tokenizer) {
      throw Error("the model is not initialized");
    }
    if (prefix && prefix.length > 0) {
      if (!this.metadata.prefixes) {
        throw Error("the model does not support prefixes");
      }
      if (!this.metadata.prefixes.includes(prefix)) {
        throw Error("the prefix is not allowed");
      }
      input = prefix + ": " + input;
    }
    if (this.cache.has(input)) {
      return {
        text: this.cache.get(input) as string,
        cached: true,
        tokensNum: 0,
        elapsed: 0,
      };
    }
    const generationConfig: GenerationConfig = {
      maxLength: 500,
      eosTokenID: 1,
      bosTokenID: 0,
    };
    const inputTokenIds = this.tokenizer.encode(input, true);
    if (!inputTokenIds) {
      throw Error("unable to get tokens for the text");
    }
    const start = new Date();
    const inputTokens: number[] = [];
    for (let i = 0; i < inputTokenIds.length; i++) {
      inputTokens.push(inputTokenIds[i]);
    }
    const tensor = new ort.Tensor("int64", new BigInt64Array(inputTokens.map((x) => BigInt(x))), [
      1,
      inputTokenIds.length,
    ]);
    const outputTokenIDs: number[] = [];
    for await (const outputTokenID of generate(tensor, this.encoder, this.decoder, generationConfig)) {
      outputTokenIDs.push(outputTokenID);
    }
    const end = new Date();
    const elapsed = (end.getTime() - start.getTime()) / 1000;
    const outputTokens = new Uint32Array(outputTokenIDs.length);
    for (let i = 0; i < outputTokenIDs.length; i++) {
      outputTokens[i] = outputTokenIDs[i];
    }
    const output: string = this.tokenizer.decode(outputTokens, true).trim();
    return {
      text: output,
      cached: false,
      tokensNum: inputTokenIds.length,
      elapsed: elapsed,
    };
  };

  async *processStream(input: string, prefix?: string): AsyncIterable<string> {
    if (!this.initialized || !this.encoder || !this.decoder || !this.tokenizer) {
      throw Error("the model is not initialized");
    }
    if (prefix && prefix.length > 0) {
      if (!this.metadata.prefixes) {
        throw Error("the model does not support prefixes");
      }
      if (!this.metadata.prefixes.includes(prefix)) {
        throw Error("the prefix is not allowed");
      }
      input = prefix + ": " + input;
    }
    if (this.cache.has(input)) {
      return this.cache.get(input) as string;
    }
    const generationOptions: GenerationConfig = {
      maxLength: 500,
      eosTokenID: 1,
      bosTokenID: 0,
    };
    const inputTokenIds = this.tokenizer.encode(input, true);
    if (!inputTokenIds) {
      throw Error("unable to get tokens for the text");
    }
    const inputTokens: number[] = [];
    for (let i = 0; i < inputTokenIds.length; i++) {
      inputTokens.push(inputTokenIds[i]);
    }
    const tensor = new ort.Tensor("int64", new BigInt64Array(inputTokens.map((x) => BigInt(x))), [
      1,
      inputTokenIds.length,
    ]);
    const outputTokenIDs: number[] = [];
    let oldOutput = "";
    for await (const outputTokenID of generate(tensor, this.encoder, this.decoder, generationOptions)) {
      outputTokenIDs.push(outputTokenID);
      const outputTokens = new Uint32Array(outputTokenIDs.length);
      for (let i = 0; i < outputTokenIDs.length; i++) {
        outputTokens[i] = outputTokenIDs[i];
      }
      const output: string = this.tokenizer.decode(outputTokens, true);
      const diff = output.substring(oldOutput.length);
      yield diff;
      oldOutput = output;
    }
  }
}
