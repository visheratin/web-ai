import * as ort from "onnxruntime-web";
import { ImageProcessingResult } from "./interfaces";
import { Tensor } from "../tensor";
import { normalize } from "./utils";
import { BaseImageModel } from "./base";
import { prepareImagesTensor } from "../utils/prepare";

export type ImageFeatureExtractionResult = ImageProcessingResult & {
  result: number[] | number[][];
};

export class ImageFeatureExtractionModel extends BaseImageModel {
  process = async (inputs: string | ArrayBuffer | string[] | ArrayBuffer[]): Promise<ImageFeatureExtractionResult> => {
    if (!this.initialized || !this.preprocessor) {
      throw Error("the model is not initialized");
    }
    if (typeof inputs === "string") {
      inputs = [inputs];
    }
    if (inputs instanceof ArrayBuffer) {
      inputs = [inputs];
    }
    const tensor = await prepareImagesTensor(inputs, this);
    const start = new Date();
    const output = await this.runInference(tensor);
    const end = new Date();
    const elapsed = (end.getTime() - start.getTime()) / 1000;
    const result: ImageFeatureExtractionResult = {
      result: output,
      elapsed: elapsed,
    };
    if (output.length === 1) {
      result.result = output[0];
    }
    return result;
  };

  private runInference = async (input: ort.Tensor): Promise<number[][]> => {
    if (!this.initialized || !this.sessions) {
      throw Error("the model is not initialized");
    }
    const session = this.sessions.get("model");
    if (!session) {
      throw Error("the model is absent in the sessions map");
    }
    const feeds: Record<string, ort.Tensor> = {};
    const inputNames = await session.inputNames();
    feeds[inputNames[0]] = input;
    const outputData = await session.run(feeds);
    const outputNames = await session.outputNames();
    const output = outputData[outputNames[0]];
    const result: number[][] = [];
    let size = 1;
    for (let i = 1; i < output.dims.length; i++) {
      size *= output.dims[i];
    }
    for (let i = 0; i < output.dims[0]; i++) {
      const partDims = output.dims.map((d) => d);
      partDims[0] = 1;
      const partData = output.data.slice(i * size, (i + 1) * size);
      const part = new ort.Tensor("float32", partData, partDims);
      const res = this.generateOutput(part);
      result.push(res);
    }
    return result;
  };

  private generateOutput = (lastHiddenState: ort.Tensor): number[] => {
    const tensor = new Tensor(lastHiddenState);
    const result: number[] = [];
    if (lastHiddenState.dims.length < 2) {
      throw Error("the model output is not valid");
    }
    if (lastHiddenState.dims.length === 3) {
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
      return normalize(result);
    } else {
      for (let i = 0; i < lastHiddenState.dims[1]; i++) {
        result.push(tensor.at([0, i]) as number);
      }
      return normalize(result);
    }
  };
}
