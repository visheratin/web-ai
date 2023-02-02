import { createSession } from "../sessionController";
import Tokenizer from "./tokenizer";
import { TextMetadata } from "./metadata";
import { T5Encoder } from "./t5model";
import * as ort from "onnxruntime-web";
import { Tensor } from "../tensor";
import { ITextModel, TextProcessingResult } from "./interfaces";

export type FeatureExtractionResult = TextProcessingResult & {
  result: number[];
};

export class FeatureExtractionModel implements ITextModel {
  metadata: TextMetadata;
  initialized: boolean;
  private tokenizer?: Tokenizer;
  private model?: T5Encoder;
  private cache: Map<string, number[]>;

  constructor(metadata: TextMetadata) {
    this.metadata = metadata;
    this.initialized = false;
    this.cache = new Map<string, number[]>();
  }

  init = async (cache_size_mb: number = 500, proxy: boolean = true): Promise<number> => {
    const start = new Date();
    const modelPath = this.metadata.modelPaths.get("encoder");
    if (!modelPath) {
      throw new Error("model paths do not have the 'encoder' path");
    }
    const encoderSession = await createSession(modelPath, cache_size_mb, proxy);
    this.model = new T5Encoder(encoderSession);
    const response = await fetch(this.metadata.tokenizerPath);
    this.tokenizer = Tokenizer.fromConfig(await response.json());
    const end = new Date();
    const elapsed = (end.getTime() - start.getTime()) / 1000;
    this.initialized = true;
    return elapsed;
  };

  process = async (input: string): Promise<FeatureExtractionResult> => {
    if (!this.initialized || !this.model || !this.tokenizer) {
      throw Error("the model is not initialized");
    }
    if (this.cache.has(input)) {
      return {
        result: this.cache.get(input) as number[],
        cached: true,
        tokensNum: 0,
        elapsed: 0,
      };
    }
    const inputTokenIds = this.tokenizer.encode(input);
    if (!inputTokenIds) {
      throw Error("input tokens tensor is undefined");
    }
    const start = new Date();
    const tensor = new ort.Tensor("int64", new BigInt64Array(inputTokenIds.map((x) => BigInt(x))), [
      1,
      inputTokenIds.length,
    ]);
    const lastHiddenState = await this.model.process(tensor);
    if (!lastHiddenState) {
      throw Error("model output is undefined");
    }
    const end = new Date();
    const elapsed = (end.getTime() - start.getTime()) / 1000;
    const output = this.generate_output(lastHiddenState);
    return {
      result: output,
      cached: false,
      tokensNum: inputTokenIds?.length!,
      elapsed: elapsed,
    };
  };

  private generate_output = (lastHiddenState: ort.Tensor): number[] => {
    const tensor = new Tensor(lastHiddenState);
    let result: number[] = [];
    for (let i = 0; i < lastHiddenState.dims[2]; i++) {
      result.push(0);
    }
    for (let i = 0; i < lastHiddenState.dims[1]; i++) {
      for (let j = 0; j < lastHiddenState.dims[2]; j++) {
        result[j] += tensor.at([0, i, j]) as number;
      }
    }
    for (let i = 0; i < result.length; i++) {
      result[i] /= lastHiddenState.dims[1];
    }
    return this.normalize(result);
  };

  private normalize = (input: number[]): number[] => {
    let result: number[] = [];
    let sum = 0;
    for (let i = 0; i < input.length; i++) {
      sum += input[i] * input[i];
    }
    sum = Math.sqrt(sum);
    for (let i = 0; i < input.length; i++) {
      result.push(input[i] / sum);
    }
    return result;
  };
}
