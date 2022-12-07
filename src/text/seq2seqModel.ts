import { createSession } from "../session";
import Tokenizer from "./tokenizer";
import { TextMetadata } from "./metadata";
import { T5ForConditionalGeneration } from "./transformers";
import { TextModel, TextProcessingResult } from "./interfaces";

export type Seq2SeqResult = TextProcessingResult & {
  text: string;
};

export class Seq2SeqModel implements TextModel {
  metadata: TextMetadata;
  initialized: boolean;
  private tokenizer?: Tokenizer;
  private model?: T5ForConditionalGeneration;
  private cache: Map<string, string>;

  constructor(metadata: TextMetadata) {
    this.metadata = metadata;
    this.initialized = false;
    this.cache = new Map<string, string>();
  }

  init = async (): Promise<number> => {
    const start = new Date();
    const encoderPath = this.metadata.modelPaths.get("encoder");
    if (!encoderPath) {
      throw new Error("model paths do not have the 'encoder' path");
    }
    const encoderSession = await createSession(encoderPath);
    const decoderPath = this.metadata.modelPaths.get("decoder");
    if (!decoderPath) {
      throw new Error("model paths do not have the 'decoder' path");
    }
    const decoderSession = await createSession(decoderPath);
    this.model = new T5ForConditionalGeneration(encoderSession, decoderSession);
    const response = await fetch(this.metadata.tokenizerPath);
    this.tokenizer = Tokenizer.fromConfig(await response.json());
    const end = new Date();
    const elapsed = (end.getTime() - start.getTime()) / 1000;
    this.initialized = true;
    return elapsed;
  };

  process = async (input: string): Promise<Seq2SeqResult> => {
    if (!this.initialized || !this.model || !this.tokenizer) {
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
    const generationOptions = {
      maxLength: 500,
      topK: 0,
    };
    const inputTokenIds = this.tokenizer.encode(input);
    if (!inputTokenIds) {
      throw Error("unable to get tokens for the text");
    }
    const start = new Date();
    const outputTokenIds = await this.model.generate(inputTokenIds, generationOptions);
    const end = new Date();
    const elapsed = (end.getTime() - start.getTime()) / 1000;
    let output: string = this.tokenizer.decode(outputTokenIds, true).trim();
    output = output.trim();
    return {
      text: output,
      cached: false,
      tokensNum: inputTokenIds.length,
      elapsed: elapsed,
    };
  };
}
