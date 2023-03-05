import { ImageMetadata } from "./metadata";
import * as ort from "onnxruntime-web";
import { createSession } from "../sessionController";
import Jimp from "jimp";
import Preprocessor from "./preprocessor";
import PreprocessorConfig from "./preprocessorConfig";
import { IImageModel, ImageProcessingResult } from "./interfaces";
import { Session } from "../session";
import * as Comlink from "comlink";
import { Tensor } from "../tensor";

export type ImageFeatureExtractionResult = ImageProcessingResult & {
  result: number[];
};

export class ImageFeatureExtractionModel implements IImageModel {
  metadata: ImageMetadata;
  initialized: boolean;
  private preprocessor?: Preprocessor;
  private session?: Session | Comlink.Remote<Session>;

  constructor(metadata: ImageMetadata) {
    this.metadata = metadata;
    this.initialized = false;
  }

  /**
   * Initializes the model for running.
   *
   * @returns Time taken to initialize the model, in seconds.
   */
  init = async (cacheSizeMB = 500, proxy = true): Promise<number> => {
    const start = new Date();
    this.session = await createSession(this.metadata.modelPath, cacheSizeMB, proxy);
    const preprocessorConfig = await PreprocessorConfig.fromFile(this.metadata.preprocessorPath);
    this.preprocessor = new Preprocessor(preprocessorConfig);
    this.initialized = true;
    const end = new Date();
    const elapsed = (end.getTime() - start.getTime()) / 1000;
    return elapsed;
  };

  process = async (input: string | Buffer): Promise<ImageFeatureExtractionResult> => {
    if (!this.initialized || !this.preprocessor) {
      throw Error("the model is not initialized");
    }
    // @ts-ignore
    const image = await Jimp.read(input);
    const tensor = this.preprocessor.process(image);
    const start = new Date();
    const lastHiddenState = await this.runInference(tensor);
    const output = this.generateOutput(lastHiddenState);
    const end = new Date();
    const elapsed = (end.getTime() - start.getTime()) / 1000;
    return {
      result: output,
      elapsed: elapsed,
    };
  };

  private runInference = async (input: ort.Tensor): Promise<ort.Tensor> => {
    if (!this.initialized || !this.session) {
      throw Error("the model is not initialized");
    }
    const feeds: Record<string, ort.Tensor> = {};
    const inputNames = await this.session.inputNames();
    feeds[inputNames[0]] = input;
    const outputData = await this.session.run(feeds);
    const outputNames = await this.session.outputNames();
    const output = outputData[outputNames[0]];
    return output;
  };

  private generateOutput = (lastHiddenState: ort.Tensor): number[] => {
    const tensor = new Tensor(lastHiddenState);
    const result: number[] = [];
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
