import { createSession } from "../sessionController";
import { TextMetadata } from "./metadata";
import { TextProcessingResult } from "./interfaces";
import { Encoder } from "../utils/encoder";
import { Decoder } from "../utils/decoder";
import { GeneratorType, generate } from "../utils/generator";
import { GenerationConfig } from "../utils/generationConfig";
import { loadTokenizer } from "./tokenizer";
import { BaseTextModel } from "./base";
import { prepareTextTensors } from "../utils/prepare";

export type Seq2SeqResult = TextProcessingResult & {
  text: string[];
};

export class Seq2SeqModel extends BaseTextModel {
  private encoder?: Encoder;
  private decoder?: Decoder;
  private cache: Map<string, string>;

  constructor(metadata: TextMetadata) {
    super(metadata);
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
    this.encoder = new Encoder(encoderSession, encoderOutputName, GeneratorType.Seq2Seq);
    this.decoder = new Decoder(decoderSession, decoderOutputName, GeneratorType.Seq2Seq);
    this.tokenizer = await loadTokenizer(this.metadata.tokenizerPath);
    const end = new Date();
    const elapsed = (end.getTime() - start.getTime()) / 1000;
    this.initialized = true;
    return elapsed;
  };

  process = async (inputs: string | string[], prefix?: string): Promise<Seq2SeqResult> => {
    if (!this.initialized || !this.encoder || !this.decoder || !this.tokenizer) {
      throw Error("the model is not initialized");
    }
    if (typeof inputs === "string") {
      inputs = [inputs];
    }
    if (prefix && prefix.length > 0) {
      if (!this.metadata.prefixes) {
        throw Error("the model does not support prefixes");
      }
      if (!this.metadata.prefixes.includes(prefix)) {
        throw Error("the prefix is not allowed");
      }
      for (let i = 0; i < inputs.length; i++) {
        inputs[i] = prefix + ": " + inputs[i];
      }
    }
    if (inputs.length == 1 && this.cache.has(inputs[0])) {
      return {
        text: [this.cache.get(inputs[0]) as string],
        cached: true,
        tokensNum: 0,
        elapsed: 0,
      };
    }
    const textTensors = await prepareTextTensors(inputs, this, this.metadata.tokenizerParams.padTokenID);
    if (
      this.metadata.tokenizerParams.bosTokenID === undefined ||
      this.metadata.tokenizerParams.eosTokenID === undefined
    ) {
      throw Error("the model does not have the bosTokenID or eosTokenID");
    }
    const generationConfig: GenerationConfig = {
      maxLength: 500,
      eosTokenID: this.metadata.tokenizerParams.eosTokenID,
      bosTokenID: this.metadata.tokenizerParams.bosTokenID,
      padTokenID: this.metadata.tokenizerParams.padTokenID,
    };
    const start = new Date();
    const outputTokenIDs: number[][] = [];
    const result: string[] = [];
    for await (const tokenIDs of generate(
      textTensors[0],
      this.encoder,
      this.decoder,
      generationConfig,
      textTensors[1],
    )) {
      for (let i = 0; i < tokenIDs.length; i++) {
        if (tokenIDs[i] !== this.metadata.tokenizerParams.padTokenID) {
          if (!outputTokenIDs[i]) outputTokenIDs[i] = [];
          outputTokenIDs[i].push(tokenIDs[i]);
        }
        const outputTokens = new Uint32Array(outputTokenIDs[i]);
        const output: string = this.tokenizer.decode(outputTokens, true).trim();
        result[i] = output;
      }
    }
    const end = new Date();
    const elapsed = (end.getTime() - start.getTime()) / 1000;
    return {
      text: result,
      cached: false,
      tokensNum: textTensors[0].data.length,
      elapsed: elapsed,
    };
  };

  async *processStream(inputs: string | string[], prefix?: string): AsyncIterable<string[]> {
    if (!this.initialized || !this.encoder || !this.decoder || !this.tokenizer) {
      throw Error("the model is not initialized");
    }
    if (typeof inputs === "string") {
      inputs = [inputs];
    }
    if (prefix && prefix.length > 0) {
      if (!this.metadata.prefixes) {
        throw Error("the model does not support prefixes");
      }
      if (!this.metadata.prefixes.includes(prefix)) {
        throw Error("the prefix is not allowed");
      }
      for (let i = 0; i < inputs.length; i++) {
        inputs[i] = prefix + ": " + inputs[i];
      }
    }
    if (inputs.length == 1 && this.cache.has(inputs[0])) {
      return this.cache.get(inputs[0]) as string;
    }
    const textTensors = await prepareTextTensors(inputs, this, this.metadata.tokenizerParams.padTokenID);
    if (
      this.metadata.tokenizerParams.bosTokenID === undefined ||
      this.metadata.tokenizerParams.eosTokenID === undefined
    ) {
      throw Error("the model does not have the bosTokenID or eosTokenID");
    }
    const generationConfig: GenerationConfig = {
      maxLength: 500,
      eosTokenID: this.metadata.tokenizerParams.eosTokenID,
      bosTokenID: this.metadata.tokenizerParams.bosTokenID,
      padTokenID: this.metadata.tokenizerParams.padTokenID,
    };
    const outputTokenIDs: number[][] = [];
    let oldOutput: string[] = new Array(inputs.length).fill("");
    const diffs: string[] = new Array(inputs.length).fill("");
    for await (const tokenIDs of generate(
      textTensors[0],
      this.encoder,
      this.decoder,
      generationConfig,
      textTensors[1],
    )) {
      const newOutput: string[] = [];
      for (let i = 0; i < tokenIDs.length; i++) {
        if (tokenIDs[i] !== this.metadata.tokenizerParams.padTokenID) {
          if (!outputTokenIDs[i]) outputTokenIDs[i] = [];
          outputTokenIDs[i].push(tokenIDs[i]);
        }
        const outputTokens = new Uint32Array(outputTokenIDs[i]);
        const output: string = this.tokenizer.decode(outputTokens, true);
        newOutput.push(output);
        diffs[i] = output.substring(oldOutput[i].length);
      }
      yield diffs;
      oldOutput = newOutput;
    }
  }
}
