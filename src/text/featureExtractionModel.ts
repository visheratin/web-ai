import { createSession } from "../sessionController";
import { WasmTokenizer } from "@visheratin/tokenizers";
import { TextMetadata } from "./metadata";
import { Encoder } from "./encoder";
import * as ort from "onnxruntime-web";
import { Tensor } from "../tensor";
import { ITextModel, TextProcessingResult } from "./interfaces";
import { Session, SessionParams } from "../session";
import { Remote } from "comlink";
import { loadTokenizer } from "./tokenizer";

export type TextFeatureExtractionResult = TextProcessingResult & {
  result: number[];
};

export class TextFeatureExtractionModel implements ITextModel {
  metadata: TextMetadata;
  initialized: boolean;
  private tokenizer?: WasmTokenizer;
  private model?: Encoder;
  private dense?: Session | Remote<Session>;
  private cache: Map<string, number[]>;

  constructor(metadata: TextMetadata) {
    if (SessionParams.memoryLimitMB > 0 && SessionParams.memoryLimitMB < metadata.memEstimateMB) {
      throw new Error(
        `The model requires ${metadata.memEstimateMB} MB of memory, but the current memory limit is 
          ${SessionParams.memoryLimitMB} MB.`,
      );
    }
    this.metadata = metadata;
    this.initialized = false;
    this.cache = new Map<string, number[]>();
  }

  init = async (cacheSizeMB = 500, proxy = true): Promise<number> => {
    const start = new Date();
    const modelPath = this.metadata.modelPaths.get("encoder");
    if (!modelPath) {
      throw new Error("model paths do not have the 'encoder' path");
    }
    const outputName = this.metadata.outputNames.get("encoder");
    if (!outputName) {
      throw new Error("output names do not have the 'encoder' path");
    }
    const encoderSession = await createSession(modelPath, cacheSizeMB, proxy);
    this.model = new Encoder(encoderSession, outputName);
    const densePath = this.metadata.modelPaths.get("dense");
    if (densePath) {
      this.dense = await createSession(densePath, cacheSizeMB, proxy);
    }
    this.tokenizer = await loadTokenizer(this.metadata.tokenizerPath);
    const end = new Date();
    const elapsed = (end.getTime() - start.getTime()) / 1000;
    this.initialized = true;
    return elapsed;
  };

  process = async (input: string): Promise<TextFeatureExtractionResult> => {
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
    const inputTokenIDs = this.tokenizer.encode(input, true);
    if (!inputTokenIDs) {
      throw Error("input tokens tensor is undefined");
    }
    const start = new Date();
    const inputTokens: number[] = [];
    for (let i = 0; i < inputTokenIDs.length; i++) {
      inputTokens.push(inputTokenIDs[i]);
    }
    const tensor = new ort.Tensor("int64", new BigInt64Array(inputTokens.map((x) => BigInt(x))), [
      1,
      inputTokenIDs.length,
    ]);
    const lastHiddenState = await this.model.process(tensor);
    if (!lastHiddenState) {
      throw Error("model output is undefined");
    }
    const end = new Date();
    const elapsed = (end.getTime() - start.getTime()) / 1000;
    const output = await this.generate_output(lastHiddenState);
    return {
      result: output,
      cached: false,
      tokensNum: inputTokenIDs.length,
      elapsed: elapsed,
    };
  };

  private generate_output = async (lastHiddenState: ort.Tensor): Promise<number[]> => {
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
    if (this.dense) {
      result = await this.run_dense(result);
    }
    return this.normalize(result);
  };

  private run_dense = async (pooledResult: number[]): Promise<number[]> => {
    if (!this.dense) {
      throw Error("dense model is undefined");
    }
    const tensor = new ort.Tensor("float32", new Float32Array(pooledResult), [1, pooledResult.length]);
    const output = await this.dense.run({ input: tensor });
    const result = new Tensor(output.output);
    const outputResult: number[] = [];
    for (let i = 0; i < result.ortTensor.dims[1]; i++) {
      outputResult.push(result.at([0, i]) as number);
    }
    return outputResult;
  };

  private normalize = (input: number[]): number[] => {
    const result: number[] = [];
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
