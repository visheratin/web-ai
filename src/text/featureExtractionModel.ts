import { TextMetadata } from "./metadata.js";
import {
  Tensor,
  Session,
  Encoder,
  GeneratorType,
  Tokenizer,
} from "../common.js";
import * as ort from "onnxruntime-common";
import { TextProcessingResult } from "./interfaces.js";
import { BaseTextModel } from "./base.js";
import { prepareTextTensors } from "./prepare.js";
import { createSession, loadTokenizer } from "../browser.js";

export type FeatureExtractionResult = TextProcessingResult & {
  result: number[] | number[][];
};

export class FeatureExtractionModel extends BaseTextModel {
  private model?: Encoder;
  private dense?: Session;
  private cache: Map<string, number[]>;

  constructor(metadata: TextMetadata) {
    super(metadata);
    this.cache = new Map<string, number[]>();
  }

  init = async (proxy = true): Promise<number> => {
    const start = new Date();
    const modelPath = this.metadata.modelPaths.get("encoder");
    if (!modelPath) {
      throw new Error("model paths do not have the 'encoder' path");
    }
    const outputName = this.metadata.outputNames.get("encoder");
    if (!outputName) {
      throw new Error("output names do not have the 'encoder' path");
    }
    const encoderSession = await createSession(modelPath, proxy);
    this.model = new Encoder(encoderSession, outputName, GeneratorType.Seq2Seq);
    const densePath = this.metadata.modelPaths.get("dense");
    if (densePath) {
      this.dense = await createSession(densePath, proxy);
    }
    this.tokenizer = await loadTokenizer(this.metadata.tokenizerPath);
    const end = new Date();
    const elapsed = (end.getTime() - start.getTime()) / 1000;
    this.initialized = true;
    return elapsed;
  };

  process = async (
    inputs: string | string[]
  ): Promise<FeatureExtractionResult> => {
    if (!this.initialized || !this.model || !this.tokenizer) {
      throw Error("the model is not initialized");
    }
    if (typeof inputs === "string") {
      inputs = [inputs];
    }
    const textTensors = await prepareTextTensors(
      inputs,
      this.tokenizer,
      true,
      this.metadata.tokenizerParams.padTokenID
    );
    if (inputs.length == 1 && this.cache.has(inputs[0])) {
      return {
        result: this.cache.get(inputs[0]) as number[],
        cached: true,
        tokensNum: 0,
        elapsed: 0,
      };
    }
    const start = new Date();
    const lastHiddenState = await this.model.process(
      textTensors[0],
      textTensors[1]
    );
    if (!lastHiddenState) {
      throw Error("model output is undefined");
    }
    const end = new Date();
    const elapsed = (end.getTime() - start.getTime()) / 1000;
    const output = await this.generate_output(lastHiddenState, textTensors[1]);
    if (output.length === 1) {
      const out = output[0] as number[];
      this.cache.set(inputs[0], out);
      return {
        result: out,
        cached: false,
        tokensNum: textTensors[0].data.length,
        elapsed: elapsed,
      };
    }
    return {
      result: output,
      cached: false,
      tokensNum: textTensors[0].data.length,
      elapsed: elapsed,
    };
  };

  private generate_output = async (
    lastHiddenState: ort.Tensor,
    attentionMask: ort.Tensor
  ): Promise<number[] | number[][]> => {
    const tensor = new Tensor(lastHiddenState);
    let result: number[][] = [];
    for (let idx = 0; idx < lastHiddenState.dims[0]; idx++) {
      result.push([]);
      for (let i = 0; i < lastHiddenState.dims[2]; i++) {
        result[idx].push(0);
      }
    }
    for (let idx = 0; idx < lastHiddenState.dims[0]; idx++) {
      let num = 0;
      for (let i = 0; i < lastHiddenState.dims[1]; i++) {
        const attnValue = attentionMask.data[
          idx * lastHiddenState.dims[1] + i
        ] as number;
        if (attnValue) {
          for (let j = 0; j < lastHiddenState.dims[2]; j++) {
            result[idx][j] += tensor.at([idx, i, j]) as number;
          }
          num += 1;
        }
      }
      for (let i = 0; i < result[idx].length; i++) {
        result[idx][i] /= num;
      }
    }
    if (this.dense) {
      result = await this.run_dense(result);
    }
    return this.normalize(result);
  };

  private run_dense = async (pooledResult: number[][]): Promise<number[][]> => {
    if (!this.dense) {
      throw Error("dense model is undefined");
    }
    const flatten = pooledResult.reduce((acc, val) => acc.concat(val), []);
    const tensor = new ort.Tensor("float32", new Float32Array(flatten), [
      pooledResult.length,
      pooledResult[0].length,
    ]);
    const output = await this.dense.run({ input: tensor });
    const result = new Tensor(output.output);
    const outputResult: number[][] = [];
    for (let i = 0; i < result.ortTensor.dims[0]; i++) {
      outputResult.push([]);
      for (let j = 0; j < result.ortTensor.dims[1]; j++) {
        outputResult[i].push(result.at([i, j]) as number);
      }
    }
    return outputResult;
  };

  private normalize = (input: number[][]): number[][] => {
    const result: number[][] = [];
    for (let i = 0; i < input.length; i++) {
      result.push([]);
      let sum = 0;
      for (let j = 0; j < input[i].length; j++) {
        sum += input[i][j] * input[i][j];
      }
      sum = Math.sqrt(sum);
      for (let j = 0; j < input[i].length; j++) {
        result[i].push(input[i][j] / sum);
      }
    }
    return result;
  };
}
